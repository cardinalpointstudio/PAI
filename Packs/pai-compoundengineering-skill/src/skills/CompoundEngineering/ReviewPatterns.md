# Review Patterns Reference

Common issues to catch during code review, organized by category.

---

## Security Patterns

### Input Validation

```typescript
// ❌ Bad: Trusting user input
app.get('/user/:id', (c) => {
	const user = db.query(`SELECT * FROM users WHERE id = ${c.req.param('id')}`)
})

// ✅ Good: Parameterized query
app.get('/user/:id', (c) => {
	const user = db.query('SELECT * FROM users WHERE id = ?', [c.req.param('id')])
})
```

### Authentication Bypass

```typescript
// ❌ Bad: Auth check after data access
app.get('/admin/users', async (c) => {
	const users = await db.users.findAll()  // Data already fetched!
	if (!c.get('user').isAdmin) {
		return c.json({ error: 'Forbidden' }, 403)
	}
	return c.json(users)
})

// ✅ Good: Auth check first
app.get('/admin/users', async (c) => {
	if (!c.get('user').isAdmin) {
		return c.json({ error: 'Forbidden' }, 403)
	}
	const users = await db.users.findAll()
	return c.json(users)
})
```

### Secrets Exposure

```typescript
// ❌ Bad: Secrets in code
const apiKey = 'sk_live_abc123xyz'

// ❌ Bad: Secrets in error messages
catch (e) {
	return c.json({ error: `DB connection failed: ${process.env.DATABASE_URL}` })
}

// ❌ Bad: Logging sensitive data
console.log('User login:', { email, password })

// ✅ Good: Environment variables, sanitized errors
const apiKey = process.env.API_KEY
console.log('User login:', { email, password: '[REDACTED]' })
```

### Authorization (IDOR)

```typescript
// ❌ Bad: No ownership check (Insecure Direct Object Reference)
app.delete('/posts/:id', async (c) => {
	await db.posts.delete(c.req.param('id'))  // Anyone can delete any post!
})

// ✅ Good: Verify ownership
app.delete('/posts/:id', async (c) => {
	const post = await db.posts.findById(c.req.param('id'))
	if (post.authorId !== c.get('user').id) {
		return c.json({ error: 'Forbidden' }, 403)
	}
	await db.posts.delete(c.req.param('id'))
})
```

### XSS Prevention

```tsx
// ❌ Bad: Unescaped HTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ❌ Bad: URL from user input
<a href={userProvidedUrl}>Click here</a>

// ✅ Good: Sanitize or avoid
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />

// ✅ Good: Validate URL scheme
const safeUrl = url.startsWith('https://') ? url : '#'
```

---

## Performance Patterns

### N+1 Queries

```typescript
// ❌ Bad: Query in loop
const posts = await db.posts.findAll()
for (const post of posts) {
	post.author = await db.users.findById(post.authorId)  // N queries!
}

// ✅ Good: Single query with join or batch
const posts = await db.posts.findAll({ include: ['author'] })

// ✅ Good: Batch fetch
const posts = await db.posts.findAll()
const authorIds = [...new Set(posts.map(p => p.authorId))]
const authors = await db.users.findByIds(authorIds)
const authorMap = new Map(authors.map(a => [a.id, a]))
posts.forEach(p => p.author = authorMap.get(p.authorId))
```

### Unbounded Queries

```typescript
// ❌ Bad: No limit
const allUsers = await db.users.findAll()

// ❌ Bad: Fetching everything then filtering
const activeUsers = (await db.users.findAll()).filter(u => u.active)

// ✅ Good: Limit and paginate
const users = await db.users.findAll({ where: { active: true }, limit: 100 })
```

### Blocking Operations

```typescript
// ❌ Bad: Sync file operations in request handler
app.get('/data', (c) => {
	const data = fs.readFileSync('large-file.json')  // Blocks event loop!
	return c.json(JSON.parse(data))
})

// ✅ Good: Async operations
app.get('/data', async (c) => {
	const data = await fs.promises.readFile('large-file.json')
	return c.json(JSON.parse(data))
})
```

### Memory Leaks

```typescript
// ❌ Bad: Growing array without cleanup
const cache: Record<string, Data> = {}
app.get('/data/:id', async (c) => {
	const id = c.req.param('id')
	if (!cache[id]) {
		cache[id] = await fetchData(id)  // Never evicted!
	}
	return c.json(cache[id])
})

// ✅ Good: Use LRU cache with max size
import { LRUCache } from 'lru-cache'
const cache = new LRUCache<string, Data>({ max: 1000 })
```

### Unnecessary Re-renders (React)

```tsx
// ❌ Bad: New object/array on every render
function Parent() {
	return <Child style={{ color: 'red' }} items={[1, 2, 3]} />
}

// ❌ Bad: Inline function
function Parent() {
	return <Child onClick={() => doSomething()} />
}

// ✅ Good: Stable references
const style = { color: 'red' }
const items = [1, 2, 3]
const handleClick = useCallback(() => doSomething(), [])

function Parent() {
	return <Child style={style} items={items} onClick={handleClick} />
}
```

