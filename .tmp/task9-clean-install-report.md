# Task 9 clean-install evidence

Date: 2026-08-01 (Asia/Shanghai)

- Copy root: `.tmp/task9-clean-install`.
- Excluded from the copy before installation: `.git`, `node_modules`, `.tmp`, `.next`, `out`.
- `pnpm install --frozen-lockfile --store-dir /Users/anyi/Library/pnpm/store/v10 --reporter append-only`: exit 0; 393 packages added, 391 reused, 0 downloaded; no patch failure. The expected Husky message `.git can't be found` was produced because the verification copy intentionally excluded `.git`.
- Installed direct dependencies: 13 HeroUI packages plus `file-saver`, `framer-motion`, `jszip`, `next@15.5.22`, `react@19.2.8`, and `react-dom@19.2.8`; removed Avatar/Badge/Link/Pagination/Snippet packages were absent from the top-level list.
- `pnpm why @heroui/input @heroui/select client-only`: Input and Select each resolve once as direct dependencies; `client-only@0.0.1` remains transitive only through Next/React Spectrum and is not a direct dependency.
- `pnpm exec tsc --noEmit --incremental false`: exit 0.
- Focused Prettier over `app`, package/lock, root TypeScript configs, and the reference-sync plan set: exit 0.
- The first sandboxed `pnpm build` could not resolve `fonts.loli.net`; it made no source change. The controlled-network retry exited 0, and the final build after adding explicit icon metadata also exited 0: compilation, TypeScript, 16/16 static generation, and export succeeded. The only successful-build warning was Next workspace-root inference because this deliberately nested copy and the parent repository each contained a lockfile; the ordinary repository build did not emit it.
- Clean-output browser representative flow: `/` returned 200 and client-replaced to `/info`; `minimal.zip` imported as `FixtureMinimal`; expected heading was present. A first fresh session exposed the browser's implicit `/favicon.ico` request as the only 404. The final source declares the existing `/assets/icon.png`; a second fresh session loaded that icon with 200, imported the fixture, and captured 0 console warnings/errors and no non-200 success-path request.
- The copy's generated `node_modules`, `.next`, and `out` were removed after verification; this report is retained as the compact evidence artifact.
