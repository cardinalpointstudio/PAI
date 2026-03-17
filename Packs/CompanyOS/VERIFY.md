# CompanyOS Skill Verification

> **FOR AI AGENTS:** Complete this checklist AFTER installation. Every file check must pass before declaring the pack installed. Dependency checks are informational only.

---

## File Verification

### Check SKILL.md exists

```bash
CLAUDE_DIR="$HOME/.claude"
[ -f "$CLAUDE_DIR/skills/CompanyOS/SKILL.md" ] && echo "OK SKILL.md" || echo "MISSING SKILL.md"
```

**Expected:** SKILL.md present at `~/.claude/skills/CompanyOS/SKILL.md`.

### Check directories exist

```bash
CLAUDE_DIR="$HOME/.claude"
[ -d "$CLAUDE_DIR/skills/CompanyOS/workflows" ] && echo "OK workflows/" || echo "MISSING workflows/"
[ -d "$CLAUDE_DIR/skills/CompanyOS/models" ] && echo "OK models/" || echo "MISSING models/"
[ -d "$CLAUDE_DIR/skills/CompanyOS/tools" ] && echo "OK tools/" || echo "MISSING tools/"
[ -d "$CLAUDE_DIR/skills/CompanyOS/templates" ] && echo "OK templates/" || echo "MISSING templates/"
```

**Expected:** All four subdirectories present.

### Check workflow files exist

```bash
CLAUDE_DIR="$HOME/.claude"
WORKFLOW_DIR="$CLAUDE_DIR/skills/CompanyOS/workflows"

echo "Checking workflows..."
[ -f "$WORKFLOW_DIR/CreateCompany.md" ] && echo "OK CreateCompany.md" || echo "MISSING CreateCompany.md"
[ -f "$WORKFLOW_DIR/MapValueStream.md" ] && echo "OK MapValueStream.md" || echo "MISSING MapValueStream.md"
[ -f "$WORKFLOW_DIR/CreateSOP.md" ] && echo "OK CreateSOP.md" || echo "MISSING CreateSOP.md"
[ -f "$WORKFLOW_DIR/AssignRoles.md" ] && echo "OK AssignRoles.md" || echo "MISSING AssignRoles.md"
[ -f "$WORKFLOW_DIR/AutomationAudit.md" ] && echo "OK AutomationAudit.md" || echo "MISSING AutomationAudit.md"
[ -f "$WORKFLOW_DIR/WeeklyReview.md" ] && echo "OK WeeklyReview.md" || echo "MISSING WeeklyReview.md"
[ -f "$WORKFLOW_DIR/MonthlyReview.md" ] && echo "OK MonthlyReview.md" || echo "MISSING MonthlyReview.md"
```

**Expected:** All 7 workflow files present.

### Check model files exist

```bash
CLAUDE_DIR="$HOME/.claude"
MODEL_DIR="$CLAUDE_DIR/skills/CompanyOS/models"

echo "Checking models..."
[ -f "$MODEL_DIR/CompanyGraph.md" ] && echo "OK CompanyGraph.md" || echo "MISSING CompanyGraph.md"
[ -f "$MODEL_DIR/OrgModel.md" ] && echo "OK OrgModel.md" || echo "MISSING OrgModel.md"
[ -f "$MODEL_DIR/IdealState.md" ] && echo "OK IdealState.md" || echo "MISSING IdealState.md"
[ -f "$MODEL_DIR/AutomationBacklog.md" ] && echo "OK AutomationBacklog.md" || echo "MISSING AutomationBacklog.md"
[ -f "$MODEL_DIR/ToolRegistry.md" ] && echo "OK ToolRegistry.md" || echo "MISSING ToolRegistry.md"
[ -f "$MODEL_DIR/Principles.md" ] && echo "OK Principles.md" || echo "MISSING Principles.md"
```

**Expected:** All 6 model files present.

### Check tool files exist

