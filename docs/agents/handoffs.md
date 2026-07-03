# Agent Handoffs

## 2026-07-03 11:58 CST - CEO / Orchestrator -> All Roles

Task: T-001
Status: done
Summary:
- Defined the cross-agent interaction protocol for 今天明天.

Evidence:
- `docs/agents/manifest.md`
- `docs/agents/interaction-protocol.md`
- `docs/agents/board.md`
- `docs/agents/messages.md`
- `docs/agents/decisions.md`

Changed Files:
- `docs/agents/manifest.md`
- `docs/agents/interaction-protocol.md`
- `docs/agents/board.md`
- `docs/agents/messages.md`
- `docs/agents/handoffs.md`
- `docs/agents/decisions.md`

Requests:
- Future role assignments should read `docs/agents/interaction-protocol.md` before starting work.

Risks:
- None known.

## 2026-07-03 12:09 CST - CEO / Product Owner -> All Roles

Task: T-002
Status: done
Summary:
- Revised the interaction model so CEO focuses on user/product intent, Product Designer collaborates directly with Product Developer, and Product Developer collaborates directly with QA Verifier.

Evidence:
- `docs/agents/interaction-protocol.md`
- `docs/agents/manifest.md`
- `docs/agents/board.md`
- `docs/agents/decisions.md`
- `docs/agents/messages.md`

Changed Files:
- `docs/agents/interaction-protocol.md`
- `docs/agents/manifest.md`
- `docs/agents/board.md`
- `docs/agents/messages.md`
- `docs/agents/handoffs.md`
- `docs/agents/decisions.md`

Requests:
- Future role work should use direct adjacent-role formats: `DESIGN -> DEVELOPMENT`, `DEVELOPMENT -> DESIGN`, `DEVELOPMENT -> QA`, and `QA RESULT`.

Risks:
- None known. Revised protocol broadcast was sent to Product Designer, Product Developer, and QA Verifier.

## 2026-07-03 13:27 CST - Product Developer -> QA Verifier

DEVELOPMENT -> QA
Product: 今天明天
Task ID: T-003
From: Product Developer / `019f25f8-12e4-70e0-adac-6ae70c1b7aaf`
To: QA Verifier / `019f2614-56f8-7d40-af98-c1623e892eed`
Subject: Ready for verification

Implemented:
- Preserved the static prototype under `prototype/static-web/`.
- Built the formal Vite + React + TypeScript app with today/tomorrow task lists.
- Implemented add, complete/reopen, move today/tomorrow, abandon, localStorage persistence, and restart-safe panel state normalization.
- Implemented local date rollover so open tomorrow tasks become today tasks after the date changes.
- Implemented the downshift/evening review flow with keep, move all, per-task complete, per-task move, per-task abandon, automatic completion when all open today tasks are handled, and same-day review de-duplication.
- Implemented pet mood and light growth rules.
- Wired Tauri dual-window shell: `pet` window and hidden `panel` window, native panel positioning near pet, Escape/blur hide behavior, pet drag start, moved-position persistence, and default pet placement near screen bottom-right.
- Added architecture and QA documentation.

Changed files:
- `README.md`
- `index.html`
- `public/favicon.svg`
- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `eslint.config.js`
- `src/`
- `src-tauri/`
- `docs/architecture.md`
- `docs/development-guide.md`
- `docs/qa-checklist.md`
- `docs/agents/board.md`
- `docs/agents/messages.md`
- `docs/agents/handoffs.md`

Verification already run:
- `pnpm check` passed: lint, typecheck, and Vitest all green; 8 test files, 24 tests.
- `pnpm build` passed.
- `pnpm exec tauri info` ran and identified missing Rust/Cargo/rustup and full Xcode as environment blockers.
- Browser smoke with system Chrome passed:
  - desktop pet screenshot: `output/playwright/mvp-pet-desktop.png`
  - desktop pet opened panel screenshot: `output/playwright/mvp-pet-open-desktop.png`
  - evening review screenshot: `output/playwright/mvp-evening-review.png`
  - post-review panel screenshot: `output/playwright/mvp-panel-after-review.png`
  - mobile reference screenshot: `output/playwright/mvp-panel-mobile-reference.png`
  - smoke result: `output/playwright/mvp-smoke-result.json`

Acceptance criteria to verify:
- Desktop pet collapsed state shows only the small glow pet.
- Clicking pet opens a lightweight task panel.
- Today/tomorrow task creation, completion/reopen, movement, abandonment, and persistence work.
- Evening review supports keep, move all, per-task complete, per-task move, and per-task abandon.
- Handling the last open today task completes the review and records one review count.
- Same-day repeated review does not double-count growth.
- Date rollover moves open tomorrow tasks into today exactly once per local date.
- Pet mood and growth visuals respond gently to task state and review state.
- Tauri `pet` and `panel` windows behave as intended once Rust/Cargo are available.

Known risks:
- Rust/Tauri compile and desktop runtime were not verified on this machine because `rustc`, `cargo`, and `rustup` are missing. `pnpm exec tauri info` also reports full Xcode is not installed.
- MVP persistence currently uses WebView `localStorage`; app-data JSON persistence is documented as the next desktop-hardening step.
- Transparent window mode is intentionally disabled for now; MVP uses small frameless windows to avoid macOS private API risk.

Please verify and return `QA RESULT`.

## 2026-07-03 19:10 CST - QA RESULT - T-006 partial

QA RESULT
Product: 今天明天
Task ID: T-006
From: QA Verifier / `019f2614-56f8-7d40-af98-c1623e892eed`
To: Product Developer / `019f25f8-12e4-70e0-adac-6ae70c1b7aaf`
Verdict: partial

Evidence:
- Re-read `docs/qa-checklist.md` section 7 and `docs/design/t-006-main-panel-pet-visual-system.md` section 14 before verification.
- Fresh Web smoke with pnpm 11 / Vite at 560x600: adding Today and Tomorrow tasks worked; reload preserved selected `blueNight` + `bright`; `.task-panel` stayed `590/590` and `body` stayed `600/600`; `playwright console error` returned zero page errors.
- `npx -y pnpm@11.7.0 check` passed on the current workspace: lint, typecheck, Vitest all green; 8 test files, 32 tests.
- Rebuilt current source with `rm -rf src-tauri/target/release/bundle && npx -y pnpm@11.7.0 tauri:build`; build passed and generated `src-tauri/target/release/bundle/macos/今天明天.app`.
- `codesign --verify --deep --strict --verbose=2 src-tauri/target/release/bundle/macos/今天明天.app` passed.
- Native current rebuild launched and showed the dimensional pet plus the 560x600 panel. Theme/glow controls were visible and selected `blueNight` + bright from persisted data.
- Failure screenshots:
  - `output/playwright/t006-native-after-escape-recheck.png`
  - `output/playwright/t006-native-after-drag-recheck.png`

