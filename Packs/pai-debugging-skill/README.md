---
name: PAI Debugging Skill
pack-id: pai-debugging-skill-v1.0.0
version: 1.0.0
author: salexanderb
description: Systematic debugging workflows for finding and fixing bugs. Follows structured process - reproduce, isolate, understand, fix, verify. Includes error analysis and MRE creation.
type: skill
purpose-type: [debugging, troubleshooting, error-analysis, bug-fixing]
platform: claude-code
dependencies: []
keywords: [debug, bug, error, troubleshoot, fix, stack-trace, reproduce, isolate, MRE]
---

# PAI Debugging Skill

> Systematic approach to finding and fixing bugs. Follows a structured process: reproduce → isolate → understand → fix → verify.

> **Installation:** This pack is designed for AI-assisted installation. Give this directory to your AI and ask it to install using `INSTALL.md`.

---

## What This Pack Provides

- **Systematic Investigation** - Structured process from symptom to verified fix
- **Error Analysis** - Parse error messages and stack traces effectively
- **MRE Creation** - Create Minimum Reproducible Examples for isolation
- **Quick Debugging Checklist** - Common causes to check first
- **Root Cause Analysis** - "Five Whys" technique to find true cause

## Core Principle

**Don't guess. Investigate systematically.** Random changes waste time and can introduce new bugs. Follow the evidence.

## Architecture

```
Debugging Skill
├── SKILL.md                     # Main entry point and routing
└── workflows/
    ├── Investigate.md           # Full debugging process
    ├── AnalyzeError.md          # Parse errors and stack traces
    └── CreateMRE.md             # Minimum Reproducible Example
```

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

## Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **Investigate** | "debug", "fix bug", "troubleshoot" | Full debugging process |
| **AnalyzeError** | "error message", "stack trace", "exception" | Parse and understand errors |
| **CreateMRE** | "reproduce", "minimal example", "isolation" | Create isolated reproduction |

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

## Usage Examples

```
"The login form isn't working"
→ Invokes Investigate workflow
→ Step 1: Reproduce - what exactly happens?
→ Step 2: Isolate - is it frontend, API, or database?
→ Step 3: Understand - find the actual bug
→ Step 4: Fix and verify

"I'm getting TypeError: Cannot read property 'map' of undefined"
→ Invokes AnalyzeError workflow
→ Analyzes stack trace
→ Identifies the undefined variable
→ Suggests defensive fix

"This only fails in production, help me reproduce it"
→ Invokes CreateMRE workflow
→ Identifies environmental differences
→ Creates minimal test case
→ Bug becomes reproducible locally
```

## Error Message Quick Reference

| Error | Likely Cause | Quick Fix |
|-------|--------------|-----------|
| `undefined is not an object` | Accessing property of undefined | Add null check `?.` |
| `X is not a function` | Wrong import, typo | Check import/export |
| `Cannot find module 'X'` | Wrong path, missing dependency | Check path, run install |
| `Unexpected token '<'` | Got HTML instead of JSON | Check API URL, auth |
| `CORS error` | Cross-origin blocked | Configure CORS on server |
| `ECONNREFUSED` | Server not running | Start the server |
| `ENOENT` | File not found | Check file path exists |

## What's Included

| Component | File | Purpose |
|-----------|------|---------|
| Main Skill | src/skills/Debugging/SKILL.md | Entry point and workflow routing |
| Investigate | src/skills/Debugging/workflows/Investigate.md | Full debugging process |
| AnalyzeError | src/skills/Debugging/workflows/AnalyzeError.md | Error/stack trace analysis |
| CreateMRE | src/skills/Debugging/workflows/CreateMRE.md | Minimal reproduction creation |

## Root Cause Analysis: Five Whys

```
1. Why did the login fail? → The token was null
2. Why was the token null? → The API returned an error
3. Why did the API return an error? → User wasn't found
4. Why wasn't the user found? → Email had trailing whitespace
5. Why did email have whitespace? → No input trimming on form

Root cause: Missing input sanitization
```

## Integration

**Works well with:**
- **TDD** - Write test that reproduces bug first (regression test)
- **CodeAudit** - Find type safety issues that cause errors
- **Refactor** - Clean up after fixing bugs

## Model Interoperability

This skill is workflow-based with no CLI tools. Any model can:
1. Read the workflow files
2. Follow the step-by-step instructions
3. Apply debugging techniques

The workflows are deterministic procedures that any model can execute.

## Credits

- **Author:** salexanderb
- **License:** MIT

## Changelog

### 1.0.0 - 2026-02-19
- Initial release
- Investigate workflow (full debugging process)
- AnalyzeError workflow (error/stack trace analysis)
- CreateMRE workflow (minimum reproducible example)
- Quick debugging checklist
- Common error reference table