```bash
CLAUDE_DIR="$HOME/.claude"
TOOL_DIR="$CLAUDE_DIR/skills/CompanyOS/tools"

echo "Checking tools..."
[ -f "$TOOL_DIR/graph-query.ts" ] && echo "OK graph-query.ts" || echo "MISSING graph-query.ts"
[ -f "$TOOL_DIR/validate-constraints.ts" ] && echo "OK validate-constraints.ts" || echo "MISSING validate-constraints.ts"
[ -f "$TOOL_DIR/score-automation.ts" ] && echo "OK score-automation.ts" || echo "MISSING score-automation.ts"
[ -f "$TOOL_DIR/metrics-dashboard.ts" ] && echo "OK metrics-dashboard.ts" || echo "MISSING metrics-dashboard.ts"
[ -f "$TOOL_DIR/show-gaps.ts" ] && echo "OK show-gaps.ts" || echo "MISSING show-gaps.ts"
```

**Expected:** All 5 tool files present.

### Check template files exist

```bash
CLAUDE_DIR="$HOME/.claude"
TEMPLATE_DIR="$CLAUDE_DIR/skills/CompanyOS/templates"

echo "Checking templates..."
[ -f "$TEMPLATE_DIR/company-graph.json" ] && echo "OK company-graph.json" || echo "MISSING company-graph.json"
[ -f "$TEMPLATE_DIR/ideal-state.yaml" ] && echo "OK ideal-state.yaml" || echo "MISSING ideal-state.yaml"
[ -f "$TEMPLATE_DIR/org-model.yaml" ] && echo "OK org-model.yaml" || echo "MISSING org-model.yaml"
[ -f "$TEMPLATE_DIR/sop.md" ] && echo "OK sop.md" || echo "MISSING sop.md"
[ -f "$TEMPLATE_DIR/automation-backlog.md" ] && echo "OK automation-backlog.md" || echo "MISSING automation-backlog.md"
[ -f "$TEMPLATE_DIR/tool-registry.md" ] && echo "OK tool-registry.md" || echo "MISSING tool-registry.md"
[ -f "$TEMPLATE_DIR/principles.md" ] && echo "OK principles.md" || echo "MISSING principles.md"
```

**Expected:** All 7 template files present.

### Check frontmatter is valid

```bash
CLAUDE_DIR="$HOME/.claude"
if [ -f "$CLAUDE_DIR/skills/CompanyOS/SKILL.md" ]; then
  head -1 "$CLAUDE_DIR/skills/CompanyOS/SKILL.md" | grep -q "^---" && echo "OK SKILL.md has frontmatter opener" || echo "ERROR SKILL.md missing frontmatter"
  grep -q "^name:" "$CLAUDE_DIR/skills/CompanyOS/SKILL.md" && echo "OK SKILL.md has name field" || echo "ERROR SKILL.md missing name field"
  grep -q "^description:" "$CLAUDE_DIR/skills/CompanyOS/SKILL.md" && echo "OK SKILL.md has description field" || echo "ERROR SKILL.md missing description"
  grep -q "USE WHEN" "$CLAUDE_DIR/skills/CompanyOS/SKILL.md" && echo "OK SKILL.md has USE WHEN triggers" || echo "WARNING SKILL.md missing USE WHEN triggers"
fi
```

**Expected:** Frontmatter present with name, description, and USE WHEN triggers.

---

## Dependency Verification

### Check Bun runtime

```bash
if command -v bun &> /dev/null; then
  echo "OK Bun runtime available: $(bun --version)"
else
  echo "WARNING Bun runtime not found"
  echo "  Install with: curl -fsSL https://bun.sh/install | bash"
  echo "  Tools will not work until Bun is installed"
fi
```

**Expected:** Bun available. If not, tools require manual installation later.

### Check tool dependencies installed

