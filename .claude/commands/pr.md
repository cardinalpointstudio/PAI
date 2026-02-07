# Create a pull request

Create a well-formatted pull request for the current branch.

## Instructions

1. **Gather Context**
   - Get current branch name
   - Determine base branch (usually `main` or `master`)
   - Check if branch is pushed to remote
   - Get all commits since diverging from base: `git log main..HEAD --oneline`
   - Get full diff against base: `git diff main...HEAD --stat`

2. **Analyze Changes**
   - Read the commit messages to understand the changes
   - Look at the files changed to understand scope
   - Identify the type: feature, fix, refactor, docs, etc.

3. **Push if Needed**
   - If branch isn't pushed, run `git push -u origin <branch>`

4. **Create PR**
   Use `gh pr create` with this format:

```bash
gh pr create --title "<type>: <description>" --body "$(cat <<'EOF'
## Summary

<2-4 bullet points describing what this PR does>

## Changes

<list key files/components modified>

## Test Plan

- [ ] Unit tests pass (`bun test`)
- [ ] Build succeeds (`bun run build`)
- [ ] <any manual testing steps>

## Notes

<any additional context, breaking changes, or follow-up tasks>

---
🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

5. **Return PR URL**
   - Display the created PR URL
   - Show a summary of what was included

## Output Format

```
🚀 Creating Pull Request
━━━━━━━━━━━━━━━━━━━━━━━━

Branch: feature/booking-system → main
Commits: 5 commits
Files: 12 changed (+340, -89)

Pushing to origin...
  ✓ Branch pushed

Creating PR...
  ✓ PR created

━━━━━━━━━━━━━━━━━━━━━━━━
✓ https://github.com/user/repo/pull/123
```

## Notes

- Never force push
- If PR already exists, show the existing PR URL instead
- Check for uncommitted changes and warn user
- Title should follow conventional commits: feat:, fix:, refactor:, docs:, chore:
