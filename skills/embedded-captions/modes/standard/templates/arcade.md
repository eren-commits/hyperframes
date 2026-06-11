---
name: cap-arcade
description: "Retro & Analog caption template - 8-bit · pop. Flow: pop; climax '1UP' enters 'blink', exits 'blink-out'."
metadata:
  cluster: Retro & Analog
  tags: caption, talking-head, retro, blink, pop
---

# ARCADE

> Retro & Analog - **8-bit · pop**. flow: bounce · climax: jelly pop

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **1UP** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Press Start 2P'` |
| **Fill** | text `#fff` - active-word accent `#ffe600` - climax fill: solid |
| **Flow reveal** | `pop` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`blink`** |
| **Climax exit** | **`blink-out`** |

## Copy

- Flow lines (verbatim sample): "press start to" / "continue"
- **Climax word:** `1UP`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-arcade {
  --ff: "Press Start 2P";
  --cfill: #fff;
  --cacc: #ffe600;
}
.s-arcade .flow {
  font-size: 4.6cqh;
  line-height: 1.7;
}
.s-arcade .climax {
  font-size: 19cqh;
  color: #39ff14;
  line-height: 1.4;
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **pop** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **blink** - `CLIMAX_OUT` = **blink-out** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-arcade bg-creator`, feed the transcript to the flow, set `CLIMAX_IN=blink` / `CLIMAX_OUT=blink-out` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

retro, vintage, VHS, analog, arcade, newsprint, 8-bit, arcade, 1up