---

## Correctness Patterns

### Off-by-One Errors

```typescript
// ❌ Bad: Wrong boundary
for (let i = 0; i <= array.length; i++) {  // Should be <
	console.log(array[i])  // undefined on last iteration
}

// ❌ Bad: Substring boundary
const last3 = str.substring(str.length - 3, str.length - 1)  // Missing last char

// ✅ Good: Correct boundaries
for (let i = 0; i < array.length; i++) { ... }
const last3 = str.substring(str.length - 3)
```

### Null/Undefined Handling

```typescript
// ❌ Bad: Assuming existence
function getUsername(user: User | null) {
	return user.name.toLowerCase()  // Crash if null!
}

// ❌ Bad: Falsy confusion
function process(value: number) {
	if (!value) return  // Skips 0, which might be valid!
}

// ✅ Good: Explicit checks
function getUsername(user: User | null) {
	return user?.name?.toLowerCase() ?? 'anonymous'
}

function process(value: number | undefined) {
	if (value === undefined) return
}
```

### Race Conditions

```typescript
// ❌ Bad: Check-then-act race
if (!cache.has(key)) {
	const data = await fetchData(key)  // Another request might set it here!
	cache.set(key, data)
}

// ✅ Good: Atomic operation or lock
const data = cache.get(key) ?? await mutex.runExclusive(async () => {
	// Double-check inside lock
	if (cache.has(key)) return cache.get(key)
	const data = await fetchData(key)
	cache.set(key, data)
	return data
})
```

### Async/Await Mistakes

```typescript
// ❌ Bad: Forgetting await
async function save(data: Data) {
	db.save(data)  // Returns immediately, save might fail silently!
	return { success: true }
}

// ❌ Bad: Sequential when parallel is fine
const user = await getUser(id)
const posts = await getPosts(id)  // Waits for user unnecessarily

// ✅ Good: Proper await
async function save(data: Data) {
	await db.save(data)
	return { success: true }
}

// ✅ Good: Parallel execution
const [user, posts] = await Promise.all([getUser(id), getPosts(id)])
```

### Error Swallowing

```typescript
// ❌ Bad: Silent catch
try {
	await riskyOperation()
} catch (e) {
	// Silently ignored!
}

// ❌ Bad: Catch-and-forget
try {
	await riskyOperation()
} catch (e) {
	console.log(e)  // Logged but not handled
	// Continues as if nothing happened
}

// ✅ Good: Handle or rethrow
try {
	await riskyOperation()
} catch (e) {
	logger.error('Operation failed', { error: e })
	throw new AppError('Operation failed', { cause: e })
}
```

---

## Maintainability Patterns

### Magic Numbers/Strings

```typescript
// ❌ Bad: Magic values
if (user.role === 3) { ... }
if (retryCount > 5) { ... }
await sleep(86400000)

// ✅ Good: Named constants
const ROLE_ADMIN = 3
const MAX_RETRIES = 5
const ONE_DAY_MS = 24 * 60 * 60 * 1000

if (user.role === ROLE_ADMIN) { ... }
if (retryCount > MAX_RETRIES) { ... }
await sleep(ONE_DAY_MS)
```

### Dead Code

```typescript
// ❌ Bad: Unreachable code
function process(value: number) {
	return value * 2
	console.log('processed')  // Never executes
}

// ❌ Bad: Unused imports/variables
import { unused } from './utils'
const temp = calculate()  // Never used

// ❌ Bad: Commented-out code
// function oldImplementation() {
//   // 50 lines of dead code
// }

// ✅ Good: Delete dead code, git has history
```

### Premature Abstraction

```typescript
// ❌ Bad: Abstract factory for one use case
class UserRepositoryFactoryProvider {
	createFactory() {
		return new UserRepositoryFactory()
	}
}

// ❌ Bad: Generic helper for one call site
function processItem<T extends { id: string }>(
	item: T,
	processor: (t: T) => T,
	validator: (t: T) => boolean
): T { ... }

// Used once:
processItem(user, updateUser, validateUser)

// ✅ Good: Just write the code
const updatedUser = updateUser(user)
if (!validateUser(updatedUser)) throw new Error('Invalid')
```

### Boolean Blindness

```typescript
// ❌ Bad: What do these booleans mean?
createUser(name, email, true, false, true)

// ✅ Good: Options object
createUser({
	name,
	email,
	sendWelcomeEmail: true,
	requireEmailVerification: false,
	isAdmin: true,
})
```

### Long Parameter Lists

