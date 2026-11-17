# AGENTS.md

`opencode-message-nav` — an OpenCode **V2 TUI-only plugin** (TypeScript, Bun for tests, npm for distribution). It puts
`Prev ↑` and `Next ↓` under the `Jump to latest ↓` row and dispatches the built-in
`session.message.user.previous` / `session.message.user.next` commands. Mouse-driven: no keybinds, no modal mode.
The implementation is one entrypoint, `src/tui.tsx`, covered by `test/tui.test.tsx`; `package.json` declares only the
`./tui` export.

Identity is fixed: package and repository `opencode-message-nav`, plugin id `opencode-message-nav`, README H1
`OpenCode Message Nav`. The package name stays the identifier in npm, `cli.json` and logs; the H1 is only the
human-readable title. The id is not the reserved `opencode.` namespace (the dot, as in `opencode.warming`) and does not
match `-opencode.*` wildcards.

## Non-negotiable rules

- **All code must be covered by automated tests.** New functionality and bug fixes always get one — a bug-fix test must
  reproduce the original defect (fails before the fix, passes after). An implementation task without tests is not done.
- **Definition of done.** `bun test` and `bunx tsc --noEmit` pass, new behaviour has a test, and a user-visible change
  updates `README.md` and `CHANGELOG.md` in the same commit. Documentation is part of the task, not a follow-up. A
  change with nothing for the user to notice — `chore`, `docs`, `refactor`, test work — does not touch `CHANGELOG.md`.
- **Everything is English.** Code, identifiers, file names, `README.md`, `CHANGELOG.md`, `SECURITY.md`. There is no
  `README.ru.md` and no `docs/` tree; `README.md` is the product document and `SECURITY.md` the security policy.
- **README links are absolute.** `README.md` is published on npm and rendered outside this tree, so every Markdown link
  and image in it MUST be a full `https://…` URL, including the license. A relative `LICENSE` link is broken there.
- **Changelog first, versions later.** An ordinary PR never touches the version. A user-visible change is added to
  `CHANGELOG.md` under `## Unreleased` at the top of the file, under the same subheadings a released entry uses:
  `### Added`, `### Changed`, `### Fixed`, `### Removed`. Such a PR creates no `## [X.Y.Z]` heading, adds no release link,
  and leaves `version` in `package.json` alone. The `## Unreleased` section is created by the first PR with something to
  put in it.
- **Only a PR from `chore/release-<version>` moves a version**, and it moves every trace of it in one commit: `## Unreleased`
  becomes `## [X.Y.Z] — date` with that day's date, `[X.Y.Z]: …/releases/tag/vX.Y.Z` is appended, and `version` in
  `package.json` becomes X.Y.Z. A feature raises the minor, a fix the patch. The prefix is plain `chore` —
  `release-<version>` is only a slug — and the commit is `chore: release <version>`. There is no `release` commit type in
  this project, and there is no need for one: squash-merge turns the PR title into the commit on `main`, so a type from
  the convention beats a prettier word. The branch name is the only marker: this project has no GitHub labels, and a rule
  that names one cannot be checked from the files. Anything a release PR leaves behind in `Unreleased` silently ships with
  the next release, which is the cost of a partial release PR.
- **The package starts at `0.0.0`.** That is a placeholder until the first release PR sets the published version; do not
  bump it in a feature or fix PR.
- **Write `CHANGELOG.md` and `README.md` from the user's side.** What changed in behaviour, what became configurable,
  what stopped working. Implementation detail — function and module names, how dispatch works, which slot is used — does
  not belong in a document a user reads; put it in code comments or the PR description. The test: if a line cannot be
  checked without opening the source, it is not a description for the user.
- **README pins every user-visible value.** A change that introduces or alters an option, user-visible text (button
  label, hint, error message), a default value or a constant must state it verbatim in `README.md`: the exact option
  name, its default value (say so when there is none), the text itself rather than a summary, and the constant's exact
  value and unit. "A configurable label" or "an error message" is not enough — a reader must be able to check the value
  without opening the source.
- **No logging.** The plugin writes no diagnostic logs and prints nothing from render paths. If a failure needs
  investigation during development, use `console.error` under `--print-logs` and remove it before merge.

## Commands

```bash
bun install                   # dependencies
bun test                      # full suite
bun test test/tui.test.tsx    # single file
bunx tsc --noEmit             # typecheck
```

The runner is **Bun**, not Node. Rendering tests use `testRender` from `@opentui/solid`; its setup provides
`captureCharFrame`, `captureSpans` and `mockMouse`. They sit on OpenTUI native modules and do not run under `node --test`
at all. Do not "fix" such a test by switching runners.

`test/preload.ts` routes `solid-js` to the client runtime and `bunfig.toml` loads it for every test. Without it, effects
never run and rendering tests pass against stale frames; do not remove it.

Write the test next to the behaviour it protects: a slot render asserts both labels, a click test stubs
`context.keymap.dispatch` and asserts the exact command id, a hover test asserts the theme-token change.

Before a release, verify the packed tarball, not only the sources: `bun pm pack`, unpack it into a temporary project's
`node_modules`, add that directory to `plugins` in `cli.json` (or pass it through `OPENCODE_CLI_CONFIG_CONTENT`), and run
`opencode --standalone --print-logs --log-level debug`. Expect `loading plugin …`, `entrypoint=…/src/tui.tsx`,
`plugin=opencode-message-nav`, and no `Cannot find package 'react'`. `bun test` does not cover this — it loads sources
from the repo, where `tsconfig` is read.

