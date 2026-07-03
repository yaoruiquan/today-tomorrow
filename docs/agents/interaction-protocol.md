# Agent Interaction Protocol

This file defines how the 今天明天 product agents communicate across Codex conversations.

## Communication Model

Use a product-chain model:

```text
User <-> CEO / Product Owner <-> Product Designer <-> Product Developer <-> QA Verifier
```

The CEO is not a message switchboard. The CEO mainly talks with the user, shapes product intent, sets priority, accepts scope changes, and makes final product decisions.

Adjacent roles are expected to interact directly when that makes the work better:

- Product Designer and Product Developer discuss feasibility, UX details, missing states, implementation tradeoffs, and design clarifications.
- Product Developer and QA Verifier discuss test evidence, reproduction steps, failed cases, and fix verification.
- CEO joins when user intent, priority, scope, product direction, or cross-role conflict needs a decision.

## Responsibility Boundaries

| Role | Owns | Does Not Own |
| --- | --- | --- |
| CEO / Product Owner | User conversation, product intent, priorities, scope decisions, final acceptance | Every implementation detail or every cross-agent message |
| Product Designer | User experience, product spec, flows, copy, acceptance criteria | Production code ownership |
| Product Developer | Implementation, technical plan, code changes, developer verification | Final product direction or final QA verdict |
| QA Verifier | Acceptance checks, reproduction evidence, pass/fail/partial verdicts | Product scope changes or default implementation fixes |

## Interaction Routes

| Route | Normal Use | Direct? | Must Log? |
| --- | --- | --- | --- |
| User <-> CEO | Ideas, scope, priorities, acceptance | yes | Important decisions in `decisions.md` |
| CEO -> Product Designer | Turn user intent into product design work | yes | Task in `board.md` |
| Product Designer <-> Product Developer | Clarify behavior, UX states, data needs, feasibility | yes | Log when it changes requirements, scope, or implementation plan |
| Product Developer <-> QA Verifier | Ready-for-test handoff, failures, repro steps, fix confirmation | yes | Log QA verdicts and fix handoffs |
| Product Designer -> CEO | Product tradeoff or user-facing ambiguity | yes | Log decisions or blocker |
| Product Developer -> CEO | Scope expansion, risky tech choice, blocked implementation | yes | Log blocker or decision |
| QA Verifier -> CEO | Product-level failure, acceptance ambiguity, release risk | yes | Log verdict and decision need |

Non-adjacent direct work is discouraged. For example, Product Designer should not assign QA work directly, and QA should not change product scope directly.

## State Files

| File | Purpose | Primary Writer |
| --- | --- | --- |
| `manifest.md` | Current agents, thread ids, roles, status, scope | CEO |
| `board.md` | Work items, owners, status, dependencies, done criteria | CEO, with role updates when assigned |
| `messages.md` | Important cross-agent messages, ACKs, direct collaboration summaries | Any role involved, CEO keeps it tidy |
| `handoffs.md` | Design-to-dev, dev-to-QA, QA-to-dev, and role-to-CEO handoffs | Sending role |
| `decisions.md` | Accepted product, architecture, scope, and workflow decisions | CEO, Designer, or Architect when assigned |

Thread messages are the working conversation. Shared files are the project memory.

## Task Lifecycle

```text
todo -> doing -> ready-for-dev -> implementing -> ready-for-qa -> verifying -> done
              `-> blocked
              `-> deferred
```

Rules:

- `todo`: task exists but is not active.
- `doing`: product/design work is active.
- `ready-for-dev`: Product Designer has handed the task to Product Developer.
- `implementing`: Product Developer owns the code work.
- `ready-for-qa`: Product Developer has handed the task to QA Verifier.
- `verifying`: QA Verifier is checking the work.
- `done`: acceptance criteria and verification evidence are recorded.
- `blocked`: work needs clarification or a decision.
- `deferred`: intentionally postponed with rationale.

CEO usually marks final `done` or `deferred`, but QA may mark a QA subtask as `pass` in its result. The CEO then closes the product task.

## Message IDs

Use stable ids:

- Tasks: `T-001`, `T-002`, `T-003`
- Messages: `M-YYYYMMDD-HHMM-<from>-<topic>`
- Decisions: `D-001`, `D-002`, `D-003`
- Handoffs: use the task id plus timestamp heading

## CEO To Design Assignment

Use this when the CEO turns user intent into design work:

```md
PRODUCT DESIGN ASSIGNMENT
Product: 今天明天
Task ID: T-###
Owner: Product Designer
Priority: <P0|P1|P2>

User intent:
<what the user wants and why>

Context to read:
- docs/product-spec.md
- docs/development-guide.md
- docs/agents/manifest.md
- docs/agents/interaction-protocol.md
- docs/agents/board.md

Objective:
<product/design outcome>

Design output expected:
- <spec section, flow, copy, acceptance criteria, open questions>

Interaction expected:
- Talk directly with Product Developer if implementation feasibility or missing states matter.

Done criteria:
- Product Developer can implement without guessing, or blockers are escalated to CEO.
```

## Design To Developer Message

Use this when Product Designer hands work or a question to Product Developer:

```md
DESIGN -> DEVELOPMENT
Product: 今天明天
Task ID: T-###
From: Product Designer / <thread id>
To: Product Developer / <thread id>
Subject: <short topic>

Design intent:
<what experience should feel like>

Required behavior:
- <observable behavior>

Acceptance criteria:
- <what must be true when implementation is complete>

Open implementation questions:
- <questions for developer, or "none">

Allowed negotiation:
- Product Developer may propose simpler implementation if the product feeling is preserved.

Please respond with feasibility, implementation plan, risks, and any product questions.
```

## Developer To Designer Response

Use this when Product Developer answers Product Designer before or during implementation:

```md
DEVELOPMENT -> DESIGN
Product: 今天明天
Task ID: T-###
From: Product Developer / <thread id>
To: Product Designer / <thread id>
Subject: <short topic>

Feasibility:
<yes|partial|blocked>

Implementation plan:
- <planned code/modules>

Tradeoffs:
- <what changes or constraints affect the design>

Questions:
- <questions needing design answer, or "none">

Decision needed from CEO:
- <yes/no and why>
```

## Developer To QA Handoff

Use this when Product Developer finishes a verifiable slice:

```md
DEVELOPMENT -> QA
Product: 今天明天
Task ID: T-###
From: Product Developer / <thread id>
To: QA Verifier / <thread id>
Subject: Ready for verification

Implemented:
- <what changed>

Changed files:
- <path>

Verification already run:
- <command or check>

Acceptance criteria to verify:
- <criterion>

Known risks:
- <risk or "none">

Please verify and return `QA RESULT`.
```

## QA To Developer Result

Use this when QA reports directly back to Product Developer:

```md
QA RESULT
Product: 今天明天
Task ID: T-###
From: QA Verifier / <thread id>
To: Product Developer / <thread id>
Verdict: pass|fail|partial|blocked

Evidence:
- <commands, screenshots, files, or observations>

Findings:
- <finding, severity, reproduction steps>

Fix request:
- <specific fix needed, or "none">

CEO decision needed:
- <yes/no and why>
```

If the verdict is `fail` or `partial`, Product Developer may fix within the original write scope and send a new `DEVELOPMENT -> QA` handoff. If the fix requires product direction or wider scope, escalate to CEO.

## Role Status Formats

### Product Designer

```md
DESIGN UPDATE
Role: Product Designer
Thread ID:
Task ID:
Status: done|blocked|needs-dev-input|in-progress
Summary:
Files changed:
Developer interaction:
Decisions:
Requests for CEO:
Risks:
```

### Product Developer

```md
DEV UPDATE
Role: Product Developer
Thread ID:
Task ID:
Status: implementing|ready-for-qa|blocked|fixed|done
Summary:
Files changed:
Designer interaction:
QA interaction:
Verification:
Requests for CEO:
Risks:
```

### QA Verifier

```md
QA RESULT
Role: QA Verifier
Thread ID:
Task ID:
Verdict: pass|fail|blocked|partial
Evidence:
Findings:
Developer interaction:
Regression risk:
CEO decision needed:
```

## Collaboration Loops

### Product Idea To Build

1. User discusses idea with CEO.
2. CEO captures intent, constraints, priority, and non-goals.
3. CEO assigns Product Designer.
4. Product Designer creates or updates design/spec.
5. Product Designer talks directly with Product Developer for feasibility and missing states.
6. Product Designer hands implementation-ready work to Product Developer.

### Design And Development

1. Product Designer sends `DESIGN -> DEVELOPMENT`.
2. Product Developer responds with `DEVELOPMENT -> DESIGN` when feasibility or tradeoffs matter.
3. Product Designer resolves product details, or escalates to CEO if user intent is involved.
4. Product Developer implements once design and scope are clear enough.

### Development And QA

1. Product Developer sends `DEVELOPMENT -> QA`.
2. QA Verifier checks acceptance criteria and returns `QA RESULT`.
3. If pass, Product Developer and QA record the result; CEO can close the task.
4. If fail or partial, Product Developer fixes within scope and re-hands to QA.
5. If QA finds a product-level ambiguity, QA escalates to CEO.

## Logging Rules

Log only high-signal collaboration:

- Requirement changes.
- Accepted tradeoffs.
- Ready-for-dev handoffs.
- Ready-for-QA handoffs.
- QA pass/fail/partial results.
- Scope changes.
- CEO decisions.

Do not log every minor back-and-forth if it does not affect future work.

## Conflict Rules

- CEO owns user intent, product priority, and final acceptance.
- Product Designer owns product meaning and acceptance criteria.
- Product Developer owns implementation choices inside assigned scope.
- QA Verifier owns verification evidence and pass/fail/partial verdicts.
- Adjacent roles should negotiate directly first.
- Escalate to CEO only when negotiation changes product intent, scope, priority, or release risk.

If two roles need to edit the same file, coordinate through `board.md` and sequence the work.

## Completion Check

Before the CEO reports a multi-agent task complete:

- `board.md` shows the product task as `done` or `deferred`.
- Design-to-dev handoff exists when design work shaped implementation.
- Dev-to-QA handoff and QA result exist for code-changing work.
- Important direct collaboration is summarized in `messages.md` or `handoffs.md`.
- Decisions are recorded when user intent, scope, architecture, or workflow changed.
- Verification evidence is present, or the verification gap is explicit.

