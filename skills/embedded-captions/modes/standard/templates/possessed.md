---
name: cap-possessed
description: "Horror & Tension caption template - horror · bleed. Flow: blur-in; climax 'LEAVE' enters 'possess', exits 'snap'."
metadata:
  cluster: Horror & Tension
  tags: caption, talking-head, horror, possess, blur-in
---

# POSSESSED

> Horror & Tension - **horror · bleed**. flow: blur/smear · climax: bleed→disintegrate

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **LEAVE** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Special Elite'` |
| **Fill** | text `#c7c2b8` - active-word accent `#9e1b1b` - climax fill: solid |
| **Flow reveal** | `blur-in` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`possess`** |
| **Climax exit** | **`snap`** |

## Copy

- Flow lines (verbatim sample): "it knows your" / "name"
- **Climax word:** `LEAVE`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-possessed {
  --ff: "Special Elite";
  --cfill: #c7c2b8;
  --cacc: #9e1b1b;
}
.s-possessed .climax {
  font-family: "Creepster";
  color: #7a0a0a;
  font-weight: 400;
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **blur-in** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **possess** - `CLIMAX_OUT` = **snap** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-possessed bg-dark`, feed the transcript to the flow, set `CLIMAX_IN=possess` / `CLIMAX_OUT=snap` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

horror, scary, thriller, true-crime, tension, creepy, possessed, leave
