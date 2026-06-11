---
name: cap-education
description: "Creator & Social caption template - explainer · karaoke. Flow: karaoke; climax 'LEARN' enters 'flip', exits 'flip-off'."
metadata:
  cluster: Creator & Social
  tags: caption, talking-head, creator, flip, karaoke
---

# EDUCATION

> Creator & Social - **explainer · karaoke**. flow: pop + green accent · climax: pop

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **LEARN** is the one big beat behind the speaker.

## Recipe

| | |
|---|---|
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Inter'` |
| **Fill** | text `#fff` - active-word accent `#34e27a` - climax fill: solid |
| **Flow reveal** | `karaoke` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`flip`** |
| **Climax exit** | **`flip-off`** |

## Copy

- Flow lines (verbatim sample): "here are three" / "things to know"
- **Climax word:** `LEARN`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-edu{--ff:'Inter';--cfill:#fff;--cacc:#34e27a}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **karaoke** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **flip** - `CLIMAX_OUT` = **flip-off** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.


## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```
Build the `_anatomy.md` scene with class `stage s-edu bg-creator`, feed the transcript to the flow, set `CLIMAX_IN=flip` / `CLIMAX_OUT=flip-off` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

creator, social, podcast, education, beauty, karaoke, education, learn
