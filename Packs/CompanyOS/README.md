---
name: CompanyOS
pack-id: cardinalpointstudio-companyos-v1.0.0
version: 1.0.0
author: cardinalpointstudio
description: Systematize companies as computable graphs of roles, workflows, and APIs -- continuous automation pressure on every node
type: skill
purpose-type: [business, systematization, automation, operations]
platform: claude-code
dependencies: []
keywords: [company, business, systematization, automation, sop, workflows, roles, graphs, operations, org-model, value-stream, metrics]
---

# CompanyOS

> Systematize companies as computable graphs of roles, workflows, and APIs -- not just documentation, but queryable structures under continuous automation pressure.

---

## The Problem

Most business documentation is static prose that nobody reads. Org charts live in PowerPoint. SOPs live in Google Docs. Metrics live in spreadsheets. Nothing connects to anything else. When you ask "who owns this process?" or "what depends on this role?" you get meetings, not answers.

The fundamental issues:

- **No queryable structure** -- You can't ask "show me all nodes with no owner" or "what breaks if we remove this role"
- **No automation pressure** -- Processes exist because they always have, not because they must
- **No computable metrics** -- Targets live in prose, not in systems that can compare actuals vs ideals
- **No constraint validation** -- Org rules are tribal knowledge, not checkable models

Companies run on graphs of dependencies, but they document themselves in disconnected prose.

---

## The Solution

CompanyOS treats companies as computable systems. Every SOP, role, tool, and metric is a node in a queryable graph. Edges represent dependencies. The system applies continuous automation pressure: every human-performed node must justify why it isn't automated.

**Core capabilities:**

1. **Company as Graph** -- SOPs, roles, tools, and metrics as queryable nodes with explicit dependencies
2. **Ideal State Model** -- Metrics with target bands (ideal/acceptable/red) that can be compared to actuals
3. **Org Model Constraints** -- Explicit rules for spans, reporting lines, and accountability
4. **Automation Backlog** -- Every node scored for automation priority
5. **Review Cadences** -- Weekly (tactical) and monthly (strategic) reviews that produce specific changes

**Based on two frameworks:**
- **Miessler's Company Graph** -- Every business is a graph under automation pressure
- **Lütke's Org Solver** -- Organization as constraint satisfaction problem

---

## Installation

This pack is designed for AI-assisted installation. Give this directory to your AI and ask it to install using `INSTALL.md`.

