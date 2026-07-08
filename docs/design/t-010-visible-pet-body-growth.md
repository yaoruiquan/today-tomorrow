# T-010 Visible Pet Body Growth Evolution

Date: 2026-07-03
Owner: Product Designer
Status: ready for development handoff

## 1. Intent

T-010 redesigns the pet growth system so growth is visibly expressed through the pet's body form, not only through copy or subtle glow changes.

The user intent is clear:

> 宠物要在视觉上能看到成长，并且这种成长要和记录任务、完成任务、接住明天等行为挂钩。

This task keeps the earliest product feeling of a soft desktop `小光团`: simple, round, warm, quiet, with a tiny face and floating presence. However, the old prototype's large outer `pet-aura` should not return. The pet's light must come from the pet body itself: internal core light, translucent body layers, edge self-emission, and small internal particles.

## 2. Product Principle

The growth fantasy:

> 你记录的事情让它长大；你完成的事情让它变亮；你把今天交给明天时，它长出更会接住的身体。

Do not express growth as:

- XP / level numbers.
- Progress bars.
- Streak pressure.
- Pet sickness or punishment.
- A separate glow ring around the pet.

Express growth as:

- Body size and silhouette.
- Face detail.
- Internal light structure.
- Internal task-light particles.
- Softer / steadier breathing.
- A more capable receiving posture for `接住明天`.

## 3. Source Visual Reference

Use the earliest prototype as emotional reference:

- File: `prototype/static-web/styles.css`
- Original elements: `.pet`, `.pet-body`, `.pet-face`, `.pet-shadow`
- Keep: soft rounded body, tiny face, gentle breathing, elliptical floor shadow, warm honey body color.
- Do not keep: `.pet-aura` as a large independent outer halo.

Implementation should translate the old aura feeling into body-owned emission:

- Inner core gradient.
- Edge bloom clipped / anchored to body shape.
- Body box-shadow spill that reads as light leaking from the surface.
- Optional pseudo-element inside the body, not a large external ring.

## 4. Growth Inputs

Existing growth inputs remain valid, but the visual output must become stronger.

| User behavior | Product meaning | Visual growth effect |
| --- | --- | --- |
| Records today task | trusts the pet with today | body becomes slightly fuller over time |
| Records tomorrow task | prepares tomorrow | lower body gains a soft receiving layer |
| Completes task | resolves a small piece of time | internal light particle brightens / settles |
| Uses `接住明天` | accepts core product promise | lower body / side silhouette becomes more capable of holding |
| Completes evening review | closes the day | breathing becomes steadier; inner light more even |
| Uses `陪做模式` | lets pet accompany work | face / posture becomes calmer and more attentive |

Do not map each task to a permanent one-to-one visible dot indefinitely. Aggregate many actions into a small number of visual layers so the pet stays clean.

## 5. Growth Stage Model

Replace the current visually weak stage expression with five body-form stages.

Stable stage IDs may keep backward compatibility if needed, but product-facing names and CSS data names should avoid `halo`. If renaming is feasible, prefer:

| Current possible ID | Preferred ID | Name | Visual role |
| --- | --- | --- | --- |
| `spark` | `seedLight` | 光点期 | newly arrived light seed |
| `glow` | `smallGlow` | 小团期 | stable small companion |
| `stardust` | `starCore` | 星尘期 | visible internal memory particles |
| `halo` | `holdingGlow` | 托光期 | body learns to hold / catch tomorrow |
| `dayNightWatcher` | `dayNightCore` | 守望期 | mature day/night internal light |

If code migration cost is high, keep old IDs internally but map them to the new visual names in comments / CSS selectors. Do not expose `halo` as a design concept.

## 6. Stage Visual Specs

### Stage 1: 光点期 / `seedLight`

Feeling:

- The pet has just arrived.
- It is alive but tiny and simple.

Visual:

- Body size: about `64-70px`.
- Shape: near round, slightly organic.
- Face: absent or very faint two-dot face.
- Internal light: single warm center.
- Edge: minimal self-emission, no external ring.
- Shadow: small and close to body.

Behavior fit:

- New user default.
- Growth from first few task records should be easy to notice.

### Stage 2: 小团期 / `smallGlow`

Feeling:

- The pet is becoming familiar.

Visual:

- Body size: about `78-84px`.
- Shape: soft squircle / round blob, like original prototype.
- Face: clear tiny eyes.
- Internal light: top-left highlight and lower-right inner shade.
- Edge: body-owned bloom, subtle.
- Breathing: stable and soft.

Trigger direction:

- Reached after early task recording / completion.

### Stage 3: 星尘期 / `starCore`

Feeling:

- It starts carrying small memories of the user's tasks.

Visual:

- Body size: `84-90px`.
- Internal particles: 3-5 tiny light specks inside the body.
- Particles must be clipped within the body and should not orbit outside.
- Completed-task feedback: one internal speck brightens briefly, then returns to calm.
- Body remains clean; no confetti.

Trigger direction:

- Reached through repeated recording / completing / first evening reviews.

