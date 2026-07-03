# T-006 Main Panel And Pet Visual System Redesign

> Product: 今天明天  
> Owner: Product Designer  
> Status: ready for development handoff  
> Last updated: 2026-07-03

## 1. Design Intent

T-006 upgrades the main planning panel and small glow pet after the native walkthrough feedback.

The desired feeling:

- The panel feels like a polished, quiet desktop companion surface.
- The user can plan today and tomorrow without scrolling in the normal default state.
- Today feels like the focus. Tomorrow feels like a soft shelf that catches unfinished work.
- Pet color themes gently tint the whole experience without becoming decorative noise.
- The collapsed pet feels dimensional and alive, not like a flat square tile.
- The pet itself emits light. It should not look like a normal sphere with a separate halo/ring placed around it.

This is not a dashboard redesign. Do not add projects, labels, priority systems, calendar grids, or task-management density.

## 2. Main Panel Structure

### Default Panel Size

Recommended implementation target:

- Width: `520-560px`
- Height: `560-620px`
- Internal page scroll: hidden in default empty/light-task states
- Border radius: `24-28px`
- Background: warm translucent paper with theme-tinted bloom

The panel should fit visually near the desktop pet. If the OS/window environment needs slightly different dimensions, preserve the one-screen hierarchy and avoid visible default scrollbars.

### One-Screen Regions

Use five fixed-height regions:

1. Top status strip
2. Quick add
3. Today / tomorrow planning body
4. Evening review/action strip
5. Optional compact footer controls row, only if needed for theme/glow/reset

Recommended proportions:

| Region | Approx height | Purpose |
| --- | ---: | --- |
| Top status strip | 56-68px | Date, day status, compact controls |
| Quick add | 52-60px | Capture without losing focus |
| Planning body | 340-390px | Today focus + tomorrow shelf |
| Evening strip | 48-58px | Review state and action |
| Footer controls | 0-40px | Optional theme/glow/reset controls |

## 3. Top Status Strip

Content:

- Date: e.g. `7月3日 周五`
- Day status line: e.g. `今天很轻` / `今天有点满` / `明天已经接住 2 件`
- Small controls: theme picker, glow intensity, reset position if space allows

Visual:

- Soft background band.
- Subtle bottom divider.
- Day status chip uses current theme accent.
- Controls stay icon-sized or compact; no large settings panel in the main surface.

Day status copy:

| State | Trigger | Copy |
| --- | --- | --- |
| Empty today | `openTodayCount = 0` | `今天很轻` |
| Light today | `openTodayCount 1-3` | `今天刚刚好` |
| Full today | `openTodayCount 4-5` | `今天有点满` |
| Overflow today | `openTodayCount > 5` | `先看最前面的几件` |
| Tomorrow has tasks | `openTomorrowCount > 0` | `明天接住 {N} 件` |

If both today and tomorrow statuses apply, show today's status first and put tomorrow count in the evening strip or tomorrow shelf header.

## 4. Quick Add

Quick add must remain the fastest path.

Required behavior:

- Single input with placeholder `写下一件事`.
- Today / tomorrow segmented control.
- Add button.
- Enter submits.
- Input remains focused after adding a task when the panel stays open.
- Empty submit shows `先写下一件小事。`

Visual:

- One row.
- Input takes most width.
- Segmented control is compact.
- Add button is circular or soft-square icon.
- Selected segmented state uses theme selected-control color.

Do not add priority, tags, due time, notes, or project fields.

## 5. Planning Body

### Layout

Use two side-by-side regions when width allows:

- Left: Today focus
- Right: Tomorrow shelf

The regions may be equal width, but the Today region should feel visually stronger through accent, elevation, or header weight. Tomorrow should feel calmer and more contained.

For very narrow panel widths, stack Today over Tomorrow, but still avoid default full-page scroll in empty/light states.

### Today Focus

Purpose:

- Show what needs attention now.
- Make completion feel satisfying but quiet.

Visual:

- Slightly brighter background.
- Stronger but still soft shadow.
- Header: `今天`
- Counter chip: open task count.
- Optional status chip: `专注中` when there are open tasks.

Task row:

- Height target: `38-46px`.
- Checkbox / completion button.
- Task title single line by default, two-line max.
- Move-to-tomorrow affordance on the right.
- Completed tasks can fade or move below open tasks if visible.

Default visible open tasks:

- Show up to 5 open today tasks without scrolling.
- If more than 5, show first 5 plus compact overflow row: `还有 N 件，先放在后面`.
- The overflow row may open an expanded list later, but T-006 does not require a heavy expanded mode.

### Tomorrow Shelf

Purpose:

- Make tomorrow feel like a safe receiving place.
- Reduce anxiety about unfinished work.

Visual:

