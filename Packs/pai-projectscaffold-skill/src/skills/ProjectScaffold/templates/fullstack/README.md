# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## Getting Started

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Start client dev server (separate terminal)
bun run dev:client

# Or run both together
bun run dev:all
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start server in watch mode |
| `bun run dev:client` | Start Vite dev server |
| `bun run dev:all` | Run both servers |
| `bun run build` | Build for production |
| `bun run start` | Run production build |
| `bun run test` | Run tests in watch mode |
| `bun run test:run` | Run tests once |
| `bun run lint` | Check for lint errors |
| `bun run lint:fix` | Fix lint errors |
| `bun run format` | Format code |
| `bun run typecheck` | Check TypeScript types |

## Project Structure

```
src/
├── server/           # Backend code
│   ├── index.ts      # Server entry point
│   └── routes/       # API routes
├── client/           # Frontend code
│   ├── index.tsx     # Client entry point
│   └── components/   # React components
└── shared/           # Shared code
    └── types.ts      # Shared types

tests/
├── server/           # Backend tests
└── client/           # Frontend tests
```

## Path Aliases

Use these aliases for imports:

- `@server/*` - Server code
- `@client/*` - Client code
- `@shared/*` - Shared code

```typescript
import { User } from '@shared/types'
import { api } from '@server/routes'
```
