---
name: PAI CodeAudit Skill
pack-id: pai-codeaudit-skill-v1.0.0
version: 1.0.0
author: salexanderb
description: Automated codebase health analysis for TypeScript/JavaScript projects. Analyzes file sizes, duplicate patterns, unused exports, and type safety issues to generate prioritized cleanup reports with health scores.
type: skill
purpose-type: [code-quality, technical-debt, analysis, cleanup]
platform: claude-code
dependencies: []
keywords: [audit, code-quality, technical-debt, dead-code, unused-exports, type-safety, refactoring, cleanup]
---

# PAI CodeAudit Skill

> Automated codebase health analysis for TypeScript/JavaScript projects. Generates health scores and prioritized cleanup reports.

> **Installation:** This pack is designed for AI-assisted installation. Give this directory to your AI and ask it to install using `INSTALL.md`.

---

## What This Pack Provides

- **Health Score** - 0-100 score based on weighted analysis of issues
- **Large File Detection** - Files over threshold (default: 400 lines)
- **Duplicate Code Detection** - Repeated patterns across files
- **Type Safety Analysis** - `any`, unsafe casts, `@ts-ignore`, missing return types
- **Unused Export Detection** - Dead code via knip (with fallback)
- **Three Output Formats** - Terminal (interactive), JSON (CI), Markdown (reports)

## Key Differentiator

**Measure before you clean.** Don't guess at what needs fixing. Run an audit to identify the highest-impact cleanup opportunities, then tackle them systematically.

## Architecture

```
CodeAudit Skill
├── SKILL.md                     # Main entry point and routing
└── workflows/
    └── Audit.md                 # Full audit workflow

Tools/
└── audit-code.ts                # CLI tool (model-agnostic)
```

## CLI Tool

The core functionality is in a standalone CLI that any model can use:

```bash
# Basic audit (interactive terminal output)
bun audit-code.ts ./src

# JSON output for CI/pipelines
bun audit-code.ts ./src --json

# Generate markdown report (saved to History)
bun audit-code.ts ./src --report

# Custom line threshold
bun audit-code.ts ./src --threshold 300

# Show help
bun audit-code.ts --help
```

## What Gets Analyzed

| Category | Detection | Severity |
|----------|-----------|----------|
| **Large Files** | Files over 400 lines | Medium |
| **Duplicate Code** | Repeated patterns (6+ lines) | High |
| **Unused Exports** | Dead code | High |
| **Type Issues** | `any`, casts, `@ts-ignore` | Variable |

### Type Safety Severity Levels

| Issue | Severity | Why |
|-------|----------|-----|
| `any` in exported function params | High | API contract is broken |
| Unsafe casts (`as any`, `as unknown as T`) | High | Bypasses type system |
| `@ts-ignore` / `@ts-expect-error` | Medium | Suppressing real errors |
| Missing return types on exports | Low | Implicit contracts |

## Health Score Calculation

| Factor | Weight | Scoring |
|--------|--------|---------|
| Large Files | 20% | -2 points per file over threshold |
| Duplicate Code | 25% | -5 points per duplicate pattern |
| Unused Exports | 30% | -1 point per unused export |
| Type Safety | 25% | -3 high, -2 medium, -1 low |

**Score Interpretation:**
- 90-100: Excellent - minimal technical debt
- 70-89: Good - some cleanup needed
- 50-69: Fair - significant debt accumulating
- Below 50: Poor - cleanup should be prioritized

## Usage Examples

```
"Audit my codebase"
-> Runs full audit with --report flag
-> Generates health score and prioritized findings

"Find dead code in src/"
-> Runs audit focused on unused exports

"Check for type safety issues"
-> Runs audit, filters to type issues only
```

## What's Included

| Component | File | Purpose |
|-----------|------|---------|
| Main Skill | src/skills/CodeAudit/SKILL.md | Entry point and workflow routing |
| Audit Workflow | src/skills/CodeAudit/workflows/Audit.md | Full audit execution |
| CLI Tool | src/tools/audit-code.ts | Model-agnostic CLI |

## Model Interoperability

The CLI tool (`audit-code.ts`) is pure TypeScript/Bun with no AI dependencies. Any model can:

1. Run the tool: `bun audit-code.ts ./src --json`
2. Parse the JSON output
3. Interpret findings and suggest fixes

This follows the principle: **Code Before Prompts** - deterministic scaffolding that AI orchestrates.

## Integration

**Works well with:**
- **Refactor** - Use audit findings to guide refactoring
- **TDD** - Ensure tests exist before cleanup
- **CompoundEngineering** - Document cleanup decisions

## Credits

- **Author:** salexanderb
- **License:** MIT

## Changelog

### 1.0.0 - 2026-02-19
- Initial release
- Large file detection (configurable threshold)
- Duplicate code pattern detection
- Type safety analysis (4 issue types, 3 severity levels)
- Unused export detection (knip + fallback)
- Health score calculation
- Three output formats (terminal, JSON, markdown)
