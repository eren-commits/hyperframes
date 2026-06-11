---
name: cap-volt
description: "Epic & Cinematic caption template - motivational · slam. Flow: pop; climax 'RISE' enters 'fly', exits 'fly-off'."
metadata:
  cluster: Epic & Cinematic
  tags: caption, talking-head, epic, fly, pop
---

# VOLT

> Epic & Cinematic - **motivational · slam**. flow: pop · climax: volt slam

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **RISE** is the one big beat behind the speaker.

## Recipe

| | |
|---|---|
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Anton'` |
| **Fill** | text `#fff` - active-word accent `#ccff00` - climax fill: solid |
| **Flow reveal** | `pop` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`fly`** |
| **Climax exit** | **`fly-off`** |

## Copy

- Flow lines (verbatim sample): "no one is" / "coming to save you"
- **Climax word:** `RISE`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-volt{--ff:'Anton';--cfill:#fff;--cacc:#ccff00}
.s-volt .climax{color:#ccff00}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **pop** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **fly** - `CLIMAX_OUT` = **fly-off** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.


## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```
Build the `_anatomy.md` scene with class `stage s-volt bg-outdoor`, feed the transcript to the flow, set `CLIMAX_IN=fly` / `CLIMAX_OUT=fly-off` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

epic, cinematic, trailer, motivational, bold, dramatic, volt, rise
