## Summary

<!-- What went wrong and what should happen instead. -->

Fixes #<issue>

Branch: `fix/<slug>`

## Reproduction

<!-- Steps, input or environment that shows the defect. -->

## Checklist

- [ ] A regression test reproduces the defect: it fails before the fix and passes after.
- [ ] The test and the fix are in the same commit.
- [ ] `bun test` passes.
- [ ] `bunx tsc --noEmit` passes.
- [ ] If the fix is user-visible, it is under `### Fixed` in `## Unreleased` of `CHANGELOG.md`.
- [ ] `version` in `package.json` is unchanged; only a release PR moves it.
- [ ] `README.md` is updated in English; there is no `README.ru.md` and no `docs/` tree.
- [ ] If entrypoints or the published package changed, the packed tarball is verified: `bun pm pack`, unpack it into a temporary project's `node_modules`, add that directory to `plugins` in `cli.json` (or pass it through `OPENCODE_CLI_CONFIG_CONTENT`), and run `opencode --standalone --print-logs --log-level debug`.
