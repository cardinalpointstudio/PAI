# AddTooling Workflow

Add tooling (linting, formatting, testing, git hooks) to an existing project.

## When to Use

- User says "add biome", "add linting", "add husky", "add testing"
- User has an existing project that needs tooling
- User wants to upgrade tooling configuration

## Available Tooling

| Tooling | What it Adds |
|---------|--------------|
| **biome** | Biome linter + formatter with biome.json |
| **husky** | Git hooks with pre-commit checks |
| **vitest** | Testing framework with basic config |
| **all** | All of the above |

## Step 1: Verify Project

Check that we're in a valid project:

```bash
# Check for package.json
ls package.json
```

If no package.json exists, ask user to run `bun init` first.

## Step 2: Determine What to Add

Ask user what tooling they want:
- Biome (linting/formatting)
- Husky (git hooks)
- Vitest (testing)
- All of the above

---

## Adding Biome

### 2a. Install Biome

```bash
bun add -D @biomejs/biome
```

### 2b. Create biome.json

Copy from `templates/fullstack/biome.json` or create:

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "tab",
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "asNeeded"
    }
  },
  "files": {
    "ignore": ["dist", "node_modules"]
  }
}
```

### 2c. Add Scripts to package.json

Add these scripts if they don't exist:

```json
{
  "scripts": {
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write ."
  }
}
```

### 2d. Run Initial Format

```bash
bun run lint:fix
```

---

## Adding Husky

### 3a. Install Husky

```bash
bun add -D husky
```

### 3b. Add Prepare Script

Update package.json:

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

### 3c. Initialize Husky

```bash
bun run prepare
```

### 3d. Create Pre-commit Hook

```bash
mkdir -p .husky
```

Create `.husky/pre-commit`:

```bash
#!/bin/sh
bun run lint
bun run typecheck
```

Make it executable:

```bash
chmod +x .husky/pre-commit
```

---

## Adding Vitest

### 4a. Install Vitest

```bash
bun add -D vitest
```

### 4b. Add Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

### 4c. Create Tests Directory

```bash
mkdir -p tests
```

### 4d. Create Sample Test

Create `tests/example.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'

describe('Example', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2)
  })
})
```

### 4e. Verify

```bash
bun run test:run
```

---

## Output

Report what was added:
- List of new dependencies
- New scripts available
- Any manual steps needed

## Example

```
User: Add biome to my project

→ Installing @biomejs/biome...
→ Creating biome.json...
→ Adding lint scripts to package.json...
→ Running initial lint...

Done! You can now run:
- bun run lint     # Check for issues
- bun run lint:fix # Auto-fix issues
- bun run format   # Format code
```
