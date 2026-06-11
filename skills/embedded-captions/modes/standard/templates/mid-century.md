---
name: cap-mid-century
description: "Atelier · Design-Forward caption template - editorial serif. Flow: rise; climax 'ICON' enters 'rise', exits 'rise-off'."
metadata:
  cluster: Atelier · Design-Forward
  tags: caption, talking-head, atelier, rise, rise
---

# MID-CENTURY

> Atelier · Design-Forward - **editorial serif**. flow: rise · climax: serif rise, accent

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **ICON** is the one big beat behind the speaker.

## Recipe

| | |
|---|---|
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Playfair Display'` |
| **Fill** | text `#f4efe6` - active-word accent `#b5462f` - climax fill: solid |
| **Flow reveal** | `rise` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`rise`** |
| **Climax exit** | **`rise-off`** |

## Copy

- Flow lines (verbatim sample): "a timeless" / "story"
- **Climax word:** `ICON`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-mid{--ff:'Playfair Display';--cfill:#f4efe6;--cacc:#b5462f}
.s-mid .flow{font-weight:700}
.s-mid .climax{font-weight:900}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **rise** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **rise** - `CLIMAX_OUT` = **rise-off** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.


## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```
Build the `_anatomy.md` scene with class `stage s-mid bg-podcast`, feed the transcript to the flow, set `CLIMAX_IN=rise` / `CLIMAX_OUT=rise-off` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

design-forward, swiss, didone, bauhaus, brutalist, japanese, calligraphy, variable font, gallery, mid-century, icon
