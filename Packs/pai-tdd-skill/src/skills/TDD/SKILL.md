---
name: TDD
description: Test-driven development workflow - write failing tests first, implement, refactor. USE WHEN user says 'write test first', 'TDD', 'test driven', 'red green refactor', 'write tests for', 'add tests', OR user wants to implement a feature with tests first.
---

# TDD

Test-driven development skill that guides the red-green-refactor cycle. Write failing tests first, implement minimal code to pass, then refactor while keeping tests green.

## Core Principle

**Tests are specifications, not afterthoughts.** Writing tests first forces you to:
1. Think about the interface before implementation
2. Define expected behavior clearly
3. Build only what's needed
4. Have confidence when refactoring

## Workflow Routing

**When executing a workflow, output this notification:**

```
Running the **WorkflowName** workflow from the **TDD** skill...
```

| Workflow | Trigger | File |
|----------|---------|------|
| **RedGreenRefactor** | "TDD", "red green refactor", "test driven development" | `workflows/RedGreenRefactor.md` |
| **WriteTestFirst** | "write test first", "test spec", "describe the behavior" | `workflows/WriteTestFirst.md` |
| **GenerateTests** | "generate tests", "add tests for", "create tests" | `workflows/GenerateTests.md` |
| **AnalyzeCoverage** | "check coverage", "coverage gaps", "what needs tests" | `workflows/AnalyzeCoverage.md` |

## The TDD Cycle

```
    ┌─────────────────────────────────────┐
    │                                     │
    ▼                                     │
┌───────┐      ┌───────┐      ┌──────────┐│
│  RED  │ ───▶ │ GREEN │ ───▶ │ REFACTOR ││
│ Write │      │ Make  │      │  Clean   ││
│ Test  │      │ Pass  │      │   Up     ││
└───────┘      └───────┘      └──────────┘│
    │                              │      │
    │         Next Feature         │      │
    └──────────────────────────────┴──────┘
```

1. **RED**: Write a failing test that describes expected behavior
2. **GREEN**: Write minimal code to make the test pass
3. **REFACTOR**: Clean up code while keeping tests green

## Examples

**Example 1: Implement a new utility function**
```
User: "I need a function to validate email addresses, use TDD"
→ Invokes RedGreenRefactor workflow
→ Step 1: Write test cases (valid emails, invalid emails, edge cases)
→ Step 2: Run tests - they fail (RED)
→ Step 3: Implement validateEmail function
→ Step 4: Run tests - they pass (GREEN)
→ Step 5: Refactor if needed
→ Delivers tested, working function
```

**Example 2: Add tests for existing code**
```
User: "Generate tests for the UserService class"
→ Invokes GenerateTests workflow
→ Analyzes UserService methods
→ Generates test file with describe/it structure
→ Covers happy paths, error cases, edge cases
```

**Example 3: Find coverage gaps**
```
User: "What code needs tests?"
→ Invokes AnalyzeCoverage workflow
→ Runs coverage report
→ Identifies files below 80% threshold
→ Suggests specific tests to write
```

## Test Types Supported

| Type | Use Case | Pattern |
|------|----------|---------|
| **Unit** | Pure functions, utilities | Direct input/output testing |
| **Component** | React components | render + assertions |
| **Hook** | Custom React hooks | renderHook |
| **Integration** | API routes, database | Setup/teardown with real DB |
| **E2E** | Full user flows | Playwright |

## Reference

See `TestPatterns.md` for detailed patterns and examples.
