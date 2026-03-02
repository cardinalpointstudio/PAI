# Workflow: CreateCompany (Step 1)

> **Purpose:** Define a company's ideal state, metrics, and principles
> **Trigger:** "Create a new company for [description]"
> **Outputs:** `ideal-state.yaml`, `principles.md`, initialized `company-graph.json`

---

## Pre-flight

1. Confirm company name (or generate working name)
2. Create directory: `company-os/companies/{company-name}/`
3. Initialize empty graph from template

## Questions to Ask

### Identity (Mission)

> "What does this company do, and why does it matter? (1-2 sentences)"

Options to offer:
- Product company (builds and sells a product)
- Service company (delivers services to clients)
- Platform (connects two sides of a market)
- Internal team (serves other teams in an org)

### Customer

> "Who is the primary customer?"

Follow-up:
- What problem do you solve for them?
- In their words, what's the pain?

### Differentiation

> "If you could only be great at ONE thing and average at everything else, what would it be?"

Options:
- Speed (faster than alternatives)
- Quality (better than alternatives)
- Price (cheaper than alternatives)
- Experience (easier/more pleasant)
- Access (serve who others won't)
- Trust (more reliable/credible)

> "What's your unfair advantage in one sentence?"

### Metrics

> "What 3-5 numbers tell you if you're winning?"

For each metric, capture:
- Name
- Current value (or "TBD")
- Ideal target
- Acceptable threshold
- Red zone (unacceptable)

Common candidates:
- Revenue / MRR / ARR
- Customer count / Active users
- Churn rate
- NPS / CSAT
- Conversion rate
- Time to deliver
- Error rate

### Critical Nodes (Preview)

> "What are the 2-3 end-to-end flows that produce value?"

Just names for now — these become value streams in Step 2.

### Constraints

> "What rules can never be broken, regardless of efficiency?"

Examples:
- Safety first
- No jerks policy
- Quality standards
- Compliance requirements

### Principles

> "What 3-5 cultural rules guide decision-making?"

If none provided, suggest defaults:
- Few but great people
- Systems over heroics
- Document once, reuse forever
- Every node is someone's job
- Automate the second time

## Outputs to Generate

### 1. ideal-state.yaml

```yaml
company: {company-name}
created: {date}

mission: |
  {mission statement}

customer:
  primary: {who}
  problem: |
    {problem in their words}

differentiation:
  primary: {speed|quality|price|experience|access|trust}
  unfair_advantage: |
    {one sentence}

metrics:
  - name: {metric_name}
    current: {value|null}
    ideal: {target}
    acceptable: {threshold}
    red_zone: {unacceptable}

critical_nodes:
  - node_id: {future node}
    drives: [{metric_names}]

constraints:
  - {constraint 1}
  - {constraint 2}
```

### 2. principles.md

```markdown
# Principles: {company-name}

> These rules guide decision-making when in doubt.

1. **{Principle 1}** — {explanation}
2. **{Principle 2}** — {explanation}
...
```

### 3. company-graph.json (initialized)

```json
{
  "company": "{company-name}",
  "created": "{date}",
  "nodes": [],
  "edges": []
}
```

### 4. Directory structure

```
company-os/companies/{company-name}/
├── ideal-state.yaml
├── principles.md
├── company-graph.json
├── org-model.yaml          # Empty, filled in Step 4
├── automation-backlog.md   # Empty, filled in Step 5
├── tool-registry.md        # Empty, filled in Step 3
├── value-streams/          # Filled in Step 2
└── sops/                   # Filled in Step 3
```

## Validation

Before completing:
- [ ] Mission is 1-2 sentences, not a paragraph
- [ ] At least 3 metrics defined
- [ ] At least 2 constraints defined
- [ ] At least 3 principles defined
- [ ] All files written to correct location

## Next Step

Prompt user:
> "Company created. Next: Map your first value stream with 'Map the [stream name] value stream'"
