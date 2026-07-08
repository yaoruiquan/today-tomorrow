# T-009 Catch Tomorrow Brand Experience And Growth System

Date: 2026-07-03
Owner: Product Designer
Status: design ready reference

## 1. Intent

`明天接住` should become the product's signature moment.

It is not only a task action. It is the emotional contract of 今天明天:

> 今天没有做完的事，不是失败。小光团会帮你轻轻接到明天。

T-009 defines the button, motion, copy, pet reaction, task movement feedback, and growth-system relationship for this brand moment. It also clarifies how the growth /养成 system should work without becoming a streak, score, or productivity game.

## 2. Positioning

Most task apps treat unfinished tasks as overdue, postponed, or unresolved. 今天明天 should treat them as being held.

The user should feel:

- `我没有被责备。`
- `今天可以收尾了。`
- `明天已经被安放好了。`
- `这个小光团越来越会接住我。`

## 3. Brand Action Model

The `明天接住` action has five parts:

1. Trigger: when the product detects unfinished today tasks in a review context.
2. Invitation: gentle copy asks whether the pet should help.
3. Catch action: user confirms.
4. Transfer motion: tasks visually move from Today into Tomorrow shelf.
5. Settle feedback: pet internal light settles and tomorrow shelf confirms receipt.

This should feel like handing something over, not clearing a backlog.

## 4. Button Design

### Primary Button

Label:

- `接住明天`

Use this exact phrase for the main action.

Button feeling:

- Warm, soft, confident.
- Primary but not loud.
- Should feel like `交给我吧`, not `处理任务`.

Visual:

- Rounded pill.
- Theme-accent fill or deep theme selected color.
- Small inner glow / light edge is acceptable.
- No warning color.
- No red / orange urgency treatment.

Optional icon:

- A small receiving hand / tray / crescent shape if available.
- Avoid arrows that imply mechanical move.
- Avoid clock / overdue icons.

### Secondary Button

Label options:

- `先留在今天`
- `我再看一下`

Recommended default:

- `先留在今天`

Secondary style:

- Quiet outline / ghost pill.
- Lower contrast than primary.

### Disabled / Not Relevant

Do not show a disabled `接住明天` button when there is nothing to catch. Use status copy instead:

- `今天已经很完整。`
- `明天还空着。`
- `没有需要接住的事。`

## 5. Entry Points

### Main Entry: Evening Strip

When today has unfinished tasks and review context is relevant:

```text
还有 2 件，我帮你接到明天？
[接住明天] [先留在今天]
```

This is the primary brand moment.

### Secondary Entry: Evening Review

In detailed review:

- Each unfinished task can have `接到明天`.
- Bulk action remains `接住明天`.
- Copy should remain gentle and not imply overdue.

### Settings Entry

Settings may include:

- `接住明天` toggle.

This is only a preference. It is not the brand moment.

Avoid making the settings toggle visually compete with the actual action.

## 6. Copy System

### Invitation Copy

Use:

- `还有 2 件，我帮你接到明天？`
- `这几件先让我替你放到明天。`
- `今天可以收一下，剩下的我接住。`
- `不用硬撑，我帮你放到明天。`

Avoid:

- `你还有 2 件未完成`
- `任务逾期`
- `延期处理`
- `未完成任务过多`
- `是否批量移动任务`

### Confirmation Copy

After action:

- `我接住了，明天还在。`
- `已经轻轻放到明天。`
- `明天会接着在这里。`
- `今天可以先收好了。`

### Dismiss Copy

When user chooses `先留在今天`:

- `好，我先不动它们。`
- `它们还留在今天。`
- `我在这里，等你再看。`

### Pet Message Copy

Pet can say:

- `这些我帮你抱到明天。`
- `明天会记得。`
- `今天先不用背着它们了。`

Keep messages short. They should not become large speech bubbles in collapsed mode by default.

## 7. Motion Design

### Motion Principles

- Slow enough to feel held.
- Fast enough not to block workflow.
- Light comes from the pet body.
- Task cards should not fly dramatically.
- Reduced motion must preserve meaning without movement.

### Default Motion Sequence

Target duration: 600-900ms total.

1. User clicks `接住明天`.
2. Primary button depresses subtly, not bounces.
3. Today open task rows selected for movement soften to 85-90% opacity.
4. A small light trace appears from Today column toward Tomorrow shelf.
5. Rows fade / compress out of Today.
6. Tomorrow shelf receives the tasks with a soft background glow.
7. Pet core brightens once from inside.
8. Pet light settles back to normal.
9. Confirmation copy appears in evening strip.

### Reduced Motion

Replace movement with:

- Today rows fade out.
- Tomorrow shelf softly highlights.
- Pet core brightness changes once.
- Confirmation copy appears.

No flying cards, scale travel, or path motion.

## 8. Pet Reaction

The pet reaction is the emotional center.

### Before Action

When suggestion is visible:

- Pet remains calm.
- If panel is open, a tiny internal light dot may gather at lower body.
- Do not make the pet look anxious.

### During Action

On `接住明天`:

- Pet core brightens from the center.
- Internal specks gather briefly, as if holding the tasks.
- Edge bloom can warm slightly but must remain self-emissive.
- No external halo / ring.
- No confetti.

### After Action

- Pet returns to a steadier, quieter breathing state.
- If all today tasks are cleared, pet can enter a soft evening / settled state.
- The body light may look more even for a few seconds.

### If User Dismisses

- Pet should not look disappointed.
- A small stable idle response is enough.

