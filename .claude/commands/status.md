# Quick project status overview

Show a comprehensive status of the current working directory's project state.

## Instructions

Run these checks in parallel and display a unified status report:

1. **Git Status**
   - Current branch
   - Commits ahead/behind remote
   - Modified, staged, and untracked files (summarized counts)

2. **Recent Activity**
   - Last 3 commits with timestamps
   - Most recently modified files (last 5)

3. **Running Processes** (if applicable)
   - Check for running dev servers (ports 3000, 3001, 5173, 8080)
   - Check for running Docker containers related to the project

4. **Health Checks**
   - Check if node_modules exists (or bun.lock)
   - Check if .env exists (don't show contents)
   - Check for TypeScript errors: `bun run tsc --noEmit 2>&1 | tail -5` (only if tsconfig.json exists)

## Output Format

```
📊 Project Status: {directory_name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Git: {branch} ({ahead/behind status})
  {staged} staged | {modified} modified | {untracked} untracked

Recent commits:
  • {time_ago} {message}
  • {time_ago} {message}
  • {time_ago} {message}

Running services:
  ✓ Dev server (port 3000)
  ✓ PostgreSQL (Docker)
  ✗ No services detected

Health:
  ✓ Dependencies installed
  ✓ Environment configured
  ⚠ 3 TypeScript errors (run `bun run tsc` for details)
```

Keep output concise. Use ✓ for good, ✗ for missing, ⚠ for warnings.
