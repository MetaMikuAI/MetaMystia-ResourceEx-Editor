# Task 9 route and responsive browser regression

Date: 2026-08-01 (Asia/Shanghai)

Runtime: production static export served at `http://127.0.0.1:3101`; Playwright-controlled Chrome.

## Route matrix

- Exercised `/info`, `/ingredient`, `/food`, `/beverage`, `/clothes`, `/recipe`, `/character`, `/dialogue`, `/merchant`, `/mission`, `/event`, and `/asset` at 390×844, 1280×900, 1920×1080, and 2560×1440.
- All 48 direct navigations returned HTTP 200, retained the requested pathname, rendered a visible `<main>`, and produced non-empty visible body text.
- `document.documentElement.scrollWidth` exactly equalled the viewport width for every route and viewport; there was no page-level horizontal overflow.
- Across the complete run, captured console warning/error, `pageerror`, failed request, and HTTP ≥400 response arrays were all empty.

## Editor layout exercise

- A new ingredient was created through the real `+` control in isolated pages, then the `名称 (Name)` editor input was awaited before measuring layout.
- At 390×844, the list and editor rectangles were vertically stacked (`top=89` and `top=279`) with widths 334 and 358 pixels and no horizontal overflow.
- At 1280×900, the list and editor were simultaneously visible side by side (`left=24,width=389` and `left=445,width=811`) in the three-column workspace and without horizontal overflow.
- At 1280/1920/2560, all non-info two-panel editors resolved to the intended three-column desktop grid; Asset resolved to its four-column grid. At 390, their panels stacked vertically. Info remained its intentional single-content layout.

The first automation attempt timed out only because it tried to navigate an edited page and correctly triggered the product's native `beforeunload`. The successful run used one isolated page per dirty representative and closed it with `runBeforeUnload: false`; the separate beforeunload regression covers the native prompt itself.