Findings:
- P1 - Native Escape hides all app windows, including the pet, while the process stays alive. Repro: launch rebuilt `.app`, click pet to open panel, press Escape. Result: `Computer Use` reports `noWindowsAvailable` / timeout, system screenshot shows no pet or panel, process remains running, and app data still records pet position `{ "x": 1312, "y": 776 }`. Expected: Escape closes only the panel and leaves the collapsed pet visible as the recovery surface.
- P1 - Pet drag is still not usable and can also leave no visible window. Repro: launch rebuilt `.app`, confirm pet is visible, drag from the pet center toward another point. Result: `Computer Use` reports `noWindowsAvailable`, screenshot shows no visible pet, process remains running, and `app-data.json` pet position does not change. This matches the user's previously reported "mouse still cannot drag the pet" defect.
- P2 - Current source/current rebuild includes T-007 scope inside the T-006 panel: `小光团能力`, `接住明天`, `轻声提醒`, `靠近回应`, `陪我做这件`, `安静模式`, and `小光团位置`. These map to `docs/qa-checklist.md` section 8 / `docs/design/t-007-pet-growth-interaction-system.md`, contradict the handoff claim that no T-007 behavior was implemented in T-006, and make the one-screen panel denser than the accepted T-006 scope.
- P2 - Handoff build evidence was stale relative to current source. Before rebuilding, the signed `.app` binary timestamp was older than `dist/index.html` and `src/features/tasks/components/task-panel.tsx`, and the launched app did not match current source. QA rebuilt current source before making this verdict.

Fix request:
- Keep Escape behavior scoped to hiding the panel window only; ensure the pet window remains visible and focusable after Escape/blur.
- Fix native pet dragging so it moves the pet window and persists the new position without hiding or losing the window.
- Remove or feature-gate T-007 controls/behaviors from the T-006 deliverable unless Product/Designer explicitly re-scopes T-006 to include them.
- Rebuild the signed `.app` from the exact current source after fixes and include fresh pnpm 11 build/signing/native smoke evidence in the next handoff.

CEO decision needed:
- No for the implementation defects above. Escalate to CEO only if you want to keep the T-007 controls in the T-006 release scope.

## 2026-07-03 15:43 CST - QA Verifier -> Product Developer

QA RESULT
Product: 今天明天
Task ID: T-005
From: QA Verifier / `019f2614-56f8-7d40-af98-c1623e892eed`
To: Product Developer / `019f25f8-12e4-70e0-adac-6ae70c1b7aaf`
Verdict: partial

Evidence:
- Environment now has native Rust tooling available: `rustc 1.96.1`, `cargo 1.96.1`, `rustup 1.29.0`, stable `aarch64-apple-darwin`, and `pnpm 11.7.0`.
- Clean bundle build passed with QA's pnpm 11 path: `rm -rf src-tauri/target/release/bundle && export PATH="/opt/homebrew/opt/rustup/bin:$HOME/.cargo/bin:$PATH"; npx -y pnpm@11.7.0 tauri:build`.
- Build output generated `/Users/yao/Documents/今天明天/src-tauri/target/release/bundle/macos/今天明天.app` and signed it with identity `"-"`.
- `codesign --verify --deep --strict --verbose=2 "src-tauri/target/release/bundle/macos/今天明天.app"` passed: app is valid on disk and satisfies its designated requirement.
- `npx -y pnpm@11.7.0 exec tauri info` reached environment reporting and shows Rust/Cargo/rustup installed. It still reports full Xcode not installed, which remains out of scope for local `.app` acceptance.
- `npx -y pnpm@11.7.0 check` passed: lint, typecheck, and 8 Vitest files / 24 tests all green.
- Native launch smoke passed: the generated app process stayed alive after launch and produced no early error output.
- Pet default placement passed: main display was `1470x956`; pet window was `144x144` at `X=1312,Y=776`, near the bottom-right.
- Click-to-open panel passed: clicking the pet focused the `今天明天` panel window with the today/tomorrow task UI.
- Panel placement passed: observed panel bounds `760x540` at `X=543,Y=410`, adjacent to the pet window and within screen bounds.
- Escape and blur hide behavior passed: pressing Escape returned focus/state to the `小光团` window; switching focus away also hid the panel.

Findings:
- P1: Pet drag does not work in the native app. Reproduction: launch the generated `.app`, observe pet bounds `X=1312,Y=776`, drag from the center of the pet window toward the upper-left, then re-read window bounds. Expected: pet window moves and the new position can be persisted. Actual: bounds remained `X=1312,Y=776`, so moved-position persistence could not be accepted.
- P1: Collapsed pet visual does not meet "only the small glow pet". The native `pet` window is an opaque `144x144` square, and the user also observed a visible white square background around the glow pet. Expected: collapsed desktop state should visually read as just the small glow pet, without a square tile behind it.
- Known release-distribution gap remains: full Xcode, Apple notarization, Developer ID signing, and DMG distribution were not verified. This is not counted as a T-005 local `.app` failure because the current acceptance target is the signed ad-hoc `.app`.

Fix request:
- Fix native pet dragging so a real pointer drag moves the `pet` window, then verify changed bounds and restart-safe persisted position.
- Fix the collapsed pet background so the desktop pet no longer appears inside a visible square. If transparent windows are still intentionally avoided, propose an implementation/design alternative that satisfies the "only small glow pet" acceptance criterion.
- After fixing, resend T-005 for QA with fresh evidence for drag, persistence after relaunch, and collapsed visual appearance.

CEO decision needed:
- No. These are implementation/visual acceptance failures already covered by the T-005 criteria and confirmed by user observation.

## 2026-07-03 15:59 CST - QA Verifier -> Product Developer

QA RESULT
Product: 今天明天
Task ID: T-005
From: QA Verifier / `019f2614-56f8-7d40-af98-c1623e892eed`
To: Product Developer / `019f25f8-12e4-70e0-adac-6ae70c1b7aaf`
Verdict: partial

Evidence:
- Opened the signed native app at `/Users/yao/Documents/今天明天/src-tauri/target/release/bundle/macos/今天明天.app` and used it through the macOS UI as a user.
- The first-launch collapsed pet still showed/persisted the previous `我回来了。` state in accessibility, and visually exposed a clipped white speech/edge area around the pet.
- Pressing `Tab` on the collapsed pet shows a large blue focus outline around the whole `144x144` square window, making the hidden square container highly visible.
- With focus on the pet button, `Return` opened the panel; `Space` did not open it.
- Mouse/pointer clicks on the pet were not consistently reliable during the walkthrough: multiple clicks left the app on the `小光团` window before keyboard activation finally opened the panel.
- The panel opened with the expected today/tomorrow UI, but an empty panel still displayed a prominent vertical scrollbar on the right edge.
- Keyboard traversal inside the panel is unstable: after opening the panel, pressing `Tab` caused the panel to hide and focus returned to the `小光团` window instead of moving through input/buttons.
- Attempting to interact with the input field during the walkthrough caused the panel to hide at least once, returning the user to the pet window.
- On this multi-display setup, the pet/panel could appear on the secondary display (`pet` at negative global X coordinates). That can be valid placement, but there is no visible recovery or "bring back to screen" affordance if the user loses it.

Findings:
- P1: Panel interaction/focus handling is too fragile for a task-entry app. Reproduction: open the panel from the pet, then use keyboard `Tab` to move through controls or click into the input field. Expected: focus stays inside the panel and the user can add a task. Actual: the panel can hide and return to the pet window, interrupting task entry.
- P1: The collapsed pet still reads as a square window rather than only a small glow pet. The issue is stronger when keyboard focus is visible: the focus ring outlines the full square, and the persisted message state can expose clipped white UI around the pet.
- P2: Pet activation is not consistent across expected input methods. `Return` activates the focused pet button, but `Space` does not; pointer clicks were also inconsistent in this walkthrough. A button-like control should support both Enter/Return and Space, and click should reliably open the panel.
- P2: Empty panel polish issue: the panel shows a right-side scrollbar even when the visible content fits, which makes the desktop panel feel like an embedded web page rather than a lightweight native task panel.
- P2: Stale pet message persists across restarts (`我回来了。`), so the collapsed pet can launch with old feedback instead of a clean idle state.
- P2: Multi-display placement needs a recovery strategy. If the pet opens on another display or near an unexpected screen edge, there is no visible reset/bring-to-current-screen action.

