# PAI ProjectScaffold Skill v1.0.0 - Installation Guide

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
"I'm installing PAI ProjectScaffold Skill v1.0.0 - Project bootstrapping workflows. This skill helps you create new TypeScript projects with proper structure, tooling, and configuration.

Let me analyze your system and guide you through installation."
```

---

## Phase 1: System Analysis

**Execute this analysis BEFORE any file operations.**

### 1.1 Run These Commands

```bash
PAI_CHECK="${PAI_DIR:-$HOME/.claude}"
echo "PAI_DIR: $PAI_CHECK"

# Check for existing ProjectScaffold skill
if [ -d "$PAI_CHECK/skills/ProjectScaffold" ]; then
  echo "WARNING Existing ProjectScaffold skill found at: $PAI_CHECK/skills/ProjectScaffold"
  ls "$PAI_CHECK/skills/ProjectScaffold/"
else
  echo "OK No existing ProjectScaffold skill (clean install)"
fi

# Check for Bun (required runtime)
if command -v bun &> /dev/null; then
  echo "OK Bun installed: $(bun --version)"
else
  echo "WARNING Bun not found - ProjectScaffold skill requires Bun"
fi
```

### 1.2 Present Findings

Tell the user what you found:
```
"Here's what I found on your system:
- Existing ProjectScaffold skill: [Yes / No]
- Bun runtime: [installed / not found]

Note: Bun is required for the scaffold templates to work."
```

---

## Phase 2: User Questions

**Use AskUserQuestion tool at each decision point.**

### Question 1: Conflict Resolution (if existing skill found)

**Only ask if existing ProjectScaffold directory detected:**

```json
{
  "header": "Conflict",
  "question": "Existing ProjectScaffold skill detected. How should I proceed?",
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
  "question": "Ready to install PAI ProjectScaffold Skill v1.0.0?",
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
BACKUP_DIR="$PAI_DIR/Backups/projectscaffold-skill-$(date +%Y%m%d-%H%M%S)"

if [ -d "$PAI_DIR/skills/ProjectScaffold" ]; then
  mkdir -p "$BACKUP_DIR"
  cp -r "$PAI_DIR/skills/ProjectScaffold" "$BACKUP_DIR/"
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
    {"content": "Copy template files", "status": "pending", "activeForm": "Copying templates"},
    {"content": "Run verification", "status": "pending", "activeForm": "Running verification"}
  ]
}
```

### 4.1 Create Directory Structure

**Mark todo "Create directory structure" as in_progress.**

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
mkdir -p "$PAI_DIR/skills/ProjectScaffold/workflows"
mkdir -p "$PAI_DIR/skills/ProjectScaffold/templates"
mkdir -p "$PAI_DIR/skills/ProjectScaffold/tools"
```

**Mark todo as completed.**

### 4.2 Copy Skill Files

**Mark todo "Copy skill files from pack" as in_progress.**

Copy skill and workflow files from the pack's `src/skills/ProjectScaffold/` directory:

```bash
PACK_DIR="$(pwd)"
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

cp "$PACK_DIR/src/skills/ProjectScaffold/SKILL.md" "$PAI_DIR/skills/ProjectScaffold/"
cp "$PACK_DIR/src/skills/ProjectScaffold/workflows/"*.md "$PAI_DIR/skills/ProjectScaffold/workflows/"
```

**Mark todo as completed.**

### 4.3 Copy Template Files

**Mark todo "Copy template files" as in_progress.**

Copy the fullstack template directory:

```bash
PACK_DIR="$(pwd)"
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

cp -r "$PACK_DIR/src/skills/ProjectScaffold/templates/fullstack" "$PAI_DIR/skills/ProjectScaffold/templates/"
```

**Files included in fullstack template:**
- `package.json` - Project dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `biome.json` - Linting and formatting
- `vite.config.ts` - Build configuration
- `vitest.config.ts` - Test configuration
- `.gitignore` - Git ignore patterns
- `README.md` - Project documentation template
- `src/server/index.ts` - Server entry point
- `src/client/index.tsx` - Client entry point
- `src/client/index.html` - HTML template
- `src/client/components/App.tsx` - Root React component
- `src/shared/types.ts` - Shared TypeScript types
- `tests/server/health.test.ts` - Example test
- `.husky/pre-commit` - Git pre-commit hook

**Mark todo as completed.**

---

## Phase 5: Verification