## No build step — do not add one

OpenCode imports the file the `./tui` export points at — `src/tui.tsx` — and runs it directly. There is no compile,
bundle, or watch step for the plugin to run, and adding one (tsc/build scripts run before testing) is wasted work.

`@opencode/plugin` must be installed in the repo (`bun install`) — it is a real dependency, not a global. Without it
OpenCode fails the plugin with:

```
failed to load plugin ... Cannot find package '@opencode/plugin'
```

Verify a change actually loaded, rather than assuming:

```bash
opencode plugin list          # expects SOURCE = this repo's path (a local TUI-only ID may be "-")
opencode --standalone --print-logs --log-level debug 2>&1 | grep -i "loading plugin\|failed to load"
```

A stale cached server can hide edits. Use `--standalone` for a private server, and note OpenCode installs as a compiled
binary — it is not a Node process, so a debugger on *your* Node process will not catch plugin code. Debug via logs and
`console.error` in `setup`.

A **running TUI also keeps the module graph it loaded**: discovery watches the plugin file itself, not the modules it
imports. Edits to `src/*.ts` therefore do not reach a live session — `touch src/tui.tsx`, or restart OpenCode, before
judging what the running plugin draws. `cli.json` itself is watched and reloads on save; a stale module graph is the
reason to restart, not a config edit.

## Plugin structure that matters

- TUI plugins are imported from **`@opencode/plugin/tui`** and OpenCode resolves that import at runtime — do not add an
  absolute path or vendor it. Core plugin surface is `@opencode/plugin`.
- This package is **TUI-only**: `exports` is `{ "./tui": "./src/tui.tsx" }`, with no root `index.ts`, no root `tui.ts`
  and no server entry. Activate it through `cli.json`. With `exports` present the CLI resolves `./tui` directly; a root
  `tui.ts` is only the fallback for a directory plugin without `package.json` exports. Add a server half and
  `exports["."]` only if the product decision changes.
- While developing inside another project, put the plugin under `.opencode/plugins/<name>/`; that directory is
  auto-discovered, so it needs no `opencode.json(c)` entry. This repo is loaded by path from `cli.json`, which is also
  how users install it. Discovery watches the file and reloads on change.
- Every `.tsx` with JSX starts with `/** @jsxImportSource @opentui/solid */`. OpenCode compiles a package installed into
  `node_modules` with the default JSX runtime and ignores the package's `tsconfig.json`, so without the pragma loading
  fails with `Cannot find package 'react'`. That is the price of shipping sources with no build step.
- Plugin JSX is compiled with static props, not reactive prop getters: a signal read inside a JSX prop is evaluated once.
  Write reactive renderable properties in a `createEffect` (the hover colour does this) and call
  `context.renderer.requestRender()`.
- `@opencode/plugin` is a `dependency`; **`@opentui/core`, `@opentui/solid`, and `solid-js` are `peerDependencies`**
  (only if JSX is rendered). Getting this wrong yields runtime resolution failures in the TUI, not build errors.
- CLI plugins are loaded via **`cli.json`** (`~/.config/opencode/cli.json`) to stay active against remote servers. There is
  **no project-local `cli.json`** — CLI preferences are global-only, so local overrides do not exist for this file.
- `setup(ctx)` may return a cleanup function. Event subscriptions (`ctx.data.on` / `ctx.data.listen`) must be aborted or
  unsubscribed there, and this plugin returns the `session.composer.top` slot's unregister function from `setup`.
- If a keymap layer is ever added, its factory must be **pure**. Layers are torn down when the plugin reloads, is
  disabled, or the component that created them is disposed — do not rely on layer state persisting.

## Git conventions

Commit messages are **English**, Conventional Commits.

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `chore`. Dependency bumps, build/config changes, and formatting
land under `chore`.

```text
<type>: <description>
```

- **No scope.** The description is enough; a scope repeats the area and filters nothing.
- Keep the body short. The code says *what*; the commit says *why*. Long bodies go stale faster than short ones.

Rules:

- **`main` is always green** — all tests pass and `bunx tsc --noEmit` is clean.
- **One branch per unit of work**, branched from `main`: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`.
- **`feat:` and `fix:` carry their tests in the same commit** — the test ships with the code, not in a follow-up.
- **Rule changes are `docs:` commits.** Editing `AGENTS.md` goes in a `docs:` commit, separate from implementation
  commits.
- **Documentation follows the change.** When a change is user-visible, `README.md` and `CHANGELOG.md` are updated in the
  same commit as the behaviour they describe; a docs-only edit may touch either alone.
- **Squash-merge** the PR into `main`; the PR title becomes the commit message.
- **Use the PR template.** Pick `feature.md`, `bugfix.md`, `maintenance.md` or `release.md` in
  `.github/PULL_REQUEST_TEMPLATE/`.

## Docs

- Official V2 docs only: `https://opencode.ai/v2/docs/`. The V1 paths (`opencode.ai/docs/`) describe the old API — avoid.
- Plugin guides: `/v2/docs/build/plugins` (core), `/v2/docs/build/plugins/cli` (TUI slots and context),
  `/v2/docs/cli/plugins` (loading TUI-only packages) and `/v2/docs/cli/keybinds` (command IDs).
- `README.md` starts with `# OpenCode Message Nav` — a human-readable title, no emoji — followed by one sentence: what
  the plugin adds and where. The npm package name stays in the badges, install snippet and `package.json`. It is the
  main product document; `SECURITY.md` holds the security policy.
- `README.md` is published on npm, so every link and image is a full `https://…` URL, including the license.
