## Release

- Version: `X.Y.Z`
- Branch: `chore/release-<version>`
- Release date: `YYYY-MM-DD`

A feature raises the minor version; a fix raises the patch version.

## Checklist

- [ ] `## Unreleased` is renamed to `## [X.Y.Z] — YYYY-MM-DD` with today's date.
- [ ] `[X.Y.Z]: https://github.com/zhek/opencode-message-nav/releases/tag/vX.Y.Z` is appended to `CHANGELOG.md`.
- [ ] `version` in `package.json` is `X.Y.Z`.
- [ ] Everything that was under `## Unreleased` is carried into the release; nothing is left behind to ship silently with the next release.
- [ ] The version bump matches the accumulated entries: a feature raises the minor, a fix raises the patch.
- [ ] The PR carries only the release changes.
- [ ] `bun test` passes.
- [ ] `bunx tsc --noEmit` passes.
- [ ] The packed tarball is verified: `bun pm pack`, unpack it into a temporary project's `node_modules`, add that directory to `plugins` in `cli.json` (or pass it through `OPENCODE_CLI_CONFIG_CONTENT`), and run `opencode --standalone --print-logs --log-level debug`; expect `loading plugin …`, `entrypoint=…/src/tui.tsx` and `plugin=opencode-message-nav`, with no `Cannot find package 'react'`.
- [ ] `main` is green: all tests pass.
