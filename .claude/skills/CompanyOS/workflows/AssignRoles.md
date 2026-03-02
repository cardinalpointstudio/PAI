# Workflow: AssignRoles (Step 4)

> **Purpose:** Assign accountability for nodes, define org constraints
> **Trigger:** "Assign roles for [company]" or "Who owns [node]?"
> **Outputs:** Updated graph nodes with owners, `org-model.yaml`

---

## Pre-flight

1. Load `company-graph.json` to see all nodes
2. Load `org-model.yaml` (or create if missing)
3. Load `principles.md` for tie-breaking guidance
4. List all nodes without owners

## Questions to Ask

### Current Team

> "Who's on the team right now? (List roles or names)"

For each person/role:
- Name or role title
- Current responsibilities
- Capacity (full-time, part-time, fractional)

### Ownership Assignment

For each unowned node:

> "Who should own '{node name}'? (Accountable for outcomes, not just doing the work)"

Rules to apply:
- Every node needs exactly ONE owner
- Owner can delegate execution, but not accountability
- Prefer the person closest to the work

### Backup Assignment

> "If {owner} is unavailable, who's the backup for {node}?"

### Constraint Discovery

> "Are there any rules about how the org should be structured?"

Prompt for:
- **Span limits:** Max/min direct reports per manager
- **Reporting rules:** "X must report to Y"
- **Location rules:** "This role requires on-site"
- **Skill requirements:** "Must have certification X"
- **Separation rules:** "A and B can't be same person"

### Future Roles

> "At what point would you add another person? What would trigger that?"

Capture:
- Trigger condition (e.g., ">50 support tickets/week")
- Role to add
- Which nodes they'd own

## Outputs to Generate

### 1. org-model.yaml

```yaml
company: {company-name}
updated: {date}

team:
  - role: {role name}
    person: {name or TBD}
    capacity: full-time|part-time|fractional
    owns:
      - {node-id}
      - {node-id}
    backup_for:
      - {node-id}

constraints:
  span_of_control:
    max: 7
    min: 3

  reporting_rules:
    - role: {role}
      must_report_to: [{role}]

  location_rules:
    - role: {role}
      requires: on-site|remote|flexible

  skill_requirements:
    - role: {role}
      requires: [{skill}]

  separation_rules:
    - roles: [{role-a}, {role-b}]
      rule: "cannot be same person"

future_roles:
  - trigger: "{condition}"
    role: "{role name}"
    would_own: [{node-ids}]

non_negotiables:
  - "Every node has exactly one owner"
  - "No single point of failure for critical nodes"
  - "{from principles.md}"
```

### 2. company-graph.json (updated)

Update each node:

```json
{
  "id": "{node-id}",
  "owner": "{role}",
  "backup": "{role|null}",
  "ownership_assigned": "{date}"
}
```

### 3. Validation Report

Check constraints against assignments:

```markdown
## Org Validation Report

### Constraint Checks
- [ ] All nodes have owners: {PASS|FAIL - list orphans}
- [ ] Span of control within limits: {PASS|FAIL - list violations}
- [ ] Reporting rules satisfied: {PASS|FAIL - list violations}
- [ ] No single points of failure: {PASS|FAIL - list risks}

### Warnings
- {Role X} owns {N} nodes — consider splitting
- {Node Y} has no backup assigned
- {Future role trigger} is close to being met
```

## Validation

Before completing:
- [ ] Every node has an owner
- [ ] Critical nodes have backups
- [ ] Constraints are explicit, not implicit
- [ ] Future role triggers are concrete
- [ ] Org-model.yaml written
- [ ] Graph nodes updated with owners
- [ ] No constraint violations (or acknowledged exceptions)

## Constraint Validation Logic

Run `validate-constraints.ts`:

```
For each node:
  - Has owner? → error if not
  - Owner exists in team? → error if not

For each role:
  - Count owned nodes → warn if > max_span
  - Check reporting rules → error if violated

For critical nodes (in ideal-state.yaml):
  - Has backup? → warn if not
```

## Next Step

> "Roles assigned. Run 'Automation audit for {company}' to identify what to automate."
