# Implementation Plan: User Management Feature

Example PLAN.md for `.workflow/PLAN.md`

---

## Goal

Add complete user management functionality including CRUD operations, user listing, and profile editing. This enables administrators to manage user accounts through a dedicated UI.

## Approach

Implement a service-oriented backend with REST API endpoints, paired with a React-based admin UI. Use existing auth middleware for access control. Follow the repository pattern for data access.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ UserList    │  │ UserForm    │  │ UserDetail  │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         └────────────────┼────────────────┘            │
│                          ▼                              │
│                   useUsers() hook                       │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTP
┌─────────────────────────▼───────────────────────────────┐
│                      Backend                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │              /api/users routes                   │   │
│  └─────────────────────┬───────────────────────────┘   │
│                        ▼                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │              UserService                         │   │
│  └─────────────────────┬───────────────────────────┘   │
│                        ▼                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │              UserRepository                      │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Contracts

See `.workflow/contracts/user.ts` for:
- `User` - Core user type
- `UserService` - Backend service interface
- `ApiRoutes` - Request/response contracts
- `UserFormProps`, `UserListProps` - Component contracts

## Task Breakdown

### Backend Tasks (tasks/backend.md)
1. Create UserRepository with CRUD methods
2. Implement UserService using repository
3. Add /api/users routes with validation
4. Wire up auth middleware for admin-only access

### Frontend Tasks (tasks/frontend.md)
1. Create useUsers() hook for data fetching
2. Build UserList component with pagination
3. Build UserForm component for create/edit
4. Add UserDetail view with delete confirmation
5. Wire up routing

### Test Tasks (tasks/tests.md)
1. Unit tests for UserService
2. Integration tests for /api/users
3. Component tests for UserForm, UserList
4. E2E test for full user management flow

## Edge Cases

| Case | Handling |
|------|----------|
| Delete user with active sessions | Invalidate sessions, then delete |
| Duplicate email on create | Return 400 with clear error message |
| Update non-existent user | Return 404 |
| List with no users | Return empty array, UI shows empty state |
| Invalid email format | Client + server validation |

## Testing Strategy

1. **Unit tests:** Service methods, utility functions
2. **Integration tests:** API routes with test database
3. **Component tests:** React Testing Library for forms
4. **E2E tests:** Playwright for critical paths (create user, edit, delete)

## Files Affected

### New Files
- `src/backend/services/UserService.ts`
- `src/backend/repositories/UserRepository.ts`
- `src/backend/routes/users.ts`
- `src/frontend/hooks/useUsers.ts`
- `src/frontend/components/UserList.tsx`
- `src/frontend/components/UserForm.tsx`
- `src/frontend/pages/UsersPage.tsx`

### Modified Files
- `src/backend/routes/index.ts` - Add users routes
- `src/frontend/App.tsx` - Add routes
- `src/frontend/components/Sidebar.tsx` - Add navigation

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Password handling security | Use existing auth service, never store plaintext |
| N+1 queries on user list | Use pagination, eager load relationships |
| Form validation complexity | Use zod schema shared between client/server |

## Dependencies

- Existing: auth middleware, database connection, UI component library
- None new required

## Success Criteria

- [ ] Admin can create new users
- [ ] Admin can view list of all users
- [ ] Admin can edit user details
- [ ] Admin can delete users (with confirmation)
- [ ] All operations require admin authentication
- [ ] Form validation on client and server
- [ ] All tests passing
