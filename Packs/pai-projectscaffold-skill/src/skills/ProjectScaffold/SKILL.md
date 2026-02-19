---
name: ProjectScaffold
description: Bootstrap new TypeScript projects with proper structure, tooling, and configuration. USE WHEN user says 'start new project', 'create project', 'bootstrap', 'scaffold', 'new fullstack app', 'init typescript project', OR user wants to add tooling to existing project.
---

# ProjectScaffold

Bootstraps new projects with proper structure, configuration, and tooling in one workflow - saving 30+ minutes of repetitive setup work.

## Capabilities

| Capability | Description |
|------------|-------------|
| **Project Structure** | Creates directory layout (src/, tests/, etc.) |
| **Package Setup** | Initializes package.json with proper scripts |
| **TypeScript Config** | Strict mode, path aliases |
| **Linting/Formatting** | Biome configuration |
| **Testing** | Vitest setup with coverage |
| **Git Setup** | Initializes repo with .gitignore, Husky hooks |

## Workflow Routing

**When executing a workflow, output this notification:**

```
Running the **WorkflowName** workflow from the **ProjectScaffold** skill...
```

| Workflow | Trigger | File |
|----------|---------|------|
| **Scaffold** | "create project", "new project", "bootstrap", "scaffold" | `workflows/Scaffold.md` |
| **AddTooling** | "add biome", "add husky", "add testing", "add tooling" | `workflows/AddTooling.md` |

## Available Templates

| Template | Description | Location |
|----------|-------------|----------|
| **fullstack** | Frontend + backend with shared types | `templates/fullstack/` |

## Examples

**Example 1: Create a new full-stack project**
```
User: "Create a new project called my-app"
→ Invokes Scaffold workflow
→ Creates project structure with all configs
→ Initializes git, installs dependencies
→ Project ready to develop
```

**Example 2: Add tooling to existing project**
```
User: "Add Biome linting to my project"
→ Invokes AddTooling workflow
→ Adds biome.json, updates package.json
→ Runs initial lint/format
```

**Example 3: Bootstrap with specific location**
```
User: "Scaffold a new fullstack app in ~/projects/dashboard"
→ Invokes Scaffold workflow
→ Creates project at specified path
→ Full setup with Biome, Husky, Vitest
```

## Template Variables

When using templates, replace these placeholders:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{PROJECT_NAME}}` | Project name (kebab-case) | `my-awesome-app` |
| `{{PROJECT_DESCRIPTION}}` | Short description | `A full-stack TypeScript app` |
