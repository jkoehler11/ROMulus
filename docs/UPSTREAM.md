# Merging upstream into ROMulus

ROMulus is RomM plus one feature. That only stays true if merging upstream is a
routine, so this page records how the fork is shaped and how to pull a release.

## The shape of the fork

The plugin system is **additive**: its files are new, and its edits to RomM's
files are a few call sites. When upstream changes, the new files merge as
themselves and the call sites are the only places that can conflict.

| Kind | Files |
| --- | --- |
| Ours entirely | `backend/handler/plugin_handler.py`, `plugin_facts.py`, `plugin_options.py`, `backend/endpoints/plugins.py`, `backend/endpoints/responses/plugin.py`, `frontend/src/views/Settings/Plugins.vue`, `frontend/src/components/Settings/Plugin*.vue`, `frontend/src/components/shared/PluginSlot.vue`, `frontend/src/stores/plugins.ts`, `docs/PLUGINS.md`, `NOTICE` |
| Shared, ours is a hook | `backend/utils/context.py` (the shared public-only client), `backend/main.py` (router include), `backend/handler/auth/dependencies.py` (`assert_admin`) |
| Shared, ours is a slot | `backend/endpoints/roms/…` (nothing), `frontend/src/components/GameActions/PlayButton.vue` and `GameActions*.vue` (a plugin action in the row), `frontend/src/components/GameCard/GameCard.vue` (Play on a card), `frontend/src/components/Settings/SettingsSidebar.vue` (the entry), `frontend/src/lib/**` (nothing) |
| Shared, ours is a line | `frontend/src/locales/*/settings.json` — the `plugins*` keys, sorted in place |

The directory names stay `backend/` and `frontend/`, the package stays `romm`,
and the environment variables stay `ROMM_*`. Renaming them would touch every
file and make every upstream release a rewrite; the fork is the plugin system,
not a rename.

## Pulling a release

```sh
git fetch upstream --tags
git checkout -b merge/v<version>
git merge v<version>            # the tag, not master: releases are stable points
# resolve, in this order: uv.lock, generated models, then call sites
git push romulus merge/v<version>
# open a PR in ROMulus against main, read the diff, then merge
```

`uv.lock` and `frontend/src/__generated__/models/*` conflict easily and are
regenerated rather than hand-merged:

```sh
cd backend && uv lock
cd ../frontend && npm run generate   # after the backend's openapi is current
```

Never reformat either side's files to resolve a conflict. A diff that is
whitespace is a diff that hides the next merge's real conflict.

## After a merge

```sh
cd backend && uv run pytest tests/handler/test_plugin_*.py tests/endpoints/test_plugins.py -q
cd ../frontend && npx vitest run src/components/Settings src/components/shared src/components/GameActions
python3 src/locales/check_i18n_sorted.py && python3 src/locales/check_i18n_locales.py
```

Then start the app and check Settings → Plugins still lists, installs, and fills
a panel from a real source: a merge that compiles and drops the panel is the
failure nobody notices.

## Branding survives a merge on its own

The fork names itself ROMulus, and it does that without editing what upstream
writes, because those files are the ones every release rewrites:

- **UI copy.** `frontend/src/locales/**` stays byte-identical to upstream's. The
  name is applied as a bundle loads (`frontend/src/brand.ts`), so a translation
  merge never conflicts and strings upstream adds later are renamed too.
- **Backend copy.** One constant, `PRODUCT_NAME` in `backend/utils/__init__.py`,
  used by page titles, email subjects, feed titles, notification senders and the
  log tag.
- **Links and assets.** `SOURCE_REPO`/`SOURCE_REPO_URL` in the same frontend
  module; the About dialog, changelog and update banner read this fork's
  releases. The mark is `frontend/assets/isotipo.svg` plus the favicon set
  generated from it.

After a merge, the only branding step is checking that a new surface did not
arrive with its own asset: grep the merged tree for `rommapp/romm` (links that
should point at this fork) and for the old logo files under `frontend/assets`.

## What this fork does not take from upstream

- Changes to the plugin system itself, unless they are good ones.
- Upstream's branding of the UI: this fork's name, mark and links stay its
  own, and the mechanism above is what keeps them.
- Any change that makes a plugin able to run code on the server or reach a
  private address. That is the security line the whole feature rests on:
  public-only at connect time, an empty allowlist, no redirects, a size cap.
