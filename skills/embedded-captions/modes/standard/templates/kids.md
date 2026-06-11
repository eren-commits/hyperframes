---
name: cap-kids
description: "Playful & Friendly caption template - kids · bounce. Flow: pop; climax 'WOW' enters 'dropb', exits 'hop'."
metadata:
  cluster: Playful & Friendly
  tags: caption, talking-head, playful, dropb, pop
---

# KIDS

> Playful & Friendly - **kids · bounce**. flow: bounce · climax: jelly pop

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **WOW** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Fredoka'` |
| **Fill** | text `#fff` - active-word accent `#ffd23f` - climax fill: stroke |
| **Flow reveal** | `pop` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`dropb`** |
| **Climax exit** | **`hop`** |

## Copy

- Flow lines (verbatim sample): "let’s learn" / "something fun"
- **Climax word:** `WOW`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-kid {
  --ff: "Fredoka";
  --cfill: #fff;
  --cacc: #ffd23f;
}
.s-kid .climax span {
  color: #ffd23f;
  -webkit-text-stroke: 6px #241a3a;
  paint-order: stroke fill;
  text-shadow:
    0 5px 0 rgba(0, 0, 0, 0.3),
    0 9px 20px rgba(0, 0, 0, 0.35);
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **pop** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **dropb** - `CLIMAX_OUT` = **hop** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-kid bg-creator`, feed the transcript to the flow, set `CLIMAX_IN=dropb` / `CLIMAX_OUT=hop` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

playful, fun, kids, vlog, friendly, cute, sticker, kids, wow
