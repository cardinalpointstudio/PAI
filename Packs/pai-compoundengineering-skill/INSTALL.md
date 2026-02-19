# PAI CompoundEngineering Skill v1.0.0 - Installation Guide

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
"I'm installing PAI CompoundEngineering Skill v1.0.0 - Systematic parallel development workflow. This skill helps you plan, implement with parallel agents, review, and capture learnings.

Let me analyze your system and guide you through installation."
```

---

## Phase 1: System Analysis

**Execute this analysis BEFORE any file operations.**

### 1.1 Run These Commands

```bash
PAI_CHECK="${PAI_DIR:-$HOME/.claude}"
echo "PAI_DIR: $PAI_CHECK"

# Check for existing CompoundEngineering skill
if [ -d "$PAI_CHECK/skills/CompoundEngineering" ]; then
  echo "WARNING Existing CompoundEngineering skill found at: $PAI_CHECK/skills/CompoundEngineering"
  ls "$PAI_CHECK/skills/CompoundEngineering/"
else
  echo "OK No existing CompoundEngineering skill (clean install)"
fi

# Check dependencies
echo ""
echo "Checking dependencies..."
command -v tmux >/dev/null 2>&1 && echo "OK tmux installed" || echo "WARNING tmux not found (required for Orchestrate)"
command -v gh >/dev/null 2>&1 && echo "OK gh (GitHub CLI) installed" || echo "WARNING gh not found (required for PR creation)"
command -v bun >/dev/null 2>&1 && echo "OK bun installed" || echo "WARNING bun not found (required for orchestrator)"
```

### 1.2 Present Findings

Tell the user what you found:
```
"Here's what I found on your system:
- Existing CompoundEngineering skill: [Yes / No]
- tmux: [Installed / Missing]
- gh (GitHub CLI): [Installed / Missing]
- bun: [Installed / Missing]"
```

**Note:** Missing dependencies only affect the Orchestrate workflow. Plan, Review, and Compound workflows work without them.

---

## Phase 2: User Questions

**Use AskUserQuestion tool at each decision point.**

### Question 1: Conflict Resolution (if existing skill found)

**Only ask if existing CompoundEngineering directory detected:**

```json
{
  "header": "Conflict",
  "question": "Existing CompoundEngineering skill detected. How should I proceed?",
  "multiSelect": false,
  "options": [
    {"label": "Backup and replace (Recommended)", "description": "Creates timestamped backup, then installs fresh"},
    {"label": "Replace without backup", "description": "Overwrites existing skill files"},
    {"label": "Cancel", "description": "Abort installation"}
  ]
}
```

### Question 2: Tool Installation

**Only ask if dependencies missing:**

```json
{
  "header": "Dependencies",
  "question": "Some dependencies are missing for the Orchestrate workflow. How to proceed?",
  "multiSelect": false,
  "options": [
    {"label": "Continue (Recommended)", "description": "Install skill now, install dependencies later"},
    {"label": "Show install commands", "description": "Display commands to install missing dependencies"},
    {"label": "Cancel", "description": "Abort installation"}
  ]
}
```

If user chooses "Show install commands":
```bash
# For tmux (varies by OS)
# macOS: brew install tmux
# Ubuntu/Debian: sudo apt install tmux
# Arch: sudo pacman -S tmux

# For GitHub CLI
# macOS: brew install gh
# Ubuntu/Debian: See https://cli.github.com/manual/installation

# For bun
curl -fsSL https://bun.sh/install | bash
```

### Question 3: Final Confirmation

```json
{
  "header": "Install",
  "question": "Ready to install PAI CompoundEngineering Skill v1.0.0?",
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
BACKUP_DIR="$PAI_DIR/Backups/compoundengineering-skill-$(date +%Y%m%d-%H%M%S)"

if [ -d "$PAI_DIR/skills/CompoundEngineering" ]; then
  mkdir -p "$BACKUP_DIR"
  cp -r "$PAI_DIR/skills/CompoundEngineering" "$BACKUP_DIR/"
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
    {"content": "Copy workflow files", "status": "pending", "activeForm": "Copying workflow files"},
    {"content": "Copy template files", "status": "pending", "activeForm": "Copying template files"},
    {"content": "Copy and configure tools", "status": "pending", "activeForm": "Copying tools"},
    {"content": "Run verification", "status": "pending", "activeForm": "Running verification"}
  ]
}
```

### 4.1 Create Directory Structure

**Mark todo "Create directory structure" as in_progress.**

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
mkdir -p "$PAI_DIR/skills/CompoundEngineering/workflows"
mkdir -p "$PAI_DIR/skills/CompoundEngineering/templates"
mkdir -p "$PAI_DIR/skills/CompoundEngineering/tools"
```

