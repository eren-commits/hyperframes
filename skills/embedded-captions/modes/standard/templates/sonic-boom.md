---
name: cap-sonic-boom
description: "Impact 💥 Bold caption template - shockwave ring + RGB. Flow: pop; climax 'BOOM' enters 'sonic', exits 'fade'."
metadata:
  cluster: Impact 💥 Bold
  tags: caption, talking-head, impact, sonic, pop
---

# SONIC BOOM

> Impact 💥 Bold - **shockwave ring + RGB**. flow: pop · climax: crush from huge → ring → shake

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **BOOM** is the one big beat behind the speaker.

## Recipe

| | |
|---|---|
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Archivo Black'` |
| **Fill** | text `#fff` - active-word accent `#5ce0ff` - climax fill: solid |
| **Flow reveal** | `pop` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`sonic`** |
| **Climax exit** | **`fade`** |

## Copy

- Flow lines (verbatim sample): "faster than" / "sound"
- **Climax word:** `BOOM`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-sonic{--ff:'Archivo Black';--cfill:#fff;--cacc:#5ce0ff}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **pop** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **sonic** - `CLIMAX_OUT` = **fade** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.
- **Note:** climax effect: add a `.ring` element scaling 0->3 / opacity 1->0.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```
Build the `_anatomy.md` scene with class `stage s-sonic bg-scifi`, feed the transcript to the flow, set `CLIMAX_IN=sonic` / `CLIMAX_OUT=fade` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

impact, explosive, nuclear, meteor, shockwave, earthquake, power, slam, sonic boom, boom
