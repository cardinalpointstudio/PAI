#!/bin/bash
# Compound Engineering Workflow Session
# Creates tmux session with 7 pre-configured windows and auto-launches Claude
# Single command to start the full parallel development workflow

SESSION_NAME="ce-dev"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
WORKFLOW_DIR=".workflow"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Get project directory (current dir or passed as argument)
PROJECT_DIR="${1:-$(pwd)}"

# Check if session already exists
tmux has-session -t $SESSION_NAME 2>/dev/null
if [ $? == 0 ]; then
    echo -e "${YELLOW}Session '$SESSION_NAME' already exists. Attaching...${NC}"
    tmux attach -t $SESSION_NAME
    exit 0
fi

echo -e "${BLUE}══════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Compound Engineering Workflow              ${NC}"
echo -e "${BLUE}══════════════════════════════════════════════${NC}"
echo ""

cd "$PROJECT_DIR" || {
    echo -e "${RED}Error: Could not cd to $PROJECT_DIR${NC}"
    exit 1
}

# ============================================
# Safeguard: Check current branch
# ============================================
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null)
if [[ "$CURRENT_BRANCH" == compound/* ]]; then
    echo ""
    echo -e "${RED}════════════════════════════════════════════════${NC}"
    echo -e "${RED}  WARNING: Starting from compound branch!        ${NC}"
    echo -e "${RED}════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}You're currently on: ${CYAN}$CURRENT_BRANCH${NC}"
    echo ""
    echo -e "This will create a NEW compound branch ${RED}from this branch${NC}."
    echo -e "Your commits will ${RED}stack up${NC} (like the 6-commit issue you just fixed)."
    echo ""
    echo -e "${GREEN}Recommended action:${NC}"
    echo -e "  ${CYAN}git checkout main${NC}"
    echo -e "  ${CYAN}git branch -D $CURRENT_BRANCH${NC}  ${DIM}# if you're done with it${NC}"
    echo -e "  ${CYAN}ce-gc${NC}  ${DIM}# start fresh from main${NC}"
    echo ""
    echo -e "${YELLOW}Continue anyway?${NC} [y/N]: "
    read -r response
    if [[ "$response" != "y" && "$response" != "Y" ]]; then
        echo -e "${GREEN}Good choice! Exiting...${NC}"
        echo -e "Switch to main and try again."
        exit 0
    fi
    echo ""
    echo -e "${YELLOW}Proceeding from compound branch (not recommended)...${NC}"
    echo ""
fi

# ============================================
# Initialize or reset .workflow/
# ============================================
if [ ! -d "$WORKFLOW_DIR" ]; then
    echo -e "${YELLOW}[SETUP] Initializing .workflow/ directory...${NC}"
    "$SCRIPT_DIR/orchestrate.ts" init
else
    echo -e "${YELLOW}[SETUP] Resetting workflow state for new session...${NC}"
    "$SCRIPT_DIR/orchestrate.ts" reset
fi

# ============================================
# Git Safety: Feature Branch + Checkpoint
# ============================================
echo -e "${YELLOW}[SAFETY] Creating feature branch...${NC}"

BRANCH_NAME="compound/$(date +%Y%m%d-%H%M%S)"
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null)

if [ -n "$CURRENT_BRANCH" ]; then
    echo "$CURRENT_BRANCH" > "$WORKFLOW_DIR/.starting-branch"
    git checkout -b "$BRANCH_NAME" 2>/dev/null
    if [ $? == 0 ]; then
        echo -e "${GREEN}  Created branch: $BRANCH_NAME${NC}"
    else
        echo -e "${YELLOW}  Using current branch${NC}"
    fi
fi

echo -e "${YELLOW}[SAFETY] Creating checkpoint commit...${NC}"
if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
    git add -A
    git commit -m "CHECKPOINT: Before compound session $(date +%Y-%m-%d\ %H:%M:%S)" --quiet 2>/dev/null
    echo -e "${GREEN}  Checkpoint created${NC}"
else
    echo -e "${GREEN}  Working directory clean${NC}"
fi

echo ""

# ============================================
# Create Tmux Session with 7 Windows
# ============================================
echo -e "${BLUE}Creating session with 7 windows...${NC}"

# Create session with Orch window (window 1)
tmux new-session -d -s $SESSION_NAME -n "Orch" -c "$PROJECT_DIR"

# Create worker windows (2-7)
tmux new-window -t $SESSION_NAME -n "Plan" -c "$PROJECT_DIR"
tmux new-window -t $SESSION_NAME -n "Backend" -c "$PROJECT_DIR"
tmux new-window -t $SESSION_NAME -n "Frontend" -c "$PROJECT_DIR"
tmux new-window -t $SESSION_NAME -n "Tests" -c "$PROJECT_DIR"
tmux new-window -t $SESSION_NAME -n "Review" -c "$PROJECT_DIR"
tmux new-window -t $SESSION_NAME -n "Status" -c "$PROJECT_DIR"

# Go back to Orch window
tmux select-window -t $SESSION_NAME:1

echo -e "${BLUE}Launching orchestrator and Claude in all windows...${NC}"

# ============================================
# Window 1: Orchestrator
# ============================================
tmux send-keys -t $SESSION_NAME:1 "echo -e '${CYAN}=== ORCHESTRATOR ===${NC}'" C-m
tmux send-keys -t $SESSION_NAME:1 "$SCRIPT_DIR/orchestrate.ts" C-m
sleep 0.3

# ============================================
# Window 2: Plan (Architect) - Human-in-loop
# ============================================
tmux send-keys -t $SESSION_NAME:2 "echo -e '${CYAN}=== PLAN Window (Architect) ===${NC}'" C-m
tmux send-keys -t $SESSION_NAME:2 "echo 'This window is for planning. Claude will ask clarifying questions.'" C-m
tmux send-keys -t $SESSION_NAME:2 "echo ''" C-m
tmux send-keys -t $SESSION_NAME:2 "claude --dangerously-skip-permissions" C-m
sleep 0.3

# ============================================
# Window 3: Backend Worker
# ============================================
tmux send-keys -t $SESSION_NAME:3 "echo -e '${CYAN}=== BACKEND Worker ===${NC}'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo 'Waiting for plan to complete...'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo ''" C-m
tmux send-keys -t $SESSION_NAME:3 "claude --dangerously-skip-permissions" C-m
sleep 0.3

# ============================================
# Window 4: Frontend Worker
# ============================================
tmux send-keys -t $SESSION_NAME:4 "echo -e '${CYAN}=== FRONTEND Worker ===${NC}'" C-m
tmux send-keys -t $SESSION_NAME:4 "echo 'Waiting for plan to complete...'" C-m
tmux send-keys -t $SESSION_NAME:4 "echo ''" C-m
tmux send-keys -t $SESSION_NAME:4 "claude --dangerously-skip-permissions" C-m
sleep 0.3

# ============================================
# Window 5: Tests Worker
# ============================================
tmux send-keys -t $SESSION_NAME:5 "echo -e '${CYAN}=== TESTS Worker ===${NC}'" C-m
tmux send-keys -t $SESSION_NAME:5 "echo 'Waiting for plan to complete...'" C-m
tmux send-keys -t $SESSION_NAME:5 "echo ''" C-m
tmux send-keys -t $SESSION_NAME:5 "claude --dangerously-skip-permissions" C-m
sleep 0.3

# ============================================
# Window 6: Review Worker
# ============================================
tmux send-keys -t $SESSION_NAME:6 "echo -e '${CYAN}=== REVIEW Worker ===${NC}'" C-m
tmux send-keys -t $SESSION_NAME:6 "echo 'This window handles code review after implementation.'" C-m
tmux send-keys -t $SESSION_NAME:6 "echo ''" C-m
tmux send-keys -t $SESSION_NAME:6 "claude --dangerously-skip-permissions" C-m
sleep 0.3

# ============================================
# Window 7: Status (Watch Mode)
# ============================================
tmux send-keys -t $SESSION_NAME:7 "echo -e '${CYAN}=== STATUS Window ===${NC}'" C-m
tmux send-keys -t $SESSION_NAME:7 "echo 'Live workflow status display'" C-m
tmux send-keys -t $SESSION_NAME:7 "echo ''" C-m
tmux send-keys -t $SESSION_NAME:7 "$SCRIPT_DIR/orchestrate.ts watch" C-m

echo ""
echo -e "${GREEN}══════════════════════════════════════════════${NC}"
echo -e "${GREEN}   Session Ready!                             ${NC}"
echo -e "${GREEN}══════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${BLUE}Windows:${NC}"
echo "    1: Orch     - Orchestrator (command center)"
echo "    2: Plan     - Architect (YOU interact here first)"
echo "    3: Backend  - API, database, server code"
echo "    4: Frontend - React components, UI"
echo "    5: Tests    - Test files"
echo "    6: Review   - Code review"
echo "    7: Status   - Live workflow status"
echo ""
echo -e "  ${YELLOW}Workflow:${NC}"
echo "    1. In Plan window (Ctrl+b 2): describe your feature"
echo "    2. Answer architect's clarifying questions"
echo "    3. In Orch window (Ctrl+b 1): press [P] when plan approved"
echo "    4. Workers auto-start, monitor in Status (Ctrl+b 7)"
echo ""
echo -e "  ${BLUE}Navigation:${NC}"
echo "    Switch windows: Ctrl+b then 1-7"
echo "    Detach:         Ctrl+b then d"
echo "    Re-attach:      tmux attach -t $SESSION_NAME"
echo ""
echo -e "${YELLOW}Attaching to session...${NC}"

tmux attach -t $SESSION_NAME
