---
name: cap-liquid-metal
description: "Ultra ✦ Maximum Flash caption template - mercury · SVG. Flow: fade-up; climax 'FLUX' enters 'liquid', exits 'liquid-out'."
metadata:
  cluster: Ultra ✦ Maximum Flash
  tags: caption, talking-head, ultra, liquid, fade-up
---

# LIQUID METAL

> Ultra ✦ Maximum Flash - **mercury · SVG**. flow: fade · climax: liquid wobble

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **FLUX** is the one big beat behind the speaker.

## Recipe

| | |
|---|---|
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Archivo Black'` |
| **Fill** | text `#e9eef4` - active-word accent `#fff` - climax fill: gradient |
| **Flow reveal** | `fade-up` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`liquid`** |
| **Climax exit** | **`liquid-out`** |

## Copy

- Flow lines (verbatim sample): "it never" / "holds a shape"
- **Climax word:** `FLUX`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-mercury{--ff:'Archivo Black';--cfill:#e9eef4;--cacc:#fff}
.s-mercury .climax{filter:url(#liquid)}
.s-mercury .climax span{background:linear-gradient(125deg,#6b7079,#fff 42%,#aeb6c0 58%,#5b6068);-webkit-background-clip:text;background-clip:text;color:transparent}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **fade-up** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **liquid** - `CLIMAX_OUT` = **liquid-out** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.
- **Note:** needs the SVG `#liquid` filter on the `.climax` container (drive `feDisplacementMap@scale` from the timeline, not SMIL).

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```
Build the `_anatomy.md` scene with class `stage s-mercury bg-dark`, feed the transcript to the flow, set `CLIMAX_IN=liquid` / `CLIMAX_OUT=liquid-out` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

flashy, dazzling, liquid metal, holographic, plasma, prism, warp, shatter, 3D, liquid metal, flux
