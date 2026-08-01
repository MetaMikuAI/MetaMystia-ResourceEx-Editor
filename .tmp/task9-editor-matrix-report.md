# Task 9 editor matrix regression

Date: 2026-08-01 (Asia/Shanghai)

Runtime: production static export served at `http://127.0.0.1:3101`; Playwright CLI Chrome. The authoritative editor work was run as short commands in the isolated named session `task9matrix`, preserving the same client-side ResourceEditor Provider state between routes. The session was closed after the final cleanup. The default shared browser and the shared static server were not closed.

Evidence files:

- `.tmp/task9-editor-matrix-dialog-actions-export.zip`: fresh browser download from the imported dialog-actions fixture.
- `.tmp/task9-full-regression-report.md`, `.tmp/task9-modal-regression-report.md`, `.tmp/task9-route-responsive-report.md`, and `.tmp/task9-shared-ui-report.md`: compact Task 9 evidence for Info/archive/dirty/export, Asset CRUD/reference/Object URLs, Modal, shared UI, and route/responsive paths.

The first monolithic harness runs were stopped at the 30-second no-output cutoff. The authoritative results below come from the same operations executed as short commands in one named session, not from an unobserved monolithic success claim. Per repository cleanup rules, the transient browser scripts were removed after their compact reports and downloads were retained.

## Route matrix

