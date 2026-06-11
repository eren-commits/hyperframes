---
name: cap-cli
description: "Retro & Analog caption template - dev · type-on. Flow: type; climax 'LIVE' enters 'type', exits 'untype'."
metadata:
  cluster: Retro & Analog
  tags: caption, talking-head, retro, type, type
---

# CLI

> Retro & Analog - **dev · type-on**. flow: type · climax: deblur

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **LIVE** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'VT323'` |
| **Fill** | text `#33ff66` - active-word accent `#aaffbb` - climax fill: solid |
| **Flow reveal** | `type` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`type`** |
| **Climax exit** | **`untype`** |

## Copy

- Flow lines (verbatim sample): "compiling" / "deploy --prod"
- **Climax word:** `LIVE`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-term {
  --ff: "VT323";
  --cfill: #33ff66;
  --cacc: #aaffbb;
}
.s-term .flow {
  font-size: 8.5cqh;
}
.s-term .climax {
  font-size: 34cqh;
  text-shadow: 0 0 12px #33ff66;
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **type** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **type** - `CLIMAX_OUT` = **untype** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-term bg-scifi`, feed the transcript to the flow, set `CLIMAX_IN=type` / `CLIMAX_OUT=untype` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

retro, vintage, VHS, analog, arcade, newsprint, 8-bit, cli, live
