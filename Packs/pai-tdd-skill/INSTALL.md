# PAI TDD Skill v1.0.0 - Installation Guide

**This guide is designed for AI agents installing this pack into a user's infrastructure.**

---

## AI Agent Instructions

**This is a wizard-style installation.** Use Claude Code's native tools to guide the user through installation:

1. **AskUserQuestion** - For user decisions and confirmations
2. **TodoWrite** - For progress tracking
3. **Bash/Read/Write** - For actual installation
4. **VERIFY.md** - For final validation

### Welcome Message

Before starting, greet the user:
```
"I'm installing PAI TDD Skill v1.0.0 - Test-driven development workflows. This skill guides the red-green-refactor cycle for writing reliable, well-tested code.

Let me analyze your system and guide you through installation."
```

---

## Phase 1: System Analysis

**Execute this analysis BEFORE any file operations.**

### 1.1 Run These Commands

```bash
PAI_CHECK="${PAI_DIR:-$HOME/.claude}"
echo "PAI_DIR: $PAI_CHECK"

# Check for existing TDD skill
if [ -d "$PAI_CHECK/skills/TDD" ]; then
  echo "WARNING Existing TDD skill found at: $PAI_CHECK/skills/TDD"
  ls "$PAI_CHECK/skills/TDD/"
else
  echo "OK No existing TDD skill (clean install)"
fi

# Check for Vitest (recommended test runner)
if [ -f "package.json" ]; then
  if grep -q '"vitest"' package.json 2>/dev/null; then
    echo "OK Vitest found in package.json"
  else
    echo "NOTE Vitest not found - TDD skill works best with Vitest"
  fi
else
  echo "NOTE No package.json in current directory"
fi

# Check for testing-library
if [ -f "package.json" ]; then
  if grep -q '@testing-library' package.json 2>/dev/null; then
    echo "OK @testing-library found"
  else
    echo "NOTE @testing-library not found - needed for component tests"
  fi
fi
```

### 1.2 Present Findings

Tell the user what you found:
```
"Here's what I found on your system:
- Existing TDD skill: [Yes / No]
- Vitest: [installed / not found]
- @testing-library: [installed / not found]

Note: The TDD skill will work without these, but some workflows assume Vitest syntax."
```

---

## Phase 2: User Questions

**Use AskUserQuestion tool at each decision point.**

### Question 1: Conflict Resolution (if existing skill found)

**Only ask if existing TDD directory detected:**

```json
{
  "header": "Conflict",
  "question": "Existing TDD skill detected. How should I proceed?",
  "multiSelect": false,
  "options": [
    {"label": "Backup and replace (Recommended)", "description": "Creates timestamped backup, then installs fresh"},
    {"label": "Replace without backup", "description": "Overwrites existing skill files"},
    {"label": "Cancel", "description": "Abort installation"}
  ]
}
```

### Question 2: Final Confirmation

```json
{
  "header": "Install",
  "question": "Ready to install PAI TDD Skill v1.0.0?",
  "multiSelect": false,
  "options": [
    {"label": "Yes, install now (Recommended)", "description": "Proceeds with installation"},
    {"label": "Show me what will change", "description": "Lists all files that will be created"},
    {"label": "Cancel", "description": "Abort installation"}
  ]
}
```

---

## Phase 3: Backup (If Needed)

**Only execute if user chose "Backup and replace":**

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
BACKUP_DIR="$PAI_DIR/Backups/tdd-skill-$(date +%Y%m%d-%H%M%S)"

if [ -d "$PAI_DIR/skills/TDD" ]; then
  mkdir -p "$BACKUP_DIR"
  cp -r "$PAI_DIR/skills/TDD" "$BACKUP_DIR/"
  echo "Backup created at: $BACKUP_DIR"
fi
```

---

## Phase 4: Installation

**Create a TodoWrite list to track progress:**

```json
{
  "todos": [
    {"content": "Create directory structure", "status": "pending", "activeForm": "Creating directory structure"},
    {"content": "Copy skill files from pack", "status": "pending", "activeForm": "Copying skill files"},
    {"content": "Run verification", "status": "pending", "activeForm": "Running verification"}
  ]
}
```

### 4.1 Create Directory Structure

**Mark todo "Create directory structure" as in_progress.**

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
mkdir -p "$PAI_DIR/skills/TDD/workflows"
```

**Mark todo as completed.**

### 4.2 Copy Skill Files

**Mark todo "Copy skill files from pack" as in_progress.**

Copy all files from the pack's `src/skills/TDD/` directory:

```bash
PACK_DIR="$(pwd)"
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

cp -r "$PACK_DIR/src/skills/TDD/"* "$PAI_DIR/skills/TDD/"
```

