# Database operations

Manage database migrations, seeding, and utilities.

## Instructions

1. **Detect Database Setup**
   - Check for drizzle.config.ts (Drizzle ORM)
   - Check for prisma/ directory (Prisma)
   - Check for docker-compose.yml for database containers
   - Read DATABASE_URL from .env if available

2. **Check Connection**
   - Verify database is reachable
   - For Docker: check if container is running

3. **Execute Subcommand**
   - Run the appropriate operation based on arguments

## Arguments

- `/db` - Show database status
- `/db studio` - Open database GUI (Drizzle Studio / Prisma Studio)
- `/db migrate` - Run pending migrations
- `/db generate` - Generate migration from schema changes
- `/db push` - Push schema directly (dev mode, no migration file)
- `/db seed` - Run seed script
- `/db reset` - Drop all tables and re-run migrations + seed (requires confirmation)
- `/db up` - Start database container (docker compose up -d)
- `/db down` - Stop database container
- `/db dump` - Export to SQL file
- `/db shell` - Open psql/mysql shell

## Output Format

For `/db` (status):
```
🗄️ Database Status
━━━━━━━━━━━━━━━━━━

Connection: ✓ PostgreSQL (localhost:5432)
Container:  ✓ Running (grapplingconnect-db)
Database:   grapplingconnect_dev

Migrations:
  ✓ 15 applied | 0 pending

Recent:
  • 0005_add_booking_status (Feb 5)
  • 0004_add_user_preferences (Feb 3)
  • 0003_add_notifications (Feb 1)

Commands:
  /db studio   → Open Drizzle Studio
  /db migrate  → Apply migrations
  /db seed     → Seed test data
```

For `/db migrate`:
```
🗄️ Running Migrations
━━━━━━━━━━━━━━━━━━━━━

Pending migrations: 2

  [1/2] 0006_add_instructor_availability...
    ✓ Applied

  [2/2] 0007_add_payment_status...
    ✓ Applied

━━━━━━━━━━━━━━━━━━━━━
✓ 2 migrations applied
```

For `/db reset`:
```
⚠️ This will DELETE ALL DATA

Database: grapplingconnect_dev
Tables:   23
Rows:     ~1,500

Type 'reset' to confirm: _
```

For `/db studio`:
```
🗄️ Opening Drizzle Studio
━━━━━━━━━━━━━━━━━━━━━━━━━

Starting studio...
  ✓ Running on https://local.drizzle.studio

Press Ctrl+C to stop.
```

## Project-Specific Commands

For grapplingconnect (run from app/ directory):
- `bun run db:studio` - Drizzle Studio
- `bun run db:migrate` - Run migrations
- `bun run db:push` - Push schema
- `bun run db:seed` - Seed data
- `bun run db:generate` - Generate migration

Docker:
- `docker compose up -d` - Start PostgreSQL
- `docker compose down` - Stop PostgreSQL
