---
name: Debugging
description: Systematic debugging workflows for finding and fixing bugs. USE WHEN user says 'debug', 'fix bug', 'why is this broken', 'not working', 'find the bug', 'troubleshoot', OR user encounters an error and needs help diagnosing it.
---

# Debugging

Systematic approach to finding and fixing bugs. Follows a structured process: reproduce → isolate → understand → fix → verify.

## Core Principle

**Don't guess. Investigate systematically.** Random changes waste time and can introduce new bugs. Follow the evidence.

## The Debugging Process

```
┌──────────────┐     ┌─────────────┐     ┌────────────┐     ┌───────┐     ┌────────┐
│  Reproduce   │ ──▶ │   Isolate   │ ──▶ │ Understand │ ──▶ │  Fix  │ ──▶ │ Verify │
│  the bug     │     │   the cause │     │  root cause│     │       │     │        │
└──────────────┘     └─────────────┘     └────────────┘     └───────┘     └────────┘
```

1. **Reproduce**: Can you make it happen consistently?
2. **Isolate**: What's the smallest code that triggers it?
3. **Understand**: Why does this happen?
4. **Fix**: Change the code to fix the root cause
5. **Verify**: Confirm fix works and didn't break anything

## Workflow Routing

**When executing a workflow, output this notification:**

```
Running the **WorkflowName** workflow from the **Debugging** skill...
```

| Workflow | Trigger | File |
|----------|---------|------|
| **Investigate** | "debug", "fix bug", "why broken", "troubleshoot" | `workflows/Investigate.md` |
| **AnalyzeError** | "error message", "stack trace", "exception", "crash" | `workflows/AnalyzeError.md` |
| **CreateMRE** | "reproduce", "minimal example", "isolation" | `workflows/CreateMRE.md` |

## Examples

**Example 1: User reports a bug**
```
User: "The login form isn't working"
→ Invokes Investigate workflow
→ Step 1: Reproduce - what exactly happens?
→ Step 2: Isolate - is it frontend, API, or database?
→ Step 3: Understand - find the actual bug
→ Step 4: Fix and verify
```

**Example 2: User has an error message**
```
User: "I'm getting TypeError: Cannot read property 'map' of undefined"
→ Invokes AnalyzeError workflow
→ Analyzes stack trace
→ Identifies the undefined variable
→ Suggests defensive fix
```

**Example 3: User needs to isolate a bug**
```
User: "This only fails in production, help me reproduce it"
→ Invokes CreateMRE workflow
→ Identifies environmental differences
→ Creates minimal test case
→ Bug becomes reproducible locally
```

## Quick Debugging Checklist

Before diving deep, check these common causes:

| Category | Quick Checks |
|----------|--------------|
| **Typos** | Variable names, imports, file paths |
| **Types** | null/undefined, wrong type, missing conversion |
| **Async** | Missing await, race conditions, unhandled promises |
| **State** | Stale state, mutation bugs, missing updates |
| **Environment** | Wrong config, missing env vars, version mismatch |
| **Cache** | Stale cache, build cache, browser cache |

## Integration with Other Skills

| Skill | How It Helps Debugging |
|-------|------------------------|
| **TDD** | Write test that reproduces bug first |
| **CompoundEngineering** | Document learnings for future reference |
| **Observability** | Monitor for errors in real-time |

## Reference

See `DebugPatterns.md` for common bug patterns and solutions.
