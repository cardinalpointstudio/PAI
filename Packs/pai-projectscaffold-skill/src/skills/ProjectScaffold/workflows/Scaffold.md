# Scaffold Workflow

Create a new full-stack TypeScript project with all configurations and tooling.

## When to Use

- User says "create new project", "start project", "scaffold", "bootstrap"
- User wants a new full-stack app with server and client
- User needs a properly configured TypeScript project

## Inputs Required

| Input | Description | Default |
|-------|-------------|---------|
| Project Name | Name of the project (kebab-case) | Required |
| Location | Where to create the project | Current directory |
| Description | Short project description | "A full-stack TypeScript app" |

## Step 1: Gather Project Information

Ask the user for:
1. **Project name** - Will be used for directory and package.json
2. **Location** - Where to create the project (default: current directory)
3. **Description** - Optional, for package.json and README

Validate:
- Name is kebab-case (lowercase, hyphens only)
- Location exists and is writable
- No existing directory with same name

## Step 2: Create Directory Structure

Create the project directory and all subdirectories:

```bash
mkdir -p PROJECT_NAME/{src/{server/routes,client/components,shared},tests/{server,client},public}
```

Expected structure:
```
PROJECT_NAME/
├── src/
│   ├── server/
│   │   └── routes/
│   ├── client/
│   │   └── components/
│   └── shared/
├── tests/
│   ├── server/
│   └── client/
└── public/
```

## Step 3: Copy Template Files

Copy files from `templates/fullstack/` to the new project directory:

| Source | Destination | Transform |
|--------|-------------|-----------|
| `package.json` | `PROJECT_NAME/package.json` | Replace `{{PROJECT_NAME}}`, `{{PROJECT_DESCRIPTION}}` |
| `tsconfig.json` | `PROJECT_NAME/tsconfig.json` | None |
| `biome.json` | `PROJECT_NAME/biome.json` | None |
| `vite.config.ts` | `PROJECT_NAME/vite.config.ts` | None |
| `.gitignore` | `PROJECT_NAME/.gitignore` | None |
| `README.md` | `PROJECT_NAME/README.md` | Replace `{{PROJECT_NAME}}`, `{{PROJECT_DESCRIPTION}}` |
| `src/server/index.ts` | `PROJECT_NAME/src/server/index.ts` | None |
| `src/client/index.tsx` | `PROJECT_NAME/src/client/index.tsx` | None |
| `src/client/index.html` | `PROJECT_NAME/src/client/index.html` | Replace `{{PROJECT_NAME}}` |
| `src/client/components/App.tsx` | `PROJECT_NAME/src/client/components/App.tsx` | Replace `{{PROJECT_NAME}}` |
| `src/shared/types.ts` | `PROJECT_NAME/src/shared/types.ts` | None |
| `tests/server/health.test.ts` | `PROJECT_NAME/tests/server/health.test.ts` | None |

**Important:** When copying files, replace these template variables:
- `{{PROJECT_NAME}}` → actual project name
- `{{PROJECT_DESCRIPTION}}` → actual description

## Step 4: Initialize Git

```bash
cd PROJECT_NAME
git init
```

## Step 5: Set Up Husky

Create the `.husky` directory and pre-commit hook:

```bash
mkdir -p .husky
```

Copy `.husky/pre-commit` from templates (already created in Step 3).

Make the hook executable:
```bash
chmod +x .husky/pre-commit
```

## Step 6: Install Dependencies

```bash
bun install
```

This will:
- Install all dependencies from package.json
- Run the `prepare` script which initializes Husky

## Step 7: Verify Setup

Run these commands to verify everything works:

```bash
# Type check
bun run typecheck

# Lint
bun run lint

# Run tests
bun run test:run
```

All commands should pass without errors.

## Step 8: Initial Commit (Optional)

If user wants, create the initial commit:

```bash
git add .
git commit -m "Initial project setup with ProjectScaffold"
```

## Output

Report to user:
- Project created at: `{location}/{project-name}`
- Commands available: `bun run dev`, `bun run dev:client`, `bun run test`, etc.
- Next steps: Start coding!

## Example Execution

```
User: Create a new project called my-dashboard