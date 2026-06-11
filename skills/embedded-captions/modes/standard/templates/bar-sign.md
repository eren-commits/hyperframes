---
name: cap-bar-sign
description: "Neon & Night caption template - night · amber neon. Flow: fade-up; climax 'WHISKEY' enters 'buzz', exits 'power-down'."
metadata:
  cluster: Neon & Night
  tags: caption, talking-head, neon, buzz, fade-up
---

# BAR SIGN

> Neon & Night - **night · amber neon**. flow: flicker · climax: ignite

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **WHISKEY** is the one big beat behind the speaker.

## Recipe

| | |
|---|---|
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Monoton'` |
| **Fill** | text `#fff` - active-word accent `#ff9e2c` - climax fill: solid |
| **Flow reveal** | `fade-up` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`buzz`** |
| **Climax exit** | **`power-down`** |

## Copy

- Flow lines (verbatim sample): "last call at" / "midnight"
- **Climax word:** `WHISKEY`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-bar{--ff:'Monoton';--cfill:#fff;--cacc:#ff9e2c}
.s-bar .flow{font-family:'Oswald';font-weight:600}
.s-bar .climax{text-shadow:0 0 6px #fff,0 0 16px #ff9e2c,0 0 34px #ff5a1e}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **fade-up** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **buzz** - `CLIMAX_OUT` = **power-down** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.


## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```
Build the `_anatomy.md` scene with class `stage s-bar bg-neon`, feed the transcript to the flow, set `CLIMAX_IN=buzz` / `CLIMAX_OUT=power-down` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

neon, night, cyberpunk, bar, city lights, bar sign, whiskey
