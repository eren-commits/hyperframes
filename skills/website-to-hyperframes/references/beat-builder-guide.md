# Beat Builder Guide

You are building ONE beat of a multi-beat video composition. This file tells you what to read, how to build, how to verify, and how to report back.

## Step 1: Read and understand

**Required (every beat):**

1. **Load the `hyperframes` skill** — composition rules, data attributes, timeline contract, deterministic rendering. Read the whole skill.
2. **[capabilities.md](capabilities.md)** — full inventory of HyperFrames capabilities (24 sections). Read the Table of Contents first, then deep-dive sections your beat needs.
3. **The beat spec** the main agent gave you — concept, choreography, assets, brand values, timing.

**Read based on what your beat needs (pick relevant ones):**

| Resource                                                                              | What it covers                                                                                                                | Read when                                         |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| [techniques.md](../../hyperframes/references/techniques.md)                           | 20 visual techniques with code: SVG path drawing, Canvas 2D, CSS 3D, kinetic type, variable fonts, MotionPath, counters       | Beat uses any of these techniques                 |
| [text-effects.md](../../hyperframes/references/text-effects.md)                       | 24 named text animations: soft-blur-in, typewriter, kinetic-center-build, line-reveal, stagger, crossfade, shared-axis        | Beat has text animation                           |
| [html-in-canvas-patterns.md](../../hyperframes/references/html-in-canvas-patterns.md) | HTML-in-Canvas: iPhone/MacBook mockups, liquid glass, magnetic, portal, shatter, text cursor                                  | Beat uses device mockups or WebGL effects on HTML |
| [transitions.md](../../hyperframes/references/transitions.md)                         | Shader transition API, HyperShader.init() pattern, all 14 WebGL shaders                                                       | Beat has shader transitions                       |
| [transitions/](../../hyperframes/references/transitions/)                             | 14 CSS transition category files: push, scale, dissolve, blur, 3D flip, light leak, distortion, grid, mechanical, destruction | Beat uses CSS transitions                         |
| [css-patterns.md](../../hyperframes/references/css-patterns.md)                       | Text markers: highlight sweeps, hand-drawn circles, burst lines, scribble, sketchout                                          | Beat uses text emphasis/markers                   |
| [audio-reactive.md](../../hyperframes/references/audio-reactive.md)                   | Bass→scale, mid→shape, treble→glow mappings                                                                                   | Beat reacts to music/audio                        |
| [captions.md](../../hyperframes/references/captions.md)                               | Per-word karaoke, tone-adaptive styling, positioning                                                                          | Beat includes captions                            |
| [typography.md](../../hyperframes/references/typography.md)                           | Font hierarchy, variable fonts, responsive type scaling                                                                       | Beat has complex typography                       |
| [motion-principles.md](../../hyperframes/references/motion-principles.md)             | Velocity matching, easing philosophy, motion continuity                                                                       | Beat needs polished motion design                 |
| [dynamic-techniques.md](../../hyperframes/references/dynamic-techniques.md)           | Counter animations, data-driven visuals, dynamic content                                                                      | Beat has counters or data visualization           |
| [video-composition.md](../../hyperframes/references/video-composition.md)             | Frame composition, color presence, scale, density rules                                                                       | General composition quality                       |

**Other skills you can load if needed:**

- `/gsap` or `/gsap-core`, `/gsap-timeline`, `/gsap-plugins` — deeper GSAP reference
- `/animate-text` — curated text animation catalog with exact JSON specs
- `/hyperframes-registry` — if you need to install and wire registry blocks
- `/hyperframes-contrast` — audit color contrast (WCAG)
- `/lottie`, `/three`, `/waapi`, `/animejs`, `/css-animations` — if beat uses these engines

**Always open the captured assets folder before designing the beat:**

- `capture/assets/svgs/` — brand logos, icons, decorative marks. SVGs are infinitely scalable and stroke-animatable (path drawing, dash offset). A logo SVG drawing itself onto frame can carry an entire beat.
- `capture/assets/` — hero illustrations, screenshots, product art, gradients, photography. These are first-class beat subjects, not background decoration. A breathing hero illustration with a single line of kinetic type is a complete shot.
- VIEW every image before placing text on it. Check safe zones, contrast, actual content, where the focal point sits.

