---
name: APIDesign
description: Design consistent, well-documented REST APIs. USE WHEN user says 'design API', 'create endpoint', 'document API', 'API versioning', 'REST design', OR user wants to build web service endpoints with proper conventions.
---

# APIDesign

Design consistent, well-documented REST APIs with proper conventions, error handling, and documentation.

## Core Principles

1. **Resources, not actions** - URLs represent things, not operations
2. **HTTP methods convey intent** - GET reads, POST creates, PUT/PATCH updates, DELETE removes
3. **Consistent error format** - Same structure for all errors
4. **Document everything** - OpenAPI specs, examples, edge cases
5. **Version from day one** - Plan for change

## Workflow Routing

**When executing a workflow, output this notification:**

```
Running the **WorkflowName** workflow from the **APIDesign** skill...
```

| Workflow | Trigger | File |
|----------|---------|------|
| **DesignEndpoint** | "design endpoint", "create API", "add route", "new endpoint" | `workflows/DesignEndpoint.md` |
| **DocumentAPI** | "document API", "generate OpenAPI", "swagger spec", "API docs" | `workflows/DocumentAPI.md` |
| **ValidateContract** | "validate API", "check breaking changes", "API review", "lint API" | `workflows/ValidateContract.md` |
| **VersionAPI** | "version API", "API versioning", "breaking change", "deprecate endpoint" | `workflows/VersionAPI.md` |

## Examples

**Example 1: Design a new endpoint**
```
User: "I need an API to manage user bookmarks"
→ Invokes DesignEndpoint workflow
→ Defines resources: /users/:userId/bookmarks
→ Specifies CRUD operations with request/response schemas
→ Includes error cases and status codes
→ Outputs Hono route implementation
```

**Example 2: Document existing API**
```
User: "Generate OpenAPI spec for our API"
→ Invokes DocumentAPI workflow
→ Scans route definitions
→ Extracts types and schemas
→ Generates openapi.yaml with examples
```

**Example 3: Check for breaking changes**
```
User: "Is this change backwards compatible?"
→ Invokes ValidateContract workflow
→ Compares old vs new contract
→ Identifies breaking vs non-breaking changes
→ Suggests migration strategy if needed
```

## Quick Reference

### HTTP Methods

| Method | Purpose | Idempotent | Safe |
|--------|---------|------------|------|
| GET | Read resource(s) | Yes | Yes |
| POST | Create resource | No | No |
| PUT | Replace resource | Yes | No |
| PATCH | Partial update | Yes | No |
| DELETE | Remove resource | Yes | No |

### Status Codes

| Code | When to Use |
|------|-------------|
| 200 | Success with body |
| 201 | Created (return new resource) |
| 204 | Success, no body (DELETE) |
| 400 | Bad request (validation failed) |
| 401 | Not authenticated |
| 403 | Not authorized |
| 404 | Resource not found |
| 409 | Conflict (duplicate, state mismatch) |
| 422 | Unprocessable (semantic error) |
| 429 | Rate limited |
| 500 | Server error |

### URL Patterns

```
GET    /resources          # List all
GET    /resources/:id      # Get one
POST   /resources          # Create
PUT    /resources/:id      # Replace
PATCH  /resources/:id      # Partial update
DELETE /resources/:id      # Delete

# Nested resources
GET    /users/:userId/posts           # User's posts
POST   /users/:userId/posts           # Create post for user
GET    /users/:userId/posts/:postId   # Specific post

# Actions (when REST doesn't fit)
POST   /orders/:id/cancel             # RPC-style action
POST   /emails/:id/send               # Trigger operation
```

## Reference

See `APIPatterns.md` for detailed patterns, error formats, and examples.
