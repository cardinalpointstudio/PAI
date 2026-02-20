#!/usr/bin/env bun

/**
 * Compound Engineering Orchestrator
 * Interactive command center for managing parallel Claude Code workflows
 */

import { existsSync, readdirSync, readFileSync, writeFileSync, watch, mkdirSync, rmSync, unlinkSync, renameSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";
import * as readline from "readline";

// ============================================================================
// Types
// ============================================================================

type Phase = "init" | "planning" | "implementing" | "reviewing" | "refining" | "compounding" | "complete";
type ModelOption = "claude-sonnet-4" | "claude-haiku-4" | "claude-opus-4" | "aider" | "custom";

interface WorkerConfig {
  plan: string;
  backend: string;
  frontend: string;
  tests: string;
  review: string;
}

interface WorkflowConfig {
  models: WorkerConfig;
  customCommands?: Partial<WorkerConfig>;
}

interface WorkflowState {
  phase: Phase;
  iteration: number;
  signals: Record<string, boolean>;
  featureName?: string;
  branchName?: string;
  commitCount?: number;
}

// ============================================================================
// Constants
// ============================================================================

const SESSION_NAME = "ce-dev";
const WORKFLOW_DIR = ".workflow";
const SIGNALS_DIR = "signals";
const SCRIPT_DIR = import.meta.dir;

// Window numbers (1-indexed for tmux)
const WINDOWS = {
  orchestrator: 1,
  plan: 2,
  backend: 3,
  frontend: 4,
  tests: 5,
  review: 6,
  status: 7,
};

// ANSI colors
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
};

// ============================================================================
// Utility Functions
// ============================================================================

function clearScreen(): void {
  process.stdout.write("\x1b[2J\x1b[H");
}

function moveCursor(row: number, col: number): void {
  process.stdout.write(`\x1b[${row};${col}H`);
}

function hideCursor(): void {
  process.stdout.write("\x1b[?25l");
}

function showCursor(): void {
  process.stdout.write("\x1b[?25h");
}

function workflowPath(...parts: string[]): string {
  return join(process.cwd(), WORKFLOW_DIR, ...parts);
}

function fileExists(path: string): boolean {
  return existsSync(path);
}

function getSignals(): Record<string, boolean> {
  const signalsDir = workflowPath(SIGNALS_DIR);
  if (!fileExists(signalsDir)) return {};

  const signals: Record<string, boolean> = {};
  try {
    const files = readdirSync(signalsDir);
    for (const file of files) {
      if (file.endsWith(".done")) {
        const name = file.replace(".done", "");
        signals[name] = true;
      }
    }
  } catch {
    // Directory might not exist yet
  }
  return signals;
}

function syncStateToFile(state: WorkflowState): void {
  const stateFile = workflowPath("state.json");
  try {
    const stateData = {
      state: state.phase,
      iteration: state.iteration,
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      signals: state.signals,
      errors: [],
    };
    writeFileSync(stateFile, JSON.stringify(stateData, null, 2));
  } catch {
    // Ignore write errors
  }
}

// ============================================================================
// Config Management
// ============================================================================

const DEFAULT_CONFIG: WorkflowConfig = {
  models: {
    plan: "claude-sonnet-4",
    backend: "claude-sonnet-4",
    frontend: "claude-sonnet-4",
    tests: "claude-sonnet-4",
    review: "claude-sonnet-4",
  },
};

const MODEL_OPTIONS: { value: ModelOption; label: string; command: string }[] = [
  { value: "claude-sonnet-4", label: "Sonnet 4", command: "claude --dangerously-skip-permissions" },
  { value: "claude-haiku-4", label: "Haiku 4", command: "claude --dangerously-skip-permissions --model claude-haiku-4-20250514" },
  { value: "claude-opus-4", label: "Opus 4", command: "claude --dangerously-skip-permissions --model claude-opus-4-20250514" },
  { value: "aider", label: "Aider", command: "aider --yes-always" },
  { value: "custom", label: "Custom", command: "" },
];

function loadConfig(): WorkflowConfig {
  const configPath = workflowPath("config.json");
  if (fileExists(configPath)) {
    try {
      const content = readFileSync(configPath, "utf-8");
      const parsed = JSON.parse(content);
      return { ...DEFAULT_CONFIG, ...parsed, models: { ...DEFAULT_CONFIG.models, ...parsed.models } };
    } catch {
      // Invalid config, return default
    }
  }
  return DEFAULT_CONFIG;
}

function saveConfig(config: WorkflowConfig): boolean {
  try {
    const workflowDir = workflowPath();
    if (!existsSync(workflowDir)) {
      mkdirSync(workflowDir, { recursive: true });
    }
    const configPath = workflowPath("config.json");
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    return true;
  } catch (e) {
    console.error(`${C.red}Failed to save config: ${e}${C.reset}`);
    return false;
  }
}

function getModelCommand(model: string, customCommand?: string): string {
  if (model === "custom" && customCommand) {
    return customCommand;
  }
  const option = MODEL_OPTIONS.find(o => o.value === model);
  return option?.command || "claude --dangerously-skip-permissions";
}

function restartWorkerWithModel(worker: string, command: string): void {
  const windowMap: Record<string, number> = {
    plan: WINDOWS.plan,
    backend: WINDOWS.backend,
    frontend: WINDOWS.frontend,
    tests: WINDOWS.tests,
    review: WINDOWS.review,
  };

  const windowNum = windowMap[worker];
  if (!windowNum) return;

  try {
    // Send Ctrl+C first to cancel any pending operation
    execSync(`tmux send-keys -t ${SESSION_NAME}:${windowNum} C-c`, { stdio: "ignore" });
    // Then send /exit and press Enter
    setTimeout(() => {
      execSync(`tmux send-keys -t ${SESSION_NAME}:${windowNum} -- /exit`, { stdio: "ignore" });
      execSync(`tmux send-keys -t ${SESSION_NAME}:${windowNum} C-m`, { stdio: "ignore" });
    }, 500);
    // Wait 4 seconds for Claude to fully exit, then send the new command and press Enter
    setTimeout(() => {
      execSync(`tmux send-keys -t ${SESSION_NAME}:${windowNum} -- '${command}'`, { stdio: "ignore" });
      execSync(`tmux send-keys -t ${SESSION_NAME}:${windowNum} C-m`, { stdio: "ignore" });
    }, 4500);
  } catch {
    // Ignore errors
  }
}

function getModelLabel(model: string, customCommand?: string): string {
  if (model === "custom" && customCommand) {
    // Truncate long commands
    const truncated = customCommand.length > 25 ? customCommand.slice(0, 22) + "..." : customCommand;
    return `Custom: ${truncated}`;
  }
  const option = MODEL_OPTIONS.find(o => o.value === model);
  return option?.label || model;
}

