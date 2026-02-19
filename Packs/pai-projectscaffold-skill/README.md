---
name: PAI ProjectScaffold Skill
pack-id: pai-projectscaffold-skill-v1.0.0
version: 1.0.0
author: salexanderb
description: Bootstrap new TypeScript projects with proper structure, tooling, and configuration. Saves 30+ minutes of repetitive setup work.
type: skill
purpose-type: [scaffolding, project-setup, bootstrap, tooling]
platform: claude-code
dependencies: []
keywords: [scaffold, bootstrap, project, setup, typescript, bun, biome, husky, vitest]
---

# PAI ProjectScaffold Skill

> Bootstraps new projects with proper structure, configuration, and tooling in one workflow - saving 30+ minutes of repetitive setup work.

> **Installation:** This pack is designed for AI-assisted installation. Give this directory to your AI and ask it to install using `INSTALL.md`.

---

## What This Pack Provides

- **Project Structure** - Creates directory layout (src/, tests/, etc.)
- **Package Setup** - Initializes package.json with proper scripts
- **TypeScript Config** - Strict mode, path aliases
- **Linting/Formatting** - Biome configuration
- **Testing** - Vitest setup with coverage
- **Git Setup** - Initializes repo with .gitignore, Husky hooks

## Architecture

```
ProjectScaffold Skill
├── SKILL.md                     # Main entry point and routing
├── workflows/
│   ├── Scaffold.md              # Create new project
│   └── AddTooling.md            # Add tooling to existing project
└── templates/
    └── fullstack/               # Full-stack template files
        ├── package.json
        ├── tsconfig.json
        ├── biome.json
        ├── vite.config.ts
        ├── vitest.config.ts
        ├── .gitignore
        ├── README.md
        ├── src/
        │   ├── server/index.ts
        │   ├── client/index.tsx
        │   ├── client/index.html
        │   ├── client/components/App.tsx
        │   └── shared/types.ts
        ├── tests/server/health.test.ts
        └── .husky/pre-commit
```

## Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **Scaffold** | "create project", "new project", "bootstrap", "scaffold" | Create new project from template |
| **AddTooling** | "add biome", "add husky", "add testing", "add tooling" | Add tooling to existing project |

## Available Templates

| Template | Description |
|----------|-------------|
| **fullstack** | Frontend (Vite + React) + backend (Bun) with shared types |

## Template Features

### fullstack Template

| Feature | Tool | Config File |
|---------|------|-------------|
| Build | Bun + Vite | vite.config.ts |
| TypeScript | Strict mode | tsconfig.json |
| Linting | Biome | biome.json |
| Testing | Vitest | vitest.config.ts |
| Git Hooks | Husky | .husky/pre-commit |

### Scripts Included

| Script | Command | Purpose |
|--------|---------|---------|
| `bun run dev` | Start server | Development server |
| `bun run dev:client` | Start Vite | Frontend dev server |
| `bun run build` | Build all | Production build |
| `bun run test` | Run tests | Vitest watch mode |
| `bun run lint` | Check code | Biome linting |
| `bun run typecheck` | Type check | TypeScript validation |

## Usage Examples

```
"Create a new project called my-app"
→ Invokes Scaffold workflow
→ Creates project structure with all configs
→ Initializes git, installs dependencies
→ Project ready to develop

"Scaffold a new fullstack app in ~/projects/dashboard"
→ Invokes Scaffold workflow
→ Creates project at specified path
→ Full setup with Biome, Husky, Vitest

"Add Biome linting to my project"
→ Invokes AddTooling workflow
→ Adds biome.json, updates package.json
→ Runs initial lint/format
```

## Template Variables

When using templates, these placeholders are replaced:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{PROJECT_NAME}}` | Project name (kebab-case) | `my-awesome-app` |
| `{{PROJECT_DESCRIPTION}}` | Short description | `A full-stack TypeScript app` |

## What's Included

| Component | File | Purpose |
|-----------|------|---------|
| Main Skill | src/skills/ProjectScaffold/SKILL.md | Entry point and routing |
| Scaffold | src/skills/ProjectScaffold/workflows/Scaffold.md | Create new project |
| AddTooling | src/skills/ProjectScaffold/workflows/AddTooling.md | Add tooling to existing project |
| Templates | src/skills/ProjectScaffold/templates/fullstack/ | Full-stack project template |

## Integration

**Works well with:**
- **TDD** - Project includes Vitest setup for test-driven development
- **CodeAudit** - Audit newly created projects for issues
- **Refactor** - Clean up and restructure as project grows

## Model Interoperability

This skill is workflow-based with templates. Any model can:
1. Read the workflow files
2. Follow the step-by-step instructions
3. Copy and transform template files
4. Replace template variables

The workflows are deterministic procedures that any model can execute.

## Credits

- **Author:** salexanderb
- **License:** MIT

## Changelog

### 1.0.0 - 2026-02-19
- Initial release
- Scaffold workflow for new projects
- AddTooling workflow for existing projects
- fullstack template with Bun + Vite + React
- Biome, Husky, Vitest configurations
