# PAI CodeAudit Skill v1.0.0 - Installation Guide

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
"I'm installing PAI CodeAudit Skill v1.0.0 - Automated codebase health analysis. This skill analyzes TypeScript/JavaScript projects for technical debt, generating health scores and prioritized cleanup reports.

Let me analyze your system and guide you through installation."
```

---

## Phase 1: System Analysis

**Execute this analysis BEFORE any file operations.**

### 1.1 Run These Commands

```bash
PAI_CHECK="${PAI_DIR:-$HOME/.claude}"
echo "PAI_DIR: $PAI_CHECK"

# Check for existing CodeAudit skill
if [ -d "$PAI_CHECK/skills/CodeAudit" ]; then
  echo "WARNING Existing CodeAudit skill found at: $PAI_CHECK/skills/CodeAudit"
  ls "$PAI_CHECK/skills/CodeAudit/"
else
  echo "OK No existing CodeAudit skill (clean install)"
fi

# Check for existing audit-code tool
if [ -f "$PAI_CHECK/tools/audit-code.ts" ]; then
  echo "WARNING Existing audit-code.ts found"
else
  echo "OK No existing audit-code.ts"
fi

# Check for History/Audits directory
if [ -d "$PAI_CHECK/History/Audits" ]; then
  echo "OK Audits History directory exists"
else
  echo "NOTE Audits History directory will be created on first report"
fi

# Check Bun is available
if command -v bun &> /dev/null; then
  echo "OK Bun is installed: $(bun --version)"
else
  echo "ERROR Bun is required but not installed"
fi
```

### 1.2 Present Findings

Tell the user what you found:
```
"Here's what I found on your system:
- Existing CodeAudit skill: [Yes / No]
- Existing audit-code.ts: [Yes / No]
- Bun runtime: [installed / NOT INSTALLED - REQUIRED]"
```

**STOP if Bun is not installed.** Tell the user:
```
"Bun is required for the CLI tool. Install it with: curl -fsSL https://bun.sh/install | bash"
```

---

## Phase 2: User Questions

**Use AskUserQuestion tool at each decision point.**

### Question 1: Conflict Resolution (if existing skill found)

**Only ask if existing CodeAudit directory detected:**

```json
{
  "header": "Conflict",
  "question": "Existing CodeAudit skill detected. How should I proceed?",
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
  "question": "Ready to install PAI CodeAudit Skill v1.0.0?",
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
BACKUP_DIR="$PAI_DIR/Backups/codeaudit-skill-$(date +%Y%m%d-%H%M%S)"

if [ -d "$PAI_DIR/skills/CodeAudit" ]; then
  mkdir -p "$BACKUP_DIR"
  cp -r "$PAI_DIR/skills/CodeAudit" "$BACKUP_DIR/"
  echo "Backup created at: $BACKUP_DIR"
fi

if [ -f "$PAI_DIR/tools/audit-code.ts" ]; then
  mkdir -p "$BACKUP_DIR"
  cp "$PAI_DIR/tools/audit-code.ts" "$BACKUP_DIR/"
  echo "Tool backup created at: $BACKUP_DIR"
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
    {"content": "Copy CLI tool from pack", "status": "pending", "activeForm": "Copying CLI tool"},
    {"content": "Make CLI tool executable", "status": "pending", "activeForm": "Making CLI tool executable"},
    {"content": "Run verification", "status": "pending", "activeForm": "Running verification"}
  ]
}
```

### 4.1 Create Directory Structure

**Mark todo "Create directory structure" as in_progress.**

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
mkdir -p "$PAI_DIR/skills/CodeAudit/workflows"
mkdir -p "$PAI_DIR/tools"
```

**Mark todo as completed.**

### 4.2 Copy Skill Files

**Mark todo "Copy skill files from pack" as in_progress.**

Copy all files from the pack's `src/skills/CodeAudit/` directory:

```bash
PACK_DIR="$(pwd)"
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

cp -r "$PACK_DIR/src/skills/CodeAudit/"* "$PAI_DIR/skills/CodeAudit/"
```

**Files included:**
- `SKILL.md` - Main skill definition and routing
- `workflows/Audit.md` - Audit workflow definition

**Mark todo as completed.**

### 4.3 Copy CLI Tool

**Mark todo "Copy CLI tool from pack" as in_progress.**

