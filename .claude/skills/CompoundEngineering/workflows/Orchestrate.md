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
Window 0: ORCHESTRATE (this runs the state machine)
│
├── Window 1: PLAN
│   └── Architect answers your questions, outputs plan artifacts
│
├── Window 2: IMPLEMENT (3 panes, parallel)
│   ├── Backend worker
│   ├── Frontend worker
│   └── Tests worker
│
├── Window 3: REVIEW
│   └── Multi-agent review (security, performance, correctness, maintainability)
│
├── Window 4: REFINE (if review fails, 3 panes)
│   ├── Backend fixes
│   ├── Frontend fixes
│   └── Test additions
│
└── Window 5: COMPOUND
    └── Capture learnings for future work
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

### 1. Initialize Workflow

```bash
# From your project root
~/.claude/skills/CompoundEngineering/tools/orchestrate.ts init

# Creates .workflow/ directory with initial state
```

### 2. Start Orchestration

```bash
# Terminal 1: Run the orchestrator (watches state, coordinates phases)
~/.claude/skills/CompoundEngineering/tools/orchestrate.ts start

# Or use the tmux setup script
~/.claude/skills/CompoundEngineering/tools/orchestrate.ts tmux
```

### 3. Begin Planning

```bash
# In PLAN window (or orchestrator spawns it)
claude "Plan feature: [YOUR FEATURE DESCRIPTION]

Use the CompoundEngineering Plan workflow.
Output to .workflow/PLAN.md, .workflow/contracts/, .workflow/tasks/
When done: touch .workflow/signals/plan.done"
```

### 4. Monitor Progress

```bash
# Check current state
~/.claude/skills/CompoundEngineering/tools/orchestrate.ts status

# Watch state changes
~/.claude/skills/CompoundEngineering/tools/orchestrate.ts watch
```

---

## CLI Reference

```bash
orchestrate.ts <command> [options]

Commands:
  init              Create .workflow/ directory structure
  start             Start the state machine (foreground)
  status            Show current workflow state
  watch             Watch for state changes (live updates)
  tmux              Set up tmux session with all windows
  signal <name>     Manually signal completion (e.g., signal plan)
  reset             Reset to init state (preserves artifacts)
  clean             Remove .workflow/ entirely

Options:
  --max-iterations  Max refine cycles before escalating (default: 3)
  --workers         Worker types: backend,frontend,tests (default: all)
  --project         Project root directory (default: cwd)
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
# 1. Initialize
cd ~/my-project
~/.claude/skills/CompoundEngineering/tools/orchestrate.ts init

# 2. Start orchestrator in background
~/.claude/skills/CompoundEngineering/tools/orchestrate.ts start &

# 3. Open PLAN window and start planning
claude "Plan: Add user profile editing with avatar upload"

# ... answer clarifying questions ...
# ... approve plan ...

# 4. Watch parallel implementation
orchestrate.ts watch
# Backend: implementing... (45s)
# Frontend: implementing... (52s)
# Tests: implementing... (38s)
# All workers complete!

# 5. Review runs automatically
# Review: NEEDS_FIXES (2 critical issues)

# 6. Refine runs automatically
# Refine iteration 1...
# Review: PASS

# 7. Compound runs automatically
# Learnings saved to History/Learnings/2026-01-28-user-profile.md

# 8. Done!
echo "Feature complete. Commit when ready."
```
