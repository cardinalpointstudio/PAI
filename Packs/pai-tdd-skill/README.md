---
name: PAI TDD Skill
pack-id: pai-tdd-skill-v1.0.0
version: 1.0.0
author: salexanderb
description: Test-driven development workflow - write failing tests first, implement minimal code, refactor while green. Guides the red-green-refactor cycle for reliable, well-tested code.
type: skill
purpose-type: [testing, development, quality, tdd]
platform: claude-code
dependencies: []
keywords: [tdd, test-driven, testing, vitest, red-green-refactor, unit-tests, coverage, test-first]
---

# PAI TDD Skill

> Test-driven development workflow that guides the red-green-refactor cycle. Write failing tests first, implement minimal code to pass, then refactor while keeping tests green.

> **Installation:** This pack is designed for AI-assisted installation. Give this directory to your AI and ask it to install using `INSTALL.md`.

---

## What This Pack Provides

- **Red-Green-Refactor Cycle** - Complete TDD workflow for new features
- **Test-First Development** - Generate test specs before implementation
- **Test Generation** - Create comprehensive tests for existing code
- **Coverage Analysis** - Find gaps and suggest tests to write
- **Multiple Test Types** - Unit, component, hook, integration, E2E

## Core Principle

**Tests are specifications, not afterthoughts.** Writing tests first forces you to:
1. Think about the interface before implementation
2. Define expected behavior clearly
3. Build only what's needed
4. Have confidence when refactoring

## Architecture

```
TDD Skill
├── SKILL.md                     # Main entry point and routing
└── workflows/
    ├── RedGreenRefactor.md      # Complete TDD cycle
    ├── WriteTestFirst.md        # Generate test specs
    ├── GenerateTests.md         # Tests for existing code
    └── AnalyzeCoverage.md       # Find coverage gaps
```

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

## Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **RedGreenRefactor** | "TDD", "red green refactor" | Full TDD cycle for new features |
| **WriteTestFirst** | "write test first", "test spec" | Generate test file before implementation |
| **GenerateTests** | "generate tests", "add tests for" | Create tests for existing code |
| **AnalyzeCoverage** | "check coverage", "what needs tests" | Find gaps, suggest improvements |

## Test Types Supported

| Type | Use Case | Pattern |
|------|----------|---------|
| **Unit** | Pure functions, utilities | Direct input/output testing |
| **Component** | React components | render + assertions |
| **Hook** | Custom React hooks | renderHook |
| **Integration** | API routes, database | Setup/teardown with real DB |
| **E2E** | Full user flows | Playwright |

## Usage Examples

```
"I need a function to validate email addresses, use TDD"
→ Invokes RedGreenRefactor workflow
→ Step 1: Write test cases (valid, invalid, edge cases)
→ Step 2: Run tests - they fail (RED)
→ Step 3: Implement validateEmail function
→ Step 4: Run tests - they pass (GREEN)
→ Step 5: Refactor if needed

"Generate tests for the UserService class"
→ Invokes GenerateTests workflow
→ Analyzes UserService methods
→ Generates test file with describe/it structure
→ Covers happy paths, error cases, edge cases

"What code needs tests?"
→ Invokes AnalyzeCoverage workflow
→ Runs coverage report
→ Identifies files below 80% threshold
→ Suggests specific tests to write
```

## What's Included

| Component | File | Purpose |
|-----------|------|---------|
| Main Skill | src/skills/TDD/SKILL.md | Entry point and workflow routing |
| RedGreenRefactor | src/skills/TDD/workflows/RedGreenRefactor.md | Complete TDD cycle |
| WriteTestFirst | src/skills/TDD/workflows/WriteTestFirst.md | Test spec generation |
| GenerateTests | src/skills/TDD/workflows/GenerateTests.md | Tests for existing code |
| AnalyzeCoverage | src/skills/TDD/workflows/AnalyzeCoverage.md | Coverage gap analysis |

## Coverage Thresholds

Default thresholds (configurable in vitest.config.ts):

| Metric | Threshold |
|--------|-----------|
| Statements | 80% |
| Branches | 75% |
| Functions | 80% |
| Lines | 80% |

## Integration

**Works well with:**
- **CodeAudit** - Audit first, then add tests to uncovered code
- **Refactor** - Tests provide safety net for refactoring
- **Debugging** - Write test that reproduces bug first (regression test)

**Requires:**
- **Vitest** - Test runner (or Jest with minor adjustments)
- **@testing-library/react** - For component/hook tests

## Model Interoperability

This skill is workflow-based with no CLI tools. Any model can:
1. Read the workflow files
2. Follow the step-by-step instructions
3. Generate appropriate test code

The workflows are deterministic procedures that any model can execute.

## Credits

- **Author:** salexanderb
- **License:** MIT

## Changelog

### 1.0.0 - 2026-02-19
- Initial release
- RedGreenRefactor workflow
- WriteTestFirst workflow
- GenerateTests workflow
- AnalyzeCoverage workflow
- Support for unit, component, hook, integration, E2E tests
