# Start development server

Start the dev server for the current project in the background.

## Instructions

1. **Check for Running Server**
   - Check if ports 3000, 3001, 5173, 8080 are already in use
   - If dev server is already running, show its status instead of starting a new one

2. **Start Dependencies** (if needed)
   - Check if Docker is needed (look for docker-compose.yml)
   - Start Docker containers if database is required: `docker compose up -d`
   - Wait briefly for services to be ready

3. **Start Dev Server**
   - Detect the correct command from package.json scripts
   - Common commands: `bun dev`, `bun run dev`, `next dev`
   - Run in background using Bash with `run_in_background: true`
   - For grapplingconnect: `cd app && bun dev`

4. **Verify Startup**
   - Wait a few seconds for server to initialize
   - Check if the port is now listening
   - Report the URL

## Output Format

```
🚀 Starting Development Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1/3] Checking dependencies...
  ✓ Docker containers running (PostgreSQL)

[2/3] Starting dev server...
  ✓ Server starting on port 3000

[3/3] Verifying...
  ✓ Server ready

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ http://localhost:3000

Logs: Use /logs to view server output
Stop: Use /stop to kill the server
```

If already running:
```
⚠ Dev server already running on port 3000

  PID: 12345
  URL: http://localhost:3000

Use /stop to kill it first, or /logs to view output.
```

## Notes

- Always run in background so the conversation can continue
- Store the background task ID for later reference with /logs or /stop
- For monorepos, cd into the correct directory first
- Show helpful next steps (open browser, view logs, etc.)
