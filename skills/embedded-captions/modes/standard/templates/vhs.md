---
name: cap-vhs
description: "Retro & Analog caption template - retro · type-on. Flow: type; climax 'REWIND' enters 'vhs', exits 'vhs-out'."
metadata:
  cluster: Retro & Analog
  tags: caption, talking-head, retro, vhs, type
---

# VHS

> Retro & Analog - **retro · type-on**. flow: type · climax: chroma deblur

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **REWIND** is the one big beat behind the speaker.

## Recipe

| | |
|---|---|
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'VT323'` |
| **Fill** | text `#ededed` - active-word accent `#f2e04b` - climax fill: solid |
| **Flow reveal** | `type` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`vhs`** |
| **Climax exit** | **`vhs-out`** |

## Copy

- Flow lines (verbatim sample): "recorded on" / "june 04 1996"
- **Climax word:** `REWIND`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-vhs{--ff:'VT323';--cfill:#ededed;--cacc:#f2e04b}
.s-vhs .flow{font-size:8.5cqh;text-shadow:2px 0 #ff3b5c,-2px 0 #3aa0ff}
.s-vhs .climax{text-shadow:3px 0 #ff3b5c,-3px 0 #3aa0ff}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **type** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **vhs** - `CLIMAX_OUT` = **vhs-out** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.


## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```
Build the `_anatomy.md` scene with class `stage s-vhs bg-creator`, feed the transcript to the flow, set `CLIMAX_IN=vhs` / `CLIMAX_OUT=vhs-out` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

retro, vintage, VHS, analog, arcade, newsprint, 8-bit, vhs, rewind