## 9. Task Movement Feedback

### Today Column

Before:

- Open tasks visible.
- Evening strip suggests catching.

During:

- Rows selected for catching visually soften.
- If moving all, group them as a soft batch.
- If moving individual task, only that row responds.

After:

- Today count updates immediately.
- Empty state becomes:
  - `今天先收好了。`
  - or existing calm empty copy.

### Tomorrow Shelf

During:

- Shelf background gently brightens.
- Header may show `接住 +2`.

After:

- New tasks appear at top or in a stable order that matches product logic.
- Tasks should not get `overdue`, `failed`, or `moved` badges.
- A tiny received indicator may appear briefly:
  - `已接住`
  - then fade.

### Persistence

After restart, moved tasks are just tomorrow tasks. Do not preserve shameful history.

## 10. Growth System Analysis

The growth system should be based on `relationship with time`, not `task completion performance`.

### What Should Grow

Three dimensions can grow:

1. Light maturity: pet body becomes more stable, layered, and self-emissive.
2. Catch ability: pet visually becomes better at receiving tomorrow.
3. Familiarity: copy and idle behavior feel more settled over time.

Do not grow:

- User rank.
- Productivity score.
- Completion percentage.
- Streak pressure.

### Growth Inputs

Use soft behavior signals:

| Signal | Meaning | Weight |
| --- | --- | --- |
| User writes today tasks | trusts the pet with today | low |
| User writes tomorrow tasks | prepares tomorrow | low |
| User uses `接住明天` | accepts the core product promise | high |
| User completes evening review | closes the day | medium |
| User returns after a gap | relationship resumes | low, never punitive |
| User uses co-do mode | lets pet accompany work | low |

`接住明天` should be the strongest growth signal because it is the unique brand action.

### Growth Pace

Growth should be slow and atmospheric.

Suggested pacing:

- Stage 1 -> 2: after first few successful uses.
- Stage 2 -> 3: after several days with today/tomorrow records.
- Stage 3 -> 4: after repeated `接住明天` / evening review use.
- Stage 4 -> 5: after long-term return behavior.

Do not show exact thresholds.

### Growth Feedback

Growth moments should be quiet:

- Pet body light becomes more even.
- Internal specks become slightly richer.
- Breathing feels calmer.
- Tomorrow shelf glow becomes a little more confident after catches.

Copy:

- `小光团好像更会接住明天了。`
- `它把这些天的光都记住了。`
- `明天被放好时，它会更安定一点。`

Avoid:

- `升级`
- `经验 +10`
- `连续 7 天`
- `成长失败`

## 11. Growth Stages Refined Around Catch Tomorrow

| Stage | Name | Catch Tomorrow Expression |
| --- | --- | --- |
| 1 | 光点 | Catch action only updates task location; pet gives a tiny core pulse. |
| 2 | 小光团 | Pet briefly gathers inner light when catching tomorrow. |
| 3 | 星尘光团 | Tasks caught to tomorrow appear as tiny internal specks before settling. |
| 4 | 光蕴 | Pet body light becomes fuller after repeated catches; tomorrow shelf glow feels warmer. |
| 5 | 日夜守望 | Evening catch feels like a known ritual; pet enters a calm guardian-like settled state. |

Stages should not add complexity to the task model. They change visual feeling and copy only.

## 12. Empty, Light, And Heavy Task Cases

### Empty Today

No catch prompt.

Copy:

- `今天已经很完整。`

Pet:

- Stable gentle light.

### Light Today, 1-3 Open Tasks

Prompt:

- `还有 2 件，我帮你接到明天？`

Motion:

- Individual rows can be perceived.

### Heavier Today, 4+ Open Tasks

Prompt:

- `还有 5 件，我帮你先接到明天？`

Motion:

- Group rows visually as a batch.
- Avoid long per-card animations.

Copy:

- Use `先` to reduce pressure.

## 13. Sound And Haptics

First pass:

- No sound by default.

Future optional:

- Very soft chime only if user enables sound.

Do not add sound as a required brand cue.

## 14. Data / State Considerations

Product-level state may need:

- Whether catch suggestion is visible.
- Whether suggestion was dismissed in current session.
- Count of tasks being caught.
- Growth signal that `接住明天` was used.
- Current growth stage.
- Optional last catch date, for pacing.

Do not store:

- Failure counts.
- Missed streaks.
- Shame labels.

## 15. QA Acceptance Criteria

Brand moment:

- `接住明天` appears as the primary action only when there are unfinished today tasks and review context is appropriate.
- Button copy uses `接住明天`.
- Secondary action uses soft copy such as `先留在今天`.
- No overdue / failure / shame language appears.

Motion:

- Confirming `接住明天` gives visible but gentle transition from Today to Tomorrow.
- Tomorrow shelf visibly receives tasks.
- Pet reacts through body self-emission, not external halo or confetti.
- Reduced motion preserves meaning without path movement.

Task data:

- Caught tasks become normal tomorrow tasks.
- No failure badge or overdue label remains after restart.
- Today and tomorrow counts update correctly.

Growth:

- `接住明天` contributes to growth signals more strongly than generic task completion.
- Growth is expressed through visual maturity / copy, not XP or score.
- Missing a day does not visibly punish the pet.

Copy:

- Confirmation copy feels like help / holding.
- Dismiss copy is neutral.
- Pet messages remain short and non-judgmental.

Boundaries:

- No projects, priorities, tags, streak pressure, productivity score, AI task analysis, or complex ritual screen is introduced.