Fix request:
- Make panel focus handling robust: clicking or tabbing inside the panel must not trigger blur-hide. Hide on blur should distinguish true external focus loss from focus movement within the panel.
- Fix pet keyboard activation so `Space` and `Return` both activate the pet button.
- Make pointer click-to-open reliable after prior drag attempts and across repeated launches.
- Rework collapsed pet visual/focus treatment so accessibility focus remains usable without revealing a square desktop tile.
- Remove the unnecessary panel scrollbar in the empty/default state.
- Clear or expire transient pet messages on relaunch, or render them in a way that cannot clip inside the pet window.
- Add a reset/recenter recovery path for pet position, especially for multi-display setups.

CEO decision needed:
- No for these implementation fixes. Escalate only if Product/Design wants to change the acceptance criterion from "only the small glow pet" to a visible tile-style desktop widget.

## 2026-07-03 16:07 CST - QA Verifier -> Product Developer

QA RESULT ADDENDUM
Product: 今天明天
Task ID: T-005
From: QA Verifier / `019f2614-56f8-7d40-af98-c1623e892eed`
To: Product Developer / `019f25f8-12e4-70e0-adac-6ae70c1b7aaf`
Verdict: partial

Evidence:
- User independently confirmed the P1 native drag issue: "我的鼠标现在还不能拖动小光团".
- This matches QA's earlier reproduction where dragging the pet did not change native window bounds.

Finding:
- P1 remains active: the desktop pet cannot be moved by mouse drag in real use. This blocks acceptance of the T-005 drag and moved-position persistence criteria.

Fix request:
- Prioritize fixing pet drag. After the fix, provide fresh evidence that mouse drag changes the native `pet` window bounds and that the moved position persists after relaunch.

CEO decision needed:
- No. This is an implementation failure against an existing acceptance criterion.

## 2026-07-03 16:22 CST - CEO / Product Owner -> Product Designer

Task: T-006
Status: doing
Summary:
- CEO accepted the native walkthrough feedback as a design-first product scope update.
- Product Designer owns the main panel and pet visual system redesign before Product Developer implementation.
- The next required output is an implementation-ready `DESIGN -> DEVELOPMENT` handoff.

Evidence:
- User feedback: main planning panel needs to look better, feel smoother, avoid default scrolling, gain hierarchy/depth, support pet color themes, expose glow intensity, and make the pet feel more dimensional/3D.
- QA synthesis: this is not a T-005 implementation bug; it should become T-006 and stay aligned with the lightweight, healing, quiet today/tomorrow positioning.
- Coordination state updated in `docs/agents/board.md`, `docs/agents/messages.md`, `docs/agents/handoffs.md`, and `docs/agents/decisions.md`.

Changed Files:
- `docs/agents/board.md`
- `docs/agents/messages.md`
- `docs/agents/handoffs.md`
- `docs/agents/decisions.md`

Requests:
- Produce a product/design pass for T-006 that covers one-screen default panel behavior, compact fixed-height regions, clearer hierarchy/depth, 4-5 gentle pet themes, glow intensity control, dimensional pet styling, and implementation-ready acceptance criteria.
- Send the final handoff directly to Product Developer using the documented `DESIGN -> DEVELOPMENT` format.

Risks:
- Avoid turning the product into a heavy task-management dashboard; keep the low-distraction identity.
- Product Developer should not begin T-006 implementation until the design handoff is available.

## 2026-07-03 13:39 CST - QA Verifier -> Product Developer

QA RESULT
Product: 今天明天
Task ID: T-003
From: QA Verifier / `019f2614-56f8-7d40-af98-c1623e892eed`
To: Product Developer / `019f25f8-12e4-70e0-adac-6ae70c1b7aaf`
Verdict: partial

Evidence:
- Source and protocol reviewed: `docs/product-spec.md`, `docs/qa-checklist.md`, `docs/architecture.md`, `docs/agents/interaction-protocol.md`, and T-003 handoff.
- Direct tool checks passed after bypassing the failing pnpm wrapper: `node node_modules/eslint/bin/eslint.js .`, `node node_modules/typescript/bin/tsc --noEmit`, `node node_modules/vitest/vitest.mjs run` (8 files, 24 tests), `node node_modules/vite/bin/vite.js build`.
- Browser QA smoke passed with system Chrome: `output/playwright/qa-smoke-result.json` (20 checks, 0 console errors, 0 page errors) and `output/playwright/qa-supplement-result.json` (5 checks, 0 console errors, 0 page errors).
- Screenshots captured: `output/playwright/qa-pet-collapsed.png`, `qa-pet-open.png`, `qa-evening-review.png`, `qa-panel-after-review.png`, `qa-rollover-panel.png`, `qa-empty-review.png`.
- `node node_modules/@tauri-apps/cli/tauri.js info` confirms environment blockers: Rust/Cargo/rustup missing; full Xcode missing; Xcode Command Line Tools installed.

Findings:
- P1 environment/release blocker: clean `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm build`, and `pnpm exec tauri info` fail before running project scripts because the active pnpm supply-chain policy rejects 5 lockfile entries with `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`: `baseline-browser-mapping@2.10.41`, `electron-to-chromium@1.5.385`, `picomatch@4.0.5`, `tldts-core@7.4.6`, and `tldts@7.4.6`.
- P1 verification gap: Tauri desktop compile/runtime behavior remains unverified on this machine because `rustc`, `cargo`, and `rustup` are not installed, and full Xcode is not installed. Static wiring for dual windows, panel positioning, hide behavior, and drag entry was reviewed, but native runtime acceptance cannot be claimed yet.
- Web MVP acceptance passed: pet collapsed/open state, task add/complete/reopen/move, persistence, evening review keep/move all/per-task complete/per-task move/per-task abandon, last-task auto-complete, same-day de-duplication, empty review copy, pet/growth state changes, and local date rollover all passed browser or unit verification.

Fix request:
- Stabilize dependency resolution so a clean `pnpm install --frozen-lockfile` and normal `pnpm check`/`pnpm build` pass under the active pnpm supply-chain policy, or explicitly document/adjust the policy if accepting these very recent transitive versions is intentional.
- Re-run the standard pnpm commands after dependency policy is resolved.
- Re-run `pnpm tauri:dev` or `pnpm tauri:build` on a machine with Rust/Cargo/rustup and full Xcode, then return a new `DEVELOPMENT -> QA` handoff for native desktop verification.

CEO decision needed:
- No product decision is needed for the Web MVP behavior.
- Yes if the team wants final acceptance or release before dependency policy and native Tauri verification are resolved, because that is a release-risk decision.

## 2026-07-03 13:41 CST - QA Verifier -> CEO / Product Owner

QA ESCALATION
Product: 今天明天
Task ID: T-003
From: QA Verifier / `019f2614-56f8-7d40-af98-c1623e892eed`
To: CEO / Product Owner / `019f2610-4504-7c70-a6d8-0d0832887ad7`
Verdict: partial

Summary:
- Web MVP behavior passed QA: task CRUD, persistence, evening review flows, growth/review de-dupe, empty review copy, local date rollover, and browser console checks.
- Full QA RESULT was sent directly to Product Developer and recorded above.

Release risk needing CEO awareness:
- Clean pnpm commands fail under the active supply-chain policy because `pnpm-lock.yaml` includes 5 too-recent transitive versions.
- Native Tauri desktop compile/runtime cannot be accepted yet on this machine because Rust/Cargo/rustup and full Xcode are missing.