**What is PAI?** See the [PAI Project Overview](https://github.com/danielmiessler/Personal_AI_Infrastructure#what-is-pai).

---

## What's Included

| Component | Path | Purpose |
|-----------|------|---------|
| Skill definition | `src/SKILL.md` | Main skill routing and documentation |
| **Workflows** | | |
| CreateCompany | `src/workflows/CreateCompany.md` | Step 1: Define ideal state + metrics |
| MapValueStream | `src/workflows/MapValueStream.md` | Step 2: Identify flows → graph nodes |
| CreateSOP | `src/workflows/CreateSOP.md` | Step 3: Formalize procedures |
| AssignRoles | `src/workflows/AssignRoles.md` | Step 4: Accountability + constraints |
| AutomationAudit | `src/workflows/AutomationAudit.md` | Step 5: Score nodes, prioritize automation |
| WeeklyReview | `src/workflows/WeeklyReview.md` | Step 6: Tactical review |
| MonthlyReview | `src/workflows/MonthlyReview.md` | Step 7: Strategic review |
| **Models** | | |
| CompanyGraph | `src/models/CompanyGraph.md` | Graph specification |
| OrgModel | `src/models/OrgModel.md` | Organizational constraints |
| IdealState | `src/models/IdealState.md` | Metrics and targets |
| AutomationBacklog | `src/models/AutomationBacklog.md` | Automation priorities |
| ToolRegistry | `src/models/ToolRegistry.md` | Node → tool/API mapping |
| Principles | `src/models/Principles.md` | Culture rules and tie-breakers |
| **Tools** | | |
| graph-query.ts | `src/tools/graph-query.ts` | Query nodes, edges, dependencies |
| validate-constraints.ts | `src/tools/validate-constraints.ts` | Check org against OrgModel |
| score-automation.ts | `src/tools/score-automation.ts` | Calculate automation priority |
| metrics-dashboard.ts | `src/tools/metrics-dashboard.ts` | Compare actuals vs IdealState |
| show-gaps.ts | `src/tools/show-gaps.ts` | Find incomplete nodes, TBDs |
| **Templates** | | |
| company-graph.json | `src/templates/company-graph.json` | Empty graph template |
| ideal-state.yaml | `src/templates/ideal-state.yaml` | Metrics template |
| org-model.yaml | `src/templates/org-model.yaml` | Constraints template |
| sop.md | `src/templates/sop.md` | SOP template |
| automation-backlog.md | `src/templates/automation-backlog.md` | Backlog template |
| tool-registry.md | `src/templates/tool-registry.md` | Registry template |
| principles.md | `src/templates/principles.md` | Principles template |

**Summary:**
- **Directories:** 4 (workflows, models, tools, templates)
- **Files:** 25
- **Dependencies:** Bun runtime (for TypeScript tools)

---

## What Makes This Different

This sounds similar to just documenting your business processes, which many companies already do. What makes this approach different?

CompanyOS creates queryable, computable structures rather than static documentation. You can ask "what nodes have no owner?" and get an answer in seconds. You can run `validate-constraints.ts` and find every org rule violation. You can compare this week's metrics to your ideal state automatically.

- **Queryable graphs** let you traverse dependencies and find gaps programmatically
- **Automation scoring** forces every node to justify human involvement
- **Constraint validation** catches org issues before they cause problems
- **Review cadences** produce specific changes, not just meeting notes
- **Computable metrics** compare actuals to ideals automatically

---

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

---

## Invocation Scenarios

| Trigger | What Happens |
|---------|--------------|
| "Create a new company for [business]" | CreateCompany workflow: asks questions, generates ideal-state.yaml, principles.md, initializes graph |
| "Map the [stream] value stream" | MapValueStream workflow: guides through flow mapping, adds nodes/edges |
| "Create an SOP for [node]" | CreateSOP workflow: generates SOP file, links to graph |
| "Run my weekly review" | WeeklyReview workflow: compares actuals to ideal, identifies nodes to change |
| "Show gaps in [company]" | Runs show-gaps.ts to find incomplete nodes |
| "What nodes depend on [node]?" | Runs graph-query.ts to traverse dependencies |

---

## Example Usage

### Creating a Company

```
User: "Create a new company for my SaaS business"

AI runs CreateCompany workflow:
  1. Asks about business model, key metrics, team size
  2. Generates ideal-state.yaml with metric bands
  3. Creates principles.md with culture rules
  4. Initializes empty company-graph.json
  5. Sets up directory structure in company-os/companies/
```

### Mapping a Value Stream

```
User: "Map the customer onboarding value stream"

AI runs MapValueStream workflow:
  1. Walks through each step: signup → verification → setup → first value
  2. Creates nodes for each step
  3. Adds edges for dependencies
  4. Identifies automation candidates
  5. Updates company-graph.json
```

### Running Weekly Review

```
User: "Run my weekly review"

AI runs WeeklyReview workflow:
  1. Pulls current metrics from dashboards
  2. Compares to ideal-state.yaml bands
  3. Shows red/yellow metrics
  4. Suggests 2-3 nodes to change this week
  5. Outputs specific action items
```

---

## Configuration

### Company Data Location

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

### Tool Dependencies

The TypeScript tools require Bun runtime. After installation, run:

```bash
cd ~/.claude/skills/CompanyOS/tools
bun install
```

---

## Key Principles

1. **Computable over prose** -- Metrics in YAML, not paragraphs. Graphs in JSON, not diagrams.
2. **Every node has an owner** -- No orphan SOPs.
3. **Automation pressure** -- Every node should justify why a human does it.
4. **Constraints are explicit** -- Org rules live in OrgModel, not tribal knowledge.
5. **Reviews produce changes** -- Weekly/Monthly reviews output specific edits, not just notes.

---

## Credits

- **Original concept:** Cardinal Point Studio
- **Inspired by:** Daniel Miessler's Company Graph framework and Tobi Lütke's Org Solver approach

---

## Works Well With

- **Telos Pack** -- Life OS for personal goals that can integrate with company metrics
- **Research Pack** -- Deep research for market analysis and competitive intelligence
- **Thinking Pack** -- First principles analysis for strategic decisions

---

## Changelog

### 1.0.0 - 2024-03-17
- Initial release as PAI Pack
- 7 workflows covering full company lifecycle
- 6 model definitions (CompanyGraph, OrgModel, IdealState, AutomationBacklog, ToolRegistry, Principles)
- 5 TypeScript CLI tools for querying and validation
- 7 templates for bootstrapping company artifacts
