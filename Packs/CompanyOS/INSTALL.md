# CompanyOS v1.0.0 - Installation Guide

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
"I'm installing CompanyOS v1.0.0 -- systematize companies as computable graphs.

This pack installs the CompanyOS skill, which includes:
- 7 workflows for company lifecycle (Create → Map → SOP → Roles → Audit → Review)
- 6 model definitions (CompanyGraph, OrgModel, IdealState, etc.)
- 5 TypeScript CLI tools for querying and validation
- 7 templates for bootstrapping company artifacts

Let me analyze your system and guide you through installation."
```

---

## Phase 1: System Analysis

**Execute this analysis BEFORE any file operations.**

### 1.1 Run These Commands

```bash
# Check for Claude Code skills directory
CLAUDE_DIR="$HOME/.claude"
echo "Claude directory: $CLAUDE_DIR"

# Check if CompanyOS skill directory exists
if [ -d "$CLAUDE_DIR/skills/CompanyOS" ]; then
  echo "WARNING Existing CompanyOS skill found at: $CLAUDE_DIR/skills/CompanyOS"
  ls -la "$CLAUDE_DIR/skills/CompanyOS/" 2>/dev/null
else
  echo "OK No existing CompanyOS skill (clean install)"
fi

# Check for skills directory
if [ -d "$CLAUDE_DIR/skills" ]; then
  echo "OK Skills directory exists at: $CLAUDE_DIR/skills"
else
  echo "INFO Skills directory does not exist (will be created)"
fi

# Check for existing company-os data directory
if [ -d "$HOME/company-os" ]; then
  echo "INFO Existing company-os data found at: $HOME/company-os"
  ls -la "$HOME/company-os/" 2>/dev/null
else
  echo "INFO No company-os data directory (will be created on first use)"
fi

# Check for Bun runtime (required for TypeScript tools)
if command -v bun &> /dev/null; then
  echo "OK Bun runtime available: $(bun --version)"
else
  echo "WARNING Bun runtime not found (required for TypeScript tools)"
  echo "  Install with: curl -fsSL https://bun.sh/install | bash"
fi

# Check for existing tool dependencies
if [ -f "$CLAUDE_DIR/skills/CompanyOS/tools/node_modules/.package-lock.json" ] || [ -d "$CLAUDE_DIR/skills/CompanyOS/tools/node_modules" ]; then
  echo "OK Existing tool dependencies found"
else
  echo "INFO Tool dependencies will need to be installed after copy"
fi
```

### 1.2 Present Findings

Tell the user what you found:
```
"Here's what I found on your system:
- Skills directory: [exists / will be created]
- Existing CompanyOS skill: [found -- will ask about conflict / not found]
- Existing company-os data: [found at path / not found]
- Bun runtime: [available / not found -- needed for TypeScript tools]

[If Bun not found]: Note: The CompanyOS skill includes TypeScript tools that require Bun.
Install it with: curl -fsSL https://bun.sh/install | bash"
```

---

## Phase 2: User Questions

**Use AskUserQuestion for each decision point.**

### 2.1 Conflict Resolution (if existing installation found)

```
Question: "I found an existing CompanyOS installation. How should I proceed?"

Options:
1. "Replace existing (backup first)" - Back up to ~/.claude/backups/, then overwrite
2. "Merge with existing" - Only copy missing files, preserve modifications
3. "Cancel installation" - Stop and let user investigate
```

### 2.2 Company Data Directory

```
Question: "Where should company data be stored?"

Options:
1. "~/company-os (recommended)" - Standard location in home directory
2. "Current project directory" - Store in ./company-os relative to current project
3. "Custom location" - Let me specify a path
```

### 2.3 Tool Dependencies

```
Question: "Should I install TypeScript tool dependencies now?"

Options:
1. "Yes, run bun install" - Install dependencies immediately
2. "No, I'll do it later" - Skip dependency installation
```

---

## Phase 3: Backup

**Only if replacing an existing installation.**

### 3.1 Create Backup

```bash
CLAUDE_DIR="$HOME/.claude"
BACKUP_DIR="$CLAUDE_DIR/backups/CompanyOS-$(date +%Y%m%d-%H%M%S)"

if [ -d "$CLAUDE_DIR/skills/CompanyOS" ]; then
  mkdir -p "$BACKUP_DIR"
  cp -r "$CLAUDE_DIR/skills/CompanyOS" "$BACKUP_DIR/"
  echo "OK Backup created at: $BACKUP_DIR"
