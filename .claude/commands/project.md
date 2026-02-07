# Switch to a project context

Load the project configuration from `$ARGUMENTS` and set up the development environment.

## Instructions

1. Read the project config file at `.claude/projects/$ARGUMENTS.json`
2. Extract project details: path, name, stack, commands
3. Change working directory to the project path
4. Run `git status` to show current state
5. Run `git log -3 --oneline` to show recent commits
6. If the project has a CLAUDE.md, note its location
7. Display a formatted summary with:
   - Project name and path
   - Current git branch and status
   - Tech stack
   - Quick reference commands from the config

## Output Format

```
📁 Switched to: {name}
   Path: {path}
   Branch: {branch} ({status})
   Stack: {stack}

Recent commits:
  • {commit1}
  • {commit2}
  • {commit3}

Quick commands:
  {command1}
  {command2}
  ...
```

If the project config doesn't exist, inform the user and list available projects from `.claude/projects/`.
