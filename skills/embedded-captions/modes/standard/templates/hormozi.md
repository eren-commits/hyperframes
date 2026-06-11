---
name: cap-hormozi
description: "Creator & Social caption template - business · karaoke box. Flow: karaoke; climax 'MONEY' enters 'boxpop', exits 'fade'."
metadata:
  cluster: Creator & Social
  tags: caption, talking-head, creator, boxpop, karaoke
---

# HORMOZI

> Creator & Social - **business · karaoke box**. flow: pop + yellow box · climax: pop

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **MONEY** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Inter'` |
| **Fill** | text `#fff` - active-word accent `#ffe000` - climax fill: stroke |
| **Flow reveal** | `karaoke` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`boxpop`** |
| **Climax exit** | **`fade`** |

## Copy

- Flow lines (verbatim sample): "THIS ONE THING" / "CHANGED EVERYTHING"
- **Climax word:** `MONEY`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-hormozi {
  --ff: "Inter";
  --cfill: #fff;
  --cacc: #ffe000;
}
.s-hormozi .flow .w {
  -webkit-text-stroke: 2px #000;
  paint-order: stroke fill;
}
.s-hormozi .flow .w.act {
  background: #ffe000;
  color: #111;
  -webkit-text-stroke: 0;
  border-radius: 6px;
  padding: 0 0.1em;
}
.s-hormozi .climax {
  -webkit-text-stroke: 3px #000;
  paint-order: stroke fill;
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **karaoke** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **boxpop** - `CLIMAX_OUT` = **fade** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-hormozi bg-creator`, feed the transcript to the flow, set `CLIMAX_IN=boxpop` / `CLIMAX_OUT=fade` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

creator, social, podcast, education, beauty, karaoke, hormozi, money
