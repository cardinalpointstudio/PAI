# Build and test the project

Run the full build pipeline including type checking, linting, tests, and build.

## Instructions

Execute these steps sequentially, stopping on first failure:

1. **Type Check**
   - Run `bun run tsc --noEmit` (or check tsconfig.json for custom command)
   - Report any TypeScript errors

2. **Lint**
   - Run `bun run lint` or `bun run lint:fix` if available
   - Report any lint errors

3. **Unit Tests**
   - Run `bun test` or `bun run test:run`
   - Report pass/fail counts

4. **Build**
   - Run `bun run build`
   - Report success or failure with error details

## Output Format

```
🔨 Build Pipeline
━━━━━━━━━━━━━━━━━

[1/4] Type checking...
  ✓ No TypeScript errors

[2/4] Linting...
  ✓ No lint errors

[3/4] Running tests...
  ✓ 47 passed | 0 failed | 2 skipped

[4/4] Building...
  ✓ Build completed successfully

━━━━━━━━━━━━━━━━━
✓ All checks passed
```

On failure:
```
[3/4] Running tests...
  ✗ 45 passed | 2 failed

  FAILED: src/components/Button.test.tsx
    ✗ should render correctly
    ✗ should handle click

━━━━━━━━━━━━━━━━━
✗ Pipeline failed at: tests
```

## Notes

- Check for package.json scripts to determine correct commands
- If in a monorepo (app/ subdirectory), cd into it first
- For grapplingconnect: run from the `app/` directory
- Show first 10 lines of errors, suggest running full command for more
