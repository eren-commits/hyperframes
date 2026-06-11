---
name: cap-variable
description: "Atelier · Design-Forward caption template - variable font. Flow: weight; climax 'BOLD' enters 'weight', exits 'fade'."
metadata:
  cluster: Atelier · Design-Forward
  tags: caption, talking-head, atelier, weight, weight
---

# VARIABLE

> Atelier · Design-Forward - **variable font**. flow: weight morph · climax: thin → black

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **BOLD** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Inter'` |
| **Fill** | text `#ffffff` - active-word accent `#9aa0ff` - climax fill: solid |
| **Flow reveal** | `weight` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`weight`** |
| **Climax exit** | **`fade`** |

## Copy

- Flow lines (verbatim sample): "watch the weight" / "shift"
- **Climax word:** `BOLD`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-vary {
  --ff: "Inter";
  --cfill: #ffffff;
  --cacc: #9aa0ff;
}
.s-vary .climax {
  font-weight: 900;
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **weight** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **weight** - `CLIMAX_OUT` = **fade** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.
- **Note:** needs a variable font loaded with the weight axis (e.g. Inter `wght@100..900`).

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-vary bg-scifi`, feed the transcript to the flow, set `CLIMAX_IN=weight` / `CLIMAX_OUT=fade` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

design-forward, swiss, didone, bauhaus, brutalist, japanese, calligraphy, variable font, gallery, variable, bold
