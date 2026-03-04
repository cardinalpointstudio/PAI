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

// ❌ Bad: TOCTOU - Ownership in SELECT but not in DELETE
app.delete('/presets/:id', async (c) => {
	const preset = await db.select().from(presets).where(eq(presets.id, id))
	if (preset.academyId !== userAcademyId) {
		return c.json({ error: 'Forbidden' }, 403)
	}
	// Race condition: another request could change ownership between SELECT and DELETE
	await db.delete(presets).where(eq(presets.id, id))  // No ownership check!
})

// ✅ Good: Ownership in the mutation WHERE clause itself
app.delete('/presets/:id', async (c) => {
	const result = await db.delete(presets).where(
		and(
			eq(presets.id, id),
			eq(presets.academyId, userAcademyId)  // Atomic ownership check
		)
	).returning()

	if (result.length === 0) {
		return c.json({ error: 'Not found or forbidden' }, 404)
	}
	return c.json({ success: true })
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

### CSS Color Injection Prevention

```typescript
// ❌ Bad: Regex-only validation can be bypassed
const isValidColor = (v: string) => /^#?[a-f0-9]{3,6}$/i.test(v)

// ❌ Bad: Trusting any string as color
<div style={{ backgroundColor: userColor }} />

// ✅ Good: Whitelist of safe color values
const SAFE_COLORS = new Set(['red', 'blue', 'green', /* ... */])

function isValidColor(value: string): boolean {
  const lowered = value.toLowerCase()
  // Strict hex format only (#RGB or #RRGGBB)
  if (/^#[0-9a-f]{3}$/.test(lowered) || /^#[0-9a-f]{6}$/.test(lowered)) {
    return true
  }
  return SAFE_COLORS.has(lowered)  // Whitelist approach
}
```

### localStorage Data Injection

```typescript
// ❌ Bad: Trusting localStorage data without validation
function loadSettings(): Settings {
	const stored = localStorage.getItem('settings')
	if (stored) {
		return JSON.parse(stored)  // Could be any shape!
	}
	return defaultSettings
}

// ❌ Bad: Only type assertion (no runtime check)
function loadSettings(): Settings {
	const stored = localStorage.getItem('settings')
	return stored ? JSON.parse(stored) as Settings : defaultSettings
}

// ✅ Good: Validate with Zod schema
import { z } from 'zod'

const settingsSchema = z.object({
	theme: z.enum(['light', 'dark']),
	language: z.string(),
	notifications: z.boolean(),
})

function loadSettings(): Settings {
	try {
		const stored = localStorage.getItem('settings')
		if (stored) {
			const parsed = JSON.parse(stored)
			const result = settingsSchema.partial().safeParse(parsed)
			if (result.success) {
				return { ...defaultSettings, ...result.data }
			}
			// Clear corrupted data
			localStorage.removeItem('settings')
		}
	} catch {
		localStorage.removeItem('settings')
	}
	return defaultSettings
}
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

### Context Value Not Memoized

```tsx
// ❌ Bad: New object on every render causes all consumers to re-render
function SettingsProvider({ children }) {
	const [settings, setSettings] = useState(defaultSettings)

	// This object is recreated every render!
	return (
		<SettingsContext.Provider value={{
			...settings,
			setTheme: (t) => setSettings(s => ({...s, theme: t})),
			toggleTheme: () => setSettings(s => ({...s, theme: s.theme === 'light' ? 'dark' : 'light'})),
		}}>
			{children}
		</SettingsContext.Provider>
	)
}

// ✅ Good: Memoize context value and callbacks
function SettingsProvider({ children }) {
	const [settings, setSettings] = useState(defaultSettings)

	const setTheme = useCallback((theme) => {
		setSettings(s => ({...s, theme}))
	}, [])

	const toggleTheme = useCallback(() => {
		setSettings(s => ({...s, theme: s.theme === 'light' ? 'dark' : 'light'}))
	}, [])

	const contextValue = useMemo(() => ({
		...settings,
		setTheme,
		toggleTheme,
	}), [settings, setTheme, toggleTheme])

	return (
		<SettingsContext.Provider value={contextValue}>
			{children}
		</SettingsContext.Provider>
	)
}
```

### useEffect Interval Memory Leaks

```tsx
// ❌ Bad: Missing dependency - interval not cleared when showSeconds changes
useEffect(() => {
	const interval = setInterval(() => setTime(new Date()), 1000)
	return () => clearInterval(interval)
}, [])  // showSeconds not in deps - memory leak!

// ❌ Bad: No cleanup function at all
useEffect(() => {
	setInterval(() => setTime(new Date()), 1000)  // Never cleared!
}, [showSeconds])

// ✅ Good: Proper deps AND cleanup
useEffect(() => {
	const ms = showSeconds ? 1000 : 60000
	const interval = setInterval(() => setTime(new Date()), ms)
	return () => clearInterval(interval)  // Cleanup when deps change or unmount
}, [showSeconds])
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

### Null Coalescing vs Type Assertion Precedence

```typescript
// ❌ Bad: Type assertion has higher precedence than ??
const config = widget_config as ConfigType ?? {}
// Evaluates as: (widget_config as ConfigType) ?? {}
// If widget_config is null, you get null typed as ConfigType, not {}

// ✅ Good: Parentheses ensure correct order
const config = (widget_config ?? {}) as ConfigType
// Evaluates as: (widget_config ?? {}) as ConfigType
// If widget_config is null, you get {} typed as ConfigType
```

### Database Result Array Access

```typescript
// ❌ Bad: Assuming array has elements
const results = await db.update(table).set(data).returning()
const updated = results[0]!  // Non-null assertion hides failures

// ❌ Bad: Destructuring assumes success
const [created] = await db.insert(table).values(data).returning()

// ✅ Good: Check length before access
const results = await db.update(table).set(data).returning()
if (results.length === 0) {
	throw new Error(`Failed to update ${resourceId}`)
}
const updated = results[0]
```

### Type Guard in Filter-Map Chains

```typescript
// ❌ Bad: Unsafe cast after filter
const valid = items
  .filter((p) => p.isValid && p.validatedData)
  .map((p) => p.validatedData as ValidatedType)  // Cast hides undefined!

// ✅ Good: Type predicate in filter narrows type for map
const valid = items
  .filter(
    (p): p is Item & { validatedData: ValidatedType } =>
      p.isValid && p.validatedData !== undefined
  )
  .map((p) => p.validatedData)  // TypeScript knows it's defined
```

### Array.isArray() for JSON Parsing

```typescript
// ❌ Bad: Truthy non-arrays like {} or "string" pass || check
const segments = (plan.segments || []).map(...)  // {} is truthy!

// ✅ Good: Explicitly verify array type
const segments = (Array.isArray(plan.segments) ? plan.segments : []).map(...)
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

### React useEffect Async Race Conditions

```typescript
// ❌ Bad: State guard set AFTER async call
const hasLoaded = useRef(false)
useEffect(() => {
	const load = async () => {
		const data = await fetchAPI()  // Effect runs twice in StrictMode!
		hasLoaded.current = true       // Too late, both calls already started
		setState(data)
	}
	if (!hasLoaded.current) load()
}, [deps])

// ✅ Good: Dual guard pattern - before AND after async
useEffect(() => {
	let isCancelled = false
	const loadedKey = useRef<string | null>(null)

	const load = async () => {
		const key = `${dep1}-${dep2}`
		if (loadedKey.current === key) return  // Guard BEFORE async
		loadedKey.current = key

		const data = await fetchAPI()

		if (isCancelled) return  // Guard AFTER async
		setState(data)
	}

	load()
	return () => { isCancelled = true }
}, [dep1, dep2])
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

### Next.js Hydration Mismatch (Theme/Dark Mode)

```tsx
// ❌ Bad: Theme class applied client-side causes hydration mismatch
// Server renders: <html>
// Client hydrates with: <html class="dark"> (from localStorage)
// Result: Hydration error!

function RootLayout({ children }) {
	return (
		<html lang="en">  {/* No suppressHydrationWarning */}
			<body>{children}</body>
		</html>
	)
}

// In SettingsProvider:
useEffect(() => {
	document.documentElement.classList.add('dark')  // Causes mismatch!
}, [])

// ✅ Good: Use suppressHydrationWarning for theme-controlled elements
function RootLayout({ children }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>{children}</body>
		</html>
	)
}

// Note: suppressHydrationWarning is SAFE for theme toggling.
// It tells React to expect client-side changes to this element's attributes.
// Only use on elements whose attributes are legitimately set client-side.
```

### Optimistic Updates Without Rollback

```typescript
// ❌ Bad: No rollback on API failure
const updateItem = async (id: string, data: Data) => {
	// Optimistic update
	setItems(prev => prev.map(i => i.id === id ? {...i, ...data} : i))

	try {
		await api.update(id, data)
	} catch (error) {
		console.error(error)  // UI now inconsistent with server!
	}
}

// ❌ Bad: Stale closure in rollback
const updateItem = async (id: string, data: Data) => {
	const previousItems = items  // Captured from closure - may be stale!
	setItems(prev => prev.map(i => i.id === id ? {...i, ...data} : i))

	try {
		await api.update(id, data)
	} catch {
		setItems(previousItems)  // Wrong state if concurrent updates
	}
}

// ✅ Good: Capture state correctly and rollback
const updateItem = async (id: string, data: Data) => {
	let previousItems: Item[] | null = null

	// Capture AND update atomically
	setItems(prev => {
		previousItems = prev  // Capture current state
		return prev.map(i => i.id === id ? {...i, ...data} : i)
	})

	try {
		await api.update(id, data)
	} catch (error) {
		if (previousItems) setItems(previousItems)  // Rollback
		throw error
	}
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
- [ ] Ownership verified for resource access (in mutation WHERE, not separate SELECT)
- [ ] User input sanitized
- [ ] localStorage data validated with schema (Zod)
- [ ] Color/CSS values use whitelist approach (not regex-only)

**Performance**
- [ ] No N+1 queries
- [ ] Queries are bounded (limit/pagination)
- [ ] No blocking operations in async code
- [ ] Caching has eviction strategy
- [ ] React components avoid unnecessary re-renders
- [ ] useEffect intervals have cleanup AND correct dependencies
- [ ] Context values memoized with useMemo + useCallback for functions

**Correctness**
- [ ] Null/undefined handled
- [ ] Error cases handled (not swallowed)
- [ ] Async operations properly awaited
- [ ] Edge cases covered
- [ ] No off-by-one errors
- [ ] Database result arrays checked before [0] access
- [ ] React useEffect has cancellation for async calls
- [ ] Type assertions don't mask null coalescing
- [ ] Optimistic updates have rollback on API failure
- [ ] Next.js: suppressHydrationWarning on theme-controlled elements
- [ ] Filter-map chains use type guards (not `as` casts)
- [ ] JSON array fields checked with Array.isArray() (not || fallback)

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