function getReviewStatus(signals: Record<string, boolean>): "PASS" | "FAIL" | "PENDING" {
  // Don't trust REVIEW.md unless review.done signal exists
  if (!signals.review) return "PENDING";

  const reviewPath = workflowPath("REVIEW.md");
  if (!fileExists(reviewPath)) return "PENDING";

  try {
    const content = readFileSync(reviewPath, "utf-8");
    if (content.includes("STATUS: PASS")) return "PASS";
    if (content.includes("STATUS: FAIL")) return "FAIL";
  } catch {
    // File might not be readable
  }
  return "PENDING";
}

// ============================================================================
// Git & Commit Functions
// ============================================================================

function branchToFeatureName(branch: string): string {
  // Convert branch name to readable feature name
  // e.g., "calendar-plan" → "Calendar Plan"
  // e.g., "compound/20260217-bulk-member-import" → "Bulk Member Import"

  // Strip common prefixes
  let name = branch
    .replace(/^compound\/\d{8}-/, "")  // Remove compound/YYYYMMDD- prefix
    .replace(/^feature\//, "")
    .replace(/^feat\//, "");

  // Convert kebab-case/snake_case to Title Case
  return name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function planMatchesBranch(planFeatureName: string, branch: string): boolean {
  // Check if the plan's feature name seems to match the current branch
  // Generate what the branch slug would be from the plan name
  const expectedSlug = generateSlug(planFeatureName);

  // Check if branch contains the expected slug or vice versa
  const branchLower = branch.toLowerCase();
  return branchLower.includes(expectedSlug) ||
         expectedSlug.includes(branchLower.replace(/^compound\/\d{8}-/, ""));
}

function getFeatureNameFromPlan(): string {
  const planPath = workflowPath("PLAN.md");
  const currentBranch = getCurrentBranch();

  if (fileExists(planPath)) {
    try {
      const planContent = readFileSync(planPath, "utf-8");
      const titleMatch = planContent.match(/^#\s+(.+)$/m);
      if (titleMatch) {
        const planFeatureName = titleMatch[1];

        // Check if this plan matches the current branch
        if (planMatchesBranch(planFeatureName, currentBranch)) {
          return planFeatureName;
        }
        // Plan doesn't match branch - derive from branch name instead
      }
    } catch {
      // Ignore read errors
    }
  }

  // No matching plan - derive feature name from branch
  if (currentBranch && currentBranch !== "main" && currentBranch !== "master") {
    return branchToFeatureName(currentBranch);
  }

  return "CE workflow feature";
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function createFeatureBranch(featureName: string): { branch: string; success: boolean; error?: string } {
  try {
    const currentBranch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf-8" }).trim();

    // Only create new branch if on main/master
    if (currentBranch !== "main" && currentBranch !== "master") {
      return { branch: currentBranch, success: true };
    }

    const slug = generateSlug(featureName);
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const branch = `compound/${date}-${slug}`;

    execSync(`git checkout -b ${branch}`, { stdio: "ignore" });
    return { branch, success: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { branch: "", success: false, error };
  }
}

function commitPhase(type: string, featureName: string, scope?: string): { success: boolean; error?: string } {
  try {
    // Stage all changes
    execSync("git add -A", { stdio: "ignore" });
    // Exclude .workflow/
    execSync("git reset HEAD -- .workflow/", { stdio: "ignore" });

    // Check if there are staged changes
    const staged = execSync("git diff --cached --name-only", { encoding: "utf-8" }).trim();
    if (!staged) {
      return { success: true }; // Nothing to commit is fine
    }

    const scopePart = scope ? `(${scope})` : "";
    const message = `${type}${scopePart}: ${featureName}

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>`;

    execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { stdio: "ignore" });
    return { success: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { success: false, error };
  }
}

function getCommitCount(): number {
  try {
    const mainBranch = execSync("git rev-parse --verify main 2>/dev/null || echo master", { encoding: "utf-8" }).trim();
    const count = execSync(`git rev-list --count ${mainBranch}..HEAD 2>/dev/null || echo 0`, { encoding: "utf-8" }).trim();
    return parseInt(count, 10) || 0;
  } catch {
    return 0;
  }
}

function getCurrentBranch(): string {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf-8" }).trim();
  } catch {
    return "unknown";
  }
}

function determinePhase(signals: Record<string, boolean>): Phase {
  if (signals.compound && signals.pr) return "complete";

  const reviewStatus = getReviewStatus(signals);

  if (signals.review && reviewStatus === "PASS") return "compounding";

  if (signals["backend-refine"] && signals["frontend-refine"] && signals["tests-refine"]) {
    return "reviewing"; // Ready for re-review after refine
  }

  if (signals.review && reviewStatus === "FAIL") return "refining";

  if (signals.backend && signals.frontend && signals.tests) return "reviewing";

  if (signals.plan) return "implementing";

  if (fileExists(workflowPath("PLAN.md"))) return "planning";

  return "init";
}

// ============================================================================
// Tmux Commands
// ============================================================================

function tmuxSendKeys(window: number, text: string): void {
  try {
    // Escape single quotes in the text
    const escaped = text.replace(/'/g, "'\"'\"'");
    // Send text first, then Enter separately to ensure it's executed
    execSync(`tmux send-keys -t ${SESSION_NAME}:${window} '${escaped}'`, { stdio: "ignore" });
    execSync(`tmux send-keys -t ${SESSION_NAME}:${window} Enter`, { stdio: "ignore" });
  } catch (e) {
    console.error(`Failed to send keys to window ${window}`);
  }
}

function dispatchWorker(worker: string, window: number, isRefine: boolean = false): void {
  const taskFile = `.workflow/tasks/${worker}.md`;
  const signalFile = isRefine
    ? `.workflow/signals/${worker}-refine.done`
    : `.workflow/signals/${worker}.done`;

  const phase = isRefine ? "REFINE" : "";
  const taskSource = isRefine ? ".workflow/REVIEW.md" : taskFile;

  const prompt = `You are the ${worker.toUpperCase()} ${phase} worker for this Compound Engineering session.

## YOUR TASK
${isRefine ? `Read .workflow/REVIEW.md and fix issues in your domain.` : `Read and implement: ${taskFile}`}

## CONTRACTS
Import types from: .workflow/contracts/

## SCOPE
${worker === "backend" ? "ONLY modify: src/backend/**, src/api/**, src/lib/**, src/db/**, src/server/**, src/app/api/**" : ""}
${worker === "frontend" ? "ONLY modify: src/frontend/**, src/components/**, src/app/** (except api/)" : ""}
${worker === "tests" ? "ONLY modify: tests/**, **/*.test.ts, **/*.spec.ts" : ""}

## COMPLETION
When done: touch ${signalFile}

## IMPORTANT
- Do NOT send tmux commands to other windows
- Do NOT try to coordinate with other workers
- Just do your task and signal done

START by reading: cat ${taskSource}`;

  tmuxSendKeys(window, prompt);
}

function dispatchReview(): void {
  // Clear old review state for fresh re-review
  const reviewSignal = workflowPath("signals/review.done");
  const reviewFile = workflowPath("REVIEW.md");

  if (fileExists(reviewSignal)) {
    unlinkSync(reviewSignal);
  }
  if (fileExists(reviewFile)) {
    // Rename to backup for reference
    const backupPath = workflowPath(`REVIEW-${Date.now()}.md`);
    renameSync(reviewFile, backupPath);
  }

  const prompt = `You are the REVIEW worker. All implementation workers have completed.

## YOUR TASK
1. Run the test suite: bun test
2. Run type checking: bun run tsc --noEmit
3. Run linting: bun run lint (or eslint . --ext .ts,.tsx)
4. Review all changes in .workflow/ and src/
5. Check for security, performance, correctness, maintainability

IMPORTANT: If ANY check fails (automated or code review), STATUS must be FAIL.

## OUTPUT
Create .workflow/REVIEW.md with:
- Summary of changes
- Issues found (if any)
- STATUS: PASS or STATUS: FAIL

## COMPLETION
When done: touch .workflow/signals/review.done

## IMPORTANT
- Do NOT send tmux commands to other windows
- Do NOT try to fix issues yourself
- Just report findings and signal done

START by checking signals: ls -la .workflow/signals/`;

  tmuxSendKeys(WINDOWS.review, prompt);
}

function dispatchCompound(): void {
  const date = new Date();
  const monthDir = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  const filename = `${date.toISOString().split("T")[0]}-ce-learnings.md`;

  const prompt = `You are now in COMPOUND mode. The feature is complete and review passed!

## YOUR TASK
Extract learnings from this session to make future CE sessions smoother.

## ANALYZE
1. Read .workflow/PLAN.md - the original plan
2. Read .workflow/REVIEW.md - issues found during review
3. Run: git diff main...HEAD --stat

## DOCUMENT LEARNINGS
Create: ~/.claude/History/Learnings/${monthDir}/${filename}

Include:
- What patterns emerged that should be reused?
- What mistakes were made that should be avoided?
- What task file instructions were unclear or missing?
- Specific improvements for the CE workflow

## COMPLETION
When done: touch .workflow/signals/compound.done

START by reading the plan: cat .workflow/PLAN.md`;

  tmuxSendKeys(WINDOWS.plan, prompt);
}

function gitCommitAndPR(featureName?: string): { success: boolean; prUrl?: string; error?: string } {
  try {
    // Get current branch
    const currentBranch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf-8" }).trim();

    // Check if on main - if so, create a feature branch (fallback if branch wasn't created earlier)
    let branch = currentBranch;
    if (currentBranch === "main" || currentBranch === "master") {
      const name = featureName || getFeatureNameFromPlan();
      const slug = generateSlug(name);
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      branch = `compound/${date}-${slug}`;
      execSync(`git checkout -b ${branch}`, { stdio: "ignore" });
    }

    // Get feature name if not provided
    const name = featureName || getFeatureNameFromPlan();

    // Check for any uncommitted changes and commit them
    execSync("git add -A", { stdio: "ignore" });
    execSync("git reset HEAD -- .workflow/", { stdio: "ignore" });
    const staged = execSync("git diff --cached --name-only", { encoding: "utf-8" }).trim();

    if (staged) {
      // Commit any remaining changes - write message to temp file for reliability
      const commitMessage = `chore: final cleanup for ${name}

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>`;
      const tmpFile = "/tmp/ce-commit-msg.txt";
      writeFileSync(tmpFile, commitMessage);
      execSync(`git commit -F ${tmpFile}`, { stdio: "ignore" });
      unlinkSync(tmpFile);
    }

    // Check if we have any commits to push
    const mainBranch = execSync("git rev-parse --verify main 2>/dev/null || echo master", { encoding: "utf-8" }).trim();
    const commitCount = execSync(`git rev-list --count ${mainBranch}..HEAD 2>/dev/null || echo 0`, { encoding: "utf-8" }).trim();

    if (parseInt(commitCount, 10) === 0) {
      return { success: false, error: "No commits to create PR from" };
    }

    // Push to remote
    execSync(`git push -u origin ${branch}`, { stdio: "ignore" });

    // Create PR with richer description
    const prBody = `## Summary
Implemented **${name}** using Compound Engineering workflow.

## Commits
This PR contains ${commitCount} commit(s) from the CE workflow:
- Planning and design
- Implementation (backend, frontend, tests in parallel)
- Review feedback fixes (if any)

## Test plan
- [ ] Manual testing completed
- [ ] Type checking passes (\`bun run tsc --noEmit\`)
- [ ] All tests pass (\`bun test\`)

🤖 Generated with [Claude Code](https://claude.com/claude-code)`;

    const prOutput = execSync(
      `gh pr create --title "feat: ${name}" --body "${prBody.replace(/"/g, '\\"')}"`,
      { encoding: "utf-8" }
    ).trim();

    // Extract PR URL from output
    const urlMatch = prOutput.match(/https:\/\/github\.com\/[^\s]+/);
    const prUrl = urlMatch ? urlMatch[0] : prOutput;

    return { success: true, prUrl };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { success: false, error };
  }
}

function clearWorkflow(): void {
  // Clear all signal files
  const signalsDir = workflowPath("signals");
  if (fileExists(signalsDir)) {
    const files = readdirSync(signalsDir);
    for (const file of files) {
      unlinkSync(join(signalsDir, file));
    }
  }

  // Remove planning artifacts
  const filesToRemove = ["PLAN.md", "REVIEW.md"];
  for (const file of filesToRemove) {
    const path = workflowPath(file);
    if (fileExists(path)) {
      unlinkSync(path);
    }
  }

  // Clear contracts directory contents
  const contractsDir = workflowPath("contracts");
  if (fileExists(contractsDir)) {
    const files = readdirSync(contractsDir);
    for (const file of files) {
      unlinkSync(join(contractsDir, file));
    }
  }

  // Clear tasks directory contents
  const tasksDir = workflowPath("tasks");
  if (fileExists(tasksDir)) {
    const files = readdirSync(tasksDir);
    for (const file of files) {
      unlinkSync(join(tasksDir, file));
    }
  }

  // Reset state.json to init
  const stateFile = workflowPath("state.json");
  const initialState = {
    state: "init",
    iteration: 0,
    startedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    signals: {},
    errors: [],
  };
  writeFileSync(stateFile, JSON.stringify(initialState, null, 2));

  // Clear Claude sessions in worker windows (2-6: Plan, Backend, Frontend, Tests, Review)
  // Send /clear command to each Claude Code session
  const workerWindows = [2, 3, 4, 5, 6]; // Plan, Backend, Frontend, Tests, Review
  for (const windowNum of workerWindows) {
    try {
      // Cancel any pending input first
      execSync(`tmux send-keys -t ${SESSION_NAME}:${windowNum} C-c`, { stdio: "ignore" });
      // Send /clear then Enter (select autocomplete) then Enter again (submit)
      execSync(`tmux send-keys -t ${SESSION_NAME}:${windowNum} '/clear' Enter`, { stdio: "ignore" });
      execSync(`sleep 0.2 && tmux send-keys -t ${SESSION_NAME}:${windowNum} Enter`, { stdio: "ignore" });
    } catch {
      // Window might not exist or Claude not running - ignore
    }
  }
}

// ============================================================================
// UI Rendering
// ============================================================================

function renderHeader(): void {
  console.log(`${C.bgBlue}${C.white}${C.bold}                                                                    ${C.reset}`);
  console.log(`${C.bgBlue}${C.white}${C.bold}   ⚡ COMPOUND ENGINEERING ORCHESTRATOR                             ${C.reset}`);
  console.log(`${C.bgBlue}${C.white}${C.bold}                                                                    ${C.reset}`);
  console.log();
}

function renderGitInfo(branchName?: string, commitCount?: number): void {
  const branch = branchName || getCurrentBranch();
  const commits = commitCount ?? getCommitCount();
  const isOnMain = branch === "main" || branch === "master";

  console.log(`  ${C.bold}Branch:${C.reset} ${isOnMain ? C.dim : C.cyan}${branch}${C.reset}    ${C.bold}Commits:${C.reset} ${commits > 0 ? C.green : C.dim}${commits}${C.reset}`);
  console.log();
}

function renderModels(config: WorkflowConfig): void {
  const workers = ["plan", "backend", "frontend", "tests", "review"] as const;
  const models = workers.map(w => getModelLabel(config.models[w], config.customCommands?.[w]));
  const allSame = models.every(m => m === models[0]);

  if (allSame && !models[0].startsWith("Custom")) {
    console.log(`  ${C.bold}Models:${C.reset} ${C.dim}All workers →${C.reset} ${C.green}${models[0]}${C.reset}`);
  } else {
    const compact = workers.map((w, i) => `${w[0].toUpperCase()}:${models[i].split(":")[0].split(" ")[0]}`).join(" ");
    console.log(`  ${C.bold}Models:${C.reset} ${C.dim}${compact}${C.reset}`);
  }
  console.log();
}

function renderPhase(phase: Phase, iteration: number): void {
  const phaseColors: Record<Phase, string> = {
    init: C.dim,
    planning: C.yellow,
    implementing: C.blue,
    reviewing: C.magenta,
    refining: C.yellow,
    compounding: C.cyan,
    complete: C.green,
  };

  const phaseLabels: Record<Phase, string> = {
    init: "INITIALIZING",
    planning: "PLANNING",
    implementing: "IMPLEMENTING",
    reviewing: "REVIEWING",
    refining: "REFINING",
    compounding: "COMPOUNDING",
    complete: "COMPLETE ✓",
  };

  console.log(`  ${C.bold}Phase:${C.reset} ${phaseColors[phase]}${phaseLabels[phase]}${C.reset}    ${C.dim}Iteration: ${iteration}/3${C.reset}`);
  console.log();
}

function renderSignals(signals: Record<string, boolean>): void {
  console.log(`  ${C.bold}Signals:${C.reset}`);

  const coreSignals = ["plan", "backend", "frontend", "tests", "review"];
  const refineSignals = ["backend-refine", "frontend-refine", "tests-refine"];

  // Core signals
  let line = "    ";
  for (const sig of coreSignals) {
    const icon = signals[sig] ? `${C.green}✓${C.reset}` : `${C.dim}○${C.reset}`;
    line += `${icon} ${sig}  `;
  }
  console.log(line);

  // Refine signals (only show if in refine phase)
  const inRefine = signals.review && getReviewStatus(signals) === "FAIL";
  if (inRefine || refineSignals.some(s => signals[s])) {
    line = "    ";
    for (const sig of refineSignals) {
      const icon = signals[sig] ? `${C.green}✓${C.reset}` : `${C.dim}○${C.reset}`;
      line += `${icon} ${sig.replace("-refine", "-ref")}  `;
    }
    console.log(line);
  }

  // Compound signal
  const compoundIcon = signals.compound ? `${C.green}✓${C.reset}` : `${C.dim}○${C.reset}`;
  console.log(`    ${compoundIcon} compound`);

  console.log();
}

function renderFiles(): void {
  console.log(`  ${C.bold}Files:${C.reset}`);

  const files = [
    { path: "PLAN.md", label: "PLAN.md" },
    { path: "REVIEW.md", label: "REVIEW.md" },
    { path: "contracts", label: "contracts/" },
    { path: "tasks", label: "tasks/" },
  ];

  let line = "    ";
  for (const file of files) {
    const exists = fileExists(workflowPath(file.path));
    const icon = exists ? `${C.green}✓${C.reset}` : `${C.dim}○${C.reset}`;
    line += `${icon} ${file.label}  `;
  }
  console.log(line);
  console.log();
}

function renderNextAction(phase: Phase, signals: Record<string, boolean>): void {
  console.log(`  ${C.bold}${C.yellow}▶ Next Action:${C.reset}`);

  switch (phase) {
    case "init":
      console.log(`    Go to Plan window (Ctrl+b 2) and describe your feature`);
      break;
    case "planning":
      console.log(`    Wait for Architect to create PLAN.md, then approve`);
      console.log(`    Press ${C.bold}[P]${C.reset} to signal plan approved and dispatch workers`);
      break;
    case "implementing":
      const implDone = signals.backend && signals.frontend && signals.tests;
      if (implDone) {
        console.log(`    All workers done! Press ${C.bold}[R]${C.reset} to dispatch review`);
      } else {
        console.log(`    Waiting for workers to complete...`);
        console.log(`    ${C.dim}(Check windows 3-5 for progress)${C.reset}`);
      }
      break;
    case "reviewing":
      // Check if refine already completed (post-refine review needed)
      const refineComplete = signals["backend-refine"] && signals["frontend-refine"] && signals["tests-refine"];

      if (refineComplete) {
        // Refine done, need to re-run review
        console.log(`    ${C.yellow}Refine complete.${C.reset} Press ${C.bold}[R]${C.reset} to re-run review`);
      } else if (signals.review) {
        const status = getReviewStatus(signals);
        if (status === "PASS") {
          console.log(`    ${C.green}Review PASSED!${C.reset} Press ${C.bold}[C]${C.reset} to dispatch compound`);
        } else if (status === "FAIL") {
          console.log(`    ${C.red}Review FAILED.${C.reset} Press ${C.bold}[F]${C.reset} to dispatch refine workers`);
        } else {
          console.log(`    Waiting for review to complete...`);
        }
      } else {
        console.log(`    Waiting for review to complete...`);
        console.log(`    ${C.dim}(Check window 6 for progress)${C.reset}`);
      }
      break;
    case "refining":
      const refineDone = signals["backend-refine"] && signals["frontend-refine"] && signals["tests-refine"];
      if (refineDone) {
        console.log(`    Refine complete! Press ${C.bold}[R]${C.reset} to re-run review`);
      } else {
        console.log(`    Waiting for refine workers to complete...`);
      }
      break;
    case "compounding":
      if (signals.compound) {
        console.log(`    ${C.green}Compound complete!${C.reset} Press ${C.bold}[G]${C.reset} to commit & create PR`);
      } else {
        console.log(`    Waiting for compound to complete...`);
        console.log(`    ${C.dim}(Check window 2 for progress)${C.reset}`);
      }
      break;
    case "complete":
      console.log(`    ${C.green}🎉 Workflow complete! PR created.${C.reset}`);
      console.log(`    Press ${C.bold}[Q]${C.reset} to exit`);
      break;
  }

  console.log();
}

function renderMenu(): void {
  console.log(`  ${C.dim}─────────────────────────────────────────────────────${C.reset}`);
  console.log(`  ${C.bold}Commands:${C.reset}`);
  console.log(`    ${C.cyan}[P]${C.reset} Plan done → Dispatch workers    ${C.cyan}[R]${C.reset} Dispatch Review`);
  console.log(`    ${C.cyan}[F]${C.reset} Dispatch Refine                 ${C.cyan}[C]${C.reset} Dispatch Compound`);
  console.log(`    ${C.cyan}[G]${C.reset} Push & create PR                ${C.cyan}[K]${C.reset} Manual commit checkpoint`);
  console.log(`    ${C.cyan}[M]${C.reset} Configure Models                ${C.cyan}[W]${C.reset} Restart Workers (apply models)`);
  console.log(`    ${C.cyan}[N]${C.reset} New Feature (clear)             ${C.cyan}[S]${C.reset} Refresh Status`);
  console.log(`    ${C.cyan}[Q]${C.reset} Quit`);
  console.log();
  console.log(`  ${C.dim}Windows: Ctrl+b then 1=Orch 2=Plan 3=Back 4=Front 5=Tests 6=Review 7=Status${C.reset}`);
}

// ============================================================================
// Model Configuration Menu
// ============================================================================

interface ModelMenuState {
  config: WorkflowConfig;
  selectedWorker: number;
  isSelectingModel: boolean;
}

function renderModelMenu(menuState: ModelMenuState): void {
  clearScreen();
  const { config, selectedWorker, isSelectingModel } = menuState;
  const workers = ["plan", "backend", "frontend", "tests", "review"] as const;

  console.log(`${C.bgMagenta}${C.white}${C.bold}                                                                    ${C.reset}`);
  console.log(`${C.bgMagenta}${C.white}${C.bold}   CONFIGURE WORKER MODELS                                          ${C.reset}`);
  console.log(`${C.bgMagenta}${C.white}${C.bold}                                                                    ${C.reset}`);
  console.log();

  if (isSelectingModel) {
    const workerName = workers[selectedWorker];
    console.log(`  ${C.bold}Select model for ${C.cyan}${workerName.toUpperCase()}${C.reset}${C.bold}:${C.reset}`);
    console.log();

    MODEL_OPTIONS.forEach((option, idx) => {
      const current = config.models[workerName] === option.value;
      const prefix = current ? `${C.green}●${C.reset}` : `${C.dim}○${C.reset}`;
      console.log(`    ${C.yellow}[${idx + 1}]${C.reset} ${prefix} ${option.label}`);
    });

    console.log();
    console.log(`  ${C.dim}Press 1-${MODEL_OPTIONS.length} to select, [Esc] to go back${C.reset}`);
  } else {
    console.log(`  ${C.bold}Workers:${C.reset}`);
    console.log();

    workers.forEach((worker, idx) => {
      const selected = idx === selectedWorker;
      const prefix = selected ? `${C.cyan}▶${C.reset}` : ` `;
      const model = getModelLabel(config.models[worker], config.customCommands?.[worker]);
      const workerLabel = worker.charAt(0).toUpperCase() + worker.slice(1);
      console.log(`  ${prefix} ${C.yellow}[${idx + 1}]${C.reset} ${workerLabel.padEnd(10)} ${C.dim}→${C.reset} ${C.green}${model}${C.reset}`);
    });

    console.log();
    console.log(`  ${C.dim}─────────────────────────────────────────────────────${C.reset}`);
    console.log(`  ${C.bold}Controls:${C.reset}`);
    console.log(`    ${C.yellow}[1-5]${C.reset} Select worker to configure`);
    console.log(`    ${C.yellow}[A]${C.reset}   Set ALL workers to same model`);
    console.log(`    ${C.yellow}[S]${C.reset}   Save and return`);
    console.log(`    ${C.yellow}[Esc]${C.reset} Cancel (discard changes)`);
  }
}

async function runModelMenu(initialConfig: WorkflowConfig): Promise<WorkflowConfig | null> {
  return new Promise((resolve) => {
    const menuState: ModelMenuState = {
      config: JSON.parse(JSON.stringify(initialConfig)),
      selectedWorker: 0,
      isSelectingModel: false,
    };

    const workers = ["plan", "backend", "frontend", "tests", "review"] as const;
    let selectingAll = false;

    // Ensure raw mode is enabled for keypress events
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();

    renderModelMenu(menuState);

    const handleKey = (str: string | undefined, key: any) => {
      if (key.name === "escape") {
        if (menuState.isSelectingModel) {
          menuState.isSelectingModel = false;
          selectingAll = false;
          renderModelMenu(menuState);
        } else {
          process.stdin.removeListener("keypress", handleKey);
          resolve(null);
        }
        return;
      }

      if (menuState.isSelectingModel) {
        const num = parseInt(str || "", 10);
        if (num >= 1 && num <= MODEL_OPTIONS.length) {
          const selectedModel = MODEL_OPTIONS[num - 1].value;

          // Handle "custom" selection - prompt for command
          if (selectedModel === "custom") {
            process.stdin.removeListener("keypress", handleKey);
            process.stdin.setRawMode(false);

            const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
            const workerName = selectingAll ? "ALL workers" : workers[menuState.selectedWorker];

            console.log();
            rl.question(`  Enter command for ${workerName}: `, (answer) => {
              rl.close();
              if (process.stdin.isTTY) {
                process.stdin.setRawMode(true);
              }
              process.stdin.resume();

              if (answer && answer.trim()) {
                if (!menuState.config.customCommands) {
                  menuState.config.customCommands = {};
                }

                if (selectingAll) {
                  workers.forEach(w => {
                    menuState.config.models[w] = "custom";
                    menuState.config.customCommands![w] = answer.trim();
                  });
                } else {
                  const worker = workers[menuState.selectedWorker];
                  menuState.config.models[worker] = "custom";
                  menuState.config.customCommands[worker] = answer.trim();
                }
              }

              selectingAll = false;
              menuState.isSelectingModel = false;
              renderModelMenu(menuState);
              process.stdin.on("keypress", handleKey);
            });
            return;
          }

          // Non-custom selection
          if (selectingAll) {
            workers.forEach(w => { menuState.config.models[w] = selectedModel; });
            selectingAll = false;
          } else {
            menuState.config.models[workers[menuState.selectedWorker]] = selectedModel;
          }

          menuState.isSelectingModel = false;
          renderModelMenu(menuState);
        }
      } else {
        const char = str?.toLowerCase();

        if (char === "s") {
          process.stdin.removeListener("keypress", handleKey);
          resolve(menuState.config);
          return;
        }

        if (char === "a") {
          selectingAll = true;
          menuState.isSelectingModel = true;
          renderModelMenu(menuState);
          return;
        }

        const num = parseInt(str || "", 10);
        if (num >= 1 && num <= 5) {
          menuState.selectedWorker = num - 1;
          menuState.isSelectingModel = true;
          renderModelMenu(menuState);
        }
      }
    };

    process.stdin.on("keypress", handleKey);
  });
}

function render(state: WorkflowState, config?: WorkflowConfig): void {
  clearScreen();
  renderHeader();
  renderGitInfo(state.branchName, state.commitCount);
  if (config) renderModels(config);
  renderPhase(state.phase, state.iteration);
  renderSignals(state.signals);
  renderFiles();
  renderNextAction(state.phase, state.signals);
  renderMenu();
}

// ============================================================================
// Watch-Only Mode (for Status window)
// ============================================================================

function renderWatchMode(state: WorkflowState): void {
  console.clear();

  const { phase, iteration, signals, featureName, branchName, commitCount } = state;

  // Header
  console.log(`${C.cyan}╭${"─".repeat(50)}╮${C.reset}`);
  console.log(`${C.cyan}│${C.reset}  ${C.yellow}⚡ STATUS MONITOR${C.reset}${" ".repeat(32)}${C.cyan}│${C.reset}`);
  console.log(`${C.cyan}├${"─".repeat(50)}┤${C.reset}`);

  // Branch info
  if (branchName) {
    console.log(`${C.cyan}│${C.reset}  Branch: ${C.green}${branchName.slice(0, 38)}${C.reset}${" ".repeat(Math.max(0, 40 - (branchName?.length || 0)))}${C.cyan}│${C.reset}`);
  }
  if (commitCount !== undefined && commitCount > 0) {
    console.log(`${C.cyan}│${C.reset}  Commits: ${C.yellow}${commitCount}${C.reset}${" ".repeat(38)}${C.cyan}│${C.reset}`);
  }
  if (featureName) {
    const truncated = featureName.slice(0, 36);
    console.log(`${C.cyan}│${C.reset}  Feature: ${C.white}${truncated}${C.reset}${" ".repeat(Math.max(0, 39 - truncated.length))}${C.cyan}│${C.reset}`);
  }
  console.log(`${C.cyan}├${"─".repeat(50)}┤${C.reset}`);

  // Phase
  const phaseColors: Record<Phase, string> = {
    init: C.dim,
    planning: C.yellow,
    implementing: C.blue,
    reviewing: C.magenta,
    refining: C.yellow,
    compounding: C.cyan,
    complete: C.green,
  };
  const phaseColor = phaseColors[phase] || C.white;
  console.log(`${C.cyan}│${C.reset}  Phase: ${phaseColor}${phase.toUpperCase()}${C.reset}     Iteration: ${C.white}${iteration}/3${C.reset}${" ".repeat(16)}${C.cyan}│${C.reset}`);
  console.log(`${C.cyan}├${"─".repeat(50)}┤${C.reset}`);

  // Signals
  console.log(`${C.cyan}│${C.reset}  Signals:${" ".repeat(40)}${C.cyan}│${C.reset}`);
  const signalList = ["plan", "backend", "frontend", "tests", "review", "compound"];
  for (const sig of signalList) {
    const done = signals[sig] === true;
    const icon = done ? `${C.green}●${C.reset}` : `${C.dim}○${C.reset}`;
    const name = sig.padEnd(12);
    console.log(`${C.cyan}│${C.reset}    ${icon} ${name}${" ".repeat(33)}${C.cyan}│${C.reset}`);
  }

  // Refine signals if any exist
  const refineSignals = ["backend-refine", "frontend-refine", "tests-refine"];
  const hasRefine = refineSignals.some(s => signals[s] !== undefined);
  if (hasRefine) {
    console.log(`${C.cyan}│${C.reset}  ${C.dim}── Refine ──${C.reset}${" ".repeat(36)}${C.cyan}│${C.reset}`);
    for (const sig of refineSignals) {
      const done = signals[sig] === true;
      const icon = done ? `${C.green}●${C.reset}` : `${C.dim}○${C.reset}`;
      const name = sig.replace("-refine", "").padEnd(12);
      console.log(`${C.cyan}│${C.reset}    ${icon} ${name}${" ".repeat(33)}${C.cyan}│${C.reset}`);
    }
  }

  console.log(`${C.cyan}╰${"─".repeat(50)}╯${C.reset}`);
  console.log(`\n${C.dim}Auto-refreshes on signal changes. Ctrl+C to exit.${C.reset}`);
}

async function runWatchMode(): Promise<void> {
  console.log(`${C.cyan}Starting status monitor...${C.reset}`);

  // Set up terminal
  process.on("SIGINT", () => {
    console.log("\n");
    process.exit(0);
  });

  const refreshState = () => {
    const signals = getSignals();
    const phase = determinePhase(signals);
    const featureName = getFeatureNameFromPlan();
    const branchName = getCurrentBranch();
    const commitCount = getCommitCount();
    return { phase, iteration: 1, signals, featureName, branchName, commitCount };
  };

  // Initial state and render
  let state: WorkflowState = refreshState();
  renderWatchMode(state);

  // Watch for signal changes
  const signalsDir = workflowPath(SIGNALS_DIR);
  if (!fileExists(signalsDir)) {
    mkdirSync(signalsDir, { recursive: true });
  }

  watch(signalsDir, () => {
    state = refreshState();
    renderWatchMode(state);
  });

  // Also watch .workflow/ directory for state.json and other changes
  const workflowDir = workflowPath();
  watch(workflowDir, () => {
    state = refreshState();
    renderWatchMode(state);
  });

  // Periodic refresh every 3 seconds to catch branch/workflow changes
  setInterval(() => {
    const newState = refreshState();
    // Only re-render if something changed
    if (JSON.stringify(newState) !== JSON.stringify(state)) {
      state = newState;
      renderWatchMode(state);
    }
  }, 3000);

  // Keep alive
  await new Promise(() => {});
}

// ============================================================================
// Main Loop
// ============================================================================

async function main(): Promise<void> {
  // Handle commands before interactive mode
  const command = process.argv[2];

  // Init command: Create .workflow directory structure
  if (command === "init") {
    const workflowDir = workflowPath();
    const signalsDir = workflowPath(SIGNALS_DIR);

    if (!fileExists(workflowDir)) {
      mkdirSync(workflowDir, { recursive: true });
      console.log(`${C.green}✓ Created .workflow/ directory${C.reset}`);
    }

    if (!fileExists(signalsDir)) {
      mkdirSync(signalsDir, { recursive: true });
      console.log(`${C.green}✓ Created signals/ directory${C.reset}`);
    }

    // Create initial state file
    const initialState: WorkflowState = {
      phase: "init",
      iteration: 1,
      signals: {},
    };
    syncStateToFile(initialState);
    console.log(`${C.green}✓ Initialized workflow state${C.reset}`);
    process.exit(0);
  }

  // Reset command: Clear signals and state for new session
  if (command === "reset") {
    clearWorkflow();

    // Recreate initial state
    const initialState: WorkflowState = {
      phase: "init",
      iteration: 1,
      signals: {},
    };
    syncStateToFile(initialState);
    console.log(`${C.green}✓ Reset workflow state${C.reset}`);
    process.exit(0);
  }

  // Check for watch-only mode (used by Status window)
  const isWatchMode = process.argv.includes("watch");

  // Check if we're in a workflow directory
  if (!fileExists(WORKFLOW_DIR)) {
    console.log(`${C.red}Error: No .workflow/ directory found.${C.reset}`);
    console.log(`Run this from your project directory after starting ce-dev.`);
    process.exit(1);
  }

  // Watch-only mode: just display status, no key handling
  if (isWatchMode) {
    await runWatchMode();
    return;
  }

  // Set up terminal
  hideCursor();
  process.on("exit", showCursor);
  process.on("SIGINT", () => {
    showCursor();
    console.log("\n");
    process.exit(0);
  });

  // Set up keyboard input
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }

  // Initial state
  let signals = getSignals();
  let phase = determinePhase(signals);
  let iteration = 1;
  let featureName: string | undefined = getFeatureNameFromPlan();
  let branchName: string | undefined = getCurrentBranch();
  let commitCount = getCommitCount();
  let config = loadConfig();
  let state: WorkflowState = { phase, iteration, signals, featureName, branchName, commitCount };

  // Initial render and sync
  render(state, config);
  syncStateToFile(state);

  // Watch for signal changes
  const signalsDir = workflowPath(SIGNALS_DIR);
  if (!fileExists(signalsDir)) {
    mkdirSync(signalsDir, { recursive: true });
  }

  // Track previous phase for auto-commit on transitions
  let prevPhase = phase;
  let implementationCommitted = false;
  let refineCommitted = false;

  const watcher = watch(signalsDir, () => {
    const prevPhaseVal = phase;
    signals = getSignals();
    phase = determinePhase(signals);

    // Auto-commit when implementation completes (transition to reviewing)
    if (prevPhaseVal === "implementing" && phase === "reviewing" && !implementationCommitted) {
      implementationCommitted = true;
      console.log(`\n${C.cyan}Implementation complete - committing changes...${C.reset}`);
      const implCommit = commitPhase("feat", featureName || "CE workflow feature");
      if (implCommit.success) {
        commitCount = getCommitCount();
        console.log(`  ${C.green}✓${C.reset} Committed: feat: ${featureName}`);
      } else if (implCommit.error) {
        console.log(`  ${C.yellow}⚠${C.reset} ${implCommit.error}`);
      }
    }

    // Auto-commit when refine completes (all refine signals done, before re-review)
    const allRefinesDone = signals["backend-refine"] && signals["frontend-refine"] && signals["tests-refine"];
    if (allRefinesDone && !refineCommitted && prevPhaseVal === "refining") {
      refineCommitted = true;
      console.log(`\n${C.cyan}Refine complete - committing fixes...${C.reset}`);
      const refineCommit = commitPhase("fix", `review feedback for ${featureName || "CE workflow"}`);
      if (refineCommit.success) {
        commitCount = getCommitCount();
        console.log(`  ${C.green}✓${C.reset} Committed: fix: review feedback`);
      } else if (refineCommit.error) {
        console.log(`  ${C.yellow}⚠${C.reset} ${refineCommit.error}`);
      }
    }

    // Reset refine commit flag when starting a new refine cycle
    if (phase === "refining" && !allRefinesDone) {
      refineCommitted = false;
    }

    state = { phase, iteration, signals, featureName, branchName, commitCount };
    render(state, config);
    syncStateToFile(state);
  });

  // Handle keyboard input
  let inModelMenu = false;

  process.stdin.on("keypress", (str, key) => {
    if (key.ctrl && key.name === "c") {
      showCursor();
      console.log("\n");
      process.exit(0);
    }

    if (inModelMenu) return; // Ignore keys while in model menu

    const char = str?.toLowerCase();

    switch (char) {
      case "p":
        // Plan done - create branch, commit plan, dispatch implementation workers
        if (fileExists(workflowPath("PLAN.md"))) {
          // Get feature name from plan
          const planFeatureName = getFeatureNameFromPlan();
          featureName = planFeatureName;

          // Create feature branch
          console.log(`\n${C.cyan}Creating feature branch...${C.reset}`);
          const branchResult = createFeatureBranch(planFeatureName);
          if (!branchResult.success) {
            console.log(`\n${C.red}✗ Failed to create branch: ${branchResult.error}${C.reset}`);
            setTimeout(() => render(state, config), 2000);
            break;
          }
          branchName = branchResult.branch;
          console.log(`  ${C.green}✓${C.reset} Branch: ${branchName}`);

          // Commit planning docs
          console.log(`  ${C.dim}Committing plan...${C.reset}`);
          const planCommit = commitPhase("docs", planFeatureName, "plan");
          if (planCommit.success) {
            commitCount = getCommitCount();
            console.log(`  ${C.green}✓${C.reset} Committed: docs(plan): ${planFeatureName}`);
          }

          // Dispatch workers
          console.log(`\n${C.cyan}Dispatching implementation workers...${C.reset}`);
          const signalsDirForPlan = workflowPath("signals");
          if (!fileExists(signalsDirForPlan)) {
            mkdirSync(signalsDirForPlan, { recursive: true });
          }
          execSync(`touch ${workflowPath("signals/plan.done")}`);
          dispatchWorker("backend", WINDOWS.backend);
          setTimeout(() => dispatchWorker("frontend", WINDOWS.frontend), 300);
          setTimeout(() => dispatchWorker("tests", WINDOWS.tests), 600);
          setTimeout(() => {
            signals = getSignals();
            phase = determinePhase(signals);
            commitCount = getCommitCount();
            state = { phase, iteration, signals, featureName, branchName, commitCount };
            render(state, config);
            syncStateToFile(state);
          }, 1000);
        }
        break;

      case "r":
        // Dispatch review
        console.log(`\n${C.cyan}Dispatching review...${C.reset}`);
        dispatchReview();
        setTimeout(() => {
          signals = getSignals();
          phase = determinePhase(signals);
          state = { phase, iteration, signals };
          render(state, config);
          syncStateToFile(state);
        }, 500);
        break;

      case "f":
        // Dispatch refine
        console.log(`\n${C.cyan}Dispatching refine workers...${C.reset}`);
        iteration++;
        dispatchWorker("backend", WINDOWS.backend, true);
        setTimeout(() => dispatchWorker("frontend", WINDOWS.frontend, true), 300);
        setTimeout(() => dispatchWorker("tests", WINDOWS.tests, true), 600);
        setTimeout(() => {
          signals = getSignals();
          phase = determinePhase(signals);
          state = { phase, iteration, signals };
          render(state, config);
          syncStateToFile(state);
        }, 1000);
        break;

      case "c":
        // Dispatch compound
        const reviewStatus = getReviewStatus(signals);
        if (reviewStatus === "PASS") {
          console.log(`\n${C.cyan}Dispatching compound...${C.reset}`);
          dispatchCompound();
          setTimeout(() => {
            signals = getSignals();
            phase = determinePhase(signals);
            state = { phase, iteration, signals };
            render(state, config);
            syncStateToFile(state);
          }, 500);
        } else {
          console.log(`\n${C.red}Cannot compound - review has not passed${C.reset}`);
          setTimeout(() => render(state, config), 1500);
        }
        break;

      case "s":
        // Refresh status
        signals = getSignals();
        phase = determinePhase(signals);
        commitCount = getCommitCount();
        state = { phase, iteration, signals, featureName, branchName, commitCount };
        render(state, config);
        syncStateToFile(state);
        break;

      case "k":
        // Manual commit checkpoint
        if (phase === "init") {
          console.log(`\n${C.yellow}Nothing to commit yet - start planning first${C.reset}`);
          setTimeout(() => render(state, config), 1500);
          break;
        }
        const commitType = phase === "planning" ? "docs" :
                          phase === "implementing" ? "feat" :
                          phase === "refining" ? "fix" : "chore";
        const manualCommit = commitPhase(commitType, featureName || "CE workflow checkpoint");
        if (manualCommit.success) {
          commitCount = getCommitCount();
          state = { phase, iteration, signals, featureName, branchName, commitCount };
          console.log(`\n${C.green}✓ Committed: ${commitType}: ${featureName || "checkpoint"}${C.reset}`);
        } else {
          console.log(`\n${C.yellow}⚠ Nothing to commit (no changes)${C.reset}`);
        }
        setTimeout(() => render(state, config), 1500);
        break;

      case "g":
        // Git commit and create PR
        if (signals.compound) {
          console.log(`\n${C.cyan}Creating PR...${C.reset}`);
          const result = gitCommitAndPR(featureName);
          if (result.success) {
            console.log(`\n${C.green}✓ PR created: ${result.prUrl}${C.reset}`);
            // Signal that PR is created
            execSync(`touch ${workflowPath("signals/pr.done")}`);
            // Update phase to complete
            phase = "complete";
            commitCount = getCommitCount();
            state = { phase, iteration, signals, featureName, branchName, commitCount };
            setTimeout(() => {
              render(state, config);
              syncStateToFile(state);
            }, 2000);
          } else {
            console.log(`\n${C.red}✗ Failed: ${result.error}${C.reset}`);
            setTimeout(() => render(state, config), 2000);
          }
        } else {
          console.log(`\n${C.red}Cannot create PR - compound not complete${C.reset}`);
          setTimeout(() => render(state, config), 1500);
        }
        break;

      case "m":
        // Model configuration menu
        inModelMenu = true;
        showCursor();

        runModelMenu(config).then((newConfig) => {
          inModelMenu = false;
          hideCursor();
          process.stdin.resume();

          if (newConfig) {
            config = newConfig;
            if (saveConfig(config)) {
              console.log(`\n${C.green}✓ Model configuration saved to .workflow/config.json${C.reset}`);
              console.log(`${C.dim}Press [W] to restart workers with new models${C.reset}`);
            }
          } else {
            console.log(`\n${C.dim}Model configuration cancelled${C.reset}`);
          }
          setTimeout(() => render(state, config), 1500);
        }).catch((e) => {
          inModelMenu = false;
          console.error(`\n${C.red}Model menu error: ${e}${C.reset}`);
          setTimeout(() => render(state, config), 1500);
        });
        break;

      case "w":
        // Restart workers with configured models
        console.log(`\n${C.cyan}Restarting workers with configured models...${C.reset}`);
        {
          const workers = ["plan", "backend", "frontend", "tests", "review"] as const;
          workers.forEach((worker, idx) => {
            const model = config.models[worker];
            const customCmd = config.customCommands?.[worker];
            const command = getModelCommand(model, customCmd);
            setTimeout(() => {
              restartWorkerWithModel(worker, command);
              console.log(`  ${C.green}✓${C.reset} ${worker}: ${command.slice(0, 40)}${command.length > 40 ? "..." : ""}`);
            }, idx * 500);  // Stagger /exit commands by 500ms
          });
        }
        // Wait 6 seconds total (500ms * 5 workers + 3s for last command)
        setTimeout(() => render(state, config), 6000);
        break;

      case "n":
        // New feature - clear workflow
        console.log(`\n${C.yellow}Clear workflow and start new feature? [y/N]${C.reset}`);
        process.stdin.once("keypress", (confirmStr) => {
          if (confirmStr?.toLowerCase() === "y") {
            console.log(`\n${C.cyan}Clearing workflow...${C.reset}`);
            clearWorkflow();
            signals = {};
            phase = "init";
            iteration = 1;
            featureName = undefined;
            branchName = getCurrentBranch();
            commitCount = 0;
            implementationCommitted = false;
            refineCommitted = false;
            state = { phase, iteration, signals, featureName, branchName, commitCount };
            setTimeout(() => {
              render(state, config);
              console.log(`\n${C.green}✓ Workflow cleared. Go to Plan window (Ctrl+b 2) to start.${C.reset}`);
            }, 500);
          } else {
            console.log(`\n${C.dim}Cancelled${C.reset}`);
            setTimeout(() => render(state, config), 500);
          }
        });
        break;

      case "q":
        // Quit
        showCursor();
        watcher.close();
        console.log("\n");
        process.exit(0);
        break;
    }
  });

  // Keep process alive
  await new Promise(() => {});
}

main().catch((e) => {
  showCursor();
  console.error(`${C.red}Fatal: ${e.message}${C.reset}`);
  process.exit(1);
});
