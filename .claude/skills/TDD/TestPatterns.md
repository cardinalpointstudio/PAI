# Test Patterns Reference

Comprehensive patterns for writing tests with Vitest and Testing Library.

---

## Unit Test Patterns

### Basic Function Test
```typescript
import { describe, it, expect } from 'vitest'
import { add } from '../math'

describe('add', () => {
	it('should add two positive numbers', () => {
		expect(add(2, 3)).toBe(5)
	})

	it('should handle negative numbers', () => {
		expect(add(-1, 1)).toBe(0)
	})

	it('should handle zero', () => {
		expect(add(0, 5)).toBe(5)
	})
})
```

### Async Function Test
```typescript
import { describe, it, expect } from 'vitest'
import { fetchUser } from '../api'

describe('fetchUser', () => {
	it('should return user data', async () => {
		const user = await fetchUser('123')
		expect(user).toHaveProperty('id', '123')
		expect(user).toHaveProperty('name')
	})

	it('should throw on invalid id', async () => {
		await expect(fetchUser('')).rejects.toThrow('Invalid ID')
	})
})
```

### Testing Thrown Errors
```typescript
import { describe, it, expect } from 'vitest'
import { divide } from '../math'

describe('divide', () => {
	it('should throw on division by zero', () => {
		expect(() => divide(10, 0)).toThrow('Cannot divide by zero')
	})

	it('should throw specific error type', () => {
		expect(() => divide(10, 0)).toThrow(DivisionError)
	})
})
```

---

## Component Test Patterns

### Basic Render Test
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '../Button'

describe('Button', () => {
	it('should render with text', () => {
		render(<Button>Click me</Button>)
		expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
	})

	it('should be disabled when disabled prop is true', () => {
		render(<Button disabled>Click me</Button>)
		expect(screen.getByRole('button')).toBeDisabled()
	})
})
```

### User Interaction Test
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Counter } from '../Counter'

describe('Counter', () => {
	it('should increment on click', async () => {
		const user = userEvent.setup()
		render(<Counter initialCount={0} />)

		await user.click(screen.getByRole('button', { name: '+' }))

		expect(screen.getByText('1')).toBeInTheDocument()
	})

	it('should call onChange when value changes', async () => {
		const handleChange = vi.fn()
		const user = userEvent.setup()

		render(<Counter onChange={handleChange} />)
		await user.click(screen.getByRole('button', { name: '+' }))

		expect(handleChange).toHaveBeenCalledWith(1)
	})
})
```

### Form Input Test
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../LoginForm'

describe('LoginForm', () => {
	it('should update input values', async () => {
		const user = userEvent.setup()
		render(<LoginForm />)

		const emailInput = screen.getByLabelText('Email')
		await user.type(emailInput, 'test@example.com')

		expect(emailInput).toHaveValue('test@example.com')
	})

	it('should submit form with values', async () => {
		const handleSubmit = vi.fn()
		const user = userEvent.setup()

		render(<LoginForm onSubmit={handleSubmit} />)

		await user.type(screen.getByLabelText('Email'), 'test@example.com')
		await user.type(screen.getByLabelText('Password'), 'password123')
		await user.click(screen.getByRole('button', { name: 'Login' }))

		expect(handleSubmit).toHaveBeenCalledWith({
			email: 'test@example.com',
			password: 'password123',
		})
	})
})
```

### Async Component Test
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { UserProfile } from '../UserProfile'

describe('UserProfile', () => {
	it('should show loading state initially', () => {
		render(<UserProfile userId="123" />)
		expect(screen.getByText('Loading...')).toBeInTheDocument()
	})

	it('should show user data after loading', async () => {
		render(<UserProfile userId="123" />)

		await waitFor(() => {
			expect(screen.getByText('John Doe')).toBeInTheDocument()
		})
	})

	it('should show error on fetch failure', async () => {
		render(<UserProfile userId="invalid" />)

		await waitFor(() => {
			expect(screen.getByText('Failed to load user')).toBeInTheDocument()
		})
	})
})
```

---

## Hook Test Patterns

### Basic Hook Test
```typescript
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCounter } from '../useCounter'

describe('useCounter', () => {
	it('should start with initial value', () => {
		const { result } = renderHook(() => useCounter(10))
		expect(result.current.count).toBe(10)
	})

	it('should increment count', () => {
		const { result } = renderHook(() => useCounter(0))

		act(() => {
			result.current.increment()
		})

		expect(result.current.count).toBe(1)
	})

	it('should decrement count', () => {
		const { result } = renderHook(() => useCounter(5))

		act(() => {
			result.current.decrement()
		})

		expect(result.current.count).toBe(4)
	})
})
```

### Hook with Dependencies
```typescript
import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useDebounce } from '../useDebounce'

describe('useDebounce', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('should return initial value immediately', () => {
		const { result } = renderHook(() => useDebounce('initial', 500))
		expect(result.current).toBe('initial')
	})

	it('should debounce value changes', () => {
		const { result, rerender } = renderHook(
			({ value }) => useDebounce(value, 500),
			{ initialProps: { value: 'initial' } }
		)

		rerender({ value: 'updated' })
		expect(result.current).toBe('initial') // Not updated yet

		vi.advanceTimersByTime(500)
		expect(result.current).toBe('updated') // Now updated
	})
})
```

---

## Mock Patterns

### Mocking Modules
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the entire module
vi.mock('../api', () => ({
	fetchUser: vi.fn(),
	updateUser: vi.fn(),
}))

import { fetchUser, updateUser } from '../api'
import { UserService } from '../UserService'

