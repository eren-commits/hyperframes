---
name: cap-primetime
description: "Hype & Sport caption template - sport · whip+stomp. Flow: whip; climax 'GAME ON' enters 'stomp', exits 'knock'."
metadata:
  cluster: Hype & Sport
  tags: caption, talking-head, hype, stomp, whip
---

# PRIMETIME

> Hype & Sport - **sport · whip+stomp**. flow: whip in/out · climax: stomp

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **GAME ON** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Teko'` |
| **Fill** | text `#fff` - active-word accent `#ffd200` - climax fill: solid |
| **Flow reveal** | `whip` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`stomp`** |
| **Climax exit** | **`knock`** |

## Copy

- Flow lines (verbatim sample): "this is your" / "moment"
- **Climax word:** `GAME ON`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-sport {
  --ff: "Teko";
  --cfill: #fff;
  --cacc: #ffd200;
}
.s-sport .flow {
  font-weight: 700;
  font-style: italic;
  text-transform: uppercase;
}
.s-sport .climax {
  font-style: italic;
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **whip** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **stomp** - `CLIMAX_OUT` = **knock** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-sport bg-outdoor`, feed the transcript to the flow, set `CLIMAX_IN=stomp` / `CLIMAX_OUT=knock` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

hype, sport, fitness, energetic, promo, street, primetime, game on
