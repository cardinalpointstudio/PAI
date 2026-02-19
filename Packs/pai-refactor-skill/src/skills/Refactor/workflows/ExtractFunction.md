# ExtractFunction Workflow

Extract a piece of code into a separate, reusable function.

## When to Use

- Function is too long (> 20-30 lines)
- Code block does one distinct thing
- Same logic appears in multiple places
- Code needs a descriptive name to clarify intent

---

## Step 1: Verify Tests Pass

Before any refactoring:

```bash
bun run test
```

If tests fail, fix them first. Never refactor broken code.

---

## Step 2: Identify Code to Extract

Look for code that:

1. **Does one thing** - Has a single purpose
2. **Has clear inputs** - Variables it reads
3. **Has clear outputs** - Values it produces or modifies
4. **Is self-contained** - Doesn't rely on complex surrounding context

### Example: Before

```typescript
async function processOrder(order: Order) {
	// Validate order - EXTRACT THIS
	if (!order.items || order.items.length === 0) {
		throw new Error('Order must have items')
	}
	if (!order.customerId) {
		throw new Error('Order must have customer')
	}
	if (order.items.some(item => item.quantity <= 0)) {
		throw new Error('Item quantities must be positive')
	}
	// End validation

	// Process payment...
	// Send confirmation...
}
```

---

## Step 3: Determine Function Signature

Identify:

1. **Parameters** - What data does it need?
2. **Return type** - What does it produce?
3. **Side effects** - Does it modify anything?

```typescript
// Inputs: order (Order)
// Output: void (throws on invalid)
// Side effects: none

function validateOrder(order: Order): void {
	// ...
}
```

---

## Step 4: Extract the Code

### Create the New Function

```typescript
function validateOrder(order: Order): void {
	if (!order.items || order.items.length === 0) {
		throw new Error('Order must have items')
	}
	if (!order.customerId) {
		throw new Error('Order must have customer')
	}
	if (order.items.some(item => item.quantity <= 0)) {
		throw new Error('Item quantities must be positive')
	}
}
```

### Replace Original Code with Call

```typescript
async function processOrder(order: Order) {
	validateOrder(order)  // ← Replaced block with call

	// Process payment...
	// Send confirmation...
}
```

---

## Step 5: Run Tests

```bash
bun run test
```

- **Tests pass** → Continue
- **Tests fail** → Undo and check your extraction

---

## Step 6: Consider Placement

Where should the new function live?

| Scenario | Placement |
|----------|-----------|
| Only used in this file | Same file, above the caller |
| Used by multiple files in module | Separate file in same directory |
| Used across the codebase | `lib/` or `utils/` directory |

If moving to another file:

```typescript
// utils/validation.ts
export function validateOrder(order: Order): void { ... }

// orders/processOrder.ts
import { validateOrder } from '../utils/validation'
```

---

## Step 7: Run Tests Again

```bash
bun run test
```

---

## Step 8: Commit

```bash
git add -A
git commit -m "refactor: Extract validateOrder function"
```

---

## Extraction Patterns

### Extract Pure Function

No side effects, just transforms data:

```typescript
// Before
const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
const tax = total * 0.08
const grandTotal = total + tax

// After
function calculateOrderTotal(items: Item[]): number {
	const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
	const tax = subtotal * 0.08
	return subtotal + tax
}

const grandTotal = calculateOrderTotal(items)
```

### Extract with Multiple Returns

When extracted code produces multiple values:

```typescript
// Before
const firstName = name.split(' ')[0]
const lastName = name.split(' ').slice(1).join(' ')

// After
function parseName(fullName: string): { firstName: string; lastName: string } {
	const parts = fullName.split(' ')
	return {
		firstName: parts[0],
		lastName: parts.slice(1).join(' '),
	}
}

const { firstName, lastName } = parseName(name)
```

### Extract React Component

```tsx
// Before: Long component with inline JSX
function UserDashboard({ user }: Props) {
	return (
		<div>
			<div className="header">
				<img src={user.avatar} alt={user.name} />
				<h1>{user.name}</h1>
				<p>{user.email}</p>
			</div>
			{/* More JSX... */}
		</div>
	)
}

// After: Extract header component
function UserHeader({ user }: { user: User }) {
	return (
		<div className="header">
			<img src={user.avatar} alt={user.name} />
			<h1>{user.name}</h1>
			<p>{user.email}</p>
		</div>
	)
}

function UserDashboard({ user }: Props) {
	return (
		<div>
			<UserHeader user={user} />
			{/* More JSX... */}
		</div>
	)
}
```

### Extract Custom Hook

```tsx
// Before: Logic mixed in component
function UserProfile({ userId }: Props) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		fetchUser(userId)
			.then(setUser)
			.catch(setError)
			.finally(() => setLoading(false))
	}, [userId])

	// ... render
}

// After: Extract hook
function useUser(userId: string) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		fetchUser(userId)
			.then(setUser)
			.catch(setError)
			.finally(() => setLoading(false))
	}, [userId])

	return { user, loading, error }
}

function UserProfile({ userId }: Props) {
	const { user, loading, error } = useUser(userId)
	// ... render
}
```

---

## Output Checklist

- [ ] New function has clear, descriptive name
- [ ] Function does one thing
- [ ] Parameters are minimal and clear
- [ ] Return type is explicit
- [ ] Original code replaced with function call
- [ ] Tests pass
- [ ] Committed with descriptive message
