# Model: CompanyGraph

> **Purpose:** Define how to represent a company as a queryable graph of nodes and edges
> **Format:** JSON
> **Location:** `company-os/companies/{company}/company-graph.json`

---

## Overview

The CompanyGraph is the central data structure that represents a company's operations as a directed graph. Every SOP, role, tool, metric, and decision point is a node. Connections between them are edges.

## Node Types

| Type | Description | Examples |
|------|-------------|----------|
| `ValueStream` | End-to-end flow that produces value | "Acquire Customer", "Ship Product" |
| `SOP` | A documented procedure | "Respond to Lead", "Process Payment" |
| `Decision` | A branch point in a flow | "High-value customer?", "Passed validation?" |
| `Tool` | System, API, or software | "Stripe", "Slack", "CRM" |
| `Role` | Human accountability | "Founder", "Support Lead", "Engineer" |
| `Metric` | Measurable outcome | "Conversion Rate", "Churn", "NPS" |

## Edge Types

| Type | Description | Example |
|------|-------------|---------|
| `precedes` | A comes before B in flow | SOP-A → SOP-B |
| `depends_on` | A requires B to exist/work | SOP → Tool |
| `branches_to` | Decision leads to path | Decision → SOP (with condition) |
| `owns` | Role is accountable for node | Role → SOP |
| `measured_by` | Node's success measured by metric | SOP → Metric |
| `automatable_by` | Node could be automated by tool | SOP → Tool (candidate) |

## JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "company": { "type": "string" },
    "version": { "type": "string" },
    "created": { "type": "string", "format": "date" },
    "updated": { "type": "string", "format": "date" },
    "nodes": {
      "type": "array",
      "items": { "$ref": "#/definitions/Node" }
    },
    "edges": {
      "type": "array",
      "items": { "$ref": "#/definitions/Edge" }
    }
  },
  "definitions": {
    "Node": {
      "type": "object",
      "required": ["id", "type", "name"],
      "properties": {
        "id": { "type": "string", "pattern": "^[a-z0-9-]+$" },
        "type": { "enum": ["ValueStream", "SOP", "Decision", "Tool", "Role", "Metric"] },
        "name": { "type": "string" },
        "stream": { "type": "string" },
        "description": { "type": "string" },
        "owner": { "type": "string" },
        "backup": { "type": "string" },
        "tool": { "type": "string" },
        "sop_file": { "type": "string" },
        "sop_status": { "enum": ["undocumented", "draft", "documented", "stale"] },
        "automation_status": { "enum": ["manual", "partial", "full"] },
        "automation_scores": {
          "type": "object",
          "properties": {
            "frequency": { "type": "integer", "minimum": 1, "maximum": 5 },
            "impact": { "type": "integer", "minimum": 1, "maximum": 5 },
            "pain": { "type": "integer", "minimum": 1, "maximum": 5 },
            "automatable": { "type": "integer", "minimum": 1, "maximum": 5 },
            "priority": { "type": "number" }
          }
        },
        "status": { "enum": ["healthy", "bottleneck", "under-automated", "experimental", "broken"] },
        "status_changed": { "type": "string", "format": "date" },
        "status_reason": { "type": "string" },
        "last_audit": { "type": "string", "format": "date" },
        "metadata": { "type": "object" }
      }
    },
    "Edge": {
      "type": "object",
      "required": ["from", "to", "type"],
      "properties": {
        "from": { "type": "string" },
        "to": { "type": "string" },
        "type": { "enum": ["precedes", "depends_on", "branches_to", "owns", "measured_by", "automatable_by"] },
        "condition": { "type": "string" },
        "metadata": { "type": "object" }
      }
    }
  }
}
```

## Example

```json
{
  "company": "grappling-connect",
  "version": "1.0",
  "created": "2026-03-01",
  "updated": "2026-03-01",
  "nodes": [
    {
      "id": "stream-acquire-gym",
      "type": "ValueStream",
      "name": "Acquire Gym",
      "description": "Marketing → Trial → Paying customer"
    },
    {
      "id": "sop-respond-to-lead",
      "type": "SOP",
      "name": "Respond to Lead",
      "stream": "stream-acquire-gym",
      "owner": "role-founder",
      "tool": "manual",
      "sop_file": "sops/sop-respond-to-lead.md",
      "sop_status": "documented",
      "automation_status": "manual",
      "automation_scores": {
        "frequency": 4,
        "impact": 5,
        "pain": 4,
        "automatable": 5,
        "priority": 4.0
      },
      "status": "under-automated"
    },
    {
      "id": "role-founder",
      "type": "Role",
      "name": "Founder"
    },
    {
      "id": "tool-unified-inbox",
      "type": "Tool",
      "name": "Unified Inbox",
      "description": "GrapplingConnect lead management"
    },
    {
      "id": "metric-trial-conversion",
      "type": "Metric",
      "name": "Trial Conversion Rate",
      "description": "% of trials that become members"
    }
  ],
  "edges": [
    {
      "from": "role-founder",
      "to": "sop-respond-to-lead",
      "type": "owns"
    },
    {
      "from": "sop-respond-to-lead",
      "to": "metric-trial-conversion",
      "type": "measured_by"
    },
    {
      "from": "sop-respond-to-lead",
      "to": "tool-unified-inbox",
      "type": "automatable_by"
    }
  ]
}
```

## Queries

The graph enables queries like:

| Query | How |
|-------|-----|
| "What does Role X own?" | Find edges where `from=role-x` and `type=owns` |
| "What depends on Tool Y?" | Find edges where `to=tool-y` and `type=depends_on` |
| "What nodes drive Metric Z?" | Find edges where `to=metric-z` and `type=measured_by` |
| "What's automatable?" | Find nodes where `automation_status != full` and `automation_scores.priority > 3` |
| "What's broken?" | Find nodes where `status=broken` or `status=bottleneck` |

## Invariants

Rules the graph must satisfy:

1. Every `SOP` node must have exactly one `owns` edge from a `Role`
2. Every `SOP` node should have at least one `measured_by` edge to a `Metric`
3. No orphan nodes (every node must have at least one edge)
4. No circular `precedes` chains without a `Decision` break
5. `Decision` nodes must have at least 2 `branches_to` edges

## Maintenance

- Updated by: `MapValueStream`, `CreateSOP`, `AssignRoles`, `AutomationAudit`
- Validated by: `validate-constraints.ts`
- Queried by: `graph-query.ts`
