## Summary

<!-- Why this maintenance work matters. State it if any user-visible behaviour changes. -->

## Checklist

- [ ] This does not add new functionality; a feature uses the feature template.
- [ ] `bun test` passes.
- [ ] `bunx tsc --noEmit` passes.
- [ ] A code change comes with automated tests; a refactor keeps the existing tests green and does not change behaviour.
- [ ] `CHANGELOG.md` and `version` in `package.json` are untouched: `chore`, `docs`, `refactor` and test work have nothing for the user to notice.
- [ ] Documentation changes update `README.md` in English; there is no `README.ru.md` and no `docs/` tree.
- [ ] Changes to the project rules in `AGENTS.md` are a separate `docs:` commit.
- [ ] If entrypoints or the published package changed, the packed tarball is verified: `bun pm pack`, unpack it into a temporary project's `node_modules`, add that directory to `plugins` in `cli.json` (or pass it through `OPENCODE_CLI_CONFIG_CONTENT`), and run `opencode --standalone --print-logs --log-level debug`.
