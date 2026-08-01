# Task 9 dependency cleanup report

Date: 2026-08-01

Base commit: `1e95566c0169d31ca48495e1b7314a4cddd56476`

## Investigation

- The worktree was clean before this slice; the only branch was the existing `dev/reorganize` worktree.
- Exhaustive fixed-string scans outside `node_modules`, generated output, fixtures, docs, patches, and `.tmp` found zero source/config/script references to:
    - `@heroui/avatar`
    - `@heroui/badge`
    - `@heroui/link`
    - `@heroui/pagination`
    - `@heroui/snippet`
- Before removal, `pnpm why` showed each of the five candidates only as a direct dependency of the root project.
- Required Task 2 additions still have direct callers:
    - `@heroui/input`: `app/design/ui/components/input.tsx`, `app/design/ui/components/textarea.tsx`
    - `@heroui/select`: `app/features/resourceEditor/client/components/select/Select.tsx`
- `client-only` remains transitive only; it is not a root direct dependency.
- All `cn` imports in `app/**` resolve directly from `@heroui/theme`; no forwarding facade remains.
- Source/package scans found no Lodash dependency/import and no local memoize import.

Current production direct dependency import counts after cleanup:

| Dependency              | Source/config direct-import files | Ownership note                                                  |
| ----------------------- | --------------------------------: | --------------------------------------------------------------- |
| `@heroui/button`        |                                 1 | Design Button                                                   |
| `@heroui/card`          |                                 1 | Design Card                                                     |
| `@heroui/dropdown`      |                                 1 | Design Dropdown                                                 |
| `@heroui/input`         |                                 2 | Design Input/Textarea                                           |
| `@heroui/modal`         |                                 1 | Design Modal                                                    |
| `@heroui/navbar`        |                                 1 | AppNavbar                                                       |
| `@heroui/popover`       |                                 1 | Design Popover                                                  |
| `@heroui/scroll-shadow` |                                 1 | Design ScrollShadow                                             |
| `@heroui/select`        |                                 1 | Resource editor Select adapter                                  |
| `@heroui/switch`        |                                 1 | Design Switch                                                   |
| `@heroui/system`        |                                10 | provider and Design ref/variant contracts                       |
| `@heroui/theme`         |                                57 | direct `cn`, theme, and variant callers                         |
| `@heroui/tooltip`       |                                 1 | Design Tooltip                                                  |
| `file-saver`            |                                 1 | browser download adapter                                        |
| `framer-motion`         |                                 0 | explicit HeroUI peer provider pinned by the compatibility group |
| `jszip`                 |                                 2 | browser archive reader/writer                                   |
| `next`                  |                                 5 | App Router/config/font/navigation callers                       |
| `react`                 |                               122 | application components/hooks/declarations                       |
| `react-dom`             |                                 0 | explicit Next/React runtime peer                                |

## Change

- Ran ordinary pnpm removal for the five zero-caller dependencies.
- `package.json`: removed exactly five direct dependency declarations.
- `pnpm-lock.yaml`: removed the five importer entries plus nine now-unreachable transitive packages/snapshots (`232` lines); pnpm reported `Packages: -14`, `downloaded 0`.
- No patch file, patch registration, version, override, script, `SKIP_LINT` branch, TypeScript include, or static-export configuration changed.

The first sandboxed `pnpm remove` attempt exited before modifying files with `ERR_PNPM_UNEXPECTED_STORE`: existing `node_modules/.modules.yaml` points to `/Users/anyi/Library/pnpm/store/v10`, while the sandbox default resolved to the repository `.pnpm-store/v10`. The successful commands explicitly selected the existing store; this was an execution-environment mismatch, not an install or patch failure.

## Commands and evidence

- `pnpm --store-dir /Users/anyi/Library/pnpm/store/v10 remove @heroui/avatar @heroui/badge @heroui/link @heroui/pagination @heroui/snippet --reporter append-only`
    - exit 0; removed 14 packages; reused 392; downloaded 0.
- `pnpm --store-dir /Users/anyi/Library/pnpm/store/v10 install --frozen-lockfile --reporter append-only`
    - exit 0; `Lockfile is up to date`; `Already up to date`; Husky prepare completed; no patch failure.
- `pnpm exec tsc --noEmit --incremental false`
    - exit 0.
- `pnpm exec prettier --check package.json pnpm-lock.yaml`
    - exit 0; both files matched Prettier.
- `git diff --check`
    - exit 0.
- `git diff --cached --check`
    - exit 0; nothing staged.
- `pnpm why @heroui/input @heroui/select`
    - one version each, both direct root dependencies.
- `pnpm why @heroui/avatar @heroui/badge @heroui/link @heroui/pagination @heroui/snippet`
    - no output after removal.
- `pnpm list --depth 0`
    - 32 top-level production/dev packages; removed candidates absent.
- Compared all eight `patches/*.patch` files with fixed reference commit `d3b06126676430943856dfadc0bc8170920f9f72` using `git show | cmp`.
    - all eight byte-identical.
- Counted patch files and `patchedDependencies` lock entries.
    - exactly 8 files and 8 lock entries.
- Fresh scans after removal:
    - removed-candidate source references: 0;
    - removed-candidate lock references: 0;
    - non-`@heroui/theme` `cn` imports: 0;
    - Lodash/local memoize imports: 0.

There is no repository automated test suite; no suite-pass claim is made. Build and browser regression are intentionally left to the main Task 9 controller.
