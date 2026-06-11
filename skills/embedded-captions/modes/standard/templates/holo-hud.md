---
name: cap-holo-hud
description: "Cyber & Glitch caption template - sci-fi · glitch. Flow: glitch; climax 'ONLINE' enters 'boot', exits 'power-off'."
metadata:
  cluster: Cyber & Glitch
  tags: caption, talking-head, cyber, boot, glitch
---

# HOLO HUD

> Cyber & Glitch - **sci-fi · glitch**. flow: glitch · climax: cyan assemble

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **ONLINE** is the one big beat behind the speaker.

## Recipe

| | |
|---|---|
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Orbitron'` |
| **Fill** | text `#cdfcff` - active-word accent `#43f4ff` - climax fill: stroke |
| **Flow reveal** | `glitch` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`boot`** |
| **Climax exit** | **`power-off`** |

## Copy

- Flow lines (verbatim sample): "all systems" / "nominal"
- **Climax word:** `ONLINE`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-hud{--ff:'Orbitron';--cfill:#cdfcff;--cacc:#43f4ff}
.s-hud .climax span{color:transparent;-webkit-text-fill-color:transparent;-webkit-text-stroke:1.5px #43f4ff;text-shadow:0 0 16px rgba(67,244,255,.5)}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **glitch** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **boot** - `CLIMAX_OUT` = **power-off** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.


## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```
Build the `_anatomy.md` scene with class `stage s-hud bg-scifi`, feed the transcript to the flow, set `CLIMAX_IN=boot` / `CLIMAX_OUT=power-off` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

cyber, glitch, hacker, tech, futuristic, terminal, holo hud, online
