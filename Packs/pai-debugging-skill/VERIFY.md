# PAI Debugging Skill Verification

> **MANDATORY:** All checks must pass before installation is complete.

---

## Quick Verification

```bash
# Run these commands to verify installation
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

ls "$PAI_DIR/skills/Debugging/SKILL.md" && echo "✓ SKILL.md exists"
ls "$PAI_DIR/skills/Debugging/workflows/" && echo "✓ workflows directory exists"
ls "$PAI_DIR/skills/Debugging/workflows/"*.md | wc -l | xargs -I {} echo "✓ {} workflow files found"
```

---

## Detailed Checklist

### 1. File Structure

| # | Check | Command | Pass Criteria | Status |
|---|-------|---------|---------------|--------|
| 1 | SKILL.md exists | `ls ~/.claude/skills/Debugging/SKILL.md` | File present | [ ] |
| 2 | workflows directory | `ls ~/.claude/skills/Debugging/workflows/` | Directory exists | [ ] |
| 3 | Investigate.md | `ls ~/.claude/skills/Debugging/workflows/Investigate.md` | File present | [ ] |
| 4 | AnalyzeError.md | `ls ~/.claude/skills/Debugging/workflows/AnalyzeError.md` | File present | [ ] |
| 5 | CreateMRE.md | `ls ~/.claude/skills/Debugging/workflows/CreateMRE.md` | File present | [ ] |

### 2. Functionality Tests

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Test 1: Check skill triggers are documented
grep -q "USE WHEN" "$PAI_DIR/skills/Debugging/SKILL.md" && echo "✓ USE WHEN triggers present"

# Test 2: Check workflow routing table exists
grep -q "Investigate" "$PAI_DIR/skills/Debugging/SKILL.md" && echo "✓ Workflow routing present"

# Test 3: Verify debugging process is documented
grep -q "Reproduce" "$PAI_DIR/skills/Debugging/SKILL.md" && echo "✓ Debugging process documented"

# Test 4: Verify all workflows have step-by-step structure
grep -q "Step 1" "$PAI_DIR/skills/Debugging/workflows/Investigate.md" && echo "✓ Investigate has steps"
grep -q "Step 1" "$PAI_DIR/skills/Debugging/workflows/AnalyzeError.md" && echo "✓ AnalyzeError has steps"
grep -q "Step 1" "$PAI_DIR/skills/Debugging/workflows/CreateMRE.md" && echo "✓ CreateMRE has steps"
```

### 3. Integration Test

Ask the AI: "What debugging workflows are available?"

Expected response should mention:
- Investigate - full debugging process
- AnalyzeError - error and stack trace analysis
- CreateMRE - minimum reproducible example

### 4. Workflow Content Tests

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Check Investigate has the five phases
grep -q "Reproduce" "$PAI_DIR/skills/Debugging/workflows/Investigate.md" && echo "✓ Reproduce phase documented"
grep -q "Isolate" "$PAI_DIR/skills/Debugging/workflows/Investigate.md" && echo "✓ Isolate phase documented"
grep -q "Fix" "$PAI_DIR/skills/Debugging/workflows/Investigate.md" && echo "✓ Fix phase documented"
grep -q "Verify" "$PAI_DIR/skills/Debugging/workflows/Investigate.md" && echo "✓ Verify phase documented"

# Check AnalyzeError has error patterns
grep -q "TypeError" "$PAI_DIR/skills/Debugging/workflows/AnalyzeError.md" && echo "✓ Error patterns documented"

# Check CreateMRE explains what MRE is
grep -q "Minimum Reproducible Example" "$PAI_DIR/skills/Debugging/workflows/CreateMRE.md" && echo "✓ MRE explained"
```

---

## Verification Complete

When all checks pass:
- [ ] All file structure checks passed
- [ ] All functionality tests passed
- [ ] Integration test successful
- [ ] Workflow content tests passed

**Installation verified. Debugging skill is ready for use.**
