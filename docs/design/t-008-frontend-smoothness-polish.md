# T-008 Frontend Smoothness And Progressive Interaction Polish

Date: 2026-07-03
Owner: Product Designer
Status: ready for development

## 1. Intent

T-008 is a frontend UX polish pass based on direct desktop walkthrough.

The product already has the right ingredients: a one-screen today/tomorrow panel, a dimensional self-emissive pet, growth abilities, `接住明天`, hover interaction, quiet mode, co-do mode, and desktop controls. The next improvement is not adding more functions. It is making the current experience feel smoother, lighter, and more inevitable.

Core experience goal:

> 用户点开小光团以后，第一反应应该是“写一件事很轻”，而不是“这里有很多设置要理解”。

## 2. Walkthrough Evidence

Observed in the signed native desktop app:

- Clicking the collapsed pet opens the panel.
- The panel has a polished visual direction and fits one screen.
- Clicking the input field in the native panel can collapse the panel back to the pet window.
- Typing into the input can be interrupted and not retained.
- Reopening the panel returns focus to the panel, but the user has already lost the first task-entry attempt.
- The collapsed pet reads dimensional, but a visible outer edge can still read as a ring-like boundary in native view.
- The panel exposes many controls immediately: `接住明天`, `轻声提醒`, `靠近回应`, theme swatches, glow strength, quiet mode, position, and `回到屏幕内`.

Observed in web smoke flow:

- Quick add logic itself is promising: after adding a task, focus can return to the input.
- Empty and light-task panel can fit one page.
- With tasks present, visible task rows are understandable.
- The task row default state is busy because each row exposes completion, title, `陪做`, and move controls at the same time.

## 3. Design Diagnosis

The friction is not feature absence. The friction comes from:

- Fragile focus / blur handling in the native panel.
- Too many secondary controls visible before the user needs them.
- Task-row actions competing with task reading.
- Repeated `接住明天` concepts across ability toggle and evening action.
- Settings living in the main planning surface instead of a progressive control surface.
- Pet-to-panel transition feeling like a normal window switch rather than a companion unfolding.

## 4. Priorities

| Priority | Area | Goal |
| --- | --- | --- |
| P0 | Native panel focus | User can click, type, and operate controls without accidental collapse. |
| P1 | Progressive disclosure | Main panel defaults to planning, not settings. |
| P1 | Task row calmness | Task list is readable first; actions appear when relevant. |
| P1 | Pet-panel transition | Opening and closing feel spatially connected to the pet. |
| P2 | Pet light polish | Pet self-emission reads from body, not edge ring. |

## 5. P0: Panel Internal Interaction Must Be Safe

### Required Behavior

When the panel is open, these interactions must not collapse the panel:

- Clicking or focusing the quick-add input.
- Typing text.
- Selecting today / tomorrow.
- Pressing add.
- Clicking task rows, check buttons, move controls, or co-do controls.
- Opening or selecting compact settings controls.
- Clicking `接住明天`, `先留在今天`, `下班整理`, or `回到屏幕内`.

Panel may collapse only when:

- User presses `Escape`.
- User clicks outside the panel and outside the pet.
- User uses an explicit close / collapse action if one exists.
- Native app receives a true external app/window focus loss and no panel interaction is active.

### Interaction Details

- Panel opens with the quick-add input focused.
- The input focus should happen after the panel is visible, not before the window is ready.
- First typed character must be accepted.
- If the panel briefly loses window focus because of native WebView / window activation mechanics, it should wait and verify the active element / pointer target before hiding.
- A short grace window after panel open is acceptable.

### Acceptance Criteria

- User can open pet, click input, type a task, and the panel remains open.
- User can add a task with keyboard or mouse and the text is not lost.
- After adding a task, input is cleared and focused.
- Tabbing inside the panel cycles through controls without hiding the panel.
- Escape hides the panel.
- Clicking outside hides the panel.

## 6. P1: Main Panel Should Default To Planning, Not Settings

### Default Visible Structure

Default first screen should show:

1. Status strip.
2. Quick add.
3. A quiet companion line.
4. Today / Tomorrow planning body.
5. Evening strip / `接住明天` suggestion when relevant.
6. Minimal comfort bar.

Default first screen should not show all settings as primary objects.

### Minimal Comfort Bar

Default footer should contain only:

- Theme swatches, if they remain visually small.
- Glow strength control.
- One compact settings button, icon or short label.

Move these into a progressive settings popover / drawer:

- `接住明天` master toggle.
- `轻声提醒`.
- `靠近回应`.
- `安静模式` duration.
- Position menu.
- `回到屏幕内`, unless position recovery is urgently relevant.

### Settings Popover

Settings popover can be a small anchored surface from the footer.

Sections:

- `陪伴`: `接住明天`, `轻声提醒`, `靠近回应`.
- `安静`: quiet mode duration.
- `桌面`: position and `回到屏幕内`.

Do not create a full settings window for this pass.

### Acceptance Criteria

- A new user can understand the default panel without reading five settings at once.
- Default panel remains one-screen at the native target size.
- Settings are reachable within one click from the panel.
- Settings controls remain persisted as currently specified.

## 7. P1: Companion Line Should Be Informative, Not A Control Row

Current companion line carries both message and ability toggles. It should become a soft status line by default.

Default companion line:

- Left: pet message, such as `小光团在这里，先放下一件小事。`
- Right: optional small status chip only when meaningful, such as `陪做中` or `安静中`.

Do not show ability toggles directly in this row by default.

When `接住明天` is relevant, the evening strip owns the actual decision.

