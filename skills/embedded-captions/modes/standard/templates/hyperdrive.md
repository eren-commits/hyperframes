---
name: cap-hyperdrive
description: "Ultra ✦ Maximum Flash caption template - hyperspace. Flow: pop; climax 'WARP' enters 'hyper', exits 'hyper-out'."
metadata:
  cluster: Ultra ✦ Maximum Flash
  tags: caption, talking-head, ultra, hyper, pop
---

# HYPERDRIVE

> Ultra ✦ Maximum Flash - **hyperspace**. flow: pop · climax: warp from depth

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **WARP** is the one big beat behind the speaker.

## Recipe

| | |
|---|---|
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Orbitron'` |
| **Fill** | text `#eef4ff` - active-word accent `#7ab8ff` - climax fill: solid |
| **Flow reveal** | `pop` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`hyper`** |
| **Climax exit** | **`hyper-out`** |

## Copy

- Flow lines (verbatim sample): "hold on" / "and punch it"
- **Climax word:** `WARP`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-warp{--ff:'Orbitron';--cfill:#eef4ff;--cacc:#7ab8ff}
.s-warp .climax span{text-shadow:0 0 22px rgba(120,184,255,.6)}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **pop** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **hyper** - `CLIMAX_OUT` = **hyper-out** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.


## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```
Build the `_anatomy.md` scene with class `stage s-warp bg-scifi`, feed the transcript to the flow, set `CLIMAX_IN=hyper` / `CLIMAX_OUT=hyper-out` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

flashy, dazzling, liquid metal, holographic, plasma, prism, warp, shatter, 3D, hyperdrive, warp
