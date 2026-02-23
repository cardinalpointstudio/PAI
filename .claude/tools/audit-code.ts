#!/usr/bin/env bun

/**
 * CodeAudit CLI Tool
 *
 * Analyzes TypeScript/JavaScript codebases for:
 * - Large files (over threshold)
 * - Duplicate code patterns
 * - Unused exports (via knip)
 * - Type safety issues (any, unsafe casts, @ts-ignore)
 *
 * Usage:
 *   bun audit-code.ts <path> [options]
 *
 * Options:
 *   --json       Output as JSON
 *   --report     Generate markdown report (saved to History)
 *   --threshold  Line threshold for large files (default: 400)
 *   --help       Show help
 */

import { readdir, stat, readFile, mkdir, writeFile } from "fs/promises";
import { join, relative, basename, dirname } from "path";
import { existsSync } from "fs";

// ============================================================================
// Types
// ============================================================================

interface LargeFile {
  path: string;
  lines: number;
  recommendation: string;
}

interface DuplicatePattern {
  pattern: string;
  occurrences: Array<{ file: string; line: number }>;
  suggestion: string;
}

interface TypeIssue {
  file: string;
  line: number;
  type: "any" | "unsafe_cast" | "ts_ignore" | "missing_return_type";
  severity: "high" | "medium" | "low";
  code: string;
}

interface UnusedExport {
  file: string;
  name: string;
  type: "function" | "variable" | "type" | "class";
}

interface AuditResult {
  projectPath: string;
  projectName: string;
  timestamp: string;
  filesAnalyzed: number;
  totalLines: number;
  score: number;
  largeFiles: LargeFile[];
  duplicates: DuplicatePattern[];
  unusedExports: UnusedExport[];
  typeIssues: TypeIssue[];
  summary: {
    largeFilesCount: number;
    duplicatesCount: number;
    unusedExportsCount: number;
    typeIssuesHigh: number;
    typeIssuesMedium: number;
    typeIssuesLow: number;
  };
}

interface Config {
  path: string;
  threshold: number;
  json: boolean;
  report: boolean;
}

// ============================================================================
// CLI Argument Parsing
// ============================================================================

function parseArgs(): Config | null {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    return null;
  }

  const config: Config = {
    path: ".",
    threshold: 400,
    json: false,
    report: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--json") {
      config.json = true;
    } else if (arg === "--report") {
      config.report = true;
    } else if (arg === "--threshold" && args[i + 1]) {
      config.threshold = parseInt(args[++i], 10);
    } else if (!arg.startsWith("-")) {
      config.path = arg;
    }
  }

  return config;
}

function printHelp(): void {
  console.log(`
CodeAudit - Automated codebase health analysis

USAGE:
  bun audit-code.ts <path> [options]

ARGUMENTS:
  <path>              Directory to audit (default: current directory)

OPTIONS:
  --json              Output results as JSON
  --report            Generate markdown report (saved to ~/.claude/History/Audits/)
  --threshold <n>     Line threshold for large files (default: 400)
  --help, -h          Show this help message

EXAMPLES:
  bun audit-code.ts ./src
  bun audit-code.ts ./src --json
  bun audit-code.ts ./src --report --threshold 300
  bun audit-code.ts . --json | jq '.largeFiles'

OUTPUT:
  Interactive terminal output by default.
  Use --json for machine-readable output.
  Use --report to save detailed markdown report.

WHAT IT ANALYZES:
  - Large files over threshold (need splitting)
  - Duplicate code patterns (need extraction)
  - Unused exports (dead code)
  - Type safety issues (any, casts, @ts-ignore)
`);
}

// ============================================================================
// File Discovery
// ============================================================================

const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "coverage",
  ".turbo",
  ".cache",
]);

const TS_JS_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".mts"]);

async function findFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  async function walk(currentDir: string): Promise<void> {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name) && !entry.name.startsWith(".")) {
          await walk(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = entry.name.substring(entry.name.lastIndexOf("."));
        if (TS_JS_EXTENSIONS.has(ext)) {
          files.push(fullPath);
        }
      }
    }
  }

  await walk(dir);
  return files;
}

// ============================================================================
// Large File Detection
// ============================================================================

