---
name: cap-editorial
description: "Premium & Editorial caption template - magazine · Playfair. Flow: fade-up; climax 'GRACE' enters 'rise', exits 'rise-off'."
metadata:
  cluster: Premium & Editorial
  tags: caption, talking-head, premium, rise, fade-up
---

# EDITORIAL

> Premium & Editorial - **magazine · Playfair**. flow: fade-up · climax: deblur, gold accent

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **GRACE** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Playfair Display'` |
| **Fill** | text `#fbf7f0` - active-word accent `#e6b35a` - climax fill: solid |
| **Flow reveal** | `fade-up` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`rise`** |
| **Climax exit** | **`rise-off`** |

## Copy

- Flow lines (verbatim sample): "a study in" / "restraint"
- **Climax word:** `GRACE`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-edito {
  --ff: "Playfair Display";
  --cfill: #fbf7f0;
  --cacc: #e6b35a;
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **fade-up** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **rise** - `CLIMAX_OUT` = **rise-off** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-edito bg-luxe`, feed the transcript to the flow, set `CLIMAX_IN=rise` / `CLIMAX_OUT=rise-off` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

premium, keynote, product launch, editorial, calm, restrained, tech reveal, editorial, grace
