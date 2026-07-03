# Agent Board

| ID | Task | Owner | Status | Depends On | Write Scope | Done Criteria |
| --- | --- | --- | --- | --- | --- | --- |
| T-001 | Define cross-agent interaction protocol | CEO / Orchestrator | done | none | `docs/agents/` | Roles, routes, message formats, state files, review loop, and conflict rules are documented. |
| T-002 | Revise collaboration model to direct adjacent-role interaction | CEO / Product Owner | done | T-001 | `docs/agents/`, product-agent-orchestrator skill | CEO is product-facing; Design/Dev and Dev/QA direct interaction protocols are documented. |
| T-003 | Implement 今天明天 MVP desktop pet app | Product Developer | review | T-002 | `src/`, `src-tauri/`, `docs/`, root project config | Web MVP behavior passed QA, dependency policy stabilization passed under T-004, and Product Developer handed signed native `.app` build evidence to QA under T-005. |
| T-004 | Stabilize pnpm dependency resolution under supply-chain policy | Product Developer | done | T-003 | `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, related docs | QA passed: clean `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm build`, and `pnpm exec tauri info` reach project/environment checks under active policy. |
| T-005 | Verify native Tauri desktop compile and runtime | QA Verifier | review | T-004, Rust/Cargo/rustup | `src-tauri/tauri.conf.json`, `docs/agents/`, `docs/qa-checklist.md` | `pnpm tauri:build` produces a signed macOS `.app`, native smoke evidence is recorded, and QA returns a native desktop `QA RESULT`. |

Status values: `todo`, `doing`, `blocked`, `review`, `done`, `deferred`.
