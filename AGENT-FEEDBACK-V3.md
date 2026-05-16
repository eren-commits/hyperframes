# Agent Feedback — Pipeline v3 Test Run

**Date:** May 16, 2026  
**Branch tested:** `feat/pipeline-quality-v2` (same skill, after P0/P1 fixes from v2)  
**Sites tested:** huly.io, arc.net, mercury.com, daylight.computer, framer.com, raycast.com, workos.com  
**Prompts:** identical to v2 — `Capture https://<site> and make me a <type> video`

---

## Per-Agent Summaries

### huly.io

- **Stale `transcript.json` in repo root.** `npx hyperframes transcribe` writes to CWD, not next to the input audio file. A previous project had left an Arc browser transcript in the repo root. Agent read it, noticed "You already know your browser is holding you back," and caught it wasn't right. If the stale content had been plausible (generic SaaS copy), it would have silently wired wrong timestamps into every beat. This is a footgun — CLI should write transcript next to the input file.
- **Kokoro compressed 31s → 19.7s despite `[pause]` markers.** Kokoro ignored all pause hints. The timing reconciliation gate helped (agent restructured beats), but the video is still shorter than requested. Agent noted ElevenLabs or HeyGen TTS would have handled pauses correctly.
- **Beat 4 uncertain — dark frames in snapshot.** Only blue glow visible, no GitHub SVG or screenshot. Agent reported honestly but delivered without confidence. Couldn't verify before delivering.
- **Preview CLI path doubling.** `npx hyperframes preview videos/huly-promo` resolved to `videos/huly-promo/videos/huly-promo`. Had to fall back to local CLI.
- **Heavy reading burden.** 40% of session time spent reading 12+ reference files before writing anything. Storyboard writing is demanding (per-beat animation sequences, SFX timings, text effect IDs).
- **AGENTS.md ReferenceError during capture** (same as v2 — non-blocking).

### arc.net

- **Beat 5 (CTA) invisible for 30+ minutes of debugging — 5 approaches tried, never fully fixed.** Blue background rendered (scene container visible) but inner elements (logo, tagline, buttons) stayed at `opacity: 0`. Agent's best hypothesis: GSAP scheduled beat-5 entrance animations at t=0–4s of the global timeline, but HyperShader keeps the scene at `opacity: 0` until t=20s. By the time the scene becomes visible, GSAP has already "played through" the entrance tweens. Elements sit at their animated-to state — but if HyperShader resets opacity on scene switch, they end up invisible again. This is the pattern behind the user observation: "everything after first scene is invisible." The core architecture confusion — agents don't know how to sequence entrance animations in HyperShader-managed scenes.
- **Transcription CLI hanging** (same as v2).
- **HyperShader + `data-start`/`data-duration` interaction not documented.** Agent bounced between "same track with overlaps" and "separate tracks" without finding the right pattern. The linter complains about overlapping clips on the same track but HyperShader needs scenes to be visible simultaneously during transitions.

### mercury.com

- **Root cause found: `<script>` tags outside `<template>` wrapper made all compositions completely static.** Sub-agents placed scripts after the closing `</template>` tag (standard HTML practice). The `<template>` element is inert — its content isn't in the live DOM until HyperFrames clones and injects it. Scripts running at page load find every `querySelector` returning null. GSAP silently accepts null targets and does nothing. Every element stayed at its initial CSS state (`opacity: 0`). This caused ALL compositions to have zero working animations. Agent spent 60% of session debugging before finding it by comparing with a working project (huly-promo). Once fixed: compositions rendered beautifully.
- **Snapshot showed blank for 15 iterations but actual render was fine the whole time.** Agent was chasing a phantom bug. The snapshot tool (even with our v2 fix) still doesn't reliably reflect render output for all patterns. Agent's takeaway: render a quick MP4 early instead of trusting snapshots as ground truth.
- **Sub-composition track visibility confusion.** Without HyperShader, all beats rendered simultaneously (all scene divs stacked). Not documented that `data-track-index` doesn't control visibility — that's HyperShader's job.

### daylight.computer

