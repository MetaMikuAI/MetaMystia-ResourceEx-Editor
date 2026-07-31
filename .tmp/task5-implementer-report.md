# Task 5 implementer report

## Status

COMPLETE_REVIEWED_PENDING_COMMIT

## Investigation gate

- Baseline: `708b843f8df01dcc9d486d7197ea22b2364c6ab1`; the worktree was clean before Task 5 changes.
- Fully read root `AGENTS.md`, the reference-project-sync README and documents 01—11, including the complete Task 5, ResourceEx lifecycle, ownership, validation, deviation and patch boundaries.
- Fully read the old owners: `DataContext.tsx` (798 lines), context serialization utilities, `resource.d.ts` (467 lines), constants, export validation, asset path helpers, both providers and the App Navbar.
- Read the fixed reference `app/shared/utilities/objects/cloneJsonObject.ts` at `d3b06126676430943856dfadc0bc8170920f9f72`; no reference ResourceEx business owner exists or is eligible for copying.
- Enumerated 30 context importers, 64 old resource type importers, four old constants importers, 12 direct `setData` route owners and six direct Object URL owners.
- Source-of-truth/lifecycle risks established before implementation: old import mutates asset refs and revokes current URLs before full success; LICENSE enters the asset snapshot; serialization mutates nested editor state through a shallow clone; dirty is separable from data mutation in 12 routes; persistent URL creation/revocation is mixed into the Provider.

## RED evidence

- Created `.tmp/task5-domain-harness.mjs` before production modules. It specifies the seven Task 1 normalization/export/archive comparisons, pure serialization identity check, LICENSE/entry ownership, mandatory `assets/` root and invalid `characters` path error.
- First run: `node .tmp/task5-domain-harness.mjs` exited 1 with `ERR_MODULE_NOT_FOUND` for `app/features/resourceEditor/client/archive/readResourcePackArchive.ts`. This is the expected RED because Task 5 owners did not exist.

## Review round 1 failure and repair

- The first independent review rejected the initial implementation. It identified shallow entity/wire validation hidden behind broad assertions, export validation not bound to an immutable revision, stale asset-folder closures and non-transactional Object URL replacement, missing reserved-Label domain/export hard guards, and asset references collected from a different pre-trim view than exported JSON.
- The expanded domain harness produced 11 initial failures across PackInfo, entity leaves, nested fields and discriminated unions. A focused legal-extra test separately produced RED because `eventNodes[0].futureField` was dropped. The repaired path-aware readers now reject wrong required/optional/null shapes with exact paths, preserve explicit `undefined`, legal `null` and unknown extension fields, and contain no final `as unknown as ResourceEx` escape.
- Added `createResourcePackExportView`, which deep-clones, performs existing business clipping/sorting/trim/CRLF cleanup once, and derives the downloaded ResourceEx view, JSON and referenced paths from that same result. A real ZIP assertion proves trimmed `external/referenced.png` is included with exact bytes and the whitespace path is absent.
- Added revision-backed Provider refs and `runResourcePackExport`: Navbar binds issues to the validated revision, stale revisions fail before writing, the writer receives one consistent snapshot, and a completed old export cannot clear dirty after an intervening mutation. Reserved `CORE`/`DLC1` and invalid `Bad/Pack` labels are rejected by both domain issues and an unbypassable export guard.
- Added transactional asset-map operations and an idempotent Object URL registry. All URLs for a replace/copy are created before commit, failures revoke only newly created URLs and preserve old maps, successful commits revoke superseded URLs, move reuses the source URL, and the hook reads files/folders/URLs through current refs.

## Review round 2 failure and repair