fi
```

### 3.2 Confirm Backup

Tell the user:
```
"I've backed up your existing CompanyOS installation to:
$BACKUP_DIR

If anything goes wrong, you can restore from this backup."
```

---

## Phase 4: Installation

### 4.1 Create Directory Structure

```bash
CLAUDE_DIR="$HOME/.claude"
SKILL_DIR="$CLAUDE_DIR/skills/CompanyOS"

# Create skill directories
mkdir -p "$SKILL_DIR/workflows"
mkdir -p "$SKILL_DIR/models"
mkdir -p "$SKILL_DIR/tools"
mkdir -p "$SKILL_DIR/templates"

echo "OK Created directory structure at $SKILL_DIR"
```

### 4.2 Copy Files

**Copy from the pack's `src/` directory to the skill directory.**

The source files are located at: `{pack-location}/src/`

```bash
PACK_SRC="{pack-location}/src"
SKILL_DIR="$HOME/.claude/skills/CompanyOS"

# Copy main skill file
cp "$PACK_SRC/SKILL.md" "$SKILL_DIR/"

# Copy workflows
cp "$PACK_SRC/workflows/"*.md "$SKILL_DIR/workflows/"

# Copy models
cp "$PACK_SRC/models/"*.md "$SKILL_DIR/models/"

# Copy tools
cp "$PACK_SRC/tools/"*.ts "$SKILL_DIR/tools/"

# Copy templates
cp "$PACK_SRC/templates/"* "$SKILL_DIR/templates/"

echo "OK Copied all skill files"
```

### 4.3 Create Company Data Directory

Based on user's choice from Phase 2:

```bash
# Option 1: Home directory (recommended)
COMPANY_OS_DIR="$HOME/company-os"

# Option 2: Current project
# COMPANY_OS_DIR="./company-os"

# Option 3: Custom (user-specified)
# COMPANY_OS_DIR="/path/to/custom/location"

mkdir -p "$COMPANY_OS_DIR/companies"
mkdir -p "$COMPANY_OS_DIR/templates"

# Copy templates to data directory
cp "$SKILL_DIR/templates/"* "$COMPANY_OS_DIR/templates/"

echo "OK Created company data directory at $COMPANY_OS_DIR"
```

### 4.4 Install Tool Dependencies (if user chose yes)

```bash
SKILL_DIR="$HOME/.claude/skills/CompanyOS"

if command -v bun &> /dev/null; then
  cd "$SKILL_DIR/tools"
  bun install
  echo "OK Tool dependencies installed"
else
  echo "SKIP Bun not available, skipping dependency installation"
fi
```

### 4.5 Set Permissions

```bash
SKILL_DIR="$HOME/.claude/skills/CompanyOS"

# Make tools executable
chmod +x "$SKILL_DIR/tools/"*.ts 2>/dev/null || true

echo "OK Set file permissions"
```

---

## Phase 5: Verification

**Run the checks from VERIFY.md**

### 5.1 Run Verification

Execute all checks from `VERIFY.md` in the pack directory.

### 5.2 Present Results

```
"Installation complete! Here's the verification summary:

Files installed:
- SKILL.md: [OK/MISSING]
- Workflows (7): [OK/MISSING count]
- Models (6): [OK/MISSING count]
- Tools (5): [OK/MISSING count]
- Templates (7): [OK/MISSING count]

Dependencies:
- Bun runtime: [available/not found]
- Tool dependencies: [installed/not installed]

Company data directory: [path]

[If all OK]: CompanyOS is ready to use! Try: 'Create a new company for [your business]'

[If issues]: Some checks failed. Review the issues above and re-run installation if needed."
```

---

## Rollback Instructions

If installation fails and user wants to restore:

```bash
CLAUDE_DIR="$HOME/.claude"
BACKUP_DIR="$CLAUDE_DIR/backups/CompanyOS-{timestamp}"

# Remove failed installation
rm -rf "$CLAUDE_DIR/skills/CompanyOS"

# Restore from backup
cp -r "$BACKUP_DIR/CompanyOS" "$CLAUDE_DIR/skills/"

echo "Restored from backup"
```

---

## Post-Installation Notes

1. **First use:** Try "Create a new company for [business description]" to test the installation
2. **Tools:** Run tools directly with `bun ~/.claude/skills/CompanyOS/tools/graph-query.ts --help`
3. **Data location:** Company data is stored separately from the skill at the configured location
4. **Updates:** Re-run this installer to update; your company data is preserved
