---
name: cap-prism
description: "Ultra ✦ Maximum Flash caption template - chromatic dispersion. Flow: fade-up; climax 'PRISM' enters 'prism', exits 'prism-out'."
metadata:
  cluster: Ultra ✦ Maximum Flash
  tags: caption, talking-head, ultra, prism, fade-up
---

# PRISM

> Ultra ✦ Maximum Flash - **chromatic dispersion**. flow: fringe · climax: RGB converge/split

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **PRISM** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Archivo Black'` |
| **Fill** | text `#ffffff` - active-word accent `#ff5cc8` - climax fill: solid |
| **Flow reveal** | `fade-up` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`prism`** |
| **Climax exit** | **`prism-out`** |

## Copy

- Flow lines (verbatim sample): "split the" / "white light"
- **Climax word:** `PRISM`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-prism {
  --ff: "Archivo Black";
  --cfill: #ffffff;
  --cacc: #ff5cc8;
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **fade-up** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **prism** - `CLIMAX_OUT` = **prism-out** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-prism bg-neon`, feed the transcript to the flow, set `CLIMAX_IN=prism` / `CLIMAX_OUT=prism-out` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

flashy, dazzling, liquid metal, holographic, plasma, prism, warp, shatter, 3D, prism, prism