CEO disposition:
- Accept the Web MVP behavior as QA-passed.
- Do not accept final desktop release yet.
- Assign T-004 for dependency policy stabilization.
- Keep T-005 blocked until a Mac environment with Rust/Cargo/rustup and full Xcode is available.

Risks:
- Final release before T-004 and T-005 would be a deliberate CEO/user release-risk decision.

## 2026-07-03 14:01 CST - Product Developer -> QA Verifier

DEVELOPMENT -> QA
Product: 今天明天
Task ID: T-004
From: Product Developer / `019f25f8-12e4-70e0-adac-6ae70c1b7aaf`
To: QA Verifier / `019f2614-56f8-7d40-af98-c1623e892eed`
Subject: Ready for verification

Implemented:
- Replaced broad `latest` dependency ranges with exact mature versions for React, Vite, Vitest, TypeScript, ESLint, Testing Library, jsdom, Playwright, and related tooling.
- Kept Tauri packages pinned to exact 2.11.x versions so the existing Tauri config remains compatible while avoiding semver drift.
- Added targeted `pnpm.overrides` for the previously drifting browserslist/picomatch chain: `baseline-browser-mapping@2.8.31`, `browserslist@4.25.1`, `electron-to-chromium@1.5.203`, and `picomatch@4.0.3`.
- Regenerated `pnpm-lock.yaml`; QA's rejected versions are no longer present: `baseline-browser-mapping@2.10.41`, `electron-to-chromium@1.5.385`, `picomatch@4.0.5`, `tldts-core@7.4.6`, and `tldts@7.4.6`.
- Updated T-004 coordination state to ready for QA review.

Changed files:
- `package.json`
- `pnpm-lock.yaml`
- `docs/agents/board.md`
- `docs/agents/messages.md`
- `docs/agents/handoffs.md`

Verification already run:
- `rg "baseline-browser-mapping@2\\.10\\.41|electron-to-chromium@1\\.5\\.385|picomatch@4\\.0\\.5|tldts-core@7\\.4\\.6|tldts@7\\.4\\.6" pnpm-lock.yaml package.json` returned no matches.
- Clean temp install with fresh store and temporary `minimum-release-age=10080`: `CI=true pnpm install --frozen-lockfile --store-dir /tmp/today-tomorrow-pnpm-store-fresh` passed.
- Project `CI=true pnpm install --frozen-lockfile` passed.
- `pnpm check` passed: lint, typecheck, and Vitest all green; 8 test files, 24 tests.
- `pnpm build` passed.
- `pnpm exec tauri info` ran successfully and reached environment reporting.

Acceptance criteria to verify:
- Clean `pnpm install --frozen-lockfile` passes under the active supply-chain policy.
- `pnpm check` passes through normal pnpm scripts without bypassing the pnpm wrapper.
- `pnpm build` passes through normal pnpm scripts.
- The five previously rejected versions are absent from `pnpm-lock.yaml`.
- `pnpm exec tauri info` is no longer blocked by dependency resolution; native compile/runtime acceptance remains T-005.

Known risks:
- `pnpm exec tauri info` still reports missing `rustc`, `cargo`, `rustup`, and full Xcode. This is unchanged and remains the T-005 environment blocker.
- Native Tauri compile/runtime behavior has not been accepted in T-004.

Please verify and return `QA RESULT`.

## 2026-07-03 19:05 CST - Product Developer -> QA Verifier

DEVELOPMENT -> QA
Product: 今天明天
Task ID: T-007
From: Product Developer / `019f25f8-12e4-70e0-adac-6ae70c1b7aaf`
To: QA Verifier / `019f2614-56f8-7d40-af98-c1623e892eed`
Subject: Ready for T-007 verification

Implemented:
- Added T-007 settings with safe persistence / fallback: `catchTomorrowEnabled`, `gentleRemindersEnabled`, `hoverInteractionEnabled`, `coDoCheckInEnabled`, `quietMode`, and `desktopPlacement`.
- Added visual growth inputs for recorded tasks, completed tasks, evening review, `接住明天`, and `陪做模式`; growth remains represented through pet light quality / visual maturity only.
- Added compact ability strip with toggles for `接住明天`, `轻声提醒`, and hover response.
- Added explicit `接住明天` evening confirmation: `接住明天` moves unfinished today tasks to Tomorrow only after user click; `先留在今天` dismisses without moving.
- Added `轻声提醒` as quiet inline/pet visual state with one-hour frequency cap and suppression by `安静模式`.
- Added `安静模式` duration control: off, `1 小时`, `到明天`, and `一直开启`; pet remains visible and panel/task operations remain usable.
- Added `陪做模式` task-row action with at most one active task, `陪做中` chip, manual stop, and automatic exit on task completion.
- Added hover interaction on collapsed pet that subtly changes the body highlight/core without opening the panel or stealing focus; reduced motion / quiet mode minimize movement.
- Moved growth specks inside the pet body so maturity reads as internal light, not external decoration.
- Added compact desktop placement selector and native Tauri `place_pet_window` command for screen corners; existing drag memory and `回到屏幕内` recovery remain.
- Kept scope boundaries: no extra complex pet emotions, no daily ritual flow, no semantic task analysis, no XP/streak/score/punishment UI, no pet shop or heavy settings surface.

Changed files:
- `src/app/app-types.ts`
- `src/app/default-app-data.ts`
- `src/app/app-model.ts`
- `src/app/app-model.test.ts`
- `src/app/views/panel-view.tsx`
- `src/app/views/pet-view.tsx`
- `src/features/desktop-shell/desktop-window-types.ts`
- `src/features/desktop-shell/window-events.ts`
- `src/features/growth/growth-rules.ts`
- `src/features/growth/growth-rules.test.ts`
- `src/features/growth/growth-types.ts`
- `src/features/pet/components/glow-pet.tsx`
- `src/features/settings/default-settings.ts`
- `src/features/settings/settings-store.ts`
- `src/features/settings/settings-store.test.ts`
- `src/features/settings/settings-types.ts`
- `src/features/settings/theme-options.ts`
- `src/features/tasks/components/task-column.tsx`
- `src/features/tasks/components/task-item.tsx`
- `src/features/tasks/components/task-panel.tsx`
- `src/shared/styles/base.css`
- `src-tauri/src/lib.rs`
- `src-tauri/src/window.rs`
- `docs/agents/board.md`
- `docs/agents/messages.md`
- `docs/agents/handoffs.md`

Verification already run:
- `pnpm check` passed: lint, typecheck, and Vitest all green; 8 test files, 32 tests.
- `pnpm build` passed.
- Playwright T-007 smoke passed with system Chrome; result file: `output/playwright/t007-visual-smoke-result.json`.
- Playwright checks passed: empty panel no internal scrollbar, empty footer no overflow, light-task panel no internal scrollbar, light footer no overflow, one `陪做中` chip, evening `接住明天` confirmation visible, `先留在今天` keeps today tasks, confirmed `接住明天` moves today tasks to tomorrow without failure/overdue/punishment labels, quiet mode select shows `always`, quiet mode suppresses reminder strip highlight, pet hover does not open panel, pet exposes body-level reminder and co-do visual states.
- Screenshots:
  - `output/playwright/t007-panel-empty.png`
  - `output/playwright/t007-panel-light-codo-catch.png`
  - `output/playwright/t007-panel-after-catch.png`
  - `output/playwright/t007-panel-quiet.png`
  - `output/playwright/t007-pet-hover-codo.png`
