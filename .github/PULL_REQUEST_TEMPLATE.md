<!--
Pick the template that matches this pull request:

  feature.md      new functionality           feat/<slug>
  bugfix.md       a bug fix                   fix/<slug>
  maintenance.md  chore, docs, refactor, test chore/<slug>
  release.md      a release                   chore/release-<version>

Append `?template=<file>` to the compare URL and open it again, for example:

  https://github.com/zhek/opencode-message-nav/compare/main...my-branch?expand=1&template=feature.md

Then delete this comment.
-->

## Summary

<!-- Why this change exists and what changes for the user. -->

## Type

- [ ] Feature — `feat/<slug>`
- [ ] Bug fix — `fix/<slug>`
- [ ] Maintenance — `chore`, `docs`, `refactor`, `test`, `perf`, `chore/<slug>`
- [ ] Release — `chore/release-<version>`

## Checklist

- [ ] The PR title is a Conventional Commit (`feat: …`, `fix: …`, `docs: …`, `chore: …`) and has no scope.
- [ ] The branch is named as shown above, one branch per unit of work.
- [ ] `bun test` passes.
- [ ] `bunx tsc --noEmit` passes.
- [ ] New behaviour and bug fixes come with automated tests in the same PR.
- [ ] `README.md` is updated in English; the project has no `README.ru.md` and no `docs/` tree.
- [ ] If entrypoints or the published package changed, the packed tarball is verified.
- [ ] A user-visible change is under `## Unreleased` in `CHANGELOG.md`; `version` in `package.json` is unchanged. A release PR is the only exception.
- [ ] `main` stays green: all tests pass and nothing is left broken.
