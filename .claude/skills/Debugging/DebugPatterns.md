# Debug Patterns Reference

Common bug patterns and their solutions.

---

## Null/Undefined Errors

### Pattern: Missing Null Check

```typescript
// Bug
const name = user.profile.name
// TypeError: Cannot read properties of undefined

// Fix: Optional chaining
const name = user?.profile?.name

// Fix: With default
const name = user?.profile?.name ?? 'Anonymous'

// Fix: Early return
if (!user?.profile) return null
const name = user.profile.name
```

### Pattern: Async Data Not Ready

```typescript
// Bug
function UserProfile({ userId }) {
	const { data } = useFetch(`/api/users/${userId}`)
	return <h1>{data.name}</h1>  // data is undefined initially!
}

// Fix: Loading state
function UserProfile({ userId }) {
	const { data, isLoading } = useFetch(`/api/users/${userId}`)
	if (isLoading) return <Skeleton />
	if (!data) return <NotFound />
	return <h1>{data.name}</h1>
}
```

---

## Async/Promise Errors

### Pattern: Missing Await

```typescript
// Bug
async function saveUser(user) {
	const result = db.users.insert(user)  // Missing await!
	console.log('Saved:', result)  // Logs Promise, not result
	return result
}

// Fix
async function saveUser(user) {
	const result = await db.users.insert(user)
	console.log('Saved:', result)
	return result
}
```

### Pattern: Unhandled Promise Rejection

```typescript
// Bug
function loadData() {
	fetch('/api/data')
		.then(res => res.json())
		.then(data => setData(data))
	// No .catch() - errors silently swallowed!
}

// Fix
async function loadData() {
	try {
		const res = await fetch('/api/data')
		if (!res.ok) throw new Error(`HTTP ${res.status}`)
		const data = await res.json()
		setData(data)
	} catch (err) {
		setError(err.message)
	}
}
```

### Pattern: Race Condition

```typescript
// Bug: Results arrive out of order
function Search({ query }) {
	const [results, setResults] = useState([])

	useEffect(() => {
		fetch(`/api/search?q=${query}`)
			.then(res => res.json())
			.then(data => setResults(data))  // Might be stale!
	}, [query])
}

// Fix: Cancel previous request
function Search({ query }) {
	const [results, setResults] = useState([])

	useEffect(() => {
		const controller = new AbortController()

		fetch(`/api/search?q=${query}`, { signal: controller.signal })
			.then(res => res.json())
			.then(data => setResults(data))
			.catch(err => {
				if (err.name !== 'AbortError') throw err
			})

		return () => controller.abort()
	}, [query])
}
```

---

## State Management Errors

### Pattern: Stale Closure

```typescript
// Bug
function Counter() {
	const [count, setCount] = useState(0)

	useEffect(() => {
		const interval = setInterval(() => {
			setCount(count + 1)  // count is always 0 (stale closure)
		}, 1000)
		return () => clearInterval(interval)
	}, [])  // Empty deps = stale closure
}

// Fix: Use functional update
function Counter() {
	const [count, setCount] = useState(0)

	useEffect(() => {
		const interval = setInterval(() => {
			setCount(c => c + 1)  // Uses current value
		}, 1000)
		return () => clearInterval(interval)
	}, [])
}
```

### Pattern: Direct State Mutation

```typescript
// Bug
function addItem(item) {
	items.push(item)  // Mutating state directly!
	setItems(items)   // React doesn't see change
}

// Fix: Create new array
function addItem(item) {
	setItems([...items, item])
}

// Fix for objects
function updateUser(field, value) {
	setUser({ ...user, [field]: value })
}
```

---

## Type Errors

### Pattern: Wrong Type Assumption

```typescript
// Bug
function double(n) {
	return n * 2
}
double('5')  // Returns NaN or '55' depending on operation

// Fix: Type validation
function double(n: number): number {
	if (typeof n !== 'number') {
		throw new TypeError('Expected number')
	}
	return n * 2
}

// Fix: Type coercion
function double(n: string | number): number {
	return Number(n) * 2
}
```

