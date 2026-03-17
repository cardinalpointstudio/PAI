# Model: Principles

> **Purpose:** Cultural rules and tie-breakers for decision-making
> **Format:** Markdown
> **Location:** `company-os/companies/{company}/principles.md`

---

## Overview

Principles are the cultural operating system — short, sharp rules that guide behavior when in doubt. They resolve ambiguity without needing a manager.

Inspired by both Miessler (systems thinking) and Lütke (high-agency culture).

## What Makes a Good Principle

| Quality | Description |
|---------|-------------|
| **Actionable** | Tells you what to do, not just what to value |
| **Specific** | Can be applied to real situations |
| **Memorable** | Short enough to recall under pressure |
| **Opinionated** | Takes a stance (not "be balanced") |
| **Testable** | You can tell if you followed it or not |

## Anti-Patterns

| Bad Principle | Why Bad | Better Version |
|---------------|---------|----------------|
| "We value excellence" | Vague, untestable | "Ship daily or explain why you didn't" |
| "Work-life balance" | Means different things to everyone | "No meetings before 10am or after 5pm" |
| "Customer first" | Too generic | "When in doubt, give the refund" |
| "Move fast" | No boundary | "Move fast, but measure twice on billing code" |

## File Format

```markdown
# Principles: {company}

> These rules guide decision-making when in doubt.
> Last updated: {date}

---

## Operating Principles

### 1. {Principle Name}

**Rule:** {One sentence, imperative}

**Applies when:** {Situation where this matters}

**Example:** {Concrete application}

---

### 2. {Principle Name}

...

---

## Hiring Principles

### 1. {Principle}

...

---

## Decision Hierarchy

When principles conflict:
1. {Highest priority}
2. {Second priority}
3. {Third priority}

---

## Anti-Principles

Things we explicitly don't do:

- {Anti-principle 1}
- {Anti-principle 2}
```

## Example

```markdown
# Principles: GrapplingConnect

> These rules guide decision-making when in doubt.
> Last updated: 2026-03-01

---

## Operating Principles

### 1. Ship Daily

**Rule:** Deploy something to production every day, or write down why you didn't.

**Applies when:** Deciding between "polish more" vs "ship now"

**Example:** Feature works but UI isn't perfect? Ship it. No deploys today because you're stuck? Document the blocker.

---

### 2. Automate the Second Time

**Rule:** First time, do it manually. Second time, script it.

**Applies when:** A task comes up more than once

**Example:** First customer needs manual onboarding help? Do it personally. Second customer same issue? Build the self-serve flow.

---

### 3. Talk to Users Weekly

**Rule:** Have at least one real conversation with a user every week.

**Applies when:** Deciding between "build what I think" vs "build what they need"

**Example:** Before building a feature, call a gym owner. After shipping, ask how they're using it.

---

### 4. Simple Over Configurable

**Rule:** When in doubt, pick the opinionated default. Don't add a setting.

**Applies when:** Designing features with multiple valid approaches

**Example:** Don't ask "how many days before trial reminder?" — just send it at 24 hours. If that's wrong, change the default.

---

### 5. Document Once, Reuse Forever

**Rule:** If you explain something twice, write it down.

**Applies when:** Answering the same question or doing the same task again

**Example:** Second user asks how to connect Stripe? Write the docs. Second time running a deploy process? Write the SOP.

---

### 6. Every Node Has One Owner

**Rule:** Every process has exactly one person accountable. No committees.

**Applies when:** Assigning responsibility for anything

**Example:** "Support" is not an owner. "Alex, who owns support SOP" is an owner.

---

### 7. Metrics Over Vibes

**Rule:** If you can't measure it, you can't improve it. Define success before building.

**Applies when:** Starting any new initiative

**Example:** Before building a feature, define: "Success = X users using it within Y days, measured by Z"

---

## Hiring Principles

### 1. Few But Great

**Rule:** Hire slow, fire fast. No passengers.

**Applies when:** Deciding to add headcount

**Example:** Better to be understaffed with A-players than fully staffed with B-players.

---

### 2. Builders Over Managers

**Rule:** At this stage, everyone should be able to do the work, not just direct it.

**Applies when:** Evaluating candidates

**Example:** First engineer should ship code, not manage sprints.

---

## Decision Hierarchy

When principles conflict:
1. **Safety** — Don't ship if it could hurt users
2. **Users** — Their needs beat our preferences
3. **Simplicity** — Simpler beats "more complete"
4. **Speed** — Shipping beats perfection

---

## Anti-Principles

Things we explicitly don't do:

- **No heroics** — If a process requires someone to work late, the process is broken
- **No feature flags** — Ship to everyone or don't ship (at our scale)
- **No stakeholder management** — We don't have stakeholders, we have users
- **No roadmap theater** — We don't pretend to know Q4 priorities
- **No meetings as defaults** — Async first, sync when necessary
```

## Integration Points

| Workflow | How It Uses Principles |
|----------|----------------------|
| CreateCompany | Generates initial principles.md |
| AssignRoles | References "Every Node Has One Owner" |
| WeeklyReview | Tie-breaks when picking focus |
| MonthlyReview | Evaluates if principles are being followed |

## Evolution

| Event | Action |
|-------|--------|
| Principle regularly violated | Either reinforce or admit it's wrong and remove |
| New situation not covered | Add principle after resolving it |
| Principle conflicts in practice | Add to hierarchy or revise one |
| Principle is never referenced | Remove (it's not useful) |

## Onboarding Use

New team members should:
1. Read principles on day 1
2. Ask "which principle applies?" when unsure
3. Propose new principles if they see gaps
