# Dependency management

Manage project dependencies, check for updates, and security issues.

## Instructions

1. **Detect Package Manager**
   - Check for bun.lock (Bun)
   - Check for pnpm-lock.yaml (pnpm)
   - Check for yarn.lock (Yarn)
   - Check for package-lock.json (npm)
   - Default to bun for this setup

2. **Check Current State**
   - Verify node_modules exists
   - Check lockfile status
   - Count installed packages

3. **Execute Subcommand**
   - Run the appropriate operation based on arguments

## Arguments

- `/dep` - Show dependency overview and health
- `/dep outdated` - List all outdated packages
- `/dep update` - Update all to latest compatible versions
- `/dep update <pkg>` - Update specific package
- `/dep add <pkg>` - Add new dependency
- `/dep add -d <pkg>` - Add as dev dependency
- `/dep remove <pkg>` - Remove a dependency
- `/dep audit` - Run security vulnerability scan
- `/dep audit fix` - Auto-fix security vulnerabilities
- `/dep why <pkg>` - Show dependency tree for package
- `/dep clean` - Remove node_modules and reinstall fresh
- `/dep dedupe` - Deduplicate dependencies

## Output Format

For `/dep` (overview):
```
📦 Dependencies
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Package manager: bun
Lockfile:        ✓ bun.lock (in sync)
Packages:        847 installed
Size:            ~180 MB

Health:
  ✓ Lockfile in sync
  ⚠ 3 outdated packages
  ⚠ 1 security vulnerability

Outdated (major):
  next            14.1.0 → 15.0.0

Outdated (minor/patch):
  drizzle-orm     0.29.0 → 0.30.4
  @types/react    18.2.0 → 18.2.48

Security:
  ⚠ postcss: moderate severity
    Fix: /dep update postcss

━━━━━━━━━━━━━━━━━━━━━━━━━━━
/dep outdated  → Full list
/dep update    → Update all
/dep audit     → Security details
```

For `/dep outdated`:
```
📦 Outdated Packages
━━━━━━━━━━━━━━━━━━━━━

Major updates (breaking changes possible):
  Package         Current    Latest
  ─────────────────────────────────────
  next            14.1.0     15.0.0
  eslint          8.56.0     9.0.0

Minor updates (new features):
  Package         Current    Latest
  ─────────────────────────────────────
  drizzle-orm     0.29.0     0.30.4
  tailwindcss     3.4.0      3.4.3

Patch updates (bug fixes):
  Package         Current    Latest
  ─────────────────────────────────────
  @types/react    18.2.45    18.2.48
  typescript      5.3.2      5.3.3

━━━━━━━━━━━━━━━━━━━━━
6 outdated | 2 major | 2 minor | 2 patch

/dep update           → Update minor + patch
/dep update next      → Update specific package
```

For `/dep add zod`:
```
📦 Adding Dependency
━━━━━━━━━━━━━━━━━━━━

Installing zod...
  ✓ Installed zod@3.22.4

Package: zod
Version: 3.22.4
Size:    42 KB
License: MIT

Dependencies added: 0 (zod has no dependencies)
Security: ✓ No vulnerabilities

━━━━━━━━━━━━━━━━━━━━
✓ Added to dependencies
```

For `/dep audit`:
```
📦 Security Audit
━━━━━━━━━━━━━━━━━━

Scanning 847 packages...

Found 2 vulnerabilities:

HIGH: nth-check <2.0.1
  Issue:    Inefficient regex complexity
  Path:     css-select → nth-check
  Fix:      Update css-select to 5.1.0
  More:     https://github.com/advisories/GHSA-xxx

MODERATE: postcss <8.4.31
  Issue:    Line return parsing error
  Path:     postcss
  Fix:      Update postcss to 8.4.32
  More:     https://github.com/advisories/GHSA-xxx

━━━━━━━━━━━━━━━━━━
2 vulnerabilities | 1 high | 1 moderate

/dep audit fix → Auto-fix where possible
```

For `/dep why react-dom`:
```
📦 Why: react-dom
━━━━━━━━━━━━━━━━━━

react-dom@18.2.0 is required by:

  ├── (direct) package.json
  ├── next@14.1.0
  │   └── react-dom ^18.2.0
  └── @testing-library/react@14.0.0
      └── react-dom ^18.0.0

━━━━━━━━━━━━━━━━━━
3 dependents
```

For `/dep clean`:
```
📦 Clean Install
━━━━━━━━━━━━━━━━

This will:
  • Delete node_modules (180 MB)
  • Reinstall from lockfile

Proceed? (y/n)

  ✓ Removed node_modules
  ✓ Installing dependencies...
  ✓ Installed 847 packages

━━━━━━━━━━━━━━━━
✓ Clean install complete (23s)
```

## Notes

- For grapplingconnect: run from app/ directory
- Prefer `bun` commands over npm/yarn
- Show package sizes when adding dependencies
- Warn about major version updates (breaking changes)
- Always show security implications
