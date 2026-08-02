# Repository Guidelines

## How to apply this file

This file records repository-specific constraints and non-obvious capabilities that change implementation decisions. It is not an architecture inventory.

### Instruction precedence

System, developer, and direct user instructions remain higher priority. This file takes priority over reusable skills, plugin workflows, generic agent conventions, and generated plans.

When a lower-priority workflow conflicts with this file, follow this file and tell the user which step was skipped and why. A skill does not grant additional permission or override repository architecture.

### Factual authority

1. Current code, `package.json`, and configuration files define current behavior.
2. Durable project documents record intended behavior and constraints but may describe an earlier implementation phase.
3. `README.md` is product-facing, not an implementation specification.

This factual order does not replace instruction precedence. When code differs from a higher-priority requirement, treat the difference as an implementation gap. Update an affected durable document when the completed change would otherwise leave one of its claims incorrect.

### Rule scope

- Workflow, authorization and worktree safety apply to every task.
- Before changing code or behavior, complete the investigation gate. For documentation-only work, read each target document in full and verify changed claims against their source.
- Read and apply a subsystem section when the task inspects, changes, or verifies that subsystem, or changes a shared dependency or lifecycle owner that can affect it. Ignore other subsystem sections.
- Apply code conventions only to edited code. Apply verification only to affected files, behavior, and runtime modes.

The project is a Next.js 15 / React 19 application written in strict TypeScript. User-facing text is primarily Simplified Chinese. Preserve established game terminology and nearby wording instead of translating labels independently. The `@/` alias resolves to `app/`.

## Workflow and authorization

- Do not stage, commit, amend, push, create or switch branches or worktrees, open pull requests, or otherwise mutate Git history or remote state unless the user explicitly requests that operation. Approval to investigate, design, implement, verify, or finish a change is not commit authorization.
- Preserve all maintainer-owned staged, unstaged, and untracked changes. Repository-wide formatting, cleanup, generated files, and unrelated rewrites require separate authorization.
- Subagents do not require separate user approval. Use them at the agent's discretion when independent tasks have a real parallelism or independent-review benefit that outweighs coordination cost. Give each subagent bounded scope, avoid concurrent edits to the same files, and independently verify its output before relying on it.
- When a task needs a real browser and no reusable browser session is available, use the Playwright skill to launch and control one. A missing pre-existing session is not a blocker; report a limitation only if browser automation cannot start or the task specifically requires unavailable user session state.
- When a task or verification session ends, close agent-started browser or Playwright sessions and development servers, and remove agent-created temporary scripts, fixtures, screenshots, traces, and generated verification directories. Keep them when the user asks for them, the task is still active, or they are intentional deliverables.

## Pre-change investigation gate

Before changing code or behavior, all of the following must be true:

1. The staged, unstaged, and untracked worktree state is known, and maintainer-owned changes are preserved.
2. Read `package.json`, complete target files, and relevant neighboring code, configuration, durable documents, alternate runtime implementations, environment reads, stores, routes, and existing utilities.
3. Trace every direct and indirect caller of a changed shared contract. Identify each applicable source of truth, persistence or transaction boundary, cross-tab path, memory fallback, and UI lifecycle owner.
4. Establish applicable validation commands, relevant baseline warnings, and how the affected behavior can be exercised.
5. Select the smallest design that satisfies the requirement and reuses existing capabilities.

Do not substitute assumptions for facts that can be established through safe read-only investigation. Any remaining uncertainty that could materially affect behavior, data, deployment, or user experience must be stated to the user and resolved before implementation.

## Subsystem constraints

### Runtime and global clients

`next.config.ts` fixes the application to static export through `output: 'export'`. Browser storage and in-memory fallback are production runtime boundaries; do not introduce a design that requires a Next.js server runtime unless the maintainer explicitly changes the deployment model.

`app/providers.tsx` owns global client lifecycles. Add global providers, watchers, and synchronization clients there or in an existing feature-owned global entry point rather than a page component that remounts during navigation.

### Existing UI and overlay coordination

Use the wrappers in `app/design/ui/components`; business modals compose them through `app/features/overlays/client/CoordinatedModal.tsx`. The global overlay coordinator under `app/features/overlays/` owns scheduling, stacking, shortcuts, backdrop, and inert behavior; `app/features/overlays/client/OverlayCoordinatorHost.tsx` installs the global keyboard handling and blocking-state isolation.

