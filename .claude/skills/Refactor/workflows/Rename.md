# Rename Workflow

Rename a symbol (variable, function, class, file) across the entire codebase.

## When to Use

- Name doesn't describe purpose clearly
- Naming convention changed
- Domain terminology evolved
- Typo in original name

---

## Step 1: Verify Tests Pass

```bash
bun run test
```

---

## Step 2: Identify What to Rename

| Type | Example |
|------|---------|
| Variable | `const data` → `const userData` |
| Function | `getData()` → `fetchUserProfile()` |
| Class/Type | `interface Data` → `interface UserProfile` |
| File | `data.ts` → `userProfile.ts` |
| Directory | `utils/` → `lib/` |

---

## Step 3: Find All Usages

### Using Grep

```bash
# Find all occurrences
grep -r "oldName" --include="*.ts" --include="*.tsx" src/

# Count occurrences
grep -r "oldName" --include="*.ts" --include="*.tsx" src/ | wc -l
```

### Types of Usages to Find

1. **Definitions** - Where it's declared
2. **Imports** - Where it's imported
3. **Usages** - Where it's used
4. **Exports** - Where it's exported
5. **Types** - Type references
6. **Comments** - Documentation references
7. **Tests** - Test files

---

## Step 4: Plan the Rename

List all files that need changes:

```markdown
## Files to Update

### Definitions
- src/services/userService.ts:15 - function definition

### Imports
- src/components/UserProfile.tsx:3 - import statement
- src/pages/Dashboard.tsx:5 - import statement

### Usages
- src/components/UserProfile.tsx:22 - function call
- src/pages/Dashboard.tsx:18 - function call

### Tests
- tests/userService.test.ts:8 - test description
- tests/userService.test.ts:12 - function call
```

---

## Step 5: Rename the Definition First

Start at the source:

```typescript
// Before
export function getData(userId: string) {
	// ...
}

// After
export function fetchUserProfile(userId: string) {
	// ...
}
```

---

## Step 6: Update All Imports

```typescript
// Before
import { getData } from '../services/userService'

// After
import { fetchUserProfile } from '../services/userService'
```

---

## Step 7: Update All Usages

```typescript
// Before
const data = await getData(userId)

// After
const profile = await fetchUserProfile(userId)
```

---

## Step 8: Update Tests

```typescript
// Before
describe('getData', () => {
	it('should fetch user data', async () => {
		const result = await getData('123')
	})
})

// After
describe('fetchUserProfile', () => {
	it('should fetch user profile', async () => {
		const result = await fetchUserProfile('123')
	})
})
```

---

## Step 9: Rename File (If Applicable)

If the file name should match:

```bash
# Move/rename the file
git mv src/services/data.ts src/services/userProfile.ts
```

Then update all imports to the new path.

---

## Step 10: Run Tests

```bash
bun run test
```

---

## Step 11: Verify No Broken References

```bash
# Check for any remaining old names
grep -r "oldName" --include="*.ts" --include="*.tsx" src/

# TypeScript will catch missing imports
bun run typecheck
```

---

## Step 12: Commit

```bash
git add -A
git commit -m "refactor: Rename getData to fetchUserProfile"
```

---

## Rename Patterns

### Rename Variable

```typescript
// Before
const d = new Date()
const x = d.getTime()

// After
const createdAt = new Date()
const timestamp = createdAt.getTime()
```

### Rename Function (with Re-export for Backwards Compatibility)

If others depend on the old name:

```typescript
// userService.ts
export function fetchUserProfile(userId: string) {
	// implementation
}

// Deprecated: Remove in v2.0
/** @deprecated Use fetchUserProfile instead */
export const getData = fetchUserProfile
```

### Rename Type/Interface

```typescript
// Before
interface IUser {
	name: string
}

// After
interface User {
	name: string
}

// If needed for backwards compatibility
/** @deprecated Use User instead */
type IUser = User
```

### Rename React Component

```typescript
// Before: UserCard.tsx
export function UserCard({ user }: Props) { ... }

// After: ProfileCard.tsx
export function ProfileCard({ user }: Props) { ... }
```

Update all imports and usages.

### Rename Directory

```bash
# Move directory
git mv src/utils src/lib

# Update all imports from '../utils/' to '../lib/'
```

---

## Bulk Rename with sed

For simple, consistent renames:

```bash
# Preview changes (dry run)
grep -rl "oldName" src/ | xargs sed -n 's/oldName/newName/gp'

# Apply changes
grep -rl "oldName" src/ | xargs sed -i 's/oldName/newName/g'
```

**Caution:** Only use for exact matches. Verify with tests.

---

## Output Checklist

- [ ] All definitions renamed
- [ ] All imports updated
- [ ] All usages updated
- [ ] All tests updated
- [ ] File renamed (if applicable)
- [ ] No remaining references to old name
- [ ] TypeScript compiles without errors
- [ ] All tests pass
- [ ] Committed with descriptive message
