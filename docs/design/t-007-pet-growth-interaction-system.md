# T-007 Pet Growth And Desktop Interaction System

Date: 2026-07-03
Owner: Product Designer
Status: design ready

## 1. Intent

T-007 turns the small glow pet from a passive launcher into a light养成 companion.

The goal is not to make a game, a dashboard, or an AI task analyst. The goal is to make the pet feel more alive through user-controlled growth, gentle desktop interaction, a few useful abilities, desktop placement behavior, and restrained personalization.

Core product feeling:

> 它不是催你做事的工具，而是帮你把今天托住、把明天接住的小生命。

## 2. Accepted Scope

User selected these directions:

- 4. Growth system.
- 5. Pet abilities.
- 6. Desktop space.
- 7. Personalization.

User explicitly does not want these directions for this pass:

- 1. Additional pet status system.
- 2. Daily ritual system.
- 3. Content-semantic linkage between task text and pet personality.

This means T-007 should not introduce AI/NLP classification of task content, task-category moods, morning/evening ritual flows beyond the existing product, or many new pet states.

## 3. Design Principles

- Growth comes from stable use, not productivity pressure.
- The pet should never shame the user for unfinished tasks.
- User choices should be reversible and understandable.
- Pet behavior should be ambient first, explicit only when the user asks.
- Desktop interactions must not steal focus or interrupt work.
- Personalization should be curated, not a shop or theme editor.

## 4. Growth System

Growth is expressed as light quality, not level numbers.

### Growth Inputs

Growth can respond to simple usage signals:

- User records today tasks.
- User records tomorrow tasks.
- User uses `接住明天`.
- User completes or moves tasks without needing all tasks done.
- User uses `陪做模式`.
- User keeps the pet on desktop over time.

Do not use:

- Completion rate as a public score.
- Streak failure penalties.
- Task count competition.
- Semantic analysis of task text.

### Growth Stages

| Stage | Name | Feeling | Visual Change |
| --- | --- | --- | --- |
| 1 | 光点 | just arrived | small self-emissive point, minimal face |
| 2 | 小光团 | familiar companion | stable breathing, subtle face depth |
| 3 | 星尘光团 | starts carrying time | tiny internal light specks appear inside the body |
| 4 | 光蕴 | habit is forming | core light becomes fuller, edge bloom more mature |
| 5 | 日夜守望 | long-term desktop companion | day/night light tone variation, calmer sleep-like idle |

Growth should be shown only as visual maturity. No XP bar is required.

### Growth Copy

Use soft milestone language:

- `小光团好像更稳了一点。`
- `它把这些天的光都记住了。`
- `它越来越会接住你的明天了。`

Avoid:

- `升级成功`
- `连续打卡`
- `效率提升`
- `未完成导致成长失败`

## 5. Pet Abilities

T-007 introduces five pet abilities:

1. 接住明天
2. Hover interaction
3. 轻声提醒
4. 安静模式
5. 陪做模式

### 5.1 接住明天

`接住明天` is a user-controlled ability that helps move unfinished today tasks into tomorrow without making the user feel they failed.

Setting:

- Name: `接住明天`
- Control: toggle
- Default: on for new users, but never silently moves tasks without confirmation.
- Location: compact settings/footer control or pet settings panel.

Behavior:

- When enabled, evening review or task cleanup can show a soft suggestion: `还有 2 件，我帮你接到明天？`
- User can confirm with `接住明天`.
- User can dismiss with `先留在今天`.
- Moved tasks should appear in tomorrow shelf with normal task styling, not a failure badge.

Pet response:

- On confirm, the pet's internal light briefly gathers near the lower body, then settles.
- The animation reads as the pet holding the task gently, not celebrating productivity.

Design constraints:

- No silent bulk move.
- No overdue shame copy.
- No automatic rescheduling rules UI.

### 5.2 Hover Interaction

Hovering over the collapsed pet without clicking should create a tiny sense of life.

Behavior:

- Immediate hover: body highlight subtly follows cursor by 1-2px.
- After about 300ms: pet brightens slightly from the core.
- After about 700ms: face or internal light reacts gently.
- Click still opens the panel.
- Drag behavior should remain reliable and take priority over hover animation.

Reduced motion:

- Disable highlight movement.
- Keep only static brightness change.

Do not:

- Show large text bubbles on every hover.
- Trigger reminders just because the cursor passes over the pet.
- Steal focus from the active app.

### 5.3 轻声提醒

`轻声提醒` is ambient visual prompting, not notification spam.

Setting:

- Name: `轻声提醒`
- Control: toggle
- Default: on
- Optional intensity: `低` / `标准`

Reminder forms:

- Pet core gently pulses once.
- Edge bloom becomes slightly warmer for a few seconds.
- If the panel is open, a quiet inline hint can appear in the relevant strip.

Reminder triggers:

- Today list is empty after the user's normal start window.
- There are unfinished today tasks near the user's chosen end-of-day window.
- `陪做模式` has been idle for a long period.
- `接住明天` is enabled and unfinished tasks are ready to be reviewed.

Frequency cap:

- No more than one ambient reminder per hour.
- No reminders in `安静模式`.
- No reminders when macOS focus / do-not-disturb integration exists and says not to interrupt.

Do not:

- Use system notifications in the first pass unless explicitly enabled later.
- Use alarming red colors.
- Show overdue language.

### 5.4 安静模式

`安静模式` makes the pet almost silent while preserving presence.

Entry points:

- Compact setting in panel footer.
- Pet context/control menu if available.
- Optional quick action from the pet.

Durations:

- `1 小时`
- `到明天`
- `一直开启`