```typescript
// ❌ Bad: Too many parameters
function createOrder(
	userId: string,
	items: Item[],
	shippingAddress: Address,
	billingAddress: Address,
	couponCode: string | null,
	giftWrap: boolean,
	giftMessage: string | null,
	expeditedShipping: boolean
) { ... }

// ✅ Good: Parameter object
interface CreateOrderInput {
	userId: string
	items: Item[]
	shipping: {
		address: Address
		expedited: boolean
	}
	billing: {
		address: Address
	}
	couponCode?: string
	gift?: {
		wrap: boolean
		message?: string
	}
}

function createOrder(input: CreateOrderInput) { ... }
```

---

## Architecture Patterns

### Circular Dependencies

```typescript
// ❌ Bad: A imports B, B imports A
// userService.ts
import { sendEmail } from './emailService'
export function createUser() { sendEmail() }

// emailService.ts
import { getUser } from './userService'  // Circular!
export function sendEmail() { getUser() }

// ✅ Good: Extract shared dependency or use events
// userService.ts
import { eventBus } from './events'
export function createUser() {
	eventBus.emit('user.created', user)
}

// emailService.ts
import { eventBus } from './events'
eventBus.on('user.created', (user) => sendWelcomeEmail(user))
```

### God Objects

```typescript
// ❌ Bad: One class does everything
class UserManager {
	createUser() { ... }
	deleteUser() { ... }
	sendEmail() { ... }
	generateReport() { ... }
	processPayment() { ... }
	uploadAvatar() { ... }
	validateAddress() { ... }
}

// ✅ Good: Single responsibility
class UserService { createUser(), deleteUser() }
class EmailService { sendEmail() }
class ReportService { generateReport() }
class PaymentService { processPayment() }
```

### Leaky Abstractions

```typescript
// ❌ Bad: Database details leak to API layer
app.get('/users', async (c) => {
	const users = await prisma.user.findMany({
		where: { deletedAt: null },
		select: { id: true, name: true, _count: { select: { posts: true } } }
	})
	return c.json(users)
})

// ✅ Good: Repository abstracts storage
app.get('/users', async (c) => {
	const users = await userRepository.findActive()
	return c.json(users)
})
```

### Missing Error Boundaries (React)

```tsx
// ❌ Bad: One error crashes entire app
function App() {
	return (
		<div>
			<Header />
			<UserProfile />  {/* Error here crashes everything */}
			<Footer />
		</div>
	)
}

// ✅ Good: Isolate failures
function App() {
	return (
		<div>
			<Header />
			<ErrorBoundary fallback={<ProfileError />}>
				<UserProfile />
			</ErrorBoundary>
			<Footer />
		</div>
	)
}
```

---

## Testing Patterns

### Testing Implementation Details

```typescript
// ❌ Bad: Testing internal state
it('should set isLoading to true', () => {
	const { result } = renderHook(() => useData())
	act(() => result.current.fetch())
	expect(result.current.isLoading).toBe(true)  // Implementation detail
})

// ✅ Good: Testing behavior
it('should show loading indicator while fetching', () => {
	render(<DataComponent />)
	fireEvent.click(screen.getByText('Load'))
	expect(screen.getByRole('progressbar')).toBeInTheDocument()
})
```

### Flaky Tests

```typescript
// ❌ Bad: Time-dependent
it('should expire after 1 hour', async () => {
	const token = createToken()
	await sleep(3600000)  // Slow and flaky
	expect(token.isExpired()).toBe(true)
})

// ✅ Good: Control time
it('should expire after 1 hour', () => {
	vi.useFakeTimers()
	const token = createToken()
	vi.advanceTimersByTime(3600000)
	expect(token.isExpired()).toBe(true)
	vi.useRealTimers()
})
```

### Missing Edge Cases

```typescript
// ❌ Bad: Only happy path
it('should create user', async () => {
	const user = await createUser({ name: 'John', email: 'john@example.com' })
	expect(user.id).toBeDefined()
})

// ✅ Good: Test edge cases too
it('should create user with valid input', async () => { ... })
it('should reject empty name', async () => { ... })
it('should reject invalid email', async () => { ... })
it('should reject duplicate email', async () => { ... })
it('should handle database errors', async () => { ... })
```

---

## Review Checklist

### Before Approving, Check:

**Security**
- [ ] No SQL/command injection
- [ ] Auth checked before data access
- [ ] No secrets in code or logs
- [ ] Ownership verified for resource access
- [ ] User input sanitized

**Performance**
- [ ] No N+1 queries
- [ ] Queries are bounded (limit/pagination)
- [ ] No blocking operations in async code
- [ ] Caching has eviction strategy
- [ ] React components avoid unnecessary re-renders

**Correctness**
- [ ] Null/undefined handled
- [ ] Error cases handled (not swallowed)
- [ ] Async operations properly awaited
- [ ] Edge cases covered
- [ ] No off-by-one errors

**Maintainability**
- [ ] No magic numbers/strings
- [ ] No dead code
- [ ] Functions/classes have single responsibility
- [ ] No circular dependencies
- [ ] Clear naming

**Testing**
- [ ] Tests cover happy path and edge cases
- [ ] Tests aren't flaky
- [ ] Tests verify behavior, not implementation
