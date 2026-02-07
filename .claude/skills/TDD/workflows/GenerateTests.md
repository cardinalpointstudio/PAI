# GenerateTests Workflow

Generate comprehensive tests for existing code. Analyzes the code and creates appropriate test coverage.

## When to Use

- Code exists but has no tests
- Need to add test coverage to legacy code
- Want to understand what a module does via its tests
- Preparing to refactor (need safety net first)

---

## Step 1: Identify What to Test

Get the file or module path from the user:
- Single file: `src/utils/helpers.ts`
- Component: `src/components/Button.tsx`
- Module directory: `src/services/auth/`

---

## Step 2: Analyze the Code

Read the file and identify:

1. **Exports** - What functions/classes/components are exported?
2. **Dependencies** - What does it import? (need to mock?)
3. **Side effects** - API calls, database, localStorage?
4. **Complexity** - Branches, loops, error handling?

---

## Step 3: Determine Test Strategy

### For Pure Functions
```typescript
// No dependencies, no side effects
// → Direct unit tests
export function add(a: number, b: number): number {
	return a + b
}
```

### For Functions with Dependencies
```typescript
// Has external dependencies
// → Mock the dependencies
export async function getUser(id: string) {
	return await db.users.findOne({ id })
}
```

### For React Components
```typescript
// UI component
// → Render and assert on output
export function Button({ onClick, children }) {
	return <button onClick={onClick}>{children}</button>
}
```

### For Hooks
```typescript
// Custom hook
// → Use renderHook
export function useCounter(initial = 0) {
	const [count, setCount] = useState(initial)
	return { count, increment: () => setCount(c => c + 1) }
}
```

---

## Step 4: Generate Test File

### Unit Test Template
```typescript
import { describe, it, expect, vi } from 'vitest'
import { functionName } from '../module'

describe('functionName', () => {
	it('should [behavior] when [condition]', () => {
		// Arrange
		const input = /* test data */

		// Act
		const result = functionName(input)

		// Assert
		expect(result).toBe(/* expected */)
	})
})
```

### Component Test Template
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComponentName } from '../ComponentName'

describe('ComponentName', () => {
	it('should render correctly', () => {
		render(<ComponentName prop="value" />)
		expect(screen.getByText('expected text')).toBeInTheDocument()
	})

	it('should call onClick when clicked', async () => {
		const handleClick = vi.fn()
		const user = userEvent.setup()

		render(<ComponentName onClick={handleClick} />)
		await user.click(screen.getByRole('button'))

		expect(handleClick).toHaveBeenCalledTimes(1)
	})
})
```

### Hook Test Template
```typescript
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useHookName } from '../useHookName'

describe('useHookName', () => {
	it('should return initial state', () => {
		const { result } = renderHook(() => useHookName())
		expect(result.current.value).toBe(initialValue)
	})

	it('should update state when action called', () => {
		const { result } = renderHook(() => useHookName())

		act(() => {
			result.current.action()
		})

		expect(result.current.value).toBe(updatedValue)
	})
})
```

### Integration Test Template
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('API: /api/resource', () => {
	beforeEach(async () => {
		// Setup test data
	})

	afterEach(async () => {
		// Cleanup
	})

	it('should return 200 with data', async () => {
		const response = await fetch('/api/resource')
		const data = await response.json()

		expect(response.status).toBe(200)
		expect(data).toHaveProperty('items')
	})

	it('should return 401 when unauthorized', async () => {
		const response = await fetch('/api/resource', {
			headers: { Authorization: '' },
		})
		expect(response.status).toBe(401)
	})
})
```

---

## Step 5: Cover All Code Paths

For each function, ensure tests cover:

### Branches
```typescript
// Code has if/else
if (condition) {
	return a
} else {
	return b
}

// Tests needed:
it('should return a when condition is true', ...)
it('should return b when condition is false', ...)
```

### Loops
```typescript
// Code iterates
for (const item of items) { ... }

// Tests needed:
it('should handle empty array', ...)
it('should handle single item', ...)
it('should handle multiple items', ...)
```

### Error Handling
```typescript
// Code can throw
if (!valid) throw new Error('Invalid')

// Tests needed:
it('should throw when invalid', () => {
	expect(() => fn(invalid)).toThrow('Invalid')
})
```

---

## Step 6: Add Mocks If Needed

### Mocking Modules
```typescript
vi.mock('../api', () => ({
	fetchData: vi.fn(),
}))

import { fetchData } from '../api'

beforeEach(() => {
	vi.mocked(fetchData).mockResolvedValue({ data: 'test' })
})
```

### Mocking Functions
```typescript
const mockCallback = vi.fn()
functionThatUsesCallback(mockCallback)
expect(mockCallback).toHaveBeenCalledWith('expected')
```

---

## Step 7: Verify Coverage

After generating tests, run:

```bash
bun run test:coverage -- path/to/test.test.ts
```

Check that:
- Statement coverage ≥ 80%
- Branch coverage ≥ 75%
- Function coverage ≥ 80%

---

## Output

Deliver:
1. Complete test file
2. All exports tested
3. Happy path + edge cases + error cases
4. Mocks for external dependencies
5. Coverage report showing what's tested
