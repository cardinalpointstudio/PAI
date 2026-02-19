---
name: PAI CompoundEngineering Skill
pack-id: pai-compoundengineering-skill-v1.0.0
version: 1.0.0
author: salexanderb
description: Systematic development workflow with parallel multi-agent implementation, code review, and learning capture. Plan -> Implement -> Review -> Compound -> Repeat.
type: skill
purpose-type: [workflow, multi-agent, code-review, learning]
platform: claude-code
dependencies: [tmux, gh]
keywords: [compound, engineering, workflow, parallel, agents, review, planning, tmux]
---

# PAI CompoundEngineering Skill

> Systematic development workflow where each unit of work makes subsequent work easier.

> **Installation:** This pack is designed for AI-assisted installation. Give this directory to your AI and ask it to install using `INSTALL.md`.

---

## What This Pack Provides

- **Plan Workflow** - Feature planning with clarifying questions before implementation
- **Review Workflow** - Multi-agent parallel code review (security, performance, correctness, maintainability)
- **Compound Workflow** - Learning capture to document patterns and avoid repeated mistakes
- **Orchestrate Workflow** - Parallel worker coordination using tmux sessions

## Core Philosophy

**Compound Engineering** follows the principle: each piece of work should make future work easier.

The workflow cycle:
1. **Plan** - Architect designs implementation with clarifying questions
2. **Implement** - Parallel workers (Backend, Frontend, Tests) execute the plan
3. **Review** - Multi-agent review catches issues from different perspectives
4. **Refine** - Fix issues found in review (iterate if needed)
5. **Compound** - Capture learnings for future sessions

## Architecture

```
CompoundEngineering Skill
├── SKILL.md                           # Main entry point and routing
├── ReviewPatterns.md                  # Security, performance, correctness patterns
├── workflows/
│   ├── Plan.md                        # Feature planning workflow
│   ├── Review.md                      # Multi-agent code review
│   ├── Compound.md                    # Learning capture workflow
│   └── Orchestrate.md                 # Parallel worker coordination
├── templates/
│   ├── task-file.md                   # Template for worker task files
│   ├── PLAN-example.md                # Example plan document
│   └── contracts-example.ts           # Example shared type contracts
└── tools/
    ├── compound-start.sh              # Start CE tmux session
    ├── ce-stop.sh                     # Stop CE session
    └── orchestrate.ts                 # Interactive orchestrator CLI
```

## Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **Plan** | "plan feature", "design implementation" | Create implementation plan before coding |
| **Review** | "review code", "review PR" | Multi-agent parallel code review |
| **Compound** | "capture learnings", "document patterns" | Extract and preserve learnings |
| **Orchestrate** | "parallel workers", "tmux workflow" | Coordinate multi-Claude implementation |

## Orchestrate Workflow: 7-Window Layout

The orchestrator creates a tmux session with 7 specialized windows:

| Window | Name | Purpose |
|--------|------|---------|
| 1 | **Orch** | Command center - orchestrator CLI |
| 2 | **Plan** | Architect - human-in-loop planning |
| 3 | **Backend** | API, database, server code |
| 4 | **Frontend** | React components, UI |
| 5 | **Tests** | Test files |
| 6 | **Review** | Code review |
| 7 | **Status** | Live workflow status display |

### State Machine

```
init → planning → implementing → reviewing → refining → compounding → complete
         ↑                          │
         └──────────────────────────┘  (if review fails)
```

## Review Patterns

The skill includes comprehensive review patterns:

**Security**
- Input validation, auth bypass, secrets exposure
- IDOR, XSS, command injection

**Performance**
- N+1 queries, unbounded queries, blocking operations
- Memory leaks, excessive re-renders

**Correctness**
- Off-by-one errors, null handling, race conditions
- Async mistakes, error propagation

**Maintainability**
- Magic numbers, dead code, god objects
- Missing types, poor naming

## Quick Start

### Using Orchestrate (Full Parallel Workflow)

```bash
# Start the CE session
compound-start.sh /path/to/project

# Navigate windows with Ctrl+b then 1-7
# In Plan window (2): describe your feature
# In Orch window (1): press [P] when plan approved
# Workers auto-implement in parallel
# Press [R] for review, [C] for compound, [G] for PR
```

### Using Individual Workflows

```
"Plan the implementation of user authentication"
→ Invokes Plan workflow
→ Asks clarifying questions
→ Creates detailed implementation steps

"Review this PR before merging"
→ Invokes Review workflow
→ Launches parallel review agents
→ Aggregates findings into report

"Capture what we learned from this session"
→ Invokes Compound workflow
→ Extracts patterns and gotchas
→ Saves to History/Learnings/
```

## Dependencies

- **tmux** - Required for Orchestrate workflow
- **gh** - GitHub CLI for PR creation
- **bun** - Runtime for orchestrator tool

## Usage Examples

```
"I want to implement a new calendar feature"
→ Invokes Plan workflow
→ Architect asks clarifying questions
→ Creates PLAN.md with implementation steps
→ Workers execute in parallel

"Review the code changes before we merge"
→ Invokes Review workflow
→ Spawns 4 parallel agents (security, perf, correctness, maintainability)
→ Each reviews from their perspective
→ Produces consolidated findings

"Let's document what we learned"
→ Invokes Compound workflow
→ Analyzes session work
→ Creates learning entry in History/
```

## Model Interoperability

The Plan, Review, and Compound workflows are pure markdown procedures - any model can follow them.

The Orchestrate workflow uses TypeScript tooling (orchestrate.ts) for tmux coordination. Models that support shell execution can use the full parallel workflow.

## Credits

- **Author:** salexanderb
- **License:** MIT

## Changelog

### 1.0.0 - 2026-02-19
- Initial release
- Plan, Review, Compound, Orchestrate workflows
- ReviewPatterns reference
- Templates for task files and contracts
- Shell tools for tmux session management
- Interactive orchestrator CLI
