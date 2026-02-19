# PAI TDD Skill Verification

> **MANDATORY:** All checks must pass before installation is complete.

---

## Quick Verification

```bash
# Run these commands to verify installation
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

ls "$PAI_DIR/skills/TDD/SKILL.md" && echo "✓ SKILL.md exists"
ls "$PAI_DIR/skills/TDD/workflows/" && echo "✓ workflows directory exists"
ls "$PAI_DIR/skills/TDD/workflows/"*.md | wc -l | xargs -I {} echo "✓ {} workflow files found"
```

---

## Detailed Checklist

### 1. File Structure

| # | Check | Command | Pass Criteria | Status |
|---|-------|---------|---------------|--------|
| 1 | SKILL.md exists | `ls ~/.claude/skills/TDD/SKILL.md` | File present | [ ] |
| 2 | workflows directory | `ls ~/.claude/skills/TDD/workflows/` | Directory exists | [ ] |
| 3 | RedGreenRefactor.md | `ls ~/.claude/skills/TDD/workflows/RedGreenRefactor.md` | File present | [ ] |
| 4 | WriteTestFirst.md | `ls ~/.claude/skills/TDD/workflows/WriteTestFirst.md` | File present | [ ] |
| 5 | GenerateTests.md | `ls ~/.claude/skills/TDD/workflows/GenerateTests.md` | File present | [ ] |
| 6 | AnalyzeCoverage.md | `ls ~/.claude/skills/TDD/workflows/AnalyzeCoverage.md` | File present | [ ] |

### 2. Functionality Tests

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Test 1: Check skill triggers are documented
grep -q "USE WHEN" "$PAI_DIR/skills/TDD/SKILL.md" && echo "✓ USE WHEN triggers present"

# Test 2: Check workflow routing table exists
grep -q "RedGreenRefactor" "$PAI_DIR/skills/TDD/SKILL.md" && echo "✓ Workflow routing present"

# Test 3: Verify all workflows have step-by-step structure
grep -q "Step 1" "$PAI_DIR/skills/TDD/workflows/RedGreenRefactor.md" && echo "✓ RedGreenRefactor has steps"
grep -q "Step 1" "$PAI_DIR/skills/TDD/workflows/WriteTestFirst.md" && echo "✓ WriteTestFirst has steps"
grep -q "Step 1" "$PAI_DIR/skills/TDD/workflows/GenerateTests.md" && echo "✓ GenerateTests has steps"
grep -q "Step 1" "$PAI_DIR/skills/TDD/workflows/AnalyzeCoverage.md" && echo "✓ AnalyzeCoverage has steps"
```

### 3. Integration Test

Ask the AI: "What TDD workflows are available?"

Expected response should mention:
- RedGreenRefactor - complete TDD cycle
- WriteTestFirst - generate test specs
- GenerateTests - tests for existing code
- AnalyzeCoverage - find coverage gaps

### 4. Workflow Content Tests

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Check RedGreenRefactor has the three phases
grep -q "RED" "$PAI_DIR/skills/TDD/workflows/RedGreenRefactor.md" && echo "✓ RED phase documented"
grep -q "GREEN" "$PAI_DIR/skills/TDD/workflows/RedGreenRefactor.md" && echo "✓ GREEN phase documented"
grep -q "REFACTOR" "$PAI_DIR/skills/TDD/workflows/RedGreenRefactor.md" && echo "✓ REFACTOR phase documented"

# Check GenerateTests has test templates
grep -q "describe" "$PAI_DIR/skills/TDD/workflows/GenerateTests.md" && echo "✓ Test templates present"

# Check AnalyzeCoverage mentions coverage thresholds
grep -q "coverage" "$PAI_DIR/skills/TDD/workflows/AnalyzeCoverage.md" && echo "✓ Coverage analysis documented"
```

---

## Verification Complete

When all checks pass:
- [ ] All file structure checks passed
- [ ] All functionality tests passed
- [ ] Integration test successful
- [ ] Workflow content tests passed

**Installation verified. TDD skill is ready for use.**
