# Deployment operations

Deploy to preview, staging, and production environments.

## Instructions

1. **Detect Deployment Platform**
   - Check for vercel.json (Vercel)
   - Check for netlify.toml (Netlify)
   - Check for fly.toml (Fly.io)
   - Check for railway.json (Railway)
   - Check for Dockerfile + docker-compose (Docker/custom)

2. **Check Current State**
   - Get current branch and commit
   - Check for uncommitted changes
   - Verify build passes locally

3. **Execute Subcommand**
   - Run the appropriate operation based on arguments

## Arguments

- `/deploy` - Show deployment status for all environments
- `/deploy preview` - Deploy current branch as preview
- `/deploy staging` - Deploy to staging environment
- `/deploy production` - Deploy to production (with safeguards)
- `/deploy rollback` - Rollback to previous deployment
- `/deploy logs` - View recent deployment logs
- `/deploy logs <env>` - View logs for specific environment
- `/deploy status` - Detailed status of all deployments

## Output Format

For `/deploy` (status):
```
🚀 Deployment Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Platform: Vercel

Production:
  URL:      https://grapplingconnect.com
  Commit:   a1b2c3d feat: booking system
  Deployed: 2 days ago
  Status:   ✓ Healthy

Staging:
  URL:      https://staging.grapplingconnect.com
  Commit:   f4e5d6c fix: validation
  Deployed: 3 hours ago
  Status:   ✓ Healthy

Preview (feature/notifications):
  URL:      https://feature-notifications-xxx.vercel.app
  Status:   ✓ Ready

Current branch: feature/payments
  ⚠ Not deployed yet

━━━━━━━━━━━━━━━━━━━━━━━━━━━
/deploy preview    → Create preview
/deploy staging    → Deploy to staging
/deploy production → Deploy to prod
```

For `/deploy preview`:
```
🚀 Creating Preview Deployment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Branch: feature/payments
Commit: d4e5f6g Add Stripe integration

Pre-flight:
  ✓ No uncommitted changes
  ✓ Pushed to origin

Deploying...
  ✓ Build started
  ✓ Build completed (45s)
  ✓ Deployment ready

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ https://feature-payments-xxx.vercel.app

Preview will update automatically on new commits.
```

For `/deploy staging`:
```
🚀 Staging Deployment
━━━━━━━━━━━━━━━━━━━━━━

Branch: feature/payments → staging
Commit: d4e5f6g Add Stripe integration

Pre-flight:
  ✓ Tests passing
  ✓ Build succeeds
  ✓ No uncommitted changes
  ✓ Branch pushed

Deploying...
  [1/4] Building...        ✓ (52s)
  [2/4] Running migrations... ✓
  [3/4] Deploying...       ✓
  [4/4] Health check...    ✓

━━━━━━━━━━━━━━━━━━━━━━
✓ https://staging.grapplingconnect.com

View logs: /deploy logs staging
```

For `/deploy production`:
```
🚀 Production Deployment
━━━━━━━━━━━━━━━━━━━━━━━━

⚠ PRODUCTION DEPLOYMENT

Branch: main
Commit: a1b2c3d Merge feature/payments

Pre-flight checks:
  ✓ On main branch
  ✓ All tests passing (47 passed)
  ✓ Build succeeds
  ✓ TypeScript clean
  ✓ Lint clean
  ⚠ 3 commits since last deploy

Changes since last deploy:
  • a1b2c3d Merge feature/payments
  • b2c3d4e Add payment webhooks
  • c3d4e5f Update Stripe SDK

Database:
  ✓ No pending migrations

━━━━━━━━━━━━━━━━━━━━━━━━
Type 'deploy' to confirm production deployment: _
```

After confirmation:
```
Deploying to production...
  [1/5] Final build...        ✓ (58s)
  [2/5] Running migrations... ✓ (skipped, none pending)
  [3/5] Deploying...          ✓
  [4/5] Health check...       ✓
  [5/5] Warming cache...      ✓

━━━━━━━━━━━━━━━━━━━━━━━━
✓ https://grapplingconnect.com

Deployment complete!
Previous version saved for rollback.
```

For `/deploy rollback`:
```
🚀 Rollback
━━━━━━━━━━━━

Current production:
  Commit:   a1b2c3d (deployed 10 minutes ago)

Previous deployment:
  Commit:   x9y8z7w feat: notification system
  Deployed: 2 days ago

Rollback to previous deployment? (y/n)

  ✓ Rolled back to x9y8z7w
  ✓ Health check passed

━━━━━━━━━━━━
✓ Rollback complete

Note: Run /deploy production to redeploy latest.
```

For `/deploy logs`:
```
🚀 Deployment Logs (Production)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Build output:
  ▶ Installing dependencies...
  ▶ bun install v1.0.25
  ▶ Installed 847 packages (3.2s)
  ▶ Building Next.js app...
  ▶ Creating optimized build...
  ✓ Build completed in 52s

Runtime logs (last 20 lines):
  [12:34:56] GET /api/health 200 12ms
  [12:34:58] GET /dashboard 200 45ms
  [12:35:01] POST /api/booking 201 89ms
  [12:35:02] GET /api/users/me 200 15ms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Showing last 20 lines. Use /deploy logs 100 for more.
```

## Safety

- Production deploys require explicit confirmation
- Always run tests before production deploy
- Check for pending database migrations
- Require main branch for production
- Keep previous deployment for quick rollback
- Show what's changed since last deploy
- Health check after deployment

## Platform-Specific Commands

Vercel:
- `vercel` - Deploy preview
- `vercel --prod` - Deploy production
- `vercel logs` - View logs
- `vercel rollback` - Rollback

Fly.io:
- `fly deploy` - Deploy
- `fly logs` - View logs
- `fly releases` - List releases
- `fly releases rollback` - Rollback

Docker/Custom:
- Check for deploy scripts in package.json or Makefile
- Look for CI/CD config (.github/workflows, etc.)
