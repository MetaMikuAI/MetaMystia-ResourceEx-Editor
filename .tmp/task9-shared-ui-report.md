# Task 9 shared UI and Object URL browser regression

Date: 2026-08-01 (Asia/Shanghai)

Runtime: production static export with the temporary `/task9-probe` route, served at `http://127.0.0.1:3101`; isolated Playwright-controlled Chrome session.

## Select

- Grouped Select rendered 60 options with 60 descriptions in two sections and skipped one disabled option. Its selected value changed from `beta-25` to `beta-26`.
- The long-list scroll owner measured `clientHeight=240`, `scrollHeight=248`, and `scrollTop=8` while the selected trigger remained `Beta option 25`; the patched Select did not force-scroll the selected item into a different position.
- The stale numeric controlled value `999` rendered the placeholder `请选择...`; selecting the numeric key produced string value `2` without an invalid-selected-key warning.
- In the explicit keyboard pass, Enter opened the Select, ArrowDown moved focus to `Beta option 26` while the controlled value remained `beta-25`, Enter committed `beta-26`, closed the listbox, and returned focus to the trigger.
- The keyboard pass captured no console warning/error or `pageerror`.

## Scrolling and surfaces

- ScrollMask changed from `scrollTop=0` to `832` with `clientHeight=128` and `scrollHeight=960`.
- ScrollShadow had `overflowY=auto`, `clientHeight=128`, and `scrollHeight=960`.
- All four Button variants rendered a native `BUTTON type=button`, `tabIndex=0`, with no nested interactive element.
- All eight Card variants rendered a non-interactive `DIV`, no role, `tabIndex=-1`, each containing exactly one direct child button.

## Uploaders and Object URLs

- PortraitUploader, SpriteUploader, SpriteGridUploader, and SpriteSet each produced 0/0 create/revoke events for cancellation.
- Each successful or invalid single-image dimension read produced exactly one transient create and one revoke. Sprite dimension-mismatch cancellation also produced exactly 1/1.
- SpriteSet success produced two creates: one transient URL was revoked immediately and one persistent URL remained owned by the nested ResourceEditorProvider.
- Before provider unmount the aggregate count was 10 creates / 9 revokes. Unmount revoked the exact remaining persistent URL, producing 10/10.
- The run captured no non-favicon console warning/error, `pageerror`, failed request, or HTTP ≥400 response.