## 8. P1: Task Rows Should Reveal Actions Gradually

### Default Row

Default task row should show:

- Completion circle.
- Task title.
- `陪做中` chip only if active.

Default task row should not always show:

- `陪做`.
- Move arrow.
- Multiple equal-weight buttons.

### Hover / Focus Row

On hover, keyboard focus within row, or selected row state, reveal:

- `陪做`.
- Move to other bucket.
- Optional more action if needed later.

On touch / reduced pointer environments:

- Row can show a compact trailing menu button instead of hover-only actions.

### Co-Do

- Starting co-do gives the row a quiet stable highlight.
- Active row displays `陪做中`.
- Pet visual can become steadier.
- Stop action can be available on hover/focus or in the row action menu.

### Acceptance Criteria

- Task list is readable before actions are visible.
- Keyboard users can still access all row actions.
- Co-do state remains visible once active.
- Moving tasks between today and tomorrow remains discoverable.

## 9. P1: `接住明天` Should Feel Like A Timely Suggestion

`接住明天` is both a setting and a moment. The moment should be the visible product magic.

### Default

- Master toggle lives in settings.
- Do not show master toggle as a main-row chip by default.

### When Relevant

When today has unfinished tasks and review context is appropriate:

- Evening strip shows `还有 2 件，我帮你接到明天？`
- Primary action: `接住明天`
- Secondary action: `先留在今天`

After confirm:

- Tasks move to tomorrow.
- Tomorrow shelf receives them quietly.
- Pet can give a small internal-light response.

After dismiss:

- Suggestion should not immediately reappear in the same session unless task count changes materially.

## 10. P1: Pet-Panel Spatial Transition

Opening should feel like the panel belongs to the pet.

### Open

- Click pet.
- Pet gives a small body-brightness response.
- Panel appears near the pet with a short opacity + scale transition.
- Transform origin should match the pet side when feasible.
- Quick-add input focuses after panel is visible.

### Close

- Escape / outside click fades panel down quickly.
- Pet returns to normal idle brightness.

### Duration

- Panel open: 140-190ms.
- Panel close: 100-140ms.
- Pet response: 120-180ms.

### Reduced Motion

- Use opacity only.
- No scale or positional motion.

## 11. P2: Pet Self-Emission Polish

The pet should keep reading as a self-emissive sphere.

Adjustments:

- Reduce any distinct circular outer border that reads as a separate ring.
- Prefer body brightness, inner gradient, and body box-shadow spill.
- Edge bloom should be soft and incomplete enough to feel like light leaking from the body, not a full outline.
- Hover brightens the pet core first, not an external outline.
- Focus ring remains accessible but visually separate from decorative glow.

Acceptance:

- First glance is `发光球体`, not `球体 + 外圈`.
- Low glow still looks alive.
- Bright glow feels stronger but not like a decorative halo.

## 12. Proposed Default Layout

Default panel:

```text
[ Date + 今天/明天 ]                         [今天状态]

[ 写下一件事 __________________ ] [今天|明天] [+]

[ 小光团在这里，先放下一件小事。          (状态 chip if needed) ]

[ 今天 focus column          ] [ 明天接住 shelf          ]

[ 还有 N 件，我帮你接到明天？ ] [接住明天] [先留在今天]

[ theme swatches ] [低 柔 亮]                         [settings]
```

Settings popover:

```text
陪伴
[接住明天] [轻声提醒] [靠近回应]

安静
[关闭] [1 小时] [到明天] [一直]

桌面
[右下/左下/右上/左上/记住拖动] [回到屏幕内]
```

## 13. States

Developer should account for:

- Panel just opened, focus pending.
- Panel input focused.
- Panel select / popover open.
- Panel internal pointer down.
- External pointer down.
- External focus loss during internal interaction.
- Task row idle.
- Task row hover.
- Task row keyboard focus.
- Task row co-do active.
- Settings popover closed.
- Settings popover open.
- Catch tomorrow suggestion visible.
- Catch tomorrow suggestion dismissed.
- Reduced motion active.

## 14. Implementation Boundaries

Do:

- Preserve T-006 one-screen panel and T-007 abilities.
- Keep today/tomorrow as the only task model.
- Keep settings compact.
- Improve interaction timing, focus, progressive disclosure, and visual hierarchy.

Do not:

- Add projects, tags, priorities, calendars, or full dashboard layout.
- Add a large settings page.
- Add new growth mechanics.
- Add AI task analysis.
- Add more reminders or system notifications.
- Make task rows taller enough to break one-screen light-task layout.

## 15. QA Acceptance Criteria

Native focus:

- Open pet, click input, type, submit: panel remains open and task is added.
- Click every visible panel control once: panel does not collapse unless the control explicitly closes it.
- Tab through the panel: focus stays trapped inside the panel.
- Escape closes the panel.
- Clicking outside closes the panel.

Progressive disclosure:

- Default panel does not show all ability and desktop settings at once.
- Settings are reachable in one click and do not require a full page.
- Default panel still fits one screen.

Task rows:

- Idle rows are visually calm.
- Row actions appear on hover/focus or via compact menu.
- Keyboard users can access co-do and move actions.
- Active co-do row remains visibly marked.

Catch tomorrow:

- `接住明天` master toggle is not duplicated as a primary default control.
- Relevant evening suggestion appears with confirm/dismiss actions.
- Dismissed suggestion does not immediately reappear.

Motion:

- Panel open/close has a short, calm transition.
- Reduced motion disables scale/position motion.

Pet:

- Pet reads as self-emissive body light, not a body plus full outer ring.
