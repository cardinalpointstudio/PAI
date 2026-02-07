# AnalyzeError Workflow

Analyze error messages and stack traces to quickly identify the problem.

## When to Use

- User provides an error message or stack trace
- Application crashes or throws an exception
- Need to understand what went wrong from error output

---

## Step 1: Read the Error Message

The error message usually tells you exactly what's wrong.

### Parse the Error

```
TypeError: Cannot read properties of undefined (reading 'map')
^^^^^^^^   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
Type       Message (what happened)
```

### Common Error Types

| Type | Meaning |
|------|---------|
| **TypeError** | Wrong type (null, undefined, wrong object) |
| **ReferenceError** | Variable doesn't exist |
| **SyntaxError** | Invalid code syntax |
| **RangeError** | Value out of valid range |
| **NetworkError** | HTTP/fetch failure |
| **ValidationError** | Input validation failed |

---

## Step 2: Read the Stack Trace

Stack traces show the call path that led to the error.

### Anatomy of a Stack Trace

```
TypeError: Cannot read properties of undefined (reading 'map')
    at UserList (/app/src/components/UserList.tsx:15:23)      ← Error location
    at renderWithHooks (/app/node_modules/react-dom/...)      ← Framework code
    at mountIndeterminateComponent (...)                       ← (ignore these)
    at beginWork (...)
    at performUnitOfWork (...)
```

### Reading Strategy

1. **Find your code** - Skip framework/library lines
2. **Start at the top** - First line of your code is where it happened
3. **Note file and line** - `UserList.tsx:15` means line 15
4. **Read downward** - Shows how you got there

---

## Step 3: Go to the Error Location

Open the file at the exact line:

```bash
# Format: file:line:column
# UserList.tsx:15:23 means line 15, column 23
```

### Look at the Code

```typescript
// Line 15 in UserList.tsx
const userNames = users.map(u => u.name)
//                ^^^^^
//                users is undefined!
```

### Check What's Undefined

Work backwards:
- Where does `users` come from?
- What conditions make it undefined?
- Is there a missing null check?

---

## Step 4: Identify the Pattern

### Common Error Patterns

**"Cannot read properties of undefined"**
```typescript
// Problem
const name = user.profile.name  // user or profile is undefined

// Fix: Optional chaining
const name = user?.profile?.name ?? 'Unknown'
```

**"X is not a function"**
```typescript
// Problem
import { helper } from './utils'
helper()  // helper is not exported as a function

// Check: Is it exported correctly?
// Check: Is the import path correct?
// Check: Is there a naming mismatch?
```

**"Cannot find module"**
```typescript
// Problem
import { Thing } from './Thing'  // File doesn't exist

// Check: File path spelling
// Check: File extension (.ts vs .tsx)
// Check: Index file in directory
```

**"Unexpected token"**
```typescript
// Problem: Usually JSON parse failure
const data = JSON.parse(response)  // response isn't valid JSON

// Check: What is the actual response?
console.log('Raw response:', response)
```

---

## Step 5: Check the Context

### Look at Surrounding Code

- What's the function supposed to do?
- What are the inputs?
- What state exists at this point?

### Check Call Sites

Where is this function called from?

```typescript
// Error is in processUser()
// But the bug might be in the caller
const user = await fetchUser(id)  // ← Returns undefined?
processUser(user)                  // ← Passes undefined
```

### Check Recent Changes

```bash
git log -5 --oneline -- path/to/file.ts
git diff HEAD~1 -- path/to/file.ts
```

---

## Step 6: Propose a Fix

### Defensive Fix (Quick)

Add null checks where the error occurred:

```typescript
// Before
const userNames = users.map(u => u.name)

// After (defensive)
const userNames = (users ?? []).map(u => u.name)
```

### Root Cause Fix (Better)

Fix why it was undefined in the first place:

```typescript
// Before: No loading state
const { users } = useUsers()
return <UserList users={users} />

// After: Handle loading state
const { users, isLoading } = useUsers()
if (isLoading) return <Loading />
return <UserList users={users} />
```

---

## Step 7: Verify

1. Add a test that reproduces the error
2. Apply the fix
3. Confirm test passes
4. Confirm no regressions

---

## Quick Reference: Error Messages

| Error | Likely Cause | Quick Fix |
|-------|--------------|-----------|
| `undefined is not an object` | Accessing property of undefined | Add null check `?.` |
| `X is not a function` | Wrong import, typo, not a function | Check import/export |
| `Cannot find module 'X'` | Wrong path, missing dependency | Check path, run install |
| `Unexpected token '<'` | Got HTML instead of JSON | Check API URL, auth |
| `CORS error` | Cross-origin blocked | Configure CORS on server |
| `ECONNREFUSED` | Server not running | Start the server |
| `ENOENT` | File not found | Check file path exists |
| `ETIMEDOUT` | Request too slow | Check network, increase timeout |

---

## Output

Provide:
1. What the error means
2. Where it occurred (file:line)
3. Why it happened (root cause)
4. How to fix it (code snippet)
5. How to prevent it (defensive coding tip)
