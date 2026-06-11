# Standard mode — how this skill runs these templates

The 54 files in `templates/` (+ `_anatomy.md`, `_motion.md`) are the **design library** for Standard mode:
a flowing verbatim **rail** (their "flow") + one **embed** climax (their "climax"), matted speaker, one
paused seek-safe GSAP timeline. **This file is the one override you must read** — it adapts that library
to THIS skill's pipeline. Where this file and `_anatomy.md` disagree, **this file wins.**

## 3 things differ from `_anatomy.md` (read this, then use the library freely)

1. **Matte = this skill's `matte.cjs` (PP-MattingV2), not `remove-background`.** Ignore the
   `hyperframes remove-background` / `person.webm` / `.cut` layer in `_anatomy.md`. This skill mattes with
   `scripts/matte.cjs` (PP-MattingV2 → `frames_fg/*.png`) and composites the subject **in post** via
   `render-and-composite.sh`. **Never put the person in the HTML.**
2. **Contract = ours.** Not `.stage` / `window.__timelines['cap-{id}']`. Use `#root[data-composition-id="main"]`
   + `#a-roll` (the source video = their z0 background plate) + `#stage` + `#a-roll-audio` +
   `window.__timelines["main"]`. Same seek-safe rules (no `Math.random`/`Date.now`/CSS-keyframes/`repeat:-1`).
3. **Two files, not one** (this is how the rail ends up *in front* of the subject while the climax sits *behind*):
   - **`index.html`** — the source video + the **embed climax** in `#stage`. The subject matte overlays this, so
     the subject occludes the climax (their z1 "behind the speaker").
   - **`rail.html`** — the **rail** (flow) only, transparent background, no video, no climax. Rendered to a
     transparent WebM and alpha-composited **on top of** the matte, so the rail is never occluded
     (their z6 "in front, lower third"). `render-and-composite.sh` does this automatically when `rail.html` exists.

Everything else in the library carries over **unchanged**: the per-template **style tokens**
(`--ff` / `--cfill` / `--cacc`, climax fill/stroke), the named **FLOW_*/CLIMAX_* motion recipes** in `_motion.md`,
`cqh` sizing, exit ≈ 75% of entry, **climax dwell ≥ 1 s**, and the restraint rule (effects only at the climax;
the rail stays clean + active-word accent).

## Pipeline (Standard) — author JSON, compile, never hand-write the HTML

```
1. hyperframes init <project> --non-interactive --video <video.mp4> --skip-skills
2. bash scripts/prepare.sh <project>          # matte ∥ transcribe → safe-zones (one command)
3. [AGENT] pick up to 3 templates by transcript fit (their `## Triggers`) → take their STYLE
   TOKENS; author <project>/standard.json (schema below — your creative choices only)