```bash
PACK_DIR="$(pwd)"
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

cp "$PACK_DIR/src/tools/audit-code.ts" "$PAI_DIR/tools/"
```

**Mark todo as completed.**

### 4.4 Make CLI Tool Executable

**Mark todo "Make CLI tool executable" as in_progress.**

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
chmod +x "$PAI_DIR/tools/audit-code.ts"
```

**Mark todo as completed.**

---

## Phase 5: Verification

**Mark todo "Run verification" as in_progress.**

**Execute all checks from VERIFY.md:**

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

echo "=== PAI CodeAudit Skill v1.0.0 Verification ==="

# Check skill files
echo "Checking skill files..."
[ -f "$PAI_DIR/skills/CodeAudit/SKILL.md" ] && echo "OK SKILL.md" || echo "ERROR SKILL.md missing"
[ -d "$PAI_DIR/skills/CodeAudit/workflows" ] && echo "OK workflows directory" || echo "ERROR workflows directory missing"
[ -f "$PAI_DIR/skills/CodeAudit/workflows/Audit.md" ] && echo "OK Audit.md workflow" || echo "ERROR Audit.md missing"

# Check CLI tool
echo ""
echo "Checking CLI tool..."
[ -f "$PAI_DIR/tools/audit-code.ts" ] && echo "OK audit-code.ts" || echo "ERROR audit-code.ts missing"
[ -x "$PAI_DIR/tools/audit-code.ts" ] && echo "OK audit-code.ts is executable" || echo "WARNING audit-code.ts not executable"

# Test CLI tool
echo ""
echo "Testing CLI tool..."
bun "$PAI_DIR/tools/audit-code.ts" --help > /dev/null 2>&1 && echo "OK CLI tool runs successfully" || echo "ERROR CLI tool failed to run"

echo "=== Verification Complete ==="
```

**Mark todo as completed when all checks pass.**

---

## Success/Failure Messages

### On Success

```
"PAI CodeAudit Skill v1.0.0 installed successfully!

What's available:
- Code auditing: Analyzes TypeScript/JavaScript for technical debt
- Health scoring: 0-100 score based on issues found
- Multiple outputs: Terminal, JSON, Markdown reports

Usage:
- 'Audit my codebase' - Full audit with report
- 'Find dead code' - Focus on unused exports
- 'Check type safety' - Focus on type issues

CLI Tool:
  bun ~/.claude/tools/audit-code.ts ./src
  bun ~/.claude/tools/audit-code.ts ./src --json
  bun ~/.claude/tools/audit-code.ts ./src --report"
```

### On Failure

```
"Installation encountered issues. Here's what to check:

1. Ensure Bun is installed: curl -fsSL https://bun.sh/install | bash
2. Check directory permissions on $PAI_DIR/skills/
3. Verify all files copied from pack
4. Run the verification commands in VERIFY.md

Need help? Check the Troubleshooting section below."
```

---

## Troubleshooting

### "Bun not found"

Install Bun:
```bash
curl -fsSL https://bun.sh/install | bash
```

### Skill not recognized

```bash
# Verify SKILL.md exists
ls -la $PAI_DIR/skills/CodeAudit/SKILL.md

# Check frontmatter is valid
head -20 $PAI_DIR/skills/CodeAudit/SKILL.md
```

### CLI tool not working

```bash
# Check tool exists and is executable
ls -la $PAI_DIR/tools/audit-code.ts

# Test directly
bun $PAI_DIR/tools/audit-code.ts --help

# Re-copy if missing
cp src/tools/audit-code.ts $PAI_DIR/tools/
chmod +x $PAI_DIR/tools/audit-code.ts
```

---

## What's Included

### Skill Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Skill definition and routing |
| `workflows/Audit.md` | Full audit workflow |

### CLI Tool

| File | Purpose |
|------|---------|
| `audit-code.ts` | Model-agnostic CLI for code analysis |

---

## Usage

### Via Natural Language (Claude Code)

```
"Audit my codebase"
"Find dead code in src/"
"Check for type safety issues"
"What's my code health score?"
```

### Via CLI (Any Model)

```bash
# Interactive terminal output
bun ~/.claude/tools/audit-code.ts ./src

# JSON for programmatic use
bun ~/.claude/tools/audit-code.ts ./src --json

# Markdown report saved to History
bun ~/.claude/tools/audit-code.ts ./src --report

# Custom threshold
bun ~/.claude/tools/audit-code.ts ./src --threshold 300
```
