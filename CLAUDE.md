# DataHorders CDN TypeScript SDK

## NPM Publishing

This package is published to npm as `@datahorders/cdn-sdk`.

### Automated Release Process

1. Update version in `package.json`
2. Commit and push to main
3. Create a GitHub release (tag format: `v1.0.0`)
4. The `.github/workflows/release.yml` workflow automatically publishes to npm

### GitHub Secrets Required

- `NPM_TOKEN` - npm granular access token with:
  - Read/write permissions for `@datahorders/cdn-sdk`
  - 2FA bypass enabled (required for CI publishing)

### Token Lifetime Issue

npm granular access tokens have a maximum 90-day lifetime. Classic automation tokens have been disabled by npm.

**Current token expires:** ~March 31, 2025 (created Dec 31, 2024)

**Workaround:** Set a calendar reminder to rotate before expiration.

To rotate the token:
1. Generate new token at https://www.npmjs.com/settings/datahorders/tokens
   - Type: Granular Access Token
   - Packages: `@datahorders/cdn-sdk` (read/write)
   - Enable "Bypass 2FA for automation"
2. Update the GitHub secret:
   ```bash
   cd /Volumes/Git\ Projects/github/cdn-typescript-sdk
   gh secret set NPM_TOKEN --body "npm_NEW_TOKEN_HERE"
   ```

## Build Commands

```bash
npm run build      # Build with tsup (CJS + ESM)
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript type checking
npm run test       # Run vitest tests
```
