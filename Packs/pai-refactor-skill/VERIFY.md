# PAI Refactor Skill Verification

> **MANDATORY:** All checks must pass before installation is complete.

---

## Quick Verification

```bash
# Run these commands to verify installation
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

ls "$PAI_DIR/skills/Refactor/SKILL.md" && echo "✓ SKILL.md exists"
ls "$PAI_DIR/skills/Refactor/RefactorPatterns.md" && echo "✓ RefactorPatterns.md exists"
ls "$PAI_DIR/skills/Refactor/workflows/" && echo "✓ workflows directory exists"
ls "$PAI_DIR/skills/Refactor/workflows/"*.md | wc -l | xargs -I {} echo "✓ {} workflow files found"
```

---

## Detailed Checklist

### 1. File Structure

| # | Check | Command | Pass Criteria | Status |
|---|-------|---------|---------------|--------|
| 1 | SKILL.md exists | `ls ~/.claude/skills/Refactor/SKILL.md` | File present | [ ] |
| 2 | RefactorPatterns.md exists | `ls ~/.claude/skills/Refactor/RefactorPatterns.md` | File present | [ ] |
| 3 | workflows directory | `ls ~/.claude/skills/Refactor/workflows/` | Directory exists | [ ] |
| 4 | ExtractFunction.md | `ls ~/.claude/skills/Refactor/workflows/ExtractFunction.md` | File present | [ ] |
| 5 | Rename.md | `ls ~/.claude/skills/Refactor/workflows/Rename.md` | File present | [ ] |
| 6 | MoveModule.md | `ls ~/.claude/skills/Refactor/workflows/MoveModule.md` | File present | [ ] |

### 2. Functionality Tests

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Test 1: Check skill triggers are documented
grep -q "USE WHEN" "$PAI_DIR/skills/Refactor/SKILL.md" && echo "✓ USE WHEN triggers present"

# Test 2: Check workflow routing table exists
grep -q "ExtractFunction" "$PAI_DIR/skills/Refactor/SKILL.md" && echo "✓ Workflow routing present"

# Test 3: Check refactoring process is documented
grep -q "Tests" "$PAI_DIR/skills/Refactor/SKILL.md" && echo "✓ Refactoring process documented"

# Test 4: Verify all workflows have step-by-step structure
grep -q "Step 1" "$PAI_DIR/skills/Refactor/workflows/ExtractFunction.md" && echo "✓ ExtractFunction has steps"
grep -q "Step 1" "$PAI_DIR/skills/Refactor/workflows/Rename.md" && echo "✓ Rename has steps"
grep -q "Step 1" "$PAI_DIR/skills/Refactor/workflows/MoveModule.md" && echo "✓ MoveModule has steps"
```

### 3. Integration Test

Ask the AI: "What refactoring workflows are available?"

Expected response should mention:
- ExtractFunction - extract code into functions
- Rename - rename symbols across codebase
- MoveModule - move files and update imports

### 4. Workflow Content Tests

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Check ExtractFunction has extraction patterns
grep -q "Extract" "$PAI_DIR/skills/Refactor/workflows/ExtractFunction.md" && echo "✓ Extract patterns documented"

# Check Rename has usage finding
grep -q "Find All Usages" "$PAI_DIR/skills/Refactor/workflows/Rename.md" && echo "✓ Usage finding documented"

# Check MoveModule has import updates
grep -q "Update All Imports" "$PAI_DIR/skills/Refactor/workflows/MoveModule.md" && echo "✓ Import updates documented"

# Check RefactorPatterns has code smells
grep -q "Code Smells" "$PAI_DIR/skills/Refactor/RefactorPatterns.md" && echo "✓ Code smells documented"
grep -q "Long Function" "$PAI_DIR/skills/Refactor/RefactorPatterns.md" && echo "✓ Long Function smell documented"
```

---

## Verification Complete

When all checks pass:
- [ ] All file structure checks passed
- [ ] All functionality tests passed
- [ ] Integration test successful
- [ ] Workflow content tests passed

**Installation verified. Refactor skill is ready for use.**
