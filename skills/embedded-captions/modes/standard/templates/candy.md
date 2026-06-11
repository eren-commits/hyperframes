---
name: cap-candy
description: "Playful & Friendly caption template - playful · bounce/jelly. Flow: pop; climax 'YAY!' enters 'jelly', exits 'popout'."
metadata:
  cluster: Playful & Friendly
  tags: caption, talking-head, playful, jelly, pop
---

# CANDY

> Playful & Friendly - **playful · bounce/jelly**. flow: bounce in/shrink out · climax: jelly

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **YAY!** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Baloo 2'` |
| **Fill** | text `#fff` - active-word accent `#ff5c8a` - climax fill: solid |
| **Flow reveal** | `pop` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`jelly`** |
| **Climax exit** | **`popout`** |

## Copy

- Flow lines (verbatim sample): "wait till you" / "see this"
- **Climax word:** `YAY!`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-candy {
  --ff: "Baloo 2";
  --cfill: #fff;
  --cacc: #ff5c8a;
}
.s-candy .climax {
  color: #ff8fb1;
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **pop** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **jelly** - `CLIMAX_OUT` = **popout** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-candy bg-creator`, feed the transcript to the flow, set `CLIMAX_IN=jelly` / `CLIMAX_OUT=popout` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

playful, fun, kids, vlog, friendly, cute, sticker, candy, yay!
