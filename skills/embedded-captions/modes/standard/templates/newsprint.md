---
name: cap-newsprint
description: "Retro & Analog caption template - archival · typewriter. Flow: type; climax 'BREAKING' enters 'stamp', exits 'lift2'."
metadata:
  cluster: Retro & Analog
  tags: caption, talking-head, retro, stamp, type
---

# NEWSPRINT

> Retro & Analog - **archival · typewriter**. flow: type · climax: stamp

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **BREAKING** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Special Elite'` |
| **Fill** | text `#1a1a1a` - active-word accent `#a23b2e` - climax fill: solid |
| **Flow reveal** | `type` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`stamp`** |
| **Climax exit** | **`lift2`** |

## Copy

- Flow lines (verbatim sample): "this just in" / "developing story"
- **Climax word:** `BREAKING`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-news {
  --ff: "Special Elite";
  --cfill: #1a1a1a;
  --cacc: #a23b2e;
}
.s-news .climax {
  color: #2a2a2a;
  font-weight: 400;
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **type** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **stamp** - `CLIMAX_OUT` = **lift2** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-news bg-podcast`, feed the transcript to the flow, set `CLIMAX_IN=stamp` / `CLIMAX_OUT=lift2` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

retro, vintage, VHS, analog, arcade, newsprint, 8-bit, newsprint, breaking