async function analyzeLargeFiles(
  files: string[],
  threshold: number,
  basePath: string
): Promise<{ largeFiles: LargeFile[]; totalLines: number }> {
  const largeFiles: LargeFile[] = [];
  let totalLines = 0;

  for (const file of files) {
    const content = await readFile(file, "utf-8");
    const lines = content.split("\n").length;
    totalLines += lines;

    if (lines > threshold) {
      const relativePath = relative(basePath, file);
      let recommendation = "Consider splitting into smaller modules";

      // Smart recommendations based on file type
      if (file.includes("component") || file.endsWith(".tsx")) {
        recommendation = "Split into sub-components or extract hooks";
      } else if (file.includes("util") || file.includes("helper")) {
        recommendation = "Group related functions into separate modules";
      } else if (file.includes("api") || file.includes("route")) {
        recommendation = "Split routes into separate handler files";
      } else if (file.includes("test") || file.includes("spec")) {
        recommendation = "Split into separate test files by feature";
      }

      largeFiles.push({
        path: relativePath,
        lines,
        recommendation,
      });
    }
  }

  // Sort by lines descending
  largeFiles.sort((a, b) => b.lines - a.lines);

  return { largeFiles, totalLines };
}

// ============================================================================
// Duplicate Code Detection
// ============================================================================

interface CodeBlock {
  file: string;
  startLine: number;
  content: string;
  normalized: string;
}

function normalizeCode(code: string): string {
  return code
    .replace(/\/\/.*$/gm, "") // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/['"`]/g, '"') // Normalize quotes
    .trim();
}

async function analyzeDuplicates(
  files: string[],
  basePath: string
): Promise<DuplicatePattern[]> {
  const MIN_LINES = 6; // Minimum lines to consider as duplicate
  const blockMap = new Map<string, Array<{ file: string; line: number }>>();

  for (const file of files) {
    const content = await readFile(file, "utf-8");
    const lines = content.split("\n");
    const relativePath = relative(basePath, file);

    // Extract meaningful code blocks (function bodies, component returns, etc.)
    for (let i = 0; i < lines.length - MIN_LINES; i++) {
      // Look for block starts
      const line = lines[i];
      if (
        line.includes("function") ||
        line.includes("=>") ||
        line.includes("return") ||
        line.includes("const ") ||
        line.includes("export ")
      ) {
        // Extract next MIN_LINES lines as a block
        const block = lines.slice(i, i + MIN_LINES).join("\n");
        const normalized = normalizeCode(block);

        // Skip very short or trivial blocks
        if (normalized.length < 50) continue;

        if (!blockMap.has(normalized)) {
          blockMap.set(normalized, []);
        }
        blockMap.get(normalized)!.push({ file: relativePath, line: i + 1 });
      }
    }
  }

  // Find actual duplicates (blocks that appear in multiple places)
  const duplicates: DuplicatePattern[] = [];

  for (const [normalized, occurrences] of blockMap) {
    // Filter to unique files (same block in same file doesn't count)
    const uniqueFiles = new Map<string, { file: string; line: number }>();
    for (const occ of occurrences) {
      if (!uniqueFiles.has(occ.file)) {
        uniqueFiles.set(occ.file, occ);
      }
    }

    if (uniqueFiles.size >= 2) {
      // Truncate pattern for display
      const pattern = normalized.length > 100
        ? normalized.substring(0, 100) + "..."
        : normalized;

      duplicates.push({
        pattern,
        occurrences: Array.from(uniqueFiles.values()),
        suggestion: "Extract to shared utility function",
      });
    }
  }

  // Sort by number of occurrences descending
  duplicates.sort((a, b) => b.occurrences.length - a.occurrences.length);

  // Return top 20 most common duplicates
  return duplicates.slice(0, 20);
}

// ============================================================================
// Type Safety Analysis
// ============================================================================