Behavior:

- Pet remains visible as a minimal self-emissive body.
- No ambient reminders.
- Hover interaction is reduced to a small brightness response.
- Particles and playful reactions are hidden or minimized.
- Panel remains fully usable.

Exit:

- User can manually turn it off.
- Time-limited quiet mode expires quietly.

Do not:

- Hide the pet completely by default.
- Block task entry.
- Treat quiet mode as a failure state.

### 5.5 陪做模式

`陪做模式` lets the user choose one task and let the pet quietly accompany it.

Entry points:

- Task row action: `陪做`
- Optional panel action when a task is selected.

Rules:

- Only one task can be in `陪做模式` at a time.
- Starting a new co-do task ends the previous one.
- Completing the task ends co-do mode automatically.
- User can stop co-do mode without completing the task.

Pet behavior:

- Pet core light becomes steadier and less playful.
- The pet does not bounce or demand attention.
- Hover may show a very small indication that it is accompanying the task.

Panel behavior:

- The active task gets a quiet chip: `陪做中`.
- The chip is not a priority label and should not imply urgency.

Optional check-in:

- After a long period, the pet can gently pulse once.
- Copy, if shown: `还陪你在这件事上。`

Do not:

- Add Pomodoro as a required mechanic.
- Add productivity reports.
- Add focus scoring.

## 6. Desktop Space

The pet should feel like it lives on the desktop, not like a normal app window.

### Placement

User can choose:

- Bottom right
- Bottom left
- Top right
- Top left
- Last dragged position

Default:

- Bottom right, inside the current visible screen.

Required utilities:

- `回到屏幕内`
- Remember last position.
- Keep the pet inside visible monitor bounds after display changes.

### Edge Behavior

- Pet may gently snap near screen edges.
- Snapping should feel soft, not like a docked utility panel.
- Panel opens near the pet while staying inside the current monitor.

### Panel Relationship

- Collapsed pet is the anchor.
- Panel should feel like it unfolds from the pet's desktop location.
- If near an edge, panel may flip direction to remain visible.

### Multi-Display

- If the pet is lost on another display, `回到屏幕内` brings it to the active/current screen.
- A future setting may choose `跟随当前屏幕`, but first pass can rely on manual recovery.

## 7. Personalization

Personalization should let users tune comfort, not decorate endlessly.

### First-Pass Settings

| Setting | Control | Default | Notes |
| --- | --- | --- | --- |
| Pet theme | swatches or compact menu | warmGlow | inherited from T-006 |
| Glow intensity | segmented control | soft | inherited from T-006 |
| 接住明天 | toggle | on | confirmation required before moving tasks |
| 轻声提醒 | toggle | on | respects quiet mode |
| Hover interaction | toggle | on | reduced motion can simplify it |
| 安静模式 | duration picker | off | 1 hour / until tomorrow / always |
| Desktop position | menu | bottom right / last position | includes `回到屏幕内` |
| 陪做 check-in | toggle | on | no mandatory timer |

### Personalization Limits

Do not add:

- Pet shop.
- Unlockable cosmetics market.
- Full theme editor.
- Sound packs.
- Complex animation packs.
- Personality quiz.

### Settings Copy

Use human copy:

- `接住明天`
- `轻声提醒`
- `安静一会儿`
- `陪我做这件`
- `回到屏幕内`

Avoid technical copy:

- `auto rollover`
- `notification frequency`
- `interaction intensity algorithm`

## 8. State List

Product-level states Product Developer should account for:

- Pet idle, panel closed.
- Pet hover, panel closed.
- Pet dragging.
- Pet focus-visible.
- Panel open.
- Quiet mode active.
- Gentle reminder eligible.
- Gentle reminder suppressed by quiet mode.
- One task in co-do mode.
- Co-do task completed.
- `接住明天` enabled with unfinished today tasks.
- `接住明天` disabled with unfinished today tasks.
- Pet position inside current display.
- Pet position recovered with `回到屏幕内`.

## 9. Out Of Scope

T-007 does not include:

- AI task classification.
- Pet personality based on task text.
- New morning/evening ritual flows.
- More pet emotional states beyond current simple feedback.
- Pomodoro timer as a core mechanic.
- Calendar integration.
- System notifications by default.
- Completion score, streak pressure, or productivity dashboard.
- Complex animation or 3D engine work.

## 10. Acceptance Criteria

Growth:

- Growth is represented through pet light quality / visual maturity, not an XP bar.
- Users are not penalized for unfinished tasks.
- Growth can progress through stable product use and `接住明天`, not only task completion.

接住明天:

- User can enable / disable `接住明天`.
- When enabled, unfinished today tasks can be moved to tomorrow only after user confirmation.
- Copy frames the action as being helped / held, not as failure.

Hover:

- Hovering the pet without clicking produces a subtle body-level reaction.
- Hover does not open the panel, steal focus, or interfere with dragging.
- Reduced motion simplifies hover behavior.

轻声提醒:

- Reminders are visual and quiet by default.
- Reminder frequency is capped.
- Quiet mode suppresses reminders.

安静模式:

- User can turn on quiet mode for a duration.
- Pet remains present but simplified.
- Task entry and panel use remain available.

陪做模式:

- User can start co-do mode from one task.
- Only one task is in co-do mode at a time.
- Completing or stopping the task exits co-do mode.

Desktop space:

- Pet position can be remembered.
- User can recover the pet to the visible screen.
- Panel opens near the pet and stays inside monitor bounds.

Personalization:

- Settings remain compact and curated.
- No pet shop, full theme editor, or heavy customization surface is introduced.
