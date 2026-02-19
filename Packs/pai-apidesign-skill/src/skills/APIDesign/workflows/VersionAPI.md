# VersionAPI Workflow

Handle API versioning strategies, deprecation, and migration paths.

## When to Use

- Need to introduce breaking changes
- Deprecating old endpoints
- Planning major API revision
- Managing multiple API versions

---

## Step 1: Choose Versioning Strategy

### Option 1: URL Path Versioning (Recommended)

```
GET /api/v1/users
GET /api/v2/users
```

**Pros:**
- Explicit and visible
- Easy to route
- Simple to cache
- Easy to document

**Cons:**
- URL changes between versions
- Can lead to code duplication

### Option 2: Header Versioning

```
GET /api/users
Accept: application/vnd.api+json; version=2
```

**Pros:**
- Clean URLs
- Semantic correctness

**Cons:**
- Hidden versioning
- Harder to test in browser
- Caching complexity

### Option 3: Query Parameter

```
GET /api/users?version=2
```

**Pros:**
- Visible
- Easy to test

**Cons:**
- Pollutes query string
- Not RESTful

### Recommendation

Use **URL path versioning** for most cases:

```typescript
// src/server/index.ts
import { Hono } from 'hono'
import { v1Routes } from './routes/v1'
import { v2Routes } from './routes/v2'

const app = new Hono()

app.route('/api/v1', v1Routes)
app.route('/api/v2', v2Routes)
```

---

## Step 2: Plan the Migration

### Identify Breaking Changes

```markdown
## Breaking Changes for v2

| Change | v1 | v2 | Impact |
|--------|----|----|--------|
| User ID type | `number` | `string (uuid)` | All clients storing IDs |
| Email field | `email` | `emailAddress` | All clients reading email |
| List response | `{ users: [] }` | `{ data: [] }` | All list consumers |
| Auth header | `X-API-Key` | `Authorization: Bearer` | All authenticated calls |
```

### Create Migration Guide

```markdown
# Migrating from API v1 to v2

## Timeline

- **v2 Released:** 2024-02-01
- **v1 Deprecated:** 2024-05-01 (3 months)
- **v1 Sunset:** 2024-08-01 (6 months)

## Breaking Changes

### 1. User ID Format

**v1:** Integer IDs
```json
{ "id": 123 }
```

**v2:** UUID strings
```json
{ "id": "550e8400-e29b-41d4-a716-446655440000" }
```

**Migration:**
- Update ID storage to string type
- Use provided mapping endpoint during transition:
  `GET /api/v2/id-mapping?v1Id=123`

### 2. Email Field Renamed

**v1:**
```json
{ "email": "user@example.com" }
```

**v2:**
```json
{ "emailAddress": "user@example.com" }
```

**Migration:**
- Update all code reading `user.email` to `user.emailAddress`

### 3. List Response Envelope

**v1:**
```json
{ "users": [...] }
```

**v2:**
```json
{ "data": [...], "pagination": {...} }
```

**Migration:**
- Update list handlers to read from `response.data`
- Add pagination handling

### 4. Authentication

**v1:**
```
X-API-Key: your-api-key
```

**v2:**
```
Authorization: Bearer your-jwt-token
```

**Migration:**
1. Generate JWT token via `POST /api/v2/auth/token`
2. Update all requests to use Bearer auth
```

---

## Step 3: Implement Version Coexistence

### Shared Code Structure

```
src/server/
├── routes/
│   ├── v1/
│   │   ├── index.ts
│   │   ├── users.ts
│   │   └── posts.ts
│   └── v2/
│       ├── index.ts
│       ├── users.ts
│       └── posts.ts
├── services/           # Shared business logic
│   ├── userService.ts
│   └── postService.ts
├── adapters/           # Version-specific transformations
│   ├── v1/
│   │   └── userAdapter.ts
│   └── v2/
│       └── userAdapter.ts
└── index.ts
```

### Adapter Pattern

```typescript
// src/server/services/userService.ts
// Shared business logic - version agnostic
export async function getUser(id: string): Promise<InternalUser> {
	return db.users.findById(id)
}

// src/server/adapters/v1/userAdapter.ts
import type { InternalUser } from '../../services/userService'

export interface V1User {
	id: number
	email: string
	name: string
}

export function toV1User(user: InternalUser): V1User {
	return {
		id: user.legacyId,  // v1 used numeric IDs
		email: user.emailAddress,  // v1 called it "email"
		name: user.name,
	}
}

// src/server/adapters/v2/userAdapter.ts
import type { InternalUser } from '../../services/userService'

export interface V2User {
	id: string
	emailAddress: string
	name: string
}

export function toV2User(user: InternalUser): V2User {
	return {
		id: user.id,
		emailAddress: user.emailAddress,
		name: user.name,
	}
}

// src/server/routes/v1/users.ts
import { getUser } from '../../services/userService'
import { toV1User } from '../../adapters/v1/userAdapter'

users.get('/:id', async (c) => {
	const user = await getUser(c.req.param('id'))
	return c.json({ data: toV1User(user) })
})

// src/server/routes/v2/users.ts
import { getUser } from '../../services/userService'
import { toV2User } from '../../adapters/v2/userAdapter'

users.get('/:id', async (c) => {
	const user = await getUser(c.req.param('id'))
	return c.json({ data: toV2User(user) })
})
```