4. node scripts/make-standard.cjs <project>   # compiles → index.html + rail.html + derived plan.json
5. node scripts/preview-frames.cjs <project>  # seconds-cheap visual QA (SKILL.md § Visual QA)
6. bash scripts/render-and-composite.sh <project>  # gates (timing/occlusion+hero/overflow/hand-off) → final.mp4
```

## `standard.json` — the schema (this is what you author)

```jsonc
{
  "template": "didone",                  // which library template the tokens came from
  "width": 1920, "height": 1080, "fps": 30,
  "font": "Bodoni Moda",                 // climax font — LITERAL family name (injector embeds it)
  "rail_font": null,                     // optional rail override (only for unreadable display faces)
  "cfill": "#f4efe6", "cacc": "#caa14a", // fill + active-word accent (the template's tokens)
  "climax_css": "font-style:italic;",    // optional extra CSS on the climax (template tokens)
  "rail_css": "",                        // optional extra CSS on rail lines
  "rail": {
    "bottom_pct": 9, "width_pct": 90, "font_cqh": 6.4,
    "lines": [["You","need","to"], ["judge","us","by","the"], ["actions","that","we","take."],
              ["I","think","the","company"], ["has","taken","a","number","of","actions"],
              ["over","its","time."]]
    // EVERY spoken word you want captioned, in spoken order, grouped 2-5 words/line at
    // clause/breath boundaries. Include the promoted word where it is spoken — the compiler
    // lifts it out and generates the hand-off. Words must match the transcript verbatim.
  },
  "climax": {
    "match": "actions",                  // the promoted word (as written in rail.lines)
    "occurrence": 2,                     // WHICH occurrence in the lines (duplicate words!)
    "text": "ACTIONS",                   // display form (usually uppercase)
    "top_pct": 36, "font_cqh": 34,       // placement: centered, crossing the subject (safe-zones heroAnchor)
    "entrance": "rise",                  // rise | scale-settle | pop
    "exit": "rise-off",                  // rise-off | fade | shrink-off
    "hold": "thought"                    // "thought" = hold to end of sentence (the hand-off); or seconds
  }
}
```

**What the compiler guarantees** (so you don't have to): word timings from the transcript by
sequence (duplicates pair by position); rail lines pre-empt each other (no overlap); the
rail↔climax hand-off (promoted word appears ONCE; pre-line freezes; climax anchors across the
page-flip to the end of its thought); canvas duration = source length; climax line-fit; seek-safe
GSAP in both files; gates wired (the derived plan.json runs timing + occlusion + hero checks).
**Change standard.json and recompile — never edit the generated HTML.**

## Appendix — hand-author fallback: `index.html` skeleton (only if the compiler can't express your design)

```html
<!doctype html><html lang="en"><head><meta charset="UTF-8">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:{{W}}px;height:{{H}}px;overflow:hidden;background:#000}
  #a-roll{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 12%;z-index:1}
  #stage{position:absolute;inset:0;z-index:2;container-type:size;pointer-events:none}   /* cqh works off this */
  /* CLIMAX — big, behind the subject (subject matte occludes it in post). _anatomy §3 base + the template's tokens.
     ⚠ font-family MUST be the template's LITERAL name (e.g. 'Anton', 'Bangers', 'Oswald'). The render pipeline
     scans for literal family names and auto-embeds the matching @font-face — a CSS var (var(--ff)) is NOT seen,
     so it silently falls back to a generic sans and the whole look dies. Always write the literal name. */
  .climax{position:absolute;left:50%;top:37%;transform:translate(-50%,-50%);white-space:nowrap;
    font-family:'Oswald',sans-serif;          /* ← the template's font, LITERAL (never var()) */
    line-height:1.18;font-weight:900;font-size:44cqh;text-transform:uppercase;
    color:var(--cfill);text-shadow:0 2px 13px rgba(0,0,0,.6),0 0 48px rgba(0,0,0,.42);
    -webkit-text-stroke:1px rgba(0,0,0,.5);paint-order:stroke fill}     /* stroke for lit scenes (_anatomy §3) */
  .climax span{display:inline-block;opacity:0}
  .stage-tokens{--cfill:#e9e6dd;--cacc:#e3c06a}                         /* ← the template's fill/accent (colours only) */
</style></head><body class="stage-tokens">
  <div id="root" data-composition-id="main" data-start="0" data-duration="{{DUR}}" data-width="{{W}}" data-height="{{H}}">
    <video id="a-roll" src="source.mp4" muted playsinline data-start="0" data-duration="{{DUR}}" data-track-index="0" style="z-index:1"></video>
    <div id="stage"><div class="climax"><span>{{CLIMAX_WORD}}</span></div></div>
    <audio id="a-roll-audio" src="source.mp4" data-start="0" data-duration="{{DUR}}" data-track-index="3" data-volume="1"></audio>
  </div>
  <script>
    window.__timelines=window.__timelines||{};
    const tl=gsap.timeline({paused:true});
    const climax=document.querySelector('.climax span');
    const T={{CLIMAX_AT}}, HOLD={{CLIMAX_HOLD}};            // HOLD ≥ entranceDur + 1s
    tl.add(()=>{}, 0);                                       // ensure t=0 state
    tl.add(CLIMAX_IN(climax), T);                            // _motion.md recipe (e.g. deblur)
    tl.add(CLIMAX_OUT(climax), T+HOLD);                      // ends opacity:0
    window.__timelines["main"]=tl;
  </script>
</body></html>
```

## Appendix — hand-author fallback: `rail.html` skeleton

Same `#root`/timeline contract, but **transparent**, **no `#a-roll` video**, **no climax** — plus the `.grade`
vignette. Words injected from `transcript.json`, revealed at each word's `start`; the active word is recoloured to
`--cacc` via a `color` set (not a class — className isn't seek-safe). Lower third.

```html
<!doctype html><html lang="en"><head><meta charset="UTF-8">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:{{W}}px;height:{{H}}px;overflow:hidden;background:transparent}
  /* .grade — the anatomy's z5 vignette (depth + legibility). Composites over the matte, under the flow.
     KEEP IT — dropping it makes the result look flat/washed. A soft radial darken, NOT a full-frame solid bar. */
  .grade{position:absolute;inset:0;z-index:1;pointer-events:none;
    background:radial-gradient(130% 100% at 50% 28%, transparent 42%, rgba(0,0,0,.6))}
  #stage{position:absolute;inset:0;z-index:2;container-type:size}
  .flow{position:absolute;left:50%;bottom:9%;transform:translateX(-50%);width:90%;height:16%}
  .line{position:absolute;left:0;right:0;bottom:0;text-align:center;
    font-family:'Oswald',sans-serif;          /* ← the template's font, LITERAL (never var(); see climax note) */
    line-height:1.15;font-weight:700;font-size:6.4cqh;color:var(--cfill);
    text-shadow:0 2px 10px rgba(0,0,0,.65)}                 /* glyph-local scrim; NEVER a full-frame bar */
  .line .w{display:inline-block;opacity:0;margin:0 .12em;color:var(--cfill)}
  .stage-tokens{--cfill:#e9e6dd;--cacc:#e3c06a}             /* ← same fill/accent as index.html */
</style></head><body class="stage-tokens">
  <div id="root" data-composition-id="main" data-start="0" data-duration="{{DUR}}" data-width="{{W}}" data-height="{{H}}">
    <div class="grade"></div>
    <div id="stage"><div class="flow"></div></div>
  </div>
  <script>
    window.__timelines=window.__timelines||{};
    const tl=gsap.timeline({paused:true});
    const flow=document.querySelector('.flow');
    const _cs=getComputedStyle(document.body);
    const CFILL=(_cs.getPropertyValue('--cfill').trim()||'#fff'), CACC=(_cs.getPropertyValue('--cacc').trim()||'#10A37F');
    // WORDS = transcript grouped into lines [{words:[{text,start}], end}] in scene-local seconds
    // (2–4 words/line; non-overlapping windows — line.end ≤ next line's first word.start).
    const WORDS={{WORDS_JSON}};
    const FLOW_IN=(w)=>gsap.fromTo(w,{opacity:0,y:14},{opacity:1,y:0,duration:.42,ease:'power3.out'}); // _motion.md
    // Build EVERY line up-front as its own stacked container. Do NOT swap flow.innerHTML
    // per line — that runs synchronously at construction, leaving only the last line in the
    // DOM (earlier FLOW_IN tweens point at detached nodes). Separate containers = seek-safe.
    WORDS.forEach((line,li)=>{
      const div=document.createElement('div'); div.className='line';
      div.innerHTML=line.words.map((w,i)=>`<span class="w" data-i="${i}">${w.text}</span>`).join(' ');
      flow.appendChild(div);
      const spans=[...div.querySelectorAll('.w')];
      spans.forEach((el,i)=>{const w=line.words[i];
        tl.add(FLOW_IN(el), w.start);
        tl.set(spans,{color:CFILL}, w.start);   // reset prior active word — set COLOR, not className
        tl.set(el,{color:CACC}, w.start);});     // current word = accent (className sets aren't seek-safe)
      // Clear the line by fading its CONTAINER (not the spans). The container sits
      // at opacity 1 until here, so the tween can't degenerate into a 0→0 no-op the
      // way a span exit colliding with that span's own reveal would (which leaves a
      // word stuck on). Completes before the next line's first word → never two at once.
      const nextStart = WORDS[li+1] ? WORDS[li+1].words[0].start : null;
      const exitAt = nextStart!=null ? Math.max(line.words[0].start+0.1, nextStart-0.22) : line.end;
      tl.to(div,{opacity:0,duration:.22,ease:'power2.in'}, exitAt);             // line gone, stays gone
    });
    window.__timelines["main"]=tl;
  </script>
</body></html>
```

## Rail ↔ climax hand-off (the promoted word appears exactly once)

The embed climax is a **promoted** word — lifted OUT of the rail into the hero layer. It must therefore
**never also be revealed in the rail.** The same word showing big behind the subject AND in the lower-third at
once reads as a bug. Author rail + climax as a page-flip that **pivots on the promoted word**, with the climax as
the sentence's persistent anchor.

Worked example — *"She said she **LOVES** being treated like a girl."* (LOVES = climax):

| when | rail (lower-third) | climax (behind subject) |
|---|---|---|
| "She said she" spoken | reveals `She said she` (karaoke) | — |
| **"LOVES" spoken** | **freezes** — holds `She said she`, does **NOT** reveal LOVES | **`LOVES` enters** (big) |
| "being…" spoken | clears `She said she`, starts a fresh line `being treated like a girl` | `LOVES` **keeps holding** |
| "…girl" (thought ends) | (clears / next sentence) | **`LOVES` exits** |

The promoted word is the **visual anchor of the whole thought**: it enters on its own beat and **holds across the
rail's page-flip**, exiting only when the sentence completes. The rail pages through the *non-peak* words beneath
it. `LOVES` appears once (in the climax), never in the rail.

Authoring contract:
- **`rail.html`** splits the sentence at the promoted word into segment A (pre-climax words) + segment B
  (post-climax words). A reveals normally, then **holds** (no further reveal) from the climax's entrance until
  B's first word; at that word A **clears** and B reveals. **Neither segment ever contains the promoted word.**
- **`index.html`**: climax `in` = the promoted word's spoken `start`; climax `out` = the **end of the thought**
  (after segment B's last word) — *not* the promoted word's own end. So `HOLD` spans the page-flip, not just the word.
- Gate: `scripts/check-rail-climax.cjs` fails the render if the promoted word is visible in the rail during the
  climax's on-screen window. Override with `RAIL_CLIMAX_SKIP=1` only for a deliberate exception.

## Notes

- **Media `src`:** reference the video as `src="source.mp4"` — the skill guarantees that name. (The render harness also links the project's media into the render shadow under their real names, so the `hyperframes init` scaffold's original filename resolves too; `source.mp4` is just the portable choice. Don't edit the scaffold in place expecting its raw filename — author from this skeleton.)
- **No `plan.json` in Standard mode** → the template-mode gates (`check-timing`, `check-occlusion`) don't run; `render-and-composite.sh` runs `check-overflow.cjs` on **both** `index.html` and `rail.html` (warning-only).
  Self-check: rail words verbatim & on the beat (≤80ms); one embed per beat; the promoted word is **handed off**
  (never shown in the rail — see *Rail ↔ climax hand-off*); climax holds to the end of its thought and exits at
  `opacity:0`. `check-overflow.cjs` (warning) + `check-rail-climax.cjs` (fails on a duplicated promoted word) run automatically.
- **Rail legibility** is glyph-local only — a soft shadow or a text-box scrim. **Never grade/recolor the video**
  and never lay a full-frame bar (this skill's hard rule).
- **One embed at a time**, spaced ≥ a beat apart. The promoted word is **handed off, never duplicated** in the
  rail (see *Rail ↔ climax hand-off* above); if the embed and rail boxes would overlap *spatially*, the rail can
  briefly dim/clear under the embed.
- **⚠ Fonts are deterministic + must be LITERAL.** Every template font renders OFFLINE — but via two different
  mechanisms. hyperframes auto-supplies its ~18 canonical fonts (`'Inter'`, `'Oswald'`, `'Poppins'`,
  `'Playfair Display'`, `'Archivo Black'`, `'JetBrains Mono'`, …). The other 21 template faces (`'Anton'`,
  `'Bangers'`, `'Creepster'`, `'Monoton'`, `'VT323'`, `'Press Start 2P'`, `'Teko'`, `'Cinzel'`, `'Caveat'`, …)
  are bundled in this skill (`modes/standard/fonts/fonts.css`, base64 woff2) and `scripts/inject-fonts.cjs`
  inlines the `@font-face` for whichever families your HTML uses — automatically, before the gates + render.
  **For this to fire, `font-family` must be the LITERAL family name.** A CSS `var(--ff)` is invisible to both the
  hyperframes resolver AND the injector → it silently falls back to a generic sans, **the single biggest way a
  Standard render ends up looking nothing like the template.** Never put the font in a var; never rely on a
  Google-Fonts `<link>` (flaky network dep, and it fails in offline/CI renders). Just write the literal name —
  the pipeline handles the rest. (To add a NEW font: drop its `-latin-<wt>-normal.woff2` into
  `modes/standard/fonts/files/` and re-run `node modes/standard/fonts/build-fonts-css.cjs`.)
- **Carry the template's design — don't sanitise it into generic defaults.** A small white Inter rail with a
  plain fade is NOT the template; next to the standalone it looks broken. The rail uses the **template's** font,
  size, palette (`--cfill`/`--cacc`) and `FLOW_IN`, and keeps the **`.grade`** vignette. Swap the rail font to a
  clean sans (Inter) ONLY for a truly decorative display face (Monoton / Press Start 2P / Special Elite / Arcade)
  that can't carry a running line — the climax keeps the display face.
- 16:9 climax base `44cqh`; long words bleed off-frame (intended cinematic); a 3-char climax behind a centred
  subject needs the stroke (above) so it peeks.
- **Keep the climax crisp.** A blur entrance (`deblur` / blur-in from `_motion.md`) leaves a big hero word soft
  for a large fraction of a short (~2s) dwell — it reads as a defect, not a move. Prefer a crisp scale/rise
  entrance unless the dwell is long. The settled hold must be sharp.
- **Rail lines must not overlap.** On continuous speech the next line's first word lands ~immediately after the
  previous line ends, so a line's exit has to *complete before* the next begins (the skeleton pre-empts it at
  `nextStart − dur`). Group at clause/breath boundaries to give the swap room; never let two lines co-exist.