- The second independent review still rejected Task 5. The path-aware readers had made legacy-optional guest collections and Food/Beverage tag collections wire-required; `packInfo.license` still had to be a string even though the field must be ignored; old hook/import callbacks could enter a disposed registry or state commit path after unmount.
- Added missing/default and present-wrong-type cases before production changes. The domain harness initially exited 1 with 13 failed checks; the state harness initially failed because create after dispose reached the URL environment. Guest missing collections now normalize to nine empty evaluation entries and empty arrays, Food/Beverage tags to empty arrays, while present invalid shapes keep precise path errors. `packInfo.license` is omitted before any type validation for `null`, number, object and array inputs.
- The Object URL registry now rejects create before touching its environment once disposed. `useAssetStore` creates a new registry in each effect setup, reads it through a mounted ref in every mutation callback, and makes old update/copy/move/folder/replace callbacks no-ops after real unmount. This keeps React StrictMode cleanup/setup usable instead of permanently poisoning a render-captured registry.
- `ResourceEditorProvider` tracks its mounted lifetime. A pending import checks it after archive read and before asset/state replacement; an unmounted provider returns `资源编辑器已卸载`, suppresses expected cancellation logging and avoids state setters in `finally`.

## Implementation

- Created the entity-split ResourceEx contracts, parser-only wire contract, domain constants, blank pack factory, unknown-to-wire validation/normalization, pure serialization, pure validation and asset-reference collection. `cloneJsonObject` matches the fixed reference implementation.
- Created client-only archive read/write/download adapters with the documented entry truth table. `ResourceEx.json`, `LICENSE.md` and `__MACOSX/**` never enter the ordinary file snapshot; `assets/` always exists; assets files always round-trip; non-assets files round-trip only when referenced.
- Created `useAssetStore` as the only persistent Blob URL owner and `ResourceEditorProvider` as the domain/archive/assets/dirty composition owner. Archive operations have ref-backed duplicate-submit guards and UI pending state.
- Migrated all callers to the new entity leaves, domain constants, `validateResourcePackForExport`, `useResourceEditor` and the image-dimensions adapter. All Screen writes use one `updateResourcePack` command, with dirty marking inside the owner.
- Deleted the old DataContext, context utilities, ResourceEx type barrel/declaration, constants and monolithic validation file only after caller scans reached zero.
- Migrated all four transient image callers to `readImageDimensions`; Blob URL source scanning now finds only `useAssetStore.ts` and `readImageDimensions.ts`.
- Updated formal documents 03, 05, 06, 08, 09 and 10 with actual files, checks, compatibility impact, warnings, unverified areas and the Task 6 entry.

## Deterministic verification

