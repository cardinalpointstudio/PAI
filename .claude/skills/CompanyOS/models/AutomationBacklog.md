# Model: AutomationBacklog

> **Purpose:** Ranked list of nodes under automation pressure
> **Format:** Markdown table (human-editable, machine-parseable)
> **Location:** `company-os/companies/{company}/automation-backlog.md`

---

## Overview

The AutomationBacklog maintains a prioritized list of nodes that should be automated. Every node is "under automation pressure" — it must justify why a human does it.

This model bridges the gap between "we should automate this" and "what do we actually work on."

## Scoring Dimensions

Each node is scored on 4 dimensions (1-5 scale):

### Frequency (F)
| Score | Meaning |
|-------|---------|
| 5 | Multiple times per day |
| 4 | Daily |
| 3 | Weekly |
| 2 | Monthly |
| 1 | Quarterly or less |

### Impact (I)
| Score | Meaning |
|-------|---------|
| 5 | Directly drives primary metric |
| 4 | Affects customer experience |
| 3 | Affects internal efficiency |
| 2 | Nice-to-have improvement |
| 1 | Minimal impact |

### Pain (P)
| Score | Meaning |
|-------|---------|
| 5 | Error-prone, causes failures |
| 4 | Time-consuming, creates delays |
| 3 | Annoying but manageable |
| 2 | Minor inconvenience |
| 1 | Easy, no issues |

### Automatable (A)
| Score | Meaning |
|-------|---------|
| 5 | Off-the-shelf tool exists |
| 4 | Simple script/integration |
| 3 | Moderate development |
| 2 | Complex, custom build |
| 1 | Requires human judgment |

### Priority Score Formula

```
Priority = (F + I + P) × A / 15
```

| Range | Meaning |
|-------|---------|
| > 4.0 | Automate immediately |
| 3.0 - 4.0 | Automate soon |
| 2.0 - 3.0 | Consider later |
| < 2.0 | Leave manual |

## File Format

```markdown
# Automation Backlog: {company}

> **Last audit:** {date}
> **Next audit:** {date + 3 months}
> **Automation rate:** {n}% ({automated}/{total} nodes)

---

## Priority 1: Automate Now (Score > 4.0)

| Node ID | Name | F | I | P | A | Score | Candidate | Status | Notes |
|---------|------|---|---|---|---|-------|-----------|--------|-------|
| {id} | {name} | 5 | 5 | 4 | 5 | 4.67 | {tool} | todo | {notes} |

## Priority 2: Automate Soon (Score 3.0-4.0)

| Node ID | Name | F | I | P | A | Score | Candidate | Status | Notes |
|---------|------|---|---|---|---|-------|-----------|--------|-------|

## Priority 3: Consider Later (Score 2.0-3.0)

| Node ID | Name | F | I | P | A | Score | Candidate | Status | Notes |
|---------|------|---|---|---|---|-------|-----------|--------|-------|

## Manual by Design (A = 1)

| Node ID | Name | Reason | Mitigation |
|---------|------|--------|------------|
| {id} | {name} | {why human judgment} | {SOP improvement} |

---

## Progress Tracking

### This Quarter

| Date | Node | Before | After | Tool Used |
|------|------|--------|-------|-----------|
| {date} | {id} | manual | partial | {tool} |

### Summary

- Started quarter: {n}% automated
- Current: {n}% automated
- Target: {n}% automated

---

## Next Actions

1. **{Node}** — {specific next step} — {owner}
2. **{Node}** — {specific next step} — {owner}
3. **{Node}** — {specific next step} — {owner}
```

## Status Values

| Status | Meaning |
|--------|---------|
| `todo` | Not started |
| `in_progress` | Currently being automated |
| `blocked` | Waiting on dependency |
| `done` | Fully automated |
| `partial` | Partially automated |
| `wont_do` | Decided not to automate |

## Example

```markdown
# Automation Backlog: grappling-connect

> **Last audit:** 2026-03-01
> **Next audit:** 2026-06-01
> **Automation rate:** 15% (2/13 nodes)

---

## Priority 1: Automate Now (Score > 4.0)

| Node ID | Name | F | I | P | A | Score | Candidate | Status | Notes |
|---------|------|---|---|---|---|-------|-----------|--------|-------|
| sop-respond-to-lead | Respond to Lead | 4 | 5 | 4 | 5 | 4.33 | Unified Inbox | todo | MVP feature |
| sop-trial-reminder | Trial Reminder | 5 | 4 | 4 | 5 | 4.33 | Auto-sequence | todo | Use Resend |

## Priority 2: Automate Soon (Score 3.0-4.0)

| Node ID | Name | F | I | P | A | Score | Candidate | Status | Notes |
|---------|------|---|---|---|---|-------|-----------|--------|-------|
| sop-billing | Process Billing | 2 | 4 | 3 | 5 | 3.00 | Stripe Billing | partial | Already using Stripe |

## Manual by Design (A = 1)

| Node ID | Name | Reason | Mitigation |
|---------|------|--------|------------|
| sop-sales-call | Sales Conversation | Requires judgment, rapport | Better script, training |

---

## Next Actions

1. **sop-respond-to-lead** — Build unified inbox MVP — Founder
2. **sop-trial-reminder** — Set up Resend drip sequence — Founder
3. **sop-billing** — Enable Stripe auto-billing — Founder
```

## Integration Points

| Workflow | Interaction |
|----------|-------------|
| AutomationAudit | Regenerates entire backlog |
| WeeklyReview | Picks items from backlog for sprint |
| MonthlyReview | Reviews progress, updates targets |
| score-automation.ts | Calculates priority scores |

## Decision Framework

When deciding what to automate next:

```
1. Start with Priority 1 (highest scores)
2. Within same priority:
   - Pick highest Impact first (customer-facing > internal)
   - If tied, pick lowest Automatable effort (quick wins)
3. If blocked on P1, skip to P2
4. If everything is blocked, work on unblocking
```

## Anti-Patterns

| Anti-Pattern | Why Bad | Fix |
|--------------|---------|-----|
| Automating A=1 nodes | Wasted effort, needs judgment | Keep manual, improve SOP |
| Automating low-F nodes first | Low ROI | Focus on frequent tasks |
| Scoring without data | Guesses lead to wrong priorities | Measure before scoring |
| Not tracking status | Backlog goes stale | Update weekly |
