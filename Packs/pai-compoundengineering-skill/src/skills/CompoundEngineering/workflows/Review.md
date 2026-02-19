# Review Workflow

Multi-agent code review before merging. Each agent reviews from a specialized perspective.

## Purpose

Catch issues a single reviewer would miss by applying multiple expert lenses to the code. Security, performance, correctness, and maintainability are reviewed in parallel.

## When to Use

- Before merging a PR
- After completing a feature
- Before deploying to production
- When you want thorough quality assurance

## Step 1: Identify What to Review

**Determine the scope:**

```bash
# If reviewing staged changes
git diff --cached

# If reviewing a branch
git diff main...HEAD

# If reviewing specific files
git diff path/to/file
```

**Ask the user if unclear:**
- "What should I review? The current diff, a specific branch, or certain files?"

## Step 2: Launch Parallel Review Agents

**Use the Task tool to launch 3-4 specialized agents in parallel:**

```
Task({
  prompt: "Review this code for SECURITY issues only: [code/diff]

  Focus on:
  - Input validation
  - Authentication/authorization
  - Injection vulnerabilities (SQL, XSS, command)
  - Secrets exposure
  - OWASP Top 10

  Output format:
  ## Security Review
  ### Issues Found
  - [severity] [issue] at [location]
  ### Recommendations
  - [fix for each issue]
  ### Verdict: PASS/FAIL",
  subagent_type: "general-purpose",
  model: "haiku"
})

Task({
  prompt: "Review this code for PERFORMANCE issues only: [code/diff]

  Focus on:
  - O(n²) or worse algorithms
  - Unnecessary allocations
  - N+1 query patterns
  - Missing indexes
  - Memory leaks
  - Blocking operations

  Output format:
  ## Performance Review
  ### Issues Found
  - [severity] [issue] at [location]
  ### Recommendations
  - [fix for each issue]
  ### Verdict: PASS/FAIL",
  subagent_type: "general-purpose",
  model: "haiku"
})

Task({
  prompt: "Review this code for CORRECTNESS issues only: [code/diff]

  Focus on:
  - Logic errors
  - Edge cases not handled
  - Type safety issues
  - Race conditions
  - Error handling gaps
  - Off-by-one errors

  Output format:
  ## Correctness Review
  ### Issues Found
  - [severity] [issue] at [location]
  ### Recommendations
  - [fix for each issue]
  ### Verdict: PASS/FAIL",
  subagent_type: "general-purpose",
  model: "haiku"
})

Task({
  prompt: "Review this code for MAINTAINABILITY issues only: [code/diff]

  Focus on:
  - Code clarity
  - Naming conventions
  - DRY violations
  - Dead code
  - Missing documentation (only where truly needed)
  - Test coverage

  Output format:
  ## Maintainability Review
  ### Issues Found
  - [severity] [issue] at [location]
  ### Recommendations
  - [fix for each issue]
  ### Verdict: PASS/FAIL",
  subagent_type: "general-purpose",
  model: "haiku"
})
```

## Step 3: Collect and Consolidate

**Wait for all agents to complete, then consolidate:**

```markdown
## Code Review Summary

### Overall Verdict: [PASS/FAIL/NEEDS FIXES]

### Critical Issues (must fix)
1. [issue from any reviewer]
2. [issue from any reviewer]

### Recommended Fixes (should fix)
1. [issue]
2. [issue]

### Minor Suggestions (nice to have)
1. [issue]
2. [issue]

### Review Breakdown
| Aspect | Verdict | Issues |
|--------|---------|--------|
| Security | PASS/FAIL | X issues |
| Performance | PASS/FAIL | X issues |
| Correctness | PASS/FAIL | X issues |
| Maintainability | PASS/FAIL | X issues |
```

## Step 4: Present to User

**Output the consolidated review and ask:**

"Here's the multi-agent review. Would you like me to fix any of these issues?"

## Step 5: Fix or Approve

**If user wants fixes:**
1. Address critical issues first
2. Then recommended fixes
3. Skip minor suggestions unless requested

**If user approves as-is:**
- Proceed to merge
- Consider running Compound workflow to capture learnings

## Review Severity Guide

| Severity | Meaning | Action |
|----------|---------|--------|
| **Critical** | Security hole, data loss, crash | Must fix before merge |
| **High** | Significant bug, performance issue | Should fix before merge |
| **Medium** | Minor bug, code smell | Fix if time permits |
| **Low** | Style, documentation | Optional |

## Output Template

```markdown
## Multi-Agent Code Review

**Scope:** [what was reviewed]
**Verdict:** [PASS / NEEDS FIXES / FAIL]

### Critical Issues
- [ ] [issue 1]
- [ ] [issue 2]

### Recommended Fixes
- [ ] [issue 1]
- [ ] [issue 2]

### Minor Suggestions
- [suggestion 1]
- [suggestion 2]

### Agent Reports

<details>
<summary>Security Review</summary>
[full security agent output]
</details>

<details>
<summary>Performance Review</summary>
[full performance agent output]
</details>

<details>
<summary>Correctness Review</summary>
[full correctness agent output]
</details>

<details>
<summary>Maintainability Review</summary>
[full maintainability agent output]
</details>
```

## Done

Review complete. Issues logged for fixing or acknowledged for merge.
