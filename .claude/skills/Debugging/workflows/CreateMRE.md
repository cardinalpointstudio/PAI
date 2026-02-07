# CreateMRE Workflow

Create a Minimum Reproducible Example to isolate a bug.

## When to Use

- Bug only happens in certain conditions
- Bug is hard to reproduce
- Need to report a bug to library maintainers
- Want to isolate problem from surrounding code

---

## What is an MRE?

A **Minimum Reproducible Example** is the smallest possible code that demonstrates the bug.

### Properties of a Good MRE

1. **Minimal** - Remove everything not needed to show the bug
2. **Complete** - Contains everything needed to reproduce
3. **Reproducible** - Anyone can run it and see the bug
4. **Verifiable** - Clearly shows expected vs actual behavior

---

## Step 1: Start with the Bug

Document what you're trying to reproduce:

```markdown
## Bug Description
- **Expected**: Form submits and shows success message
- **Actual**: Form submits but page goes blank
- **Conditions**: Only happens with email containing "+"
```

---

## Step 2: Create Minimal Environment

Start fresh to avoid hidden dependencies:

```bash
# Create isolated test directory
mkdir bug-repro && cd bug-repro

# Minimal setup
bun init -y
```

---

## Step 3: Copy Relevant Code

Extract only the code involved in the bug:

### For Frontend Bugs

```typescript
// bug-repro/index.tsx
import { useState } from 'react'

// Minimal component that shows the bug
function BuggyForm() {
	const [email, setEmail] = useState('')

	const handleSubmit = () => {
		// This is where the bug happens
		const encoded = encodeURIComponent(email)
		fetch(`/api/check?email=${encoded}`)
	}

	return (
		<form onSubmit={handleSubmit}>
			<input value={email} onChange={e => setEmail(e.target.value)} />
			<button type="submit">Submit</button>
		</form>
	)
}
```

### For Backend Bugs

```typescript
// bug-repro/server.ts
import { Hono } from 'hono'

const app = new Hono()

// Minimal route that shows the bug
app.get('/api/check', (c) => {
	const email = c.req.query('email')
	// Bug: Plus signs aren't decoded correctly
	console.log('Received:', email)  // "test example.com" not "test+example.com"
	return c.json({ email })
})

export default app
```

---

## Step 4: Remove Non-Essential Code

Systematically remove code until bug disappears:

1. Remove unrelated imports
2. Remove unrelated state
3. Remove unrelated UI elements
4. Remove unrelated logic
5. Hardcode values instead of fetching

### Keep Removing Until

- Bug still happens → keep removing
- Bug disappears → last removal was essential, add it back

---

## Step 5: Isolate the Trigger

Find the exact input/condition that triggers the bug:

```typescript
// Test different inputs
const testCases = [
	'user@example.com',       // Works
	'user+tag@example.com',   // FAILS ← Bug trigger!
	'user%2Btag@example.com', // Works (pre-encoded)
]

for (const email of testCases) {
	console.log(`Testing: ${email}`)
	const result = processEmail(email)
	console.log(`Result: ${result}`)
}
```

---

## Step 6: Add Clear Markers

Make expected vs actual obvious:

```typescript
function demonstrateBug() {
	const input = 'user+tag@example.com'
	const result = encodeForURL(input)

	console.log('Input:', input)
	console.log('Expected:', 'user%2Btag%40example.com')
	console.log('Actual:', result)
	console.log('Bug:', result !== 'user%2Btag%40example.com' ? 'YES' : 'no')
}
```

---

## Step 7: Document the MRE

Create a complete, runnable example:

```markdown
# Bug: Plus signs lost in form submission

## Environment
- Bun 1.0.0
- Hono 4.0.0
- macOS 14.0

## Steps to Reproduce

1. Clone this repo
2. Run `bun install`
3. Run `bun run server.ts`
4. Open http://localhost:3000
5. Enter email: `test+tag@example.com`
6. Click Submit
7. Check server logs

## Expected
Server receives: `test+tag@example.com`

## Actual
Server receives: `test tag@example.com` (plus sign becomes space)

## Minimal Code

\`\`\`typescript
// The bug is in this line:
const url = `/api?email=${email}`  // Should use encodeURIComponent

// Fix:
const url = `/api?email=${encodeURIComponent(email)}`
\`\`\`
```

---

## Step 8: Verify MRE

Test that your MRE actually reproduces the bug:

```bash
# Fresh clone
git clone /tmp/mre-test
cd mre-test
bun install
bun run start

# Does the bug appear? If not, something is missing.
```

---

## MRE Templates

### Node/Bun Script MRE

```typescript
#!/usr/bin/env bun

// Bug: [description]
// Expected: [what should happen]
// Actual: [what actually happens]

function buggyFunction(input: string) {
	// Minimal code that shows the bug
	return input.split('+').join(' ')  // Bug!
}

// Demonstration
const input = 'a+b+c'
const expected = 'a+b+c'
const actual = buggyFunction(input)

console.log('Input:', input)
console.log('Expected:', expected)
console.log('Actual:', actual)
console.log('Bug present:', actual !== expected)
```

### React Component MRE

```tsx
// CodeSandbox-ready MRE
import { useState } from 'react'

export default function App() {
	const [value, setValue] = useState('')

	// Bug: [description]
	const buggyTransform = (v: string) => {
		return v.toUpperCase()  // Missing null check!
	}

	return (
		<div>
			<input
				value={value}
				onChange={(e) => setValue(e.target.value)}
			/>
			<p>Transformed: {buggyTransform(value)}</p>
		</div>
	)
}
```

---

## Output

Provide:
1. Self-contained code that reproduces the bug
2. Clear steps to run it
3. Expected vs actual behavior
4. Identified root cause (if found)
5. Link to sandbox if applicable (CodeSandbox, StackBlitz)
