# Design Picker

Two-phase visual picker: mood boards first (pick a complete direction), then fine-tune individual categories.

## Prerequisites

Read these before generating options — they define the rules your options must follow:

- [typography.md](typography.md)
- [../house-style.md](../house-style.md)
- [video-composition.md](video-composition.md)
- [../visual-styles.md](../visual-styles.md)
- [beat-direction.md](beat-direction.md)

## Using brief answers

If the Brief step (SKILL.md) gathered answers, use them to constrain picker generation:

| Brief answer | How it constrains the picker |
|---|---|
| **Audience** | Architecture density and type scale. Developers → monospace accents, data-dense, tight spacing. Executives → large type, breathable layouts. Consumers → bold, kinetic, visual-first. |
| **Emotion** | Mood board clustering. Don't spread boards across the full emotional spectrum — cluster them around the target emotion with meaningful variations within that zone. |
| **Brand assets** | If the user has existing colors/fonts/logo: palettes must derive from their brand colors (generate complementary variations, not replacements). Type pairings must include their font. Architecture previews should incorporate their logo or product imagery. If no assets: full creative freedom. |
| **Light/dark** | Palette polarity. If specified, all palettes should respect it — don't waste 3 of 6 slots on the wrong polarity. |
| **Surface** | Architecture layout and motion energy. Social → vertical-friendly, large text floors (24px+ body), high energy. Website hero → landscape, ambient/looping. Presentation → widescreen, structured hierarchy. |
| **Key takeaway** | Architecture focal hierarchy. The takeaway should be the most prominent element in every architecture preview — biggest type, strongest contrast, most visual weight. |

If no brief was gathered (user jumped straight to picker, or request was specific enough to skip), generate from the prompt alone.

## Building the picker

1. Generate options **deeply contextual to the user's prompt and brief answers**. Every category — not just architectures — must reflect the specific product, brand, audience, and mood. Generic options that could appear on any picker are a failure.

   **Mood boards** — as many as the creative space warrants (4-8). Every board must tell a different STORY about the brand, not just reshuffle the same elements. Ask: "what are the genuinely different ways to position this product?" A cat food brand might be: playful chaos, premium positioning, comfort/cozy, social-native, flavor showcase, humor-led, sensory/appetizing. Each is a different narrative, not a different font on the same layout.

   **Verbalized sampling — apply all of these when generating boards:**

   1. **Probability awareness:** Generate 8-10 boards. For each, estimate how likely you were to produce it (high/mid/low mode). Keep at least 2 low-mode boards in the final set. The boards you almost didn't generate are often the most interesting.

   2. **Creative modes:** Ensure boards come from genuinely different creative modes — not just color swaps. At least one board should be: formally rigorous (Swiss grid, strict hierarchy), one emotionally driven (the feeling before the content), one unconventional (breaks an assumption in the brief), one speculative (what if the brand was something else entirely?).

   3. **Optimize for different things:** At least one board should optimize for visual impact over readability, one for data density over aesthetics, one for emotional resonance over information. These competing objectives produce boards that look fundamentally different.

   4. **Anti-mode-collapse check:** After generating all boards, verify no two follow the same template. If two boards are "dark bg + colored accent + big stat + small labels" with different colors, one is redundant. Every board must differ on at least 2 of: layout structure, visual metaphor, density level, typography approach, color strategy.

   5. **The unlikely-but-valid board:** After your main set, generate 1 additional board that a typical model would almost never produce for this brief. Describe WHY it's atypical. Include it if it's genuinely interesting; discard if it's just weird. The act of generating it breaks you out of the local optimum.

   6. **Reasoning paths:** For the 2 most different boards, briefly note the reasoning path that led there. "I started from the audience (investors want data density) → mission control aesthetic → monospace everything" vs. "I started from the emotion (awe) → cinematic title sequence → one giant number, nothing else." Different starting points produce different destinations.

   If every board feels safe, you're mode-collapsed — push until at least one makes you uncomfortable.

   **Architectures** — one per mood board minimum, each visually distinct. Use `{{prompt_headline}}` and `{{prompt_sub}}` tokens. If the user provided media assets, use them as background images (use `url(path)` without quotes — single quotes inside `style='...'` break the attribute).

   **Palettes** (5-6) — named after the brand's world, not generic moods. The palette names and colors should feel like they belong to THIS specific product. Always mix dark + light + tinted. **Every palette must be visually distinct at swatch size.** If two palettes share the same background lightness AND a similar accent hue, cut one. Test: would a user see the difference in a 14px swatch chip? If not, they're duplicates.

   **Type pairings** (5-6) — **RUN the font discovery script from typography.md BEFORE generating pairings.** This is not optional. Download Google Fonts metadata, run the script, and pick from its output. You will otherwise reach for the same 8 fonts every time (Bricolage Grotesque, Instrument Serif, Fraunces, Archivo Black, DM Serif Display, Space Grotesk, Fredoka) — that's your training data default, not a contextual choice. Match the brand's energy and audience. Cross-category per typography.md (never two sans-serifs).

