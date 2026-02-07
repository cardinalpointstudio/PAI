# API Patterns Reference

Comprehensive guide to REST API design patterns, conventions, and best practices.

---

## URL Design

### Resource Naming

| Pattern | Example | Notes |
|---------|---------|-------|
| Plural nouns | `/users`, `/posts` | Always plural |
| Lowercase | `/user-profiles` | Kebab-case for multi-word |
| No verbs | `/users/:id` | Not `/getUser/:id` |
| Nested resources | `/users/:id/posts` | Max 2 levels deep |

### Good URLs

```
GET    /users                    # List users
GET    /users/123                # Get user 123
POST   /users                    # Create user
PATCH  /users/123                # Update user 123
DELETE /users/123                # Delete user 123

GET    /users/123/posts          # User's posts
POST   /users/123/posts          # Create post for user

GET    /posts/456/comments       # Post's comments
```

### Bad URLs

```
GET    /getUsers                 # Verb in URL
GET    /user/123                 # Singular noun
POST   /users/123/delete         # Action as path
GET    /users/123/posts/456/comments/789/replies  # Too deep
```

### Query Parameters

```
# Filtering
GET /users?status=active
GET /users?role=admin&status=active
GET /posts?author=123&published=true

# Sorting
GET /users?sort=createdAt        # Ascending
GET /users?sort=-createdAt       # Descending (prefix -)
GET /users?sort=lastName,firstName

# Pagination
GET /users?limit=20&cursor=abc123
GET /users?page=2&size=20        # Offset-based (avoid for large data)

# Field selection
GET /users?fields=id,name,email
GET /users/123?include=posts,comments

# Search
GET /users?q=john
GET /posts?search=typescript
```

---

## HTTP Methods

### Method Semantics

| Method | Purpose | Idempotent | Safe | Has Body |
|--------|---------|------------|------|----------|
| GET | Read | Yes | Yes | No |
| POST | Create | No | No | Yes |
| PUT | Replace | Yes | No | Yes |
| PATCH | Update | Yes | No | Yes |
| DELETE | Remove | Yes | No | No |

### PUT vs PATCH

```typescript
// PUT - Replace entire resource
PUT /users/123
{
  "name": "John",
  "email": "john@example.com",
  "role": "admin"  // Must send ALL fields
}

// PATCH - Partial update
PATCH /users/123
{
  "name": "John"   // Only send changed fields
}
```

### When to Use POST for Actions

Some operations don't fit CRUD. Use POST with action noun:

```
POST /orders/123/cancel          # Cancel order
POST /users/123/verify-email     # Trigger verification
POST /reports/generate           # Generate report
POST /payments/123/refund        # Process refund
```

---

## Status Codes

### Success (2xx)

| Code | When to Use | Response Body |
|------|-------------|---------------|
| 200 OK | Success with data | `{ data: ... }` |
| 201 Created | Resource created | `{ data: newResource }` |
| 204 No Content | Success, no body | None |

### Client Errors (4xx)

| Code | When to Use | Error Code |
|------|-------------|------------|
| 400 Bad Request | Malformed request | `bad_request` |
| 401 Unauthorized | Not authenticated | `unauthorized` |
| 403 Forbidden | Not authorized | `forbidden` |
| 404 Not Found | Resource doesn't exist | `not_found` |
| 405 Method Not Allowed | Wrong HTTP method | `method_not_allowed` |
| 409 Conflict | State conflict | `conflict` |
| 422 Unprocessable | Validation failed | `validation_error` |
| 429 Too Many Requests | Rate limited | `rate_limited` |

### Server Errors (5xx)

| Code | When to Use | Error Code |
|------|-------------|------------|
| 500 Internal Error | Unexpected error | `internal_error` |
| 502 Bad Gateway | Upstream failed | `bad_gateway` |
| 503 Service Unavailable | Temporarily down | `service_unavailable` |
| 504 Gateway Timeout | Upstream timeout | `gateway_timeout` |

---

## Response Formats

