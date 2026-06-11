---
name: cap-monolith
description: "Ultra ✦ Maximum Flash caption template - 3D extrude. Flow: pop; climax 'EMPIRE' enters 'extrude', exits 'fade'."
metadata:
  cluster: Ultra ✦ Maximum Flash
  tags: caption, talking-head, ultra, extrude, pop
---

# MONOLITH

> Ultra ✦ Maximum Flash - **3D extrude**. flow: pop · climax: extruded turn

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **EMPIRE** is the one big beat behind the speaker.

## Recipe

| | |
|---|---|
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Archivo Black'` |
| **Fill** | text `#eef0f4` - active-word accent `#fff` - climax fill: solid |
| **Flow reveal** | `pop` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`extrude`** |
| **Climax exit** | **`fade`** |

## Copy

- Flow lines (verbatim sample): "built to" / "dominate"
- **Climax word:** `EMPIRE`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-monolith{--ff:'Archivo Black';--cfill:#eef0f4;--cacc:#fff}
.s-monolith .climax span{text-shadow:1px 1px #b9bcc4,2px 2px #abaeb6,3px 3px #9da0a8,4px 4px #8f929a,5px 5px #81848c,6px 6px #73767e,7px 7px #656870,8px 8px #575a62,9px 9px #494c54}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **pop** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **extrude** - `CLIMAX_OUT` = **fade** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.


## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```
Build the `_anatomy.md` scene with class `stage s-monolith bg-scifi`, feed the transcript to the flow, set `CLIMAX_IN=extrude` / `CLIMAX_OUT=fade` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

flashy, dazzling, liquid metal, holographic, plasma, prism, warp, shatter, 3D, monolith, empire