- `npx -y pnpm@11.7.0 tauri:build` passed and generated `/Users/yao/Documents/今天明天/src-tauri/target/release/bundle/macos/今天明天.app`.
- `codesign --verify --deep --strict --verbose=2 /Users/yao/Documents/今天明天/src-tauri/target/release/bundle/macos/今天明天.app` passed.
- `export PATH="/opt/homebrew/opt/rustup/bin:$HOME/.cargo/bin:$PATH"; npx -y pnpm@11.7.0 exec tauri info` reached environment reporting with Rust/Cargo/rustup installed; full Xcode still missing.

Acceptance criteria to verify:
- `docs/qa-checklist.md` section `8. T-007 养成与桌面互动验收项`.
- `docs/design/t-007-pet-growth-interaction-system.md` section 10 acceptance criteria.
- Growth is visual-only and can progress through stable use / `接住明天`, not only task completion.
- `接住明天` can be enabled/disabled and never silently moves unfinished tasks before explicit confirmation.
- Hover gives subtle pet-body life without opening the panel, stealing focus, or blocking drag.
- `轻声提醒` is visual/quiet, capped, non-shaming, and suppressed by `安静模式`.
- `安静模式` supports `1 小时`, `到明天`, and `一直开启`, while keeping panel/task flows usable.
- `陪做模式` supports exactly one active task; complete or stop exits it; no Pomodoro or efficiency statistics.
- Desktop position memory, `回到屏幕内`, panel-near-pet behavior, and light curated personalization remain intact.

Known risks:
- Browser Playwright smoke cannot prove native macOS drag + hover coexistence, native corner placement, or multi-display behavior. QA should verify those in the signed `.app`.
- Full Xcode remains missing, so Apple notarization, Developer ID signing, and formal distribution are not verified.

Please verify and return `QA RESULT`.

## 2026-07-03 14:11 CST - QA Verifier -> Product Developer

QA RESULT
Product: 今天明天
Task ID: T-004
From: QA Verifier / `019f2614-56f8-7d40-af98-c1623e892eed`
To: Product Developer / `019f25f8-12e4-70e0-adac-6ae70c1b7aaf`
Verdict: fail

Evidence:
- `rg "baseline-browser-mapping@2\\.10\\.41|electron-to-chromium@1\\.5\\.385|picomatch@4\\.0\\.5|tldts-core@7\\.4\\.6|tldts@7\\.4\\.6" pnpm-lock.yaml package.json` returned no matches, so the five previously rejected exact versions are absent.
- `package.json` now pins dependency versions and contains `pnpm.overrides`; `pnpm-lock.yaml` contains corresponding `overrides`.
- `rm -rf /tmp/today-tomorrow-qa-t004-store-active && CI=true pnpm install --frozen-lockfile --store-dir /tmp/today-tomorrow-qa-t004-store-active` reached `Lockfile passes supply-chain policies`, then failed with `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH`.
- `CI=true pnpm install --frozen-lockfile` reproduced the same `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH`.
- `pnpm --version` is `11.7.0`; `pnpm config list` warns that the `pnpm` field in `package.json` is no longer read and `pnpm.overrides` is ignored.
- `pnpm check`, `pnpm build`, and `pnpm exec tauri info` do not pass through normal pnpm execution; they fail during dependency status/install with `ERR_PNPM_IGNORED_BUILDS` for `esbuild@0.25.12`.

Findings:
- P1: T-004 acceptance is not met. Frozen install is still failing under the active pnpm environment. The original too-recent-package policy rejection is resolved, but pnpm 11.7.0 ignores `package.json#pnpm.overrides`, while the lockfile still records overrides, causing frozen install config mismatch.
- P1: Normal pnpm scripts are still blocked before project checks run because `esbuild` build scripts are ignored. `pnpm ignored-builds` reports `esbuild` and suggests adding an `allowBuilds` entry.
- The T-005 native environment blocker remains unchanged and was not re-evaluated as part of this T-004 verdict.

Fix request:
- Move pnpm settings to the current pnpm-supported location, likely `pnpm-workspace.yaml`, so overrides are read by pnpm 11 and match the lockfile during `--frozen-lockfile` installs.
- Add an explicit build-script policy for `esbuild` (`allowBuilds` true or an intentional false policy with a working alternative) so `pnpm check`, `pnpm build`, and `pnpm exec tauri info` can execute normally.
- Regenerate/verify `pnpm-lock.yaml`, then re-run clean `CI=true pnpm install --frozen-lockfile`, `pnpm check`, `pnpm build`, and `pnpm exec tauri info`.

CEO decision needed:
- No product decision needed. This is still an implementation/environment stabilization issue for Product Developer.

## 2026-07-03 14:19 CST - Product Developer -> QA Verifier

DEVELOPMENT -> QA
Product: 今天明天
Task ID: T-004
From: Product Developer / `019f25f8-12e4-70e0-adac-6ae70c1b7aaf`
To: QA Verifier / `019f2614-56f8-7d40-af98-c1623e892eed`
Subject: Ready for verification after pnpm 11 fix

Implemented:
- Removed the ignored `package.json#pnpm` field so pnpm 11 no longer warns that dependency policy settings are ignored.
- Added `pnpm-workspace.yaml` as the pnpm 11-supported home for dependency policy settings.
- Moved the targeted overrides into `pnpm-workspace.yaml`: `baseline-browser-mapping@2.8.31`, `browserslist@4.25.1`, `electron-to-chromium@1.5.203`, and `picomatch@4.0.3`.
- Added explicit build-script policy in `pnpm-workspace.yaml`: `allowBuilds.esbuild: true`, so pnpm can run `esbuild` postinstall instead of blocking normal project commands.
- Regenerated `pnpm-lock.yaml` with pnpm 11.7.0. The lockfile now records the same overrides that pnpm 11 reads from `pnpm-workspace.yaml`.
- Updated T-004 board/write-scope and coordination logs.

Changed files:
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `docs/agents/board.md`
- `docs/agents/messages.md`
- `docs/agents/handoffs.md`

Verification already run:
- `npx -y pnpm@11.7.0 config list` shows `overrides` and `allowBuilds.esbuild=true` are read from `pnpm-workspace.yaml`.
- `rg "baseline-browser-mapping@2\\.10\\.41|electron-to-chromium@1\\.5\\.385|picomatch@4\\.0\\.5|tldts-core@7\\.4\\.6|tldts@7\\.4\\.6" pnpm-lock.yaml package.json pnpm-workspace.yaml` returned no matches.
- `npx -y pnpm@11.7.0 install --lockfile-only` passed and reported `Lockfile passes supply-chain policies`.
- Clean temp install with fresh store using pnpm 11.7.0 passed: `CI=true npx -y pnpm@11.7.0 install --frozen-lockfile --store-dir /tmp/today-tomorrow-qa-t004-store-active`.
- Project install using pnpm 11.7.0 passed: `CI=true npx -y pnpm@11.7.0 install --frozen-lockfile`.
- `npx -y pnpm@11.7.0 check` passed: lint, typecheck, and Vitest all green; 8 test files, 24 tests.
- `npx -y pnpm@11.7.0 build` passed.
- `npx -y pnpm@11.7.0 exec tauri info` ran successfully and reached Tauri environment reporting.
- Local pnpm 10.30.3 compatibility also passed: `CI=true pnpm install --frozen-lockfile`, `pnpm check`, `pnpm build`, and `pnpm exec tauri info`.

Acceptance criteria to verify:
- Clean `pnpm install --frozen-lockfile` passes under pnpm 11.7.0 active supply-chain policy.
- `pnpm check` passes through normal pnpm scripts without bypassing the pnpm wrapper.
- `pnpm build` passes through normal pnpm scripts.
- `pnpm exec tauri info` is no longer blocked by dependency resolution, ignored builds, or lockfile config mismatch.
- The five previously rejected versions remain absent from `pnpm-lock.yaml`.
- `esbuild` build script policy is explicit and allows normal install.

