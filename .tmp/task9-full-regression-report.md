# Task 9 full regression evidence

Date: 2026-08-01 (Asia/Shanghai)

Runtime unless noted: production static export served from `out/` with extensionless HTML fallback; Playwright-controlled Chrome. This repository has no automated test suite; the commands and flows below are targeted deterministic and browser checks.

## Archive transactions and dirty state

- Missing `ResourceEx.json`, syntactically invalid JSON, and invalid `characters` shape were each accepted through the dirty overwrite confirmation and then rejected transactionally.
- The three failures preserved label `NewPack`, name `Task9 transaction sentinel`, dirty state, and the Object URL event count. Exact errors were `压缩包中未找到 ResourceEx.json`, `ResourceEx.json 无效: Expected property name or '}' in JSON at position 2 (line 2 column 1)`, and `ResourceEx.json 无效: characters must be an array or null`.
- The three deliberately invalid imports produced exactly the three expected provider error logs and no unrelated warning/error.
- Creating a blank pack returned to clean state. A data edit and a LICENSE edit each made the pack dirty; direct export downloaded `NewPack-v1.0.0.zip` and made the corresponding revision clean.
- `.tmp/task9-direct-export.zip` SHA-256 is `4a1ecb444fcd3f037d36e02d7e0e01a086460d1624f1ce7fbda016b0d6e1eada`; its entries are `ResourceEx.json` and the `assets/` directory.
- `.tmp/task9-license-export.zip` SHA-256 is `7fef6ee7ef751904ba34e9d860352de7fe5bf5ad1723bef156fe9690a7e91387`; its entries are `ResourceEx.json`, `LICENSE.md`, and the `assets/` directory. Exported LICENSE SHA-256 is `de684d5ecc4f0ba3cf9655348526c58e9578630cf65dec8be981d28c1ef27dd7`.

## ID range, signing, validation Modal, and beforeunload

- Range `9002..9001` produced `起始ID不能大于结束ID`; range `9000..9001` enabled signing.
- Browser Web Crypto generated an RSA-2048 PKCS8 key, the real signing flow produced a 344-character signature, and verification against the pinned public key correctly reported `签名无效`.
- Cancel and Escape returned focus to the signing trigger. At 375×420, the dialog stayed inside the viewport and exposed a scroll owner (`clientHeight=268`, `scrollHeight=338`).
- “返回修改” produced no download and retained dirty state; “忽略问题，仍然导出” downloaded and returned clean state. `.tmp/task9-confirmed-invalid-export.zip` SHA-256 is `3d7d3a5079cfcaa2a325857a8054ca5ac5e68a2fe66f826ce45618309a65be22`.
- The conditional-open accessibility regression and D19 fix are detailed in `.tmp/task9-modal-regression-report.md`.
- A separate real edited page closed with `runBeforeUnload: true`, emitted the native `beforeunload` prompt, accepted it, and closed.

## Asset UI and reference validation

- The actual Asset editor uploaded a 64×64 PNG, rendered a blob-backed 64×64 preview, overwrote the same path, created `CopyTarget` and `MoveTarget`, copied, moved, deleted the copied/moved/original files and folders, and returned to an empty root.
- Object URL counts progressed as expected: first upload `1/0`; overwrite `2/1`; copy/move reused the persistent URLs; final cleanup `3/3`. The actual asset CRUD made the pack dirty.
- Importing the fixed dialogue-actions archive created two referenced persistent asset URLs. Deleting those files through the Asset UI revoked both (`2/2`). Export validation then reported the exact missing `assets/CG/scene.png` and `assets/Audio/test.wav` references, plus the fixture's expected Goto/BG validation issues.
- The asset flows captured no unexpected warning/error, `pageerror`, failed request, or HTTP error response.
- The four image uploader and persistent/transient lifecycle matrix is detailed in `.tmp/task9-shared-ui-report.md`.

## Domain/state, shared UI, routes, and responsive layout

- Fresh `node .tmp/task5-domain-harness.mjs`: seven fixtures and expanded wire paths passed; Node only emitted its `stripTypeScriptTypes` experimental warning.
- Fresh `node .tmp/task5-state-harness.mjs`: revision, label guards, and URL transactions passed; Node only emitted the same experimental warning.
- Select grouping/descriptions/disabled/stale value, keyboard/focus, scrolling, four Button/eight Card semantics, and uploader Object URLs are recorded in `.tmp/task9-shared-ui-report.md`.
- The 4-viewports × 12-routes matrix and representative stacked/dual-column editor measurements are recorded in `.tmp/task9-route-responsive-report.md`.
- A no-`node_modules` clean copy completed frozen installation, TypeScript, focused formatting, 16/16 production export, root-to-info navigation, and a real `minimal.zip` import as `FixtureMinimal`. After root metadata declared the existing public icon, the final fresh session recorded 0 console warnings/errors and only 200 responses on the success path; details are in `.tmp/task9-clean-install-report.md`.

## Editor CRUD, sorting, and cross references

- The dedicated same-session matrix is recorded in `.tmp/task9-editor-matrix-report.md`; every successful segment captured empty console warning/error, `pageerror`, failed-request, and HTTP ≥400 arrays.
- Ingredient, Food, Beverage, Clothes, and Recipe completed actual add/edit/reference/delete paths. Recipe selected the newly created Food and Ingredient before all three were deleted.
- Character completed add/edit, duplicate ID warning, warning clearance after restoring a legal ID, and deletion. Dialogue and Merchant selected that custom character; Mission/Event selected the actually mounted built-in `[0] 莉格露` because their long character lists virtualized off-screen options.
- Dialogue covered the imported and newly created CameraShake/CG/BG/Sound/Branch/Goto/End rows, CG/BG/audio assets, Branch texts, Goto/End values, action down/up sorting, character reference, and package deletion.
- The fresh dialogue export SHA-256 is `0f71848e6103cbef0651d88d221715bbe0411e502104220fdff80ecdb9118894`. Its Branch options are exactly `{text:"Paid choice",jump:2}` and `{text:"Default jump",jump:1}`; input `price=25` and `price=0` are both absent, matching the fixed baseline.
- Merchant completed character/dialogue/item references, multiplier editing, and deletion. Mission/Event completed source/target CRUD, Sender/Receiver or trigger character, Dialog package, post-Mission and post-Event references, then deletion. Character Kizuna selected the source Event and Dialogue package and displayed the added dialogue chip.
- Animated/detaching options, hidden-until-hover delete controls, and the action move retry used a controlled DOM click only after Playwright located and awaited the real UI element; no application state was written through page evaluation.
