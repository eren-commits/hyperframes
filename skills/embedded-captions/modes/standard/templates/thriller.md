---
name: cap-thriller
description: "Horror & Tension caption template - tension · smear. Flow: blur-in; climax 'BEHIND' enters 'glimpse', exits 'cut'."
metadata:
  cluster: Horror & Tension
  tags: caption, talking-head, horror, glimpse, blur-in
---

# THRILLER

> Horror & Tension - **tension · smear**. flow: blur/smear · climax: bleed→vanish

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **BEHIND** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Oswald'` |
| **Fill** | text `#e8e4da` - active-word accent `#9e1b1b` - climax fill: solid |
| **Flow reveal** | `blur-in` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`glimpse`** |
| **Climax exit** | **`cut`** |

## Copy

- Flow lines (verbatim sample): "don’t turn" / "around"
- **Climax word:** `BEHIND`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-thriller {
  --ff: "Oswald";
  --cfill: #e8e4da;
  --cacc: #9e1b1b;
}
.s-thriller .climax {
  font-family: "Creepster";
  color: #8a0a0a;
  font-weight: 400;
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **blur-in** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **glimpse** - `CLIMAX_OUT` = **cut** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-thriller bg-dark`, feed the transcript to the flow, set `CLIMAX_IN=glimpse` / `CLIMAX_OUT=cut` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

horror, scary, thriller, true-crime, tension, creepy, thriller, behind