### Single Resource

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "user",
    "attributes": {
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

Or simplified:

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### List Response

```json
{
  "data": [
    { "id": "1", "name": "Alice" },
    { "id": "2", "name": "Bob" }
  ],
  "pagination": {
    "hasMore": true,
    "nextCursor": "eyJpZCI6Mn0",
    "total": 150
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid input provided",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      },
      {
        "field": "age",
        "message": "Must be at least 18"
      }
    ],
    "requestId": "req_abc123"
  }
}
```

---

## Pagination

### Cursor-Based (Recommended)

```typescript
// Request
GET /users?limit=20&cursor=eyJpZCI6MTAwfQ

// Response
{
  "data": [...],
  "pagination": {
    "hasMore": true,
    "nextCursor": "eyJpZCI6MTIwfQ",
    "prevCursor": "eyJpZCI6ODB9"
  }
}
```

**Pros:** Stable with real-time data, efficient for large datasets

### Offset-Based

```typescript
// Request
GET /users?page=3&size=20

// Response
{
  "data": [...],
  "pagination": {
    "page": 3,
    "size": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Cons:** Inconsistent with real-time data, slow for large offsets

### Implementation

```typescript
// Cursor-based pagination
interface PaginationParams {
  limit: number
  cursor?: string
}

interface PaginatedResult<T> {
  data: T[]
  pagination: {
    hasMore: boolean
    nextCursor: string | null
  }
}

async function listUsers(params: PaginationParams): Promise<PaginatedResult<User>> {
  const { limit, cursor } = params

  // Decode cursor to get last ID
  const afterId = cursor ? decodeCursor(cursor) : null

  // Fetch one extra to check hasMore
  const users = await db.users
    .where(afterId ? { id: { gt: afterId } } : {})
    .orderBy('id')
    .limit(limit + 1)

  const hasMore = users.length > limit
  const data = hasMore ? users.slice(0, -1) : users

  return {
    data,
    pagination: {
      hasMore,
      nextCursor: hasMore ? encodeCursor(data[data.length - 1].id) : null,
    },
  }
}
```

---

## Filtering

### Simple Filters

```
GET /users?status=active
GET /users?role=admin
GET /posts?published=true
```

### Comparison Operators

```
GET /users?age[gte]=18
GET /users?createdAt[lt]=2024-01-01
GET /products?price[between]=10,50
```

### Array Filters

```
GET /users?status[in]=active,pending
GET /posts?tags[contains]=typescript
```

### Implementation

```typescript
// Parse filter params
function parseFilters(query: Record<string, string>) {
  const filters: Filter[] = []

  for (const [key, value] of Object.entries(query)) {
    // Check for operator syntax: field[op]=value
    const match = key.match(/^(\w+)\[(\w+)\]$/)

    if (match) {
      const [, field, op] = match
      filters.push({ field, op, value })
    } else {
      // Simple equality
      filters.push({ field: key, op: 'eq', value })
    }
  }

  return filters
}
```

---

## Error Handling

### Standard Error Structure

```typescript
interface APIError {
  error: {
    code: string           // Machine-readable
    message: string        // Human-readable
    details?: {            // Field-level errors
      field: string
      message: string
      code?: string
    }[]
    requestId?: string     // For debugging
    docs?: string          // Link to documentation
  }
}
```

### Common Error Codes

```typescript
const ERROR_CODES = {
  // Validation
  validation_error: 'One or more fields are invalid',
  missing_field: 'Required field is missing',
  invalid_format: 'Field format is invalid',

  // Authentication
  unauthorized: 'Authentication required',
  invalid_token: 'Token is invalid or expired',

  // Authorization
  forbidden: 'You do not have permission',
  insufficient_scope: 'Token lacks required scope',

  // Resources
  not_found: 'Resource not found',
  already_exists: 'Resource already exists',
  conflict: 'Resource state conflict',

  // Rate limiting
  rate_limited: 'Too many requests',

  // Server
  internal_error: 'An unexpected error occurred',
  service_unavailable: 'Service temporarily unavailable',
} as const
```

### Error Middleware

```typescript
import { HTTPException } from 'hono/http-exception'

// Custom error class
class APIException extends HTTPException {
  constructor(
    status: number,
    public code: string,
    message: string,
    public details?: { field: string; message: string }[]
  ) {
    super(status, { message })
  }
}

// Error handler middleware
app.onError((err, c) => {
  if (err instanceof APIException) {
    return c.json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        requestId: c.get('requestId'),
      },
    }, err.status)
  }

  // Log unexpected errors
  console.error(err)

  return c.json({
    error: {
      code: 'internal_error',
      message: 'An unexpected error occurred',
      requestId: c.get('requestId'),
    },
  }, 500)
})
```

---

## Authentication

### Bearer Token (JWT)

```typescript
// Request
GET /users
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

