# Refactor Patterns Reference

Comprehensive guide to code smells, refactoring techniques, and safe transformation patterns.

---

## Code Smells

Code smells are symptoms of deeper problems. They don't break the code, but indicate design issues.

### Function-Level Smells

| Smell | Symptom | Refactoring |
|-------|---------|-------------|
| **Long Function** | > 20-30 lines | Extract Function |
| **Long Parameter List** | > 3-4 parameters | Introduce Parameter Object |
| **Flag Arguments** | Boolean that changes behavior | Split into two functions |
| **Dead Code** | Unreachable or unused code | Delete it |
| **Duplicated Code** | Same logic in multiple places | Extract Function |
| **Feature Envy** | Function uses another object's data more than its own | Move Function |

### Class/Module-Level Smells

| Smell | Symptom | Refactoring |
|-------|---------|-------------|
| **Large Class** | Too many responsibilities | Extract Class |
| **Data Clump** | Same data groups appear together | Introduce Parameter Object |
| **Primitive Obsession** | Using primitives instead of small objects | Replace Primitive with Object |
| **Divergent Change** | One class changed for different reasons | Split by responsibility |
| **Shotgun Surgery** | One change requires many small edits | Move related code together |
| **Parallel Inheritance** | Adding subclass requires adding another | Merge hierarchies |

### Coupling Smells

| Smell | Symptom | Refactoring |
|-------|---------|-------------|
| **Inappropriate Intimacy** | Classes know too much about each other | Move/Extract, hide internals |
| **Message Chains** | `a.getB().getC().getD()` | Hide Delegate |
| **Middle Man** | Class delegates everything | Remove Middle Man |
| **Speculative Generality** | Unused abstractions "for the future" | Delete them |

---

## Safe Refactoring Patterns

### Extract Function

**Before:**
```typescript
function processOrder(order: Order) {
	// Validate
	if (!order.items.length) throw new Error('Empty order')
	if (!order.customerId) throw new Error('No customer')
	if (order.items.some(i => i.qty <= 0)) throw new Error('Invalid quantity')

	// Calculate total
	const subtotal = order.items.reduce((sum, i) => sum + i.price * i.qty, 0)
	const tax = subtotal * 0.08
	const total = subtotal + tax

	// Process payment...
}
```

**After:**
```typescript
function validateOrder(order: Order): void {
	if (!order.items.length) throw new Error('Empty order')
	if (!order.customerId) throw new Error('No customer')
	if (order.items.some(i => i.qty <= 0)) throw new Error('Invalid quantity')
}

function calculateTotal(items: Item[]): number {
	const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)
	const tax = subtotal * 0.08
	return subtotal + tax
}

function processOrder(order: Order) {
	validateOrder(order)
	const total = calculateTotal(order.items)
	// Process payment...
}
```

---

### Inline Function

**When:** Function body is as clear as its name.

**Before:**
```typescript
function isAdult(age: number): boolean {
	return age >= 18
}

if (isAdult(user.age)) { ... }
```

**After:**
```typescript
if (user.age >= 18) { ... }
```

---

### Extract Variable

**When:** Expression is complex and needs a name.

**Before:**
```typescript
if (user.age >= 18 && user.hasId && !user.isBanned && user.accountAge > 30) {
	// allow access
}
```

**After:**
```typescript
const isEligible = user.age >= 18 && user.hasId && !user.isBanned && user.accountAge > 30
if (isEligible) {
	// allow access
}
```

---

### Replace Conditional with Polymorphism

**When:** Switch/if chains based on type.

**Before:**
```typescript
function getArea(shape: Shape): number {
	switch (shape.type) {
		case 'circle':
			return Math.PI * shape.radius ** 2
		case 'rectangle':
			return shape.width * shape.height
		case 'triangle':
			return 0.5 * shape.base * shape.height
	}
}
```

**After:**
```typescript
interface Shape {
	getArea(): number
}

class Circle implements Shape {
	constructor(private radius: number) {}
	getArea(): number {
		return Math.PI * this.radius ** 2
	}
}

class Rectangle implements Shape {
	constructor(private width: number, private height: number) {}
	getArea(): number {
		return this.width * this.height
	}
}
```

---

### Introduce Parameter Object

**When:** Functions take many related parameters.

**Before:**
```typescript
function createUser(
	firstName: string,
	lastName: string,
	email: string,
	age: number,
	city: string,
	country: string
) { ... }
```

**After:**
```typescript
interface CreateUserInput {
	firstName: string
	lastName: string
	email: string
	age: number
	address: {
		city: string
		country: string
	}
}

function createUser(input: CreateUserInput) { ... }
```

---

### Replace Magic Number with Constant

**Before:**
```typescript
if (password.length < 8) {
	throw new Error('Password too short')
}

const tax = subtotal * 0.08
```

**After:**
```typescript
const MIN_PASSWORD_LENGTH = 8
const TAX_RATE = 0.08

if (password.length < MIN_PASSWORD_LENGTH) {
	throw new Error('Password too short')
}

const tax = subtotal * TAX_RATE
```

---

### Split Loop

**When:** Loop does multiple unrelated things.

**Before:**
```typescript
let totalAge = 0
let names: string[] = []

for (const user of users) {
	totalAge += user.age
	names.push(user.name)
}
```