Prefer a project wrapper when one exists; otherwise follow neighboring HeroUI usage. Register every coordinated overlay in `OVERLAY_DEFINITION_MAP` and use the coordinator ownership APIs. Open nested confirmations with `pushOverlayChild` so the parent remains covered and inert and the child does not apply a second backdrop blur. Keep `#modal-portal-container` inside `<main>` in `app/layout.tsx`.

Use `useReducedMotion` and `useMotionProps` from `app/design/ui/hooks` for motion accessibility.

Workspace lease conflicts are blocking overlays. Recovery, duplicate-import resolution, validation, pickers, and confirmations are task overlays; announcements and informational notices are passive overlays. Preserve these scheduling relationships when adding or changing a modal. Opening, queueing, covering, or restoring an overlay must not change routes; navigation remains owned by the business action that explicitly requires it.

Automatic background work must not open or flash a blocker, and must not make the page inert without presenting the corresponding panel. An overlay state driven by asynchronous workspace lifecycle data must remain valid across React Strict Mode effect replay, route restoration, and component cleanup.

`canActivate` is a validity guard, not a delay mechanism. A component-owned request that cannot activate is stale and may invoke its business close callback. To defer an overlay without dismissing it, retain the pending business intent outside the coordinator and submit the open request only when its lifecycle prerequisites are stable.

### Workspace persistence and cross-tab coordination

`ResourceWorkspaceProvider` owns workspace hydration, opening, recovery, autosave, storage fallback, leases, and catalog synchronization. Reuse the workspace repository, save queue, lease controller, catalog sync, and migration utilities instead of adding parallel persistence or coordination state.

Use `safeStorage` for small browser preferences that may safely degrade from local storage to session or memory. Workspace documents and files belong to the workspace repository. The last active workspace is intentionally session-scoped so separate tabs can edit different workspaces; do not replace it with one global last-workspace value.

Before adding persistence, broadcast, locking, retry, or recovery behavior, inspect the existing workspace primitives and extend their owning contract when they satisfy the required semantics. Keep persistent and memory-only modes behaviorally usable, report the actual storage mode, and preserve current in-memory edits when durable operations fail.

Cross-tab behavior must work while several tabs remain visible. BroadcastChannel is the primary catalog and ownership signal where available; focus and visibility refreshes are fallbacks, not the sole coordination mechanism. A catalog mutation, lease change, deletion, takeover, or storage migration must leave every visible tab in a coherent state.

## Code conventions

Apply these conventions to edited code while preserving established public contracts and neighboring style.

### Existing capability reuse

- Before adding or retaining a local implementation, inspect the whole project for an existing semantically equivalent capability. Reuse the correct owner, including domain queries, feature helpers/services, infrastructure adapters, design wrappers and shared utilities, instead of duplicating it.
- Reuse must preserve dependency direction and ownership. Do not make a lower layer import a feature, turn a feature-specific policy into a generic helper, or add a forwarding facade merely to share code.

### TypeScript and naming

- Object contracts normally use `I`-prefixed interfaces, such as `IUserProfile` and `IProps`. Unions and derived aliases normally use `T`-prefixed types, such as `TNamespace`. Preserve established generated, database, and public-boundary exceptions.
- Components and classes use PascalCase. Functions and variables use camelCase. Follow neighboring file and directory naming.
- Exported domain constants and constants with operational units normally use `UPPER_SNAKE_CASE`. Include units in operational constants and measured values, such as `RETRY_DELAYS_MS` and `candidateBytes`.
- Boolean values and predicates normally begin with `is`, `has`, `can`, or `should`; established validation helpers may use `check*`. Hooks use `use*`, factories `create*`, storage readers `read*`, and persistence mutations an explicit verb such as `write*`, `replace*`, `remove*`, or `clear*`.
- Collections use plural nouns or a `Map`/`Set` suffix. Refs end in `Ref`, promises in `Promise`, and identifiers in `Id`. Component callback props begin with `on`; local event adapters normally begin with `handle`.
- Acronyms follow ordinary camelCase boundaries, such as `userId`.
- Prefer literal unions and `as const satisfies Record<...>` over enums or widened objects.
- Preserve exact optional-property semantics: missing, `undefined`, `null`, empty values, and domain defaults are not interchangeable. Parse external data as `unknown`, validate it, and avoid `any`, broad assertions, and non-null assertions unless a proven invariant cannot be expressed more safely.

