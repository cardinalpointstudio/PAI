# ValidateContract Workflow

Validate API design for consistency, REST conventions, and breaking changes.

## When to Use

- Before merging API changes
- Reviewing pull requests that modify endpoints
- Auditing existing API for issues
- Checking if changes are backwards compatible

---

## Step 1: Check REST Conventions

### URL Structure

| Rule | Good | Bad |
|------|------|-----|
| Plural nouns | `/users` | `/user` |
| Lowercase | `/user-profiles` | `/userProfiles` |
| No verbs | `/users/:id` | `/getUser/:id` |
| No trailing slash | `/users` | `/users/` |
| Max 2 nesting levels | `/users/:id/posts` | `/users/:id/posts/:id/comments` |

### HTTP Methods

| Rule | Good | Bad |
|------|------|-----|
| GET for reading | `GET /users` | `POST /users/list` |
| POST for creating | `POST /users` | `PUT /users` |
| PUT/PATCH for updating | `PATCH /users/:id` | `POST /users/:id/update` |
| DELETE for removing | `DELETE /users/:id` | `POST /users/:id/delete` |

### Status Codes

| Rule | Good | Bad |
|------|------|-----|
| 200 for success with body | `200 { data: ... }` | `200 "OK"` |
| 201 for created | `201 { data: newResource }` | `200 { data: newResource }` |
| 204 for no content | `DELETE → 204` | `DELETE → 200 {}` |
| 400 for bad input | `400 { error: ... }` | `500 for validation` |
| 404 for not found | `404 { error: ... }` | `200 { data: null }` |

---

## Step 2: Check Consistency

### Naming Consistency

```markdown
## Naming Audit

Check that similar concepts use the same names:

| Concept | Endpoints Using | Consistent? |
|---------|-----------------|-------------|
| User ID | userId, user_id, uid | ❌ Pick one |
| Timestamp | createdAt, created_at, timestamp | ❌ Pick one |
| Pagination | cursor/limit, page/size, offset/count | ❌ Pick one |
```

### Response Structure Consistency

All endpoints should follow the same envelope:

```typescript
// ✅ Consistent
{ data: Resource }           // Single resource
{ data: Resource[] }         // List (no pagination)
{ data: Resource[], pagination: { ... } }  // List with pagination
{ error: { code, message } } // Error

// ❌ Inconsistent
{ user: Resource }           // Different wrapper
{ users: Resource[] }        // Different wrapper
{ items: Resource[] }        // Different wrapper
{ message: "error" }         // Different error format
```

### Error Format Consistency

All errors should use the same structure:

```typescript
// ✅ Consistent
{
  error: {
    code: "validation_error",
    message: "Email is required",
    details: [{ field: "email", message: "Required" }]
  }
}

// ❌ Inconsistent
{ error: "Email is required" }
{ message: "Email is required" }
{ errors: ["Email is required"] }
```

---

## Step 3: Identify Breaking Changes

### What Breaks Clients

| Change Type | Breaking? | Example |
|-------------|-----------|---------|
| Remove endpoint | ✅ Yes | Delete `GET /users/:id` |
| Remove field | ✅ Yes | Remove `user.email` from response |
| Rename field | ✅ Yes | `email` → `emailAddress` |
| Change field type | ✅ Yes | `id: number` → `id: string` |
| Make optional required | ✅ Yes | `name?` → `name` in request |
| Change URL path | ✅ Yes | `/users` → `/accounts` |
| Change status code | ✅ Yes | `200` → `201` for create |

### What's Safe

| Change Type | Breaking? | Example |
|-------------|-----------|---------|
| Add endpoint | ❌ No | Add `GET /users/:id/settings` |
| Add optional field | ❌ No | Add `nickname?` to response |
| Add optional param | ❌ No | Add `?include=posts` query param |
| Make required optional | ❌ No | `name` → `name?` in request |
| Add new enum value | ⚠️ Maybe | Add `status: "archived"` |
| Widen type | ⚠️ Maybe | `id: number` → `id: number \| string` |