async function analyzeTypeSafety(
  files: string[],
  basePath: string
): Promise<TypeIssue[]> {
  const issues: TypeIssue[] = [];

  // Only analyze TypeScript files
  const tsFiles = files.filter(f => f.endsWith(".ts") || f.endsWith(".tsx"));

  for (const file of tsFiles) {
    const content = await readFile(file, "utf-8");
    const lines = content.split("\n");
    const relativePath = relative(basePath, file);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Check for explicit `any` type
      const anyMatches = line.match(/:\s*any\b|<any>|as any/g);
      if (anyMatches) {
        const isExport = line.includes("export ");
        const isParam = line.includes("(") && line.includes(")");

        issues.push({
          file: relativePath,
          line: lineNum,
          type: "any",
          severity: isExport && isParam ? "high" : "medium",
          code: line.trim().substring(0, 80),
        });
      }

      // Check for unsafe casts
      if (line.includes("as unknown as") || line.match(/as\s+\w+\s*[,;)]/)) {
        // Skip valid type assertions that aren't unsafe
        if (!line.includes("as const") && !line.includes("as string") &&
            !line.includes("as number") && !line.includes("as boolean")) {
          issues.push({
            file: relativePath,
            line: lineNum,
            type: "unsafe_cast",
            severity: "high",
            code: line.trim().substring(0, 80),
          });
        }
      }

      // Check for @ts-ignore and @ts-expect-error
      if (line.includes("@ts-ignore") || line.includes("@ts-expect-error")) {
        issues.push({
          file: relativePath,
          line: lineNum,
          type: "ts_ignore",
          severity: "medium",
          code: line.trim().substring(0, 80),
        });
      }

      // Check for missing return types on exported functions
      const exportFuncMatch = line.match(/export\s+(async\s+)?function\s+\w+\s*\([^)]*\)\s*{/);
      if (exportFuncMatch && !line.includes("):")) {
        issues.push({
          file: relativePath,
          line: lineNum,
          type: "missing_return_type",
          severity: "low",
          code: line.trim().substring(0, 80),
        });
      }

      // Check arrow function exports without return type
      const exportArrowMatch = line.match(/export\s+const\s+\w+\s*=\s*(\([^)]*\)|[^=]+)\s*=>/);
      if (exportArrowMatch && !line.includes("):") && !line.includes(": ")) {
        issues.push({
          file: relativePath,
          line: lineNum,
          type: "missing_return_type",
          severity: "low",
          code: line.trim().substring(0, 80),
        });
      }
    }
  }

  // Sort by severity (high first)
  const severityOrder = { high: 0, medium: 1, low: 2 };
  issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return issues;
}

// ============================================================================
// Unused Exports Detection (via knip or fallback)
// ============================================================================

async function analyzeUnusedExports(
  basePath: string
): Promise<UnusedExport[]> {
  const unused: UnusedExport[] = [];

  // Try to run knip if available
  try {
    const proc = Bun.spawn(["bunx", "knip", "--reporter", "json"], {
      cwd: basePath,
      stdout: "pipe",
      stderr: "pipe",
    });

    const output = await new Response(proc.stdout).text();
    const exitCode = await proc.exited;

    if (exitCode === 0 && output.trim()) {
      try {
        const knipResult = JSON.parse(output);

        // Parse knip output format
        if (knipResult.files) {
          for (const file of knipResult.files) {
            unused.push({
              file: file,
              name: "(entire file)",
              type: "function",
            });
          }
        }

        if (knipResult.exports) {
          for (const [file, exports] of Object.entries(knipResult.exports)) {
            for (const exp of exports as string[]) {
              unused.push({
                file,
                name: exp,
                type: "function", // knip doesn't distinguish
              });
            }
          }
        }

        return unused;
      } catch {
        // JSON parse failed, continue to fallback
      }
    }
  } catch {
    // knip not available or failed
  }

  // Fallback: basic unused export detection
  // This is simpler but catches obvious cases
  return await fallbackUnusedExportDetection(basePath);
}

async function fallbackUnusedExportDetection(
  basePath: string
): Promise<UnusedExport[]> {
  const unused: UnusedExport[] = [];
  const files = await findFiles(basePath);

  // Collect all exports
  const exports = new Map<string, { file: string; type: string }>();
  const allContent: string[] = [];

  for (const file of files) {
    const content = await readFile(file, "utf-8");
    allContent.push(content);
    const relativePath = relative(basePath, file);

    // Match exported names
    const exportMatches = content.matchAll(
      /export\s+(?:const|let|function|class|type|interface|enum)\s+(\w+)/g
    );

    for (const match of exportMatches) {
      const name = match[1];
      if (!exports.has(name)) {
        exports.set(name, { file: relativePath, type: "function" });
      }
    }
  }

  // Check if exports are used anywhere
  const combinedContent = allContent.join("\n");

  for (const [name, info] of exports) {
    // Count occurrences (should be at least 2: export + usage)
    const regex = new RegExp(`\\b${name}\\b`, "g");
    const matches = combinedContent.match(regex);

    if (!matches || matches.length <= 1) {
      unused.push({
        file: info.file,
        name,
        type: info.type as UnusedExport["type"],
      });
    }
  }

  return unused;
}

// ============================================================================
// Health Score Calculation
// ============================================================================

