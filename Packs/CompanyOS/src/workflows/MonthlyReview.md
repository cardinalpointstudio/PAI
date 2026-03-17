# Workflow: MonthlyReview (Step 7)

> **Purpose:** Strategic course correction — reconcile reality vs. ideal state
> **Trigger:** "Monthly review for [company]" or first of the month
> **Cadence:** Monthly (first week of each month)
> **Outputs:** `reviews/{YYYY-MM}.md`, updated ideal-state, constraint adjustments

---

## Pre-flight

1. Load `ideal-state.yaml` for targets
2. Load `org-model.yaml` for constraints
3. Load `company-graph.json` for full picture
4. Load all weekly reviews from past month
5. Load `automation-backlog.md` for progress

## Review Sections

### 1. Metrics Delta (15 min)

For each metric in `ideal-state.yaml`:

| Metric | Start of Month | End of Month | Target | Gap to Ideal |
|--------|----------------|--------------|--------|--------------|
| {name} | {value} | {value} | {ideal} | {delta} |

For each metric:
- Trend: improving, stable, or declining?
- If declining: which nodes are responsible?
- If improving: what worked?

### 2. Ideal State Check (10 min)

Reread `ideal-state.yaml`:

> "Is the mission still accurate?"
> "Is the differentiation still true?"
> "Should any metrics be added, removed, or re-targeted?"

Flag changes needed.

### 3. Stream Health (10 min)

For each value stream:

| Stream | Bottlenecks | Improvements | Health |
|--------|-------------|--------------|--------|
| {name} | {nodes} | {what changed} | {🟢🟡🔴} |

### 4. Org Model Check (10 min)

Load `org-model.yaml`:

> "Did any constraints get violated this month?"
> "Did reality repeatedly fight a constraint?" (Signal to update it)
> "Any future role triggers close to being met?"

### 5. Automation Progress (10 min)

Compare to last month's `automation-backlog.md`:

| Node | Last Month | This Month | Change |
|------|------------|------------|--------|
| {node} | manual | partial | Shipped X |
| {node} | partial | partial | No change |

Calculate:
- % of nodes fully automated
- Change from last month
- Top 3 remaining targets

### 6. Structural Changes (15 min)

Based on all above, consider:

**Role changes:**
- Should anyone's responsibilities change?
- Is it time to hire? (Check triggers in org-model)
- Are there single points of failure?

**Stream changes:**
- Should any stream be re-mapped?
- Are there new streams to add?
- Are there streams to deprecate?

**Constraint changes:**
- Update span limits?
- New reporting rules?
- Remove constraints that don't serve us?

### 7. Next Month Focus (10 min)

Set 1-3 strategic priorities for the month:

> "If you could only accomplish ONE thing this month, what would have the biggest impact?"

## Outputs to Generate

### 1. reviews/{YYYY-MM}.md

```markdown
# Monthly Review: {company} — {Month YYYY}

**Date:** {date}
**Reviewer:** {name}

---

## Executive Summary

{2-3 sentences: How did the month go? What's the strategic takeaway?}

---

## Metrics Performance

| Metric | Start | End | Target | Gap | Trend |
|--------|-------|-----|--------|-----|-------|
| {metric} | {val} | {val} | {target} | {gap} | {↑↓→} |

### Analysis

{What drove improvements? What caused declines?}

### Metric Changes for Next Month

- [ ] {Adjust target for X because...}
- [ ] {Add new metric Y because...}

---

## Stream Health

| Stream | Health | Key Issues | Improvements Made |
|--------|--------|------------|-------------------|
| {stream} | {🟢🟡🔴} | {issues} | {improvements} |

---

## Automation Progress

**Status:**
- Fully automated: {n}/{total} ({%})
- Partially automated: {n}/{total} ({%})
- Manual: {n}/{total} ({%})

**Progress this month:**
- {Node X}: manual → partial (shipped Y)

**Top targets for next month:**
1. {node} — {tool}
2. {node} — {tool}

---

## Org Model Review

### Constraint Violations
- {Constraint X violated because Y — action: Z}

### Constraint Updates
- [ ] {Change constraint X from A to B because...}

### Future Role Triggers
| Trigger | Current | Threshold | Status |
|---------|---------|-----------|--------|
| {trigger} | {value} | {threshold} | {approaching/met/not close} |

---

## Structural Changes Made

- {Change 1}
- {Change 2}

## Structural Changes Proposed

- [ ] {Proposal — decision needed}

---

## Next Month Strategic Focus

### Priority 1: {Focus area}
**Why:** {rationale tied to metrics or ideal state}
**Success looks like:** {measurable outcome}

### Priority 2: {Focus area}
**Why:** {rationale}
**Success looks like:** {outcome}

### Priority 3 (stretch): {Focus area}

---

## Documents Updated

- [ ] ideal-state.yaml — {what changed}
- [ ] org-model.yaml — {what changed}
- [ ] company-graph.json — {nodes added/removed/changed}

---

## Open Questions

- {Question needing decision}

---

*Review completed: {date}*
*Time spent: {X} minutes*
```

### 2. ideal-state.yaml (if changed)

Update metrics, targets, critical nodes.

### 3. org-model.yaml (if changed)

Update constraints, future role triggers.

### 4. company-graph.json (if changed)

Add/remove/update nodes and edges.

## Validation

Before completing:
- [ ] All metrics compared month-over-month
- [ ] Ideal state reread and validated
- [ ] Constraints checked for violations
- [ ] Automation progress calculated
- [ ] 1-3 strategic priorities set
- [ ] All document updates saved
- [ ] Time spent < 90 minutes

## Quarterly Trigger

Every 3 months (Q1, Q2, Q3, Q4), add to monthly review:

> "Are we still solving the right problem?"
> "Should we pivot, persist, or double down?"
> "What should we stop doing?"
> "Does the ideal state need a major revision?"

## Next Step

> "Monthly review complete.
> Strategic focus for {month}:
> 1. {priority 1}
> 2. {priority 2}
>
> Run 'Weekly review' each week to track tactical progress."
