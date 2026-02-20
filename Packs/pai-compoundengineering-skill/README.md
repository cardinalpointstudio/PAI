---
name: PAI CompoundEngineering Skill
pack-id: pai-compoundengineering-skill-v1.3.0
version: 1.3.0
author: salexanderb
description: Systematic development workflow with parallel multi-agent implementation, code review, and learning capture. Plan -> Implement -> Review -> Compound -> Repeat.
type: skill
purpose-type: [workflow, multi-agent, code-review, learning]
platform: any
agent-agnostic: true
dependencies: [tmux, gh]
keywords: [compound, engineering, workflow, parallel, agents, review, planning, tmux, aider, opencode]
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
| **Orchestrate** | "parallel workers", "tmux workflow" | Coordinate parallel AI agent implementation |

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

## Agent Configuration

The Orchestrate workflow is **agent-agnostic**. Configure your preferred AI coding CLI via the `AI_CLI` environment variable:

```bash
# Claude Code (default)
export AI_CLI="claude --dangerously-skip-permissions"

# Aider (works with GPT-4, Claude, local models)
export AI_CLI="aider --yes-always"

# OpenCode
export AI_CLI="opencode"

# Codex CLI
export AI_CLI="codex --auto-edit"

# Any other CLI that accepts prompts
export AI_CLI="your-ai-cli --auto-accept-flag"
```

### Supported AI CLIs

| CLI | Command | Auto-accept Flag | Model Support |
|-----|---------|------------------|---------------|
| **Claude Code** | `claude` | `--dangerously-skip-permissions` | Claude models |
| **aider** | `aider` | `--yes-always` | GPT-4, Claude, Ollama, local |
| **opencode** | `opencode` | (check docs) | Multiple providers |
| **Codex CLI** | `codex` | `--auto-edit` | OpenAI models |
| **Cody** | `cody chat` | - | Sourcegraph |

### Adding to Shell Profile

For persistent configuration, add to `~/.bashrc` or `~/.zshrc`:

```bash
# CompoundEngineering AI CLI configuration
export AI_CLI="aider --yes-always"
```

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

This pack is fully **agent-agnostic**:

- **Plan, Review, Compound workflows** - Pure markdown procedures that any AI model can follow
- **Orchestrate workflow** - Uses the `AI_CLI` environment variable to launch any AI coding assistant

The Orchestrate workflow uses TypeScript tooling (orchestrate.ts) for tmux coordination. It works with any AI CLI that:
1. Can receive prompts via terminal input
2. Has an "auto-accept" or "skip confirmation" mode
3. Can execute file operations and shell commands

Tested with: Claude Code, aider, opencode

## Credits

- **Author:** salexanderb
- **License:** MIT

## Changelog

### 1.3.0 - 2026-02-20
- Added interactive model menu (`[M]` key) in orchestrator
- Custom command text input for any worker
- Config persistence in `.workflow/config.json`
- compound-start.sh reads model config on session start

### 1.2.0 - 2026-02-20
- Per-worker model configuration via environment variables
- `AI_CLI_PLAN`, `AI_CLI_BACKEND`, `AI_CLI_FRONTEND`, `AI_CLI_TESTS`, `AI_CLI_REVIEW`
- Falls back to `AI_CLI` if per-worker var not set

### 1.1.0 - 2026-02-19
- Made Orchestrate workflow agent-agnostic via `AI_CLI` environment variable
- Supports Claude Code, aider, opencode, and other AI coding CLIs
- Updated documentation with agent configuration guide

### 1.0.0 - 2026-02-19
- Initial release
- Plan, Review, Compound, Orchestrate workflows
- ReviewPatterns reference
- Templates for task files and contracts
- Shell tools for tmux session management
- Interactive orchestrator CLI
