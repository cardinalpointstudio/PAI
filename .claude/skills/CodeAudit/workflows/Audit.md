# Audit Workflow

Execute a comprehensive code audit on a TypeScript/JavaScript codebase.

## When to Use

- User says "audit code", "code health", "check quality"
- User wants to find technical debt
- User is planning a cleanup or refactoring effort
- User asks about dead code or unused exports

## Execution Steps

### Step 1: Identify Target

Ask the user for the target directory if not specified:
- Default to current working directory
- Common patterns: `./src`, `./app`, `./packages`

### Step 2: Run the Audit

```bash
bun ~/.claude/skills/CodeAudit/tools/audit-code.ts <target> --report
```

This generates:
- Interactive terminal output with health score
- Markdown report saved to `~/.claude/History/Audits/`

### Step 3: Interpret Results

Present findings in priority order:

1. **Health Score** - Overall codebase health (0-100)
2. **High Severity Type Issues** - Fix these first (any in exports, unsafe casts)
3. **Unused Exports** - Dead code to remove
4. **Large Files** - Components to split
5. **Duplicate Patterns** - Code to extract

### Step 4: Recommend Next Steps

Based on findings, suggest:

| Finding | Recommended Skill |
|---------|-------------------|
| Large components | Refactor (ExtractComponent) |
| Duplicate code | Refactor (ExtractFunction) |
| Type issues | Manual fixes with guidance |
| Unused exports | Direct removal |

## Output Format

```
Running the **Audit** workflow from the **CodeAudit** skill...

[Terminal output from audit-code.ts]

## Summary

**Health Score: XX/100** (excellent/good/fair/poor)

### Priority Actions

1. [Most impactful fix]
2. [Second priority]
3. [Third priority]

### Report Saved

Full report: ~/.claude/History/Audits/YYYY-MM/project-audit-YYYY-MM-DD.md
```

## Example Invocations

**Full audit:**
```
User: "Audit my codebase"
→ Run audit on ./ with --report flag
→ Present summary and priority actions
```

**Quick check:**
```
User: "Any dead code in src/?"
→ Run audit on ./src with JSON output
→ Focus on unused exports section
```

**Type safety focus:**
```
User: "Check for any usage"
→ Run audit
→ Filter to type issues only in output
```

## Integration

After audit completes, the user may want to:

1. **Start cleanup** → Use Refactor skill for each issue
2. **Track progress** → Re-run audit after fixes
3. **Set baseline** → Save score for comparison
4. **CI integration** → Use `--json` in pipelines
