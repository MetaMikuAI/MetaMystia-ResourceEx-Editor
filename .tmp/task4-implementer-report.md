# Task 4 implementer report

## Scope and reference

- Fixed reference: `/Users/anyi/GitRepository/touhou-mystia-izakaya-assistant` at `d3b06126676430943856dfadc0bc8170920f9f72`.
- Synced/adapted: `app/design/preferences/**`, `app/design/theme/**` except `runtime/accountSync.ts`, selected UI components/hooks, `app/domain/evaluation/types.ts`, and target-only Textarea.
- Route organization added by user decision: 12 business shells moved to `app/(pages)/<route>/page.tsx`; URL and one-line export bodies are unchanged and no group layout was added.

## Public-contract migration matrix

| Capability       | Existing caller contract                                    | Target leaf / caller change                                                                                                                       |
| ---------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button           | HeroUI-compatible props, `onPress`                          | Default import from `@/design/ui/components/button`; four native pressable surfaces now use Design Button.                                        |
| Card             | HeroUI Card props                                           | Default leaf import; eight containers with independent child actions are non-pressable Card roots and retain separate semantic selection buttons. |
| Dropdown         | Default wrapper plus HeroUI item/menu/trigger exports       | Navbar and legacy Select import the target leaf directly.                                                                                         |
| Modal            | Controlled `isOpen`, render-prop close, classNames          | Existing modal callers use the new default leaf; IdRangeEditor replaces native dialog with controlled Design Modal.                               |
| Switch / Tooltip | Existing HeroUI-compatible wrapper props                    | Callers switch from the barrel to default leaf imports; no business prop translation.                                                             |
| Input / Textarea | HeroUI input slots and reduced-motion behavior              | Input is synced; D11 Textarea mirrors the `inputWrapper`, high-appearance and reduced-motion policy.                                              |
| Theme            | `[theme, setTheme]`, system/light/dark and storage sync     | Runtime moves to `app/design/theme/runtime`; standard MediaQueryList events and Task 3 safeStorage are used.                                      |
| Select / Navbar  | Business generic value contract / current app-shell wrapper | Deferred to Task 6; only their real owner files remain under `src/design`, with dependencies redirected to app leaf modules.                      |

## Registered adaptations

- D02: direct `MediaQueryList.addEventListener/removeEventListener`.
- D03: Providers supplies `{ isHighAppearance: true }` without a preference store.
- D08: `swapColorScale` is a pure function; memoize and its old utility owner are removed.
- D10: theme uses a local prettify type instead of global collections declarations.
- D11: target-only HeroUI Textarea wrapper.
- Evaluation rating keys remain owned by `app/domain/evaluation/types.ts`.
- Theme background assets use origin-root `/assets/**` URLs; reference account sync and unrelated business modules are excluded.

## RED and structural evidence

- Before migration: target owners absent; 78 files imported the old Design barrel/utils/hooks; 12 `.surface-pressable` sites; one `showModal()` and one native `<dialog>`.
- After migration: scans for old barrel/utils/hooks, local `cn`, `.surface-pressable`, `<dialog>` and `showModal()` return no matches.
- `find src/design -type f` returns only `src/design/ui/components/navbar.tsx` and `src/design/ui/components/select.tsx`.

## Commands completed

- Baseline `pnpm exec tsc --noEmit`: exit 0.
- Post-migration `pnpm exec tsc --noEmit`: exit 0.
- Focused Prettier write/check set is limited to changed files; formatting command exit 0.
- `git diff --check`: exit 0.
- `git diff --cached --check`: exit 0; staged set remains empty.
- First sandbox `pnpm build`: exit 1 only because `fonts.loli.net` DNS was unavailable.
- After the late fixes, the coordinator reran the production build: the ordinary sandbox attempt failed only on `fonts.loli.net` DNS, and the controlled-network retry exited 0. The final summary contained 16 static pages, including all 12 business routes, root, and 404.

## Browser evidence

- All 12 business URLs returned 200 with the expected title and business heading.
- Light, dark, system-dark, live system change back to light, theme-color, and two-page storage synchronization were correct.
- In an isolated reduced-motion context, the media query matched `true`. Button computed `transition-property: none` (so its retained `0.25s` duration is inert); Card, Modal, and the Modal close control had zero transition duration; Button/Card/Modal reported no animation. Source inspection confirms `disableAnimation ?? isReducedMotion` on the wrappers, including the owners that also receive custom motion props.
- IdRange Modal was inside `#modal-portal-container`. At 375×420 its scroll viewport was 268px over 282px content and scrolled to 14px. Escape closed it. Initial focus restoration failed; after adding an explicit trigger ref, the retest returned focus to the “签名” button.
- Disposable pages bypassed dirty `beforeunload` between routes. All four migrated Button surfaces rendered native `button[type=button]` elements with `tabIndex=0` and no nested interactive descendant. All eight Card surfaces rendered `DIV` roots without a role and with `tabIndex=-1`; each retained an independent native selection button with no nested interactive descendant.
- The six changed delete controls (Beverage, Clothes, Ingredient, Merchant, and both DialogPackage forms) passed keyboard Tab verification with `:focus-visible`, settled `opacity=1`, and `pointer-events=auto`. At 390×844 with touch enabled, all six had focus-within, correct center hit targets, and successful trial taps.
- Static enumeration found five Modal callers. AnnouncementModal, IdRangeEditor, and AssetPickerDialog passed real-entry checks for `role=dialog`, `aria-modal=true`, `#modal-portal-container`, Escape close, and trigger focus restoration. The final ExportValidationDialog and FoodPreviewDialog probes used two independent temporary routes without local state or triggers: the first rendered the real ExportValidationDialog open with one fixed warning, and the second rendered the real FoodPreviewDialog with `foodId={0}` and `isOpen`. Both routes returned 200 and produced exactly one visible dialog with `aria-modal=true`, `data-open=true`, a portal root, wrapper, backdrop, focus inside the dialog, and the expected caller content. Console contained only the React DevTools development info; page errors, failed requests, and HTTP error responses were empty. Both probes intentionally passed a no-op `onClose`, so remaining visible after Escape is the expected controlled-harness result and is not claimed as a business close check; wrapper Escape and focus restoration are covered by the other three real callers. This isolates the earlier no-dialog observations to business-trigger/automation setup rather than caller rendering, the Modal wrapper, or its portal.
- Only the existing `/favicon.ico` 404 appeared as a console error.

## Cleanup and final verification

- Browser and development server were closed. Agent-created `.playwright-cli`, `.next`, and `out` directories were removed; this report is the requested retained deliverable.
- Final focused Prettier, TypeScript, and diff checks were rerun after documentation updates.
- No stage, commit, push, branch, worktree, or remote mutation was performed.