**Mark todo "Run verification" as in_progress.**

**Execute all checks from VERIFY.md:**

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

echo "=== PAI ProjectScaffold Skill v1.0.0 Verification ==="

# Check skill files
echo "Checking skill files..."
[ -f "$PAI_DIR/skills/ProjectScaffold/SKILL.md" ] && echo "OK SKILL.md" || echo "ERROR SKILL.md missing"
[ -d "$PAI_DIR/skills/ProjectScaffold/workflows" ] && echo "OK workflows directory" || echo "ERROR workflows directory missing"
[ -d "$PAI_DIR/skills/ProjectScaffold/templates" ] && echo "OK templates directory" || echo "ERROR templates directory missing"

# Check workflows
echo ""
echo "Checking workflows..."
[ -f "$PAI_DIR/skills/ProjectScaffold/workflows/Scaffold.md" ] && echo "OK Scaffold.md" || echo "ERROR Scaffold.md missing"
[ -f "$PAI_DIR/skills/ProjectScaffold/workflows/AddTooling.md" ] && echo "OK AddTooling.md" || echo "ERROR AddTooling.md missing"

# Check templates
echo ""
echo "Checking templates..."
[ -d "$PAI_DIR/skills/ProjectScaffold/templates/fullstack" ] && echo "OK fullstack template" || echo "ERROR fullstack template missing"
[ -f "$PAI_DIR/skills/ProjectScaffold/templates/fullstack/package.json" ] && echo "OK package.json" || echo "ERROR package.json missing"
[ -f "$PAI_DIR/skills/ProjectScaffold/templates/fullstack/tsconfig.json" ] && echo "OK tsconfig.json" || echo "ERROR tsconfig.json missing"

TEMPLATE_COUNT=$(find "$PAI_DIR/skills/ProjectScaffold/templates/fullstack" -type f | wc -l)
echo "Found $TEMPLATE_COUNT template files"

echo "=== Verification Complete ==="
```

**Mark todo as completed when all checks pass.**

---

## Success/Failure Messages

### On Success

```
"PAI ProjectScaffold Skill v1.0.0 installed successfully!

What's available:
- Scaffold: Create new full-stack TypeScript projects
- AddTooling: Add Biome, Husky, Vitest to existing projects

Usage:
- 'Create a new project called my-app' - Full project setup
- 'Scaffold a fullstack app in ~/projects/dashboard' - Custom location
- 'Add biome to this project' - Add linting to existing project
- 'Add testing to my project' - Add Vitest setup

Templates include:
- Bun runtime
- Vite for frontend
- TypeScript (strict mode)
- Biome linting/formatting
- Vitest testing
- Husky git hooks"
```

### On Failure

```
"Installation encountered issues. Here's what to check:

1. Check directory permissions on $PAI_DIR/skills/
2. Verify all workflow and template files copied from pack
3. Run the verification commands in VERIFY.md

Need help? Check the Troubleshooting section below."
```

---

## Troubleshooting

### Skill not recognized

```bash
# Verify SKILL.md exists
ls -la $PAI_DIR/skills/ProjectScaffold/SKILL.md

# Check frontmatter is valid
head -10 $PAI_DIR/skills/ProjectScaffold/SKILL.md
```

### Workflows not found

```bash
# Check workflow files
ls -la $PAI_DIR/skills/ProjectScaffold/workflows/

# Re-copy if missing
cp -r src/skills/ProjectScaffold/workflows/* $PAI_DIR/skills/ProjectScaffold/workflows/
```

### Templates not found

```bash
# Check template files
ls -la $PAI_DIR/skills/ProjectScaffold/templates/fullstack/

# Re-copy if missing
cp -r src/skills/ProjectScaffold/templates/fullstack $PAI_DIR/skills/ProjectScaffold/templates/
```

---

## What's Included

### Skill Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Skill definition and routing |
| `workflows/Scaffold.md` | New project creation workflow |
| `workflows/AddTooling.md` | Add tooling to existing projects |
| `templates/fullstack/` | Full-stack project template |

---

## Usage

### Create New Project

```
"Create a new project called my-dashboard"
→ Creates directory structure
→ Copies template files
→ Replaces template variables
→ Initializes git
→ Installs dependencies
→ Runs verification
```

### Add Tooling

```
"Add Biome to my project"
→ Installs @biomejs/biome
→ Creates biome.json
→ Adds lint scripts
→ Runs initial lint
```
