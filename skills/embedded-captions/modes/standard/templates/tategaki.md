---
name: cap-tategaki
description: "Atelier · Design-Forward caption template - vertical JP. Flow: fade-up; climax 'SILENCE' enters 'vert', exits 'fade'."
metadata:
  cluster: Atelier · Design-Forward
  tags: caption, talking-head, atelier, vert, fade-up
---

# TATEGAKI Vertical Writing

> Atelier · Design-Forward - **vertical JP**. flow: fade · climax: vertical ink-drop

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **SILENCE** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Shippori Mincho'` |
| **Fill** | text `#f3efe6` - active-word accent `#d24b4b` - climax fill: vertical |
| **Flow reveal** | `fade-up` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`vert`** |
| **Climax exit** | **`fade`** |

## Copy

- Flow lines (verbatim sample): "the quiet" / "and the loud"
- **Climax word:** `SILENCE`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-vert {
  --ff: "Shippori Mincho";
  --cfill: #f3efe6;
  --cacc: #d24b4b;
}
.s-vert .climax {
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-size: 25cqh;
  font-weight: 800;
  letter-spacing: 0.04em;
  left: 81%;
  top: 50%;
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **fade-up** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **vert** - `CLIMAX_OUT` = **fade** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.
- **Note:** vertical writing style - climax uses `writing-mode:vertical-rl` and sits at `left:81%` (clear of the speaker), not centred.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-vert bg-dark`, feed the transcript to the flow, set `CLIMAX_IN=vert` / `CLIMAX_OUT=fade` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

design-forward, swiss, didone, bauhaus, brutalist, japanese, calligraphy, variable font, gallery, tategaki vertical writing, silence
