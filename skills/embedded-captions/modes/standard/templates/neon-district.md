---
name: cap-neon-district
description: "Neon & Night caption template - cyberpunk · ignite. Flow: fade-up; climax 'OPEN' enters 'ignite', exits 'neon-out'."
metadata:
  cluster: Neon & Night
  tags: caption, talking-head, neon, ignite, fade-up
---

# NEON DISTRICT

> Neon & Night - **cyberpunk · ignite**. flow: flicker on · climax: ignite/power-down

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **OPEN** is the one big beat behind the speaker.

## Recipe

| | |
|---|---|
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Monoton'` |
| **Fill** | text `#fff` - active-word accent `#18e0ff` - climax fill: solid |
| **Flow reveal** | `fade-up` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`ignite`** |
| **Climax exit** | **`neon-out`** |

## Copy

- Flow lines (verbatim sample): "the city never" / "sleeps"
- **Climax word:** `OPEN`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-neon{--ff:'Monoton';--cfill:#fff;--cacc:#18e0ff}
.s-neon .flow{font-family:'Oswald';font-weight:600}
.s-neon .climax{text-shadow:0 0 6px #fff,0 0 16px #ff1e9c,0 0 34px #ff1e9c}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **fade-up** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **ignite** - `CLIMAX_OUT` = **neon-out** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.


## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```
Build the `_anatomy.md` scene with class `stage s-neon bg-neon`, feed the transcript to the flow, set `CLIMAX_IN=ignite` / `CLIMAX_OUT=neon-out` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

neon, night, cyberpunk, bar, city lights, neon district, open
