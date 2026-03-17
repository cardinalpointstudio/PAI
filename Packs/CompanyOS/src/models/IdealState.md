# Model: IdealState

> **Purpose:** Define "what good looks like" as measurable targets
> **Format:** YAML
> **Location:** `company-os/companies/{company}/ideal-state.yaml`

---

## Overview

The IdealState is the canonical definition of success for a company. Instead of fuzzy goals, it contains specific metrics with target bands that reviews can compute against.

This enables:
- Weekly/Monthly reviews to calculate deltas
- Automated alerts when metrics enter red zone
- Clear prioritization (what moves us toward ideal?)

## Schema

```yaml
# ideal-state.yaml

company: string                    # Company name
version: string                    # Schema version
created: date
updated: date

# Core identity
mission: string                    # 1-2 sentences

customer:
  primary: string                  # Who you serve
  secondary: [string]              # Other segments
  problem: string                  # Pain in their words

differentiation:
  primary: enum                    # speed | quality | price | experience | access | trust
  unfair_advantage: string         # One sentence moat

# Measurable targets
metrics:
  - name: string                   # Metric identifier
    description: string            # What it measures
    type: enum                     # number | percentage | currency | duration
    direction: enum                # higher_is_better | lower_is_better
    current: number | null         # Current value
    ideal: number                  # Target (stretch)
    acceptable: number             # Good enough
    red_zone: number               # Unacceptable threshold
    unit: string                   # e.g., "users", "%", "$", "hours"
    frequency: enum                # daily | weekly | monthly | quarterly
    source: string                 # Where to get the data

# Nodes that drive metrics
critical_nodes:
  - node_id: string                # Reference to graph node
    drives: [string]               # Metric names it affects
    impact: enum                   # high | medium | low

# Guardrails
constraints:
  - string                         # Rules that can't be broken

# Where data comes from
data_sources:
  - name: string
    type: enum                     # database | api | manual | analytics
    refresh: enum                  # real-time | daily | weekly | manual
```

## Example

```yaml
company: grappling-connect
version: "1.0"
created: 2026-03-01
updated: 2026-03-01

mission: |
  Make every grappling gym feel professionally run —
  without needing professional staff.

customer:
  primary: "Solo gym owner / owner-operator"
  secondary:
    - "Small gym staff"
    - "Multi-location owners (future)"
  problem: |
    I'm losing members because I can't respond fast enough,
    follow up consistently, or run my gym like a real business.
    But I can't afford staff to do it either.

differentiation:
  primary: experience
  unfair_advantage: |
    We know what a well-run grappling gym looks like
    because we built one first.

metrics:
  - name: active_gyms
    description: "Gyms with active subscription"
    type: number
    direction: higher_is_better
    current: 0
    ideal: 100
    acceptable: 10
    red_zone: 0
    unit: "gyms"
    frequency: weekly
    source: "database"

  - name: monthly_churn
    description: "% of gyms that cancel per month"
    type: percentage
    direction: lower_is_better
    current: null
    ideal: 0.03
    acceptable: 0.05
    red_zone: 0.10
    unit: "%"
    frequency: monthly
    source: "stripe"

  - name: trial_conversion
    description: "% of trials that become paid"
    type: percentage
    direction: higher_is_better
    current: null
    ideal: 0.50
    acceptable: 0.30
    red_zone: 0.15
    unit: "%"
    frequency: weekly
    source: "database"

  - name: time_to_value
    description: "Hours from signup to first lead captured"
    type: duration
    direction: lower_is_better
    current: null
    ideal: 1
    acceptable: 24
    red_zone: 72
    unit: "hours"
    frequency: weekly
    source: "analytics"

  - name: nps
    description: "Net Promoter Score"
    type: number
    direction: higher_is_better
    current: null
    ideal: 50
    acceptable: 30
    red_zone: 0
    unit: "score"
    frequency: quarterly
    source: "survey"

critical_nodes:
  - node_id: sop-respond-to-lead
    drives: [trial_conversion]
    impact: high

  - node_id: sop-onboarding
    drives: [time_to_value, monthly_churn]
    impact: high

  - node_id: sop-ship-feature
    drives: [nps, active_gyms]
    impact: medium

constraints:
  - "Simple > Configurable"
  - "Automation-first"
  - "Solo-founder sustainable"
  - "Grappling-native"

data_sources:
  - name: database
    type: database
    refresh: real-time

  - name: stripe
    type: api
    refresh: daily

  - name: analytics
    type: analytics
    refresh: daily

  - name: survey
    type: manual
    refresh: quarterly
```

## Metric Status Computation

The `metrics-dashboard.ts` tool computes status for each metric:

```typescript
function computeStatus(metric: Metric): Status {
  const { current, ideal, acceptable, red_zone, direction } = metric;

  if (current === null) return 'no_data';

  if (direction === 'higher_is_better') {
    if (current >= ideal) return 'ideal';
    if (current >= acceptable) return 'acceptable';
    if (current > red_zone) return 'warning';
    return 'red_zone';
  } else {
    if (current <= ideal) return 'ideal';
    if (current <= acceptable) return 'acceptable';
    if (current < red_zone) return 'warning';
    return 'red_zone';
  }
}
```

## Dashboard Output

```markdown
## Metrics Dashboard: grappling-connect

| Metric | Current | Ideal | Acceptable | Status |
|--------|---------|-------|------------|--------|
| active_gyms | 3 | 100 | 10 | 🟡 |
| monthly_churn | 2% | 3% | 5% | 🟢 |
| trial_conversion | 20% | 50% | 30% | 🔴 |
| time_to_value | 4h | 1h | 24h | 🟢 |
| nps | -- | 50 | 30 | ⚪ |

🟢 Ideal | 🟡 Acceptable | 🔴 Red Zone | ⚪ No Data
```

## Integration Points

| Workflow | How It Uses IdealState |
|----------|----------------------|
| CreateCompany | Generates initial ideal-state.yaml |
| WeeklyReview | Compares current vs targets |
| MonthlyReview | Proposes target adjustments |
| metrics-dashboard.ts | Computes status for all metrics |

## Evolution

| Event | Action |
|-------|--------|
| Consistently hit ideal | Raise the bar (new ideal) |
| Consistently miss acceptable | Either fix operations or lower target |
| New strategic priority | Add metric |
| Metric no longer relevant | Remove or archive |