### Pattern: Array vs Single Item

```typescript
// Bug
function processUsers(users) {
	return users.map(u => u.name)  // Fails if users is single object
}

// Fix: Normalize input
function processUsers(users) {
	const arr = Array.isArray(users) ? users : [users]
	return arr.map(u => u.name)
}
```

---

## Import/Export Errors

### Pattern: Default vs Named Export

```typescript
// utils.ts exports
export function helper() {}        // Named export
export default function main() {}  // Default export

// Bug: Wrong import style
import { main } from './utils'     // Fails! main is default
import helper from './utils'        // Fails! helper is named

// Fix: Match export style
import main, { helper } from './utils'
```

### Pattern: Circular Import

```typescript
// a.ts
import { b } from './b'
export const a = 'a'

// b.ts
import { a } from './a'  // a is undefined during b's initialization!
export const b = 'b'

// Fix: Restructure to avoid cycle
// Or: Use dynamic import
// Or: Move shared code to third file
```

---

## Network Errors

### Pattern: CORS Error

```
Access to fetch at 'http://api.example.com' from origin
'http://localhost:3000' has been blocked by CORS policy
```

```typescript
// Server fix: Add CORS headers
app.use(cors({
	origin: 'http://localhost:3000',
	credentials: true,
}))

// Or proxy through your backend
// frontend → your-backend → external-api
```

### Pattern: Wrong Content-Type

```typescript
// Bug: Server expects JSON but gets form data
fetch('/api/users', {
	method: 'POST',
	body: JSON.stringify(data),
	// Missing Content-Type header!
})

// Fix
fetch('/api/users', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify(data),
})
```

---

## Environment Errors

### Pattern: Missing Environment Variable

```typescript
// Bug
const apiKey = process.env.API_KEY
fetch(`https://api.example.com?key=${apiKey}`)  // key=undefined

// Fix: Validate at startup
const apiKey = process.env.API_KEY
if (!apiKey) {
	throw new Error('API_KEY environment variable required')
}

// Fix: With default
const apiKey = process.env.API_KEY ?? 'development-key'
```

### Pattern: Dev vs Prod Differences

```typescript
// Bug: Works in dev, fails in prod
const API_URL = 'http://localhost:3000/api'  // Hardcoded!

// Fix: Environment-based config
const API_URL = process.env.NEXT_PUBLIC_API_URL
	?? 'http://localhost:3000/api'
```

---

## Build/Bundle Errors

### Pattern: Import Not Found After Build

```typescript
// Bug: Works in dev, fails after build
import data from './data.json'  // JSON not included in bundle

// Fix: Configure bundler to include JSON
// vite.config.ts
export default {
	assetsInclude: ['**/*.json'],
}

// Or: Fetch at runtime
const data = await fetch('/data.json').then(r => r.json())
```

### Pattern: Tree Shaking Removes Code

```typescript
// Bug: Function exists but not in production bundle
export function debugHelper() {  // Removed by tree shaking!
	console.log('debug')
}

// If needed in prod, ensure it's actually used
// Or mark as side effect in package.json
```

---

## Debugging Commands

### Quick Diagnostics

```bash
# Check what's using a port
lsof -i :3000

# Watch file changes
fswatch -r src/

# Check environment
printenv | grep -i api

# Check node/bun version
node --version && bun --version

# Clear all caches
rm -rf node_modules/.cache .next dist .vite
bun install
```

### Git Debugging

```bash
# Find when bug was introduced
git bisect start
git bisect bad HEAD
git bisect good v1.0.0
# Test each commit, mark as good/bad

# Find who changed a line
git blame path/to/file.ts

# Search commit messages
git log --grep="login"

# Search code changes
git log -p -S "functionName"
```
