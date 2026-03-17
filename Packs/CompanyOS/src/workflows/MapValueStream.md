# Workflow: MapValueStream (Step 2)

> **Purpose:** Turn an end-to-end flow into graph nodes and edges
> **Trigger:** "Map the [stream name] value stream for [company]"
> **Outputs:** `value-streams/{stream}.md`, nodes/edges added to `company-graph.json`

---

## Pre-flight

1. Load company's `ideal-state.yaml` to understand context
2. Load existing `company-graph.json`
3. Confirm value stream name and outcome

## Questions to Ask

### Stream Definition

> "What's the outcome of this value stream? (e.g., 'Stranger becomes paying customer')"

> "What triggers this stream to start? (e.g., 'Lead submits inquiry form')"

### Node Discovery

Walk through the flow step by step:

> "What's the first thing that happens after [trigger]?"

For each step, capture:
- **Node name** (verb + noun, e.g., "Respond to Lead")
- **Node type** (SOP, Decision, Tool, or Handoff)
- **Input** (what does this step need?)
- **Output** (what does this step produce?)
- **Current owner** (who/what does this today?)
- **Current tool** (manual, spreadsheet, system?)

> "What happens next?"

Repeat until reaching the outcome.

### Decision Points

When a branch is identified:

> "What determines which path is taken?"

Capture:
- Condition (e.g., "contract value > $50k")
- Path A (node it leads to)
- Path B (alternative node)

### Metrics

> "How do you measure this stream's health?"

Link metrics to specific nodes:
- Conversion between nodes
- Time at each node
- Error rate at each node

## Graph Updates

### Node Schema

For each node discovered, add to `company-graph.json`:

```json
{
  "id": "node-{stream}-{step}",
  "type": "SOP|Decision|Tool|Handoff",
  "name": "{Node Name}",
  "stream": "{stream-name}",
  "owner": "{role|null}",
  "tool": "{current tool|manual}",
  "automation_status": "manual|partial|full",
  "status": "active|bottleneck|experimental"
}
```

### Edge Schema

For each connection:

```json
{
  "from": "{node-id}",
  "to": "{node-id}",
  "type": "precedes|depends_on|branches_to",
  "condition": "{condition if decision branch|null}"
}
```

## Outputs to Generate

### 1. value-streams/{stream}.md

```markdown
# Value Stream: {Stream Name}

> **Outcome:** {what this produces}
> **Trigger:** {what starts this}
> **Owner:** {who's accountable for the whole stream}

---

## Flow

{ASCII diagram of nodes}

## Nodes

| ID | Name | Type | Owner | Tool | Status |
|----|------|------|-------|------|--------|
| {id} | {name} | {type} | {owner} | {tool} | {status} |

## Metrics

| Metric | Measured At | Current | Target |
|--------|-------------|---------|--------|
| {metric} | {node} | {value} | {target} |

## Gaps Identified

- [ ] {Gap 1 — node with problem}
- [ ] {Gap 2}

## SOPs Needed

- [ ] {node-id} — {node name} (not yet documented)
```

### 2. company-graph.json (updated)

Add all nodes and edges discovered.

### 3. tool-registry.md (updated)

Add entry for each node:

```markdown
| Node ID | Current Tool | Candidate Tools | Notes |
|---------|--------------|-----------------|-------|
| {id} | {tool} | {candidates} | {notes} |
```

## Validation

Before completing:
- [ ] Every node has an ID, type, and name
- [ ] Every node is connected (no orphans)
- [ ] Stream has clear start trigger and end outcome
- [ ] At least one metric identified
- [ ] Graph JSON is valid
- [ ] Gaps identified for Step 3

## Next Step

Prompt user:
> "Value stream mapped with {N} nodes. {M} SOPs needed. Create first SOP with 'Create SOP for {node-name}'"
