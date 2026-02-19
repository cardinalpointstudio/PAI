---
name: PAI Refactor Skill
pack-id: pai-refactor-skill-v1.0.0
version: 1.0.0
author: salexanderb
description: Safe code restructuring - extract, rename, move, and simplify code while preserving behavior. Follows test-first refactoring process.
type: skill
purpose-type: [refactoring, code-cleanup, restructuring, code-quality]
platform: claude-code
dependencies: []
keywords: [refactor, extract, rename, move, cleanup, simplify, restructure, code-smell]
---

# PAI Refactor Skill

> Safe code restructuring that preserves behavior. Extract functions, rename symbols, move modules, and simplify complex code with confidence.

> **Installation:** This pack is designed for AI-assisted installation. Give this directory to your AI and ask it to install using `INSTALL.md`.

---

## What This Pack Provides

- **Extract Function** - Pull out code into reusable functions
- **Rename Symbols** - Rename across entire codebase safely
- **Move Modules** - Relocate files while updating all imports
- **Code Smell Detection** - Identify and address design issues
- **React Patterns** - Extract components and custom hooks

## Core Principle

**Refactoring changes structure, not behavior.** Tests should pass before and after. If behavior changes, it's not refactoring—it's a bug or a feature.

## Architecture

```
Refactor Skill
├── SKILL.md                     # Main entry point and routing
├── RefactorPatterns.md          # Code smells and patterns reference
└── workflows/
    ├── ExtractFunction.md       # Extract code into functions
    ├── Rename.md                # Rename symbols across codebase
    └── MoveModule.md            # Move files and update imports
```

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

## Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **ExtractFunction** | "extract function", "pull out this logic", "make a helper" | Extract code into reusable functions |
| **Rename** | "rename", "change name", "rename across codebase" | Rename symbols everywhere |
| **MoveModule** | "move file", "reorganize", "relocate module" | Move files and update imports |

## Code Smells Reference

| Smell | Symptom | Refactoring |
|-------|---------|-------------|
| **Long Function** | > 20-30 lines | Extract Function |
| **Long Parameter List** | > 3-4 parameters | Introduce Parameter Object |
| **Duplicated Code** | Same logic in multiple places | Extract Function |
| **Feature Envy** | Uses another object's data more | Move Function |
| **Large Class** | Too many responsibilities | Extract Class |
| **Dead Code** | Unreachable or unused | Delete it |

## Usage Examples

```
"This function is too long, extract the validation logic"
→ Invokes ExtractFunction workflow
→ Identifies extractable code
→ Creates new function with proper signature
→ Replaces original code with function call
→ Verifies tests still pass

"Rename getUserData to fetchUserProfile everywhere"
→ Invokes Rename workflow
→ Finds all usages (imports, calls, types)
→ Updates all occurrences
→ Verifies no broken references

"Move utils/helpers.ts to lib/helpers.ts"
→ Invokes MoveModule workflow
→ Moves the file with git mv
→ Updates all imports
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

## What's Included

| Component | File | Purpose |
|-----------|------|---------|
| Main Skill | src/skills/Refactor/SKILL.md | Entry point and workflow routing |
| Patterns Reference | src/skills/Refactor/RefactorPatterns.md | Code smells and patterns |
| ExtractFunction | src/skills/Refactor/workflows/ExtractFunction.md | Extract code into functions |
| Rename | src/skills/Refactor/workflows/Rename.md | Rename symbols across codebase |
| MoveModule | src/skills/Refactor/workflows/MoveModule.md | Move files and update imports |

## Integration

**Works well with:**
- **TDD** - Refactoring is the third step of red-green-refactor
- **CodeAudit** - Find code smells that need refactoring
- **Debugging** - Clean up after fixing bugs

## Model Interoperability

This skill is workflow-based with no CLI tools. Any model can:
1. Read the workflow files
2. Follow the step-by-step instructions
3. Apply refactoring techniques

The workflows are deterministic procedures that any model can execute.

## Credits

- **Author:** salexanderb
- **License:** MIT

## Changelog

### 1.0.0 - 2026-02-19
- Initial release
- ExtractFunction workflow
- Rename workflow
- MoveModule workflow
- RefactorPatterns reference (code smells, React patterns)
