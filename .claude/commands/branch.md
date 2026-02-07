# Git branch operations

Create, switch, list, and manage git branches.

## Instructions

1. **Check Current State**
   - Get current branch name
   - Check for uncommitted changes
   - Fetch latest from remote: `git fetch --prune`

2. **Execute Subcommand**
   - Run the appropriate operation based on arguments

## Arguments

- `/branch` - List all branches with status
- `/branch <name>` - Create and switch to new branch from main
- `/branch switch <name>` - Switch to existing branch
- `/branch delete <name>` - Delete a branch (with safety checks)
- `/branch clean` - Delete local branches that are merged
- `/branch rename <new>` - Rename current branch
- `/branch from <base> <name>` - Create branch from specific base

## Branch Naming

Auto-prefix based on name patterns:
- `fix-*` or `bug-*` → `fix/<name>`
- `feat-*` or `add-*` → `feature/<name>`
- `chore-*`, `refactor-*` → `chore/<name>`
- `docs-*` → `docs/<name>`
- Or use explicit prefix: `/branch feature/my-thing`

## Output Format

For `/branch` (list):
```
🌿 Branches
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

* main                        (up to date)
  feature/booking-system      ↑3 ↓2 from main
  feature/notifications       ↑5
  fix/login-redirect          (merged ✓)

Stale (>30 days):
  feature/old-experiment      (60 days, not merged)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4 local | 6 remote

/branch clean → Delete 1 merged branch
```

For `/branch booking-flow`:
```
🌿 Creating Branch
━━━━━━━━━━━━━━━━━━

Base: main (fetched, up to date)

  ✓ Created: feature/booking-flow
  ✓ Switched to feature/booking-flow

━━━━━━━━━━━━━━━━━━
Ready to work!
```

For `/branch switch notifications`:
```
🌿 Switching Branch
━━━━━━━━━━━━━━━━━━━

⚠ You have uncommitted changes:
  M src/api/booking.ts

Options:
  1. Stash changes and switch
  2. Commit changes first (/commit)
  3. Cancel

What would you like to do?
```

For `/branch clean`:
```
🌿 Cleaning Merged Branches
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Found 3 merged branches:
  • fix/login-redirect (merged 2 days ago)
  • feature/user-avatar (merged 5 days ago)
  • chore/deps-update (merged 1 week ago)

Delete these branches? (y/n)

  ✓ Deleted 3 branches
```

For `/branch delete feature/old`:
```
🌿 Deleting Branch
━━━━━━━━━━━━━━━━━━

Branch: feature/old

⚠ This branch is NOT merged into main
  Contains 5 commits that will be lost

Are you sure? Type 'delete' to confirm: _
```

## Safety

- Always fetch before operations to ensure up-to-date info
- Warn about uncommitted changes before switching
- Require confirmation for unmerged branch deletion
- Never delete main/master
- Show commits that would be lost when deleting unmerged branches
