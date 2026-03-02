# Model: ToolRegistry

> **Purpose:** Map every SOP node to its current and candidate tools
> **Format:** Markdown table
> **Location:** `company-os/companies/{company}/tool-registry.md`

---

## Overview

The ToolRegistry tracks what tools each node uses today and what tools could be used tomorrow. This enables:

- Visibility into tool sprawl
- Automation planning (candidate tools)
- Dependency tracking (what breaks if Tool X fails?)
- Future MCP/agent integration mapping

## File Format

```markdown
# Tool Registry: {company}

> **Last updated:** {date}
> **Total nodes:** {n}
> **Unique tools:** {n}

---

## Registry

| Node ID | Node Name | Current Tool | Status | Candidate Tools | Priority | Notes |
|---------|-----------|--------------|--------|-----------------|----------|-------|
| {id} | {name} | {tool} | {status} | {candidates} | {score} | {notes} |

---

## Tool Inventory

### In Use

| Tool | Type | Nodes Using | Cost | Status |
|------|------|-------------|------|--------|
| {tool} | {type} | [{ids}] | {cost} | {active/deprecated} |

### Candidates (Not Yet Adopted)

| Tool | Type | Would Replace | Nodes Affected | Evaluation Status |
|------|------|---------------|----------------|-------------------|
| {tool} | {type} | {current} | [{ids}] | {evaluating/approved/rejected} |

---

## Dependencies

| Tool | Depends On | Used By |
|------|------------|---------|
| {tool} | [{tools}] | [{nodes}] |

---

## Tool Selection Criteria

1. {criterion 1}
2. {criterion 2}
3. {criterion 3}
```

## Status Values

| Status | Meaning |
|--------|---------|
| `manual` | No tool, human does it |
| `spreadsheet` | Tracked in sheets |
| `active` | Using production tool |
| `partial` | Tool used but not fully |
| `evaluating` | Testing a candidate |
| `deprecated` | Phasing out |

## Tool Types

| Type | Description |
|------|-------------|
| `internal` | Built by us |
| `saas` | Third-party subscription |
| `open-source` | Self-hosted OSS |
| `api` | External API |
| `manual` | Human process |

## Example

```markdown
# Tool Registry: grappling-connect

> **Last updated:** 2026-03-01
> **Total nodes:** 13
> **Unique tools:** 6

---

## Registry

| Node ID | Node Name | Current Tool | Status | Candidate Tools | Priority | Notes |
|---------|-----------|--------------|--------|-----------------|----------|-------|
| sop-respond-to-lead | Respond to Lead | Manual (DMs) | manual | Unified Inbox | 4.33 | MVP priority |
| sop-trial-reminder | Trial Reminder | Manual (texts) | manual | Resend, Loops | 4.33 | Auto-sequence |
| sop-billing | Process Billing | Stripe | partial | Stripe Billing | 3.00 | Enable auto-billing |
| sop-ship-feature | Ship Feature | VS Code + Claude | active | - | - | Working well |
| sop-weekly-review | Weekly Review | Markdown | active | - | - | Keep simple |
| sop-error-monitoring | Monitor Errors | Manual log check | manual | Sentry | 3.50 | Need alerts |

---

## Tool Inventory

### In Use

| Tool | Type | Nodes Using | Cost | Status |
|------|------|-------------|------|--------|
| Stripe | saas | [sop-billing] | 2.9% + $0.30 | active |
| VS Code | internal | [sop-ship-feature] | Free | active |
| Claude | api | [sop-ship-feature] | Usage-based | active |
| Markdown | internal | [sop-weekly-review, sop-monthly-review] | Free | active |

### Candidates (Not Yet Adopted)

| Tool | Type | Would Replace | Nodes Affected | Evaluation Status |
|------|------|---------------|----------------|-------------------|
| Unified Inbox | internal | Manual DMs | [sop-respond-to-lead] | building |
| Resend | saas | Manual texts | [sop-trial-reminder, sop-follow-up] | approved |
| Sentry | saas | Manual logs | [sop-error-monitoring] | evaluating |

---

## Dependencies

| Tool | Depends On | Used By |
|------|------------|---------|
| Unified Inbox | Stripe, Email API | [sop-respond-to-lead, sop-onboarding] |
| Stripe | - | [sop-billing, sop-onboarding] |

---

## Tool Selection Criteria

1. **Self-serve first** — Can we set it up without talking to sales?
2. **API available** — Can we integrate programmatically?
3. **No vendor lock-in** — Can we export data and leave?
4. **Usage-based pricing** — Pay for what we use, not seats
5. **Proven reliability** — No beta tools for critical paths
```

## Integration Points

| Workflow | Interaction |
|----------|-------------|
| CreateSOP | Adds entry for new node |
| AutomationAudit | Updates candidates and priorities |
| MapValueStream | Captures current tools during mapping |
| graph-query.ts | Finds nodes using specific tool |

## MCP Integration (Future)

The Tool Registry prepares for MCP (Model Context Protocol) integration:

```yaml
# Future: tool-registry.yaml with MCP config

tools:
  - id: unified-inbox
    type: internal
    mcp_server: "grappling-connect-mcp"
    capabilities:
      - list_leads
      - respond_to_lead
      - get_lead_status

  - id: stripe
    type: saas
    mcp_server: "stripe-mcp"
    capabilities:
      - create_customer
      - process_payment
      - get_subscription_status
```

This enables agents to execute SOPs by calling tools directly.

## Queries

| Query | How |
|-------|-----|
| "What tools does node X use?" | Filter registry by node_id |
| "What nodes depend on Tool Y?" | Filter registry by current_tool |
| "What's manual that could be automated?" | Filter by status=manual, priority>3 |
| "What would break if Stripe fails?" | Check dependencies + used_by |

## Maintenance

- Update when: Adding SOP, changing tools, automation audit
- Review: Monthly (part of monthly review)
- Clean up: Remove deprecated tools after 90 days
