# Compound Workflow

Document learnings from completed work to make future work easier.

## Purpose

Extract reusable patterns, gotchas, and insights from work just completed. Save them in a format that can be found and applied to future similar work.

## When to Use

- After completing a significant feature
- After solving a tricky bug
- When you discover a useful pattern
- After a learning experience (even failures)
- Before context switches to preserve knowledge

## Step 1: Identify What Was Learned

**Ask the user or analyze the session:**

1. What did we just complete?
2. What patterns emerged that could be reused?
3. What mistakes did we make that should be avoided?
4. What was surprisingly difficult or easy?

## Step 2: Extract Patterns

**For each learning, document:**

```markdown
### Pattern: [Name]

**Context:** When you're [situation]

**Problem:** [What goes wrong without this pattern]

**Solution:** [The pattern/approach that works]

**Example:**
```code
[concrete code example]
```

**Why it works:** [Brief explanation]
```

## Step 3: Document Gotchas

**For mistakes or surprises:**

```markdown
### Gotcha: [Name]

**Symptom:** [What you see when you hit this]

**Root Cause:** [Why this happens]

**Fix:** [How to resolve it]

**Prevention:** [How to avoid it next time]
```

## Step 4: Save to History

**Create a learning file:**

```bash
# Determine category
CATEGORY="Learnings"  # or Patterns, Gotchas, etc.

# Create dated file
FILE="${PAI_DIR}/History/${CATEGORY}/$(date +%Y-%m-%d)-[topic].md"
```

**File template:**

```markdown
# [Topic] - Learnings

**Date:** YYYY-MM-DD
**Context:** [What work this came from]
**Tags:** [relevant, tags, for, search]

## Summary

[2-3 sentence overview of what was learned]

## Patterns Discovered

### [Pattern 1 Name]
[Pattern details]

### [Pattern 2 Name]
[Pattern details]

## Gotchas Encountered

### [Gotcha 1]
[Details]

## Key Takeaways

1. [Takeaway 1]
2. [Takeaway 2]
3. [Takeaway 3]

## Related

- [Link to relevant code/docs]
- [Link to similar past work]
```

## Step 5: Update Relevant Skills (Optional)

**If a pattern is broadly applicable:**

1. Identify which skill it belongs to
2. Add it to that skill's documentation
3. Or create a new skill if warranted

**Example:**
```
Learning: "Always validate JWT expiry before trusting claims"
→ Could go in a future Auth skill
→ Or a security patterns reference doc
```

## Step 6: Summarize for User

**Output:**

```markdown
## Compound Complete

### Saved to History
- `${PAI_DIR}/History/Learnings/YYYY-MM-DD-topic.md`

### Patterns Captured
1. [Pattern 1 name]
2. [Pattern 2 name]

### Gotchas Documented
1. [Gotcha 1 name]

### Skills Updated
- [Skill name] - added [what]

This knowledge will make future [similar work] easier.
```

## Output Template

```markdown
# [Topic] Learnings

**Date:** [date]
**Context:** [what work spawned this]
**Tags:** [searchable, keywords]

## Summary

[What the key insight is in 2-3 sentences]

## Patterns

### [Pattern Name]
**When:** [situation where this applies]
**Do:** [the pattern]
**Because:** [why it works]

## Gotchas

### [Gotcha Name]
**Watch for:** [symptom]
**Fix:** [solution]

## Takeaways

1. [Key point 1]
2. [Key point 2]
3. [Key point 3]
```

## Compounding Over Time

Each compound cycle adds to your knowledge base:

```
Session 1: Learn Pattern A
Session 5: Combine Pattern A + B → Pattern C
Session 10: Patterns form a playbook
Session 20: Playbook becomes automated workflow
```

The goal is that similar work becomes progressively faster and more reliable.

## Done

Learnings captured. Future work on similar topics will benefit from this session.