- **Sub-compositions rendered blank (all except beat 1) — gave up and consolidated into single `index.html`.** Three rounds of debugging without diagnosis. "Likely" a HyperShader + clip visibility conflict but never confirmed. Consolidating everything into one file worked immediately. Lesson: for multi-scene HyperShader videos, single-file inline scenes may be safer than separate sub-composition files.
- **ElevenLabs quota, transcription hanging, font hashing** (same as v2).
- **Security hook blocked `innerHTML` file writes.** Standard HyperFrames composition code (splitting text into character spans) triggered a security hook flagging innerHTML usage. Had to use `cat <<'EOF'` via Bash to write files. Not a skill issue but a tooling friction point.

### framer.com

- **ElevenLabs quota, Kokoro 42% time compression** (21.5s vs 37s planned — same as v2, handled with reconciliation gate).
- **GT Walsheim not capturable** — commercial font, not in captured font files. Substituted Inter with tight letter-spacing. Functional but not brand-accurate.
- **HyperShader broke beats 3–5 (snapshot showed black) — uncertainty until end.** Removed HyperShader → all beats visible simultaneously. Re-added with separate track indices → snapshots still uncertain. Agent delivered without full visual confirmation. Creatively: gallery wall of 12 real customer sites noted as genuinely strong concept.
- **Reading burden** (same as huly — 40% of time).

### raycast.com

