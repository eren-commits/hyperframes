---
name: cap-fashion
description: "Luxury & Elegant caption template - editorial · tracking. Flow: fade-up; climax 'COUTURE' enters 'hairrise', exits 'lift'."
metadata:
  cluster: Luxury & Elegant
  tags: caption, talking-head, luxury, hairrise, fade-up
---

# FASHION

> Luxury & Elegant - **editorial · tracking**. flow: tracking · climax: italic expand

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **COUTURE** is the one big beat behind the speaker.

## Recipe

| | |
|---|---|
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Playfair Display'` |
| **Fill** | text `#fbeae6` - active-word accent `#e6a8b0` - climax fill: solid |
| **Flow reveal** | `fade-up` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`hairrise`** |
| **Climax exit** | **`lift`** |

## Copy

- Flow lines (verbatim sample): "the new" / "collection"
- **Climax word:** `COUTURE`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-fashion{--ff:'Playfair Display';--cfill:#fbeae6;--cacc:#e6a8b0}
.s-fashion .climax{font-style:italic}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **fade-up** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **hairrise** - `CLIMAX_OUT` = **lift** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.


## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```
Build the `_anatomy.md` scene with class `stage s-fashion bg-beauty`, feed the transcript to the flow, set `CLIMAX_IN=hairrise` / `CLIMAX_OUT=lift` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

luxury, fashion, elegant, premium brand, couture, fashion, couture
