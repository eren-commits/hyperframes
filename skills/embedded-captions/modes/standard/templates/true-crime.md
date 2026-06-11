---
name: cap-true-crime
description: "Horror & Tension caption template - true-crime · bleed. Flow: blur-in; climax 'UNSOLVED' enters 'seep', exits 'bleed'."
metadata:
  cluster: Horror & Tension
  tags: caption, talking-head, horror, seep, blur-in
---

# TRUE CRIME

> Horror & Tension - **true-crime · bleed**. flow: blur in · climax: red bleed

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **UNSOLVED** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Special Elite'` |
| **Fill** | text `#e8e4da` - active-word accent `#ff4d4d` - climax fill: stroke |
| **Flow reveal** | `blur-in` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`seep`** |
| **Climax exit** | **`bleed`** |

## Copy

- Flow lines (verbatim sample): "the case was" / "never closed"
- **Climax word:** `UNSOLVED`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-crime {
  --ff: "Special Elite";
  --cfill: #e8e4da;
  --cacc: #ff4d4d;
}
.s-crime .climax span {
  color: #ff3b3b;
  -webkit-text-stroke: 1px rgba(0, 0, 0, 0.55);
  paint-order: stroke fill;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.8);
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **blur-in** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **seep** - `CLIMAX_OUT` = **bleed** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-crime bg-tactical`, feed the transcript to the flow, set `CLIMAX_IN=seep` / `CLIMAX_OUT=bleed` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

horror, scary, thriller, true-crime, tension, creepy, true crime, unsolved
