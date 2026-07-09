# T-013 Growth Causality And Milestones

Date: 2026-07-08
Owner: Product Designer / Product Developer
Status: implementation in progress

## 1. Intent

The current growth system already has visible body stages:

- `seedLight`
- `smallGlow`
- `starCore`
- `holdingGlow`
- `dayNightCore`

It also already connects user behavior to growth memory. The missing product feeling is causality:

> 用户做了一件事，小光团为什么有反应、为什么长大，需要更清楚。

T-013 keeps the existing visual stage system, but improves the growth loop:

1. Growth reactions are driven by explicit growth events, not by parsing pet message copy.
2. Stage changes trigger a short milestone message.
3. `接住明天` remains the strongest growth signal and strongest pet body reaction.

## 2. Current Problem

The existing implementation infers pet reaction from `pet.lastMessage` text:

- message contains `接住` -> catch reaction
- message contains `完成` -> complete reaction
- message contains `放进` -> record reaction

This is fragile. Copy changes should not break visual behavior.

The existing implementation also updates growth stage silently. The body changes, but the user may not understand that their action caused the growth.

## 3. Design Decision

Add an explicit transient growth event.

Suggested model:

```ts
type GrowthEventType =
  | "recordToday"
  | "recordTomorrow"
  | "completeTask"
  | "catchTomorrow"
  | "eveningReview"
  | "coDo";

interface GrowthEvent {
  id: string;
  type: GrowthEventType;
  at: string;
  stageBefore: GrowthStage;
  stageAfter: GrowthStage;
  stageChanged: boolean;
}
```

The event is a UI signal, not a score. It may live under `pet.lastGrowthEvent` and should not be restored after app relaunch.

## 4. Event Mapping

| User action | Growth event | Pet reaction |
| --- | --- | --- |
| Add today task | `recordToday` | small core pulse |
| Add tomorrow task | `recordTomorrow` | lower-body / tomorrow pulse |
| Complete task | `completeTask` | internal speck brightens |
| Confirm `接住明天` | `catchTomorrow` | strongest holding-layer reaction |
| Complete evening review | `eveningReview` | steady body pulse |
| Start co-do | `coDo` | calmer face / posture |

Do not use copy text to infer the event.

## 5. Milestone Copy

When `stageChanged = true`, the pet message should use a milestone line instead of only the normal action copy.

Recommended copy:

| New stage | Copy |
| --- | --- |
| `smallGlow` | `小光团好像长大了一点。` |
| `starCore` | `身体里多了一点星尘光。` |
| `holdingGlow` | `它更会接住明天了。` |
| `dayNightCore` | `它把这些天的光都记住了。` |

Keep milestone copy short. Do not show level names, XP, streaks, or percentages.

## 6. Product Rules

- Stage growth stays visual and quiet.
- Missing a day never causes regression, sickness, or punishment.
- Event feedback can be immediate even if the stage does not change.
- Stage change feedback should be rare and memorable.
- `接住明天` should remain the strongest growth event.

## 7. Future Direction: Four Visual Growth Channels

Do not implement the full channel split in T-013 unless it is very cheap. Keep this as future product direction:

| Channel | Fed by | Visual expression |
| --- | --- | --- |
| Body fullness | Recording today / tomorrow | body size and softness |
| Star memory | Completing tasks | internal specks |
| Holding ability | `接住明天` | lower holding layer |
| Day-night steadiness | Evening review / returning use | day-night internal light |

This future model can make growth more legible without adding scores.

## 8. Implementation Scope

T-013 first pass should implement:

- `GrowthEvent` type.
- `pet.lastGrowthEvent` transient state.
- Growth helper that compares stage before / after.
- Explicit event assignment in task add, task complete, catch tomorrow, evening review, and co-do.
- Pet reaction mapping from event type.
- Stage-change milestone copy.
- App data normalization that clears old transient `lastGrowthEvent` on load.
- Tests for event creation, stage-change milestone copy, and legacy stage normalization remaining intact.

Out of scope:

- Rebalancing all thresholds.
- Adding XP / progress UI.
- Adding a full growth history view.
- Adding decay / punishment.
- Implementing the four-channel model as separate persisted counters.

## 9. Acceptance Criteria

- Pet reaction no longer depends on parsing `lastMessage`.
- Adding a task creates a record growth event.
- Completing a task creates a complete growth event.
- Confirming `接住明天` creates a catch growth event and still increases `tomorrowCatchCount`.
- Stage changes produce short milestone copy.
- `lastGrowthEvent` is not restored after relaunch.
- Existing visible growth stages and theme/glow behavior remain unchanged.
