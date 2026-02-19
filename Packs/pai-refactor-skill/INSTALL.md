# PAI Refactor Skill v1.0.0 - Installation Guide

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
"I'm installing PAI Refactor Skill v1.0.0 - Safe code restructuring workflows. This skill guides you through extract, rename, and move refactorings while preserving behavior.

Let me analyze your system and guide you through installation."
```

---

## Phase 1: System Analysis

**Execute this analysis BEFORE any file operations.**

### 1.1 Run These Commands

```bash
PAI_CHECK="${PAI_DIR:-$HOME/.claude}"
echo "PAI_DIR: $PAI_CHECK"

# Check for existing Refactor skill
if [ -d "$PAI_CHECK/skills/Refactor" ]; then
  echo "WARNING Existing Refactor skill found at: $PAI_CHECK/skills/Refactor"
  ls "$PAI_CHECK/skills/Refactor/"
else
  echo "OK No existing Refactor skill (clean install)"
fi
```

### 1.2 Present Findings

Tell the user what you found:
```
"Here's what I found on your system:
- Existing Refactor skill: [Yes / No]"
```

---

## Phase 2: User Questions

**Use AskUserQuestion tool at each decision point.**

### Question 1: Conflict Resolution (if existing skill found)

**Only ask if existing Refactor directory detected:**

```json
{
  "header": "Conflict",
  "question": "Existing Refactor skill detected. How should I proceed?",
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
  "question": "Ready to install PAI Refactor Skill v1.0.0?",
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
BACKUP_DIR="$PAI_DIR/Backups/refactor-skill-$(date +%Y%m%d-%H%M%S)"

if [ -d "$PAI_DIR/skills/Refactor" ]; then
  mkdir -p "$BACKUP_DIR"
  cp -r "$PAI_DIR/skills/Refactor" "$BACKUP_DIR/"
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
mkdir -p "$PAI_DIR/skills/Refactor/workflows"
```

**Mark todo as completed.**

### 4.2 Copy Skill Files

**Mark todo "Copy skill files from pack" as in_progress.**

Copy all files from the pack's `src/skills/Refactor/` directory:

```bash
PACK_DIR="$(pwd)"
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

cp -r "$PACK_DIR/src/skills/Refactor/"* "$PAI_DIR/skills/Refactor/"
```

**Files included:**
- `SKILL.md` - Main skill definition and routing
- `RefactorPatterns.md` - Code smells and patterns reference
- `workflows/ExtractFunction.md` - Extract code into functions
- `workflows/Rename.md` - Rename symbols across codebase
- `workflows/MoveModule.md` - Move files and update imports

**Mark todo as completed.**

---

## Phase 5: Verification

**Mark todo "Run verification" as in_progress.**

**Execute all checks from VERIFY.md:**

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

echo "=== PAI Refactor Skill v1.0.0 Verification ==="

# Check skill files
echo "Checking skill files..."
[ -f "$PAI_DIR/skills/Refactor/SKILL.md" ] && echo "OK SKILL.md" || echo "ERROR SKILL.md missing"
[ -f "$PAI_DIR/skills/Refactor/RefactorPatterns.md" ] && echo "OK RefactorPatterns.md" || echo "ERROR RefactorPatterns.md missing"
[ -d "$PAI_DIR/skills/Refactor/workflows" ] && echo "OK workflows directory" || echo "ERROR workflows directory missing"

# Check workflows
echo ""
echo "Checking workflows..."
[ -f "$PAI_DIR/skills/Refactor/workflows/ExtractFunction.md" ] && echo "OK ExtractFunction.md" || echo "ERROR ExtractFunction.md missing"
[ -f "$PAI_DIR/skills/Refactor/workflows/Rename.md" ] && echo "OK Rename.md" || echo "ERROR Rename.md missing"
[ -f "$PAI_DIR/skills/Refactor/workflows/MoveModule.md" ] && echo "OK MoveModule.md" || echo "ERROR MoveModule.md missing"

WORKFLOW_COUNT=$(ls "$PAI_DIR/skills/Refactor/workflows/"*.md 2>/dev/null | wc -l)
echo "Found $WORKFLOW_COUNT workflow files (expected: 3)"

echo "=== Verification Complete ==="
```

**Mark todo as completed when all checks pass.**

---

## Success/Failure Messages

### On Success

```
"PAI Refactor Skill v1.0.0 installed successfully!

What's available:
- ExtractFunction: Pull out code into reusable functions
- Rename: Rename symbols across entire codebase
- MoveModule: Move files while updating all imports

Usage:
- 'Extract this validation logic into a function' - Extract workflow
- 'Rename getUserData to fetchUserProfile' - Rename workflow
- 'Move utils/helpers.ts to lib/helpers.ts' - Move workflow
- 'Clean up this code' - Analyzes and suggests refactorings

The skill follows the process: tests pass → refactor → tests pass → commit"
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
ls -la $PAI_DIR/skills/Refactor/SKILL.md

# Check frontmatter is valid
head -10 $PAI_DIR/skills/Refactor/SKILL.md
```

### Workflows not found

```bash
# Check workflow files
ls -la $PAI_DIR/skills/Refactor/workflows/

# Re-copy if missing
cp -r src/skills/Refactor/workflows/* $PAI_DIR/skills/Refactor/workflows/
```

---

## What's Included

### Skill Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Skill definition and routing |
| `RefactorPatterns.md` | Code smells and patterns reference |
| `workflows/ExtractFunction.md` | Extract code into functions |
| `workflows/Rename.md` | Rename symbols across codebase |
| `workflows/MoveModule.md` | Move files and update imports |

---

## Usage

### Extract Function

```
"This function is too long, extract the validation logic"
→ Identifies extractable code block
→ Determines function signature
→ Creates new function
→ Replaces original with function call
→ Runs tests
```

### Rename Symbol

```
"Rename getData to fetchUserProfile everywhere"
→ Finds all usages
→ Updates definition
→ Updates all imports
→ Updates all calls
→ Runs tests
```

### Move Module

```
"Move utils/helpers.ts to lib/helpers.ts"
→ Creates destination directory
→ Moves file with git mv
→ Updates all imports
→ Removes empty directories
→ Runs tests
```
