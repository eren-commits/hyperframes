# THE CATALOG — one front-end, three engines behind

This is the skill's single selection surface. **The user picks an IDENTITY from
this table; everything else (engine, compiler, authoring file) is derived by
lookup — never ask the user (or yourself) "Standard or Cinematic or Theme?"**
Those are backend names; a product has one UX even when it has several engines.

Routing procedure (replaces any mode decision):

1. Probe the clip (decision gate + pre-flight probes as in SKILL.md).
2. Shortlist 2–3 identities from this table by **content register + the user's
   own words + scene constraints**.
3. Recommend ONE with a one-line why; the user picks.
4. Author the identity's file (last column), then render with its engine's
   pipeline. Done — no category question ever surfaced.

## Identities

| Identity         | Reading surface                               | Voice (one line)                                              | Recommend for                                                                     | Scene needs                                                | Author → engine                 |
| ---------------- | --------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------- |
| `keynote · rail` | verbatim lower-third rail + 1 embedded climax | opaque white type, surgical wipe reveals                      | product walkthroughs, launches, tech explainers **where every word must be read** | any (rail is opaque)                                       | standard.json → make-standard   |
| `cream · rail`   | verbatim rail + 1 embedded climax             | warm light-condensation type                                  | introspective / narrative voiceover **where every word must be read**             | dark/mid warm scenes                                       | standard.json → make-standard   |
| `cream`          | scene-embedded column flow                    | warm poetic light, emergence + glow                           | introspective, narrative, emotional monologues                                    | dark/mid-tone warm scenes (luma < 150)                     | cinematic.json → make-cinematic |
| `ink`            | scene-embedded column flow                    | letterpress pressed into bright surfaces                      | the bright scenes everything else washes out on                                   | BRIGHT scenes (luma > 150)                                 | cinematic.json → make-cinematic |
| `editorial`      | scene-embedded column flow                    | lowercase italic serif, pen-stroke glides                     | fashion / beauty / lyrical / premium brand films                                  | mid/dark scenes                                            | cinematic.json → make-cinematic |
| `keynote`        | scene-embedded column flow                    | confident centered slides-in-the-scene                        | launches, founder updates, tech explainers (mood over verbatim reading)           | any mid/dark                                               | cinematic.json → make-cinematic |
| `documentary`    | scene-embedded column flow                    | burn-in stillness, bone on charcoal                           | interviews, journalism, testimony — gravitas IS the style                         | any                                                        | cinematic.json → make-cinematic |
| `loud`           | scene-embedded, body in front                 | percussion type that competes with the face                   | hype, social reels, sport, music, motivational                                    | any (counter-accent handles warm)                          | cinematic.json → make-cinematic |
| `neon`           | scene-embedded column flow                    | captions as neon signage in the dark                          | cyberpunk / nightlife / tech-noir / music                                         | dark scenes                                                | cinematic.json → make-cinematic |
| `glitch`         | scene-embedded column flow                    | corrupted-feed RGB-split type                                 | hacker / AI / dystopia content                                                    | mid/dark                                                   | cinematic.json → make-cinematic |
| `chrome`         | scene-embedded column flow                    | liquid-metal hero with sheen sweeps                           | fashion-tech, Y2K, product-flex                                                   | mid/dark                                                   | cinematic.json → make-cinematic |
| `velocity`       | scene-embedded column flow                    | every word arrives along its motion vector                    | sport, automotive, fitness, kinetic content                                       | any mid/dark                                               | cinematic.json → make-cinematic |
| `ordnance`       | stamped verbatim rail + detonation apex       | military marking system; everything has mass; the room reacts | punchy announcements, drops, "炸一点 / 像 AE 做的" asks                           | any (charge-dim makes its own contrast)                    | theme.json → make-theme         |
| `terminal`       | typed console panel + glyph-decode apex       | the transcript is a signal log; apex decodes from noise       | tech / data / AI / investigative, "终端/控制台/解码" asks                         | cool/dusk preferred                                        | theme.json → make-theme         |
| `neonsign`       | warm tube rail + hand-written neon apex       | a sign district at dusk; the apex is WRITTEN stroke by stroke | lifestyle / music / mood, "霓虹/手写" asks                                        | dusk/dark backdrop; needs `python3` (stroke-path gen)      | theme.json → make-theme         |
| `stardust`       | accumulating poem, condensing letters         | words condense from dust and return to it                     | poetic / memory / science-wonder monologues                                       | one clear column side (probe fails → fall back to `cream`) | theme.json → make-theme         |
| `stomp`          | full-frame takeover cards                     | hard-cut typographic takeover with a void before the drop     | hooks, manifestos, ad openers — the words ARE the show                            | any (plate runs dimmed)                                    | theme.json → make-theme         |

## Shortlisting heuristics (identity-level, not category-level)

- **"每个词都要被读到 / accessibility / 教程·新闻"** → rail or panel surfaces:
  `keynote · rail`, `cream · rail`, `ordnance`, `terminal` (all verbatim by construction).
- **"嵌进场景 / 电影感 / 高级"** → the column-flow ten; pick by register + scene luma
  (bright → `ink`; warm dark → `cream`; fashion → `editorial`; …).
- **"炸 / 特效 / 酷炫 / 像 AE"** → `ordnance`, `stomp`, `terminal`, `loud` — pick by
  what should explode: a word (`ordnance`), the frame (`stomp`), a decode (`terminal`),
  every beat (`loud`).
- **Named worlds** → direct hits: 控制台/终端 → `terminal`; 霓虹/招牌 → `neonsign`;
  诗/星尘/记忆 → `stardust`; 军事/重击 → `ordnance`.
- **Scene constraints veto last**: luma > 180 kills cream/screen column looks
  (→ `ink` or a rail/panel surface); dusk/dark unlocks `neon`/`neonsign`.
- **Unsure** → `keynote · rail` (the conservative default: words read, scene safe).

Adjacencies worth knowing (these pairs are why the old mode question was hard —
recommend by the difference, don't agonize over category): `loud` vs `ordnance`
(percussive type vs a themed world with plate reaction) · `neon` vs `neonsign`
(neon-styled captions vs a sign being written) · `cream` vs `stardust` (warm
embedded flow vs an accumulating poem with semantic dispersal) · `terminal` vs
`glitch` (a console WORLD with typed log + decode vs corrupted-feed styling on
normal captions) · `stomp` vs `loud` (every beat takes over the dead-center
frame vs energetic type that still shares the frame with the subject).

## Rules

- Identities are **engine-locked** — no cross combos. Opening a new combo (e.g.
  another DNA under rail) is a validation event: render → user review → flip the
  DNA's `deliveries.rail` flag (see dna/README.md).
- New identities join via their family's registry rules (dna/README.md for
  classic, themes/README.md for themed — "any input, zero hand-fixing" bar).
- The engines' internals (Standard/Cinematic/Theme compilers, gates, layers)
  are documented in their own files; this catalog is the only routing surface.
