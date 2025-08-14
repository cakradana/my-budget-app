# Claude AI Assistant Instructions

This document provides context for AI assistants working on this codebase.

## Code Quality Scripts

The project has two validation approaches:

### For CI/CD (GitHub Actions)

- Use `npm run validate` - This **checks** without modifying files
- CI should fail on formatting/linting issues to maintain standards
- The CI workflow uses `npm run check` for parallel checking

### For Local Development

- Use `npm run validate:fix` - This **auto-fixes** then validates
- Developers can quickly fix issues before committing
- Pre-commit hooks also run via Husky

## Important Commands

```bash
# CI/CD - fail on issues
npm run validate      # check + test (no modifications)
npm run check        # lint + format:check + type-check (parallel)

# Local Dev - auto-fix issues
npm run validate:fix  # check:fix + test
npm run check:fix    # lint:fix + format (sequential)
```

## Testing

- Framework: Vitest (NOT Jest)
- Coverage: 70% minimum threshold
- Run tests: `npm run test:run`
- Coverage: `npm run test:coverage`

## Database

- ORM: Drizzle
- Database: PostgreSQL
- Mock postgres in tests using tagged template literals

## Key Patterns

1. Always prefer editing existing files over creating new ones
2. Don't create documentation files unless explicitly requested
3. Use the validate:fix script when helping users fix issues locally
4. Remember that CI uses validate (not validate:fix) to ensure code quality
