# Workflow: WeeklyReview (Step 6)

> **Purpose:** Tactical check-in — pick nodes to change, track progress
> **Trigger:** "Weekly review for [company]" or "What should I focus on this week?"
> **Cadence:** Every week (pick consistent day: Sunday evening or Monday morning)
> **Outputs:** `reviews/{YYYY-WW}.md`, updated node statuses

---

## Pre-flight

1. Load `ideal-state.yaml` for metrics
2. Load `company-graph.json` for node statuses
3. Load `automation-backlog.md` for priorities
4. Load last week's review if exists

## Review Sections

### 1. Last Week (5 min)

> "What did you ship/complete last week?"

Capture:
- Completed items
- Incomplete items (why?)
- Surprises (good or bad)

### 2. Metrics Check (5 min)

Pull current values for each metric in `ideal-state.yaml`:

| Metric | Target | Actual | Delta | Status |
|--------|--------|--------|-------|--------|
| {name} | {target} | {actual} | {+/-} | {🟢🟡🔴} |

Status:
- 🟢 At or above ideal
- 🟡 Acceptable but below ideal
- 🔴 In red zone

### 3. Node Status Review (10 min)

For nodes in active streams, assess status:

| Status | Meaning |
|--------|---------|
| `healthy` | Working as expected |
| `bottleneck` | Causing delays or errors |
| `under-automated` | Should be automated but isn't |
| `experimental` | Testing a change |
| `broken` | Not working, needs immediate fix |

> "Are any nodes causing problems right now?"

Flag nodes for status changes.

### 4. Feedback Collection (5 min)

> "What feedback did you receive this week? (Users, your own usage, support)"

Add to backlog if actionable.

### 5. Pick Focus (10 min)

Choose **1-3 nodes** to change this week.

Decision inputs:
- Red zone metrics → which nodes drive them?
- Bottleneck nodes → highest pain
- Automation backlog → highest priority
- User feedback → loudest signal

For each chosen node:
- What change? (SOP update, tool change, automation)
- What's the success criteria?
- Who's doing it?

### 6. Blockers (5 min)

> "What could stop progress this week?"

If blocked:
- Can you unblock yourself?
- Who do you need help from?
- First action: unblock before other work

## Outputs to Generate

### 1. reviews/{YYYY-WW}.md

```markdown
# Weekly Review: {company} — Week {WW}, {YYYY}

**Date:** {date}
**Reviewer:** {name}

---

## Last Week

### Completed
- {item}
- {item}

### Incomplete
- {item} — {reason}

### Surprises
- {observation}

---

## Metrics

| Metric | Target | Actual | Delta | Status |
|--------|--------|--------|-------|--------|
| {metric} | {target} | {actual} | {delta} | {status} |

**Summary:** {one sentence on metric health}

---

## Node Status Changes

| Node | Previous | Current | Reason |
|------|----------|---------|--------|
| {node} | {status} | {status} | {why} |

---

## Feedback Received

- {feedback item} → {action or backlog?}

---

## This Week's Focus

### 1. {Node or task}
- **Change:** {what we're doing}
- **Success:** {how we'll know it worked}
- **Owner:** {who}

### 2. {Node or task}
- **Change:** {what}
- **Success:** {criteria}
- **Owner:** {who}

### 3. {If applicable}

---

## Blockers

| Blocker | Resolution | Owner |
|---------|------------|-------|
| {blocker} | {how to resolve} | {who} |

---

## Notes

{Any other observations}

---

*Review completed in {X} minutes*
```

### 2. company-graph.json (updated)

Update status on flagged nodes:

```json
{
  "id": "{node-id}",
  "status": "{new-status}",
  "status_changed": "{date}",
  "status_reason": "{reason}"
}
```

## Validation

Before completing:
- [ ] Metrics checked (not guessed)
- [ ] 1-3 specific focus items chosen
- [ ] Each focus item has success criteria
- [ ] Blockers identified with resolutions
- [ ] Review saved to reviews/ directory
- [ ] Graph nodes updated with status changes
- [ ] Time spent < 45 minutes

## Time Guard

If review is taking >45 minutes:
- Stop adding detail
- Capture what you have
- Note "review ran long" and why

## Next Step

> "Review complete. This week's focus:
> 1. {focus 1}
> 2. {focus 2}
>
> Next review: {date + 7 days}"
