# Workflow: CreateSOP (Step 3)

> **Purpose:** Turn a graph node into an executable procedure
> **Trigger:** "Create an SOP for [node name]" or "Document [procedure]"
> **Outputs:** `sops/{node-id}.md`, updated graph node, tool registry entry

---

## Pre-flight

1. Load `company-graph.json` to find the node
2. Load `tool-registry.md` for current tooling
3. Load `ideal-state.yaml` for context
4. If node doesn't exist, offer to create it first

## Questions to Ask

### Context

> "What's the goal of this procedure? What outcome does it produce?"

> "What triggers this procedure to run?"

### Inputs

> "What do you need before starting? (Information, materials, approvals)"

List each input with:
- Name
- Source (where it comes from)
- Required or optional

### Steps

> "Walk me through exactly what happens, step by step."

For each step:
- Action (imperative verb: "Send", "Check", "Create")
- Details (specific instructions)
- Tool used (if any)
- Time estimate (optional)

### Decision Points

> "Are there any 'if this, then that' decisions in this procedure?"

For each:
- Condition
- Action if true
- Action if false

### Outputs

> "What does this procedure produce when done correctly?"

List each output with:
- Name
- Destination (where it goes)
- Format (if applicable)

### Success Criteria

> "How do you know this was done correctly?"

Concrete, testable criteria.

### Failure Modes

> "What commonly goes wrong? How should it be handled?"

## Outputs to Generate

### 1. sops/{node-id}.md

```markdown
# SOP: {Node Name}

> **Purpose:** {one sentence outcome}
> **Owner:** {role}
> **Trigger:** {when this runs}
> **Node ID:** {node-id}

---

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| {input} | {source} | Yes/No |

## Steps

### 1. {Action}

{Detailed instructions}

**Tool:** {tool if applicable}

### 2. {Action}

{Detailed instructions}

### 3. Continue as needed...

## Decision Points

| Condition | If True | If False |
|-----------|---------|----------|
| {condition} | {action} | {action} |

## Outputs

| Output | Destination | Format |
|--------|-------------|--------|
| {output} | {destination} | {format} |

## Success Criteria

- [ ] {Criterion 1}
- [ ] {Criterion 2}

## Failure Modes

| Failure | Response |
|---------|----------|
| {what goes wrong} | {how to handle} |

---

## Automation Status

| Step | Current | Automatable | Candidate Tool |
|------|---------|-------------|----------------|
| 1 | Manual/Auto | Yes/No/Partial | {tool} |
| 2 | Manual/Auto | Yes/No/Partial | {tool} |

---

*Last updated: {date}*
```

### 2. company-graph.json (updated)

Update the node:

```json
{
  "id": "{node-id}",
  "sop_file": "sops/{node-id}.md",
  "sop_status": "documented",
  "last_updated": "{date}"
}
```

### 3. tool-registry.md (updated)

Add or update entry:

```markdown
| {node-id} | {current tool} | {candidates from automation status} | {notes} |
```

## Validation

Before completing:
- [ ] SOP has clear trigger and outcome
- [ ] All inputs and outputs defined
- [ ] Steps are specific enough for a stranger to follow
- [ ] Success criteria are testable
- [ ] Automation status assessed for each step
- [ ] Graph node updated with sop_file reference
- [ ] Tool registry updated

## Next Step

If more SOPs needed:
> "SOP created. {N} more SOPs needed in this stream. Create next with 'Create SOP for {node-name}'"

If stream complete:
> "All SOPs documented for {stream}. Next: 'Assign roles for {company}' or 'Map another value stream'"
