# PAI ProjectScaffold Skill Verification

> **MANDATORY:** All checks must pass before installation is complete.

---

## Quick Verification

```bash
# Run these commands to verify installation
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

ls "$PAI_DIR/skills/ProjectScaffold/SKILL.md" && echo "✓ SKILL.md exists"
ls "$PAI_DIR/skills/ProjectScaffold/workflows/" && echo "✓ workflows directory exists"
ls "$PAI_DIR/skills/ProjectScaffold/templates/fullstack/" && echo "✓ fullstack template exists"
ls "$PAI_DIR/skills/ProjectScaffold/templates/fullstack/"*.json | wc -l | xargs -I {} echo "✓ {} JSON config files found"
```

---

## Detailed Checklist

### 1. File Structure

| # | Check | Command | Pass Criteria | Status |
|---|-------|---------|---------------|--------|
| 1 | SKILL.md exists | `ls ~/.claude/skills/ProjectScaffold/SKILL.md` | File present | [ ] |
| 2 | workflows directory | `ls ~/.claude/skills/ProjectScaffold/workflows/` | Directory exists | [ ] |
| 3 | Scaffold.md | `ls ~/.claude/skills/ProjectScaffold/workflows/Scaffold.md` | File present | [ ] |
| 4 | AddTooling.md | `ls ~/.claude/skills/ProjectScaffold/workflows/AddTooling.md` | File present | [ ] |
| 5 | templates directory | `ls ~/.claude/skills/ProjectScaffold/templates/` | Directory exists | [ ] |
| 6 | fullstack template | `ls ~/.claude/skills/ProjectScaffold/templates/fullstack/` | Directory exists | [ ] |

### 2. Template Files

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
TEMPLATE="$PAI_DIR/skills/ProjectScaffold/templates/fullstack"

# Core configs
[ -f "$TEMPLATE/package.json" ] && echo "✓ package.json"
[ -f "$TEMPLATE/tsconfig.json" ] && echo "✓ tsconfig.json"
[ -f "$TEMPLATE/biome.json" ] && echo "✓ biome.json"
[ -f "$TEMPLATE/vite.config.ts" ] && echo "✓ vite.config.ts"
[ -f "$TEMPLATE/vitest.config.ts" ] && echo "✓ vitest.config.ts"
[ -f "$TEMPLATE/.gitignore" ] && echo "✓ .gitignore"
[ -f "$TEMPLATE/README.md" ] && echo "✓ README.md"

# Source files
[ -f "$TEMPLATE/src/server/index.ts" ] && echo "✓ src/server/index.ts"
[ -f "$TEMPLATE/src/client/index.tsx" ] && echo "✓ src/client/index.tsx"
[ -f "$TEMPLATE/src/client/index.html" ] && echo "✓ src/client/index.html"
[ -f "$TEMPLATE/src/client/components/App.tsx" ] && echo "✓ src/client/components/App.tsx"
[ -f "$TEMPLATE/src/shared/types.ts" ] && echo "✓ src/shared/types.ts"

# Tests
[ -f "$TEMPLATE/tests/server/health.test.ts" ] && echo "✓ tests/server/health.test.ts"

# Husky
[ -f "$TEMPLATE/.husky/pre-commit" ] && echo "✓ .husky/pre-commit"
```

### 3. Functionality Tests

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Test 1: Check skill triggers are documented
grep -q "USE WHEN" "$PAI_DIR/skills/ProjectScaffold/SKILL.md" && echo "✓ USE WHEN triggers present"

# Test 2: Check workflow routing table exists
grep -q "Scaffold" "$PAI_DIR/skills/ProjectScaffold/SKILL.md" && echo "✓ Workflow routing present"

# Test 3: Verify all workflows have step-by-step structure
grep -q "Step 1" "$PAI_DIR/skills/ProjectScaffold/workflows/Scaffold.md" && echo "✓ Scaffold has steps"
grep -q "Step 1" "$PAI_DIR/skills/ProjectScaffold/workflows/AddTooling.md" && echo "✓ AddTooling has steps"

# Test 4: Check template variables are documented
grep -q "{{PROJECT_NAME}}" "$PAI_DIR/skills/ProjectScaffold/SKILL.md" && echo "✓ Template variables documented"
```

### 4. Integration Test

Ask the AI: "What project scaffolding workflows are available?"

Expected response should mention:
- Scaffold - create new full-stack project
- AddTooling - add tooling to existing project
- fullstack template with Bun, Vite, TypeScript

### 5. Template Content Tests

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"
TEMPLATE="$PAI_DIR/skills/ProjectScaffold/templates/fullstack"

# Check package.json has expected scripts
grep -q '"dev"' "$TEMPLATE/package.json" && echo "✓ dev script present"
grep -q '"build"' "$TEMPLATE/package.json" && echo "✓ build script present"
grep -q '"test"' "$TEMPLATE/package.json" && echo "✓ test script present"
grep -q '"lint"' "$TEMPLATE/package.json" && echo "✓ lint script present"

# Check tsconfig has strict mode
grep -q '"strict"' "$TEMPLATE/tsconfig.json" && echo "✓ strict mode enabled"

# Check biome has linter enabled
grep -q '"linter"' "$TEMPLATE/biome.json" && echo "✓ linter configured"

# Check template variables exist for replacement
grep -q '{{PROJECT_NAME}}' "$TEMPLATE/package.json" && echo "✓ PROJECT_NAME variable in package.json"
```

---

## Verification Complete

When all checks pass:
- [ ] All file structure checks passed
- [ ] All template files present
- [ ] All functionality tests passed
- [ ] Integration test successful
- [ ] Template content tests passed

**Installation verified. ProjectScaffold skill is ready for use.**
