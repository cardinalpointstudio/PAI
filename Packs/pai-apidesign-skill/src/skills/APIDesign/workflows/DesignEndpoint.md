# DesignEndpoint Workflow

Design a new API endpoint with proper REST conventions, request/response schemas, and error handling.

## When to Use

- Adding a new feature that needs API endpoints
- Creating CRUD operations for a resource
- Designing nested resource relationships
- Adding action endpoints (RPC-style)

---

## Step 1: Identify the Resource

What "thing" does this endpoint manage?

```markdown
## Resource Definition

**Resource:** Bookmark
**Description:** User-saved links to content
**Parent Resource:** User (bookmarks belong to users)
**Attributes:**
- id (string, uuid)
- url (string, required)
- title (string, optional)
- createdAt (datetime)
- updatedAt (datetime)
```

---

## Step 2: Define URL Structure

Follow REST conventions:

```markdown
## URL Design

**Base path:** /api/v1

| Operation | Method | Path | Description |
|-----------|--------|------|-------------|
| List | GET | /users/:userId/bookmarks | Get user's bookmarks |
| Get | GET | /users/:userId/bookmarks/:id | Get specific bookmark |
| Create | POST | /users/:userId/bookmarks | Create bookmark |
| Update | PATCH | /users/:userId/bookmarks/:id | Update bookmark |
| Delete | DELETE | /users/:userId/bookmarks/:id | Delete bookmark |
```

### URL Guidelines

- Use plural nouns: `/bookmarks` not `/bookmark`
- Use kebab-case: `/user-profiles` not `/userProfiles`
- Nest max 2 levels: `/users/:id/bookmarks` not `/users/:id/folders/:id/bookmarks`
- Use query params for filtering: `?status=active&sort=-createdAt`

---

## Step 3: Define Request Schemas

### Create Request

```typescript
// POST /users/:userId/bookmarks
interface CreateBookmarkRequest {
	url: string       // Required, valid URL
	title?: string    // Optional, max 200 chars
	tags?: string[]   // Optional, max 10 tags
}
```

### Update Request

```typescript
// PATCH /users/:userId/bookmarks/:id
interface UpdateBookmarkRequest {
	url?: string      // Optional, valid URL if provided
	title?: string    // Optional, max 200 chars
	tags?: string[]   // Optional, replaces existing tags
}
```

### Query Parameters

```typescript
// GET /users/:userId/bookmarks
interface ListBookmarksQuery {
	limit?: number    // Default: 20, max: 100
	cursor?: string   // Pagination cursor
	sort?: string     // Field to sort by, prefix - for desc
	tag?: string      // Filter by tag
}
```

---

## Step 4: Define Response Schemas

### Single Resource

```typescript
interface BookmarkResponse {
	id: string
	url: string
	title: string | null
	tags: string[]
	createdAt: string  // ISO 8601
	updatedAt: string  // ISO 8601
}
```

### List Response (with pagination)

```typescript
interface ListBookmarksResponse {
	data: BookmarkResponse[]
	pagination: {
		hasMore: boolean
		nextCursor: string | null
		total?: number  // Optional, expensive to compute
	}
}
```

### Success Responses

| Operation | Status | Response Body |
|-----------|--------|---------------|
| List | 200 | `{ data: [...], pagination: {...} }` |
| Get | 200 | `{ data: {...} }` |
| Create | 201 | `{ data: {...} }` |
| Update | 200 | `{ data: {...} }` |
| Delete | 204 | No body |

---

## Step 5: Define Error Responses

### Standard Error Format

```typescript
interface ErrorResponse {
	error: {
		code: string           // Machine-readable code
		message: string        // Human-readable message
		details?: {            // Field-level errors
			field: string
			message: string
		}[]
	}
}
```

### Error Cases

