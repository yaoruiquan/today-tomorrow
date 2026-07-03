# Decisions

## D-001 - Use CEO-Mediated Agent Communication

Date: 2026-07-03
Owner: CEO / Orchestrator
Status: superseded by D-003

Decision:
All cross-agent communication for 今天明天 goes through the CEO / Orchestrator thread and is recorded in shared state when it affects work ownership, product direction, verification, or handoff.

Rationale:
- Keeps task ownership visible.
- Prevents role threads from making conflicting product or implementation decisions.
- Preserves enough context for future sessions to resume work.

Rejected:
- Let role threads coordinate informally | Important decisions would remain hidden in separate conversations.
- Let every role edit every shared file freely | Increases conflict risk and makes final authority unclear.

Review Trigger:
- Revisit if the team grows beyond five persistent role threads or if direct role-to-role messaging becomes a supported first-class workflow.

## D-002 - Use Shared Markdown State Under `docs/agents`

Date: 2026-07-03
Owner: CEO / Orchestrator
Status: accepted

Decision:
The project stores agent roster, board, messages, handoffs, decisions, and interaction rules as Markdown files under `docs/agents/`.

Rationale:
- Works across Codex threads.
- Is easy for every role to read and update.
- Keeps coordination state versionable with the project.

Rejected:
- Store coordination only in Codex conversation history | Future agents may not see the relevant thread.
- Store coordination only in `.omx/state` | Useful for runtime state, but less visible as project documentation.

Review Trigger:
- Revisit if the coordination state becomes large enough to require generated summaries or automation scripts.

## D-003 - Use Product-Chain Collaboration Instead Of CEO Message Mediation

Date: 2026-07-03
Owner: CEO / Product Owner
Status: accepted

Decision:
The project uses product-chain collaboration: User <-> CEO <-> Product Designer <-> Product Developer <-> QA Verifier. CEO mainly works with the user on ideas, intent, priority, scope, and final acceptance. Product Designer and Product Developer interact directly for design feasibility and implementation details. Product Developer and QA Verifier interact directly for verification, bug reproduction, fixes, and rechecks.

Rationale:
- Product design and development need fast back-and-forth to turn intent into implementable behavior.
- Development and QA need direct evidence-based loops to fix and recheck issues efficiently.
- CEO should not become a bottleneck for every working message.
- Important decisions and handoffs remain durable through `docs/agents/`.

Rejected:
- Keep all cross-agent messages CEO-mediated | Too slow and blocks normal design/development and development/QA collaboration.
- Let every role talk to every other role without boundaries | Would blur ownership and make product decisions harder to trace.

Review Trigger:
- Revisit if direct adjacent-role collaboration causes conflicting edits, missing logs, or unclear final authority.

## D-004 - Accept Web MVP Behavior But Block Final Desktop Release

Date: 2026-07-03
Owner: CEO / Product Owner
Status: accepted

Decision:
For T-003, accept the Web MVP behavior as QA-passed, but do not grant final desktop release acceptance until dependency policy stabilization and native Tauri desktop verification are complete.

Rationale:
- QA verified the Web MVP flows and browser behavior with evidence.
- Clean pnpm commands currently fail under the active supply-chain policy due to five too-recent transitive versions in `pnpm-lock.yaml`.
- Native Tauri compile/runtime behavior cannot be accepted on this machine because Rust/Cargo/rustup and full Xcode are missing.

Rejected:
- Final-accept the desktop MVP now | Would hide unresolved release blockers and unverified native runtime behavior.
- Treat the Web MVP QA pass as a failure | The user-facing Web behavior passed; the remaining issues are release/environment blockers.

Review Trigger:
- Revisit after T-004 passes clean pnpm commands and T-005 returns native desktop QA evidence.
