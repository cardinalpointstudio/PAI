# Run tests

Run tests for the current project with optional filtering.

## Instructions

1. **Detect Test Framework**
   - Check package.json for test scripts
   - Common: vitest, jest, playwright, bun test

2. **Run Tests Based on Arguments**
   - No args: Run unit tests (`bun test` or `bun run test:run`)
   - Pattern: Filter by filename or test name
   - Type flags: Run specific test suites

3. **Report Results**
   - Show pass/fail/skip counts
   - Display failed test details
   - Show coverage summary if available

## Arguments

- `/test` - Run all unit tests
- `/test <pattern>` - Run tests matching pattern (e.g., `/test Button`)
- `/test integration` - Run integration tests
- `/test e2e` - Run end-to-end tests (Playwright)
- `/test coverage` - Run with coverage report
- `/test watch` - Run in watch mode

## Output Format

```
🧪 Running Tests
━━━━━━━━━━━━━━━━━

Running: bun test

 ✓ src/components/Button.test.tsx (3 tests)
 ✓ src/utils/format.test.ts (5 tests)
 ✓ src/hooks/useAuth.test.ts (4 tests)
 ✗ src/api/booking.test.ts (2 tests)

━━━━━━━━━━━━━━━━━
Tests: 12 passed | 2 failed | 0 skipped
Time:  3.2s

Failed:
  src/api/booking.test.ts
    ✗ should create booking → Expected 201, got 400
    ✗ should validate dates → TypeError: undefined
```

For e2e:
```
🎭 Running E2E Tests (Playwright)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 ✓ login.spec.ts (4 tests)
 ✓ booking.spec.ts (6 tests)
 ✓ dashboard.spec.ts (3 tests)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ 13 passed across 3 browsers
```

## Project-Specific Commands

For grapplingconnect (run from app/ directory):
- Unit: `bun test`
- Integration: `bun run test:integration`
- E2E: `bun run e2e`
- Coverage: `bun run test:coverage`