**Mark todo as completed.**

### 4.2 Copy Main Skill Files

**Mark todo "Copy skill files from pack" as in_progress.**

Copy from the pack's `src/skills/CompoundEngineering/` directory:

```bash
PACK_DIR="$(pwd)"
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

cp "$PACK_DIR/src/skills/CompoundEngineering/SKILL.md" "$PAI_DIR/skills/CompoundEngineering/"
cp "$PACK_DIR/src/skills/CompoundEngineering/ReviewPatterns.md" "$PAI_DIR/skills/CompoundEngineering/"
```

**Mark todo as completed.**

### 4.3 Copy Workflow Files

**Mark todo "Copy workflow files" as in_progress.**

```bash
PACK_DIR="$(pwd)"
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

cp "$PACK_DIR/src/skills/CompoundEngineering/workflows/"*.md "$PAI_DIR/skills/CompoundEngineering/workflows/"
```

**Files included:**
- `workflows/Plan.md` - Feature planning workflow
- `workflows/Review.md` - Multi-agent code review
- `workflows/Compound.md` - Learning capture workflow
- `workflows/Orchestrate.md` - Parallel worker coordination

**Mark todo as completed.**

### 4.4 Copy Template Files

**Mark todo "Copy template files" as in_progress.**

```bash
PACK_DIR="$(pwd)"
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

cp "$PACK_DIR/src/skills/CompoundEngineering/templates/"* "$PAI_DIR/skills/CompoundEngineering/templates/"
```

**Files included:**
- `templates/task-file.md` - Template for worker task files
- `templates/PLAN-example.md` - Example plan document
- `templates/contracts-example.ts` - Example shared type contracts

**Mark todo as completed.**

### 4.5 Copy and Configure Tools

**Mark todo "Copy and configure tools" as in_progress.**

```bash
PACK_DIR="$(pwd)"
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

cp "$PACK_DIR/src/skills/CompoundEngineering/tools/"* "$PAI_DIR/skills/CompoundEngineering/tools/"

# Make shell scripts executable
chmod +x "$PAI_DIR/skills/CompoundEngineering/tools/compound-start.sh"
chmod +x "$PAI_DIR/skills/CompoundEngineering/tools/ce-stop.sh"
chmod +x "$PAI_DIR/skills/CompoundEngineering/tools/orchestrate.ts"
```

**Optional: Create symlinks for easy access:**

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Create tools directory if it doesn't exist
mkdir -p "$PAI_DIR/tools"

# Symlink the main commands
ln -sf "$PAI_DIR/skills/CompoundEngineering/tools/compound-start.sh" "$PAI_DIR/tools/ce-start"
ln -sf "$PAI_DIR/skills/CompoundEngineering/tools/ce-stop.sh" "$PAI_DIR/tools/ce-stop"

echo "Created aliases: ce-start, ce-stop"
```

**Mark todo as completed.**

---

## Phase 5: Verification

**Mark todo "Run verification" as in_progress.**

**Execute all checks from VERIFY.md:**

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

echo "=== PAI CompoundEngineering Skill v1.0.0 Verification ==="

# Check main skill files
echo "Checking skill files..."
[ -f "$PAI_DIR/skills/CompoundEngineering/SKILL.md" ] && echo "OK SKILL.md" || echo "ERROR SKILL.md missing"
[ -f "$PAI_DIR/skills/CompoundEngineering/ReviewPatterns.md" ] && echo "OK ReviewPatterns.md" || echo "ERROR ReviewPatterns.md missing"

# Check workflows
echo ""
echo "Checking workflows..."
[ -f "$PAI_DIR/skills/CompoundEngineering/workflows/Plan.md" ] && echo "OK Plan.md" || echo "ERROR Plan.md missing"
[ -f "$PAI_DIR/skills/CompoundEngineering/workflows/Review.md" ] && echo "OK Review.md" || echo "ERROR Review.md missing"
[ -f "$PAI_DIR/skills/CompoundEngineering/workflows/Compound.md" ] && echo "OK Compound.md" || echo "ERROR Compound.md missing"
[ -f "$PAI_DIR/skills/CompoundEngineering/workflows/Orchestrate.md" ] && echo "OK Orchestrate.md" || echo "ERROR Orchestrate.md missing"

WORKFLOW_COUNT=$(ls "$PAI_DIR/skills/CompoundEngineering/workflows/"*.md 2>/dev/null | wc -l)
echo "Found $WORKFLOW_COUNT workflow files (expected: 4)"

# Check templates
echo ""
echo "Checking templates..."
[ -f "$PAI_DIR/skills/CompoundEngineering/templates/task-file.md" ] && echo "OK task-file.md" || echo "ERROR task-file.md missing"
[ -f "$PAI_DIR/skills/CompoundEngineering/templates/PLAN-example.md" ] && echo "OK PLAN-example.md" || echo "ERROR PLAN-example.md missing"
[ -f "$PAI_DIR/skills/CompoundEngineering/templates/contracts-example.ts" ] && echo "OK contracts-example.ts" || echo "ERROR contracts-example.ts missing"

# Check tools
echo ""
echo "Checking tools..."
[ -f "$PAI_DIR/skills/CompoundEngineering/tools/compound-start.sh" ] && echo "OK compound-start.sh" || echo "ERROR compound-start.sh missing"
[ -f "$PAI_DIR/skills/CompoundEngineering/tools/ce-stop.sh" ] && echo "OK ce-stop.sh" || echo "ERROR ce-stop.sh missing"
[ -f "$PAI_DIR/skills/CompoundEngineering/tools/orchestrate.ts" ] && echo "OK orchestrate.ts" || echo "ERROR orchestrate.ts missing"

# Check executability
echo ""
echo "Checking executability..."
[ -x "$PAI_DIR/skills/CompoundEngineering/tools/compound-start.sh" ] && echo "OK compound-start.sh executable" || echo "WARNING compound-start.sh not executable"
[ -x "$PAI_DIR/skills/CompoundEngineering/tools/ce-stop.sh" ] && echo "OK ce-stop.sh executable" || echo "WARNING ce-stop.sh not executable"
[ -x "$PAI_DIR/skills/CompoundEngineering/tools/orchestrate.ts" ] && echo "OK orchestrate.ts executable" || echo "WARNING orchestrate.ts not executable"

echo ""
echo "=== Verification Complete ==="
```

