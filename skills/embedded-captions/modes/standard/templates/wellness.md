---
name: cap-wellness
description: "Premium & Editorial caption template - beauty · serif-italic. Flow: fade-up; climax 'calm' enters 'breathe', exits 'breathe-off'."
metadata:
  cluster: Premium & Editorial
  tags: caption, talking-head, premium, breathe, fade-up
---

# WELLNESS

> Premium & Editorial - **beauty · serif-italic**. flow: fade-up · climax: deblur

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **calm** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Cormorant Garamond'` |
| **Fill** | text `#fbeae6` - active-word accent `#c9a24b` - climax fill: solid |
| **Flow reveal** | `fade-up` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`breathe`** |
| **Climax exit** | **`breathe-off`** |

## Copy

- Flow lines (verbatim sample): "slow down and" / "just breathe"
- **Climax word:** `calm`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-wellness {
  --ff: "Cormorant Garamond";
  --cfill: #fbeae6;
  --cacc: #c9a24b;
}
.s-wellness .flow {
  font-weight: 600;
}
.s-wellness .climax {
  font-weight: 700;
  font-style: italic;
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **fade-up** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **breathe** - `CLIMAX_OUT` = **breathe-off** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-wellness bg-beauty`, feed the transcript to the flow, set `CLIMAX_IN=breathe` / `CLIMAX_OUT=breathe-off` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

premium, keynote, product launch, editorial, calm, restrained, tech reveal, wellness, calm