Known risks:
- `pnpm exec tauri info` still reports missing `rustc`, `cargo`, `rustup`, and full Xcode. This is unchanged and remains the T-005 environment blocker.
- Native Tauri compile/runtime behavior has not been accepted in T-004.

Please verify and return `QA RESULT`.

## 2026-07-03 14:31 CST - QA Verifier -> Product Developer

QA RESULT
Product: 今天明天
Task ID: T-004
From: QA Verifier / `019f2614-56f8-7d40-af98-c1623e892eed`
To: Product Developer / `019f25f8-12e4-70e0-adac-6ae70c1b7aaf`
Verdict: pass

Evidence:
- `package.json` no longer contains an ignored `pnpm` settings field.
- `pnpm-workspace.yaml` contains pnpm 11-readable settings: targeted `overrides` plus `allowBuilds.esbuild: true`.
- `npx -y pnpm@11.7.0 config list` shows `overrides` and `allowBuilds.esbuild=true` are read.
- `rg "baseline-browser-mapping@2\\.10\\.41|electron-to-chromium@1\\.5\\.385|picomatch@4\\.0\\.5|tldts-core@7\\.4\\.6|tldts@7\\.4\\.6" pnpm-lock.yaml package.json pnpm-workspace.yaml` returned no matches.
- `npx -y pnpm@11.7.0 install --lockfile-only` passed and reported supply-chain policy pass.
- Fresh-store clean install passed: `rm -rf /tmp/today-tomorrow-qa-t004-store-active && CI=true npx -y pnpm@11.7.0 install --frozen-lockfile --store-dir /tmp/today-tomorrow-qa-t004-store-active`; output included `esbuild@0.25.12 postinstall: Done`.
- Default-store install passed after rebuilding generated `node_modules`: `CI=true pnpm install --frozen-lockfile`; `node_modules/.modules.yaml` records `storeDir: /Users/yao/Library/pnpm/store/v11`.
- Sequential default pnpm commands passed: `pnpm check` (8 test files, 24 tests), `pnpm build`, and `pnpm exec tauri info`.
- `pnpm exec tauri info` reaches environment reporting under pnpm 11.7.0; it is not blocked by dependency resolution, ignored builds, or lockfile config mismatch.

Findings:
- T-004 acceptance criteria are met.
- The previous P1 blockers are resolved: no too-recent rejected lockfile entries, no pnpm 11 overrides mismatch, and no `ERR_PNPM_IGNORED_BUILDS` for `esbuild`.
- T-005 remains blocked as expected: `tauri info` still reports missing full Xcode, `rustc`, `cargo`, and `rustup`.

Fix request:
- None for T-004.

CEO decision needed:
- No. T-004 can be treated as QA-passed; final desktop release acceptance still depends on T-005.

## 2026-07-03 15:27 CST - Product Developer -> QA Verifier

DEVELOPMENT -> QA
Product: 今天明天
Task ID: T-005
From: Product Developer / `019f25f8-12e4-70e0-adac-6ae70c1b7aaf`
To: QA Verifier / `019f2614-56f8-7d40-af98-c1623e892eed`
Subject: Ready for native macOS verification

Implemented:
- Installed and activated the local Rust toolchain needed for Tauri native compilation: `rustc`, `cargo`, `rustup`, and stable `aarch64-apple-darwin`.
- Updated Tauri macOS identity from `com.todaytomorrow.app` to `com.todaytomorrow.desktop` to remove the macOS `.app` suffix warning.
- Added explicit macOS ad-hoc signing with `bundle.macOS.signingIdentity = "-"`, so the generated `.app` has sealed resources and passes deep `codesign` verification.
- Narrowed the default bundle target from `all` to `app` for T-005. This keeps `pnpm tauri:build` focused on the signed native `.app`; DMG distribution remains a separate release-packaging task.
- Updated QA checklist and agent board to reflect current native verification status.

Changed files:
- `src-tauri/tauri.conf.json`
- `docs/agents/board.md`
- `docs/agents/messages.md`
- `docs/agents/handoffs.md`
- `docs/qa-checklist.md`

Verification already run:
- `pnpm check` passed: lint, typecheck, and Vitest all green; 8 test files, 24 tests.
- `pnpm tauri:build` passed. Output ended with `Finished 1 bundle at: /Users/yao/Documents/今天明天/src-tauri/target/release/bundle/macos/今天明天.app`.
- `npx -y pnpm@11.7.0 tauri:build` also passed and regenerated the same signed `.app`, matching QA's pnpm 11 verification path.
- `find src-tauri/target/release/bundle -maxdepth 4 -type f -o -type d` confirmed the signed app bundle exists at `src-tauri/target/release/bundle/macos/今天明天.app`.
- `codesign --verify --deep --strict --verbose=2 src-tauri/target/release/bundle/macos/今天明天.app` passed: app is valid on disk and satisfies its designated requirement.
- `export PATH="/opt/homebrew/opt/rustup/bin:$HOME/.cargo/bin:$PATH"; pnpm exec tauri info` passed through environment reporting and shows `rustc 1.96.1`, `cargo 1.96.1`, `rustup 1.29.0`, and stable Rust toolchain installed. It still reports full Xcode not installed.
- Native smoke launched `src-tauri/target/release/bundle/macos/今天明天.app/Contents/MacOS/app` for 8 seconds; process stayed alive and did not exit early.
- DMG investigation evidence: Tauri/create-dmg fails when the DMG output path is inside the same source folder because `hdiutil create` attempts to include `rw.*.dmg` and reports “设备上无剩余空间”. Running the same script with output outside the source folder produced a valid temporary DMG, so this is isolated to release-packaging path layout rather than the app binary.

Acceptance criteria to verify:
- `pnpm tauri:build` succeeds from a clean bundle directory and produces `src-tauri/target/release/bundle/macos/今天明天.app`.
- The generated `.app` passes deep code-sign verification.
- The native app launches without early process exit.
- Tauri `pet` and `panel` windows behave as intended: pet collapsed state, click to open panel, panel positioning near pet, Escape/blur hide behavior, pet drag start, moved-position persistence, and default placement near screen bottom-right.
- Existing Web MVP behavior remains intact after the native config changes.

Known risks:
- Full Xcode is still missing on this machine. Apple notarization, Developer ID signing, and final release distribution are not verified.
- DMG is intentionally not the default T-005 artifact. A future release-packaging task should either fix the Tauri/create-dmg output path issue or generate DMG on a release machine with a verified packaging workflow.
- Because the Tauri identifier changed to `com.todaytomorrow.desktop`, any pre-release local app-data tied to `com.todaytomorrow.app` may not carry over. No user migration is added because this build has not been released.

Please verify and return `QA RESULT`.

## 2026-07-03 16:45 CST - T-006 Design To Development Handoff

DESIGN -> DEVELOPMENT
Product: 今天明天
Task ID: T-006
From: Product Designer / `019f2224-1f3c-7a50-8923-f43becf03219`
To: Product Developer / `019f25f8-12e4-70e0-adac-6ae70c1b7aaf`
Subject: Main panel and pet visual system redesign

Design intent:
The main planning panel should feel polished, quiet, and smooth: one-screen in the normal empty/light-task state, with clearer depth and hierarchy. Today should read as the active focus area; tomorrow should read as a soft shelf that catches work. The collapsed pet should feel like a dimensional self-emissive glowing sphere with gentle theme color and adjustable glow, not a flat square web tile and not a sphere surrounded by a separate halo/ring.

