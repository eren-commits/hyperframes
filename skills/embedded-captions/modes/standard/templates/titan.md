---
name: cap-titan
description: "Epic & Cinematic caption template - epic · slam. Flow: pop; climax 'FEARLESS' enters 'slam', exits 'fade'."
metadata:
  cluster: Epic & Cinematic
  tags: caption, talking-head, epic, slam, pop
---

# TITAN

> Epic & Cinematic - **epic · slam**. flow: pop in · climax: SLAM + occlude

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **FEARLESS** is the one big beat behind the speaker.

## Recipe

| | |
|---|---|
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Anton'` |
| **Fill** | text `#fff` - active-word accent `#ccff00` - climax fill: solid |
| **Flow reveal** | `pop` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`slam`** |
| **Climax exit** | **`fade`** |

## Copy

- Flow lines (verbatim sample): "they told me" / "it was impossible"
- **Climax word:** `FEARLESS`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-titan{--ff:'Anton';--cfill:#fff;--cacc:#ccff00}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **pop** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **slam** - `CLIMAX_OUT` = **fade** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.


## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```
Build the `_anatomy.md` scene with class `stage s-titan bg-dark`, feed the transcript to the flow, set `CLIMAX_IN=slam` / `CLIMAX_OUT=fade` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

epic, cinematic, trailer, motivational, bold, dramatic, titan, fearless