// Middleware
import { jwt } from 'hono/jwt'

app.use('/api/*', jwt({ secret: process.env.JWT_SECRET }))
```

### API Key

```typescript
// Request
GET /users
X-API-Key: sk_live_abc123

// Middleware
app.use('/api/*', async (c, next) => {
  const apiKey = c.req.header('X-API-Key')

  if (!apiKey) {
    return c.json({ error: { code: 'unauthorized', message: 'API key required' } }, 401)
  }

  const client = await validateApiKey(apiKey)

  if (!client) {
    return c.json({ error: { code: 'unauthorized', message: 'Invalid API key' } }, 401)
  }

  c.set('client', client)
  await next()
})
```

---

## Rate Limiting

### Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705312800
Retry-After: 60
```

### Implementation

```typescript
import { rateLimiter } from 'hono-rate-limiter'

// Simple rate limiter
app.use(rateLimiter({
  windowMs: 60 * 1000,  // 1 minute
  limit: 100,           // 100 requests per minute
  keyGenerator: (c) => c.req.header('X-API-Key') || c.req.ip,
}))

// Custom response
app.use(rateLimiter({
  windowMs: 60 * 1000,
  limit: 100,
  handler: (c) => {
    return c.json({
      error: {
        code: 'rate_limited',
        message: 'Too many requests. Please slow down.',
      },
    }, 429)
  },
}))
```

---

## Caching

### Cache Headers

```typescript
// Cache for 1 hour
c.header('Cache-Control', 'public, max-age=3600')

// No cache
c.header('Cache-Control', 'no-store')

// ETag for conditional requests
c.header('ETag', '"abc123"')
```

### Conditional Requests

```typescript
app.get('/users/:id', async (c) => {
  const user = await getUser(c.req.param('id'))
  const etag = computeETag(user)

  // Check If-None-Match
  if (c.req.header('If-None-Match') === etag) {
    return c.body(null, 304)  // Not Modified
  }

  c.header('ETag', etag)
  return c.json({ data: user })
})
```

---

## Batch Operations

### Bulk Create

```typescript
POST /users/batch
{
  "items": [
    { "name": "Alice", "email": "alice@example.com" },
    { "name": "Bob", "email": "bob@example.com" }
  ]
}

// Response
{
  "data": [
    { "id": "1", "name": "Alice", ... },
    { "id": "2", "name": "Bob", ... }
  ],
  "errors": []  // Or partial errors
}
```

### Bulk Update

```typescript
PATCH /users/batch
{
  "items": [
    { "id": "1", "name": "Alice Updated" },
    { "id": "2", "name": "Bob Updated" }
  ]
}
```

### Bulk Delete

```typescript
DELETE /users/batch
{
  "ids": ["1", "2", "3"]
}
```

---

## Webhooks

### Webhook Payload

```json
{
  "id": "evt_abc123",
  "type": "user.created",
  "created": "2024-01-15T10:30:00Z",
  "data": {
    "id": "usr_123",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Webhook Signature

```typescript
// Signing
const payload = JSON.stringify(event)
const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(payload)
  .digest('hex')

// Headers
'X-Webhook-Signature': `sha256=${signature}`
'X-Webhook-Timestamp': timestamp

// Verification
function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(`sha256=${expected}`)
  )
}
```

---

## Common Anti-Patterns

### Avoid These

| Anti-Pattern | Problem | Better Approach |
|--------------|---------|-----------------|
| `GET /getUser` | Verb in URL | `GET /users/:id` |
| `POST /users/delete` | Wrong method | `DELETE /users/:id` |
| `200` for errors | Misleading | Use proper status codes |
| `500` for validation | Wrong category | Use `400` or `422` |
| Different error formats | Inconsistent | Single error structure |
| Unbounded lists | Performance | Always paginate |
| Nested 5+ levels | Complex URLs | Flatten or use IDs |
| `null` for not found | Ambiguous | Use `404` status |

---

## Security Checklist

- [ ] All endpoints require authentication (except public)
- [ ] Authorization checks on all resource access
- [ ] Input validation on all endpoints
- [ ] Rate limiting enabled
- [ ] CORS configured properly
- [ ] No sensitive data in URLs
- [ ] HTTPS only in production
- [ ] Audit logging for sensitive operations
- [ ] Request ID for tracing
- [ ] No stack traces in production errors