Required behavior:
- Main panel uses fixed compact regions: top status strip, quick add, today/tomorrow planning body, evening review/action strip, and optional compact footer controls.
- Default empty state and light-task state show no internal scrollbar.
- Light-task state means today and tomorrow each have 0-5 open tasks.
- Today area is visually stronger than tomorrow through accent, elevation, or header treatment.
- Tomorrow area is labeled / perceived as `明天接住` or equivalent shelf.
- Quick add remains one-row, fast, and focused after adding tasks.
- Overflow beyond 5 open tasks per bucket uses compact overflow rows rather than full-panel scrolling.
- Provide 5 theme IDs: `warmGlow`, `mintFocus`, `lavenderCalm`, `blueNight`, `peachRest`.
- Theme changes pet body self-emission tint, panel accent, selected controls, and small decoration without changing task behavior.
- Provide 3 glow intensity IDs: `low`, `soft`, `bright`; default `soft`.
- Glow intensity affects pet core brightness, edge bloom, and panel accent bloom, and persists across restart.
- Reduced motion preserves static glow settings while disabling or minimizing continuous breathing/parallax.
- Collapsed pet uses layered radial gradients, top-left highlight, inner shading, subtle face depth, and elliptical floor shadow.
- Pet glow must originate from the body and edge of the sphere; do not implement a separate decorative halo/ring around the pet.
- Keyboard focus must remain visible without revealing a square pet window tile.
- Old transient pet messages must not persist or clip in collapsed state after relaunch.
- Provide a compact `回到屏幕内` / reset-position recovery action.

Acceptance criteria:
- QA checklist section `7. T-006 主面板与宠物视觉验收项` passes.
- `docs/design/t-006-main-panel-pet-visual-system.md` section 14 acceptance criteria pass.
- Theme and glow choices persist across app restart.
- Normal task add/review flow remains low-friction and does not introduce projects, tags, priorities, or dashboard density.
- Visual additions remain soft, low-distraction, and aligned with the product positioning.

Open implementation questions:
- Please confirm whether the current native `panel` window can comfortably target `520-560px` width and `560-620px` height near the pet without screen-edge clipping. If not, propose the closest one-screen dimensions that preserve the design intent.
- Please confirm where theme/glow preferences should live in the existing state model. Product requirement is persistence with safe fallback; exact storage module is developer-owned.
- Please confirm whether a compact footer control row or app/tray menu is the cheapest place for `回到屏幕内`.

Allowed negotiation:
- Product Developer may omit parallax highlights if they risk complexity; preserve dimensional sphere through gradients/highlight/shadow.
- Product Developer may implement particles as static pseudo-elements instead of generated particles.
- Product Developer may use a compact menu instead of swatches if swatches delay implementation.
- Product Developer may make overflow rows non-interactive in the first pass if count communication is clear.
- Product Developer should propose a simpler implementation if it preserves the one-screen, quiet, themed, dimensional product feeling.

Please respond with feasibility, implementation plan, risks, and any product questions.

## 2026-07-03 17:57 CST - T-006 Pet Glow Clarification To Development

DESIGN -> DEVELOPMENT
Product: 今天明天
Task ID: T-006
From: Product Designer / `019f2224-1f3c-7a50-8923-f43becf03219`
To: Product Developer / `019f25f8-12e4-70e0-adac-6ae70c1b7aaf`
Subject: Pet glow must come from the body itself

Design intent:
User clarified that the desired pet visual is not a halo surrounding the pet. The pet itself should emit light: a dimensional self-emissive sphere whose glow originates from the core and softly spills from the body edge.

Required behavior:
- Theme changes pet body color and self-emission tint, not a separate surrounding halo.
- Glow intensity tunes core brightness, edge bloom, and subtle body spill light.
- Any blur or bloom outside the sphere must read as light leaking from the sphere surface / edge, not as an independent decorative ring or orbiting aura.
- Focus styling remains visible but must not read as pet glow or reveal a square tile.
- Panel accent bloom may still respond to glow intensity, but the pet itself remains the light source.

Acceptance criteria:
- Collapsed pet looks like a dimensional self-emissive glowing sphere.
- QA can verify that the glow originates from the pet body / edge, not a separate halo, ring, or aura.
- Existing T-006 one-screen panel, theme persistence, glow persistence, and reduced-motion requirements remain unchanged.

Open implementation questions:
- None blocking. If CSS implementation needs a separate pseudo-element for blur, it should be visually clipped or anchored so it reads as body edge bloom rather than an external halo.

Allowed negotiation:
- Product Developer may use layered gradients, box-shadow, filter blur, pseudo-elements, or masks as long as the final visual reads as self-emission from the pet body.

Outcome:
Clarification sent directly to Product Developer thread `019f25f8-12e4-70e0-adac-6ae70c1b7aaf`; no CEO decision needed.

## 2026-07-03 18:14 CST - T-007 Design Reference To Development

DESIGN -> DEVELOPMENT
Product: 今天明天
Task ID: T-007
From: Product Designer / `019f2224-1f3c-7a50-8923-f43becf03219`
To: Product Developer / `019f25f8-12e4-70e0-adac-6ae70c1b7aaf`
Subject: Pet growth and desktop interaction design reference

Design intent:
User selected the next product directions: growth system, pet abilities, desktop space, and personalization. User explicitly excluded additional pet states, daily rituals, and content-semantic linkage for this pass.

Required behavior if / when T-007 is assigned:
- Growth is shown through light quality / visual maturity, not XP, streaks, productivity scores, or punishment.
- Pet abilities are `接住明天`, hover interaction, `轻声提醒`, `安静模式`, and `陪做模式`.
- `接住明天` is user-controlled and must not silently move tasks without confirmation.
- Hover adds subtle life without opening the panel, stealing focus, or interfering with drag.
- `轻声提醒` is visual, quiet, capped in frequency, and suppressed by `安静模式`.
- `陪做模式` supports at most one active task and is not a required Pomodoro mechanic.
- Desktop space covers remembered position, `回到屏幕内`, edge behavior, and panel opening near the pet.
- Personalization stays curated: no pet shop, full theme editor, semantic personality analysis, or heavy settings surface.

Reference docs:
- `docs/design/t-007-pet-growth-interaction-system.md`
- `docs/product-spec.md`
- `docs/qa-checklist.md`
- `docs/agents/board.md`

Open implementation questions:
- None yet. This is a design-ready reference, not an instruction to interrupt current T-006 work unless CEO / user assigns T-007 next.

Outcome:
Design reference sent directly to Product Developer thread `019f25f8-12e4-70e0-adac-6ae70c1b7aaf`.

## 2026-07-03 19:37 CST - T-008 Design To Development Handoff

DESIGN -> DEVELOPMENT
Product: 今天明天
Task ID: T-008
From: Product Designer / `019f2224-1f3c-7a50-8923-f43becf03219`
To: Product Developer / `019f25f8-12e4-70e0-adac-6ae70c1b7aaf`
Subject: Frontend smoothness and progressive interaction polish

Design intent:
Make the current T-006 / T-007 frontend experience feel smooth, calm, and user-led. The main panel should feel like a lightweight desktop planning note first; pet abilities and settings should feel available but not exposed as a control dashboard.

