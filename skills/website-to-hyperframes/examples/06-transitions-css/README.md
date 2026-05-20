# Section 06 — Transitions (CSS)

CSS-only transitions between beats: push, scale, blur dissolve, 3D flip, light leak wipe, plain dissolve. The lighter-weight counterpart to shader transitions — same beat-to-beat punctuation, no WebGL required.

**When to study this section:** any multi-beat composition where CSS transitions are sufficient and the cost/complexity of shader transitions isn't warranted. Also the right choice for fast-pacing videos where transitions need to be ~0.2-0.4s.

---

## Scenes

| Scene | Duration | Techniques | Why study |
|-------|----------|------------|-----------|
| [`scene-01-css-transitions-grid/`](scene-01-css-transitions-grid/) | 5s | 2×3 grid of 6 mini panels, each running ONE CSS transition between Beat A and Beat B states: (1) **Push** — A slides out left, B slides in from right with `power3.inOut`; (2) **Scale** — A scales down + fades, B scales up + fades with `back.out(1.7)` overshoot; (3) **Blur Dissolve** — A fades out with increasing `filter: blur()`, B fades in with decreasing blur; (4) **3D Flip** — coin-flip via `preserve-3d` + `backface-visibility: hidden`; (5) **Light Leak Wipe** — bright gradient wipes across as A→B handoff happens behind; (6) **Dissolve** — classic opacity crossfade. Each transition staggered to fire at different timestamps so snapshot frames catch them mid-state. | Demonstrates that you don't always need shaders for beat transitions. Each cell is a complete A→B transition you can copy into a real beat. The 3D flip pattern especially is useful — `preserve-3d` + `perspective` + `backface-visibility: hidden` is a recipe many agents miss. |
| [`scene-02-3d-flip-transition/`](scene-02-3d-flip-transition/) | 6s | **Dedicated single-transition showcase: CSS 3D card flip between two stat cards.** Blue card "12 teams shipping with HyperFrames" (counts up 0→12) → CSS 3D rotateY 180° flip with subtle anticipation tilt → orange card "847 videos rendered this quarter" (counts up 0→847). Caption swaps mid-flip from "From the team count…" to "…to the output count." `transform-style: preserve-3d` + `perspective: 2400px` + `backface-visibility: hidden`. | The full-frame 3D flip pattern — different from the mini-cell version in scene-01. Use for stat reveals, before/after comparisons, or any "two related states" beat. Demonstrates the anticipation-flip-overshoot motion shape that makes the flip feel intentional rather than abrupt. |
| [`scene-03-light-leak-wipe/`](scene-03-light-leak-wipe/) | 6s | **Light-leak wipe transition between two scenes.** DARK (deep navy, "3 a.m. · the build is broken") → LIGHT (warm cream, italic "9 a.m. · ship the demo"). 3 stacked diagonal gradient strips (white-bloom, amber, and a thin white flare) sweep across the frame from off-screen left to off-screen right at slightly different speeds and angles. Scene-A → Scene-B handoff happens at peak bloom (around the strip's brightest midpoint) so the swap is masked. `mix-blend-mode: screen` on the strips creates the bloom-on-bg look. | The "photograph that caught a flash" transition. Use for time-of-day shifts, before/after reveals, or any cinematic moment where you want a literal "moment of light" between two scenes. The 3-strip stagger is what makes it feel organic rather than mechanical. |

---

## QC log

- scene-01: **PASS** — 6 frames; frame 1 all panels in A state, frame 2 panel 1 PUSH kicking off, frame 3 panels 1+2 in B, frame 4 panel 4 3D FLIP caught mid-rotation (the money shot with angled red B face skewed in 3D), frame 5 all panels in B, frame 6 final B held. 6 distinct easings across the 6 panels.
- scene-02: **PASS** — 6 frames; frame 2 blue card with counter mid-count-up showing "3", frame 3 blue card showing "12 teams" + caption "From the team count…" + slight tilt drift (anticipation), frame 4 orange card showing "0" just after the flip (counter resetting), frame 5 orange showing "847 videos", frame 6 settled hold. Authored from scratch to fill the section-06 gap with the canonical full-frame CSS 3D flip pattern.
