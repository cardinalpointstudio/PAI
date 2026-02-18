#!/bin/bash
# Compound Engineering Session Stop
# Gracefully terminates the CE tmux session

SESSION_NAME="ce-dev"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if session exists
if ! tmux has-session -t $SESSION_NAME 2>/dev/null; then
    echo -e "${YELLOW}No '$SESSION_NAME' session found.${NC}"
    exit 0
fi

echo -e "${YELLOW}Stopping Compound Engineering session...${NC}"

# Kill any running Claude processes in the session windows
for window in $(tmux list-windows -t $SESSION_NAME -F '#I'); do
    # Send Ctrl+C to interrupt any running processes
    tmux send-keys -t "$SESSION_NAME:$window" C-c 2>/dev/null
done

sleep 1

# Kill the session
tmux kill-session -t $SESSION_NAME 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Session '$SESSION_NAME' stopped.${NC}"
else
    echo -e "${RED}✗ Failed to stop session.${NC}"
    exit 1
fi
