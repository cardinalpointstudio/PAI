# WriteTestFirst Workflow

Generate a test specification before implementation. Creates a test file with `describe`/`it` structure that defines expected behavior.

## When to Use

- Starting a new feature and want to define behavior first
- User describes what something should do
- Need to think through edge cases before coding
- Want a clear contract before implementation

---

## Step 1: Gather Requirements

Ask the user (if not already provided):

1. **What are you building?** (function, component, API route, hook)
2. **What should it do?** (main behavior)
3. **What inputs does it take?** (parameters, props)
4. **What outputs should it produce?** (return value, UI, side effects)
5. **What can go wrong?** (error cases)

---

## Step 2: Determine Test Type

| Building | Test Type | Import From |
|----------|-----------|-------------|
| Pure function | Unit test | `vitest` |
| React component | Component test | `@testing-library/react` |
| Custom hook | Hook test | `@testing-library/react` |
| API route | Integration test | `vitest` + fetch |
| Full flow | E2E test | `@playwright/test` |

---

## Step 3: Generate Test Structure

Create the test file with this structure:

```typescript
import { describe, it, expect } from 'vitest'

describe('[ModuleName]', () => {
	describe('[functionOrMethod]', () => {
		// Happy path tests
		it('should [expected behavior] when [condition]', () => {
			// TODO: implement
			expect(true).toBe(false)
		})

		// Edge cases
		it('should handle empty input', () => {
			expect(true).toBe(false)
		})

		it('should handle null/undefined', () => {
			expect(true).toBe(false)
		})

		// Error cases
		it('should throw when [invalid condition]', () => {
			expect(true).toBe(false)
		})
	})
})
```

**Note:** Use `expect(true).toBe(false)` as placeholder - ensures tests fail until implemented.

---

## Step 4: Define Test Cases

For each behavior, write a specific test:

### Happy Path (Normal Usage)
```typescript
it('should return uppercase string when given lowercase', () => {
	expect(true).toBe(false) // TODO
})

it('should return user data when authenticated', () => {
	expect(true).toBe(false) // TODO
})
```

### Edge Cases (Boundary Conditions)
```typescript
it('should return empty string when given empty string', () => {
	expect(true).toBe(false) // TODO
})

it('should handle maximum length input', () => {
	expect(true).toBe(false) // TODO
})

it('should handle unicode characters', () => {
	expect(true).toBe(false) // TODO
})
```

### Error Cases (Invalid Input)
```typescript
it('should throw ValidationError when email is invalid', () => {
	expect(true).toBe(false) // TODO
})

it('should return 401 when not authenticated', () => {
	expect(true).toBe(false) // TODO
})
```

---

## Step 5: Add Setup If Needed

For tests that need shared setup:

```typescript
describe('UserService', () => {
	let service: UserService
	let mockDb: MockDatabase

	beforeEach(() => {
		mockDb = createMockDatabase()
		service = new UserService(mockDb)
	})

	afterEach(() => {
		mockDb.cleanup()
	})

	it('should create user', () => {
		expect(true).toBe(false) // TODO
	})
})
```

---

## Step 6: Save Test File

Save to appropriate location:

| Type | Location |
|------|----------|
| Unit test | `src/[module]/__tests__/[name].test.ts` |
| Component test | `src/components/[name]/__tests__/[name].test.tsx` |
| Integration test | `tests/integration/[name].integration.test.ts` |
| E2E test | `e2e/[name].spec.ts` |

---

## Example Output

**Requirement:** "I need a function to parse CSV data into an array of objects"

**Generated Test:**
```typescript
// src/utils/__tests__/parseCSV.test.ts
import { describe, it, expect } from 'vitest'
import { parseCSV } from '../parseCSV'

describe('parseCSV', () => {
	describe('valid input', () => {
		it('should parse CSV with headers into array of objects', () => {
			const csv = 'name,age\nAlice,30\nBob,25'
			const result = parseCSV(csv)
			expect(result).toEqual([
				{ name: 'Alice', age: '30' },
				{ name: 'Bob', age: '25' },
			])
		})

		it('should handle single row', () => {
			const csv = 'name,age\nAlice,30'
			const result = parseCSV(csv)
			expect(result).toHaveLength(1)
		})

		it('should handle quoted values with commas', () => {
			const csv = 'name,note\nAlice,"Hello, World"'
			const result = parseCSV(csv)
			expect(result[0].note).toBe('Hello, World')
		})
	})

	describe('edge cases', () => {
		it('should return empty array for headers-only CSV', () => {
			const csv = 'name,age'
			const result = parseCSV(csv)
			expect(result).toEqual([])
		})

		it('should return empty array for empty string', () => {
			expect(parseCSV('')).toEqual([])
		})

		it('should handle trailing newline', () => {
			const csv = 'name\nAlice\n'
			const result = parseCSV(csv)
			expect(result).toHaveLength(1)
		})
	})

	describe('error cases', () => {
		it('should throw on null input', () => {
			expect(() => parseCSV(null as any)).toThrow()
		})

		it('should throw on mismatched columns', () => {
			const csv = 'name,age\nAlice'
			expect(() => parseCSV(csv)).toThrow('Column mismatch')
		})
	})
})
```

---

## Output

Deliver:
1. Complete test file with structure
2. Clear `// TODO` markers or failing assertions
3. Explanation of what each test verifies
4. Next step: "Run tests to confirm they fail, then implement"
