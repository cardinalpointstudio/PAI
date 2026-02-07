# Stop running dev servers and services

Stop development servers and optionally Docker containers.

## Instructions

1. **Find Running Servers**
   - Check for processes on common dev ports: 3000, 3001, 5173, 8080
   - Use `lsof -i :<port>` or `ss -tlnp` to find processes
   - Identify the process names (node, bun, next, vite, etc.)

2. **Kill Dev Servers**
   - Kill processes on dev ports
   - Use `kill <pid>` (not kill -9 unless necessary)

3. **Handle Docker** (optional)
   - Ask or check if user wants to stop Docker containers too
   - If yes: `docker compose down`
   - If no: leave containers running for faster restart

4. **Verify**
   - Confirm ports are now free
   - Report what was stopped

## Output Format

```
🛑 Stopping Services
━━━━━━━━━━━━━━━━━━━━

Dev servers:
  ✓ Killed bun (port 3000, PID 12345)
  ✓ Killed node (port 3001, PID 12346)

Docker:
  ⏸ Containers still running (use /stop docker to stop)

━━━━━━━━━━━━━━━━━━━━
✓ All dev servers stopped
```

If nothing running:
```
✓ No dev servers running

Docker containers:
  • postgres (running)
  • redis (running)

Use /stop docker to stop containers.
```

## Arguments

- `/stop` - Stop dev servers only
- `/stop all` - Stop dev servers and Docker containers
- `/stop docker` - Stop only Docker containers