**If your beat spec names a captured asset, USE it.** Don't substitute a CSS recreation. The user captured these from the real brand site precisely so the video carries the brand's actual visual identity.

## Step 2: Build the composition

Save to the path the main agent specified (usually `compositions/beat-N-name.html`).

```html
<template>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    /* your styles */
  </style>

  <div
    id="beat-N-name"
    data-composition-id="beat-N-name"
    data-width="1920"
    data-height="1080"
    style="width:1920px; height:1080px; position:relative; overflow:hidden; background:#YOUR_BG;"
  >
    <!-- your elements -->
  </div>

  <script>
    (function () {
      var BEAT = 5.5; // MUST match data-duration on the host div in index.html
      window.__timelines = window.__timelines || {};
      var tl = gsap.timeline({ paused: true });

      // your GSAP animations

      window.__timelines["beat-N-name"] = tl;
    })();
  </script>
</template>
```

**Critical:** `data-composition-id`, `data-width`, `data-height` on the root div MUST match the host div in index.html.

## Step 3: Lint

```bash
npx hyperframes lint .
```

Fix ALL errors. Zero errors required.

## Step 4: Snapshot and verify

```bash
npx tsx packages/cli/src/cli.ts snapshot . --frames 3
```

**READ the contact sheet** (`snapshots/contact-sheet.jpg`). For each frame:

- Is content visible? (not black, blank, or loading)
- Is text readable, properly positioned, correct font/color?
- Are assets at the right size and position?
- Does the animation state match the beat spec at this timestamp?

**If anything is wrong:** fix, re-snapshot, re-check. You are done ONLY when every frame matches the spec.

## Step 5: Write the verification artifact

**You don't "report back" with a chat message. You write a file.** The main agent will run `npx hyperframes verify-beats` against your output; if the file is missing, malformed, or the claims inside don't match what's actually in your composition HTML, the build fails and a sub-agent is re-dispatched. There is no way to fake this — the verifier reads the actual files.

Write `compositions/beat-N-name-verify.json` (matching your composition filename + `-verify.json`) with this exact shape:

```json
{
  "beat": 3,
  "composition_file": "compositions/beat-3-kanban.html",
  "lint": {
    "exit": 0,
    "errors": 0,
    "warnings": 12
  },
  "snapshots_taken_at_seconds": [0.2, 1.5, 3.8, 5.0],
  "snapshot_files": [
    "snapshots/beat-3/frame-00-at-0.2s.png",
    "snapshots/beat-3/frame-01-at-1.5s.png",
    "snapshots/beat-3/frame-02-at-3.8s.png",
    "snapshots/beat-3/frame-03-at-5.0s.png"
  ],
  "frame_observations": [
    {
      "t": 0.2,
      "describes": "Dark canvas (#07080A) with grain overlay. No cards yet — opening empty state."
    },
    {
      "t": 1.5,
      "describes": "Three kanban columns visible, 4 cards each. First active card highlighted in Raycast red (#FF6363). Counter chip on In-Progress reads '3'."
    },
    {
      "t": 3.8,
      "describes": "All 12 cards settled. Brand logo SVG appears top-left at 60×60. Narration sync moment: 'crush your sprint' lands."
    },
    {
      "t": 5.0,
      "describes": "Hold frame — cards breathe with y±2px parallax. Logo still visible. Ready for transition."
    }
  ],
  "brand_check": {
    "primary_bg_hex_used": "#07080A",
    "primary_bg_hex_design_md": "#07080A",
    "matches_bg": true,
    "accent_hex_used": "#FF6363",
    "accent_hex_design_md": "#FF6363",
    "matches_accent": true,
    "headline_min_font_px": 96,
    "captured_assets_referenced": ["capture/assets/raycast-logo.svg"],
    "no_assets_reason": null
  },
  "concept_alignment": "Serves the 'Problem → Solution' arc — chaotic backlog organizes itself, narration lands the value prop on the settle. Brand mark stamps identity without being the content."
}
```

### Field requirements (the verifier checks every one of these)