2. `mkdir -p .hyperframes` then copy [../templates/design-picker.html](../templates/design-picker.html) to `.hyperframes/pick-design.html`.
3. Replace these placeholders using Python (don't hand-escape quotes in sed):
   - `__ARCHITECTURES_JSON__` — array of architecture objects
   - `__PALETTES_JSON__` — array of palette objects
   - `__TYPEPAIRS_JSON__` — array of type pairing objects
   - `__MOODBOARDS_JSON__` — array of mood board objects (see format below)
   - `__PROMPT_JSON__` — object with prompt context (see format below)

### Architecture data format

Each architecture object must include a `preview_html` field — the HTML that renders in the preview panel. Use token placeholders that the template replaces at runtime: `{{bg}}`, `{{fg}}`, `{{ac}}`, `{{mt}}`, `{{hf}}`, `{{hw}}`, `{{bf}}`, `{{bw}}`, `{{cr}}` (corner radius), `{{pad}}`, `{{gap}}`, `{{shadow}}`, `{{g}}` (grid line color), `{{fg3}}`/`{{fg6}}`/`{{fg8}}`/`{{fg15}}` (fg at opacity), `{{ac3}}`/`{{ac5}}`/`{{ac25}}` (accent at opacity).

**Use tokens where they apply.** Not every architecture needs every token — a minimal 3-element layout won't have cards or buttons. Tokens that aren't used in a preview simply won't have a visible effect when the user changes that option in Phase 2, which is fine for architectures where that category doesn't apply.

**Density should match the concept.** A data-dense blueprint needs many elements. An extreme-negative-space direction needs 3-4. The preview should look like a frame from the actual video, not a UI component showcase. If every architecture has the same element list in the same order, the concepts are visually identical despite different colors — that's the problem.

Optionally include `components` (component styling rules) and `dos` (do's and don'ts) as strings — these appear in the generated design.md.

**Layout constraint:** All preview HTML must use percentage widths or `max-width: 100%`. Use `flex-wrap: wrap` on all flex rows. Absolute-positioned decoratives must stay within a parent with `overflow: hidden`.

**Security:** Architecture `preview_html` must not contain `<script>` tags, event handlers (`onclick`, `onerror`, etc.), or `javascript:` URLs. It is injected via `innerHTML`.

**Image URLs:** When using background images in `preview_html`, use `url(path/to/image.jpg)` WITHOUT quotes around the path. Single quotes like `url('path.jpg')` break because `preview_html` is inside a `style='...'` attribute — the inner single quotes terminate the outer attribute.

**Palette variety:** Always include a mix of light, dark, and tinted backgrounds across the 6 palettes — even for calm/wellness prompts.

### Structural diversity

**No two architectures should share the same layout shape.** After generating all architectures, check: if you drew only the bounding boxes of major elements (ignoring text, color, font), would each architecture produce a different silhouette? If two look like the same wireframe, one is redundant.

Layout shapes to draw from (not exhaustive — invent others):
- Centered column (overline → headline → body) — use at most ONCE across all architectures
- Split horizontal (content left, data right, or vice versa)
- Bottom-anchored (content pinned to bottom 40% of frame, top is empty/atmospheric)
- Grid of equal-weight blocks (no hierarchy — everything same size)
- Single dominant element (one number/word fills 60%+ of frame, tiny supporting text)
- List/table (structured rows, no cards, no headline)
- Diagonal or asymmetric (content offset to one corner, rest is space)
- Timeline/horizontal axis (content pinned along a line)

The preview_html for each architecture is a 1920×1080 frame. Use the full frame — not just a centered column in the middle. Content can be pinned to edges, split into zones, arranged in grids, or clustered in one corner with the rest empty.

### Example architecture objects

Three structurally different examples showing how the same token system produces completely different layouts:

**Split horizontal:**
```json
{
  "name": "Split Briefing",
  "preview_html": "<div style='width:1920px;height:1080px;display:flex;'><div style='flex:1;background:{{bg}};padding:80px;display:flex;flex-direction:column;justify-content:center;gap:16px;'><div style='font-family:\"{{hf}}\",sans-serif;font-weight:{{hw}};font-size:64px;color:{{fg}};'>{{prompt_headline}}</div><div style='font-size:20px;color:{{mt}};'>{{prompt_sub}}</div></div><div style='flex:1;background:{{fg6}};padding:80px;display:flex;flex-direction:column;justify-content:center;gap:12px;'><div style='display:flex;justify-content:space-between;padding:16px 0;border-bottom:1px solid {{g}};'><span style='color:{{mt}};'>Metric</span><span style='color:{{ac}};font-weight:800;'>Value</span></div></div></div>"
}
```

**Single dominant element:**
```json
{
  "name": "Monolith",
  "preview_html": "<div style='width:1920px;height:1080px;background:{{bg}};display:flex;flex-direction:column;justify-content:flex-end;padding:100px;'><div style='font-family:\"{{hf}}\",sans-serif;font-weight:{{hw}};font-size:240px;color:{{ac}};line-height:0.8;'>2.4M</div><div style='font-size:16px;color:{{mt}};letter-spacing:0.2em;margin-top:16px;'>THE ONLY NUMBER THAT MATTERS</div></div>"
}
```

**Grid of equal blocks:**
```json
{
  "name": "Evidence Wall",
  "preview_html": "<div style='width:1920px;height:1080px;background:{{bg}};padding:40px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;'><div style='background:{{fg6}};padding:32px;display:flex;flex-direction:column;justify-content:center;'><div style='font-family:\"{{hf}}\",sans-serif;font-weight:{{hw}};font-size:48px;color:{{ac}};'>Fact 1</div></div><div style='background:{{fg6}};padding:32px;display:flex;flex-direction:column;justify-content:center;'><div style='font-size:20px;color:{{fg}};'>Supporting detail</div></div><div style='background:{{fg6}};padding:32px;display:flex;flex-direction:column;justify-content:center;'><div style='font-family:\"{{hf}}\",sans-serif;font-weight:{{hw}};font-size:48px;color:{{fg}};'>Fact 2</div></div></div>"
}
```

### Mood board data format

Each mood board pre-selects one option from each category. The user picks a mood board in Phase 1, then fine-tunes in Phase 2 with those selections pre-filled.

```json
{
  "name": "Terminal Precision",
  "description": "Code-forward, data-dense, CLI energy. Dark canvas, monospace body, sharp corners.",
  "theme": "dark",
  "arch_index": 0,
  "palette_index": 0,
  "type_index": 0,
  "corners_index": 0,
  "density_index": 0,
  "depth_index": 1,
  "easing_index": 0,
  "corners": "0px",
  "padding": "12px",
  "gap": "8px",
  "shadow": "0 2px 16px rgba(0,230,255,0.15)"
}
```

Indices reference into the ARCHITECTURES, PALETTES, and TYPEPAIRS arrays. The template renders a mini preview of each mood board using its architecture's `preview_html` with the mood board's palette/type applied.

### Prompt context data format

```json
{
  "title": "AI Coding Assistant",
  "headline": "Your Code, Understood.",
  "subline": "An AI coding assistant that reads your entire codebase.",
  "section_desc": "Layout options for your product launch"
}
```

`title` appears in the Phase 1 header. `headline` and `subline` replace `{{prompt_headline}}` and `{{prompt_sub}}` in architecture preview_html so previews show real content.

### Content tokens in preview_html

In addition to the standard design tokens (`{{bg}}`, `{{fg}}`, `{{ac}}`, etc.), architecture `preview_html` can use:

- `{{prompt_headline}}` — the user's actual headline text
- `{{prompt_sub}}` — the user's actual subline text

This makes previews contextual — the user sees their own content styled, not generic placeholders.

## Serving and user selection

4. Serve and auto-open: `cd <project-dir> && python3 -m http.server 8723 &` (use port 8723 or any unused port above 8000; if the curl check fails, try the next port). Verify: `curl -s -o /dev/null -w "%{http_code}" http://localhost:8723/.hyperframes/pick-design.html` — only proceed if it returns 200. Then open it: `open http://localhost:8723/.hyperframes/pick-design.html` (macOS) or `xdg-open` (Linux). Do NOT use `npx hyperframes preview` for the picker — it blocks. Only start the HTTP server from the main conversation thread. If you are running as a dispatched task or subagent, return the file path and let the caller serve it.
5. Once the user picks, tell them: "Copy the design.md from the picker and paste it here." The user pastes the markdown back into the conversation. Save it verbatim to `design.md` in the project root — it's already in spec format (YAML frontmatter + prose sections). After the user pastes, kill the background server: `kill %1` or `kill $(lsof -ti:8723)`. Then proceed with construction.

The picker outputs a [google-labs-code/design.md](https://github.com/google-labs-code/design.md) spec-compliant file: YAML frontmatter with `colors`, `typography`, `rounded`, and `spacing` tokens, followed by `## Overview`, `## Colors`, `## Typography`, `## Layout`, `## Elevation`, `## Components`, and `## Do's and Don'ts` prose sections.