### Import ordering and type-only imports

- Keep React, Next.js and other third-party binding imports together at the start of the import block.
- Project-internal imports normally target the owning leaf instead of a broad re-export barrel. Keep an `index.ts` only when it deliberately defines a stable, curated package boundary; import such an entry through its directory path and never spell the trailing `/index`. Do not create an `index.ts` only to shorten paths or forward neighboring modules.
- Group project-owned alias imports by their first owner segment, such as `@/design`, `@/domain`, `@/features`, `@/infrastructure` and `@/shared`. Order these owner groups A–Z, separate adjacent owner groups with one blank line, and sort every declaration within a group by its full module specifier in ascending A–Z order.
- Within `app/**`, use `./...` for a project-owned module in the importing file's directory or any descendant directory, such as `./Card` or `./components/Card`. Use the `@/...` alias when the target is outside that directory subtree; parent-relative `../...` imports are not allowed within `app/**`. Keep these local/descendant imports in a separate group after alias groups and sort them by full module specifier A–Z. Route aliases follow the same first-segment grouping rule. The only current exception is `app/design/theme/**`, which is loaded directly by external Prettier and editor Tailwind tooling while executing `tailwind.config.ts`. That subtree must not use the TypeScript `@/` alias; keep all of its project imports, including type-only imports, as ordinary resolvable relative paths. Do not extend this exception to `app/design/ui/**` or other application modules. Root configuration and `scripts/**` imports that cannot be represented by the app-only `@/` alias retain their resolvable relative paths.
- Keep side-effect-only setup, polyfill and stylesheet imports in their required trailing or entry-point order. Do not mix them into binding-import sorting because their evaluation and CSS cascade order can be observable.
- Sort named import specifiers A–Z by their local binding name (the name after `as`; without an alias, this is the imported name). Keep one import declaration per module specifier unless the JavaScript/TypeScript grammar requires separate declarations.
- When the imported project module is runtime-free and exports only types, use declaration-level `import type { ... } from '...'`.
- When the source module also exports runtime values, mark type-only named bindings inline, such as `import { runtimeValue, type TContract } from '...'`; when every named binding is type-only, use `import { type IContract, type TName } from '...'` rather than declaration-level `import type`.
- Base this choice on the source module's actual runtime surface, not its filename. A `types.ts` or `contracts.ts` file may still be mixed, while another filename may be type-only.
- Preserve declaration-level `import type` only where TypeScript syntax has no equivalent inline named-binding form, such as a type-only namespace import.
- Import sorting is mechanical but does not authorize changing module initialization, CSS cascade, polyfill, or synchronous descriptor-capture behavior. If project-owned A–Z ordering exposes a real order dependency, make that dependency explicit in the owning module and verify it instead of restoring semantic subgroups.

## Change and verification requirements

A valid patch accounts for all affected callers of changed shared contracts and verifies the behavior it changes.

There is no automated test suite or repository test script. Do not invent test or coverage claims. Verify behavior with deterministic checks or direct exercise of affected paths; static checks alone do not establish runtime behavior.

The relevant static checks are:

```bash
pnpm exec tsc --noEmit
pnpm exec prettier --check <files>    # focused formatting/docs
git diff --check
```

`pnpm format` writes repository-wide changes and is not a check. Distinguish baseline warnings from newly introduced ones.

For runtime-affecting UI changes, exercise the affected interaction in a real browser when the user has not excluded browser testing. Cover keyboard input, relevant breakpoints, reduced motion, and themes when the change can affect them.

For workspace persistence or cross-tab changes, exercise the applicable local edit, autosave, failure fallback, retry, refresh, direct-route restoration, recovery choice, lease conflict, takeover, deletion, and simultaneously visible tab paths. If an applicable scenario is unavailable or the user excludes browser testing, report it as unverified rather than inferring runtime behavior from static checks.

When the user requests a commit, use Conventional Commits. A handoff states what changed, checks actually run, and any material compatibility impact, warning, or unverified area.
