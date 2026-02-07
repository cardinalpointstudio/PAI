# RedGreenRefactor Workflow

The complete TDD cycle for implementing features test-first.

## When to Use

- Implementing a new feature or function
- User explicitly requests TDD approach
- Building something where correctness matters
- You want confidence before refactoring

## Prerequisites

- Project has Vitest configured
- Test directory exists (`tests/` or `__tests__/`)
- User has described what they want to build

---

## Step 1: Understand the Requirement

Before writing any code, clarify:

1. **What is the input?** - Parameters, props, request data
2. **What is the output?** - Return value, rendered UI, response
3. **What are the edge cases?** - Null, empty, invalid, boundary values
4. **What errors can occur?** - And how should they be handled?

Ask the user if any of these are unclear.

---

## Step 2: RED - Write Failing Test

Create a test file that describes the expected behavior:

```typescript
import { describe, it, expect } from 'vitest'
import { functionName } from '../path/to/module'

describe('functionName', () => {
	it('should handle the main use case', () => {
		// Arrange
		const input = /* typical input */

		// Act
		const result = functionName(input)

		// Assert
		expect(result).toBe(/* expected output */)
	})

	it('should handle edge case: empty input', () => {
		expect(functionName('')).toBe(/* expected */)
	})

	it('should throw on invalid input', () => {
		expect(() => functionName(null)).toThrow()
	})
})
```

**Key principles:**
- Test behavior, not implementation
- One assertion per test (when practical)
- Descriptive test names that read like specifications
- Cover happy path, edge cases, and error cases

---

## Step 3: Verify RED

Run the test to confirm it fails:

```bash
bun test path/to/test.test.ts
```

**Expected:** Test fails because the function doesn't exist or doesn't work yet.

**If test passes:** Your test isn't testing anything useful. Fix it.

**If test has syntax errors:** Fix the test first.

---

## Step 4: GREEN - Implement Minimal Code

Write the **minimum code** needed to make the test pass:

```typescript
export function functionName(input: string): string {
	// Simplest implementation that passes
	if (!input) return ''
	return input.toUpperCase()
}
```

**Key principles:**
- Don't add features the tests don't require
- Don't optimize prematurely
- Don't handle cases you haven't tested
- "Fake it till you make it" is okay initially

---

## Step 5: Verify GREEN

Run the test again:

```bash
bun test path/to/test.test.ts
```

**Expected:** All tests pass.

**If tests fail:** Fix the implementation, not the tests (unless tests are wrong).

---

## Step 6: REFACTOR - Clean Up

With passing tests as your safety net, improve the code:

**Things to refactor:**
- Remove duplication
- Improve variable/function names
- Extract helper functions
- Simplify complex logic
- Add types if missing

**After each change:**
```bash
bun test path/to/test.test.ts
```

Tests must stay GREEN. If they fail, undo and try again.

---

## Step 7: REPEAT

For the next piece of functionality:
1. Write a new failing test (RED)
2. Make it pass (GREEN)
3. Refactor if needed

Build the feature incrementally, one test at a time.

---

## Complete Example

**Requirement:** Create a function that validates email addresses.

### RED - Write Test
```typescript
// src/utils/__tests__/validateEmail.test.ts
import { describe, it, expect } from 'vitest'
import { validateEmail } from '../validateEmail'

describe('validateEmail', () => {
	it('should return true for valid email', () => {
		expect(validateEmail('user@example.com')).toBe(true)
	})

	it('should return false for email without @', () => {
		expect(validateEmail('userexample.com')).toBe(false)
	})

	it('should return false for email without domain', () => {
		expect(validateEmail('user@')).toBe(false)
	})

	it('should return false for empty string', () => {
		expect(validateEmail('')).toBe(false)
	})

	it('should return false for null/undefined', () => {
		expect(validateEmail(null as any)).toBe(false)
		expect(validateEmail(undefined as any)).toBe(false)
	})
})
```

### GREEN - Implement
```typescript
// src/utils/validateEmail.ts
export function validateEmail(email: string | null | undefined): boolean {
	if (!email) return false
	const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return pattern.test(email)
}
```

### REFACTOR
```typescript
// Already clean, but could extract pattern as constant
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email: string | null | undefined): boolean {
	if (!email) return false
	return EMAIL_PATTERN.test(email)
}
```

---

## Output Checklist

Before completing this workflow:

- [ ] All tests pass
- [ ] Tests cover happy path
- [ ] Tests cover edge cases
- [ ] Tests cover error cases
- [ ] Code is clean and readable
- [ ] No untested code paths added