- Slightly recessed background.
- Header: `明天接住`
- Counter chip: open tomorrow count.
- Shelf-like lower band or soft inner shadow.
- Move-to-today affordance on rows.

Default visible open tasks:

- Show up to 5 open tomorrow tasks.
- Overflow row: `明天还放着 N 件`.

Empty copy:

- Today empty: `今天很轻`
- Tomorrow empty: `明天还空着`

## 6. Evening Review / Action Strip

This strip is small but important. It should preserve the product memory point without making the panel heavy.

Default strip content:

- Review progress chip:
  - Not reviewed: `还没收尾`
  - Reviewed today: `今天已收好`
  - Empty today: `今天很完整`
- Primary action:
  - `下班整理`
  - If evening and open today tasks exist: `把今天收起来`

Visual:

- Low-height soft band at bottom.
- Uses current theme accent lightly.
- Must not become a large alert banner.

Behavior:

- Clicking action enters the existing evening review flow.
- If no open today tasks, show `今天已经很完整。`
- Do not auto-open on workday end.

## 7. Theme System

### Required Themes

Implement these five theme IDs. Names may be Chinese in UI, but IDs should remain stable.

| ID | UI name | Pet base | Aura | Panel accent | Selected controls | Particles |
| --- | --- | --- | --- | --- | --- | --- |
| `warmGlow` | 暖光 | honey yellow + ivory | warm gold | amber | deep warm gray | small gold motes |
| `mintFocus` | 薄荷 | mint + ivory | soft mint | sage green | deep green gray | pale green motes |
| `lavenderCalm` | 薰衣草 | pale lavender + ivory | lavender mist | muted lavender | deep violet gray | faint lavender dots |
| `blueNight` | 蓝夜 | moon blue + ivory | blue moonlight | mist blue | deep blue gray | cool star dots |
| `peachRest` | 桃色 | peach + ivory | peach warmth | soft peach | clay gray | peach motes |

Default theme:

- `warmGlow`

Theme picker:

- Compact set of swatches is preferred.
- A simple menu is acceptable if swatches are costly.
- The active theme must be visually indicated.

Theme affects:

- Pet sphere gradients.
- Pet self-emission tint.
- Panel accent bloom.
- Top status chip.
- Segmented selected state.
- Checkbox done state.
- Decorative particles.

Theme must not affect:

- Task layout.
- Task counts.
- Evening review behavior.
- Any task data.

### Design Tokens

Each theme should be expressible as tokens:

```ts
interface PetTheme {
  id: "warmGlow" | "mintFocus" | "lavenderCalm" | "blueNight" | "peachRest";
  name: string;
  petCore: string;
  petHighlight: string;
  petShade: string;
  emission: string;
  panelAccent: string;
  selectedControlBg: string;
  selectedControlFg: string;
  particle: string;
}
```

Equivalent CSS custom properties are also acceptable.

## 8. Glow Intensity

### Levels

Use three levels:

| ID | UI label | Description |
| --- | --- | --- |
| `low` | 低 | quiet, low self-emission |
| `soft` | 柔和 | default |
| `bright` | 明亮 | stronger self-emission, still gentle |

Default:

- `soft`

Control:

- Segmented control is preferred.
- A slider is acceptable only if it remains compact and clearly labeled.

Persistence:

- User selection must persist across restart.

Effects:

- Pet core brightness.
- Pet edge bloom opacity.
- Pet self-emission blur.
- Panel accent bloom opacity.
- Decorative particle opacity.

Reduced motion:

- Intensity still changes static appearance.
- Breathing animation is disabled or nearly still.
- Parallax highlights are disabled.

Suggested mapping:

| Level | Core brightness | Edge bloom | Panel bloom |
| --- | ---: | ---: | ---: |
| `low` | 0.8 | 0.35 | 0.12 |
| `soft` | 1.0 | 0.55 | 0.22 |
| `bright` | 1.18 | 0.78 | 0.34 |

## 9. Dimensional Pet

### Collapsed Pet Requirements

The collapsed state should read as a luminous sphere.

Important correction: the glow is not a decorative halo around the pet. The pet body itself should be the light source. Any visible bloom must feel like light spilling out from the sphere's surface and edge, not like a separate ring, outline, or orbiting glow layer.

Required visual layers:

1. Sphere body with layered radial gradients.
2. Self-emissive core and edge bloom.
3. Top-left highlight.
4. Lower-right inner shading.
5. Face with subtle depth.
6. Elliptical floor shadow.
7. Optional tiny theme particles.

Recommended CSS/visual approach:

- Main sphere background combines at least two radial gradients.
- The brightest region belongs inside the sphere body, not outside it.
- Edge bloom should be soft, irregular, and attached to the sphere edge.
- Highlight is a pseudo-element or internal span near top-left.
- Inner shade is a subtle radial or inset shadow near lower-right.
- Floor shadow is an ellipse below the sphere, not a square drop shadow.
- Face dots use slight shadow/highlight, not flat black circles.

Motion:

- Breathing scale: very small, around `1.0` to `1.025`.
- Vertical float: `0-4px`.
- Hover can brighten highlight slightly.
- No bouncing, spinning, or complex character acting.

Focus treatment:

- Keyboard focus must be visible.
- Focus should hug the sphere contour as an accessibility outline.
- Focus treatment must not read as the pet's decorative glow or as a separate halo.
- Focus must not reveal the entire square window bounds as a blue rectangle.

Transient messages:

- Do not persist old messages like `我回来了。` across app restarts.
- Message bubble must not clip in collapsed pet window.
- If there is not enough native window space for a bubble, show no bubble in collapsed state and rely on panel/top strip.

## 10. Settings And Persistence

T-006 adds two user-facing preferences:

- Pet theme.
- Glow intensity.

Recommended state:

```ts
interface Settings {
  petThemeId: "warmGlow" | "mintFocus" | "lavenderCalm" | "blueNight" | "peachRest";
  glowIntensity: "low" | "soft" | "bright";
  reducedMotion: boolean;
}
```

If the current implementation stores theme/glow elsewhere, that is acceptable as long as:

- Selections persist across restart.
- Defaults are `warmGlow` and `soft`.
- Missing or invalid saved values fall back safely.

## 11. Reset / Recovery Utility

Add a compact recovery action:

- UI label: `回到屏幕内` or icon with tooltip.
- Purpose: bring the pet back to the current visible screen if it is lost on another display or off edge.

Placement:

- Prefer in compact panel controls or app menu/tray.
- Do not make it a prominent primary action.

Acceptance:

- User has a visible way to recover pet position without deleting app data.

## 12. Responsive / Small Screen Behavior

Primary target is Mac desktop. Still, panel should not break in web preview.

If panel width is narrow:

- Stack Today over Tomorrow.
- Keep quick add visible.
- Keep evening strip visible.
- Avoid horizontal overflow.
- Internal scrolling is acceptable only for narrow web preview if content exceeds viewport; native desktop default must remain one-screen for empty/light states.

## 13. Implementation Boundary

Developer may choose the exact CSS architecture and component boundaries.

Must preserve:

- One-screen default panel.
- Fixed compact regions.
- Today focus vs tomorrow shelf relationship.
- Five theme IDs.
- Three glow intensity IDs.
- Dimensional pet visual layers.
- Self-emissive pet glow, not a separate surrounding ring.
- Persistent theme and glow settings.
- Reduced-motion compatibility.
- Low-distraction product identity.

May simplify:

- Particle rendering can be static pseudo-elements instead of generated particles.
- Parallax highlights can be omitted if they risk complexity.
- Theme picker can be a compact menu instead of swatches if swatches delay implementation.
- Overflow task row can be non-interactive in the first pass if it clearly communicates hidden count.

Must not:

- Add project/label/priority fields.
- Add a full settings window solely for T-006 unless already present and cheap.
- Turn the panel into a scroll-heavy dashboard.
- Use a visible square tile around the collapsed pet.

## 14. Acceptance Criteria

Panel:

- Default empty state shows no internal scrollbar.
- Light-task state shows no internal scrollbar when today and tomorrow each have up to 5 open tasks.
- A user can add a today or tomorrow task without losing input focus unexpectedly.
- Today visually reads as the active focus area.
- Tomorrow visually reads as a shelf/receiving area.
- Evening review/action strip is visible without dominating the panel.

Theme:

- User can choose among five themes: warm glow, mint focus, lavender calm, blue night, peach rest.
- Changing theme visibly but gently updates pet body color, self-emission tint, panel accent, selected controls, and small decoration.
- Theme persists after restart.

Glow:

- User can choose low / soft / bright.
- Glow intensity visibly affects pet core brightness, edge self-emission bloom, and panel accent bloom.
- Glow intensity persists after restart.
- Reduced motion keeps static glow but removes or minimizes continuous motion.

Pet:

- Collapsed pet feels like a dimensional self-emissive glowing sphere.
- The glow appears to come from the pet body itself, not from an external halo/ring.
- Keyboard focus is visible without revealing a square tile.
- The pet has an elliptical floor shadow.
- The pet uses highlight and inner shading.
- Old transient messages do not appear clipped on relaunch.

Recovery:

- There is a compact way to return the pet to the current visible screen.

Low-distraction:

- No sound is added.
- No modal opens automatically at workday end.
- Visual additions remain soft and quiet.
- The main planning flow still focuses only on today and tomorrow.