- **`lint.exit`** — must be `0`. Run `npx hyperframes lint .` from the project root and record the exit code. Fix all errors before writing this number.
- **`snapshots_taken_at_seconds`** — at least 3 timestamps spread across the beat's duration (entrance, hold, near-exit minimum).
- **`snapshot_files`** — actual PNG paths. The verifier checks each file exists on disk. If you list a path that doesn't exist, the beat fails.
- **`frame_observations`** — at least 3 entries, each describing concrete visible content at that timestamp. Generic statements like "looks good" or "content visible" will fail the verifier's length check (need ≥20 chars per observation). Quote the headline text, name the colors, describe the layout.
- **`brand_check.primary_bg_hex_used`** — must literally appear in the composition HTML (the verifier greps for it). If you claim `#07080A` but the file uses `#000000`, the beat fails.
- **`brand_check.matches_bg`** — `true` if your `primary_bg_hex_used` equals what DESIGN.md says for this brand. `false` if you intentionally deviated (note why in `concept_alignment`).
- **`brand_check.accent_hex_used`** — same rule as bg. Same grep check.
- **`brand_check.headline_min_font_px`** — must be ≥80. Smaller headlines fail readability at video scale.
- **`brand_check.captured_assets_referenced`** — list every `capture/assets/<filename>` path you actually used in the composition. The verifier greps the HTML for each. Don't list paths you didn't use — that's lying and the verifier catches it.
- **`brand_check.no_assets_reason`** — required ONLY if `captured_assets_referenced` is empty. Explain why (e.g., "opener is pure kinetic typography; brand logo lands in closer beat"). Most beats need 0-1 accent, but if every beat across the video has zero, the brand-floor check will flag the video.
- **`concept_alignment`** — one substantive sentence (≥30 chars) describing how this beat serves the storyboard's message and arc. Not "shows the kanban" — _why_ this beat exists in _this_ video.

### Why this exists

Earlier sessions had sub-agents reply "0 errors, looks good" without reading the HTML they wrote. Videos shipped with mismatched brand colors, missing logos, headlines too small to read, and beats that didn't serve the storyboard. The verifier exists because chat-message reports cannot be trusted. Producing the JSON forces you to actually open the composition, run lint, look at the snapshots, and check DESIGN.md.

If you find yourself wanting to write `"describes": "looks good"` — stop. Open the snapshot PNG, see what's visible, write that.

---

## Continuous motion — the most important rule

A beat is a SHOT in a film, not a webpage with entrance animations. Your GSAP timeline should have events spread across the ENTIRE beat duration — not just entrance tweens in the first 1-2 seconds followed by nothing. If an element is on screen, it should be doing something. After elements enter, add continuous hold motion: camera dolly, parallax layers moving at different speeds, secondary elements appearing mid-beat, real depth shifts.

## You are building a SHOT, not a webpage

The storyboard tells you the shot framing (close-up / medium / wide / etc.) and the camera move. Implement them. A beat is a moment, not a screenshot. The distinction is **what the camera is doing**, not whether the subject is a UI element or a logo — a tight push-in on a real product screenshot is a shot; a centered card on a parked camera is a webpage.

**Patterns that turn a shot back into a webpage:**

