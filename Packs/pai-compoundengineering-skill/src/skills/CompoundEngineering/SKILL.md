---
name: CompoundEngineering
description: Systematic development workflow where each unit of work makes subsequent work easier. USE WHEN user says 'review code', 'review PR', 'compound review', 'document learnings', 'capture what we learned', 'orchestrate', 'parallel workers', 'tmux workflow', OR user wants multi-agent code review before merging, OR user wants to formalize patterns from completed work, OR user wants parallel implementation with multiple Claude instances.
---

# CompoundEngineering

Systematic development workflow based on the principle: **each unit of engineering work should make subsequent units easier—not harder.**

Inverts traditional development (80% coding) to **80% planning/review, 20% execution**.

## Core Loop

```
Plan → Work → Review → Compound → Repeat
         ↑                    ↓
         └────────────────────┘
              (learnings feed back)
```

## Workflow Routing

**When executing a workflow, output this notification:**

```
Running the **WorkflowName** workflow from the **CompoundEngineering** skill...
```

| Workflow | Trigger | File |
|----------|---------|------|
| **Plan** | "plan this feature", "create implementation plan" | `workflows/Plan.md` |
| **Review** | "review code", "review PR", "multi-agent review" | `workflows/Review.md` |
| **Compound** | "compound", "document learnings", "capture patterns" | `workflows/Compound.md` |

## When to Use Each Workflow

### Plan
Use **before** starting any non-trivial implementation. Ensures you think through edge cases, dependencies, and approach before writing code.

**Triggers:**
- Starting a new feature
- Major refactor
- Complex bug fix
- Architecture changes

### Review
Use **after** completing implementation, before merging. Multi-agent review catches issues a single perspective would miss.

**Triggers:**
- Code is ready for PR
- Want thorough quality check
- Before merging to main
- After significant changes

### Compound
Use **after** completing a significant piece of work. Captures patterns, learnings, and reusable knowledge for future work.

**Triggers:**
- Just finished a feature
- Solved a tricky problem
- Discovered a useful pattern
- Want to avoid repeating mistakes

## Examples

**Example 1: Before starting a new feature**
```
User: "I need to add user authentication - plan this feature"
→ Invokes Plan workflow
→ Identifies auth approach (JWT vs session)
→ Maps out components, dependencies, edge cases
→ Creates actionable implementation checklist
→ User approves before any code is written
```

**Example 2: Ready to merge a PR**
```
User: "Review the changes before I merge"
→ Invokes Review workflow
→ Launches parallel review agents (security, performance, correctness)
→ Each agent reviews from their specialty lens
→ Consolidates findings into actionable feedback
→ User fixes issues before merge
```

**Example 3: Just finished a complex feature**
```
User: "Compound - document what we learned from this auth implementation"
→ Invokes Compound workflow
→ Extracts patterns that worked well
→ Notes gotchas and mistakes to avoid
→ Saves to History/Learnings/ for future reference
→ Updates any relevant skill documentation
```

## Philosophy

Traditional dev accumulates technical debt. Compound engineering inverts this:

| Traditional | Compound |
|-------------|----------|
| Code first, plan later | Plan thoroughly, code efficiently |
| Review as formality | Review as quality gate |
| Knowledge in heads | Knowledge in documentation |
| Each feature harder | Each feature easier |

## Integration with KAI-PAI

- **Plan** enhances the Architect agent with structured pre-work
- **Review** adds multi-perspective code review (not in base PAI)
- **Compound** strengthens the History system with explicit learning capture

The Work phase uses existing tools (TodoWrite, Engineer agent) - no duplication.

## Reference

See `ReviewPatterns.md` for common anti-patterns to catch during code review:
- Security (injection, auth bypass, IDOR, XSS)
- Performance (N+1, unbounded queries, memory leaks)
- Correctness (null handling, race conditions, error swallowing)
- Maintainability (magic values, dead code, god objects)
- Testing (flaky tests, missing edge cases)
