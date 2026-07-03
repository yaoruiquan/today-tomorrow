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