- ❌ **macOS / browser window chrome reproduced in CSS** — traffic-light dots (`.red`, `.yellow`, `.green` circles), URL bars, browser tabs reconstructed from divs. UNLESS the storyboard explicitly says the chrome IS the subject. (A captured product screenshot from `capture/assets/` that happens to include chrome is fine — that's documentary footage of the brand. The rule is about hand-rolling fake chrome to frame a CSS rebuild.)
- ❌ **Full webpage layout** (sidebar + header + footer + main content area) when the storyboard called for a moment, not a tour. The beat is about _the kanban moment_, not _the kanban app_.
- ❌ **Parked-camera composition** — centered card with 60–120px margins on all sides and no camera move. Either give it a real push-in / dolly / parallax, or reframe.
- ❌ **"Hold with breathing"** implemented as `y: ±1–2px` or `scale: 1.01` — invisible at 1920×1080+ scale. If continuous motion is required, use camera dolly (scale 1.0 → 1.05), parallax pan (x/y ±30–80px), or progressive reveals.
- ❌ **Hover-state simulations** — videos have no hover. If the brand uses hover effects, show the BEFORE and AFTER as discrete frames in the timeline.
- ❌ **Counter pulses + dot pulses + tiny scale wobbles** as the only motion during the hold — these are "I ran out of ideas" filler.

**Patterns that ARE shots (do these freely):**

- ✅ **Captured SVG logo drawing itself stroke-by-stroke** (DrawSVG / path dashoffset) — a complete opener or stinger.
- ✅ **Captured hero illustration with camera dolly** — push-in from 1.0 → 1.08 over 4s, focal element holds frame.
- ✅ **Captured product screenshot with parallax layers** — separate the foreground UI from background panels and move them at different speeds, or use HTML-in-Canvas for an iPhone/MacBook mockup.
- ✅ **Captured asset as the bed, kinetic type as the punchline** — the brand's hero image holds the frame while a one-line message arrives, splits, reflows.
- ✅ **Composed-from-divs UI moment** when the beat is specifically about that UI's interaction (a card sliding into a column, a search result resolving) — this is the legit case for CSS-only composition.

**Required motion magnitudes** (anything smaller is invisible at video scale):

| Motion type     | Minimum magnitude                           |
| --------------- | ------------------------------------------- |
| Translate (y/x) | 30px (entrance) / 8px (drift during hold)   |
| Scale           | 0.05 change (1.0 → 1.05 or larger)          |
| Opacity         | full 0 → 1 or vice versa for reveals        |
| Rotate          | 4° minimum to read (Dutch angles, ticks)    |
| Camera dolly    | scale 1.0 → 1.06 minimum over beat duration |

**Required cinematography per beat** (the storyboard should give you these; if it doesn't, escalate):

- A **shot type** (close-up / medium / wide / over-the-shoulder / Dutch)
- A **camera move** (dolly in/out, push, parallax pan, orbit, rack focus)
- A **depth strategy** (what's foreground / midground / background)
- A **purpose** (what specific feeling or noticing the shot delivers)

If any are missing from the beat spec, the beat is under-defined. Don't fill the gap with "centered layout + breathing" — re-read the spec, and if it's genuinely missing, ask the main agent.

## Rules

- SCRIPT PLACEMENT: scripts inside `<template>`, never after `</template>`. Scripts outside see no DOM.
- GSAP FROM TRAP: never `gsap.from(el, {opacity:0})` with CSS `opacity:0`. It animates 0→0. Use `tl.fromTo()`.
- STYLE: avoid CSS `opacity:0` on GSAP-animated elements. Use GSAP fromTo for initial states.
- ASSET PATHS: project-root-relative. `capture/assets/file.png` ✅ `../capture/assets/file.png` ❌
- SVG VIA IMG: `<img src="logo.svg">` can't inherit CSS color. Inline SVG or `filter: brightness(0) invert(1)`.
- CSS CENTERING: no `transform: translate(-50%, -50%)` with GSAP transforms. Use flexbox or `xPercent/yPercent`.
- QUERYSELECTOR: `document.getElementById("id")` with null guards. No method calls without null check.
- CHARACTER SPANS: `display:inline-block` on spaces collapses them. Use `&nbsp;` or per-word spans.
- COUNTERS: no `onUpdate` callbacks. Discrete `tl.set(el, {textContent: "42"}, 2.5)` at timestamps.
- TIMELINE: `window.__timelines["beat-N-name"] = tl` synchronously. Key = `data-composition-id`.
- DETERMINISTIC: no `Math.random()`, `Date.now()`, `requestAnimationFrame`, `repeat:-1`.
- Always `tl.fromTo()` not `tl.from()` for entrances.
- Never stack two transform tweens on same element at same time.
- FONTS: brand fonts with `capture/assets/fonts/` path need `@font-face` in `<style>`.

## Easing — pick per intent

Do NOT default to `power2.out` on everything.

| Intent          | GSAP Ease             | Use for                              |
| --------------- | --------------------- | ------------------------------------ |
| Snap (iOS feel) | `power4.out`          | Hero text, UI elements               |
| Whip overshoot  | `back.out(1.7)`       | Numbers, badges, impact              |
| Soft land       | `expo.out`            | Per-word reveals, gentle entrances   |
| Mechanical      | `power1.out`          | Terminal text, code typing           |
| Bounce settle   | `elastic.out(1, 0.5)` | Counters, CTA buttons                |
| Dramatic        | `expo.inOut`          | Full-screen statements, hero reveals |
| Drift           | `"none"`              | Parallax, Ken Burns, camera drift    |

Staggered items: `power4.out` with `stagger: 0.08` to `0.15`.