function calculateHealthScore(result: Omit<AuditResult, "score">): number {
  let score = 100;

  // Large files: -2 points each (max -20)
  const largeFilePenalty = Math.min(result.largeFiles.length * 2, 20);
  score -= largeFilePenalty;

  // Duplicates: -5 points each (max -25)
  const duplicatePenalty = Math.min(result.duplicates.length * 5, 25);
  score -= duplicatePenalty;

  // Unused exports: -1 point each (max -30)
  const unusedPenalty = Math.min(result.unusedExports.length, 30);
  score -= unusedPenalty;

  // Type issues: -3 high, -2 medium, -1 low (max -25)
  let typePenalty = 0;
  for (const issue of result.typeIssues) {
    if (issue.severity === "high") typePenalty += 3;
    else if (issue.severity === "medium") typePenalty += 2;
    else typePenalty += 1;
  }
  typePenalty = Math.min(typePenalty, 25);
  score -= typePenalty;

  return Math.max(0, score);
}

// ============================================================================
// Output Formatters
// ============================================================================

// ANSI colors for terminal output
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

function formatTerminal(result: AuditResult): void {
  const { bold, dim, red, green, yellow, blue, cyan, reset } = colors;

  console.log();
  console.log(`${bold}${cyan}═══════════════════════════════════════════════════════════════${reset}`);
  console.log(`${bold}${cyan}  CodeAudit Report: ${result.projectName}${reset}`);
  console.log(`${bold}${cyan}═══════════════════════════════════════════════════════════════${reset}`);
  console.log();

  // Summary
  console.log(`${bold}Summary${reset}`);
  console.log(`${dim}─────────────────────────────────────────────────────────────────${reset}`);
  console.log(`  Files Analyzed: ${result.filesAnalyzed}`);
  console.log(`  Total Lines:    ${result.totalLines.toLocaleString()}`);
  console.log(`  Timestamp:      ${result.timestamp}`);
  console.log();

  // Health Score
  const scoreColor = result.score >= 90 ? green : result.score >= 70 ? yellow : red;
  const scoreEmoji = result.score >= 90 ? "excellent" : result.score >= 70 ? "good" : result.score >= 50 ? "fair" : "poor";
  console.log(`${bold}Health Score: ${scoreColor}${result.score}/100${reset} (${scoreEmoji})`);
  console.log();

  // Large Files
  console.log(`${bold}${yellow}Large Files (${result.largeFiles.length} found)${reset}`);
  console.log(`${dim}─────────────────────────────────────────────────────────────────${reset}`);
  if (result.largeFiles.length === 0) {
    console.log(`  ${green}No large files found${reset}`);
  } else {
    for (const file of result.largeFiles.slice(0, 10)) {
      console.log(`  ${file.path}`);
      console.log(`    ${dim}${file.lines} lines - ${file.recommendation}${reset}`);
    }
    if (result.largeFiles.length > 10) {
      console.log(`  ${dim}... and ${result.largeFiles.length - 10} more${reset}`);
    }
  }
  console.log();

  // Duplicates
  console.log(`${bold}${yellow}Duplicate Patterns (${result.duplicates.length} found)${reset}`);
  console.log(`${dim}─────────────────────────────────────────────────────────────────${reset}`);
  if (result.duplicates.length === 0) {
    console.log(`  ${green}No significant duplicates found${reset}`);
  } else {
    for (const dup of result.duplicates.slice(0, 5)) {
      console.log(`  Found in ${dup.occurrences.length} files:`);
      for (const occ of dup.occurrences) {
        console.log(`    ${dim}${occ.file}:${occ.line}${reset}`);
      }
      console.log(`    ${blue}Suggestion: ${dup.suggestion}${reset}`);
      console.log();
    }
    if (result.duplicates.length > 5) {
      console.log(`  ${dim}... and ${result.duplicates.length - 5} more${reset}`);
    }
  }
  console.log();

  // Type Issues
  const highCount = result.typeIssues.filter(i => i.severity === "high").length;
  const medCount = result.typeIssues.filter(i => i.severity === "medium").length;
  const lowCount = result.typeIssues.filter(i => i.severity === "low").length;

  console.log(`${bold}${yellow}Type Safety Issues (${result.typeIssues.length} found)${reset}`);
  console.log(`${dim}─────────────────────────────────────────────────────────────────${reset}`);
  console.log(`  ${red}High: ${highCount}${reset}  ${yellow}Medium: ${medCount}${reset}  ${dim}Low: ${lowCount}${reset}`);
  if (result.typeIssues.length > 0) {
    console.log();
    for (const issue of result.typeIssues.filter(i => i.severity === "high").slice(0, 5)) {
      const severityColor = red;
      console.log(`  ${severityColor}[${issue.severity.toUpperCase()}]${reset} ${issue.file}:${issue.line}`);
      console.log(`    ${dim}${issue.type}: ${issue.code}${reset}`);
    }
    if (highCount > 5) {
      console.log(`  ${dim}... and ${highCount - 5} more high severity issues${reset}`);
    }
  }
  console.log();

  // Unused Exports
  console.log(`${bold}${yellow}Unused Exports (${result.unusedExports.length} found)${reset}`);
  console.log(`${dim}─────────────────────────────────────────────────────────────────${reset}`);
  if (result.unusedExports.length === 0) {
    console.log(`  ${green}No unused exports found${reset}`);
  } else {
    for (const exp of result.unusedExports.slice(0, 10)) {
      console.log(`  ${exp.file}: ${cyan}${exp.name}${reset}`);
    }
    if (result.unusedExports.length > 10) {
      console.log(`  ${dim}... and ${result.unusedExports.length - 10} more${reset}`);
    }
  }
  console.log();

  console.log(`${bold}${cyan}═══════════════════════════════════════════════════════════════${reset}`);
  console.log();
}

