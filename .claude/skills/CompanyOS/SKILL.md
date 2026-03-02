---
name: CompanyOS
description: Systematize companies as computable graphs of roles, workflows, and APIs. USE WHEN user says 'create company', 'map value stream', 'write SOP', 'assign roles', 'automation audit', 'weekly review', 'monthly review', 'company graph', 'org model', OR user wants to systematize business operations, document workflows, or build company infrastructure.
---

# CompanyOS

A framework for building companies as computable systems — not just documentation, but queryable graphs under continuous automation pressure.

## Philosophy

Based on two core ideas:

1. **Company as Graph** (Miessler) — Every company is a graph of SOPs, roles, tools, and metrics. Nodes are under constant automation pressure. The ideal business has as few humans as possible.

2. **Org as Solver** (Lütke) — Organization structure is a constraint satisfaction problem. Roles, spans, reporting lines live in a model that can be validated and optimized.

## The 7-Step Framework

| Step | Workflow | Purpose | Cadence |
|------|----------|---------|---------|
| 1 | CreateCompany | Define ideal state + metrics | Once |
| 2 | MapValueStream | Identify flows → graph nodes | Once per stream |
| 3 | CreateSOP | Formalize procedures | Once per node |
| 4 | AssignRoles | Accountability + constraints | Once, update as needed |
| 5 | AutomationAudit | Score nodes, prioritize automation | Quarterly |
| 6 | WeeklyReview | Tactical: pick nodes to change | Weekly |
| 7 | MonthlyReview | Strategic: reconcile vs ideal | Monthly |

## Core Artifacts

### Models (Computable Structures)

| Model | Purpose |
|-------|---------|
| `CompanyGraph` | Nodes (SOPs, Roles, Tools, Metrics) + edges |
| `OrgModel` | Constraints: spans, reporting, rules |
| `IdealState` | Metrics + target bands (ideal/acceptable/red) |
| `AutomationBacklog` | Ranked nodes to automate |
| `ToolRegistry` | Node → tool/API mapping |
| `Principles` | Culture rules, tie-breakers |

### File Locations

All company data lives in `company-os/companies/{company-name}/`:

```
company-os/
├── companies/
│   └── {company-name}/
│       ├── ideal-state.yaml       # Metrics + targets
│       ├── company-graph.json     # The graph
│       ├── org-model.yaml         # Constraints
│       ├── automation-backlog.md  # Prioritized list
│       ├── tool-registry.md       # Node → tool map
│       ├── principles.md          # Culture rules
│       ├── value-streams/         # Flow documentation
│       └── sops/                  # Procedures
└── templates/                     # Empty templates
```

## Usage

### Create a new company
```
"Create a new company for [business description]"
```
Runs Step 1: asks questions, generates ideal-state.yaml, principles.md, initializes graph.

### Map a value stream
```
"Map the [stream name] value stream for [company]"
```
Runs Step 2: guides through flow mapping, adds nodes/edges to graph.

### Create an SOP
```
"Create an SOP for [node name] in [company]"
```
Runs Step 3: generates SOP file, links to graph, updates tool registry.

### Run reviews
```
"Run my weekly review for [company]"
"Run monthly review for [company]"
```
Runs Step 6 or 7: compares actuals to ideal, identifies nodes to change.

### Query the system
```
"Show gaps in [company]"
"What nodes depend on [node]?"
"Show automation backlog for [company]"
```
Uses CLI tools to query the graph and models.

## Key Principles

1. **Computable over prose** — Metrics in YAML, not paragraphs. Graphs in JSON, not diagrams.
2. **Every node has an owner** — No orphan SOPs.
3. **Automation pressure** — Every node should justify why a human does it.
4. **Constraints are explicit** — Org rules live in OrgModel, not tribal knowledge.
5. **Reviews produce changes** — Weekly/Monthly reviews output specific edits, not just notes.

## Workflows

- [CreateCompany](./workflows/CreateCompany.md) — Step 1
- [MapValueStream](./workflows/MapValueStream.md) — Step 2
- [CreateSOP](./workflows/CreateSOP.md) — Step 3
- [AssignRoles](./workflows/AssignRoles.md) — Step 4
- [AutomationAudit](./workflows/AutomationAudit.md) — Step 5
- [WeeklyReview](./workflows/WeeklyReview.md) — Step 6
- [MonthlyReview](./workflows/MonthlyReview.md) — Step 7

## Models

- [CompanyGraph](./models/CompanyGraph.md) — Graph specification
- [OrgModel](./models/OrgModel.md) — Organizational constraints
- [IdealState](./models/IdealState.md) — Metrics and targets
- [AutomationBacklog](./models/AutomationBacklog.md) — Automation priorities
- [ToolRegistry](./models/ToolRegistry.md) — Tool/API mapping
- [Principles](./models/Principles.md) — Culture and tie-breakers

## Tools

| Tool | Purpose |
|------|---------|
| `graph-query.ts` | Query nodes, edges, dependencies |
| `validate-constraints.ts` | Check org against OrgModel |
| `score-automation.ts` | Calculate automation priority scores |
| `metrics-dashboard.ts` | Compare actuals vs IdealState |
| `show-gaps.ts` | Find incomplete nodes, TBDs, missing SOPs |
