# DocumentAPI Workflow

Generate OpenAPI/Swagger documentation from existing code or design specifications.

## When to Use

- API exists but lacks documentation
- Need to generate client SDKs
- Setting up API explorer/playground
- Creating API reference for developers

---

## Step 1: Inventory Existing Endpoints

Scan the codebase for route definitions:

```bash
# Find Hono routes
grep -r "app\.\(get\|post\|put\|patch\|delete\)" src/server/

# Find route files
find src/server -name "*.ts" -path "*/routes/*"
```

Document what exists:

```markdown
## Existing Endpoints

| Method | Path | Handler | File |
|--------|------|---------|------|
| GET | /api/v1/users | listUsers | src/server/routes/users.ts:15 |
| GET | /api/v1/users/:id | getUser | src/server/routes/users.ts:28 |
| POST | /api/v1/users | createUser | src/server/routes/users.ts:42 |
| ... | ... | ... | ... |
```

---

## Step 2: Extract Type Definitions

Find request/response types:

```bash
# Find interfaces and types
grep -r "interface.*Request\|interface.*Response\|type.*Request\|type.*Response" src/

# Find Zod schemas
grep -r "z\.object" src/server/
```

Map types to endpoints:

```markdown
## Type Mappings

| Endpoint | Request Type | Response Type |
|----------|--------------|---------------|
| POST /users | CreateUserRequest | UserResponse |
| PATCH /users/:id | UpdateUserRequest | UserResponse |
| GET /users | - | ListUsersResponse |
```

---

## Step 3: Create OpenAPI Base

```yaml
# openapi.yaml
openapi: 3.1.0
info:
  title: My API
  description: API for managing resources
  version: 1.0.0
  contact:
    email: api@example.com

servers:
  - url: http://localhost:3000/api/v1
    description: Development
  - url: https://api.example.com/v1
    description: Production

tags:
  - name: Users
    description: User management
  - name: Bookmarks
    description: User bookmarks

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - bearerAuth: []
```

---

## Step 4: Document Each Endpoint

### Template

```yaml
paths:
  /resource:
    get:
      tags:
        - ResourceTag
      summary: Short description (< 50 chars)
      description: |
        Longer description with details.
        Can include markdown.
      operationId: listResources
      parameters:
        - name: limit
          in: query
          description: Maximum items to return
          required: false
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ListResourcesResponse'
              example:
                data:
                  - id: "abc123"
                    name: "Example"
                pagination:
                  hasMore: true
                  nextCursor: "xyz789"
        '401':
          $ref: '#/components/responses/Unauthorized'
        '500':
          $ref: '#/components/responses/InternalError'
```

---

## Step 5: Define Reusable Components

### Schemas

```yaml
components:
  schemas:
    # Base types
    Timestamp:
      type: string
      format: date-time
      example: "2024-01-15T10:30:00Z"

    UUID:
      type: string
      format: uuid
      example: "550e8400-e29b-41d4-a716-446655440000"

    # Pagination
    PaginationMeta:
      type: object
      properties:
        hasMore:
          type: boolean
        nextCursor:
          type: string
          nullable: true
        total:
          type: integer
          description: Total count (optional)

    # Error format
    Error:
      type: object
      required:
        - error
      properties:
        error:
          type: object
          required:
            - code
            - message
          properties:
            code:
              type: string
              example: "validation_error"
            message:
              type: string
              example: "Invalid input"
            details:
              type: array
              items:
                type: object
                properties:
                  field:
                    type: string
                  message:
                    type: string

    # Domain models
    User:
      type: object
      required:
        - id
        - email
        - createdAt
      properties:
        id:
          $ref: '#/components/schemas/UUID'
        email:
          type: string
          format: email
        name:
          type: string
          nullable: true
        createdAt:
          $ref: '#/components/schemas/Timestamp'
        updatedAt:
          $ref: '#/components/schemas/Timestamp'

    CreateUserRequest:
      type: object
      required:
        - email
      properties:
        email:
          type: string
          format: email
        name:
          type: string
          maxLength: 100

    UserResponse:
      type: object
      properties:
        data:
          $ref: '#/components/schemas/User'

    ListUsersResponse:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/User'
        pagination:
          $ref: '#/components/schemas/PaginationMeta'
```

### Reusable Responses

```yaml
components:
  responses:
    Unauthorized:
      description: Authentication required
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error:
              code: "unauthorized"
              message: "Authentication required"

    Forbidden:
      description: Insufficient permissions
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error:
              code: "forbidden"
              message: "You don't have access to this resource"

    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error:
              code: "not_found"
              message: "Resource not found"

    ValidationError:
      description: Invalid input
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error:
              code: "validation_error"
              message: "Invalid input"
              details:
                - field: "email"
                  message: "Must be a valid email"

    InternalError:
      description: Server error
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error:
              code: "internal_error"
              message: "An unexpected error occurred"
```

### Reusable Parameters

```yaml
components:
  parameters:
    PathId:
      name: id
      in: path
      required: true
      description: Resource ID
      schema:
        $ref: '#/components/schemas/UUID'

    QueryLimit:
      name: limit
      in: query
      description: Maximum items to return
      schema:
        type: integer
        minimum: 1
        maximum: 100
        default: 20

    QueryCursor:
      name: cursor
      in: query
      description: Pagination cursor
      schema:
        type: string

    QuerySort:
      name: sort
      in: query
      description: Sort field (prefix with - for descending)
      schema:
        type: string
        example: "-createdAt"
```

---

## Step 6: Add Examples

Good examples make APIs easier to understand:

```yaml
paths:
  /users:
    post:
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
            examples:
              basic:
                summary: Basic user
                value:
                  email: "user@example.com"
              withName:
                summary: User with name
                value:
                  email: "user@example.com"
                  name: "John Doe"
      responses:
        '201':
          content:
            application/json:
              examples:
                created:
                  value:
                    data:
                      id: "550e8400-e29b-41d4-a716-446655440000"
                      email: "user@example.com"
                      name: "John Doe"
                      createdAt: "2024-01-15T10:30:00Z"
                      updatedAt: "2024-01-15T10:30:00Z"
```

---

## Step 7: Validate the Spec

```bash
# Install validator
bun add -D @redocly/cli

# Validate
bunx redocly lint openapi.yaml

# Preview docs
bunx redocly preview-docs openapi.yaml
```

---

## Step 8: Generate Outputs

### Generate TypeScript Types

```bash
# Using openapi-typescript
bun add -D openapi-typescript
bunx openapi-typescript openapi.yaml -o src/types/api.ts
```

### Serve Documentation

```typescript
// src/server/docs.ts
import { Hono } from 'hono'
import { swaggerUI } from '@hono/swagger-ui'
import spec from '../../openapi.yaml'

const docs = new Hono()

// Serve raw spec
docs.get('/openapi.json', (c) => c.json(spec))

// Swagger UI
docs.get('/docs', swaggerUI({ url: '/openapi.json' }))

export { docs }
```

---

## Output Checklist

- [ ] All endpoints documented
- [ ] Request/response schemas defined
- [ ] Examples provided for each endpoint
- [ ] Error responses documented
- [ ] Authentication documented
- [ ] Spec validates without errors
- [ ] TypeScript types generated
- [ ] Documentation UI accessible