function formatJson(result: AuditResult): void {
  console.log(JSON.stringify(result, null, 2));
}

async function formatReport(result: AuditResult): Promise<string> {
  const lines: string[] = [];

  lines.push(`# Code Audit: ${result.projectName}`);
  lines.push("");
  lines.push(`**Date:** ${result.timestamp} | **Files:** ${result.filesAnalyzed} | **Lines:** ${result.totalLines.toLocaleString()} | **Health Score:** ${result.score}/100`);
  lines.push("");

  // Score interpretation
  const scoreLabel = result.score >= 90 ? "Excellent" : result.score >= 70 ? "Good" : result.score >= 50 ? "Fair" : "Poor";
  lines.push(`## Health Score: ${result.score}/100 (${scoreLabel})`);
  lines.push("");

  // Summary table
  lines.push("### Summary");
  lines.push("");
  lines.push("| Category | Count | Impact |");
  lines.push("|----------|-------|--------|");
  lines.push(`| Large Files | ${result.largeFiles.length} | ${result.largeFiles.length > 0 ? "Needs attention" : "OK"} |`);
  lines.push(`| Duplicate Patterns | ${result.duplicates.length} | ${result.duplicates.length > 0 ? "Needs extraction" : "OK"} |`);
  lines.push(`| Unused Exports | ${result.unusedExports.length} | ${result.unusedExports.length > 0 ? "Dead code" : "OK"} |`);
  lines.push(`| Type Issues (High) | ${result.summary.typeIssuesHigh} | ${result.summary.typeIssuesHigh > 0 ? "Critical" : "OK"} |`);
  lines.push(`| Type Issues (Medium) | ${result.summary.typeIssuesMedium} | ${result.summary.typeIssuesMedium > 0 ? "Should fix" : "OK"} |`);
  lines.push(`| Type Issues (Low) | ${result.summary.typeIssuesLow} | ${result.summary.typeIssuesLow > 0 ? "Nice to fix" : "OK"} |`);
  lines.push("");

  // Large Files
  lines.push("## Large Files");
  lines.push("");
  if (result.largeFiles.length === 0) {
    lines.push("No large files found.");
  } else {
    lines.push("| File | Lines | Recommendation |");
    lines.push("|------|-------|----------------|");
    for (const file of result.largeFiles) {
      lines.push(`| ${file.path} | ${file.lines} | ${file.recommendation} |`);
    }
  }
  lines.push("");

  // Duplicates
  lines.push("## Duplicate Patterns");
  lines.push("");
  if (result.duplicates.length === 0) {
    lines.push("No significant duplicate patterns found.");
  } else {
    for (const dup of result.duplicates) {
      lines.push(`### Pattern found in ${dup.occurrences.length} files`);
      lines.push("");
      lines.push("**Locations:**");
      for (const occ of dup.occurrences) {
        lines.push(`- \`${occ.file}:${occ.line}\``);
      }
      lines.push("");
      lines.push(`**Suggestion:** ${dup.suggestion}`);
      lines.push("");
    }
  }

  // Type Issues
  lines.push("## Type Safety Issues");
  lines.push("");
  if (result.typeIssues.length === 0) {
    lines.push("No type safety issues found.");
  } else {
    // Group by severity
    for (const severity of ["high", "medium", "low"] as const) {
      const issues = result.typeIssues.filter(i => i.severity === severity);
      if (issues.length > 0) {
        const emoji = severity === "high" ? "🔴" : severity === "medium" ? "🟡" : "🟢";
        lines.push(`### ${emoji} ${severity.charAt(0).toUpperCase() + severity.slice(1)} Severity (${issues.length})`);
        lines.push("");
        lines.push("| File | Line | Type | Code |");
        lines.push("|------|------|------|------|");
        for (const issue of issues.slice(0, 20)) {
          lines.push(`| ${issue.file} | ${issue.line} | ${issue.type} | \`${issue.code.replace(/\|/g, "\\|")}\` |`);
        }
        if (issues.length > 20) {
          lines.push(`| ... | ... | ... | *${issues.length - 20} more* |`);
        }
        lines.push("");
      }
    }
  }

  // Unused Exports
  lines.push("## Unused Exports");
  lines.push("");
  if (result.unusedExports.length === 0) {
    lines.push("No unused exports found.");
  } else {
    lines.push("| File | Export |");
    lines.push("|------|--------|");
    for (const exp of result.unusedExports) {
      lines.push(`| ${exp.file} | ${exp.name} |`);
    }
  }
  lines.push("");

  // Footer
  lines.push("---");
  lines.push(`*Generated by CodeAudit on ${result.timestamp}*`);

  return lines.join("\n");
}

