---
name: cap-dread
description: "Horror & Tension caption template - horror · ink-bleed. Flow: blur-in; climax 'RUN' enters 'loom', exits 'drag'."
metadata:
  cluster: Horror & Tension
  tags: caption, talking-head, horror, loom, blur-in
---

# DREAD

> Horror & Tension - **horror · ink-bleed**. flow: blur in / smear out · climax: bleed→vanish

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **RUN** is the one big beat behind the speaker.

## Recipe

| | |
|---|---|
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Special Elite'` |
| **Fill** | text `#c7c2b8` - active-word accent `#fff` - climax fill: stroke |
| **Flow reveal** | `blur-in` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`loom`** |
| **Climax exit** | **`drag`** |

## Copy

- Flow lines (verbatim sample): "something is" / "in the house"
- **Climax word:** `RUN`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-dread{--ff:'Special Elite';--cfill:#c7c2b8;--cacc:#fff}
.s-dread .climax{font-family:'Creepster';font-weight:400}
.s-dread .climax span{color:#e11d1d;-webkit-text-stroke:1px rgba(0,0,0,.5);paint-order:stroke fill;text-shadow:0 2px 15px rgba(0,0,0,.7)}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **blur-in** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **loom** - `CLIMAX_OUT` = **drag** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.


## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```
Build the `_anatomy.md` scene with class `stage s-dread bg-tactical`, feed the transcript to the flow, set `CLIMAX_IN=loom` / `CLIMAX_OUT=drag` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

horror, scary, thriller, true-crime, tension, creepy, dread, run
