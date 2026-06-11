---
name: cap-beauty-vlog
description: "Creator & Social caption template - beauty · karaoke. Flow: karaoke; climax 'GLOW' enters 'shimmer', exits 'shim-out'."
metadata:
  cluster: Creator & Social
  tags: caption, talking-head, creator, shimmer, karaoke
---

# BEAUTY VLOG

> Creator & Social - **beauty · karaoke**. flow: pop + pink accent · climax: pop

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **GLOW** is the one big beat behind the speaker.

## Recipe

| | |
|---|---|
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Sora'` |
| **Fill** | text `#fff` - active-word accent `#ff6fb5` - climax fill: solid |
| **Flow reveal** | `karaoke` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`shimmer`** |
| **Climax exit** | **`shim-out`** |

## Copy

- Flow lines (verbatim sample): "this is the" / "only step you need"
- **Climax word:** `GLOW`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-bvlog{--ff:'Sora';--cfill:#fff;--cacc:#ff6fb5}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **karaoke** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **shimmer** - `CLIMAX_OUT` = **shim-out** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.


## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```
Build the `_anatomy.md` scene with class `stage s-bvlog bg-beauty`, feed the transcript to the flow, set `CLIMAX_IN=shimmer` / `CLIMAX_OUT=shim-out` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

creator, social, podcast, education, beauty, karaoke, beauty vlog, glow
