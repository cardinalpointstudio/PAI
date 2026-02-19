---
name: PAI APIDesign Skill
pack-id: pai-apidesign-skill-v1.0.0
version: 1.0.0
author: salexanderb
description: Design consistent, well-documented REST APIs with proper conventions, error handling, versioning, and OpenAPI documentation.
type: skill
purpose-type: [api-design, rest, documentation, versioning]
platform: claude-code
dependencies: []
keywords: [api, rest, endpoint, openapi, swagger, documentation, versioning, http]
---

# PAI APIDesign Skill

> Design consistent, well-documented REST APIs with proper conventions, error handling, and documentation.

> **Installation:** This pack is designed for AI-assisted installation. Give this directory to your AI and ask it to install using `INSTALL.md`.

---

## What This Pack Provides

- **Endpoint Design** - Design REST endpoints with proper conventions
- **OpenAPI Documentation** - Generate comprehensive API specs
- **Contract Validation** - Check for breaking changes and consistency
- **API Versioning** - Manage versions, deprecation, and migrations

## Core Principles

1. **Resources, not actions** - URLs represent things, not operations
2. **HTTP methods convey intent** - GET reads, POST creates, PUT/PATCH updates, DELETE removes
3. **Consistent error format** - Same structure for all errors
4. **Document everything** - OpenAPI specs, examples, edge cases
5. **Version from day one** - Plan for change

## Architecture

```
APIDesign Skill
├── SKILL.md                     # Main entry point and routing
├── APIPatterns.md               # Comprehensive patterns reference
└── workflows/
    ├── DesignEndpoint.md        # Design new API endpoints
    ├── DocumentAPI.md           # Generate OpenAPI specs
    ├── ValidateContract.md      # Check consistency and breaking changes
    └── VersionAPI.md            # Handle API versioning
```

## Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **DesignEndpoint** | "design endpoint", "create API", "add route" | Design REST endpoints with schemas |
| **DocumentAPI** | "document API", "generate OpenAPI", "swagger spec" | Generate OpenAPI documentation |
| **ValidateContract** | "validate API", "check breaking changes" | Review API for issues |
| **VersionAPI** | "version API", "deprecate endpoint" | Manage API versions |

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

# Actions (when REST doesn't fit)
POST   /orders/:id/cancel             # RPC-style action
```

## Usage Examples

```
"I need an API to manage user bookmarks"
→ Invokes DesignEndpoint workflow
→ Defines resources: /users/:userId/bookmarks
→ Specifies CRUD operations with request/response schemas
→ Includes error cases and status codes
→ Outputs Hono route implementation

"Generate OpenAPI spec for our API"
→ Invokes DocumentAPI workflow
→ Scans route definitions
→ Extracts types and schemas
→ Generates openapi.yaml with examples

"Is this change backwards compatible?"
→ Invokes ValidateContract workflow
→ Compares old vs new contract
→ Identifies breaking vs non-breaking changes
→ Suggests migration strategy if needed
```

## What's Included

| Component | File | Purpose |
|-----------|------|---------|
| Main Skill | src/skills/APIDesign/SKILL.md | Entry point and routing |
| Patterns Reference | src/skills/APIDesign/APIPatterns.md | URL design, status codes, errors |
| DesignEndpoint | src/skills/APIDesign/workflows/DesignEndpoint.md | Design new endpoints |
| DocumentAPI | src/skills/APIDesign/workflows/DocumentAPI.md | Generate OpenAPI specs |
| ValidateContract | src/skills/APIDesign/workflows/ValidateContract.md | Validate consistency |
| VersionAPI | src/skills/APIDesign/workflows/VersionAPI.md | Handle versioning |

## Integration

**Works well with:**
- **TDD** - Write API tests before implementation
- **ProjectScaffold** - New projects include API setup
- **CodeAudit** - Audit API code for issues

## Model Interoperability

This skill is workflow-based with no CLI tools. Any model can:
1. Read the workflow files
2. Follow the step-by-step instructions
3. Apply API design patterns

The workflows are deterministic procedures that any model can execute.

## Credits

- **Author:** salexanderb
- **License:** MIT

## Changelog

### 1.0.0 - 2026-02-19
- Initial release
- DesignEndpoint workflow
- DocumentAPI workflow
- ValidateContract workflow
- VersionAPI workflow
- APIPatterns reference
