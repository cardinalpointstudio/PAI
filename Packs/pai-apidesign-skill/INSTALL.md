# PAI APIDesign Skill v1.0.0 - Installation Guide

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
"I'm installing PAI APIDesign Skill v1.0.0 - REST API design workflows. This skill helps you design consistent, well-documented APIs with proper conventions.

Let me analyze your system and guide you through installation."
```

---

## Phase 1: System Analysis

**Execute this analysis BEFORE any file operations.**

### 1.1 Run These Commands

```bash
PAI_CHECK="${PAI_DIR:-$HOME/.claude}"
echo "PAI_DIR: $PAI_CHECK"

# Check for existing APIDesign skill
if [ -d "$PAI_CHECK/skills/APIDesign" ]; then
  echo "WARNING Existing APIDesign skill found at: $PAI_CHECK/skills/APIDesign"
  ls "$PAI_CHECK/skills/APIDesign/"
else
  echo "OK No existing APIDesign skill (clean install)"
fi
```

### 1.2 Present Findings

Tell the user what you found:
```
"Here's what I found on your system:
- Existing APIDesign skill: [Yes / No]"
```

---

## Phase 2: User Questions

**Use AskUserQuestion tool at each decision point.**

### Question 1: Conflict Resolution (if existing skill found)

**Only ask if existing APIDesign directory detected:**

```json
{
  "header": "Conflict",
  "question": "Existing APIDesign skill detected. How should I proceed?",
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
  "question": "Ready to install PAI APIDesign Skill v1.0.0?",
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
BACKUP_DIR="$PAI_DIR/Backups/apidesign-skill-$(date +%Y%m%d-%H%M%S)"

if [ -d "$PAI_DIR/skills/APIDesign" ]; then
  mkdir -p "$BACKUP_DIR"
  cp -r "$PAI_DIR/skills/APIDesign" "$BACKUP_DIR/"
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
mkdir -p "$PAI_DIR/skills/APIDesign/workflows"
```

**Mark todo as completed.**

### 4.2 Copy Skill Files

**Mark todo "Copy skill files from pack" as in_progress.**

Copy all files from the pack's `src/skills/APIDesign/` directory:

```bash
PACK_DIR="$(pwd)"
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

cp -r "$PACK_DIR/src/skills/APIDesign/"* "$PAI_DIR/skills/APIDesign/"
```

**Files included:**
- `SKILL.md` - Main skill definition and routing
- `APIPatterns.md` - URL design, status codes, error handling patterns
- `workflows/DesignEndpoint.md` - Design new API endpoints
- `workflows/DocumentAPI.md` - Generate OpenAPI documentation
- `workflows/ValidateContract.md` - Validate API consistency
- `workflows/VersionAPI.md` - Handle API versioning

**Mark todo as completed.**

---

## Phase 5: Verification

**Mark todo "Run verification" as in_progress.**

**Execute all checks from VERIFY.md:**

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

echo "=== PAI APIDesign Skill v1.0.0 Verification ==="

# Check skill files
echo "Checking skill files..."
[ -f "$PAI_DIR/skills/APIDesign/SKILL.md" ] && echo "OK SKILL.md" || echo "ERROR SKILL.md missing"
[ -f "$PAI_DIR/skills/APIDesign/APIPatterns.md" ] && echo "OK APIPatterns.md" || echo "ERROR APIPatterns.md missing"
[ -d "$PAI_DIR/skills/APIDesign/workflows" ] && echo "OK workflows directory" || echo "ERROR workflows directory missing"

# Check workflows
echo ""
echo "Checking workflows..."
[ -f "$PAI_DIR/skills/APIDesign/workflows/DesignEndpoint.md" ] && echo "OK DesignEndpoint.md" || echo "ERROR DesignEndpoint.md missing"
[ -f "$PAI_DIR/skills/APIDesign/workflows/DocumentAPI.md" ] && echo "OK DocumentAPI.md" || echo "ERROR DocumentAPI.md missing"
[ -f "$PAI_DIR/skills/APIDesign/workflows/ValidateContract.md" ] && echo "OK ValidateContract.md" || echo "ERROR ValidateContract.md missing"
[ -f "$PAI_DIR/skills/APIDesign/workflows/VersionAPI.md" ] && echo "OK VersionAPI.md" || echo "ERROR VersionAPI.md missing"

WORKFLOW_COUNT=$(ls "$PAI_DIR/skills/APIDesign/workflows/"*.md 2>/dev/null | wc -l)
echo "Found $WORKFLOW_COUNT workflow files (expected: 4)"

echo "=== Verification Complete ==="
```

**Mark todo as completed when all checks pass.**

---

## Success/Failure Messages

### On Success

```
"PAI APIDesign Skill v1.0.0 installed successfully!

What's available:
- DesignEndpoint: Design REST endpoints with proper conventions
- DocumentAPI: Generate OpenAPI/Swagger specs
- ValidateContract: Check for breaking changes and consistency
- VersionAPI: Handle API versioning and deprecation

Usage:
- 'Design an API for user bookmarks' - Full endpoint design
- 'Generate OpenAPI spec' - Create documentation
- 'Is this change backwards compatible?' - Validate changes
- 'How do I version my API?' - Versioning guidance

Quick reference included:
- HTTP methods and status codes
- URL naming conventions
- Error response formats
- Pagination patterns"
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
ls -la $PAI_DIR/skills/APIDesign/SKILL.md

# Check frontmatter is valid
head -10 $PAI_DIR/skills/APIDesign/SKILL.md
```

### Workflows not found

```bash
# Check workflow files
ls -la $PAI_DIR/skills/APIDesign/workflows/

# Re-copy if missing
cp -r src/skills/APIDesign/workflows/* $PAI_DIR/skills/APIDesign/workflows/
```

---

## What's Included

### Skill Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Skill definition and routing |
| `APIPatterns.md` | Comprehensive patterns reference |
| `workflows/DesignEndpoint.md` | Design new endpoints |
| `workflows/DocumentAPI.md` | Generate OpenAPI specs |
| `workflows/ValidateContract.md` | Validate API consistency |
| `workflows/VersionAPI.md` | Handle API versioning |

---

## Usage

### Design New Endpoint

```
"I need an API to manage user bookmarks"
→ Identifies resource (Bookmark)
→ Defines URL structure (/users/:userId/bookmarks)
→ Creates request/response schemas
→ Documents error cases
→ Outputs Hono implementation
```

### Generate Documentation

```
"Generate OpenAPI spec for our API"
→ Scans route definitions
→ Extracts type definitions
→ Creates openapi.yaml
→ Adds examples for each endpoint
→ Sets up Swagger UI
```

### Validate Changes

```
"Is removing this field a breaking change?"
→ Analyzes change type
→ Identifies impact on clients
→ Suggests migration strategy
→ Documents compatibility
```
