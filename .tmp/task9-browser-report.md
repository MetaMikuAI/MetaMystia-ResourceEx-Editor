# Task 9 browser/static evidence

Date: 2026-08-01 (Asia/Shanghai)
Runtime: production `next build` static export served from `out/` with extensionless HTML fallback; Playwright-controlled Chrome.

- Build completed compilation, TypeScript, 16/16 static generation, and export.
- `/`, all 12 editor routes, one JS chunk, one self-hosted font, one public icon, and RSC text payloads returned 200; an unknown route returned 404.
- All 12 direct editor routes displayed their expected editor headings.
- JS-enabled `/` client-replaced to `/info`; a JavaScript-disabled context stayed at `/`, exposed the fallback link, and navigated to `/info` with a 200 response.
- Root/archive flow: missing-LICENSE and empty-LICENSE imports created/revoked persistent URLs as `6/0` then cumulative `12/6`; creating a blank pack produced `12/12` and clean state. Nonempty LICENSE read exactly `Line one\nLine two  \n`; editing made dirty true, successful download `Task9Export-v1.0.0.zip` made dirty false. Deliberately invalid import while dirty retained label/name, dirty state, and URL event count.
- Dropdown navigation used `onAction`, navigated to `/character`, produced no `a[textvalue]`, and captured no warning/error. Selecting a custom character with no portraits showed `无可用立绘` and captured no invalid-selected-key warning.
- Event post-event pointer click still timed out in Playwright after the animated option detached, but the click had already committed `TASK9 EVENT 2 (_NewPack_Task9Event2)` and the post-event count was one. Production console captured no Motion warning/error. This remains an automation actionability limitation, not a failed product state transition.
- Theme: fresh two-tab context propagated light and dark storage changes to the other tab; explicit storage events verified light/dark/system, and system followed emulated dark→light media changes.
- Reduced-motion modal content had zero transition/animation duration; Announcement and ID signing dialogs each had one portal dialog, closed with Escape, and restored focus to their trigger.
- Responsive widths 375/768/1280/1920/2560 had no horizontal document overflow; mobile toggle was present below `lg`; Navbar height was 64px. At 390×844 the mobile menu used overscroll containment and hidden scrollbar, focused its first item, and Escape restored focus to `#app-navbar-mobile-menu-toggle`.
- Export ZIP SHA-256: `d82ef4a44cd8b20a859f92362b564a517105c9c475ff470c6a65aaec543ad306`; exported/input LICENSE SHA-256: `e72c805e3e5ac7d0c24e6a1cc1dbf5db1b79803ac0108fa4ec13688d0ad49a8a`.
- Apart from the deliberately triggered invalid-import `console.error`, fresh success-path pages captured no console warning/error. A final clean-copy session exposed and then closed the old favicon baseline by declaring the existing `/assets/icon.png` in root metadata; the icon and all 50 observed initial/static/RSC requests returned 200, and the final import session had 0 console warnings/errors. Source/config and static artifact scans found no Node/API runtime endpoint.
- Browser session and static servers were closed after verification.