async function saveReport(result: AuditResult): Promise<string> {
  const paiDir = process.env.PAI_DIR || `${process.env.HOME}/.claude`;
  const date = new Date();
  const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  const reportDir = join(paiDir, "History", "Audits", yearMonth);

  await mkdir(reportDir, { recursive: true });

  const reportContent = await formatReport(result);
  const filename = `${result.projectName}-audit-${date.toISOString().split("T")[0]}.md`;
  const reportPath = join(reportDir, filename);

  await writeFile(reportPath, reportContent);

  return reportPath;
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  const config = parseArgs();
  if (!config) return; // --help was shown

  const absolutePath = config.path.startsWith("/")
    ? config.path
    : join(process.cwd(), config.path);

  if (!existsSync(absolutePath)) {
    console.error(`Error: Path does not exist: ${absolutePath}`);
    process.exit(1);
  }

  const projectName = basename(absolutePath) || "project";

  if (!config.json) {
    console.log(`\nAnalyzing ${projectName}...`);
  }

  // Discover files
  const files = await findFiles(absolutePath);

  if (files.length === 0) {
    console.error("No TypeScript/JavaScript files found in the specified path.");
    process.exit(1);
  }

  if (!config.json) {
    console.log(`Found ${files.length} files to analyze.`);
  }

  // Run analyses in parallel
  const [largeFileResult, duplicates, typeIssues, unusedExports] = await Promise.all([
    analyzeLargeFiles(files, config.threshold, absolutePath),
    analyzeDuplicates(files, absolutePath),
    analyzeTypeSafety(files, absolutePath),
    analyzeUnusedExports(absolutePath),
  ]);

  // Build result object
  const partialResult = {
    projectPath: absolutePath,
    projectName,
    timestamp: new Date().toISOString(),
    filesAnalyzed: files.length,
    totalLines: largeFileResult.totalLines,
    largeFiles: largeFileResult.largeFiles,
    duplicates,
    unusedExports,
    typeIssues,
    summary: {
      largeFilesCount: largeFileResult.largeFiles.length,
      duplicatesCount: duplicates.length,
      unusedExportsCount: unusedExports.length,
      typeIssuesHigh: typeIssues.filter(i => i.severity === "high").length,
      typeIssuesMedium: typeIssues.filter(i => i.severity === "medium").length,
      typeIssuesLow: typeIssues.filter(i => i.severity === "low").length,
    },
  };

  const result: AuditResult = {
    ...partialResult,
    score: calculateHealthScore(partialResult),
  };

  // Output results
  if (config.json) {
    formatJson(result);
  } else {
    formatTerminal(result);

    if (config.report) {
      const reportPath = await saveReport(result);
      console.log(`Report saved to: ${reportPath}`);
      console.log();
    }
  }
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
