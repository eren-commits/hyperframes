# Step 6: Build Compositions

**Before building, fully re-read these files:**

- **DESIGN.md** — your color palette, fonts, components, and Do's/Don'ts. Every composition must use EXACT hex colors and font families from this file. If it says "white backgrounds" — use white, not dark.
- **STORYBOARD.md** — the beat-by-beat plan you're executing. Each beat specifies assets, animations, transitions, and which techniques to use.
- **`capture/extracted/asset-descriptions.md`** — when the storyboard assigns an asset to a beat, re-read the description to understand what it shows and how to position/style it correctly.
- **[techniques.md](../../hyperframes/references/techniques.md)** — code patterns for the 11 visual techniques. When the storyboard says "SVG path drawing" or "per-word kinetic typography" — read the code pattern from this file and adapt it.
- **transcript.json** — word-level timestamps that drive scene durations.

**Split the work: spawn a sub-agent for each beat.** By this step your context is full of captured data, DESIGN.md, SCRIPT, STORYBOARD, and transcript. Building compositions on top of all that means the detailed rules below compete with thousands of tokens of prior work. Each sub-agent gets a fresh context focused on one beat — dramatically better output.

**Before dispatching sub-agents, prepare two things:**

**1. Build the @font-face block.** Sub-agents will not figure out font-file-to-family mapping on their own (proven by testing — 2 out of 3 sites ship with zero @font-face when agents are left to do it themselves). Build it for them:

1. Read DESIGN.md to get font family names and weights
2. Run `ls capture/assets/fonts/` to get the `.woff2` filenames
3. Map each filename to its family and weight (e.g., `Inter-Medium.woff2` → Inter, weight 500)
4. Write the complete `@font-face` CSS block and save it for pasting into every sub-agent prompt

**2. Build the asset inventory for this beat.** For each beat, list the exact assets the storyboard assigned with their `../capture/assets/` paths. This is what gets pasted into the sub-agent prompt.

**How to dispatch each sub-agent:**

Pass file PATHS, not file contents. The #1 failure mode is reading an asset file and pasting its SVG/image data into the sub-agent prompt.

```
Build the composition for beat 1. Save to compositions/beat-1-hook.html.

STORYBOARD for this beat:
[paste the beat section from STORYBOARD.md]

ASSETS — reference by path, do NOT read/inline the file contents:
- Logo: <img src="../capture/assets/favicon.svg"> (top-left, 40x40px)
- Hero image: <img src="../capture/assets/hero-bg.png"> (full-bleed background)

FONTS — paste this COMPLETE @font-face block into your <style> tag verbatim.
Do NOT use fonts.googleapis.com. Do NOT skip any declarations:
[paste the @font-face block you built above]

Read DESIGN.md for exact colors and Do's/Don'ts.
Read techniques.md for animation code patterns and the easing vocabulary table.
Load the `hyperframes` skill for composition structure rules.
```

**After each sub-agent finishes, run the lint gate:**

```bash
npx hyperframes lint compositions/beat-N-name.html
```

If the linter reports `font_family_without_font_face` or `google_fonts_import`, fix the composition before moving to the next beat. Also verify:

1. The `@font-face` block is present in the `<style>` tag — if the sub-agent dropped it, paste it back in
2. Every storyboard-assigned asset appears in the HTML — grep for each filename. Missing assets = broken beat, fix now.

Load the `hyperframes` skill first — it has the rules for data attributes, timeline contracts, deterministic rendering, and layout. Everything below supplements those rules, not replaces them.

---

## Per-Composition Process

For each beat in the storyboard:

### 1. Read the beat's storyboard section

Know the mood, visual description, assets, animation choreography, transition, and SFX before writing any HTML.

### 2. Build the static end-state first

Position every element where it should be at its **most visible moment** — the frame where everything is fully entered and correctly placed. Write this as static HTML+CSS. No GSAP yet.

This is the "Layout Before Animation" principle from the compose skill. The CSS position is the ground truth. Animations describe the journey to and from it.

### 3. Verify the static layout

Look at it. Check:

- Are elements where the storyboard says they should be?
- Are depth layers present (foreground / midground / background)?
- Do any elements overlap unintentionally?
- Are assets sized correctly? (hero images should fill 50-70% of frame, not sit at 100x100px)

### 4. Add entrance animations

Use `gsap.from()` — animate FROM offscreen/invisible TO the CSS position. The CSS position is where the element ends up.

### 5. Add mid-scene activity

Every visible element must have continuous motion. A still image on a still background is a JPEG with a progress bar.

