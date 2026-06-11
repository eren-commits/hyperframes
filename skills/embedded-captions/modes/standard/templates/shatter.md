---
name: cap-shatter
description: "Ultra ✦ Maximum Flash caption template - impact. Flow: pop; climax 'BREAK' enters 'shatter', exits 'shatter-out'."
metadata:
  cluster: Ultra ✦ Maximum Flash
  tags: caption, talking-head, ultra, shatter, pop
---

# SHATTER

> Ultra ✦ Maximum Flash - **impact**. flow: pop · climax: slam + burst-out

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **BREAK** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Archivo Black'` |
| **Fill** | text `#fff` - active-word accent `#ff2e57` - climax fill: stroke |
| **Flow reveal** | `pop` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`shatter`** |
| **Climax exit** | **`shatter-out`** |

## Copy

- Flow lines (verbatim sample): "everything you" / "thought you knew"
- **Climax word:** `BREAK`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-shard {
  --ff: "Archivo Black";
  --cfill: #fff;
  --cacc: #ff2e57;
}
.s-shard .climax span {
  -webkit-text-stroke: 1px rgba(255, 46, 87, 0.45);
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **pop** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **shatter** - `CLIMAX_OUT` = **shatter-out** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-shard bg-dark`, feed the transcript to the flow, set `CLIMAX_IN=shatter` / `CLIMAX_OUT=shatter-out` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

flashy, dazzling, liquid metal, holographic, plasma, prism, warp, shatter, 3D, shatter, break
