---
name: cap-trailer
description: "Epic & Cinematic caption template - blockbuster · slam. Flow: pop; climax 'DESTINY' enters 'monument', exits 'sink'."
metadata:
  cluster: Epic & Cinematic
  tags: caption, talking-head, epic, monument, pop
---

# TRAILER

> Epic & Cinematic - **blockbuster · slam**. flow: pop · climax: monumental slam

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **DESTINY** is the one big beat behind the speaker.

## Recipe

| | |
|---|---|
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Cinzel'` |
| **Fill** | text `#d5dae2` - active-word accent `#c08a3e` - climax fill: solid |
| **Flow reveal** | `pop` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`monument`** |
| **Climax exit** | **`sink`** |

## Copy

- Flow lines (verbatim sample): "this is the" / "moment"
- **Climax word:** `DESTINY`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-trailer{--ff:'Cinzel';--cfill:#d5dae2;--cacc:#c08a3e}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **pop** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **monument** - `CLIMAX_OUT` = **sink** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.


## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```
Build the `_anatomy.md` scene with class `stage s-trailer bg-scifi`, feed the transcript to the flow, set `CLIMAX_IN=monument` / `CLIMAX_OUT=sink` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

epic, cinematic, trailer, motivational, bold, dramatic, trailer, destiny
