---
name: cap-apex-mono
description: "Premium & Editorial caption template - premium-tech · mono. Flow: fade-up; climax 'BUILD' enters 'flip', exits 'flip-off'."
metadata:
  cluster: Premium & Editorial
  tags: caption, talking-head, premium, flip, fade-up
---

# APEX MONO

> Premium & Editorial - **premium-tech · mono**. flow: fade-up · climax: deblur, blue accent

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **BUILD** is the one big beat behind the speaker.

## Recipe

| | |
|---|---|
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'JetBrains Mono'` |
| **Fill** | text `#e8eaed` - active-word accent `#5b8cff` - climax fill: solid |
| **Flow reveal** | `fade-up` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`flip`** |
| **Climax exit** | **`flip-off`** |

## Copy

- Flow lines (verbatim sample): "ship in" / "silence"
- **Climax word:** `BUILD`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-mono{--ff:'JetBrains Mono';--cfill:#e8eaed;--cacc:#5b8cff}
.s-mono .climax{font-weight:700;font-size:34cqh}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **fade-up** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **flip** - `CLIMAX_OUT` = **flip-off** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.


## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```
Build the `_anatomy.md` scene with class `stage s-mono bg-scifi`, feed the transcript to the flow, set `CLIMAX_IN=flip` / `CLIMAX_OUT=flip-off` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

premium, keynote, product launch, editorial, calm, restrained, tech reveal, apex mono, build