**After:**
```typescript
const totalAge = users.reduce((sum, u) => sum + u.age, 0)
const names = users.map(u => u.name)
```

---

### Replace Nested Conditional with Guard Clauses

**Before:**
```typescript
function getPayment(employee: Employee): number {
	let result: number
	if (employee.isSeparated) {
		result = calculateSeparatedPay(employee)
	} else {
		if (employee.isRetired) {
			result = calculateRetiredPay(employee)
		} else {
			result = calculateNormalPay(employee)
		}
	}
	return result
}
```

**After:**
```typescript
function getPayment(employee: Employee): number {
	if (employee.isSeparated) return calculateSeparatedPay(employee)
	if (employee.isRetired) return calculateRetiredPay(employee)
	return calculateNormalPay(employee)
}
```

---

## React-Specific Patterns

### Extract Component

**Before:**
```tsx
function Dashboard({ user, posts, comments }: Props) {
	return (
		<div>
			<div className="header">
				<img src={user.avatar} />
				<h1>{user.name}</h1>
				<p>{user.bio}</p>
			</div>
			<div className="posts">
				{posts.map(post => (
					<div key={post.id}>
						<h2>{post.title}</h2>
						<p>{post.content}</p>
					</div>
				))}
			</div>
		</div>
	)
}
```

**After:**
```tsx
function UserHeader({ user }: { user: User }) {
	return (
		<div className="header">
			<img src={user.avatar} />
			<h1>{user.name}</h1>
			<p>{user.bio}</p>
		</div>
	)
}

function PostCard({ post }: { post: Post }) {
	return (
		<div>
			<h2>{post.title}</h2>
			<p>{post.content}</p>
		</div>
	)
}

function Dashboard({ user, posts }: Props) {
	return (
		<div>
			<UserHeader user={user} />
			<div className="posts">
				{posts.map(post => <PostCard key={post.id} post={post} />)}
			</div>
		</div>
	)
}
```

---

### Extract Custom Hook

**Before:**
```tsx
function UserProfile({ userId }: Props) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		setLoading(true)
		fetchUser(userId)
			.then(setUser)
			.catch(setError)
			.finally(() => setLoading(false))
	}, [userId])

	if (loading) return <Spinner />
	if (error) return <Error message={error.message} />
	if (!user) return null

	return <Profile user={user} />
}
```

**After:**
```tsx
function useUser(userId: string) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		setLoading(true)
		fetchUser(userId)
			.then(setUser)
			.catch(setError)
			.finally(() => setLoading(false))
	}, [userId])

	return { user, loading, error }
}

function UserProfile({ userId }: Props) {
	const { user, loading, error } = useUser(userId)

	if (loading) return <Spinner />
	if (error) return <Error message={error.message} />
	if (!user) return null

	return <Profile user={user} />
}
```

---

### Lift State Up

**When:** Multiple components need the same state.

**Before:**
```tsx
function SearchInput() {
	const [query, setQuery] = useState('')
	return <input value={query} onChange={e => setQuery(e.target.value)} />
}

function SearchResults() {
	// Can't access query!
}
```

**After:**
```tsx
function SearchPage() {
	const [query, setQuery] = useState('')

	return (
		<>
			<SearchInput query={query} onChange={setQuery} />
			<SearchResults query={query} />
		</>
	)
}
```

---

## Composing Refactorings

Complex refactorings are composed of smaller ones.

### Rename + Move

1. Rename the symbol in place
2. Run tests
3. Move to new location
4. Run tests
5. Update imports

### Extract + Move

1. Extract function in current file
2. Run tests
3. Move function to new file
4. Run tests
5. Update imports

### Replace Algorithm

1. Write new implementation alongside old
2. Write tests comparing outputs
3. Switch callers to new implementation
4. Run tests
5. Delete old implementation

---

## Refactoring Safety Checklist

Before refactoring:
- [ ] Tests exist and pass
- [ ] Code is committed
- [ ] You understand what the code does

During refactoring:
- [ ] Making small, incremental changes
- [ ] Running tests after each change
- [ ] Not changing behavior

After refactoring:
- [ ] All tests pass
- [ ] Code is cleaner
- [ ] No functionality changed
- [ ] Committed with descriptive message

---

## When NOT to Refactor

- **No tests exist** - Write tests first
- **Deadline is tomorrow** - Ship, then refactor
- **You don't understand the code** - Understand first
- **The code works and won't change** - Leave it alone
- **You're adding features at the same time** - Separate the work

---

## Red Flags During Refactoring

Stop and reconsider if:

1. **Tests start failing** - You changed behavior
2. **You're adding features** - That's not refactoring
3. **Changes are getting large** - Break into smaller steps
4. **You can't explain what you're doing** - Step back and plan
5. **You're "improving" code that works** - Only refactor when needed

---

## Refactoring vs. Rewriting

| Refactoring | Rewriting |
|-------------|-----------|
| Small, incremental changes | Big bang replacement |
| Tests pass throughout | Tests break until done |
| Low risk | High risk |
| Continuous improvement | One-time effort |
| Preserves behavior | May change behavior |

**Default to refactoring.** Rewrite only when:
- Code is truly unmaintainable
- Architecture is fundamentally wrong
- You have comprehensive tests to verify the rewrite
