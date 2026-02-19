# PAI CompoundEngineering Skill Verification

> **MANDATORY:** All checks must pass before installation is complete.

---

## Quick Verification

```bash
# Run these commands to verify installation
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

ls "$PAI_DIR/skills/CompoundEngineering/SKILL.md" && echo "✓ SKILL.md exists"
ls "$PAI_DIR/skills/CompoundEngineering/ReviewPatterns.md" && echo "✓ ReviewPatterns.md exists"
ls "$PAI_DIR/skills/CompoundEngineering/workflows/" && echo "✓ workflows directory exists"
ls "$PAI_DIR/skills/CompoundEngineering/templates/" && echo "✓ templates directory exists"
ls "$PAI_DIR/skills/CompoundEngineering/tools/" && echo "✓ tools directory exists"
ls "$PAI_DIR/skills/CompoundEngineering/workflows/"*.md | wc -l | xargs -I {} echo "✓ {} workflow files found"
```

---

## Detailed Checklist

### 1. File Structure

| # | Check | Command | Pass Criteria | Status |
|---|-------|---------|---------------|--------|
| 1 | SKILL.md exists | `ls ~/.claude/skills/CompoundEngineering/SKILL.md` | File present | [ ] |
| 2 | ReviewPatterns.md exists | `ls ~/.claude/skills/CompoundEngineering/ReviewPatterns.md` | File present | [ ] |
| 3 | workflows directory | `ls ~/.claude/skills/CompoundEngineering/workflows/` | Directory exists | [ ] |
| 4 | templates directory | `ls ~/.claude/skills/CompoundEngineering/templates/` | Directory exists | [ ] |
| 5 | tools directory | `ls ~/.claude/skills/CompoundEngineering/tools/` | Directory exists | [ ] |

### 2. Workflow Files

| # | Check | Command | Pass Criteria | Status |
|---|-------|---------|---------------|--------|
| 1 | Plan.md | `ls ~/.claude/skills/CompoundEngineering/workflows/Plan.md` | File present | [ ] |
| 2 | Review.md | `ls ~/.claude/skills/CompoundEngineering/workflows/Review.md` | File present | [ ] |
| 3 | Compound.md | `ls ~/.claude/skills/CompoundEngineering/workflows/Compound.md` | File present | [ ] |
| 4 | Orchestrate.md | `ls ~/.claude/skills/CompoundEngineering/workflows/Orchestrate.md` | File present | [ ] |

### 3. Template Files

| # | Check | Command | Pass Criteria | Status |
|---|-------|---------|---------------|--------|
| 1 | task-file.md | `ls ~/.claude/skills/CompoundEngineering/templates/task-file.md` | File present | [ ] |
| 2 | PLAN-example.md | `ls ~/.claude/skills/CompoundEngineering/templates/PLAN-example.md` | File present | [ ] |
| 3 | contracts-example.ts | `ls ~/.claude/skills/CompoundEngineering/templates/contracts-example.ts` | File present | [ ] |

### 4. Tool Files

| # | Check | Command | Pass Criteria | Status |
|---|-------|---------|---------------|--------|
| 1 | compound-start.sh | `ls ~/.claude/skills/CompoundEngineering/tools/compound-start.sh` | File present | [ ] |
| 2 | ce-stop.sh | `ls ~/.claude/skills/CompoundEngineering/tools/ce-stop.sh` | File present | [ ] |
| 3 | orchestrate.ts | `ls ~/.claude/skills/CompoundEngineering/tools/orchestrate.ts` | File present | [ ] |

### 5. Functionality Tests

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Test 1: Check skill triggers are documented
grep -q "USE WHEN" "$PAI_DIR/skills/CompoundEngineering/SKILL.md" && echo "✓ USE WHEN triggers present"

# Test 2: Check workflow routing table exists
grep -q "Plan" "$PAI_DIR/skills/CompoundEngineering/SKILL.md" && echo "✓ Workflow routing present"

# Test 3: Check review patterns are documented
grep -q "Security" "$PAI_DIR/skills/CompoundEngineering/ReviewPatterns.md" && echo "✓ Security patterns documented"
grep -q "Performance" "$PAI_DIR/skills/CompoundEngineering/ReviewPatterns.md" && echo "✓ Performance patterns documented"
grep -q "Correctness" "$PAI_DIR/skills/CompoundEngineering/ReviewPatterns.md" && echo "✓ Correctness patterns documented"

# Test 4: Verify all workflows have step-by-step structure
grep -q "Step 1" "$PAI_DIR/skills/CompoundEngineering/workflows/Plan.md" && echo "✓ Plan.md has steps"
grep -q "Step 1" "$PAI_DIR/skills/CompoundEngineering/workflows/Review.md" && echo "✓ Review.md has steps"
grep -q "Step 1" "$PAI_DIR/skills/CompoundEngineering/workflows/Compound.md" && echo "✓ Compound.md has steps"

# Test 5: Check tools are executable
[ -x "$PAI_DIR/skills/CompoundEngineering/tools/compound-start.sh" ] && echo "✓ compound-start.sh executable"
[ -x "$PAI_DIR/skills/CompoundEngineering/tools/ce-stop.sh" ] && echo "✓ ce-stop.sh executable"
[ -x "$PAI_DIR/skills/CompoundEngineering/tools/orchestrate.ts" ] && echo "✓ orchestrate.ts executable"
```

### 6. Integration Test

Ask the AI: "What CompoundEngineering workflows are available?"

Expected response should mention:
- Plan - design implementation before coding
- Review - multi-agent parallel code review
- Compound - capture learnings
- Orchestrate - parallel worker coordination with tmux

### 7. Orchestrate Prerequisites (Optional)

```bash
# Check dependencies for Orchestrate workflow
command -v tmux >/dev/null 2>&1 && echo "✓ tmux installed" || echo "⚠ tmux missing (needed for Orchestrate)"
command -v gh >/dev/null 2>&1 && echo "✓ gh installed" || echo "⚠ gh missing (needed for PR creation)"
command -v bun >/dev/null 2>&1 && echo "✓ bun installed" || echo "⚠ bun missing (needed for orchestrator)"
```

### 8. Tool Execution Test (Optional)

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Test orchestrator help
"$PAI_DIR/skills/CompoundEngineering/tools/orchestrate.ts" --help 2>/dev/null || \
"$PAI_DIR/skills/CompoundEngineering/tools/orchestrate.ts" 2>&1 | head -3

# Note: This may error without .workflow/ directory - that's expected
```

---

## Verification Complete

When all checks pass:
- [ ] All file structure checks passed
- [ ] All workflow files present
- [ ] All template files present
- [ ] All tool files present
- [ ] All functionality tests passed
- [ ] Integration test successful
- [ ] Tools are executable

**Installation verified. CompoundEngineering skill is ready for use.**

**Optional dependencies:**
- tmux: Required for Orchestrate workflow
- gh: Required for automatic PR creation
- bun: Required for orchestrator CLI