**Files included:**
- `SKILL.md` - Main skill definition and routing
- `workflows/RedGreenRefactor.md` - Complete TDD cycle
- `workflows/WriteTestFirst.md` - Test spec generation
- `workflows/GenerateTests.md` - Tests for existing code
- `workflows/AnalyzeCoverage.md` - Coverage gap analysis

**Mark todo as completed.**

---

## Phase 5: Verification

**Mark todo "Run verification" as in_progress.**

**Execute all checks from VERIFY.md:**

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

echo "=== PAI TDD Skill v1.0.0 Verification ==="

# Check skill files
echo "Checking skill files..."
[ -f "$PAI_DIR/skills/TDD/SKILL.md" ] && echo "OK SKILL.md" || echo "ERROR SKILL.md missing"
[ -d "$PAI_DIR/skills/TDD/workflows" ] && echo "OK workflows directory" || echo "ERROR workflows directory missing"

# Check workflows
echo ""
echo "Checking workflows..."
[ -f "$PAI_DIR/skills/TDD/workflows/RedGreenRefactor.md" ] && echo "OK RedGreenRefactor.md" || echo "ERROR RedGreenRefactor.md missing"
[ -f "$PAI_DIR/skills/TDD/workflows/WriteTestFirst.md" ] && echo "OK WriteTestFirst.md" || echo "ERROR WriteTestFirst.md missing"
[ -f "$PAI_DIR/skills/TDD/workflows/GenerateTests.md" ] && echo "OK GenerateTests.md" || echo "ERROR GenerateTests.md missing"
[ -f "$PAI_DIR/skills/TDD/workflows/AnalyzeCoverage.md" ] && echo "OK AnalyzeCoverage.md" || echo "ERROR AnalyzeCoverage.md missing"

WORKFLOW_COUNT=$(ls "$PAI_DIR/skills/TDD/workflows/"*.md 2>/dev/null | wc -l)
echo "Found $WORKFLOW_COUNT workflow files (expected: 4)"

echo "=== Verification Complete ==="
```

**Mark todo as completed when all checks pass.**

---

## Success/Failure Messages

### On Success

```
"PAI TDD Skill v1.0.0 installed successfully!

What's available:
- Red-Green-Refactor: Complete TDD cycle for new features
- WriteTestFirst: Generate test specs before implementation
- GenerateTests: Create tests for existing code
- AnalyzeCoverage: Find coverage gaps and suggest tests

Usage:
- 'Use TDD to implement [feature]' - Full red-green-refactor cycle
- 'Write test first for [feature]' - Generate test spec
- 'Generate tests for [file]' - Add tests to existing code
- 'Check coverage' - Analyze and improve test coverage

Recommended: Ensure Vitest is installed for best experience:
  bun add -d vitest @testing-library/react"
```

### On Failure

```
"Installation encountered issues. Here's what to check:

1. Check directory permissions on $PAI_DIR/skills/
2. Verify all workflow files copied from pack
3. Run the verification commands in VERIFY.md

Need help? Check the Troubleshooting section below."
```

---

## Troubleshooting

### Skill not recognized

```bash
# Verify SKILL.md exists
ls -la $PAI_DIR/skills/TDD/SKILL.md

# Check frontmatter is valid
head -10 $PAI_DIR/skills/TDD/SKILL.md
```

### Workflows not found

```bash
# Check workflow files
ls -la $PAI_DIR/skills/TDD/workflows/

# Re-copy if missing
cp -r src/skills/TDD/workflows/* $PAI_DIR/skills/TDD/workflows/
```

### Vitest not configured

```bash
# Install Vitest
bun add -d vitest

# Add test script to package.json
# "scripts": { "test": "vitest", "test:coverage": "vitest --coverage" }
```

---

## What's Included

### Skill Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Skill definition and routing |
| `workflows/RedGreenRefactor.md` | Complete TDD cycle |
| `workflows/WriteTestFirst.md` | Test spec generation |
| `workflows/GenerateTests.md` | Tests for existing code |
| `workflows/AnalyzeCoverage.md` | Coverage analysis |

---

## Usage

### Red-Green-Refactor (Full TDD)

```
"I need a function to validate email addresses, use TDD"
→ Write failing tests first
→ Implement minimal code
→ Refactor while green
```

### Write Test First

```
"Write test first for a CSV parser"
→ Generates test file with structure
→ Happy path, edge cases, error cases
→ All tests fail until implemented
```

### Generate Tests for Existing Code

```
"Generate tests for src/utils/helpers.ts"
→ Analyzes exports and logic
→ Creates comprehensive test file
→ Covers all code paths
```

### Analyze Coverage

```
"What code needs tests?"
→ Runs coverage report
→ Identifies gaps
→ Suggests specific tests
```
