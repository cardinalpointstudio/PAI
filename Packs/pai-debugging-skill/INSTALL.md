# PAI Debugging Skill v1.0.0 - Installation Guide

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
"I'm installing PAI Debugging Skill v1.0.0 - Systematic debugging workflows. This skill guides you through finding and fixing bugs using a structured process: reproduce → isolate → understand → fix → verify.

Let me analyze your system and guide you through installation."
```

---

## Phase 1: System Analysis

**Execute this analysis BEFORE any file operations.**

### 1.1 Run These Commands

```bash
PAI_CHECK="${PAI_DIR:-$HOME/.claude}"
echo "PAI_DIR: $PAI_CHECK"

# Check for existing Debugging skill
if [ -d "$PAI_CHECK/skills/Debugging" ]; then
  echo "WARNING Existing Debugging skill found at: $PAI_CHECK/skills/Debugging"
  ls "$PAI_CHECK/skills/Debugging/"
else
  echo "OK No existing Debugging skill (clean install)"
fi
```

### 1.2 Present Findings

Tell the user what you found:
```
"Here's what I found on your system:
- Existing Debugging skill: [Yes / No]"
```

---

## Phase 2: User Questions

**Use AskUserQuestion tool at each decision point.**

### Question 1: Conflict Resolution (if existing skill found)

**Only ask if existing Debugging directory detected:**

```json
{
  "header": "Conflict",
  "question": "Existing Debugging skill detected. How should I proceed?",
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
  "question": "Ready to install PAI Debugging Skill v1.0.0?",
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
BACKUP_DIR="$PAI_DIR/Backups/debugging-skill-$(date +%Y%m%d-%H%M%S)"

if [ -d "$PAI_DIR/skills/Debugging" ]; then
  mkdir -p "$BACKUP_DIR"
  cp -r "$PAI_DIR/skills/Debugging" "$BACKUP_DIR/"
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
mkdir -p "$PAI_DIR/skills/Debugging/workflows"
```

**Mark todo as completed.**

### 4.2 Copy Skill Files

**Mark todo "Copy skill files from pack" as in_progress.**

Copy all files from the pack's `src/skills/Debugging/` directory:

```bash
PACK_DIR="$(pwd)"
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

cp -r "$PACK_DIR/src/skills/Debugging/"* "$PAI_DIR/skills/Debugging/"
```

**Files included:**
- `SKILL.md` - Main skill definition and routing
- `workflows/Investigate.md` - Full debugging process
- `workflows/AnalyzeError.md` - Error and stack trace analysis
- `workflows/CreateMRE.md` - Minimum Reproducible Example creation

**Mark todo as completed.**

---

## Phase 5: Verification

**Mark todo "Run verification" as in_progress.**

**Execute all checks from VERIFY.md:**

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

echo "=== PAI Debugging Skill v1.0.0 Verification ==="

# Check skill files
echo "Checking skill files..."
[ -f "$PAI_DIR/skills/Debugging/SKILL.md" ] && echo "OK SKILL.md" || echo "ERROR SKILL.md missing"
[ -d "$PAI_DIR/skills/Debugging/workflows" ] && echo "OK workflows directory" || echo "ERROR workflows directory missing"

# Check workflows
echo ""
echo "Checking workflows..."
[ -f "$PAI_DIR/skills/Debugging/workflows/Investigate.md" ] && echo "OK Investigate.md" || echo "ERROR Investigate.md missing"
[ -f "$PAI_DIR/skills/Debugging/workflows/AnalyzeError.md" ] && echo "OK AnalyzeError.md" || echo "ERROR AnalyzeError.md missing"
[ -f "$PAI_DIR/skills/Debugging/workflows/CreateMRE.md" ] && echo "OK CreateMRE.md" || echo "ERROR CreateMRE.md missing"

WORKFLOW_COUNT=$(ls "$PAI_DIR/skills/Debugging/workflows/"*.md 2>/dev/null | wc -l)
echo "Found $WORKFLOW_COUNT workflow files (expected: 3)"

echo "=== Verification Complete ==="
```

**Mark todo as completed when all checks pass.**

---

## Success/Failure Messages

### On Success

```
"PAI Debugging Skill v1.0.0 installed successfully!

What's available:
- Investigate: Full debugging process from symptom to verified fix
- AnalyzeError: Parse error messages and stack traces
- CreateMRE: Create Minimum Reproducible Examples

Usage:
- 'Debug [problem]' - Start systematic investigation
- 'I'm getting [error message]' - Analyze the error
- 'Help me reproduce [bug]' - Create minimal reproduction
- 'Fix this bug' - Full investigation workflow

The skill follows the process: reproduce → isolate → understand → fix → verify"
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
ls -la $PAI_DIR/skills/Debugging/SKILL.md

# Check frontmatter is valid
head -10 $PAI_DIR/skills/Debugging/SKILL.md
```

### Workflows not found

```bash
# Check workflow files
ls -la $PAI_DIR/skills/Debugging/workflows/

# Re-copy if missing
cp -r src/skills/Debugging/workflows/* $PAI_DIR/skills/Debugging/workflows/
```

---

## What's Included

### Skill Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Skill definition and routing |
| `workflows/Investigate.md` | Full debugging process |
| `workflows/AnalyzeError.md` | Error analysis |
| `workflows/CreateMRE.md` | MRE creation |

---

## Usage

### Investigate a Bug

```
"The login form isn't working"
→ Gather information
→ Reproduce the bug
→ Isolate the problem
→ Understand root cause
→ Fix and verify
```

### Analyze an Error

```
"TypeError: Cannot read property 'map' of undefined"
→ Parse error type and message
→ Read stack trace
→ Go to error location
→ Identify pattern
→ Propose fix
```

### Create MRE

```
"This bug only happens in production"
→ Document the bug
→ Create minimal environment
→ Copy relevant code
→ Remove non-essential code
→ Isolate trigger
→ Document reproduction
```