```bash
CLAUDE_DIR="$HOME/.claude"
TOOL_DIR="$CLAUDE_DIR/skills/CompanyOS/tools"

if [ -d "$TOOL_DIR/node_modules" ]; then
  echo "OK Tool dependencies installed"
else
  echo "INFO Tool dependencies not installed"
  echo "  Run: cd $TOOL_DIR && bun install"
fi
```

**Expected:** node_modules present, or informational message about how to install.

### Test tool execution (optional)

```bash
CLAUDE_DIR="$HOME/.claude"
TOOL_DIR="$CLAUDE_DIR/skills/CompanyOS/tools"

if command -v bun &> /dev/null && [ -f "$TOOL_DIR/graph-query.ts" ]; then
  cd "$TOOL_DIR"
  bun run graph-query.ts --help 2>/dev/null && echo "OK graph-query.ts executes" || echo "INFO graph-query.ts needs dependencies"
fi
```

**Expected:** Tool runs with --help, or needs dependencies installed.

---

## Data Directory Verification

### Check company-os directory

```bash
# Check common locations
if [ -d "$HOME/company-os" ]; then
  echo "OK Company data directory at ~/company-os"
  ls -la "$HOME/company-os/" 2>/dev/null
elif [ -d "./company-os" ]; then
  echo "OK Company data directory at ./company-os"
  ls -la "./company-os/" 2>/dev/null
else
  echo "INFO No company-os data directory yet (will be created on first use)"
fi
```

**Expected:** Directory exists or will be created on first use.

---

## Summary Check

Run all checks and produce summary:

```bash
CLAUDE_DIR="$HOME/.claude"
SKILL_DIR="$CLAUDE_DIR/skills/CompanyOS"

echo "========================================="
echo "CompanyOS Installation Verification"
echo "========================================="

# Count files
WORKFLOW_COUNT=$(ls -1 "$SKILL_DIR/workflows/"*.md 2>/dev/null | wc -l)
MODEL_COUNT=$(ls -1 "$SKILL_DIR/models/"*.md 2>/dev/null | wc -l)
TOOL_COUNT=$(ls -1 "$SKILL_DIR/tools/"*.ts 2>/dev/null | wc -l)
TEMPLATE_COUNT=$(ls -1 "$SKILL_DIR/templates/"* 2>/dev/null | wc -l)

echo "SKILL.md:   $([ -f "$SKILL_DIR/SKILL.md" ] && echo 'OK' || echo 'MISSING')"
echo "Workflows:  $WORKFLOW_COUNT/7"
echo "Models:     $MODEL_COUNT/6"
echo "Tools:      $TOOL_COUNT/5"
echo "Templates:  $TEMPLATE_COUNT/7"
echo ""
echo "Bun:        $(command -v bun &>/dev/null && echo 'OK' || echo 'NOT FOUND')"
echo "Dependencies: $([ -d "$SKILL_DIR/tools/node_modules" ] && echo 'INSTALLED' || echo 'NOT INSTALLED')"
echo "========================================="

# Final verdict
if [ -f "$SKILL_DIR/SKILL.md" ] && [ "$WORKFLOW_COUNT" -eq 7 ] && [ "$MODEL_COUNT" -eq 6 ] && [ "$TOOL_COUNT" -eq 5 ]; then
  echo "RESULT: Installation SUCCESSFUL"
else
  echo "RESULT: Installation INCOMPLETE - check missing files"
fi
```

---

## Troubleshooting

### Missing files

If files are missing, re-run the installation from Phase 4.2 in INSTALL.md.

### Tools not working

1. Ensure Bun is installed: `curl -fsSL https://bun.sh/install | bash`
2. Install dependencies: `cd ~/.claude/skills/CompanyOS/tools && bun install`
3. Test: `bun run graph-query.ts --help`

### Permission issues

```bash
chmod -R u+rw ~/.claude/skills/CompanyOS/
chmod +x ~/.claude/skills/CompanyOS/tools/*.ts
```

### Frontmatter not recognized

Ensure SKILL.md starts with `---` on the first line (no blank lines before it).
