#!/bin/bash
# Compound Engineering Workflow Session
# Creates tmux session with pre-configured windows and auto-launches Claude
# Single command to start the full parallel development workflow

SESSION_NAME="compound-eng"
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
# Create Tmux Session
# ============================================
echo -e "${BLUE}Creating session with 4 windows...${NC}"

# Create session with Plan window
tmux new-session -d -s $SESSION_NAME -n "Plan" -c "$PROJECT_DIR"

# Create worker windows
tmux new-window -t $SESSION_NAME -n "Backend" -c "$PROJECT_DIR"
tmux new-window -t $SESSION_NAME -n "Frontend" -c "$PROJECT_DIR"
tmux new-window -t $SESSION_NAME -n "Tests" -c "$PROJECT_DIR"

# Go back to Plan window
tmux select-window -t $SESSION_NAME:1

echo -e "${BLUE}Launching Claude in all windows...${NC}"

# ============================================
# Launch Claude with Role Prompts
# ============================================

# Read feature description from .workflow/feature.txt if it exists
FEATURE_DESC=""
if [ -f "$WORKFLOW_DIR/feature.txt" ]; then
    FEATURE_DESC=$(cat "$WORKFLOW_DIR/feature.txt")
fi

# Window 1: Plan (Architect) - Human-in-loop
PLAN_PROMPT="You are the ARCHITECT in a CompoundEngineering parallel workflow.

Your job:
1. Ask clarifying questions about the feature
2. Design the implementation plan
3. Output: .workflow/PLAN.md, .workflow/contracts/*.ts, .workflow/tasks/*.md
4. When approved: touch .workflow/signals/plan.done

Wait for the user to describe the feature they want to build."

tmux send-keys -t $SESSION_NAME:1 "echo -e '${CYAN}=== PLAN Window (Architect) ===${NC}'" C-m
tmux send-keys -t $SESSION_NAME:1 "echo 'This window is for planning. Claude will ask clarifying questions.'" C-m
tmux send-keys -t $SESSION_NAME:1 "echo ''" C-m
tmux send-keys -t $SESSION_NAME:1 "claude --dangerously-skip-permissions" C-m
sleep 0.5

# Window 2: Backend Worker
BACKEND_PROMPT="You are the BACKEND WORKER. Wait for .workflow/signals/plan.done before starting.

When plan.done exists:
1. Read .workflow/tasks/backend.md
2. Import types from .workflow/contracts/
3. Implement backend tasks (src/backend/**, src/api/**, src/lib/**)
4. When done: touch .workflow/signals/backend.done

Start by checking: ls .workflow/signals/plan.done"

tmux send-keys -t $SESSION_NAME:2 "echo -e '${CYAN}=== BACKEND Worker ===${NC}'" C-m
tmux send-keys -t $SESSION_NAME:2 "echo 'Waiting for plan to complete...'" C-m
tmux send-keys -t $SESSION_NAME:2 "echo 'Will auto-start when .workflow/signals/plan.done exists'" C-m
tmux send-keys -t $SESSION_NAME:2 "echo ''" C-m
tmux send-keys -t $SESSION_NAME:2 "claude --dangerously-skip-permissions" C-m
sleep 0.5

# Window 3: Frontend Worker
FRONTEND_PROMPT="You are the FRONTEND WORKER. Wait for .workflow/signals/plan.done before starting.

When plan.done exists:
1. Read .workflow/tasks/frontend.md
2. Import types from .workflow/contracts/
3. Implement frontend tasks (src/components/**, src/app/**)
4. When done: touch .workflow/signals/frontend.done

Start by checking: ls .workflow/signals/plan.done"

tmux send-keys -t $SESSION_NAME:3 "echo -e '${CYAN}=== FRONTEND Worker ===${NC}'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo 'Waiting for plan to complete...'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo 'Will auto-start when .workflow/signals/plan.done exists'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo ''" C-m
tmux send-keys -t $SESSION_NAME:3 "claude --dangerously-skip-permissions" C-m
sleep 0.5

# Window 4: Tests Worker
TESTS_PROMPT="You are the TESTS WORKER. Wait for .workflow/signals/plan.done before starting.

When plan.done exists:
1. Read .workflow/tasks/tests.md
2. Write tests against .workflow/contracts/
3. Implement test tasks (tests/**, **/*.test.ts)
4. When done: touch .workflow/signals/tests.done

Start by checking: ls .workflow/signals/plan.done"

tmux send-keys -t $SESSION_NAME:4 "echo -e '${CYAN}=== TESTS Worker ===${NC}'" C-m
tmux send-keys -t $SESSION_NAME:4 "echo 'Waiting for plan to complete...'" C-m
tmux send-keys -t $SESSION_NAME:4 "echo 'Will auto-start when .workflow/signals/plan.done exists'" C-m
tmux send-keys -t $SESSION_NAME:4 "echo ''" C-m
tmux send-keys -t $SESSION_NAME:4 "claude --dangerously-skip-permissions" C-m

echo ""
echo -e "${GREEN}══════════════════════════════════════════════${NC}"
echo -e "${GREEN}   Session Ready!                             ${NC}"
echo -e "${GREEN}══════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${BLUE}Windows:${NC}"
echo "    1: Plan     - Architect (YOU interact here first)"
echo "    2: Backend  - API, database, server code"
echo "    3: Frontend - React components, UI"
echo "    4: Tests    - Test files"
echo ""
echo -e "  ${YELLOW}Workflow:${NC}"
echo "    1. In Plan window: describe your feature"
echo "    2. Answer architect's clarifying questions"
echo "    3. Approve the plan → workers auto-start"
echo "    4. Monitor progress in other windows"
echo ""
echo -e "  ${BLUE}Navigation:${NC}"
echo "    Switch windows: Ctrl+b then 1/2/3/4"
echo "    Detach:         Ctrl+b then d"
echo "    Re-attach:      tmux attach -t $SESSION_NAME"
echo ""
echo -e "  ${CYAN}Status:${NC}"
echo "    Check progress: $SCRIPT_DIR/orchestrate.ts status"
echo ""
echo -e "${YELLOW}Attaching to session...${NC}"

tmux attach -t $SESSION_NAME