| Route         | Actual UI evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/info`       | Imported `fixtures/resource-pack/inputs/dialog-actions.zip`; the name input became `FixtureDialogActions Resource Pack`. The separate fresh core run covers actual field editing, invalid archive transaction preservation, LICENSE, dirty state, direct/confirmed downloads, and ID signing UI.                                                                                                                                                                  |
| `/asset`      | Reused the fresh Task 9 Asset run: upload, overwrite, folders, copy, move, delete, dirty state, reference validation, and persistent Object URL replacement/revocation were exercised through the UI.                                                                                                                                                                                                                                                             |
| `/ingredient` | Added an ingredient, edited its name to `Task9 Matrix Ingredient`, retained it for Recipe selection, observed it still present after the Recipe interaction, then deleted it through the list confirmation UI.                                                                                                                                                                                                                                                    |
| `/food`       | Added a food, edited its name to `Task9 Matrix Food`, retained it for Recipe selection, observed it still present after the Recipe interaction, then deleted it through the list confirmation UI.                                                                                                                                                                                                                                                                 |
| `/beverage`   | Added a beverage, edited its name to `Task9 Matrix Beverage`, then deleted it. The later state check returned `beverageDeleted: true`.                                                                                                                                                                                                                                                                                                                            |
| `/clothes`    | Added clothes, edited the name to `Task9 Matrix Clothes`, then deleted it. The later state check returned `clothesDeleted: true`.                                                                                                                                                                                                                                                                                                                                 |
| `/recipe`     | Added a recipe. Its visible Food trigger became `[11000] Task9 Matrix Food`; after adding an ingredient, the visible trigger became `[11000] Task9 Matrix Ingredient`. The recipe list displayed the selected Food and the recipe was deleted.                                                                                                                                                                                                                    |
| `/character`  | Added `Task9 Matrix Character` with ID `12001` and label `_Task9_MatrixCharacter`. Added a second character, set it to ID `12001`, awaited the visible `ID重复` state, restored it to `12002`, awaited warning clearance, and deleted the probe character. The retained character was later deleted.                                                                                                                                                              |
| `/dialogue`   | Imported `_FixtureDialogActions_AllActions` and inspected all seven action rows. Also added `_Task9_MatrixDialog`, added/edited a dialogue line, selected the custom character `(12001) Task9 Matrix Character [Special]`, added CameraShake/CG/BG/Sound/Branch/Goto/End, selected `scene.png` and `test.wav`, set BG to `shouldSet:false`, edited both Branch texts, set Goto `1` and End `0`, and exercised action move down/up. The package was later deleted. |
| `/merchant`   | Added a merchant, selected `Task9 Matrix Character (_Task9_MatrixCharacter)`, selected `_Task9_MatrixDialog`, added merchandise, changed its type to `Ingredient`, selected `[4] 野猪肉`, changed the lower price multiplier to `0.75`, and deleted the merchant.                                                                                                                                                                                                 |
| `/mission`    | Added target/source missions. The source label was `_Task9_MatrixSourceMission`; Sender and Receiver were both actually selected as `[0] 莉格露 (Wriggle)`. Added a post-Mission reference whose trigger value was `_Task9_MatrixTargetMission-0`. Both missions were later deleted.                                                                                                                                                                              |
| `/event`      | Added target/source events. The source used `OnTalkWithCharacter`, target character `[0] 莉格露 (Wriggle)`, Event Type `Dialog`, Dialog Package `_Task9_MatrixDialog-1`, post-Mission `_Task9_MatrixTargetMission-0`, and post-Event `Task9 Matrix Target Event (_Task9_MatrixTargetEvent)`. Both events were later deleted.                                                                                                                                      |

## Dialogue action and Branch result

The imported fixture UI returned this exact result before the fresh download:

```json
{
	"actions": 7,
	"optionTexts": ["Paid choice", "Default jump"],
	"branchInputs": [
		{
			"type": "text",
			"value": "Paid choice",
			"aria": "请输入选项文本...",
			"placeholder": "请输入选项文本..."
		},
		{ "type": "number", "value": "2", "aria": " ", "placeholder": null },
		{
			"type": "text",
			"value": "Default jump",
			"aria": "请输入选项文本...",
			"placeholder": "请输入选项文本..."
		},
		{ "type": "number", "value": "", "aria": " ", "placeholder": null }
	],
	"branchPriceUiPresent": false
}
```

The fresh downloaded `ResourceEx.json` contains:

```json
{
	"actionType": "Branch",
	"options": [
		{ "text": "Paid choice", "jump": 2 },
		{ "text": "Default jump", "jump": 1 }
	]
}
```

Therefore both input `price` values (`25` and `0`) were absent after the actual import/UI/export path, Paid retained `jump: 2`, and Default received `jump: 1`. This matches the fixed baseline/domain behavior; the lack of a Branch price input is not recorded as an untested path.

The new dialogue action move used a controlled DOM click for move-down, waited until the same CameraShake row's move-up button became enabled, then moved it back. The returned final order was:

```json
["镜头抖动", "CG", "BG", "音效", "选项分支", "跳转", "结束"]
```

## Character Kizuna references

Kizuna was enabled on `Task9 Matrix Character`. The first event field selected `_Task9_MatrixSourceEvent (Task9 Matrix Source Event)`. The first dialogue field selected `_Task9_MatrixDialog`; its Select intentionally reset to the add placeholder, and the selected dialogue chip was separately observed as visible before cleanup (`dialogChipVisible: true`).

## Diagnostics

Every successful short segment installed fresh listeners for `console` warning/error, `pageerror`, `requestfailed`, and responses with HTTP status at least 400. Ingredient/Food/Beverage/Clothes/Recipe, Character/Dialogue, Merchant, Mission, Event, Kizuna, and final cleanup each returned the same exact diagnostic shape:

```json
{ "console": [], "http": [], "pageerror": [], "failed": [] }
```

The isolated session's initial `/info` open occurred before those segment listeners and produced the already-known static-hosting favicon error:

```text
GET http://127.0.0.1:3101/favicon.ico -> 404
```

No other warning, error, page error, failed request, or HTTP >= 400 response was observed in the successful editor segments. The fresh Info/Asset reports likewise distinguish this known favicon request and deliberately triggered invalid-import error from success-path diagnostics.

## Controlled interactions and limitations

- HeroUI dropdown menu items and Select options that animate/detach were committed with `element.click()` after Playwright had located and awaited the real option. Confirmation buttons and list delete buttons that are intentionally pointer-hidden until hover/focus used the same controlled DOM click. These were real React UI event paths, not store mutation or page evaluation that rewrote application state.
- Mission/Event character lists virtualize their long option collections; only the first eight built-in characters were mounted. Attempts to locate the off-screen custom character timed out, so Mission/Event used the visible built-in `[0] 莉格露`. Custom-character references were independently exercised in Dialogue and Merchant.
- The Kizuna enable click succeeded, but the first exact heading wait failed because the heading's accessible name also includes its InfoTip button. The visible expanded fields were then used successfully.
- A normal action move click did not commit before the immediate next locator check. The successful retry used a controlled DOM click and an explicit enabled-state wait before moving back.
- The two monolithic harness attempts were intentionally interrupted at the 30-second no-output boundary. No claims depend on those aborted commands; each result above came from a short command that returned its JSON.

## Cleanup

The final segment returned:

```json
{
	"dialogChipVisible": true,
	"deleted": {
		"events": 2,
		"missions": 2,
		"dialogue": true,
		"character": true
	},
	"remaining": { "character": 0 },
	"diagnostics": { "console": [], "http": [], "pageerror": [], "failed": [] }
}
```

Recipe, Food, Ingredient, Beverage, Clothes, and Merchant deletion had already been exercised in their own segments. The named in-memory browser session was then closed. No verification data was persisted by the application, and no product/package/formal documentation file was changed by this matrix work.