### Stage 4: 托光期 / `holdingGlow`

Feeling:

- It has visibly learned to `接住明天`.

Visual:

- Body size: `88-96px`.
- Silhouette changes: lower body becomes slightly wider / softer, like it can hold something.
- Optional tiny side nubs / soft lower folds may appear, but they must be abstract and light-like, not cartoon arms.
- Lower internal layer appears: a warm receiving shelf inside the body.
- On `接住明天`, caught tasks become 1-3 internal light motes that gather near the lower body, then settle into the Tomorrow shelf.

Important:

- This is the strongest differentiating growth stage.
- It should be visibly different from Stage 3 even in a still screenshot.

### Stage 5: 守望期 / `dayNightCore`

Feeling:

- It has become a long-term desktop companion.

Visual:

- Body size: `92-100px`, but not huge.
- Internal light has two gentle zones:
  - upper warm today light,
  - lower cooler tomorrow / night light.
- Body edge is more translucent and luminous.
- Face is calm, slightly more settled.
- Breathing is slower and more even.
- Shadow is wider and softer, suggesting more presence.

Do not:

- Add a crown, badge, accessories, or level marker.
- Make it look like a different character.

## 7. Event Feedback

Growth should be visible in two ways:

1. Persistent stage form.
2. Short event reactions tied to task actions.

### Add Today Task

- A tiny internal light seed appears near the center for 400-700ms.
- If this causes a stage transition, body grows with a soft 700-1000ms morph.

### Add Tomorrow Task

- A small light mote appears near the lower body.
- Tomorrow layer warms slightly.

### Complete Task

- One internal speck brightens once from inside.
- Pet body brightness increases briefly, then settles.
- No external celebration.

### 接住明天

- The core gathers light inward.
- 1-3 internal motes drift to the lower body / holding layer.
- Body lower silhouette or receiving layer glows softly.
- The pet returns to a steadier body light.

### Evening Review Complete

- Pet breathing becomes slightly slower for a few seconds.
- Inner light becomes more even.
- If stage transition happens, show only one quiet milestone line:
  - `小光团好像长得更稳了一点。`
  - `它更会接住明天了。`

## 8. Self-Emission Rules

The user explicitly does not want a large glow circle around the pet.

Allowed:

- Radial gradients inside `.pet-shell-body`.
- `box-shadow` tightly attached to the body edge.
- Pseudo-elements clipped by body border radius / mask.
- Inner highlight and inner shade.
- Floor shadow under the pet.

Not allowed:

- A separate full-size `.pet-aura` layer like the original prototype.
- Orbit rings.
- Large circular halo wider than the body by more than about `12-16px`.
- Confetti, spark burst, or celebration outside the body.
- Focus outline that looks like pet glow.

QA should judge the visual by perception, not DOM structure alone: even if there is no `.aura` element, the result fails if it looks like an external ring.

## 9. Implementation Guidance

Preferred implementation shape:

- Keep one pet component, but split the body into internal layers:
  - body base,
  - core light,
  - internal particles,
  - face,
  - optional lower holding layer,
  - floor shadow.
- Use `data-growth` for stage form.
- Use `data-reaction` or transient state for event reactions if needed.
- Keep theme tokens so pet color themes still work.
- Keep glow intensity settings, but apply them to body brightness / internal light / edge spill, not to a detached halo.

CSS direction:

- Stage 1 changes size and face opacity.
- Stage 2 restores original soft blob feeling.
- Stage 3 adds clipped internal particles.
- Stage 4 changes lower body silhouette and adds holding layer.
- Stage 5 adds internal two-zone light and calmer breathing.

If pure CSS morphing is too costly, first pass may use stage-specific nested spans and CSS classes. Do not introduce canvas/WebGL for this pass unless developer believes it is cheaper than CSS.

## 10. Reduced Motion

Reduced motion must preserve visual growth:

- Persistent stage form still changes.
- No looping particle drift.
- Event reactions become opacity / brightness changes only.
- No path movement for task motes.

## 11. Acceptance Criteria

Visual growth:

- A still screenshot of Stage 1 and Stage 5 clearly shows the pet has grown.
- Stage 3 is visibly different from Stage 2 through internal body particles.
- Stage 4 is visibly different from Stage 3 through a holding / receiving body form.
- Stage 5 has a mature internal light structure, not just stronger glow.

Task linkage:

- Recording tasks can advance early growth.
- Completing tasks can trigger internal brightening.
- `接住明天` is a strong growth signal and has the strongest body reaction.
- Evening review contributes to steadier mature body light.

Self-emission:

- Glow reads as coming from the body core / surface.
- No large external halo / ring / aura appears around the pet.
- Any outer bloom is tight and body-shaped.

Product boundaries:

- No XP, level number, streak UI, pet punishment, shop, accessories, or heavy game mechanics.
- The pet remains quiet and desktop-friendly.
- Themes and glow intensity still work with all stages.

Developer may simplify exact dimensions if the visible body-growth hierarchy is preserved.
