---
name: cap-podcast
description: "Creator & Social caption template - podcast · karaoke fill. Flow: karaoke; climax 'MINDSET' enters 'slideup', exits 'slidedown'."
metadata:
  cluster: Creator & Social
  tags: caption, talking-head, creator, slideup, karaoke
---

# PODCAST

> Creator & Social - **podcast · karaoke fill**. flow: pop + blue accent · climax: pop

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **MINDSET** is the one big beat behind the speaker.

## Recipe

| | |
|---|---|
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Inter'` |
| **Fill** | text `#fff` - active-word accent `#5b8def` - climax fill: solid |
| **Flow reveal** | `karaoke` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`slideup`** |
| **Climax exit** | **`slidedown`** |

## Copy

- Flow lines (verbatim sample): "that completely changed" / "how i think"
- **Climax word:** `MINDSET`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-podcast{--ff:'Inter';--cfill:#fff;--cacc:#5b8def}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **karaoke** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **slideup** - `CLIMAX_OUT` = **slidedown** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.


## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```
Build the `_anatomy.md` scene with class `stage s-podcast bg-podcast`, feed the transcript to the flow, set `CLIMAX_IN=slideup` / `CLIMAX_OUT=slidedown` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

creator, social, podcast, education, beauty, karaoke, podcast, mindset