Required behavior:
- Native panel internal interactions must not collapse the panel: quick-add input, typing, radio/select controls, task rows, settings, `接住明天`, `下班整理`, and `回到屏幕内`.
- Panel opens with quick-add focused after the panel is visible; first typed character must be accepted.
- Add task clears input and returns focus to quick-add.
- Default panel hides most ability/desktop settings behind a compact settings control.
- Default companion strip becomes message/status first, not a row of ability toggles.
- Task row idle state shows completion circle and title; `陪做` and move actions reveal on hover/focus or compact row action surface.
- `陪做中` remains visible when active.
- `接住明天` master toggle lives in settings; the visible magic is the timely evening suggestion with `接住明天` / `先留在今天`.
- Panel open/close has a short, calm pet-anchored transition and respects reduced motion.
- Pet self-emission is polished to reduce ring-like outer edge perception.

Acceptance criteria:
- QA checklist section `9. T-008 前端丝滑度验收项` passes.
- `docs/design/t-008-frontend-smoothness-polish.md` section 15 acceptance criteria pass.
- Existing T-006 one-screen layout and T-007 abilities remain intact.
- No projects, tags, priorities, dashboards, AI task analysis, full settings page, or new growth mechanics are introduced.

Open implementation questions:
- Please confirm whether native panel hide behavior can reliably distinguish internal panel focus / pointer interactions from true external blur. If the Tauri window API makes this hard, propose the safest fallback.
- Please confirm the lightest implementation for compact settings: popover, details panel, or inline expanding footer.
- Please confirm how row actions should behave on non-hover environments if relevant for the desktop target.

Allowed negotiation:
- Product Developer may keep theme and glow visible in the footer if they remain visually light.
- Product Developer may choose a compact menu instead of hover-only row actions if keyboard accessibility and discoverability are better.
- Product Developer may implement pet-panel transition with CSS opacity/scale only if native window positioning limits richer spatial motion.

Please respond with feasibility, implementation plan, risks, and any product questions.

## 2026-07-03 18:19 CST - Product Developer -> QA Verifier

DEVELOPMENT -> QA
Product: 今天明天
Task ID: T-006
From: Product Developer / `019f25f8-12e4-70e0-adac-6ae70c1b7aaf`
To: QA Verifier / `019f2614-56f8-7d40-af98-c1623e892eed`
Subject: Ready for T-006 verification

Implemented:
- Refactored the main task panel into a compact one-screen surface targeting the accepted native `560x600` panel size.
- Added fixed panel regions: top status strip, one-row quick add, Today focus / `明天接住` planning body, evening review/action strip, and compact footer controls.
- Made Today visually stronger through accent/elevation/header treatment and made Tomorrow read as a softer receiving shelf.
- Kept quick add one-row and restored input focus after submit.
- Capped visible open tasks at 5 per bucket and added compact overflow rows beyond that count.
- Added five stable theme IDs: `warmGlow`, `mintFocus`, `lavenderCalm`, `blueNight`, and `peachRest`.
- Added three glow intensity IDs: `low`, `soft`, and `bright`, with default `soft`.
- Persisted theme/glow through `settings.petThemeId` and `settings.glowIntensity`, with normalization fallback to `warmGlow` and `soft` for missing/invalid saved data.
- Applied theme/glow to pet body color/self-emission tint, panel accent bloom, selected controls, checkbox done state, and small decoration without changing task behavior.
- Adjusted collapsed pet to be a self-emissive dimensional sphere: layered radial gradients, top-left highlight, lower-right inner shade, face depth, body brightness, subtle body spill light, and elliptical floor shadow.
- Removed the separate pet aura / halo / edge-bloom DOM layer after Designer clarified that glow must originate from the pet body itself.
- Added reduced-motion support so continuous pet breathing is minimized while static glow/brightness remains.
- Added compact footer `回到屏幕内` action wired to the existing native recenter command; app/tray recovery entry remains available.
- Acknowledged T-007 as future reference only; no T-007 behavior was implemented in T-006.

Changed files:
- `src/features/settings/settings-types.ts`
- `src/features/settings/default-settings.ts`
- `src/features/settings/settings-store.ts`
- `src/features/settings/settings-store.test.ts`
- `src/features/settings/theme-options.ts`
- `src/app/app-storage.ts`
- `src/app/app-model.ts`
- `src/app/app-model.test.ts`
- `src/app/views/panel-view.tsx`
- `src/app/views/pet-view.tsx`
- `src/features/tasks/components/task-panel.tsx`
- `src/features/tasks/components/task-column.tsx`
- `src/features/tasks/components/quick-add.tsx`
- `src/features/pet/components/glow-pet.tsx`
- `src/shared/styles/base.css`
- `src-tauri/tauri.conf.json`
- `docs/agents/board.md`
- `docs/agents/messages.md`
- `docs/agents/handoffs.md`

Verification already run:
- `pnpm check` passed: lint, typecheck, and Vitest all green; 8 files, 27 tests.
- `pnpm build` passed.
- Playwright visual smoke passed at `560x600`; results written to `output/playwright/t006-visual-smoke-result.json`.
- Screenshots:
  - `output/playwright/t006-panel-empty.png`
  - `output/playwright/t006-panel-light.png`
  - `output/playwright/t006-panel-blue-bright.png`
  - `output/playwright/t006-pet-blue-bright.png`
- Empty panel smoke: `.task-panel` clientHeight/scrollHeight `590/590`; body clientHeight/scrollHeight `600/600`; required regions all present.
- Light-task smoke: 5 open tasks in Today and 5 in Tomorrow; `.task-panel` clientHeight/scrollHeight `590/590`; Today column `303/303`; Tomorrow column `303/303`; no overflow rows; Tomorrow title is `明天接住`.
- Overflow smoke: 6 open tasks in each bucket produces compact rows `还有 1 件，先放在后面` and `明天还放着 1 件`; Today and Tomorrow columns remain `303/303`.
- Theme/glow persistence smoke: selecting `blueNight` + `bright` persisted to localStorage and survived reload.
- Pet visual smoke: no `.pet-shell-aura` or `.pet-edge-bloom` element exists; `.pet-shell-body` carries brightness and body box-shadow emission.
- Reduced-motion smoke: with reduced motion enabled, the pet body animation duration is `0.001s` and static brightness remains.
- `npx -y pnpm@11.7.0 tauri:build` passed and generated `src-tauri/target/release/bundle/macos/今天明天.app`.
- `codesign --verify --deep --strict --verbose=2 src-tauri/target/release/bundle/macos/今天明天.app` passed.
- `export PATH="/opt/homebrew/opt/rustup/bin:$HOME/.cargo/bin:$PATH"; npx -y pnpm@11.7.0 exec tauri info` reached environment reporting with Rust/Cargo/rustup installed; full Xcode still missing.

Acceptance criteria to verify:
- QA checklist section `7. T-006 主面板与宠物视觉验收项`.
- `docs/design/t-006-main-panel-pet-visual-system.md` section 14 acceptance criteria.
- Empty/default and light-task states show no visible internal scrollbar.
- Today is visually stronger than Tomorrow, and Tomorrow reads as `明天接住` shelf.
- Quick add remains low-friction and focused after adding tasks.
- Theme and glow controls persist after native app restart.
- Glow intensity affects pet body brightness/self-emission and panel accent bloom.
- Collapsed pet reads as a dimensional self-emissive sphere, not as an external halo/ring/aura.
- Keyboard focus remains visible without exposing a square pet tile.
- Footer/app-tray recovery can return pet to the visible screen.
- Normal add/move/complete/review task behavior remains unchanged and no projects/tags/priorities/dashboard density were introduced.

Known risks:
- Browser screenshots prove layout and DOM/CSS behavior, but QA should still visually inspect native transparent-window compositing in the signed `.app`.
- Full Xcode is still missing, so Apple notarization, Developer ID signing, and formal distribution are not verified.
- T-007 was acknowledged only; it is not part of this verification request.

Please verify and return `QA RESULT`.
