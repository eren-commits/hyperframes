---
name: cap-documentary
description: "Premium & Editorial caption template - interview · calm. Flow: fade-up; climax 'WHY' enters 'expose', exits 'expose-off'."
metadata:
  cluster: Premium & Editorial
  tags: caption, talking-head, premium, expose, fade-up
---

# DOCUMENTARY

> Premium & Editorial - **interview · calm**. flow: fade-up · climax: soft deblur

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **WHY** is the one big beat behind the speaker.

## Recipe

| | |
|---|---|
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Inter'` |
| **Fill** | text `#f2efe9` - active-word accent `#e3c06a` - climax fill: solid |
| **Flow reveal** | `fade-up` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`expose`** |
| **Climax exit** | **`expose-off`** |

## Copy

- Flow lines (verbatim sample): "it started with" / "one question"
- **Climax word:** `WHY`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-doc{--ff:'Inter';--cfill:#f2efe9;--cacc:#e3c06a}
.s-doc .climax{font-weight:800}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **fade-up** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **expose** - `CLIMAX_OUT` = **expose-off** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.


## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```
Build the `_anatomy.md` scene with class `stage s-doc bg-podcast`, feed the transcript to the flow, set `CLIMAX_IN=expose` / `CLIMAX_OUT=expose-off` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

premium, keynote, product launch, editorial, calm, restrained, tech reveal, documentary, why
