# Model: OrgModel

> **Purpose:** Define organizational constraints as a solvable system
> **Format:** YAML
> **Location:** `company-os/companies/{company}/org-model.yaml`

---

## Overview

The OrgModel captures organizational structure as explicit constraints that can be validated and optimized. Instead of org design living in tribal knowledge, it becomes a model that tools can check.

Inspired by Tobi Lütke's concept of "org as solver problem" — the structure is a constraint satisfaction problem.

## Schema

```yaml
# org-model.yaml

company: string                    # Company name
version: string                    # Schema version
updated: date                      # Last update

# Current team structure
team:
  - role: string                   # Role name (matches Role nodes in graph)
    person: string | null          # Current person or TBD
    capacity: enum                 # full-time | part-time | fractional
    level: integer                 # 1 = IC, 2 = lead, 3 = director, etc.
    reports_to: string | null      # Role they report to
    owns:                          # Node IDs they own
      - string
    backup_for:                    # Nodes they backup
      - string

# Hard constraints (must satisfy)
constraints:
  span_of_control:
    max: integer                   # Max direct reports
    min: integer                   # Min direct reports (avoid 1:1 chains)

  reporting_rules:
    - role: string
      must_report_to: [string]     # List of acceptable managers

  location_rules:
    - role: string
      requires: enum               # on-site | remote | flexible

  skill_requirements:
    - role: string
      requires: [string]           # Required skills/certs

  separation_rules:
    - roles: [string, string]
      rule: string                 # e.g., "cannot be same person"

  time_zone_rules:
    - role: string
      must_overlap_with: string    # Role to overlap with
      hours: integer               # Min overlap hours

# Soft constraints (prefer but can violate)
preferences:
  - description: string
    weight: integer                # 1-10 importance

# Triggers for structural change
future_roles:
  - trigger: string                # Condition to evaluate
    role: string                   # Role to add
    would_own: [string]            # Node IDs
    urgency: enum                  # approaching | met | not_close

# Non-negotiables (cultural, not structural)
non_negotiables:
  - string

# Compensation structure (optional)
compensation:
  bands:
    - level: integer
      range: [min, max]
  rules:
    - string                       # e.g., "No negotiation outside bands"
```

## Example

```yaml
company: grappling-connect
version: "1.0"
updated: 2026-03-01

team:
  - role: founder
    person: "Alex"
    capacity: full-time
    level: 3
    reports_to: null
    owns:
      - sop-respond-to-lead
      - sop-ship-feature
      - sop-weekly-review
    backup_for: []

constraints:
  span_of_control:
    max: 7
    min: 2

  reporting_rules:
    - role: engineer
      must_report_to: [founder, tech-lead]

  location_rules:
    - role: founder
      requires: flexible

  skill_requirements:
    - role: engineer
      requires: [typescript, bun]

  separation_rules:
    - roles: [developer, code-reviewer]
      rule: "cannot be same person for same PR"

preferences:
  - description: "Prefer async communication over meetings"
    weight: 8
  - description: "Prefer generalists over specialists at current stage"
    weight: 7

future_roles:
  - trigger: "support_tickets_per_week > 20"
    role: support-lead
    would_own:
      - sop-handle-support
      - sop-triage-bugs
    urgency: not_close

  - trigger: "active_gyms > 50"
    role: customer-success
    would_own:
      - sop-onboard-customer
      - sop-renewal
    urgency: not_close

non_negotiables:
  - "Every SOP has exactly one owner"
  - "No single point of failure for critical SOPs"
  - "Safety before speed"

compensation:
  bands:
    - level: 1
      range: [50000, 80000]
    - level: 2
      range: [75000, 120000]
    - level: 3
      range: [100000, 200000]
  rules:
    - "Equity for all full-time roles"
    - "Annual review, not negotiation-driven raises"
```

## Validation Rules

The `validate-constraints.ts` tool checks:

### Hard Constraint Violations (Errors)

```
FOR each role in team:
  - IF owns any node: node.owner == role.id
  - IF reports_to defined: reports_to exists in team
  - IF span > max: ERROR "Role X exceeds span of control"
  - IF span < min AND has_reports: WARNING "Role X has too few reports"

FOR each reporting_rule:
  - role.reports_to IN must_report_to: else ERROR

FOR each separation_rule:
  - roles assigned to different people: else ERROR
```

### Soft Constraint Warnings

```
FOR each preference:
  - Log if violated (no error)
  - Track violation count over time
```

### Trigger Evaluation

```
FOR each future_role:
  - Evaluate trigger condition
  - Update urgency: not_close | approaching | met
  - If met: ALERT "Time to hire {role}"
```

## Integration Points

| Workflow | How It Uses OrgModel |
|----------|---------------------|
| AssignRoles | Reads constraints, validates assignments |
| WeeklyReview | Checks for violations, evaluates triggers |
| MonthlyReview | Proposes constraint updates based on reality |
| validate-constraints.ts | Runs full validation |

## Invariants

1. Every node in the graph with `owner` field must map to a role in team
2. No role can own more nodes than reasonable for their capacity
3. Critical nodes (from ideal-state) must have backups
4. Reporting chains must not exceed 4 levels for companies <50 people

## Evolution

The OrgModel should evolve:

| Event | Action |
|-------|--------|
| Reality repeatedly violates constraint | Loosen constraint or fix reality |
| Trigger condition met | Add the role, update team |
| Role becomes overwhelmed | Split responsibilities, update owns |
| New stream added | Assign ownership, check constraints |
