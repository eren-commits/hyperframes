---
name: cap-gym
description: "Hype & Sport caption template - fitness · whip+stomp. Flow: whip; climax 'NO EXCUSES' enters 'punch', exits 'knock'."
metadata:
  cluster: Hype & Sport
  tags: caption, talking-head, hype, punch, whip
---

# GYM

> Hype & Sport - **fitness · whip+stomp**. flow: whip · climax: orange stomp

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **NO EXCUSES** is the one big beat behind the speaker.

## Recipe

| | |
|---|---|
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Saira Stencil One'` |
| **Fill** | text `#fff` - active-word accent `#ff6a00` - climax fill: solid |
| **Flow reveal** | `whip` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`punch`** |
| **Climax exit** | **`knock`** |

## Copy

- Flow lines (verbatim sample): "one more" / "rep"
- **Climax word:** `NO EXCUSES`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-gym{--ff:'Saira Stencil One';--cfill:#fff;--cacc:#ff6a00}
.s-gym .flow{font-family:'Oswald';font-weight:700;text-transform:uppercase}
.s-gym .climax{color:#ff6a00}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **whip** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **punch** - `CLIMAX_OUT` = **knock** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.


## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```
Build the `_anatomy.md` scene with class `stage s-gym bg-tactical`, feed the transcript to the flow, set `CLIMAX_IN=punch` / `CLIMAX_OUT=knock` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

hype, sport, fitness, energetic, promo, street, gym, no excuses
