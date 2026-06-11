---
name: cap-voltage
description: "Ultra ✦ Maximum Flash caption template - electric. Flow: fade-up; climax 'CHARGE' enters 'volt', exits 'neon-out'."
metadata:
  cluster: Ultra ✦ Maximum Flash
  tags: caption, talking-head, ultra, volt, fade-up
---

# VOLTAGE

> Ultra ✦ Maximum Flash - **electric**. flow: flicker · climax: electric strike

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **CHARGE** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Orbitron'` |
| **Fill** | text `#eafcff` - active-word accent `#43f4ff` - climax fill: solid |
| **Flow reveal** | `fade-up` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`volt`** |
| **Climax exit** | **`neon-out`** |

## Copy

- Flow lines (verbatim sample): "full system" / "overload"
- **Climax word:** `CHARGE`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-voltage {
  --ff: "Orbitron";
  --cfill: #eafcff;
  --cacc: #43f4ff;
}
.s-voltage .flow {
  font-family: "Oswald";
  font-weight: 700;
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **fade-up** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **volt** - `CLIMAX_OUT` = **neon-out** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-voltage bg-scifi`, feed the transcript to the flow, set `CLIMAX_IN=volt` / `CLIMAX_OUT=neon-out` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

flashy, dazzling, liquid metal, holographic, plasma, prism, warp, shatter, 3D, voltage, charge
