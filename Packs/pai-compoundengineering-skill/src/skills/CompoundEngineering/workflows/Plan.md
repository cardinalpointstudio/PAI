# Plan Workflow

Transform feature ideas into detailed implementation strategies before writing any code.

## Purpose

Prevent wasted effort by thinking through the implementation thoroughly. Catch design issues, edge cases, and dependencies before they become expensive bugs.

## When to Use

- Starting a new feature
- Major refactoring
- Complex bug fixes
- Any work touching 3+ files
- Architectural changes

## Step 1: Understand the Goal

**Ask the user:**
1. What is the desired end state?
2. What problem does this solve?
3. Are there constraints (time, tech, compatibility)?

## Step 2: Research the Codebase

**Before planning, understand what exists:**

```
1. Search for related code patterns
2. Identify files that will be affected
3. Note existing conventions to follow
4. Find tests that need updating
```

Use the Explore agent or Glob/Grep to map the territory.

## Step 3: Identify Dependencies

**Map out:**
- What needs to exist before this can work?
- What other code depends on what we're changing?
- Are there database migrations needed?
- External services or APIs involved?

## Step 4: Consider Edge Cases

**Think through:**
- What happens with invalid input?
- Concurrent access issues?
- Error states and recovery?
- Performance at scale?
- Security implications?

## Step 5: Design the Approach

**Document:**
1. High-level approach (1-2 sentences)
2. Key components to create/modify
3. Data flow or state changes
4. Testing strategy

## Step 6: Create Implementation Checklist

**Break into discrete tasks:**

```markdown
## Implementation Plan: [Feature Name]

### Approach
[1-2 sentence summary]

### Tasks
- [ ] Task 1: [specific action]
- [ ] Task 2: [specific action]
- [ ] Task 3: [specific action]
...

### Edge Cases to Handle
- [ ] Edge case 1
- [ ] Edge case 2

### Tests Needed
- [ ] Test scenario 1
- [ ] Test scenario 2

### Files Affected
- `path/to/file1.ts` - [what changes]
- `path/to/file2.ts` - [what changes]
```

## Step 7: User Approval

**Present the plan and ask:**

"Here's my implementation plan for [feature]. Does this approach look right? Any concerns before I start?"

**Do NOT proceed until user approves.**

## Step 8: Save Plan to History

If the plan is substantial, save it:

```bash
# Save to History for future reference
${PAI_DIR}/History/Plans/YYYY-MM-DD-feature-name.md
```

## Output Template

```markdown
## Implementation Plan: [Feature Name]

### Goal
[What we're building and why]

### Approach
[How we'll build it - 2-3 sentences]

### Tasks
1. [ ] [First task]
2. [ ] [Second task]
3. [ ] [Third task]
...

### Edge Cases
- [Edge case 1 and how we'll handle it]
- [Edge case 2 and how we'll handle it]

### Testing Strategy
- [How we'll verify this works]

### Files Affected
- `file1.ts` - [changes]
- `file2.ts` - [changes]

### Risks/Concerns
- [Any potential issues to watch for]
```

## Done

Plan created and approved. Use TodoWrite to track tasks during implementation.
