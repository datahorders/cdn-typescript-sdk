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

npm granular access tokens have a maximum 90-day lifetime. Options to handle this:

1. **Calendar reminder** - Set a reminder to rotate the token before expiration
2. **Use classic Automation token** - These don't expire but have broader permissions
3. **GitHub Actions workflow** - Could potentially create a workflow that alerts when token is near expiry (would need npm API access)

To rotate the token:
```bash
# Generate new token at https://www.npmjs.com/settings/YOUR_USERNAME/tokens
# Then update the secret:
gh secret set NPM_TOKEN --body "npm_NEW_TOKEN_HERE"
```

## Build Commands

```bash
npm run build      # Build with tsup (CJS + ESM)
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript type checking
npm run test       # Run vitest tests
```
