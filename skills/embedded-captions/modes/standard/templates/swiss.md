---
name: cap-swiss
description: "Atelier · Design-Forward caption template - international · grid. Flow: editwipe; climax 'ORDER' enters 'editwipe', exits 'sweep-off'."
metadata:
  cluster: Atelier · Design-Forward
  tags: caption, talking-head, atelier, editwipe, editwipe
---

# SWISS

> Atelier · Design-Forward - **international · grid**. flow: clip-wipe · climax: precise wipe, red accent

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **ORDER** is the one big beat behind the speaker.

## Recipe

| | |
|---|---|
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Inter'` |
| **Fill** | text `#fafafa` - active-word accent `#ff2d2d` - climax fill: solid |
| **Flow reveal** | `editwipe` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`editwipe`** |
| **Climax exit** | **`sweep-off`** |

## Copy

- Flow lines (verbatim sample): "form follows" / "function"
- **Climax word:** `ORDER`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-swiss{--ff:'Inter';--cfill:#fafafa;--cacc:#ff2d2d}
.s-swiss .flow{font-weight:800;letter-spacing:-.02em;text-transform:uppercase}
.s-swiss .climax{font-weight:900;letter-spacing:-.04em}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **editwipe** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **editwipe** - `CLIMAX_OUT` = **sweep-off** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.


## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```
Build the `_anatomy.md` scene with class `stage s-swiss bg-podcast`, feed the transcript to the flow, set `CLIMAX_IN=editwipe` / `CLIMAX_OUT=sweep-off` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

design-forward, swiss, didone, bauhaus, brutalist, japanese, calligraphy, variable font, gallery, swiss, order
