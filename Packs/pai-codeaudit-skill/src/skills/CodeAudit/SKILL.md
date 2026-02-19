---
name: CodeAudit
description: Automated codebase health analysis for TypeScript/JavaScript projects. USE WHEN user says 'audit code', 'find dead code', 'check code quality', 'technical debt', 'code health', 'find unused', 'type safety check', OR user wants to analyze codebase for cleanup opportunities.
---

# CodeAudit

Automated codebase health analysis that identifies cleanup opportunities. Analyzes file sizes, duplicate patterns, unused exports, and type safety issues to generate prioritized cleanup reports.

## Core Principle

**Measure before you clean.** Don't guess at what needs fixing. Run an audit to identify the highest-impact cleanup opportunities, then tackle them systematically.

## The Audit Process

```
┌──────────────┐     ┌─────────────┐     ┌────────────┐     ┌───────────┐
│   Analyze    │ ──▶ │   Score     │ ──▶ │ Prioritize │ ──▶ │  Report   │
│   codebase   │     │   health    │     │   issues   │     │           │
└──────────────┘     └─────────────┘     └────────────┘     └───────────┘
```

1. **Analyze**: Scan codebase for issues across all categories
2. **Score**: Calculate health score based on findings
3. **Prioritize**: Rank issues by severity and impact
4. **Report**: Generate actionable cleanup report

## What Gets Analyzed

| Category | What It Detects | Severity |
|----------|-----------------|----------|
| **Large Files** | Files over 400 lines that need splitting | Medium |
| **Duplicate Code** | Repeated patterns that should be extracted | High |
| **Unused Exports** | Dead code that can be removed | High |
| **Type Safety** | `any`, unsafe casts, `@ts-ignore` | Variable |

### Type Safety Severity Levels

| Issue | Severity | Why |
|-------|----------|-----|
| `any` in exported function params | High | API contract is broken |
| Unsafe casts (`as any`, `as unknown as T`) | High | Bypasses type system |
| `@ts-ignore` / `@ts-expect-error` | Medium | Suppressing real errors |
| Missing return types on exports | Low | Implicit contracts |

## CLI Tool

```bash
# Basic audit (interactive terminal output)
bun ~/.claude/skills/CodeAudit/tools/audit-code.ts ./src

# JSON output for CI/pipelines
bun ~/.claude/skills/CodeAudit/tools/audit-code.ts ./src --json

# Generate markdown report (saved to History)
bun ~/.claude/skills/CodeAudit/tools/audit-code.ts ./src --report

# Custom line threshold
bun ~/.claude/skills/CodeAudit/tools/audit-code.ts ./src --threshold 300

# Show help
bun ~/.claude/skills/CodeAudit/tools/audit-code.ts --help
```

## Workflow Routing

**When executing a workflow, output this notification:**

```
Running the **WorkflowName** workflow from the **CodeAudit** skill...
```

| Workflow | Trigger | File |
|----------|---------|------|
| **Audit** | "audit code", "code health", "check quality" | `workflows/Audit.md` |
| **DeepDive** | "analyze file X", "why is this file so big" | `workflows/DeepDive.md` |

## Examples

**Example 1: Full codebase audit**
```
User: "Audit my codebase for technical debt"
→ Invokes Audit workflow
→ Runs audit-code CLI tool
→ Analyzes all TS/JS files
→ Generates health score and prioritized report
→ Saves report to History
```

**Example 2: Quick check**
```
User: "Find any dead code in src/"
→ Runs audit with focus on unused exports
→ Lists removable code
→ Shows impact on bundle size
```

**Example 3: Type safety audit**
```
User: "Check for type safety issues"
→ Scans for any usage, unsafe casts
→ Categorizes by severity
→ Prioritizes fixes
```

## Health Score Calculation

The health score (0-100) is calculated based on:

| Factor | Weight | Scoring |
|--------|--------|---------|
| Large Files | 20% | -2 points per file over threshold |
| Duplicate Code | 25% | -5 points per duplicate pattern |
| Unused Exports | 30% | -1 point per unused export |
| Type Safety | 25% | -3 points high, -2 medium, -1 low |

**Score Interpretation:**
- 90-100: Excellent - minimal technical debt
- 70-89: Good - some cleanup needed
- 50-69: Fair - significant debt accumulating
- Below 50: Poor - cleanup should be prioritized

## Integration with Other Skills

| Skill | How It Integrates |
|-------|-------------------|
| **Refactor** | Use audit to identify what to refactor |
| **TDD** | Ensure tests exist before cleanup |
| **CompoundEngineering** | Document cleanup decisions |

## Output Formats

### Terminal (Default)
Colorized, formatted output with progress and summaries.

### JSON (`--json`)
```json
{
  "score": 72,
  "largeFiles": [...],
  "duplicates": [...],
  "unusedExports": [...],
  "typeIssues": [...],
  "summary": {...}
}
```

### Markdown Report (`--report`)
Saved to `~/.claude/History/Audits/YYYY-MM/project-audit.md`
