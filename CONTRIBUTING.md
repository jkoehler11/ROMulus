# Contributing to ROMulus

ROMulus is a fork of [RomM](https://github.com/rommapp/romm) that adds a plugin
system. Everything RomM does, it still does, so this repository carries three
kinds of code and a change to each has its own destination.

| You are changing | Where the pull request goes |
| --- | --- |
| The plugin system, `docs/PLUGINS.md`, this fork's CI, its branding | This repository, against `main` |
| RomM's own code: scanning, auth, saves, the player, metadata, the UI it ships | [rommapp/romm](https://github.com/rommapp/romm), against `master`. A fix here is still welcome, but say that it is upstream's, and open an issue there too |
| Anything either side shares: `uv.lock`, generated models, a locale key | The side that owns it, then let the next release merge carry it across |

`main` is this fork's work; `master` is upstream's base and is never the target
of a pull request. How a release merge works is in [docs/UPSTREAM.md](docs/UPSTREAM.md).

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By taking
part, you are expected to uphold it. Upstream's spaces (its repository, Discord and
subreddit) have their own rules, and they apply when you are in them.

## AI assistance must be disclosed

> [!IMPORTANT]
>
> If you use **any kind of AI assistance** to contribute, it must be disclosed in
> the pull request, along with how far it went (docs only, versus generated code).
> An AI-written PR reply counts too. Trivial tab-completion does not.

An example disclosure:

> This PR was written primarily by Claude Code.

Or, more precisely:

> I consulted ChatGPT to understand the codebase, but the solution was written by
> hand.

This is not a formality. A maintainer reads a disclosure to decide how much
scrutiny a change needs, and an undisclosed one takes that decision away from
them.

## Before you open a pull request

Run what CI runs, in the directory it runs in:

```sh
cd backend  && uv run pytest -n auto tests/handler tests/endpoints   # what you touched
cd backend  && uv run mypy --config-file ../.trunk/configs/mypy.ini .
cd frontend && npm run test && npm run typecheck
cd frontend && python3 src/locales/check_i18n_locales.py && python3 src/locales/check_i18n_sorted.py
```

A directed test run is not the gate: the failures a single file hides are the ones
CI finds. `AGENTS.md`, `backend/AGENTS.md`, `frontend/AGENTS.md` and
`.claude/skills/` in the repository are binding rules, not suggestions.

Write the PR title as a [Conventional Commit](https://www.conventionalcommits.org/),
such as `fix(plugins): keep a refused read from emptying the shelf`. The allowed
types are `feat`, `fix`, `perf`, `refactor`, `revert`, `docs`, `style`, `test`,
`build`, `ci` and `chore`, and CI checks the title.

## Keep the fork mergeable

The plugin system is additive so that upstream releases merge as merges. That
survives only if contributions stay small and named:

- Do not rename the package, the directories or the `ROMM_*` variables. The name a
  reader sees is applied as a layer (`frontend/src/brand.ts`, `PRODUCT_NAME` in the
  backend), never as a rename.
- Do not reformat a file you are not changing, and never reformat either side to
  resolve a conflict.
- Put a new setting on the model that owns it and import it; do not add a second
  copy of a constant, a limit or a regex.

## Translating

Add a folder under `frontend/src/locales`, follow an existing language, and add the
language's own name to the picker's list. Two things surprise people:

- **Leave `RomM` as it is.** Upstream's locale files are not edited by this fork;
  the name is rewritten to ROMulus as each bundle loads, so `RomM` in a
  translation is correct and will read as ROMulus at runtime.
- **A copy of the English is not a translation.** A locale that still holds the
  English string is shipped as-is, so translate as you go, and keep `en_GB` and
  brand names as they are.

## Documentation

`docs/PLUGINS.md` describes the plugin system and lives here. Everything else is
documented at [docs.romm.app](https://docs.romm.app), which upstream maintains:
open documentation fixes there, not here.

## Issues

Bugs and suggestions go to [this repository's issues](https://github.com/jkoehler11/ROMulus/issues).
Say which image or commit you ran, what you expected, and how to reproduce it. If
the fault is in code this fork inherited from RomM, open an issue upstream as well:
that is where it gets fixed for everyone, and the next release merge brings the fix
here.

## Licensing

ROMulus is AGPL-3.0. By contributing, you agree that your contribution is licensed
under the project's [LICENSE](LICENSE), and that the modification record in
[NOTICE](NOTICE) may name it.
