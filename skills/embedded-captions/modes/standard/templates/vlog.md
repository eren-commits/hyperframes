---
name: cap-vlog
description: "Playful & Friendly caption template - handwritten · bounce. Flow: pop; climax 'obsessed' enters 'scrawl', exits 'scrawl-off'."
metadata:
  cluster: Playful & Friendly
  tags: caption, talking-head, playful, scrawl, pop
---

# VLOG

> Playful & Friendly - **handwritten · bounce**. flow: bounce · climax: jelly

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **obsessed** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Caveat'` |
| **Fill** | text `#fff` - active-word accent `#ffe14d` - climax fill: solid |
| **Flow reveal** | `pop` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`scrawl`** |
| **Climax exit** | **`scrawl-off`** |

## Copy

- Flow lines (verbatim sample): "okay so today" / "we are"
- **Climax word:** `obsessed`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-vlog {
  --ff: "Caveat";
  --cfill: #fff;
  --cacc: #ffe14d;
}
.s-vlog .flow {
  font-weight: 700;
}
.s-vlog .climax {
  font-weight: 700;
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **pop** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **scrawl** - `CLIMAX_OUT` = **scrawl-off** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-vlog bg-beauty`, feed the transcript to the flow, set `CLIMAX_IN=scrawl` / `CLIMAX_OUT=scrawl-off` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

playful, fun, kids, vlog, friendly, cute, sticker, vlog, obsessed
