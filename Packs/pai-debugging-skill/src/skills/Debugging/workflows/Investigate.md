# Investigate Workflow

The complete debugging process from symptom to verified fix.

## When to Use

- User reports something isn't working
- Unexpected behavior observed
- Need to find and fix a bug systematically

---

## Step 1: Gather Information

Before touching code, understand the problem:

### Questions to Ask

1. **What is the expected behavior?**
2. **What is the actual behavior?**
3. **When did this start happening?** (recent changes?)
4. **Does it happen every time or intermittently?**
5. **What environment?** (dev, staging, prod, browser, OS)

### Collect Evidence

```bash
# Check recent changes
git log --oneline -20
git diff HEAD~5

# Check for errors in logs
# (adjust path to your logs)
tail -100 /var/log/app.log | grep -i error

# Check environment
node --version
bun --version
```

---

## Step 2: Reproduce the Bug

**If you can't reproduce it, you can't fix it reliably.**

### Local Reproduction

Try to trigger the bug locally:

1. Follow the exact steps the user described
2. Use the same inputs/data
3. Match the environment as closely as possible

### Document the Steps

```markdown
## Reproduction Steps
1. Go to /login page
2. Enter email: test@example.com
3. Enter password: (anything)
4. Click "Login" button
5. **Expected**: Redirect to dashboard
6. **Actual**: Page stays on login, no error shown
```

### If Not Reproducible

- Check environment differences (env vars, versions, config)
- Check data differences (specific user, specific record)
- Check timing issues (race conditions, timeouts)
- Add logging to capture more information

---

## Step 3: Isolate the Problem

Narrow down where the bug lives.

### Binary Search Approach

1. Is it frontend or backend?
2. Is it this function or its caller?
3. Is it this line or earlier?

### Isolation Techniques

**Add logging at boundaries:**
```typescript
console.log('[DEBUG] API received:', request.body)
// ... process ...
console.log('[DEBUG] API returning:', response)
```

**Test components in isolation:**
```bash
# Test API directly
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

**Comment out code:**
```typescript
// Temporarily disable to isolate
// await sendEmail(user)
```

### Narrow Down

Keep asking: "Is the problem before or after this point?"

```
Request → Router → Controller → Service → Database
         ✓         ✓            ✗
                               ^ Bug is here
```

---

## Step 4: Understand Root Cause

Once isolated, understand WHY it happens.

### Read the Code Carefully

- Don't skim - read every line in the problem area
- Check types and null handling
- Look for implicit assumptions

### Common Root Causes

| Symptom | Common Cause |
|---------|--------------|
| "undefined is not a function" | Wrong import, typo in method name |
| "Cannot read property of undefined" | Null check missing, async timing |
| "Network error" | CORS, wrong URL, server down |
| "Unexpected token" | JSON parse error, wrong content-type |
| Works locally, fails in prod | Env vars, build differences, data differences |
| Works sometimes | Race condition, timing issue, flaky dependency |

### Ask "Why" Five Times

```
1. Why did the login fail? → The token was null
2. Why was the token null? → The API returned an error
3. Why did the API return an error? → User wasn't found
4. Why wasn't the user found? → Email had trailing whitespace
5. Why did email have whitespace? → No input trimming on form

Root cause: Missing input sanitization
```

---

## Step 5: Fix the Bug

Fix the root cause, not just the symptom.

### Write a Failing Test First (TDD)

```typescript
it('should handle email with whitespace', () => {
	const result = login('  user@example.com  ', 'password')
	expect(result.success).toBe(true)
})
```

### Make Minimal Changes

- Fix only what's broken
- Don't refactor while fixing bugs
- One logical change per commit

### Consider Edge Cases

If this input caused a bug, what other inputs might?

```typescript
// Bad: Only fix the specific case
if (email === '  user@example.com  ') { ... }

// Good: Fix the category of problem
email = email.trim()
```

---

## Step 6: Verify the Fix

### Run the Failing Test

```bash
bun run test -- path/to/test.test.ts
```

### Test the Original Reproduction Steps

Go through the exact steps that triggered the bug.

### Check for Regressions

```bash
# Run full test suite
bun run test

# Check related functionality manually
```

### Test Edge Cases

- What if input is empty?
- What if input is very long?
- What if request times out?

---

## Step 7: Document and Learn

### Commit with Context

```bash
git commit -m "fix: Trim email input before login lookup

User emails with leading/trailing whitespace were failing
to match existing accounts. Now trimming on form submit.

Fixes #123"
```

### Consider Prevention

- Should this be caught by a test?
- Should this be caught by a type?
- Should this be caught by validation?
- Add defensive code if appropriate

---

## Output Checklist

Before completing:

- [ ] Bug is reproducible (was)
- [ ] Root cause identified
- [ ] Fix addresses root cause (not just symptom)
- [ ] Test written for the bug
- [ ] All tests pass
- [ ] Reproduction steps no longer trigger bug
- [ ] No regressions introduced
