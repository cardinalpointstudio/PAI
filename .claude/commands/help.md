# List available slash commands

Show all available project development commands.

## Instructions

Display a formatted list of all slash commands organized by category.

## Output Format

```
📖 Available Commands
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project Context
  /project <name>     Switch to a project (loads config, shows status)
  /status             Quick health check (git, services, errors)
  /help               Show this help message

Git Workflow
  /branch             List branches with status
  /branch <name>      Create and switch to new branch
  /commit             Create commit from staged changes
  /commit all         Stage all and commit
  /pr                 Create pull request

Development
  /dev                Start dev server in background
  /logs               View output from running services
  /stop               Stop dev servers
  /stop all           Stop servers and Docker containers

Testing & Building
  /test               Run unit tests
  /test e2e           Run Playwright e2e tests
  /test coverage      Run with coverage report
  /build              Full pipeline: typecheck → lint → test → build

Database
  /db                 Show database status
  /db studio          Open Drizzle Studio GUI
  /db migrate         Run pending migrations
  /db seed            Seed test data
  /db reset           Drop and recreate (with confirm)

Dependencies
  /dep                Show dependency health
  /dep outdated       List outdated packages
  /dep update         Update to latest compatible
  /dep audit          Security vulnerability scan
  /dep add <pkg>      Add a dependency

Deployment
  /deploy             Show deployment status
  /deploy preview     Deploy preview branch
  /deploy staging     Deploy to staging
  /deploy production  Deploy to production
  /deploy rollback    Rollback to previous

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Typical workflow:
  /project myapp → /branch feature → /dev → /test → /commit → /pr

Use /<command> for more details on each command.
```

## Notes

- Keep descriptions concise (under 50 chars)
- Group by workflow stage
- Show most common variations
- End with example workflow