| Scenario | Status | Code | Message |
|----------|--------|------|---------|
| URL missing | 400 | `validation_error` | "URL is required" |
| Invalid URL | 400 | `validation_error` | "URL must be a valid URL" |
| Not authenticated | 401 | `unauthorized` | "Authentication required" |
| Not owner | 403 | `forbidden` | "You don't have access to this resource" |
| Bookmark not found | 404 | `not_found` | "Bookmark not found" |
| Duplicate URL | 409 | `conflict` | "Bookmark with this URL already exists" |
| Rate limited | 429 | `rate_limited` | "Too many requests" |

---

## Step 6: Implement with Hono

```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const bookmarks = new Hono()

// Schemas
const createBookmarkSchema = z.object({
	url: z.string().url(),
	title: z.string().max(200).optional(),
	tags: z.array(z.string()).max(10).optional(),
})

const updateBookmarkSchema = z.object({
	url: z.string().url().optional(),
	title: z.string().max(200).optional(),
	tags: z.array(z.string()).max(10).optional(),
})

const listQuerySchema = z.object({
	limit: z.coerce.number().min(1).max(100).default(20),
	cursor: z.string().optional(),
	sort: z.string().optional(),
	tag: z.string().optional(),
})

// Routes
bookmarks.get('/', zValidator('query', listQuerySchema), async (c) => {
	const userId = c.req.param('userId')
	const query = c.req.valid('query')

	const result = await listBookmarks(userId, query)

	return c.json({
		data: result.bookmarks,
		pagination: {
			hasMore: result.hasMore,
			nextCursor: result.nextCursor,
		},
	})
})

bookmarks.get('/:id', async (c) => {
	const userId = c.req.param('userId')
	const id = c.req.param('id')

	const bookmark = await getBookmark(userId, id)

	if (!bookmark) {
		return c.json(
			{ error: { code: 'not_found', message: 'Bookmark not found' } },
			404
		)
	}

	return c.json({ data: bookmark })
})

bookmarks.post('/', zValidator('json', createBookmarkSchema), async (c) => {
	const userId = c.req.param('userId')
	const body = c.req.valid('json')

	const bookmark = await createBookmark(userId, body)

	return c.json({ data: bookmark }, 201)
})

bookmarks.patch('/:id', zValidator('json', updateBookmarkSchema), async (c) => {
	const userId = c.req.param('userId')
	const id = c.req.param('id')
	const body = c.req.valid('json')

	const bookmark = await updateBookmark(userId, id, body)

	if (!bookmark) {
		return c.json(
			{ error: { code: 'not_found', message: 'Bookmark not found' } },
			404
		)
	}

	return c.json({ data: bookmark })
})

bookmarks.delete('/:id', async (c) => {
	const userId = c.req.param('userId')
	const id = c.req.param('id')

	const deleted = await deleteBookmark(userId, id)

	if (!deleted) {
		return c.json(
			{ error: { code: 'not_found', message: 'Bookmark not found' } },
			404
		)
	}

	return c.body(null, 204)
})

export { bookmarks }
```

---

## Step 7: Mount Routes

```typescript
// src/server/index.ts
import { Hono } from 'hono'
import { bookmarks } from './routes/bookmarks'

const app = new Hono()

// Mount with user context
app.route('/api/v1/users/:userId/bookmarks', bookmarks)

export default app
```

---

## Step 8: Document in OpenAPI

```yaml
paths:
  /users/{userId}/bookmarks:
    get:
      summary: List user bookmarks
      parameters:
        - name: userId
          in: path
          required: true
          schema:
            type: string
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
        - name: cursor
          in: query
          schema:
            type: string
      responses:
        '200':
          description: List of bookmarks
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ListBookmarksResponse'
```

---

## Output Checklist

- [ ] Resource clearly identified
- [ ] URL follows REST conventions
- [ ] Request schemas defined with validation
- [ ] Response schemas defined
- [ ] All error cases documented
- [ ] Status codes are appropriate
- [ ] Implementation matches design
- [ ] OpenAPI spec updated
