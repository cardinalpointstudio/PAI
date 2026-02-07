# AnalyzeCoverage Workflow

Analyze test coverage to find gaps and suggest tests to write.

## When to Use

- Want to know what code lacks tests
- Preparing to improve test coverage
- Before a release to ensure quality
- After refactoring to verify coverage maintained

---

## Step 1: Run Coverage Report

```bash
bun run test:coverage
```

Or for specific directory:
```bash
bun run test:coverage -- --coverage.include="src/utils/**"
```

---

## Step 2: Read Coverage Output

Look for files with low coverage:

```
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|-------------------
All files |   75.5  |    68.2  |   80.0  |   75.5  |
 utils/   |   60.0  |    50.0  |   66.7  |   60.0  |
  foo.ts  |   45.0  |    30.0  |   50.0  |   45.0  | 12-18,25-30,42
  bar.ts  |   90.0  |    85.0  |  100.0  |   90.0  | 55
----------|---------|----------|---------|---------|-------------------
```

**Priority:** Files with lowest coverage first.

---

## Step 3: Identify Coverage Gaps

### Uncovered Lines
Look at "Uncovered Line #s" column. Read those lines to understand what's not tested.

### Uncovered Branches
Low branch coverage means `if/else`, `switch`, or ternary conditions aren't fully tested.

### Uncovered Functions
Low function coverage means entire functions have no tests.

---

## Step 4: Categorize Gaps

| Priority | Category | Action |
|----------|----------|--------|
| **High** | Business logic without tests | Must add tests |
| **High** | Error handling untested | Must add tests |
| **Medium** | Edge cases missing | Should add tests |
| **Medium** | Utility functions untested | Should add tests |
| **Low** | Simple getters/setters | Can skip |
| **Low** | Framework boilerplate | Can skip |

---

## Step 5: Generate Test Suggestions

For each uncovered area, suggest specific tests:

### Example Analysis

**File:** `src/utils/validator.ts`
**Uncovered Lines:** 15-22, 35-40

**Line 15-22:** Error handling branch
```typescript
if (!input) {
	throw new ValidationError('Input required')
}
```

**Suggested Test:**
```typescript
it('should throw ValidationError when input is empty', () => {
	expect(() => validate('')).toThrow(ValidationError)
	expect(() => validate('')).toThrow('Input required')
})

it('should throw ValidationError when input is null', () => {
	expect(() => validate(null)).toThrow(ValidationError)
})
```

**Line 35-40:** Edge case branch
```typescript
if (input.length > MAX_LENGTH) {
	return input.slice(0, MAX_LENGTH)
}
```

**Suggested Test:**
```typescript
it('should truncate input exceeding max length', () => {
	const longInput = 'a'.repeat(MAX_LENGTH + 10)
	const result = validate(longInput)
	expect(result.length).toBe(MAX_LENGTH)
})
```

---

## Step 6: Check Thresholds

Compare against project thresholds (typically in vitest.config.ts):

```typescript
coverage: {
	thresholds: {
		statements: 80,
		branches: 75,
		functions: 80,
		lines: 80,
	}
}
```

**If below threshold:**
1. Identify files dragging down the average
2. Focus on those files first
3. Add tests until threshold met

---

## Step 7: Create Action Plan

Output a prioritized list:

```markdown
## Coverage Improvement Plan

### Critical (Must Fix)
1. `src/services/auth.ts` - 45% → 80%
   - Add tests for login error handling
   - Add tests for token refresh logic

2. `src/utils/validator.ts` - 60% → 80%
   - Add tests for edge cases (lines 35-40)
   - Add tests for error cases (lines 15-22)

### Important (Should Fix)
3. `src/components/Form.tsx` - 70% → 80%
   - Add tests for form submission
   - Add tests for validation display

### Nice to Have
4. `src/utils/format.ts` - 75% → 80%
   - Add edge case tests
```

---

## Output

Deliver:
1. Current coverage percentage by file
2. List of uncovered lines with context
3. Specific test suggestions for each gap
4. Prioritized action plan
5. Estimated tests needed to reach threshold
