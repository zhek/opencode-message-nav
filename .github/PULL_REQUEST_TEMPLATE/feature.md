## Summary

<!-- What the user can do after this change that they could not do before. -->

## Scope

- Branch: `feat/<slug>`
- Issue: #<issue>

## Checklist

### Behaviour and tests

- [ ] New behaviour is covered by automated tests in the same PR.
- [ ] A slot render asserts both labels; a click test stubs `context.keymap.dispatch` and asserts the exact command id; a hover test asserts the theme-token change.
- [ ] `README.md` states every user-visible option, label, default value and requirement verbatim.
- [ ] The package stays TUI-only: `exports` is `{ "./tui": "./src/tui.tsx" }`, with no server half and no root `index.ts`.

### Verification

- [ ] `bun test` passes.
- [ ] `bunx tsc --noEmit` passes.
- [ ] If entrypoints or the published package changed, the packed tarball is verified: `bun pm pack`, unpack it into a temporary project's `node_modules`, add that directory to `plugins` in `cli.json` (or pass it through `OPENCODE_CLI_CONFIG_CONTENT`), and run `opencode --standalone --print-logs --log-level debug`; expect `loading plugin …`, `entrypoint=…/src/tui.tsx` and `plugin=opencode-message-nav`, with no `Cannot find package 'react'`.

### Documentation and changelog

- [ ] `README.md` is updated in English; there is no `README.ru.md` and no `docs/` tree.
- [ ] The user-visible change is under `## Unreleased` in `CHANGELOG.md`, under `### Added`, `### Changed`, `### Fixed` or `### Removed`.
- [ ] `version` in `package.json` is unchanged; only a release PR moves it.

### Commits

- [ ] Feature commits include their tests in the same commit.
- [ ] A change to the project rules in `AGENTS.md` is a separate `docs:` commit.
