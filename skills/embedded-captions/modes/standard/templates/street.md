---
name: cap-street
description: "Hype & Sport caption template - graffiti · whip+stomp. Flow: whip; climax 'FRESH' enters 'slap', exits 'peel'."
metadata:
  cluster: Hype & Sport
  tags: caption, talking-head, hype, slap, whip
---

# STREET

> Hype & Sport - **graffiti · whip+stomp**. flow: whip · climax: tag stomp

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **FRESH** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Permanent Marker'` |
| **Fill** | text `#fff` - active-word accent `#ffe600` - climax fill: stroke |
| **Flow reveal** | `whip` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`slap`** |
| **Climax exit** | **`peel`** |

## Copy

- Flow lines (verbatim sample): "straight from the" / "block"
- **Climax word:** `FRESH`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-street {
  --ff: "Permanent Marker";
  --cfill: #fff;
  --cacc: #ffe600;
}
.s-street .climax {
  font-family: "Bangers";
  -webkit-text-stroke: 3px #111;
  paint-order: stroke fill;
  color: #ffe600;
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **whip** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **slap** - `CLIMAX_OUT` = **peel** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-street bg-outdoor`, feed the transcript to the flow, set `CLIMAX_IN=slap` / `CLIMAX_OUT=peel` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

hype, sport, fitness, energetic, promo, street, street, fresh
