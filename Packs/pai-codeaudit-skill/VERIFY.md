# PAI CodeAudit Skill Verification

> **MANDATORY:** All checks must pass before installation is complete.

---

## Quick Verification

```bash
# Run these commands to verify installation
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

ls "$PAI_DIR/skills/CodeAudit/SKILL.md" && echo "✓ SKILL.md exists"
ls "$PAI_DIR/skills/CodeAudit/workflows/Audit.md" && echo "✓ Audit.md exists"
ls "$PAI_DIR/tools/audit-code.ts" && echo "✓ CLI tool exists"
bun "$PAI_DIR/tools/audit-code.ts" --help > /dev/null && echo "✓ CLI tool runs"
```

---

## Detailed Checklist

### 1. File Structure

| # | Check | Command | Pass Criteria | Status |
|---|-------|---------|---------------|--------|
| 1 | SKILL.md exists | `ls ~/.claude/skills/CodeAudit/SKILL.md` | File present | [ ] |
| 2 | workflows directory | `ls ~/.claude/skills/CodeAudit/workflows/` | Directory exists | [ ] |
| 3 | Audit.md workflow | `ls ~/.claude/skills/CodeAudit/workflows/Audit.md` | File present | [ ] |
| 4 | CLI tool exists | `ls ~/.claude/tools/audit-code.ts` | File present | [ ] |
| 5 | CLI tool executable | `test -x ~/.claude/tools/audit-code.ts` | Executable | [ ] |

### 2. Functionality Tests

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Test 1: Check skill triggers are documented
grep -q "USE WHEN" "$PAI_DIR/skills/CodeAudit/SKILL.md" && echo "✓ USE WHEN triggers present"

# Test 2: CLI help works
bun "$PAI_DIR/tools/audit-code.ts" --help | grep -q "CodeAudit" && echo "✓ CLI help works"

# Test 3: CLI can analyze a directory (use current dir as test)
bun "$PAI_DIR/tools/audit-code.ts" . --json | grep -q '"score"' && echo "✓ CLI analysis works"
```

### 3. Integration Test

Ask the AI: "What code auditing capabilities do you have?"

Expected response should mention:
- Large file detection
- Duplicate code detection
- Type safety analysis
- Unused export detection
- Health score calculation

### 4. Output Format Tests

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Test JSON output
bun "$PAI_DIR/tools/audit-code.ts" . --json 2>/dev/null | head -1 | grep -q '{' && echo "✓ JSON output valid"

# Test report generation (creates file in History)
bun "$PAI_DIR/tools/audit-code.ts" . --report 2>&1 | grep -q "Report saved" && echo "✓ Report generation works"
```

---

## Verification Complete

When all checks pass:
- [ ] All file structure checks passed
- [ ] All functionality tests passed
- [ ] Integration test successful
- [ ] Output format tests passed

**Installation verified. CodeAudit skill is ready for use.**
