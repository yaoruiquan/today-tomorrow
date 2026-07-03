# Agent Manifest

Product: 今天明天
Workspace: `/Users/yao/Documents/今天明天`
Orchestrator Thread: `019f2610-4504-7c70-a6d8-0d0832887ad7`
Last Updated: 2026-07-03 16:22 CST

| Role | Thread Title | Thread ID | Status | Scope | Environment | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| CEO / Product Owner | CEO | `019f2610-4504-7c70-a6d8-0d0832887ad7` | active | user conversation, product intent, priorities, final acceptance | local | Talks with the user, clarifies product direction, and decides scope or priority conflicts. |
| Product Designer | 产品设计 | `019f2224-1f3c-7a50-8923-f43becf03219` | active on T-006 | product spec, UX flows, copy, non-goals, acceptance criteria | local | Owns T-006 main panel and pet visual system redesign; collaborates directly with Product Developer on feasibility and implementation-ready design. |
| Product Developer | 产品开发 | `019f25f8-12e4-70e0-adac-6ae70c1b7aaf` | idle | implementation, refactoring, focused verification | local | Collaborates directly with Product Designer and QA Verifier inside assigned scope. |
| QA Verifier | 产品测试验收 | `019f2614-56f8-7d40-af98-c1623e892eed` | idle | acceptance checks, tests, regression review, QA reports | local | Product-chain protocol acknowledged; collaborates directly with Product Developer on verification, failures, fixes, and rechecks. |

## Operating Rule

The project uses a product-chain collaboration model: User <-> CEO <-> Product Designer <-> Product Developer <-> QA Verifier. Adjacent roles may interact directly. CEO owns user intent, priorities, scope decisions, and final acceptance.
