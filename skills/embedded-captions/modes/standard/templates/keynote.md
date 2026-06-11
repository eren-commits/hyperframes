---
name: cap-keynote
description: "Premium & Editorial caption template - premium-tech · clean. Flow: fade-up; climax 'FOCUS' enters 'deblur', exits 'fade'."
metadata:
  cluster: Premium & Editorial
  tags: caption, talking-head, premium, deblur, fade-up
---

# KEYNOTE

> Premium & Editorial - **premium-tech · clean**. flow: fade-up in/out · climax: scale+deblur

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **FOCUS** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Inter'` |
| **Fill** | text `#fff` - active-word accent `#10A37F` - climax fill: solid |
| **Flow reveal** | `fade-up` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`deblur`** |
| **Climax exit** | **`fade`** |

## Copy

- Flow lines (verbatim sample): "the best ideas" / "arrive in silence"
- **Climax word:** `FOCUS`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-keynote {
  --ff: "Inter";
  --cfill: #fff;
  --cacc: #10a37f;
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **fade-up** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **deblur** - `CLIMAX_OUT` = **fade** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-keynote bg-dark`, feed the transcript to the flow, set `CLIMAX_IN=deblur` / `CLIMAX_OUT=fade` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

premium, keynote, product launch, editorial, calm, restrained, tech reveal, keynote, focus