---

## Step 4: Compare Versions

### Manual Diff

```bash
# Compare OpenAPI specs
diff old-openapi.yaml new-openapi.yaml

# Or use a tool
bunx openapi-diff old-openapi.yaml new-openapi.yaml
```

### Breaking Change Report

```markdown
## Breaking Change Analysis

**Comparing:** v1.2.0 → v1.3.0

### ❌ Breaking Changes

1. **Removed endpoint**
   - `DELETE /users/:id/avatar`
   - Impact: Clients using avatar deletion will fail
   - Migration: Use `PATCH /users/:id` with `avatar: null`

2. **Renamed field**
   - `user.email` → `user.emailAddress`
   - Impact: All clients reading email will break
   - Migration: Add alias period, then remove

### ⚠️ Potentially Breaking

1. **New enum value**
   - `status` now includes `"archived"`
   - Impact: Clients with exhaustive switch may fail
   - Migration: Document new value, clients should handle unknown

### ✅ Non-Breaking Changes

1. Added `GET /users/:id/preferences`
2. Added optional `timezone` field to user response
3. Added `?includeDeleted` query parameter
```

---

## Step 5: Security Review

### Authentication

- [ ] All endpoints require authentication (except public ones)
- [ ] Authentication method documented
- [ ] Token format specified (JWT, API key, etc.)

### Authorization

- [ ] Resource ownership enforced (`/users/:id` only accessible by that user or admin)
- [ ] Role-based access documented
- [ ] No horizontal privilege escalation possible

### Input Validation

- [ ] All inputs validated (length, format, range)
- [ ] SQL injection prevented (parameterized queries)
- [ ] No sensitive data in URLs (tokens, passwords)

### Rate Limiting

- [ ] Rate limits defined per endpoint
- [ ] `429` response documented
- [ ] `Retry-After` header included

---

## Step 6: Performance Review

### Pagination

- [ ] List endpoints support pagination
- [ ] Default limit is reasonable (20-50)
- [ ] Maximum limit is capped (100)
- [ ] Cursor-based for large datasets

### Response Size

- [ ] No unbounded arrays
- [ ] Expensive fields are optional (`?include=`)
- [ ] Sparse fieldsets supported (`?fields=id,name`)

### N+1 Prevention

- [ ] Related resources can be included in single request
- [ ] Batch endpoints exist for bulk operations

---

## Step 7: Generate Report

```markdown
# API Contract Validation Report

**API:** My Service API
**Version:** 1.3.0
**Date:** 2024-01-15

## Summary

| Category | Status | Issues |
|----------|--------|--------|
| REST Conventions | ⚠️ | 2 warnings |
| Consistency | ✅ | 0 issues |
| Breaking Changes | ❌ | 1 breaking |
| Security | ✅ | 0 issues |
| Performance | ⚠️ | 1 warning |

## Issues

### Critical

1. **Breaking: Field renamed without deprecation**
   - Location: `GET /users/:id` response
   - Issue: `email` renamed to `emailAddress`
   - Recommendation: Add deprecation period with both fields

### Warnings

1. **REST: Verb in URL**
   - Location: `POST /users/:id/activate`
   - Issue: Action endpoint uses verb
   - Recommendation: Consider `PATCH /users/:id` with `status: "active"`

2. **Performance: Missing pagination**
   - Location: `GET /users/:id/notifications`
   - Issue: Could return unbounded results
   - Recommendation: Add cursor pagination

## Recommendations

1. Add deprecation period for renamed fields
2. Document rate limits for all endpoints
3. Add OpenAPI validation to CI pipeline
```

---

## Output Checklist

- [ ] REST conventions checked
- [ ] Naming consistency verified
- [ ] Response format consistency verified
- [ ] Breaking changes identified
- [ ] Security review completed
- [ ] Performance review completed
- [ ] Report generated
- [ ] Recommendations documented
