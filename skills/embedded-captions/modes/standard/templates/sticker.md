---
name: cap-sticker
description: "Playful & Friendly caption template - collage · bounce. Flow: pop; climax 'OMG' enters 'popr', exits 'popout'."
metadata:
  cluster: Playful & Friendly
  tags: caption, talking-head, playful, popr, pop
---

# STICKER

> Playful & Friendly - **collage · bounce**. flow: bounce · climax: jelly pop

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **OMG** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Baloo 2'` |
| **Fill** | text `#fff` - active-word accent `#4dabf7` - climax fill: solid |
| **Flow reveal** | `pop` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`popr`** |
| **Climax exit** | **`popout`** |

## Copy

- Flow lines (verbatim sample): "best day" / "ever"
- **Climax word:** `OMG`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-sticker {
  --ff: "Baloo 2";
  --cfill: #fff;
  --cacc: #4dabf7;
}
.s-sticker .climax {
  color: #ff6b6b;
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **pop** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **popr** - `CLIMAX_OUT` = **popout** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-sticker bg-outdoor`, feed the transcript to the flow, set `CLIMAX_IN=popr` / `CLIMAX_OUT=popout` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

playful, fun, kids, vlog, friendly, cute, sticker, sticker, omg
