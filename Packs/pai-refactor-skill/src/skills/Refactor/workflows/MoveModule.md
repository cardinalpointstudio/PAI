# MoveModule Workflow

Move a file or module to a new location while updating all imports.

## When to Use

- File is in the wrong directory
- Reorganizing project structure
- Splitting a monolithic file
- Consolidating related modules

---

## Step 1: Verify Tests Pass

```bash
bun run test
```

---

## Step 2: Plan the Move

Document:
- **Source**: Where the file is now
- **Destination**: Where it should go
- **Reason**: Why it's being moved

```markdown
## Move Plan

**Source:** src/components/utils/formatDate.ts
**Destination:** src/lib/date/formatDate.ts
**Reason:** Date utilities should be in lib/, not components/
```

---

## Step 3: Find All Importers

Find every file that imports from the source:

```bash
# Find files importing this module
grep -r "from ['\"].*formatDate" --include="*.ts" --include="*.tsx" src/
```

List them:
```markdown
## Files That Import This Module

- src/components/Header.tsx:3
- src/components/EventCard.tsx:5
- src/pages/Calendar.tsx:2
- tests/formatDate.test.ts:1
```

---

## Step 4: Create Destination Directory

```bash
mkdir -p src/lib/date
```

---

## Step 5: Move the File

Use `git mv` to preserve history:

```bash
git mv src/components/utils/formatDate.ts src/lib/date/formatDate.ts
```

---

## Step 6: Update All Imports

Update each importing file:

```typescript
// Before
import { formatDate } from '../utils/formatDate'

// After
import { formatDate } from '@/lib/date/formatDate'
// Or with relative path
import { formatDate } from '../../lib/date/formatDate'
```

### Calculate New Relative Paths

| From | To | Old Import | New Import |
|------|-----|------------|------------|
| `src/components/Header.tsx` | `src/lib/date/formatDate.ts` | `../utils/formatDate` | `../../lib/date/formatDate` |
| `src/pages/Calendar.tsx` | `src/lib/date/formatDate.ts` | `../components/utils/formatDate` | `../lib/date/formatDate` |

### Prefer Path Aliases

If your project has path aliases (tsconfig.json):

```json
{
	"compilerOptions": {
		"paths": {
			"@/*": ["./src/*"]
		}
	}
}
```

Use them for cleaner imports:

```typescript
import { formatDate } from '@/lib/date/formatDate'
```

---

## Step 7: Update Re-exports (If Any)

If the module was re-exported from an index file:

```typescript
// src/components/utils/index.ts (old)
export { formatDate } from './formatDate'  // Remove this

// src/lib/date/index.ts (new)
export { formatDate } from './formatDate'  // Add this
```

---

## Step 8: Update Tests

```typescript
// Before
import { formatDate } from '../../src/components/utils/formatDate'

// After
import { formatDate } from '../../src/lib/date/formatDate'
```

---

## Step 9: Run TypeScript Check

```bash
bun run typecheck
```

This will catch any broken imports.

---

## Step 10: Run Tests

```bash
bun run test
```

---

## Step 11: Clean Up Empty Directories

```bash
# Remove empty directories
find src -type d -empty -delete
```

---

## Step 12: Commit

```bash
git add -A
git commit -m "refactor: Move formatDate to lib/date/"
```

---

## Move Patterns

### Move Single File

```bash
git mv src/old/path/file.ts src/new/path/file.ts
# Update imports
```

### Move Directory

```bash
git mv src/utils src/lib/utils
# Update all imports from 'utils/' to 'lib/utils/'
```

### Split File Into Multiple

```typescript
// Before: src/utils/helpers.ts (too big)
export function formatDate() { ... }
export function formatCurrency() { ... }
export function formatNumber() { ... }

// After: Split into focused modules
// src/lib/date/format.ts
export function formatDate() { ... }

// src/lib/currency/format.ts
export function formatCurrency() { ... }

// src/lib/number/format.ts
export function formatNumber() { ... }
```

Update imports:
```typescript
// Before
import { formatDate, formatCurrency } from '../utils/helpers'

// After
import { formatDate } from '@/lib/date/format'
import { formatCurrency } from '@/lib/currency/format'
```

### Move with Backwards Compatibility

If external code depends on old location:

```typescript
// src/utils/helpers.ts (old location - keep for compatibility)
/** @deprecated Import from @/lib/date instead */
export { formatDate } from '../lib/date/format'

// Log deprecation warning in development
if (process.env.NODE_ENV === 'development') {
	console.warn('Importing from utils/helpers is deprecated. Use @/lib/date instead.')
}
```

### Consolidate Related Modules

```bash
# Before: Scattered files
src/components/dateUtils.ts
src/utils/dateFormatter.ts
src/lib/dateHelpers.ts

# After: Consolidated
src/lib/date/
├── index.ts      # Re-exports
├── format.ts     # formatDate, formatTime
├── parse.ts      # parseDate, parseTime
└── utils.ts      # isValidDate, getDaysBetween
```

---

## Bulk Import Update

For many imports, use find and replace:

```bash
# Find all files with old import
grep -rl "from ['\"].*old/path" src/

# Preview changes
grep -rl "from ['\"].*old/path" src/ | \
	xargs sed -n "s|from '\(.*\)old/path|from '\1new/path|gp"

# Apply changes (careful!)
grep -rl "from ['\"].*old/path" src/ | \
	xargs sed -i "s|from '\(.*\)old/path|from '\1new/path|g"
```

---

## Output Checklist

- [ ] Destination directory exists
- [ ] File moved with `git mv`
- [ ] All imports updated
- [ ] Re-exports updated (if any)
- [ ] Tests updated
- [ ] TypeScript compiles
- [ ] All tests pass
- [ ] Empty directories removed
- [ ] Committed with descriptive message
