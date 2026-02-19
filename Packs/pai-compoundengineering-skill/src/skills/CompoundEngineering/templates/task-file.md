# [Domain] Tasks

Template for `.workflow/tasks/[domain].md` files.

---

## Contract Reference

- Import types from: `../contracts/[relevant].ts`
- Must implement: [List interfaces, functions, or types this worker must implement]

## Context

[Brief description of what this domain is responsible for in this feature. 2-3 sentences max.]

## Tasks (ordered by dependency)

### 1. [First Task Title]

**File:** `path/to/file.ts`
**Action:** Create | Modify | Delete

**Details:**
- Specific implementation requirement
- Expected behavior
- Edge case to handle

**Acceptance:**
- [ ] Criteria 1
- [ ] Criteria 2

### 2. [Second Task Title]

**File:** `path/to/another-file.ts`
**Action:** Create | Modify | Delete

**Details:**
- What to implement
- How it should work

**Acceptance:**
- [ ] Criteria 1

### 3. [Continue as needed...]

## Constraints

- [Domain-specific rule - e.g., "Use existing auth middleware"]
- [Pattern to follow - e.g., "Match existing service class structure"]
- [Thing to avoid - e.g., "Do not add new dependencies"]

## Dependencies

- **Depends on:** [List any contracts or shared code this worker needs]
- **Provides for:** [What other workers depend on from this domain]

## Done When

- [ ] All tasks above completed
- [ ] Code compiles without errors (`bun run tsc --noEmit`)
- [ ] Follows existing codebase patterns
- [ ] All acceptance criteria met
