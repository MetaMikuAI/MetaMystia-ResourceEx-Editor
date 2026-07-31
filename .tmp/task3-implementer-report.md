# Task 3 implementer report

## Status

Completed Task 3 only. No Git staging, commit, amend, push, branch, worktree, or PR operation was performed.

## Delivered files and migrations

- Added `app/declarations/{styles,assets,dom,stdlibOverrides}.d.ts`.
    - `dom.d.ts` deliberately keeps only the Task 4 selected Design closure: `main`/modal portal lookup, `ReactNodeWithoutBoolean`, and div/span/heading attribute aliases. It does not reference `@heroui/table`.
    - `Prettify` is now local to `src/design/theme/colors/types.d.ts`; no global `collections.d.ts` was copied.
- Added reference-equivalent `app/shared/react/useHydrated.ts`; migrated all three old `useMounted` users. The two callback-based users now compose the callback lifecycle with `useEffect`.
- Added D09-scoped `app/infrastructure/browser/storage/{contracts,safeStorage}.ts` with only `getItem`, `setItem`, and `removeItem` on the adapter. It uses local → session → memory, shadow/tombstone state, never re-reads a lower-layer old value after runtime fallback, and omits reference account/cache/mode APIs.
- Added browser crypto and copied `public.pem` unchanged. All three current crypto consumers import `idRangeSignature` from its new owner. The RSA-SHA256 message, range constants, PKCS#8 restriction, sign failure message, and verify failure result are retained.
- Added `readImageDimensions` with transient URL cleanup on load/error/abort, an optional `AbortSignal`, and idempotent cleanup. The four current image callers remain untouched for Task 6/7 as required.
- Removed old globals/hooks/storage/crypto/PEM owners. `src/utilities/index.ts` now only exports `memoize` for Task 4.
- The reference `JSON.parse(): unknown` / `Array.isArray(): unknown[]` boundary made an existing `src/components/context/utils.ts` array trust assumption visible. It now explicitly narrows arrays/objects without changing the sorting logic.

## Validation actually run

- `node --experimental-strip-types .tmp/task3-safeStorage-harness.mts` — passed before cleanup. It covered local/session/memory initialization, first get failure, successful null then fallback, local write failure, remove failure, unknown keys after fallback, and the stale-session regression.
- `node --experimental-strip-types .tmp/task3-readImageDimensions-harness.mts` — passed before cleanup. It covered load, error, and abort paths and asserted one object-URL revoke per path.
- `pnpm exec tsc --noEmit` — exit 0.
- Focused `pnpm exec prettier --check` — exit 0.
- `git diff --check` and `git diff --cached --check` — exit 0.
- Old-owner import and file scans found no remaining `@/hooks`, `@/utilities`, `@/utilities/safeStorage`, or `@/lib/crypto` imports. The new storage module exposes only `safeStorage`; its contract exposes only get/set/remove.
- `app/infrastructure/browser/crypto/public.pem` SHA-256: `a9f9f3c3246b871a8bbeb4fac19663616dff3802789c78e369ea7eccbed4af77`, byte-identical to the removed source PEM.

## Concerns and next entry

- No real-browser pass was needed for this infrastructure-only task; the image adapter has a deterministic DOM-style harness, while its four UI callers intentionally remain under the Task 6/7 boundary.
- `safeStorage`、`idRangeSignature` 与 `readImageDimensions` 均以 `import 'client-only'` 标记 browser boundary；D15 仅是不把该包声明为顶层直接依赖。
- Task 4 is the next entry and is not started by this task.

The two temporary harness scripts were removed after their successful runs. This report is intentionally retained as the requested handoff artifact.

## Fix round 1

- Root cause: `safeStorage.getItem` returned a shadow hit before consulting a healthy current storage layer. It therefore hid external updates and prevented an existing-shadow read error from initiating permanent fallback.
- Fix: health local/session storage now reads on every `getItem`, refreshes shadow on a string, clears shadow and adds a tombstone on `null`, and retains the already-known shadow/tombstone conclusion before downgrade on a thrown read. Only memory and a runtime-fallback sink read shadow/tombstone without consulting persistent storage.
- New deterministic assertions: a local `theme` read changes from externally written `light` to `dark`; a known shadow then experiences a local read error, performs one additional read attempt, returns its shadow value, and does not read a stale session-only key after fallback.
- Re-ran the complete D09 harness with `node --experimental-loader ./.tmp/task3-client-only-loader.mjs --experimental-strip-types .tmp/task3-safeStorage-fix-harness.mts`; output: `safeStorage fix harness: passed`. TypeScript, focused Prettier and both diff checks also passed. The harness and temporary `client-only` loader are removed after the recorded runs.
- The first sandboxed `pnpm build` stopped at the existing font host DNS lookup (`fonts.loli.net`, `ENOTFOUND`). One approved unsandboxed retry exited 0, completed static export, and confirmed all three `client-only` imports resolve in the Next production build. Agent-created `.next` and `out` were removed afterwards.
