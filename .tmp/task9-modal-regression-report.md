# Task 9 conditional-open Modal regression

Date: 2026-08-01 (Asia/Shanghai)

## RED evidence

The real export-validation flow conditionally mounted `ExportValidationDialog` already open. It was visibly rendered, but after settling `getByRole('dialog')` returned no accessible dialog because the dialog's ancestor retained `aria-hidden="true"`.

The initial commit opened HeroUI Modal before `useEffect` resolved `#modal-portal-container`. HeroUI first mounted under its body fallback and applied React Aria `hideOutside`; moving the open overlay into the custom portal on the following commit left the new ancestor hidden.

## Fix

`ModalPresentation` now passes `isOpen && isPortalContainerReady` when it owns default-portal discovery. A caller with an explicit `portalContainer` remains immediately open; a default caller waits one effect and opens directly in the layout portal.

## GREEN evidence

The real ID-range/export-validation flow after the change reported:

- `role=dialog` and `aria-modal=true`;
- nearest custom portal id `modal-portal-container`;
- no `aria-hidden` ancestor;
- cancel and Escape both returned focus to the signing trigger;
- the 375×420 dialog stayed within the viewport and had a scroll owner (`clientHeight=268`, `scrollHeight=338`);
- “返回修改” produced no download and preserved dirty state;
- “忽略问题，仍然导出” downloaded `NewPack-v1.0.0.zip` and returned the pack to clean state;
- no console warning/error, `pageerror`, failed request, or HTTP error response.

Focused `pnpm exec prettier --check app/design/ui/components/modal.tsx` and `pnpm exec tsc --noEmit --incremental false` passed before the browser rerun. Final repository-wide affected checks are rerun after temporary probe removal.

## Missing-portal follow-up RED/GREEN (2026-08-01)

### RED

An isolated `/private/tmp` copy was served on `http://127.0.0.1:3102` with a one-time `/task9-missing-portal-probe` route. Its parent `useLayoutEffect` removed the root-layout `#modal-portal-container` before `ModalPresentation`'s passive discovery effect. With the prior state type `HTMLElement | null` and `isPortalContainerReady` test `defaultPortalContainer !== null`, clicking “打开缺失 Portal 弹窗” left focus on that button and produced `document.querySelectorAll('[role=dialog]').length === 0`.

This proves that the first conditional-open repair incorrectly treated the post-query “portal is absent” result as “portal is not ready”, suppressing HeroUI's documented body fallback indefinitely.

### GREEN

`defaultPortalContainer` now has the explicit state domain `HTMLElement | null | undefined`: `undefined` means discovery has not completed, while `null` means discovery completed and no custom target exists. The open gate is an explicit `portalContainer` prop or `defaultPortalContainer !== undefined`; `resolvedPortalContainer` and the conditional `portalContainer` prop remain unchanged.

On the same missing-portal probe after the change, clicking the trigger produced exactly one dialog with `aria-modal="true"`, no nearest `#modal-portal-container`, no `aria-hidden="true"` ancestor, and `document.body.contains(dialog) === true`. Pressing Escape reduced the dialog count to zero and restored focus to “打开缺失 Portal 弹窗”.

The existing `/task9-probe` route was then loaded with the normal layout portal restored and its real `AnnouncementModal` opened. Browser DOM inspection reported exactly one dialog with `aria-modal="true"`, nearest portal id `modal-portal-container`, and no `aria-hidden="true"` ancestor. The final custom-portal check reported no console errors or warnings.