**Mark todo as completed when all checks pass.**

---

## Success/Failure Messages

### On Success

```
"PAI CompoundEngineering Skill v1.0.0 installed successfully!

What's available:
- Plan: Design implementation before coding
- Review: Multi-agent parallel code review
- Compound: Capture learnings for future work
- Orchestrate: Full parallel workflow with tmux

Usage:
- 'Plan the implementation of [feature]' - Create detailed plan
- 'Review this code for issues' - Multi-perspective review
- 'Capture what we learned' - Document patterns and gotchas
- 'ce-start /path/to/project' - Start parallel workflow session

Quick Start (Orchestrate):
1. Run: ~/.claude/skills/CompoundEngineering/tools/compound-start.sh
2. In Plan window (Ctrl+b 2): describe your feature
3. In Orch window (Ctrl+b 1): press [P] when plan approved
4. Workers implement in parallel
5. Press [R] for review, [C] for compound, [G] to create PR

Review Patterns included:
- Security (input validation, auth, secrets, XSS)
- Performance (N+1, unbounded queries, memory leaks)
- Correctness (off-by-one, null handling, race conditions)
- Maintainability (magic numbers, god objects, dead code)"
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
ls -la $PAI_DIR/skills/CompoundEngineering/SKILL.md

# Check frontmatter is valid
head -10 $PAI_DIR/skills/CompoundEngineering/SKILL.md
```

### Tools not executable

```bash
# Fix permissions
chmod +x $PAI_DIR/skills/CompoundEngineering/tools/*.sh
chmod +x $PAI_DIR/skills/CompoundEngineering/tools/*.ts
```

### Orchestrate not starting

```bash
# Check tmux is installed
tmux -V

# Check if session already exists
tmux ls

# Kill existing session if stuck
tmux kill-session -t ce-dev
```

### Missing dependencies

```bash
# Install tmux
# macOS: brew install tmux
# Ubuntu: sudo apt install tmux

# Install GitHub CLI
# See: https://cli.github.com/manual/installation

# Install bun
curl -fsSL https://bun.sh/install | bash
```

---

## What's Included

### Skill Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Skill definition and routing |
| `ReviewPatterns.md` | Comprehensive review patterns reference |

### Workflows

| File | Purpose |
|------|---------|
| `workflows/Plan.md` | Feature planning before implementation |
| `workflows/Review.md` | Multi-agent parallel code review |
| `workflows/Compound.md` | Learning capture workflow |
| `workflows/Orchestrate.md` | Parallel worker coordination |

### Templates

| File | Purpose |
|------|---------|
| `templates/task-file.md` | Template for worker task files |
| `templates/PLAN-example.md` | Example plan document |
| `templates/contracts-example.ts` | Example shared type contracts |

### Tools

| File | Purpose |
|------|---------|
| `tools/compound-start.sh` | Start CE tmux session |
| `tools/ce-stop.sh` | Stop CE session gracefully |
| `tools/orchestrate.ts` | Interactive orchestrator CLI |
