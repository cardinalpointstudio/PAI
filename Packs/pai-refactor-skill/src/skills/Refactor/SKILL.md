---
name: Refactor
description: Safe code restructuring - extract, rename, move, and simplify code while preserving behavior. USE WHEN user says 'refactor', 'extract function', 'rename', 'move file', 'clean up code', 'simplify', OR user wants to restructure code without changing functionality.
---

# Refactor

Safe code restructuring that preserves behavior. Extract functions, rename symbols, move modules, and simplify complex code with confidence.

## Core Principle

**Refactoring changes structure, not behavior.** Tests should pass before and after. If behavior changes, it's not refactoring—it's a bug or a feature.

## The Refactoring Process

```
┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│   Tests    │ ──▶ │  Refactor  │ ──▶ │   Tests    │ ──▶ │   Commit   │
│   Pass     │     │   (small)  │     │   Pass     │     │            │
└────────────┘     └────────────┘     └────────────┘     └────────────┘
      │                                      │
      │         If tests fail, undo          │
      └──────────────────────────────────────┘
```

1. **Verify tests pass** before starting
2. **Make one small change** at a time
3. **Run tests** after each change
4. **Commit** when tests pass
5. **Repeat** for next refactoring

## Workflow Routing

**When executing a workflow, output this notification:**

```
Running the **WorkflowName** workflow from the **Refactor** skill...
```

| Workflow | Trigger | File |
|----------|---------|------|
| **ExtractFunction** | "extract function", "pull out this logic", "make a helper" | `workflows/ExtractFunction.md` |
| **Rename** | "rename", "change name", "rename across codebase" | `workflows/Rename.md` |
| **MoveModule** | "move file", "reorganize", "relocate module" | `workflows/MoveModule.md` |

## Examples

**Example 1: Extract a function**
```
User: "This function is too long, extract the validation logic"
→ Invokes ExtractFunction workflow
→ Identifies extractable code
→ Creates new function with proper signature
→ Replaces original code with function call
→ Updates imports if needed
→ Verifies tests still pass
```

**Example 2: Rename across codebase**
```
User: "Rename getUserData to fetchUserProfile everywhere"
→ Invokes Rename workflow
→ Finds all usages (imports, calls, types)
→ Updates all occurrences
→ Updates file names if needed
→ Verifies no broken references
```

**Example 3: Move a module**
```
User: "Move utils/helpers.ts to lib/helpers.ts"
→ Invokes MoveModule workflow
→ Moves the file
→ Updates all imports pointing to old location
→ Updates any re-exports
→ Verifies tests still pass
```

## Quick Refactoring Checklist

Before refactoring:
- [ ] Tests exist and pass
- [ ] Code is committed (can revert if needed)
- [ ] Understand what the code does

During refactoring:
- [ ] Make small, incremental changes
- [ ] Run tests after each change
- [ ] Don't change behavior

After refactoring:
- [ ] All tests pass
- [ ] Code is cleaner/simpler
- [ ] No functionality changed

## Common Refactorings

| Refactoring | When to Use |
|-------------|-------------|
| **Extract Function** | Code is too long, logic is reusable |
| **Inline Function** | Function is trivial, adds no clarity |
| **Extract Variable** | Complex expression needs a name |
| **Rename** | Name doesn't describe purpose |
| **Move** | Code is in wrong module/file |
| **Extract Component** | JSX is too complex |
| **Extract Hook** | Component has too much logic |

## Integration with TDD

Refactoring is the third step of the TDD cycle:

```
RED → GREEN → REFACTOR
              ^^^^^^^^
              You are here
```

Use TDD skill to ensure test coverage before refactoring.

## Reference

See `RefactorPatterns.md` for detailed patterns and examples.