| Element type                           | Mid-scene activity                                                                                                                           |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Image / screenshot                     | Slow zoom (scale 1→1.03), slow pan, or Ken Burns                                                                                             |
| Stat / number                          | Counter animates from 0 to target                                                                                                            |
| Logo grid                              | Subtle shimmer sweep, or gentle scale pulse                                                                                                  |
| Any persistent element                 | Subtle float (y ±4-6px, sine.inOut, yoyo)                                                                                                    |
| Logo / CTA (with music or dramatic VO) | Audio-reactive scale/glow — bass pulses the logo (3–4%), treble glows the CTA. See technique #11 in `techniques.md` for the sampling pattern |

### 6. Add exit / transition

Check the storyboard's transition specification for this beat:

- **CSS transition**: implement the exit animation (e.g., `y:-150, blur:30px, 0.33s power2.in`). The next composition handles its own entry.
- **Shader transition**: no exit animation needed — the shader handles the blend. Available shaders: chromatic-radial-split, cinematic-zoom, cross-warp-morph, domain-warp-dissolve, flash-through-white, glitch, gravitational-lens, light-leak, ridged-burn, ripple-waves, sdf-iris, swirl-vortex, thermal-distortion, whip-pan. Install with `npx hyperframes add <name>`. The package handles WebGL init, capture, and GSAP integration — do not copy raw GLSL manually.
- **Hard cut**: no exit animation. The scene simply ends.

For all CSS transition types and their GSAP implementations, read `skills/hyperframes/references/transitions/catalog.md`.

### 7. Asset cross-reference

Before self-review, verify you actually used the assets you planned to:

1. Open STORYBOARD.md and find this beat's asset assignments
2. List every asset that was assigned to this beat
3. Search the composition HTML for each filename (e.g., grep for "wave-fallback-desktop")
4. If any assigned asset is missing from the HTML, add it now
5. Check for the inline anti-pattern: if the HTML contains `<svg xmlns=` or `data:image/` but no `../capture/assets/` references, the assets were inlined instead of referenced. Replace inline content with `<img src="../capture/assets/filename.svg">`
6. Check fonts: if the HTML uses `fonts.googleapis.com` but there are captured fonts in `capture/assets/fonts/`, replace with `@font-face` pointing to the local files (e.g., `src: url('../capture/assets/fonts/BrandFont-Regular.woff2')`)

This step catches the two most common failures: compositions ending up text-only, and assets being inlined instead of file-referenced.

### 8. Self-review

After building the composition, check WITH ACTUAL CODE:

- [ ] Asset cross-reference passed (step 7 above — every assigned asset is in the HTML)
- [ ] **Every `font-family` in CSS has a matching `@font-face`** with `src: url('../capture/assets/fonts/...')`. Linter: `font_family_without_font_face`.
- [ ] **No Google Fonts.** No `fonts.googleapis.com` in `<link>` or `@import`. Linter: `google_fonts_import`.
- [ ] Elements are where the storyboard says they should be (no misplacement)
- [ ] No overlapping text (text covering text is always ugly)
- [ ] Depth layers present (background + midground + foreground — see Depth Layers section above)
- [ ] Every visible element has mid-scene activity (not just entrance + exit)
- [ ] **Animation density**: count the `tl.to()`, `tl.from()`, `tl.fromTo()`, and `tl.set()` calls. Production compositions average 30-70 GSAP calls. If yours has fewer than 15, the composition is under-animated — add more choreography, varied entrances, ambient loops, and exit transitions. For reference: a 12-second production composition typically has 70+ GSAP operations (6/second), across 8+ distinct animation phases.
- [ ] **Easing variety**: check that you used at least 3 different easing functions. If everything uses `power2.out`, the motion feels monotonous. See the easing vocabulary table in techniques.md for the full palette.
- [ ] Font sizes above minimum (20px body text, 16px labels — sub-14px is unreadable after encoding)
- [ ] No full-screen dark linear gradients (H.264 creates visible banding — use solid + localized radial glows)
- [ ] Timeline registered: `window.__timelines["comp-id"] = tl`
- [ ] Colors match DESIGN.md exactly (paste the HEX value, don't approximate)
- [ ] **Every `<template>` root element** — not just `index.html`, but every sub-composition's root — has `data-start="0"`. The linter warns `root_composition_missing_data_start` when missing. Authoring `data-duration="<beat_seconds>"` on the root is also recommended for compositions whose GSAP timeline uses repeating animations (`repeat: -1` or large `repeat: N`); without it the runtime may infer `Infinity` and stall playback. The linter flags those repeating shapes directly via `gsap_infinite_repeat` and `gsap_repeat_ceil_overshoot`.
- [ ] **Caption exits have a hard kill.** If you animate captions out with `tl.to(groupEl, { opacity: 0 }, group.end)`, follow it with `tl.set(groupEl, { opacity: 0, visibility: "hidden" }, group.end)` as a deterministic kill — per-word karaoke tweens can override the exit tween and leave captions stuck on screen. Linter: `caption_exit_missing_hard_kill`.
- [ ] **No duplicate media nodes.** If the same image/video source is referenced twice with identical `data-start` + `data-duration`, the compiler discovers it twice and can double-render. Dedupe by using a single `<img>` with appropriate z-layering, or stagger the `data-start` values. Linter: `duplicate_media_discovery_risk`.

**If `skills/hyperframes-animation-map/` is installed**, run it:

```bash
node skills/hyperframes-animation-map/scripts/animation-map.mjs <composition-dir>
```

Read the summaries. Fix every flag: offscreen, collision, invisible, pacing issues.

### 9. Move to the next composition

---

## Depth Layers

Every composition needs at least three visual layers. Flat compositions (text on solid color) look like slide decks.

| Layer          | z-index range | What goes here                                    | Examples                                                                       |
| -------------- | ------------- | ------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Background** | 0-10          | Ambient treatment that fills the frame            | Radial gradient glow, subtle grid, slow-drifting particles, blurred screenshot |
| **Midground**  | 10-50         | Main content — the elements the viewer focuses on | Product screenshots, text blocks, logos, data cards                            |
| **Foreground** | 50-100        | Texture and atmosphere overlaid on everything     | Grain texture (opacity 0.03-0.06), floating particles, light leaks, vignette   |

The background and foreground layers are what separate motion graphics from slide decks. The midground is the content; the other two are the production quality. Choose what fits the brand — a tech brand might use a dot grid background + particle foreground; a luxury brand might use a radial glow + grain.

## Asset Presentation

Never embed a raw flat image. Every image must have motion treatment:

- **Perspective tilt**: use `gsap.set(el, { transformPerspective: 1200, rotationY: -8 })` + `box-shadow` — creates depth. Do NOT use CSS `transform: perspective(...)` as GSAP will overwrite it.
- **Slow zoom (Ken Burns)**: GSAP `scale: 1` → `1.04` over beat duration — makes photos cinematic
- **Device frame**: Wrap in a laptop/phone shape using CSS `border-radius` and `box-shadow`
- **Floating UI**: Extract a key element and animate it at a different z-depth for parallax
- **Scroll reveal**: Clip the image to a viewport window and animate `y` position
- **VFX block**: If HTML-in-Canvas VFX blocks are installed (check with `npx hyperframes list --installed`), use device mockups, liquid glass, or other effects for hero treatments. Install with `npx hyperframes add --tag html-in-canvas`. Or build custom effects from scratch using the `drawElementImage` API — see `docs/guides/html-in-canvas.mdx`.

---

## Audio Wiring

In the root `index.html`:

- **Narration**: `<audio id="narration" src="narration.wav" data-start="0" data-duration="..." data-track-index="0" data-volume="1">`
- **Underscore/music** (if storyboard specifies): `<audio id="underscore" src="underscore.mp3" data-start="0" data-duration="..." data-track-index="3" data-volume="0.15">`
- **SFX**: If `sfx/` directory exists in the project, wire sound effects at beat boundaries. Each SFX gets its own track index (41+) to avoid conflicts:

```html
<audio
  id="sfx-whoosh-1"
  src="sfx/whoosh.mp3"
  data-start="BEAT2_START"
  data-duration="1.5"
  data-track-index="41"
  data-volume="0.5"
></audio>
<audio
  id="sfx-pop-1"
  src="sfx/pop.mp3"
  data-start="REVEAL_TIME"
  data-duration="0.8"
  data-track-index="42"
  data-volume="0.4"
></audio>
```

SFX timing: whoosh 0.1s before a beat transition, pop/click at the moment an element appears, typing aligned to character animation starts, impact on stat counter or hero text landing. Volume 0.2-0.5 — never compete with VO.

- **Captions** (optional — only if user requests): sub-composition on a parallel track. Skip unless explicitly asked for.

---

## Critical Rules

These exist because the capture engine is deterministic. Violations produce broken output.

- **No `repeat: -1`** — calculate exact repeats from beat duration
- **No `Math.random()`** — use a seeded PRNG (mulberry32)
- **Register every timeline**: `window.__timelines["comp-id"] = tl`
- **Synchronous timeline construction** — no async/await wrapping timeline code
- **Never use ANY CSS `transform` for centering** — not `translate(-50%, -50%)`, not `translateX(-50%)`, not `translateY(-50%)`. GSAP animates the `transform` property, which overwrites ALL CSS transforms including centering. The element flies offscreen. Use flexbox centering instead: `display:flex; align-items:center; justify-content:center` on a wrapper div. The linter catches this (`gsap_css_transform_conflict`) but only if you run it.
- **Minimum font sizes**: 20px body, 16px labels
- **No full-screen dark linear gradients** — H.264 banding

---

## Load-bearing rules for animation authoring

Rules below came out of two independent website-to-hyperframes builds (2026-04-20) where compositions lint-clean and still ship broken — elements that never appear, ambient motion that doesn't scrub, entrance tweens that silently kill their target. The linter cannot catch these; the rules must be followed by the author.

- **No iframes for captured content.** Iframes do not seek deterministically with the timeline — the capture engine cannot scrub inside them, so they appear frozen (or blank) in the rendered output. If the source you're stylizing is a live web app, use the screenshots from `capture/` as stacked panels or layered images, not live embeds.

- **Never stack two transform tweens on the same element.** A common failure: a `y` entrance plus a `scale` Ken Burns on the same `<img>`. The second tween's `immediateRender: true` writes the element's initial state at construction time, overwriting whatever the first tween set — leaving the element invisible or offscreen with no lint warning. A secondary mechanism: `tl.from()` resets to its declared "from" state when the playhead is seeked past the timeline's end, so an element that looked correct in linear playback vanishes in the capture engine's non-linear seek. Fix one of two ways:

  ```html
  <!-- BAD: two transforms on one element -->
  <img class="hero" src="..." />
  <script>
    tl.from(".hero", { y: 50, opacity: 0, duration: 0.6 }, 0);
    tl.to(".hero", { scale: 1.04, duration: beat }, 0); // kills the entrance
  </script>

  <!-- GOOD option A: combine into one tween -->
  <script>
    tl.fromTo(
      ".hero",
      { y: 50, opacity: 0, scale: 1.0 },
      { y: 0, opacity: 1, scale: 1.04, duration: beat, ease: "none" },
      0,
    );
  </script>

  <!-- GOOD option B: split across parent + child -->
  <div class="hero-wrap"><img class="hero" src="..." /></div>
  <script>
    tl.from(".hero-wrap", { y: 50, opacity: 0, duration: 0.6 }, 0); // entrance on parent
    tl.to(".hero", { scale: 1.04, duration: beat }, 0); // Ken Burns on child
  </script>
  ```

- **Prefer `tl.fromTo()` over `tl.from()` inside `.clip` scenes.** `gsap.from()` sets `immediateRender: true` by default, which writes the "from" state at timeline construction — before the `.clip` scene's `data-start` is active. Elements can flash visible, start from the wrong position, or skip their entrance entirely when the scene is seeked non-linearly (which the capture engine does). Explicit `fromTo` makes the state at every timeline position deterministic:

  ```js
  // BRITTLE: immediateRender interacts badly with scene boundaries
  tl.from(el, { opacity: 0, y: 50, duration: 0.6 }, t);

  // DETERMINISTIC: state is defined at both ends, no immediateRender surprise
  tl.fromTo(el, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.6 }, t);
  ```

- **Ambient pulses must attach to the seekable `tl`, never bare `gsap.to()`.** Auras, shimmers, gentle float loops, logo breathing — all of these must be added to the scene's timeline, not fired standalone. Standalone tweens run on wallclock time and do not scrub with the capture engine, so the effect is absent in the rendered video even though it looks correct in the studio preview:

  ```js
  // BAD: lives outside the timeline, never renders in capture
  gsap.to(".aura", { scale: 1.08, yoyo: true, repeat: 5, duration: 1.2 });

  // GOOD: seekable, deterministic, renders
  tl.to(".aura", { scale: 1.08, yoyo: true, repeat: 5, duration: 1.2 }, 0);
  ```

- **Hard-kill every scene boundary, not just captions.** The caption hard-kill rule above generalizes: any element whose visibility changes at a beat boundary needs a deterministic `tl.set()` kill after its fade, because later tweens on the same element (or `immediateRender` from a sibling tween) can resurrect it. Apply to every element with an exit animation:

  ```js
  tl.to(el, { opacity: 0, duration: 0.3 }, beatEnd);
  tl.set(el, { opacity: 0, visibility: "hidden" }, beatEnd + 0.3); // deterministic kill
  ```