- Final `node .tmp/task5-domain-harness.mjs`: exit 0, `Task 5 domain/archive harness: 7 fixtures and expanded wire paths passed` (plus Node's experimental type-stripping warning).
- Covered normalized JSON, serialized JSON bytes, input-state purity, ten required collections, ZIP entry order/dir/bytes, LICENSE manifest SHA-256, asset SHA-256, Branch `price` clipping, PackInfo/entity/nested/union path reporting, legal extra-field preservation, legacy missing/default versus present-wrong-type behavior, arbitrary ignored `packInfo.license` values and the trimmed non-assets ZIP entry.
- Final `node .tmp/task5-state-harness.mjs`: exit 0, `Task 5 state/assets harness: revision, label guards, URL transactions passed`. It covers deferred snapshot/dirty behavior, stale revision rejection, reserved/invalid/normal Label guards, exact replace/update/remove/copy/move URL sequences, create failure rollback, idempotent revoke/dispose and rejection of create after dispose before the environment is called.
- The checked-out exported LICENSE fixture has cross-device LF bytes while the input/archive manifest preserves the original CRLF/trailing spaces; the harness therefore verifies the authoritative manifest SHA-256 and never rewrites the fixture.

## Browser verification

- Production build: sandbox attempt failed only because `fonts.loli.net` DNS was blocked; the approved network retry exited 0, compiled and type-checked, generated 16/16 static pages and exported successfully.
- Initial clean state did not prevent `beforeunload`; editing the Info name set dirty and preserved the new value.
- Cancelled dirty overwrite import kept the sentinel value, dirty state and URL counts `0/0`.
- Accepted invalid-characters import reported `ResourceEx.json 无效: characters must be an array or null`; state/dirty/URL counts remained unchanged.
- Accepted missing-LICENSE import replaced state, cleared dirty and produced persistent URL `6/0`. Repeating with empty-LICENSE produced cumulative `12/6` and revoked all first-generation URLs. Creating a blank pack restored defaults, stayed clean and produced `12/12`, all created URLs revoked.
- The old empty-LICENSE baseline created a seventh URL for `LICENSE.md`; the new reader intentionally excludes LICENSE from the file/URL snapshot under the document 08 owner rule. This compatibility change is recorded as D16 and must not be described as count-equivalent.
- A no-issues export downloaded `NewPack-v1.0.0.zip`; the edited name remained and dirty changed from true to false after the download was triggered.
- SpriteUploader transient integration: accepted wrong-size valid PNG yielded `2/1` (transient revoked, persistent live); cancelling the same size warning yielded `3/2`; supplying a ZIP as corrupt image yielded `4/3`, revoked the failed transient URL and left the persistent preview unchanged.
- Final browser console on the integration page contained only the existing `/favicon.ico` 404. The deliberately invalid import also emitted the expected Provider `console.error` before its UI alert. Observed RSC prefetch requests returned 200.
- Python's simple static server lacks extensionless fallback, so generated `/info.html` and `/ingredient.html` were used for this Task 5 behavior check. The production-like 12-route hosting matrix remains a Task 9 check.
- A focused real Next/React/Playwright probe captured an old `updateAsset` callback, replaced assets/folders, created a new folder and invoked the old callback later. The final folder snapshot remained exactly `assets/`, `assets/imported/`, `assets/imported/new/`. Replacing those files and unmounting under development StrictMode created four tracked persistent URLs; every URL had a final revoke count of exactly one.
- The round-2 clean-session Next/React/Playwright probe first reproduced three disposed-registry callback errors plus a deferred-import Provider `console.error`. After repair, StrictMode cleanup/setup allowed a mounted update to create one URL; real unmount revoked it exactly once; old update/copy/move/folder/replace callbacks produced no URLs, exceptions or state updates. A deferred ZIP import resolved after Provider unmount and returned `资源编辑器已卸载` without committing assets/state. The route recorded empty callback/console error arrays; the only browser console error was the existing `/favicon.ico` 404.

## Static verification and cleanup

- Latest repair-round `pnpm exec tsc --noEmit`: exit 0.
- Latest repair-round production build: ordinary sandbox failed only on `fonts.loli.net` DNS; the approved network retry exited 0, compiled, type-checked, generated 16/16 static pages and exported 2/2 groups.
- Focused Prettier: exit 0 after formatting only applicable Task 5 product/docs/report files; no repository-wide or fixture-tree formatting.
- `git diff --check` and `git diff --cached --check`: exit 0.
- Old-owner/import scan: zero `@/components/context/DataContext`, `useData`, separated `setData`/`setHasUnsavedChanges`, `@/lib/constants`, `@/types` or old validation callers outside deleted files.
- Domain boundary scan: no React, JSZip, FileSaver, Web Crypto, Blob URL, `window` or browser events under `app/domain`.
- Closed the Playwright session and temporary development/static servers. Deleted the focused probe route, task-created `.playwright-cli`, and final-build `.next`/`out`. Retained this report and both deterministic harnesses as explicit evidence.

## Unverified/deferred

- Did not individually exercise all four image callers in real UI; one SpriteUploader integration plus the shared adapter's Task 3 load/error/abort harness and the owner scan cover the Task 5 boundary.
- Asset copy/move/delete are covered by the deterministic transaction harness but were not separately repeated through their real UI controls. Provider/useAssetStore unmount is now covered by the focused React/Playwright probe. Full interaction/route/network/clean-install matrices remain Task 9 work.
- The repository has no automated test suite or test script; no suite-pass claim is made.

No Git write operations were performed by this subagent.