describe('UserService', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should fetch user', async () => {
		vi.mocked(fetchUser).mockResolvedValue({ id: '1', name: 'John' })

		const service = new UserService()
		const user = await service.getUser('1')

		expect(fetchUser).toHaveBeenCalledWith('1')
		expect(user.name).toBe('John')
	})
})
```

### Mocking Specific Functions
```typescript
import { describe, it, expect, vi } from 'vitest'
import * as utils from '../utils'
import { processData } from '../processor'

describe('processData', () => {
	it('should use formatted date', () => {
		const formatSpy = vi.spyOn(utils, 'formatDate').mockReturnValue('2024-01-01')

		const result = processData({ date: new Date() })

		expect(formatSpy).toHaveBeenCalled()
		expect(result.formattedDate).toBe('2024-01-01')

		formatSpy.mockRestore()
	})
})
```

### Mock Factory Pattern
```typescript
// __tests__/factories.ts
export function createMockUser(overrides = {}) {
	return {
		id: '1',
		email: 'test@example.com',
		name: 'Test User',
		createdAt: new Date('2024-01-01'),
		...overrides,
	}
}

export function createMockPost(overrides = {}) {
	return {
		id: '1',
		title: 'Test Post',
		content: 'Test content',
		authorId: '1',
		...overrides,
	}
}

// Usage in tests
import { createMockUser } from './factories'

it('should display user name', () => {
	const user = createMockUser({ name: 'Custom Name' })
	render(<UserCard user={user} />)
	expect(screen.getByText('Custom Name')).toBeInTheDocument()
})
```

---

## Integration Test Patterns

### API Route Test
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestUser, cleanup } from './helpers'

describe('GET /api/users/:id', () => {
	let testUser: TestUser

	beforeEach(async () => {
		testUser = await createTestUser()
	})

	afterEach(async () => {
		await cleanup()
	})

	it('should return user when authenticated', async () => {
		const response = await fetch(`/api/users/${testUser.id}`, {
			headers: { Authorization: `Bearer ${testUser.token}` },
		})

		expect(response.status).toBe(200)
		const data = await response.json()
		expect(data.id).toBe(testUser.id)
	})

	it('should return 401 when not authenticated', async () => {
		const response = await fetch(`/api/users/${testUser.id}`)
		expect(response.status).toBe(401)
	})

	it('should return 404 for non-existent user', async () => {
		const response = await fetch('/api/users/nonexistent', {
			headers: { Authorization: `Bearer ${testUser.token}` },
		})
		expect(response.status).toBe(404)
	})
})
```

### Database Integration Test
```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { db } from '../db'
import { UserRepository } from '../repositories/UserRepository'

describe('UserRepository', () => {
	let repo: UserRepository

	beforeAll(async () => {
		await db.connect()
		repo = new UserRepository(db)
	})

	afterAll(async () => {
		await db.disconnect()
	})

	beforeEach(async () => {
		await db.users.deleteMany({})
	})

	it('should create user', async () => {
		const user = await repo.create({
			email: 'test@example.com',
			name: 'Test User',
		})

		expect(user.id).toBeDefined()
		expect(user.email).toBe('test@example.com')
	})

	it('should find user by email', async () => {
		await repo.create({ email: 'test@example.com', name: 'Test' })

		const user = await repo.findByEmail('test@example.com')

		expect(user).not.toBeNull()
		expect(user?.name).toBe('Test')
	})
})
```

---

## Test Organization

### File Structure
```
src/
├── utils/
│   ├── format.ts
│   └── __tests__/
│       └── format.test.ts
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── __tests__/
│   │       └── Button.test.tsx
└── hooks/
    ├── useAuth.ts
    └── __tests__/
        └── useAuth.test.ts
```

### Describe Block Organization
```typescript
describe('ModuleName', () => {
	// Group by method/functionality
	describe('methodName', () => {
		// Happy path first
		it('should handle normal case', () => {})

		// Edge cases
		it('should handle empty input', () => {})
		it('should handle large input', () => {})

		// Error cases last
		it('should throw on invalid input', () => {})
	})

	describe('anotherMethod', () => {
		// ...
	})
})
```

---

## Common Assertions

```typescript
// Equality
expect(value).toBe(expected)           // Strict equality (===)
expect(value).toEqual(expected)        // Deep equality
expect(value).toStrictEqual(expected)  // Deep + type equality

// Truthiness
expect(value).toBeTruthy()
expect(value).toBeFalsy()
expect(value).toBeNull()
expect(value).toBeUndefined()
expect(value).toBeDefined()

// Numbers
expect(value).toBeGreaterThan(number)
expect(value).toBeLessThan(number)
expect(value).toBeCloseTo(number, decimals)

// Strings
expect(string).toMatch(/regex/)
expect(string).toContain('substring')

// Arrays
expect(array).toContain(item)
expect(array).toHaveLength(number)
expect(array).toContainEqual(object)

// Objects
expect(object).toHaveProperty('key')
expect(object).toHaveProperty('key', value)
expect(object).toMatchObject(partialObject)

// Functions
expect(fn).toHaveBeenCalled()
expect(fn).toHaveBeenCalledWith(arg1, arg2)
expect(fn).toHaveBeenCalledTimes(number)

// Errors
expect(() => fn()).toThrow()
expect(() => fn()).toThrow('message')
expect(() => fn()).toThrow(ErrorType)

// Async
await expect(promise).resolves.toBe(value)
await expect(promise).rejects.toThrow()

// DOM (Testing Library)
expect(element).toBeInTheDocument()
expect(element).toBeVisible()
expect(element).toBeDisabled()
expect(element).toHaveValue('value')
expect(element).toHaveTextContent('text')
```
