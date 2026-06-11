---
name: cap-data-breach
description: "Cyber & Glitch caption template - cyber · glitch. Flow: glitch; climax 'ACCESS' enters 'glitch', exits 'glitch-out'."
metadata:
  cluster: Cyber & Glitch
  tags: caption, talking-head, cyber, glitch, glitch
---

# DATA BREACH

> Cyber & Glitch - **cyber · glitch**. flow: glitch in/out · climax: RGB assemble

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **ACCESS** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Space Grotesk'` |
| **Fill** | text `#fff` - active-word accent `#00e5ff` - climax fill: solid |
| **Flow reveal** | `glitch` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`glitch`** |
| **Climax exit** | **`glitch-out`** |

## Copy

- Flow lines (verbatim sample): "they tried to" / "lock me out"
- **Climax word:** `ACCESS`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-data {
  --ff: "Space Grotesk";
  --cfill: #fff;
  --cacc: #00e5ff;
}
.s-data .climax {
  font-family: "Audiowide";
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **glitch** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **glitch** - `CLIMAX_OUT` = **glitch-out** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-data bg-neon`, feed the transcript to the flow, set `CLIMAX_IN=glitch` / `CLIMAX_OUT=glitch-out` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

cyber, glitch, hacker, tech, futuristic, terminal, data breach, access
