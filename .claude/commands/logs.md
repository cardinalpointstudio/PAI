# View logs from running services

Show logs from dev servers, Docker containers, or background tasks.

## Instructions

1. **Identify Log Sources**
   - Check for running background Bash tasks (dev servers started with /dev)
   - Check for Docker containers
   - Check for log files in common locations

2. **Display Logs**
   - For background tasks: Use `TaskOutput` tool with the task ID
   - For Docker: `docker compose logs --tail=50`
   - For log files: `tail -50 <logfile>`

3. **Format Output**
   - Show last 50 lines by default
   - Highlight errors in red (if terminal supports)
   - Show timestamps if available

## Output Format

```
📜 Logs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Dev Server - port 3000]
  ▶ Ready in 1.2s
  ▶ Local: http://localhost:3000
  ○ Compiling /api/users...
  ✓ Compiled in 234ms
  GET /api/users 200 12ms
  GET /dashboard 200 45ms

[Docker - postgres]
  LOG: database system is ready

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Showing last 50 lines. Use /logs 100 for more.
```

If no services running:
```
⚠ No running services found

Start a dev server with /dev first.
```

## Arguments

- `/logs` - Show last 50 lines from all sources
- `/logs 100` - Show last 100 lines
- `/logs docker` - Show only Docker logs
- `/logs dev` - Show only dev server logs
- `/logs <container>` - Show logs for specific container (e.g., /logs postgres)
