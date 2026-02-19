# Orchestrate Workflow

Coordinate parallel Claude Code instances across tmux windows for maximum development throughput.

## Purpose

Run the full Plan → Implement → Review → Refine → Compound cycle with multiple parallel workers. Use when a feature can be split into independent workstreams (backend, frontend, tests).

## When to Use

- Feature touches 3+ distinct areas that can be developed in parallel
- Clear separation exists (API vs UI vs tests)
- Quality matters - you want multi-agent review
- Building production code, not a quick prototype

## When NOT to Use

- Small bug fixes (overhead > benefit)
- Tightly coupled changes (can't parallelize safely)
- Exploratory/spike work (requirements unclear)
- Single-file changes

---

## Architecture Overview

```
Window 1: ORCH (Orchestrator - command center, runs state machine)
│
├── Window 2: PLAN
│   └── Architect answers your questions, outputs plan artifacts
│
├── Window 3: BACKEND
│   └── Backend worker (src/backend/**, src/api/**, src/lib/**)
│
├── Window 4: FRONTEND
│   └── Frontend worker (src/frontend/**, src/components/**)
│
├── Window 5: TESTS
│   └── Tests worker (tests/**, *.test.ts)
│
├── Window 6: REVIEW
│   └── Multi-agent review (security, performance, correctness, maintainability)
│
└── Window 7: STATUS
    └── Live workflow status display (watch mode)
```

---

## State Machine

```
┌─────────┐
│  init   │
└────┬────┘
     │ orchestrate start
     ▼
┌─────────┐     plan.done
│ planning│────────────────┐
└─────────┘                │
     ▲                     ▼
     │              ┌──────────────┐
     │              │ implementing │
     │              └──────┬───────┘
     │                     │ all workers done
     │                     ▼
     │              ┌──────────────┐
     │    fail +    │  reviewing   │
     │    iterations│              │
     │    < max     └──────┬───────┘
     │                     │
     │         ┌───────────┴───────────┐
     │         │                       │
     │         ▼ FAIL                  ▼ PASS
     │   ┌──────────┐           ┌──────────────┐
     └───│ refining │           │ compounding  │
         └──────────┘           └──────┬───────┘
                                       │
                                       ▼
                                ┌──────────┐
                                │ complete │
                                └──────────┘
```

### States

| State | Description | Exit Condition |
|-------|-------------|----------------|
| `init` | Waiting to start | `orchestrate start` command |
| `planning` | Architect creating plan | `.workflow/plan.done` exists |
| `implementing` | Parallel workers executing | All `.workflow/*.done` files exist |
| `reviewing` | Multi-agent code review | `REVIEW.md` written with status |
| `refining` | Fixing review issues | All fix workers complete |
| `compounding` | Capturing learnings | `compound.done` exists |
| `complete` | Workflow finished | Terminal state |

---

## File Structure

```
.workflow/                    # Created in project root
├── state                     # Current state: "planning", "implementing", etc.
├── config.json               # Workflow configuration
├── iteration                 # Current refine iteration (0, 1, 2...)
│
├── PLAN.md                   # High-level implementation plan
├── REVIEW.md                 # Review findings and status
│
├── contracts/                # Interface definitions
│   └── *.ts                  # TypeScript interfaces
│
├── tasks/                    # Worker task files
│   ├── backend.md
│   ├── frontend.md
│   └── tests.md
│
└── signals/                  # Completion signals
    ├── plan.done
    ├── backend.done
    ├── frontend.done
    ├── tests.done
    ├── review.done
    └── compound.done
```

---

## Quick Start

### 1. Start the Full Workflow

```bash
# From your project root - launches 7-window tmux session
~/.claude/skills/CompoundEngineering/tools/compound-start.sh

# This creates:
#   - .workflow/ directory with initial state
#   - 7 tmux windows with Claude launched in each
#   - Orchestrator running in window 1
#   - Status watch mode in window 7
```

### 2. Begin Planning (Window 2)

```bash
# Switch to Plan window: Ctrl+b 2
# Describe your feature to the Architect
# Answer clarifying questions
# Approve the plan when ready
```

### 3. Approve Plan (Window 1)

```bash
# Switch to Orch window: Ctrl+b 1
# Press [P] to signal plan approved
# Workers auto-start in windows 3-5
```

### 4. Monitor Progress (Window 7)

```bash
# Switch to Status window: Ctrl+b 7
# Live workflow status display
# Or run manually:
~/.claude/skills/CompoundEngineering/tools/orchestrate.ts watch
```

### 5. Stop the Session

```bash
# Gracefully terminate all windows
~/.claude/skills/CompoundEngineering/tools/ce-stop.sh
```

---

## CLI Reference

```bash
# Main orchestrator (interactive TUI with state machine)
orchestrate.ts              # Run interactive orchestrator
orchestrate.ts watch        # Watch-only mode (for Status window)
orchestrate.ts init         # Create .workflow/ directory structure
orchestrate.ts reset        # Reset workflow state for new session

# Session management
compound-start.sh           # Launch 7-window tmux session (ce-dev)
ce-stop.sh                  # Gracefully terminate session

# Navigation (inside tmux session)
Ctrl+b 1-7                  # Switch between windows
Ctrl+b d                    # Detach from session
tmux attach -t ce-dev       # Re-attach to session
```

---

## Phase Details

### PLAN Phase

**Human involvement: HIGH** - You answer questions and approve the plan.

The architect agent:
1. Asks clarifying questions about requirements
2. Explores codebase for existing patterns
3. Designs the implementation approach
4. Outputs:
   - `.workflow/PLAN.md` - Overall strategy
   - `.workflow/contracts/*.ts` - Interface definitions
   - `.workflow/tasks/*.md` - Per-worker task files

**You must approve the plan before it signals done.**

Example plan prompt:
```
Plan feature: Add user authentication with JWT

Use the CompoundEngineering Plan workflow.
Ask me clarifying questions before designing.
Output artifacts to .workflow/
When I approve, touch .workflow/signals/plan.done
```

### IMPLEMENT Phase

**Human involvement: NONE** - Workers execute autonomously.

Three parallel workers read their task files and implement:

| Worker | Reads | Modifies | Signals |
|--------|-------|----------|---------|
| Backend | `tasks/backend.md` | `src/backend/**`, `src/api/**` | `backend.done` |
| Frontend | `tasks/frontend.md` | `src/frontend/**`, `src/components/**` | `frontend.done` |
| Tests | `tasks/tests.md` | `tests/**`, `*.test.ts` | `tests.done` |

Workers are **isolated** - they cannot modify each other's domains.

### REVIEW Phase

**Human involvement: LOW** - Review results presented for your decision.

Uses the existing Review.md workflow:
1. Runs full test suite
2. Launches 4 parallel review agents (security, perf, correctness, maintainability)
3. Validates contracts are implemented
4. Outputs `.workflow/REVIEW.md` with:
   - `STATUS: PASS` → proceed to COMPOUND
   - `STATUS: FAIL` → proceed to REFINE

### REFINE Phase

**Human involvement: NONE** - Fix workers execute autonomously.

Workers read `REVIEW.md` and fix issues in their domain:
- Backend fixes security/API issues
- Frontend fixes UI/UX issues
- Tests add missing coverage

After fixes, loops back to REVIEW (max 3 iterations).

### COMPOUND Phase

**Human involvement: OPTIONAL** - Review captured learnings.

Uses the existing Compound.md workflow:
1. Extracts patterns that worked
2. Documents gotchas encountered
3. Saves to `~/.claude/History/Learnings/`

---

## Worker Prompt Templates

### Backend Worker

```markdown
You are the BACKEND WORKER in a parallel implementation workflow.

## Your Scope
- ONLY modify: src/backend/**, src/api/**, src/lib/**, src/db/**
- NEVER modify: src/frontend/**, src/components/**, tests/**

## Your Task
Read: .workflow/tasks/backend.md
Import types from: .workflow/contracts/

## Constraints
- Follow existing code patterns in the codebase
- All new code must be type-safe (import from contracts)
- Handle errors appropriately
- Do NOT write tests (tests worker handles that)

## When Done
1. Verify your changes compile: bun run tsc --noEmit
2. Signal completion: touch .workflow/signals/backend.done
```

### Frontend Worker

```markdown
You are the FRONTEND WORKER in a parallel implementation workflow.

## Your Scope
- ONLY modify: src/frontend/**, src/components/**, src/pages/**
- NEVER modify: src/backend/**, src/api/**, tests/**

## Your Task
Read: .workflow/tasks/frontend.md
Import types from: .workflow/contracts/

## Constraints
- Follow existing component patterns
- Use existing design system/UI library
- Ensure accessibility (aria labels, keyboard nav)
- Do NOT write tests (tests worker handles that)

## When Done
1. Verify your changes compile: bun run tsc --noEmit
2. Signal completion: touch .workflow/signals/frontend.done
```

### Tests Worker

```markdown
You are the TESTS WORKER in a parallel implementation workflow.

## Your Scope
- ONLY modify: tests/**, **/*.test.ts, **/*.spec.ts
- NEVER modify: src/** (except test files within)

## Your Task
Read: .workflow/tasks/tests.md
Test against interfaces in: .workflow/contracts/

## Constraints
- Write tests BEFORE implementation exists (TDD style)
- Cover happy path + edge cases
- Mock external dependencies
- Tests should initially fail (implementations coming from other workers)

## When Done
1. Verify tests are syntactically valid: bun run tsc --noEmit
2. Signal completion: touch .workflow/signals/tests.done
```

---

## Task File Format

Each task file in `.workflow/tasks/` follows this structure:

```markdown
# [Domain] Tasks

## Contract Reference
- Import types from: ../contracts/[relevant].ts
- Must implement: [list of interfaces/functions]

## Context
[Brief description of what this domain is responsible for]

## Tasks (ordered by dependency)

### 1. [First Task]
**File:** path/to/file.ts
**Action:** Create | Modify | Delete
**Details:**
- Specific implementation details
- Expected behavior
- Edge cases to handle

### 2. [Second Task]
...

## Constraints
- [Domain-specific rules]
- [Patterns to follow]
- [Things to avoid]

## Done When
- [ ] All tasks completed
- [ ] Code compiles without errors
- [ ] Follows existing patterns
```

---

## Configuration

`.workflow/config.json`:

```json
{
  "maxIterations": 3,
  "workers": ["backend", "frontend", "tests"],
  "projectRoot": ".",
  "contractsDir": ".workflow/contracts",
  "tasksDir": ".workflow/tasks",
  "reviewChecks": {
    "runTests": true,
    "validateContracts": true,
    "securityReview": true,
    "performanceReview": true
  },
  "notifications": {
    "onPhaseComplete": true,
    "onReviewFail": true
  }
}
```

---

## Troubleshooting

### Worker stuck / not completing

```bash
# Check what's happening
orchestrate.ts status

# Check worker's last output
cat .workflow/logs/backend.log

# Manually signal if stuck
orchestrate.ts signal backend
```

### Review keeps failing

After 3 iterations, the orchestrator escalates to you:
```
ESCALATION: Review failed 3 times. Issues remaining:
- [critical issue 1]
- [critical issue 2]

Options:
1. Continue anyway (orchestrate.ts signal review --force)
2. Fix manually and signal (orchestrate.ts signal review)
3. Abort workflow (orchestrate.ts reset)
```

### Workers modifying wrong files

The orchestrator validates file changes against allowed paths. If a worker tries to modify outside its domain, the change is rejected and logged.

---

## Integration with Existing Workflows

| Existing Workflow | How Orchestrate Uses It |
|-------------------|-------------------------|
| `Plan.md` | Extended to output contracts/ and tasks/ |
| `Review.md` | Used as-is for multi-agent review |
| `Compound.md` | Used as-is for learning capture |

The Orchestrate workflow is the **coordinator** - it calls the existing workflows at the right times and manages the parallel execution layer.

---

## Example: Full Feature Run

```bash
# 1. Start the session (from your project root)
cd ~/my-project
~/.claude/skills/CompoundEngineering/tools/compound-start.sh

# 2. In Plan window (Ctrl+b 2): describe your feature
"Add user profile editing with avatar upload"

# ... answer clarifying questions ...
# ... approve plan ...

# 3. In Orch window (Ctrl+b 1): press [P] to approve plan

# 4. Watch parallel implementation (Ctrl+b 7 for Status window)
# Backend: implementing... (45s)
# Frontend: implementing... (52s)
# Tests: implementing... (38s)
# All workers complete!

# 5. Review runs automatically in Review window (Ctrl+b 6)
# Review: NEEDS_FIXES (2 critical issues)

# 6. Refine phase runs automatically
# Review: PASS

# 7. Compound phase captures learnings
# Learnings saved to History/Learnings/

# 8. Done! Stop session when ready
~/.claude/skills/CompoundEngineering/tools/ce-stop.sh
```
