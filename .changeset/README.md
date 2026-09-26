# Changesets

Every PR that changes what users of `pixi-silk` see (API, rendering, bundle) adds a changeset:

```bash
pnpm changeset
```

Pick the bump (`patch` for fixes, `minor` for features, `major` for breaking changes) and write one
line for the changelog. On merge to `main`, the release workflow opens a "Version Packages" PR.
Merging that PR publishes to npm with provenance.
