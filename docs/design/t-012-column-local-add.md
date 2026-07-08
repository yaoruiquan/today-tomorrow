# T-012 Column-Local Add Interaction

Date: 2026-07-07
Owner: Product Designer
Status: ready for development handoff

## 1. Intent

T-012 adjusts the main planning panel task capture model.

User feedback:

> 写下一件事的时候，不要再上面出现，记录今天明天不同的事还得切换。直接在对应的面板位置添加事更方便。

The product should no longer ask the user to type into one global input and then choose `今天 / 明天`. The panel already has two clear spatial areas, so task creation should follow the same spatial model:

- Write inside `今天` to add a today task.
- Write inside `明天接住` to add a tomorrow task.

This should make the app feel more direct, less form-like, and more like placing thoughts into two quiet containers.

## 2. Design Decision

Remove the default top global `QuickAdd` row from the main panel.

Replace it with two column-local add controls:

- Today column add row.
- Tomorrow column add row.

The user should never need to switch a segmented control before adding a task. The column itself is the destination.

## 3. Panel Structure Update

Previous default structure:

```text
Top status strip
Global quick add: [写下一件事] [今天|明天] [+]
Companion strip
Today / Tomorrow columns
Evening strip
Footer controls
```

New default structure:

```text
Top status strip
Companion strip
Today / Tomorrow columns
  Today header
  Today local add
  Today task list
  Tomorrow header
  Tomorrow local add
  Tomorrow task list
Evening strip
Footer controls / settings
```

The removed global quick-add height should be returned to the planning body so the panel still feels one-screen and less crowded.

## 4. Column Add Controls

### Today Add Row

Placement:

- Inside the Today column.
- Directly below the column header and before task rows.

Placeholder:

- `添加今天的事`

Submit:

- Enter or add button creates a `today` task.
- Empty submit shows a gentle message:
  - `先写下一件今天的事。`

After submit:

- Input clears.
- Focus stays in the Today add input.
- New task appears in the Today list.

### Tomorrow Add Row

Placement:

- Inside the Tomorrow / `明天接住` column.
- Directly below the column header and before task rows.

Placeholder:

- `放到明天`
- Alternative if more explicit is needed: `添加明天的事`

Recommended first pass:

- Use `放到明天`, because it supports the product language of placing / being held.

Submit:

- Enter or add button creates a `tomorrow` task.
- Empty submit shows:
  - `先写下一件明天的事。`

After submit:

- Input clears.
- Focus stays in the Tomorrow add input.
- New task appears in the Tomorrow shelf.

## 5. Visual Design

The local add row should be quieter than a task row but clearly writable.

Style:

- Compact height: `34-40px`.
- Soft inset background.
- Light border.
- Small plus icon button on the right.
- No segmented control.
- No large primary button.
- Use the column's visual character:
  - Today add row can be slightly brighter / more active.
  - Tomorrow add row can feel more recessed / shelf-like.

The add row should look like part of the column, not a separate form floating above the panel.

## 6. Interaction Rules

- Clicking inside a local add input must not close the native panel.
- Typing must not lose focus.
- Pressing Enter submits to that column only.
- Clicking the plus submits to that column only.
- After successful submit, focus returns to the same input.
- If the user tabs through the panel, both local add inputs are reachable.
- Task row hover / focus actions remain unchanged.
- Moving tasks between Today and Tomorrow remains available on task rows.

## 7. Default Focus

When the panel opens:

- Default autofocus may go to Today local add, because Today is the most common capture target.
- If native focus reliability is risky, it is acceptable to focus the first safe focusable element and rely on user click, but clicking either local add input must work reliably.

After adding in Tomorrow:

- Do not jump focus back to Today.
- Staying in Tomorrow is important because the user may be planning multiple tomorrow items.

## 8. Empty And Light States

Empty Today column:

```text
今天
[ 添加今天的事 __________________ + ]
今天很轻
```

Empty Tomorrow column:

```text
明天接住
[ 放到明天 __________________ + ]
明天还空着
```

Light task state:

- Add row remains visible above task rows.
- Show up to the normal light-task count without forcing internal panel scroll.
- If the add row reduces list capacity, prefer showing 4 visible tasks plus overflow over shrinking the input too much.
- Product Designer accepts a first-pass capacity of 4 visible open tasks per column plus compact overflow rows, as long as empty and light-task states remain one-screen and the local add rows feel usable.

Overflow state:

- Add row remains visible.
- Overflow copy remains compact:
  - Today: `还有 N 件，先放在后面`
  - Tomorrow: `明天还放着 N 件`

## 9. Relationship To Existing QuickAdd

Developer may either:

- Refactor `QuickAdd` into a reusable `ColumnAdd` component, or
- Replace the global `QuickAdd` with new column-local add UI.

Product requirement:

- The default main panel must not show the global top input.
- The default main panel must not require a `今天 / 明天` segmented switch for task creation.

If a command-palette or keyboard shortcut is added later, it may use a global capture model, but that is out of scope for T-012.

## 10. Accessibility

Recommended labels:

- Today input `aria-label`: `添加今天的任务`
- Tomorrow input `aria-label`: `添加明天的任务`
- Today plus button `aria-label`: `添加到今天`
- Tomorrow plus button `aria-label`: `添加到明天`

Keyboard order:

1. Today add input.
2. Today add button.
3. Today task rows.
4. Tomorrow add input.
5. Tomorrow add button.
6. Tomorrow task rows.

Exact order may follow DOM layout, but both local add controls must be easy to reach.

## 11. QA Acceptance Criteria

Default panel:

- No global top quick-add row is visible in the default task panel.
- No `今天 / 明天` segmented switch is needed for adding tasks.
- Today and Tomorrow each have their own local add input.

Behavior:

- Submitting Today local add creates a today task.
- Submitting Tomorrow local add creates a tomorrow task.
- Empty submit gives bucket-specific gentle feedback.
- After submit, the same local input clears and remains focused.
- Adding in Tomorrow does not jump focus to Today.
- Existing task complete / move / co-do / evening review behavior is unchanged.

Layout:

- Empty and light-task states remain one-screen.
- Local add rows do not crowd task rows or make the panel feel like a form.
- Overflow rows remain compact and the local add rows stay visible.

Native smoothness:

- Clicking either local add input does not close the panel.
- Typing in either local add input does not lose focus.
- Keyboard navigation can reach both add inputs and buttons.

Boundaries:

- Do not add projects, tags, priority, due time, notes, or a heavy create-task form.
- Do not introduce a new settings surface for this change.