---

## Step 4: Add Deprecation Warnings

### Response Headers

```typescript
// src/server/middleware/deprecation.ts
import { createMiddleware } from 'hono/factory'

export const deprecationWarning = (sunsetDate: string) =>
	createMiddleware(async (c, next) => {
		await next()

		// Add deprecation headers
		c.header('Deprecation', 'true')
		c.header('Sunset', sunsetDate)
		c.header(
			'Link',
			'</api/v2>; rel="successor-version"'
		)
	})

// src/server/routes/v1/index.ts
import { deprecationWarning } from '../middleware/deprecation'

v1Routes.use('*', deprecationWarning('2024-08-01T00:00:00Z'))
```

### Response Body Warning

```typescript
// For list endpoints, include in meta
{
  "data": [...],
  "meta": {
    "deprecation": {
      "message": "API v1 is deprecated. Please migrate to v2.",
      "sunsetDate": "2024-08-01",
      "migrationGuide": "https://docs.example.com/api/migration"
    }
  }
}
```

---

## Step 5: Monitor Version Usage

### Track API Version Metrics

```typescript
// src/server/middleware/metrics.ts
import { createMiddleware } from 'hono/factory'

export const versionMetrics = createMiddleware(async (c, next) => {
	const start = Date.now()
	await next()
	const duration = Date.now() - start

	// Extract version from path
	const version = c.req.path.match(/\/api\/(v\d+)/)?.[1] || 'unknown'

	// Log/send to metrics system
	console.log(JSON.stringify({
		type: 'api_request',
		version,
		path: c.req.path,
		method: c.req.method,
		status: c.res.status,
		duration,
		timestamp: new Date().toISOString(),
	}))
})
```

### Dashboard Queries

```sql
-- Daily requests by version
SELECT
  DATE(timestamp) as date,
  version,
  COUNT(*) as requests
FROM api_requests
WHERE timestamp > NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp), version
ORDER BY date, version;

-- Unique clients still on v1
SELECT
  COUNT(DISTINCT client_id) as clients
FROM api_requests
WHERE version = 'v1'
  AND timestamp > NOW() - INTERVAL '7 days';
```

---

## Step 6: Sunset Old Version

### Pre-Sunset Checklist

- [ ] Migration guide published
- [ ] All clients notified (email, dashboard, etc.)
- [ ] Deprecation headers in place for 3+ months
- [ ] Usage metrics show < 5% on old version
- [ ] Support ready for migration questions

### Sunset Process

1. **30 days before:** Final warning email
2. **7 days before:** Dashboard banner
3. **Sunset day:** Return 410 Gone

```typescript
// src/server/routes/v1/index.ts (after sunset)
import { Hono } from 'hono'

const v1Routes = new Hono()

v1Routes.all('*', (c) => {
	return c.json(
		{
			error: {
				code: 'version_sunset',
				message: 'API v1 has been sunset. Please use v2.',
				migrationGuide: 'https://docs.example.com/api/migration',
			},
		},
		410  // Gone
	)
})

export { v1Routes }
```

---

## Step 7: Document Version History

```markdown
# API Version History

## v2.0.0 (2024-02-01) - Current

- UUID-based resource IDs
- Consistent response envelope (`{ data, pagination }`)
- JWT authentication
- Renamed fields for clarity

## v1.0.0 (2023-01-01) - Sunset 2024-08-01

- Initial release
- Numeric IDs
- API key authentication
```

---

## Version Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                        VERSION LIFECYCLE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐    ┌────────────┐    ┌────────────┐    ┌─────────┐ │
│  │ Active  │───▶│ Deprecated │───▶│  Sunset    │───▶│ Removed │ │
│  │         │    │            │    │            │    │         │ │
│  │ • Full  │    │ • Works    │    │ • 410 Gone │    │ • Route │ │
│  │   support│   │ • Warnings │    │ • Redirect │    │   deleted│ │
│  │ • Docs  │    │ • No new   │    │   to docs  │    │         │ │
│  │   current│   │   features │    │            │    │         │ │
│  └─────────┘    └────────────┘    └────────────┘    └─────────┘ │
│                                                                  │
│  Timeline: 0 ────────── 3mo ────────── 6mo ────────── 12mo      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Output Checklist

- [ ] Versioning strategy chosen
- [ ] Breaking changes documented
- [ ] Migration guide written
- [ ] Coexistence implemented
- [ ] Deprecation warnings added
- [ ] Usage monitoring in place
- [ ] Sunset plan scheduled
- [ ] Version history documented
