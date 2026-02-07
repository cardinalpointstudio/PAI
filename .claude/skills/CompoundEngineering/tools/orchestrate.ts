#!/usr/bin/env bun

/**
 * Orchestrate - Parallel Claude Code workflow coordinator
 *
 * Manages the Plan → Implement → Review → Refine → Compound cycle
 * with multiple parallel workers across tmux windows.
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, watch } from "fs";
import { join, resolve } from "path";
import { spawn, execSync } from "child_process";

// ============================================================================
// Types
// ============================================================================

type WorkflowState =
  | "init"
  | "planning"
  | "implementing"
  | "reviewing"
  | "refining"
  | "compounding"
  | "complete"
  | "failed";

interface WorkflowConfig {
  maxIterations: number;
  workers: string[];
  projectRoot: string;
  contractsDir: string;
  tasksDir: string;
  reviewChecks: {
    runTests: boolean;
    validateContracts: boolean;
    securityReview: boolean;
    performanceReview: boolean;
  };
  tmuxSession: string;
}

interface WorkflowStatus {
  state: WorkflowState;
  iteration: number;
  startedAt: string;
  lastUpdated: string;
  signals: Record<string, boolean>;
  errors: string[];
}

// ============================================================================
// Constants
// ============================================================================

const WORKFLOW_DIR = ".workflow";
const SIGNALS_DIR = "signals";
const STATE_FILE = "state.json";
const CONFIG_FILE = "config.json";

const DEFAULT_CONFIG: WorkflowConfig = {
  maxIterations: 3,
  workers: ["backend", "frontend", "tests"],
  projectRoot: ".",
  contractsDir: ".workflow/contracts",
  tasksDir: ".workflow/tasks",
  reviewChecks: {
    runTests: true,
    validateContracts: true,
    securityReview: true,
    performanceReview: true,
  },
  tmuxSession: "compound-eng",
};

const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

// ============================================================================
// Utility Functions
// ============================================================================

function log(msg: string, color: keyof typeof COLORS = "reset"): void {
  const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
  console.log(`${COLORS.dim}[${timestamp}]${COLORS.reset} ${COLORS[color]}${msg}${COLORS.reset}`);
}

function logError(msg: string): void {
  log(`ERROR: ${msg}`, "red");
}

function logSuccess(msg: string): void {
  log(`✓ ${msg}`, "green");
}

function logInfo(msg: string): void {
  log(`→ ${msg}`, "cyan");
}

function logState(state: WorkflowState): void {
  const stateColors: Record<WorkflowState, keyof typeof COLORS> = {
    init: "dim",
    planning: "yellow",
    implementing: "blue",
    reviewing: "magenta",
    refining: "yellow",
    compounding: "cyan",
    complete: "green",
    failed: "red",
  };
  log(`State: ${state.toUpperCase()}`, stateColors[state]);
}

function workflowPath(...parts: string[]): string {
  return join(process.cwd(), WORKFLOW_DIR, ...parts);
}

function ensureDir(path: string): void {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

function fileExists(path: string): boolean {
  return existsSync(path);
}

function readJson<T>(path: string, defaultValue: T): T {
  try {
    if (fileExists(path)) {
      return JSON.parse(readFileSync(path, "utf-8"));
    }
  } catch (e) {
    logError(`Failed to read ${path}: ${e}`);
  }
  return defaultValue;
}

function writeJson(path: string, data: unknown): void {
  writeFileSync(path, JSON.stringify(data, null, 2));
}

// ============================================================================
// Workflow State Management
// ============================================================================

function getConfig(): WorkflowConfig {
  return readJson(workflowPath(CONFIG_FILE), DEFAULT_CONFIG);
}

function getStatus(): WorkflowStatus {
  const defaultStatus: WorkflowStatus = {
    state: "init",
    iteration: 0,
    startedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    signals: {},
    errors: [],
  };
  return readJson(workflowPath(STATE_FILE), defaultStatus);
}

function updateStatus(updates: Partial<WorkflowStatus>): void {
  const current = getStatus();
  const updated = {
    ...current,
    ...updates,
    lastUpdated: new Date().toISOString(),
  };
  writeJson(workflowPath(STATE_FILE), updated);
}

function setState(state: WorkflowState): void {
  updateStatus({ state });
  logState(state);
}

function getSignals(): Record<string, boolean> {
  const signalsDir = workflowPath(SIGNALS_DIR);
  if (!fileExists(signalsDir)) return {};

  const signals: Record<string, boolean> = {};
  const files = readdirSync(signalsDir);
  for (const file of files) {
    if (file.endsWith(".done")) {
      const name = file.replace(".done", "");
      signals[name] = true;
    }
  }
  return signals;
}

function signalComplete(name: string): void {
  const signalsDir = workflowPath(SIGNALS_DIR);
  ensureDir(signalsDir);
  writeFileSync(join(signalsDir, `${name}.done`), new Date().toISOString());
  logSuccess(`Signal: ${name}.done`);
}

function clearSignals(patterns: string[]): void {
  const signalsDir = workflowPath(SIGNALS_DIR);
  if (!fileExists(signalsDir)) return;

  const files = readdirSync(signalsDir);
  for (const file of files) {
    const name = file.replace(".done", "");
    if (patterns.includes(name) || patterns.includes("*")) {
      const path = join(signalsDir, file);
      try {
        execSync(`rm "${path}"`);
        logInfo(`Cleared signal: ${file}`);
      } catch {
        // Ignore
      }
    }
  }
}

// ============================================================================
// Tmux Management
// ============================================================================

function tmuxExists(): boolean {
  try {
    execSync("which tmux", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function tmuxSessionExists(session: string): boolean {
  try {
    execSync(`tmux has-session -t "${session}" 2>/dev/null`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function tmuxCreateSession(session: string): void {
  if (tmuxSessionExists(session)) {
    logInfo(`Session '${session}' already exists`);
    return;
  }
  execSync(`tmux new-session -d -s "${session}" -n "orchestrate"`);
  logSuccess(`Created tmux session: ${session}`);
}

function tmuxCreateWindow(session: string, name: string): void {
  try {
    execSync(`tmux new-window -t "${session}" -n "${name}"`);
    logSuccess(`Created window: ${name}`);
  } catch {
    logInfo(`Window '${name}' may already exist`);
  }
}

function tmuxSplitPane(session: string, window: string, direction: "h" | "v"): void {
  const flag = direction === "h" ? "-h" : "-v";
  execSync(`tmux split-window ${flag} -t "${session}:${window}"`);
}

function tmuxSendKeys(session: string, window: string, pane: number, command: string): void {
  execSync(`tmux send-keys -t "${session}:${window}.${pane}" '${command}' Enter`);
}

function tmuxSelectLayout(session: string, window: string, layout: string): void {
  execSync(`tmux select-layout -t "${session}:${window}" ${layout}`);
}

function setupTmuxWorkspace(): void {
  if (!tmuxExists()) {
    logError("tmux is not installed. Please install tmux first.");
    process.exit(1);
  }

  const config = getConfig();
  const session = config.tmuxSession;

  log("Setting up tmux workspace...", "bright");

  // Create session with orchestrate window
  tmuxCreateSession(session);

  // Window 1: PLAN
  tmuxCreateWindow(session, "plan");
  tmuxSendKeys(session, "plan", 0, `cd "${process.cwd()}"`);

  // Window 2: IMPLEMENT (3 panes)
  tmuxCreateWindow(session, "implement");
  tmuxSplitPane(session, "implement", "h");
  tmuxSplitPane(session, "implement", "h");
  tmuxSelectLayout(session, "implement", "even-horizontal");

  // Send cd to all implement panes
  for (let i = 0; i < 3; i++) {
    tmuxSendKeys(session, "implement", i, `cd "${process.cwd()}"`);
  }

  // Window 3: REVIEW
  tmuxCreateWindow(session, "review");
  tmuxSendKeys(session, "review", 0, `cd "${process.cwd()}"`);

  // Window 4: REFINE (3 panes)
  tmuxCreateWindow(session, "refine");
  tmuxSplitPane(session, "refine", "h");
  tmuxSplitPane(session, "refine", "h");
  tmuxSelectLayout(session, "refine", "even-horizontal");

  for (let i = 0; i < 3; i++) {
    tmuxSendKeys(session, "refine", i, `cd "${process.cwd()}"`);
  }

  // Window 5: COMPOUND
  tmuxCreateWindow(session, "compound");
  tmuxSendKeys(session, "compound", 0, `cd "${process.cwd()}"`);

  logSuccess(`Tmux workspace ready: ${session}`);
  log(`Attach with: tmux attach -t ${session}`, "cyan");
}

// ============================================================================
// Worker Prompts
// ============================================================================

function getPlanPrompt(featureDescription: string): string {
  return `You are the ARCHITECT in a CompoundEngineering workflow.

## Your Task
Plan the feature: "${featureDescription}"

## Process
1. Ask me clarifying questions about requirements
2. Explore the codebase for existing patterns
3. Design the implementation approach

## Required Outputs
When I approve the plan, create these files:

1. \`.workflow/PLAN.md\` - High-level implementation plan
2. \`.workflow/contracts/\` - TypeScript interface files
3. \`.workflow/tasks/backend.md\` - Backend worker tasks
4. \`.workflow/tasks/frontend.md\` - Frontend worker tasks
5. \`.workflow/tasks/tests.md\` - Tests worker tasks

## Task File Format
Each task file must include:
- Contract references (what interfaces to import)
- Ordered task list with specific files and actions
- Constraints for that domain
- "Done when" checklist

## When Complete
After I approve the plan:
\`\`\`bash
touch .workflow/signals/plan.done
\`\`\`

Start by asking your clarifying questions.`;
}

function getWorkerPrompt(workerType: string): string {
  const scopeMap: Record<string, { allowed: string; forbidden: string }> = {
    backend: {
      allowed: "src/backend/**, src/api/**, src/lib/**, src/db/**, src/server/**",
      forbidden: "src/frontend/**, src/components/**, tests/**",
    },
    frontend: {
      allowed: "src/frontend/**, src/components/**, src/pages/**, src/app/**",
      forbidden: "src/backend/**, src/api/**, tests/**",
    },
    tests: {
      allowed: "tests/**, **/*.test.ts, **/*.spec.ts, **/__tests__/**",
      forbidden: "src/** (except test files)",
    },
  };

  const scope = scopeMap[workerType] || scopeMap.backend;

  return `You are the ${workerType.toUpperCase()} WORKER in a parallel implementation workflow.

## Your Scope
- ONLY modify: ${scope.allowed}
- NEVER modify: ${scope.forbidden}

## Your Task
Read your task file: \`.workflow/tasks/${workerType}.md\`
Import types from: \`.workflow/contracts/\`

## Process
1. Read your task file completely
2. Read the contracts for type definitions
3. Implement each task in order
4. Verify your changes compile

## Constraints
- Follow existing code patterns in the codebase
- All new code must be type-safe
- Stay within your allowed file scope
- Do NOT modify other domains

## When Complete
1. Verify compilation: \`bun run tsc --noEmit\` (or equivalent)
2. Signal done: \`touch .workflow/signals/${workerType}.done\`

Begin by reading your task file.`;
}

function getReviewPrompt(): string {
  return `Run the CompoundEngineering Review workflow.

## Scope
Review all changes: \`git diff main...HEAD\`
Also check: \`.workflow/PLAN.md\` for requirements compliance

## Review Process
Launch 4 parallel review agents for:
1. Security - OWASP top 10, auth issues, injection
2. Performance - O(n²), N+1 queries, memory leaks
3. Correctness - Logic errors, edge cases, type safety
4. Maintainability - Code clarity, DRY, patterns

## Additional Checks
- Run test suite: \`bun test\`
- Validate contracts are implemented
- Check all task file items completed

## Output
Write \`.workflow/REVIEW.md\` with:

\`\`\`markdown
## Status: PASS | FAIL

### Critical Issues (must fix)
- [ ] Issue 1
- [ ] Issue 2

### Recommended (should fix)
- [ ] Issue 1

### Minor (optional)
- Issue 1

### Test Results
[test output summary]
\`\`\`

## When Complete
\`touch .workflow/signals/review.done\``;
}

function getRefinePrompt(workerType: string): string {
  return `You are the ${workerType.toUpperCase()} REFINE WORKER.

## Your Task
Read \`.workflow/REVIEW.md\` and fix issues in your domain.

## Your Scope (same as implementation)
${workerType === "backend" ? "src/backend/**, src/api/**, src/lib/**, src/db/**" : ""}
${workerType === "frontend" ? "src/frontend/**, src/components/**, src/pages/**" : ""}
${workerType === "tests" ? "tests/**, **/*.test.ts, **/*.spec.ts" : ""}

## Process
1. Read REVIEW.md for issues in your domain
2. Fix critical issues first
3. Then recommended issues
4. Skip minor issues unless quick

## When Complete
\`touch .workflow/signals/${workerType}-refine.done\``;
}

function getCompoundPrompt(): string {
  return `Run the CompoundEngineering Compound workflow.

## Context
We just completed a feature implementation using the parallel workflow.

## Your Task
Extract learnings from this session:
1. What patterns emerged that could be reused?
2. What mistakes were made that should be avoided?
3. What was surprisingly difficult or easy?

## Reference
- \`.workflow/PLAN.md\` - Original plan
- \`.workflow/REVIEW.md\` - Issues found
- Git diff for actual changes

## Output
Save learnings to: \`~/.claude/History/Learnings/$(date +%Y-%m-%d)-[topic].md\`

## When Complete
\`touch .workflow/signals/compound.done\``;
}

// ============================================================================
// State Machine
// ============================================================================

async function runStateMachine(): Promise<void> {
  log("Starting orchestrator state machine...", "bright");

  const config = getConfig();
  let running = true;

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    log("\nShutting down orchestrator...", "yellow");
    running = false;
  });

  while (running) {
    const status = getStatus();
    const signals = getSignals();

    switch (status.state) {
      case "init":
        logInfo("Waiting for planning to start...");
        logInfo("Run: claude \"Plan: [your feature]\" in the plan window");
        // Transition when any activity in .workflow/
        if (fileExists(workflowPath("PLAN.md")) || signals.plan) {
          setState("planning");
        }
        break;

      case "planning":
        if (signals.plan) {
          logSuccess("Plan complete! Starting implementation...");
          setState("implementing");
          // Launch workers
          launchImplementWorkers(config);
        }
        break;

      case "implementing":
        const implSignals = config.workers.map((w) => signals[w]);
        const implComplete = implSignals.every(Boolean);
        const implProgress = implSignals.filter(Boolean).length;

        if (implComplete) {
          logSuccess("All workers complete! Starting review...");
          setState("reviewing");
          launchReview(config);
        } else {
          logInfo(`Implementation progress: ${implProgress}/${config.workers.length} workers done`);
        }
        break;

      case "reviewing":
        if (signals.review) {
          const reviewStatus = checkReviewStatus();
          if (reviewStatus === "PASS") {
            logSuccess("Review passed! Starting compound...");
            setState("compounding");
            launchCompound(config);
          } else if (reviewStatus === "FAIL") {
            const iteration = status.iteration + 1;
            if (iteration >= config.maxIterations) {
              logError(`Review failed after ${config.maxIterations} iterations. Escalating.`);
              escalateToHuman();
              setState("failed");
            } else {
              logInfo(`Review found issues. Starting refine iteration ${iteration}...`);
              updateStatus({ iteration });
              clearSignals(config.workers.map((w) => `${w}-refine`));
              clearSignals(["review"]);
              setState("refining");
              launchRefineWorkers(config);
            }
          }
        }
        break;

      case "refining":
        const refineSignals = config.workers.map((w) => signals[`${w}-refine`]);
        const refineComplete = refineSignals.every(Boolean);

        if (refineComplete) {
          logSuccess("Refine complete! Re-running review...");
          clearSignals(["review"]);
          setState("reviewing");
          launchReview(config);
        }
        break;

      case "compounding":
        if (signals.compound) {
          logSuccess("Workflow complete!");
          setState("complete");
          running = false;
        }
        break;

      case "complete":
      case "failed":
        running = false;
        break;
    }

    // Poll every 5 seconds
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  log("Orchestrator stopped.", "dim");
}

function launchImplementWorkers(config: WorkflowConfig): void {
  const session = config.tmuxSession;

  config.workers.forEach((worker, index) => {
    const prompt = getWorkerPrompt(worker);
    logInfo(`Launching ${worker} worker...`);

    // Send prompt to appropriate pane
    const escapedPrompt = prompt.replace(/'/g, "'\"'\"'");
    tmuxSendKeys(session, "implement", index, `claude "${escapedPrompt}"`);
  });
}

function launchReview(config: WorkflowConfig): void {
  const session = config.tmuxSession;
  const prompt = getReviewPrompt();
  const escapedPrompt = prompt.replace(/'/g, "'\"'\"'");

  logInfo("Launching review...");
  tmuxSendKeys(session, "review", 0, `claude "${escapedPrompt}"`);
}

function launchRefineWorkers(config: WorkflowConfig): void {
  const session = config.tmuxSession;

  config.workers.forEach((worker, index) => {
    const prompt = getRefinePrompt(worker);
    logInfo(`Launching ${worker} refine worker...`);

    const escapedPrompt = prompt.replace(/'/g, "'\"'\"'");
    tmuxSendKeys(session, "refine", index, `claude "${escapedPrompt}"`);
  });
}

function launchCompound(config: WorkflowConfig): void {
  const session = config.tmuxSession;
  const prompt = getCompoundPrompt();
  const escapedPrompt = prompt.replace(/'/g, "'\"'\"'");

  logInfo("Launching compound...");
  tmuxSendKeys(session, "compound", 0, `claude "${escapedPrompt}"`);
}

function checkReviewStatus(): "PASS" | "FAIL" | "UNKNOWN" {
  const reviewPath = workflowPath("REVIEW.md");
  if (!fileExists(reviewPath)) return "UNKNOWN";

  const content = readFileSync(reviewPath, "utf-8");

  if (content.includes("Status: PASS") || content.includes("## Status: PASS")) {
    return "PASS";
  }
  if (content.includes("Status: FAIL") || content.includes("## Status: FAIL")) {
    return "FAIL";
  }

  // Check for critical issues
  if (content.includes("### Critical Issues") && !content.includes("### Critical Issues\n\n###")) {
    return "FAIL";
  }

  return "PASS"; // Default to pass if no explicit fail
}

function escalateToHuman(): void {
  log("", "reset");
  log("═══════════════════════════════════════════════════════", "red");
  log("  ESCALATION: Review failed after maximum iterations", "red");
  log("═══════════════════════════════════════════════════════", "red");
  log("", "reset");
  log("Remaining issues in .workflow/REVIEW.md", "yellow");
  log("", "reset");
  log("Options:", "bright");
  log("  1. Fix manually, then: orchestrate.ts signal review", "reset");
  log("  2. Force continue:     orchestrate.ts signal review --force", "reset");
  log("  3. Abort workflow:     orchestrate.ts reset", "reset");
  log("", "reset");
}

// ============================================================================
// Commands
// ============================================================================

function cmdInit(): void {
  log("Initializing workflow directory...", "bright");

  // Create directory structure
  ensureDir(workflowPath());
  ensureDir(workflowPath(SIGNALS_DIR));
  ensureDir(workflowPath("contracts"));
  ensureDir(workflowPath("tasks"));
  ensureDir(workflowPath("logs"));

  // Write default config
  writeJson(workflowPath(CONFIG_FILE), DEFAULT_CONFIG);

  // Write initial state
  const initialStatus: WorkflowStatus = {
    state: "init",
    iteration: 0,
    startedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    signals: {},
    errors: [],
  };
  writeJson(workflowPath(STATE_FILE), initialStatus);

  // Create .gitignore for workflow directory
  writeFileSync(
    workflowPath(".gitignore"),
    `# Workflow artifacts (don't commit)
signals/
logs/
state.json
`
  );

  logSuccess("Workflow initialized: .workflow/");
  log("", "reset");
  log("Next steps:", "bright");
  log("  1. Set up tmux:  orchestrate.ts tmux", "reset");
  log("  2. Start orchestrator: orchestrate.ts start", "reset");
  log("  3. Begin planning in the plan window", "reset");
}

function cmdStatus(): void {
  if (!fileExists(workflowPath())) {
    logError("No workflow found. Run: orchestrate.ts init");
    return;
  }

  const status = getStatus();
  const config = getConfig();
  const signals = getSignals();

  log("", "reset");
  log("═══════════════════════════════════════════════════════", "bright");
  log("  Compound Engineering Workflow Status", "bright");
  log("═══════════════════════════════════════════════════════", "bright");
  log("", "reset");

  logState(status.state);
  log(`Iteration: ${status.iteration}/${config.maxIterations}`, "reset");
  log(`Started: ${status.startedAt}`, "dim");
  log(`Updated: ${status.lastUpdated}`, "dim");
  log("", "reset");

  log("Signals:", "bright");
  const allSignals = ["plan", ...config.workers, "review", ...config.workers.map((w) => `${w}-refine`), "compound"];
  for (const sig of allSignals) {
    const icon = signals[sig] ? "✓" : "○";
    const color = signals[sig] ? "green" : "dim";
    log(`  ${icon} ${sig}`, color);
  }

  log("", "reset");
  log("Files:", "bright");
  const files = ["PLAN.md", "REVIEW.md", "contracts/", "tasks/"];
  for (const file of files) {
    const exists = fileExists(workflowPath(file));
    const icon = exists ? "✓" : "○";
    const color = exists ? "green" : "dim";
    log(`  ${icon} .workflow/${file}`, color);
  }
  log("", "reset");
}

function cmdWatch(): void {
  if (!fileExists(workflowPath())) {
    logError("No workflow found. Run: orchestrate.ts init");
    return;
  }

  log("Watching workflow status (Ctrl+C to stop)...", "bright");
  log("", "reset");

  // Initial status
  cmdStatus();

  // Watch for changes
  const signalsDir = workflowPath(SIGNALS_DIR);
  ensureDir(signalsDir);

  watch(signalsDir, (eventType, filename) => {
    if (filename) {
      log(`Signal changed: ${filename}`, "cyan");
      cmdStatus();
    }
  });

  // Also watch state file
  watch(workflowPath(), (eventType, filename) => {
    if (filename === STATE_FILE) {
      const status = getStatus();
      logState(status.state);
    }
  });

  // Keep process alive
  setInterval(() => {}, 1000);
}

function cmdSignal(name: string, force: boolean = false): void {
  if (!fileExists(workflowPath())) {
    logError("No workflow found. Run: orchestrate.ts init");
    return;
  }

  if (force) {
    logInfo(`Force signaling: ${name}`);
  }

  signalComplete(name);

  // If signaling review with force, also mark it as PASS
  if (name === "review" && force) {
    const reviewPath = workflowPath("REVIEW.md");
    if (fileExists(reviewPath)) {
      let content = readFileSync(reviewPath, "utf-8");
      content = content.replace(/Status: FAIL/g, "Status: PASS (forced)");
      writeFileSync(reviewPath, content);
      logInfo("Review status forced to PASS");
    }
  }
}

function cmdReset(): void {
  if (!fileExists(workflowPath())) {
    logError("No workflow found.");
    return;
  }

  log("Resetting workflow state...", "yellow");

  // Clear signals
  clearSignals(["*"]);

  // Reset state
  updateStatus({
    state: "init",
    iteration: 0,
    errors: [],
  });

  logSuccess("Workflow reset to init state");
  log("Artifacts (PLAN.md, contracts/, tasks/) preserved", "dim");
}

function cmdClean(): void {
  if (!fileExists(workflowPath())) {
    logError("No workflow found.");
    return;
  }

  log("Removing .workflow/ directory...", "yellow");
  execSync(`rm -rf "${workflowPath()}"`);
  logSuccess("Workflow directory removed");
}

function cmdTmux(): void {
  setupTmuxWorkspace();
}

async function cmdStart(): Promise<void> {
  if (!fileExists(workflowPath())) {
    logError("No workflow found. Run: orchestrate.ts init");
    return;
  }

  await runStateMachine();
}

// ============================================================================
// CLI
// ============================================================================

function printHelp(): void {
  console.log(`
${COLORS.bright}orchestrate.ts${COLORS.reset} - Parallel Claude Code workflow coordinator

${COLORS.bright}USAGE${COLORS.reset}
  orchestrate.ts <command> [options]

${COLORS.bright}COMMANDS${COLORS.reset}
  init              Create .workflow/ directory structure
  start             Start the state machine (foreground)
  status            Show current workflow state
  watch             Watch for state changes (live updates)
  tmux              Set up tmux session with all windows
  signal <name>     Manually signal completion (e.g., signal plan)
  reset             Reset to init state (preserves artifacts)
  clean             Remove .workflow/ entirely

${COLORS.bright}OPTIONS${COLORS.reset}
  --force           Force signal even if conditions not met
  --help, -h        Show this help message

${COLORS.bright}EXAMPLES${COLORS.reset}
  orchestrate.ts init                  # Initialize workflow
  orchestrate.ts tmux                  # Set up tmux workspace
  orchestrate.ts start                 # Start orchestrator
  orchestrate.ts status                # Check progress
  orchestrate.ts signal plan           # Manually signal plan done
  orchestrate.ts signal review --force # Force review to pass

${COLORS.bright}WORKFLOW${COLORS.reset}
  1. orchestrate.ts init
  2. orchestrate.ts tmux
  3. orchestrate.ts start (in orchestrate window)
  4. Plan your feature in the plan window
  5. Watch parallel workers implement
  6. Review and refine automatically
  7. Learnings captured to History/
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];
  const force = args.includes("--force");

  if (!command || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  switch (command) {
    case "init":
      cmdInit();
      break;
    case "start":
      await cmdStart();
      break;
    case "status":
      cmdStatus();
      break;
    case "watch":
      cmdWatch();
      break;
    case "tmux":
      cmdTmux();
      break;
    case "signal":
      const signalName = args[1];
      if (!signalName) {
        logError("Signal name required. Example: orchestrate.ts signal plan");
        return;
      }
      cmdSignal(signalName, force);
      break;
    case "reset":
      cmdReset();
      break;
    case "clean":
      cmdClean();
      break;
    default:
      logError(`Unknown command: ${command}`);
      printHelp();
  }
}

main().catch((e) => {
  logError(`Fatal: ${e.message}`);
  process.exit(1);
});
