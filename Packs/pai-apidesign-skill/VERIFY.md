# PAI APIDesign Skill Verification

> **MANDATORY:** All checks must pass before installation is complete.

---

## Quick Verification

```bash
# Run these commands to verify installation
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

ls "$PAI_DIR/skills/APIDesign/SKILL.md" && echo "✓ SKILL.md exists"
ls "$PAI_DIR/skills/APIDesign/APIPatterns.md" && echo "✓ APIPatterns.md exists"
ls "$PAI_DIR/skills/APIDesign/workflows/" && echo "✓ workflows directory exists"
ls "$PAI_DIR/skills/APIDesign/workflows/"*.md | wc -l | xargs -I {} echo "✓ {} workflow files found"
```

---

## Detailed Checklist

### 1. File Structure

| # | Check | Command | Pass Criteria | Status |
|---|-------|---------|---------------|--------|
| 1 | SKILL.md exists | `ls ~/.claude/skills/APIDesign/SKILL.md` | File present | [ ] |
| 2 | APIPatterns.md exists | `ls ~/.claude/skills/APIDesign/APIPatterns.md` | File present | [ ] |
| 3 | workflows directory | `ls ~/.claude/skills/APIDesign/workflows/` | Directory exists | [ ] |
| 4 | DesignEndpoint.md | `ls ~/.claude/skills/APIDesign/workflows/DesignEndpoint.md` | File present | [ ] |
| 5 | DocumentAPI.md | `ls ~/.claude/skills/APIDesign/workflows/DocumentAPI.md` | File present | [ ] |
| 6 | ValidateContract.md | `ls ~/.claude/skills/APIDesign/workflows/ValidateContract.md` | File present | [ ] |
| 7 | VersionAPI.md | `ls ~/.claude/skills/APIDesign/workflows/VersionAPI.md` | File present | [ ] |

### 2. Functionality Tests

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Test 1: Check skill triggers are documented
grep -q "USE WHEN" "$PAI_DIR/skills/APIDesign/SKILL.md" && echo "✓ USE WHEN triggers present"

# Test 2: Check workflow routing table exists
grep -q "DesignEndpoint" "$PAI_DIR/skills/APIDesign/SKILL.md" && echo "✓ Workflow routing present"

# Test 3: Check HTTP methods are documented
grep -q "GET" "$PAI_DIR/skills/APIDesign/SKILL.md" && echo "✓ HTTP methods documented"

# Test 4: Verify all workflows have step-by-step structure
grep -q "Step 1" "$PAI_DIR/skills/APIDesign/workflows/DesignEndpoint.md" && echo "✓ DesignEndpoint has steps"
grep -q "Step 1" "$PAI_DIR/skills/APIDesign/workflows/DocumentAPI.md" && echo "✓ DocumentAPI has steps"
grep -q "Step 1" "$PAI_DIR/skills/APIDesign/workflows/ValidateContract.md" && echo "✓ ValidateContract has steps"
grep -q "Step 1" "$PAI_DIR/skills/APIDesign/workflows/VersionAPI.md" && echo "✓ VersionAPI has steps"
```

### 3. Integration Test

Ask the AI: "What API design workflows are available?"

Expected response should mention:
- DesignEndpoint - design REST endpoints
- DocumentAPI - generate OpenAPI specs
- ValidateContract - check consistency and breaking changes
- VersionAPI - handle API versioning

### 4. Workflow Content Tests

```bash
PAI_DIR="${PAI_DIR:-$HOME/.claude}"

# Check DesignEndpoint has schema definitions
grep -q "interface" "$PAI_DIR/skills/APIDesign/workflows/DesignEndpoint.md" && echo "✓ Schema definitions present"

# Check DocumentAPI has OpenAPI structure
grep -q "openapi" "$PAI_DIR/skills/APIDesign/workflows/DocumentAPI.md" && echo "✓ OpenAPI structure documented"

# Check ValidateContract has breaking changes
grep -q "Breaking" "$PAI_DIR/skills/APIDesign/workflows/ValidateContract.md" && echo "✓ Breaking changes documented"

# Check VersionAPI has versioning strategies
grep -q "URL Path" "$PAI_DIR/skills/APIDesign/workflows/VersionAPI.md" && echo "✓ Versioning strategies documented"

# Check APIPatterns has comprehensive patterns
grep -q "Status Codes" "$PAI_DIR/skills/APIDesign/APIPatterns.md" && echo "✓ Status codes documented"
grep -q "Pagination" "$PAI_DIR/skills/APIDesign/APIPatterns.md" && echo "✓ Pagination documented"
grep -q "Error" "$PAI_DIR/skills/APIDesign/APIPatterns.md" && echo "✓ Error handling documented"
```

---

## Verification Complete

When all checks pass:
- [ ] All file structure checks passed
- [ ] All functionality tests passed
- [ ] Integration test successful
- [ ] Workflow content tests passed

**Installation verified. APIDesign skill is ready for use.**