- **Product screenshots not rendering in beats 2–3 even after fixing paths.** Agent batch-fixed `../capture/` → `capture/` paths but still thinks sub-composition path resolution context may be wrong. Delivered without confirming.
- **3 of 5 sub-agents still used `../capture/` despite explicit rule as the first RULES bullet.** Batch-fixed with sed. The path problem persists even with our v3 fix — agents ignore it regardless of position in the prompt.
- **Wrong shader name from memory** — wrote `chromatic-radial-split` instead of `chromatic-split`. Validate caught it. Should check `ls registry/blocks/` first.
- **DESIGN.md too long** (280 lines for a brand they're about to storyboard). Agent noted this as overhead, not value.
- **HeyGen TTS API shape mismatch** — `data` is a list, not `data.voices`. Cost one retry (same as v2).
- **Reading burden** (40% of time — same as huly).

### workos.com

- **Beats 4 and 5 invisible for 40% of session — two separate root causes:**
  1. `document.querySelector(".chevron-left").getTotalLength()` threw a `TypeError` (element not in DOM at script time in template context). This crashed the beat-5 script before `window.__timelines["beat-5-cta"] = tl` could execute. No timeline registered = no rendering at all. The null-guard rule in the RULES section was there — the agent's sub-agent didn't follow it.
  2. CSS `<style>` blocks inside `<template>` elements don't apply after injection in all contexts. `background: #FFFFFF` on the composition root was invisible. Had to set backgrounds as inline `style=""` on host divs in `index.html` and rewrite beats 4–5 with all-inline styles.
- **GSAP compound selectors `#beat-2-product .eyebrow` don't resolve reliably in template context.** Even after template injection, compound selectors that cross the host/template boundary can return null.
- **ElevenLabs quota** (same).
- **Transcript saved to wrong directory** — same bug as huly: `npx hyperframes transcribe --output` wrote to repo root instead of project directory.

---

## New Issues (not seen in v2)

### P0: `<script>` outside `<template>` → all GSAP does nothing

**Most impactful new bug, hit by mercury (all beats static) and workos (beats 4–5).** Sub-agents naturally put `<script>` tags at the end of the file, after `</template>`. In standard HTML this is correct. In HyperFrames sub-compositions, the `<template>` content is inert until cloned into the DOM. Scripts running at page load find every `querySelector` returning null. GSAP silently accepts null targets.

Correct pattern (scripts INSIDE the template):

```html
<template id="beat-1-template">
  <div data-composition-id="beat-1">
    <!-- HTML -->
    <style>
      /* styles */
    </style>
    <script src="gsap.min.js"></script>
    <script>
      // querySelector works here — template content is in DOM by the time
      // HyperFrames runs these scripts after cloning
      var el = document.getElementById("beat-1-headline");
      tl.fromTo(el, { opacity: 0 }, { opacity: 1 });
    </script>
  </div>
</template>
```

### P0: CSS `<style>` inside `<template>` may not apply

Related to above. Inline styles on elements are safer than `<style>` blocks in template context. Affected workos and daylight.

### P1: GSAP timing vs HyperShader scene visibility

Beat entrance animations scheduled early in the timeline may have already "played" before the scene becomes visible via HyperShader. Agents don't have a documented pattern for this. Arc beat 5 is the clearest example. Need canonical guidance on how to wire HyperShader + sub-composition timelines correctly.

### P1: Stale `transcript.json` in repo root

`npx hyperframes transcribe` writes to CWD. If run from repo root, it overwrites (or reads from) any previous project's transcript. Silent wrong timestamps. Should write next to the input file.

### P2: Preview CLI path doubling

`npx hyperframes preview videos/huly-promo` doubles the path. Use `cd videos/huly-promo && npx hyperframes preview` or local CLI.

### P2: SVG `getTotalLength()` null crash in template context

`document.querySelector(".svg-path").getTotalLength()` throws if element not found. One null crash kills the entire beat script. Null guards required — but sub-agents still miss this despite the RULES bullet.

### P2: Security hook blocks `innerHTML`

Not a skill issue but tooling friction. Workaround: Bash `cat <<'EOF'`.

---

## Still Repeating from v2

| Issue                          | v2 Status        | v3 Status                                                                                         |
| ------------------------------ | ---------------- | ------------------------------------------------------------------------------------------------- |
| Sub-agents `../capture/` paths | 5+ agents        | Reduced but NOT fixed — raycast 3/5 still wrong despite new RULES bullet                          |
| Transcription CLI hanging      | 4+ agents        | Still happening — whisper fallback documented but CLI still hangs                                 |
| ElevenLabs quota               | 2+ agents        | Same — check quota before picking                                                                 |
| Kokoro timing compression      | All kokoro users | Same compression (~40%), but reconciliation gate helps agents handle it                           |
| Font filename hashing          | Multiple         | Same — no mapping from hash to family                                                             |
| HeyGen TTS API shape mismatch  | huly v2          | raycast v3 — still wrong in docs                                                                  |
| AGENTS.md ReferenceError       | Multiple         | Same — CLI bug, still unfixed                                                                     |
| Snapshot tool unreliability    | All agents       | Partially fixed (loading screen gone) but mercury confirms still unreliable for template patterns |
| HyperShader scene confusion    | Multiple         | Core confusion persists — now generating new failure modes (GSAP timing vs scene visibility)      |
| Reading burden (~40% of time)  | —                | huly + raycast: 40% of session just reading docs                                                  |

---

## Fixed from v2 → v3

| Issue                                        | Fix                                 | Result                                                                       |
| -------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------- |
| HyperShader CSS crossfade throws "undefined" | Made `shader?` optional             | No agents hit this in v3                                                     |
| Snapshot captures loading screen             | `__hf.shaderTransitions.ready` wait | Mercury confirmed: snapshot issue was different pattern, not loading screen  |
| SFX overuse / assigned at build time         | Moved to step 3                     | Agents used fewer SFX and with better timing in v3                           |
| Storyboard timing ≠ TTS duration             | Reconciliation gate in step 4       | Agents handled Kokoro compression better (restructured instead of panicking) |
| Captions stacking                            | opacity:0 rule in step 5            | Not reported as issue in v3                                                  |
| WCAG false positive                          | data-layout-ignore documented       | Not reported in v3                                                           |

---

## Priority Action Items (v3 → v4)

| Priority | Issue                                                  | Action                                                                              |
| -------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| P0       | `<script>` outside `<template>` → null queries         | Document in hyperframes SKILL.md + sub-agent RULES + techniques.md                  |
| P0       | CSS `<style>` inside `<template>` unreliable           | Add inline-styles rule to sub-agent template                                        |
| P1       | GSAP timing vs HyperShader scene visibility            | Document canonical pattern for beat entrance animations with HyperShader            |
| P1       | Stale transcript.json in repo root (CLI writes to CWD) | Fix CLI bug: write next to input file                                               |
| P1       | Sub-agents `../capture/` still failing despite RULES   | Try different enforcement — e.g. include full absolute project path in brand values |
| P2       | SVG `getTotalLength()` null crash                      | Add explicit null guard example in sub-agent RULES                                  |
| P2       | Preview CLI path doubling                              | Fix CLI bug                                                                         |
| P2       | Reading burden 40% of session time                     | Cut/consolidate skill reference files                                               |
| P2       | HeyGen TTS API shape mismatch                          | Verify actual API response, update step-4-vo.md                                     |
| P3       | Font hashing — no family→filename mapping              | Capture pipeline fix                                                                |
| P3       | AGENTS.md ReferenceError                               | Fix CLI bug                                                                         |

---

_Collected: May 16, 2026_
