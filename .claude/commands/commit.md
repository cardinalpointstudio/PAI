# Create a commit

Analyze staged changes and create a well-formatted commit.

## Instructions

1. **Check Current State**
   - Run `git status` to see staged and unstaged changes
   - Run `git diff --cached --stat` to see what's staged
   - If nothing staged, offer to stage all changes or specific files

2. **Analyze Changes**
   - Run `git diff --cached` to see the actual changes
   - Identify the type: feat, fix, refactor, docs, test, chore
   - Understand what the changes accomplish

3. **Check Recent Commits**
   - Run `git log -5 --oneline` to match repository style
   - Follow existing commit message conventions

4. **Generate Commit Message**
   - Title: `<type>: <concise description>` (50 chars max)
   - Body: Explain why, not what (the diff shows what)
   - Keep it brief but informative

5. **Create Commit**
   ```bash
   git commit -m "$(cat <<'EOF'
   <type>: <description>

   <optional body explaining why>

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>
   EOF
   )"
   ```

6. **Verify**
   - Run `git status` to confirm commit succeeded
   - Show the commit hash and message

## Output Format

```
📝 Creating Commit
━━━━━━━━━━━━━━━━━━

Staged changes:
  M src/components/Button.tsx
  M src/components/Button.test.tsx
  A src/components/IconButton.tsx

Analysis:
  Type: feat
  Scope: Added new IconButton component with tests

━━━━━━━━━━━━━━━━━━
✓ Committed: a1b2c3d

  feat: Add IconButton component

  New button variant that supports leading/trailing icons
  with proper accessibility labels.
```

If nothing staged:
```
⚠ No changes staged

Modified files:
  M src/api/booking.ts
  M src/api/booking.test.ts

Stage all? (Use /commit all to stage and commit everything)
```

## Arguments

- `/commit` - Commit staged changes
- `/commit all` - Stage all changes and commit
- `/commit <files>` - Stage specific files and commit

## Safety

- Never commit files that look like secrets (.env, credentials, keys)
- Warn if committing large binary files
- Warn if committing node_modules or other ignored patterns
