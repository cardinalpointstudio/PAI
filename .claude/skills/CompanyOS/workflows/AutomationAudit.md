# Workflow: AutomationAudit (Step 5)

> **Purpose:** Score every node for automation priority, build backlog
> **Trigger:** "Automation audit for [company]" or "What should I automate?"
> **Cadence:** Quarterly (or when adding significant new nodes)
> **Outputs:** `automation-backlog.md`, updated graph nodes, tool registry

---

## Pre-flight

1. Load `company-graph.json` to get all nodes
2. Load `tool-registry.md` for current tooling
3. Load `ideal-state.yaml` for critical nodes
4. Load existing `automation-backlog.md` if present

## Scoring Framework

For each node, score on 4 dimensions (1-5 scale):

### Frequency (F)
How often does this run?

| Score | Frequency |
|-------|-----------|
| 5 | Multiple times per day |
| 4 | Daily |
| 3 | Weekly |
| 2 | Monthly |
| 1 | Quarterly or less |

### Impact (I)
How much does this affect outcomes?

| Score | Impact |
|-------|--------|
| 5 | Directly drives primary metric |
| 4 | Affects customer experience |
| 3 | Affects internal efficiency |
| 2 | Nice-to-have improvement |
| 1 | Minimal impact |

### Pain (P)
How much does manual execution hurt?

| Score | Pain |
|-------|------|
| 5 | Error-prone, causes failures |
| 4 | Time-consuming, creates delays |
| 3 | Annoying but manageable |
| 2 | Minor inconvenience |
| 1 | Easy, no issues |

### Automatable (A)
How feasible is automation?

| Score | Feasibility |
|-------|-------------|
| 5 | Off-the-shelf tool exists |
| 4 | Simple script/integration |
| 3 | Moderate development |
| 2 | Complex, custom build |
| 1 | Requires human judgment |

### Priority Score

```
Priority = (F + I + P) × A / 15
```

Range: 0.2 (low) to 5.0 (high)

Nodes with Priority > 3.0 should be automated soon.

## Questions to Ask

For each node:

> "How often does '{node}' run?"

> "What happens if this node fails or is slow?"

> "What's painful about doing this manually?"

> "Is there a tool that could do this? (existing or buildable)"

## Outputs to Generate

### 1. automation-backlog.md

```markdown
# Automation Backlog: {company}

> **Last audit:** {date}
> **Next audit:** {date + 3 months}

## Priority 1 (Score > 4.0) — Automate Now

| Node | F | I | P | A | Score | Candidate Tool | Status |
|------|---|---|---|---|-------|----------------|--------|
| {id} | {f} | {i} | {p} | {a} | {score} | {tool} | {status} |

## Priority 2 (Score 3.0-4.0) — Automate Soon

| Node | F | I | P | A | Score | Candidate Tool | Status |
|------|---|---|---|---|-------|----------------|--------|

## Priority 3 (Score 2.0-3.0) — Consider Later

| Node | F | I | P | A | Score | Candidate Tool | Status |
|------|---|---|---|---|-------|----------------|--------|

## Not Automatable (A = 1)

| Node | Reason | Mitigation |
|------|--------|------------|
| {id} | {why human judgment needed} | {SOP improvement, training, etc.} |

## Automation Status Summary

- Total nodes: {N}
- Fully automated: {n} ({%})
- Partially automated: {n} ({%})
- Manual: {n} ({%})

## Next Actions

1. {Top priority node} — {specific next step}
2. {Second priority} — {specific next step}
3. {Third priority} — {specific next step}
```

### 2. company-graph.json (updated)

Update each node:

```json
{
  "id": "{node-id}",
  "automation_scores": {
    "frequency": {f},
    "impact": {i},
    "pain": {p},
    "automatable": {a},
    "priority": {score}
  },
  "automation_status": "manual|partial|full",
  "automation_candidate": true|false,
  "last_audit": "{date}"
}
```

### 3. tool-registry.md (updated)

Update candidate tools based on audit:

```markdown
| Node ID | Current Tool | Candidate Tools | Priority | Notes |
|---------|--------------|-----------------|----------|-------|
| {id} | {current} | {candidates} | {score} | {notes} |
```

## Validation

Before completing:
- [ ] Every node has been scored
- [ ] Scores are justified, not guessed
- [ ] Top 3 priorities have specific next actions
- [ ] Backlog is sorted by priority
- [ ] Graph nodes updated with scores
- [ ] Tool registry updated with candidates

## Decision Framework

When deciding build vs. buy:

| Condition | Action |
|-----------|--------|
| Off-the-shelf tool fits | Buy/use it |
| Simple integration (<1 day) | Build it |
| Core to differentiation | Build it |
| Complex + not core | Buy or skip |
| Requires ongoing maintenance | Buy if possible |

## Next Step

> "Audit complete. Top automation targets:
> 1. {node} — {tool} (Score: {X})
> 2. {node} — {tool} (Score: {X})
>
> Pick one to automate, or run 'Weekly review' to incorporate into sprint."
