---
name: cap-bauhaus
description: "Atelier · Design-Forward caption template - geometric · primary. Flow: block; climax 'FORM' enters 'block', exits 'fade'."
metadata:
  cluster: Atelier · Design-Forward
  tags: caption, talking-head, atelier, block, block
---

# BAUHAUS

> Atelier · Design-Forward - **geometric · primary**. flow: block + yellow accent · climax: build up

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **FORM** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Poppins'` |
| **Fill** | text `#f7f4ec` - active-word accent `#ff3b2e` - climax fill: solid |
| **Flow reveal** | `block` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`block`** |
| **Climax exit** | **`fade`** |

## Copy

- Flow lines (verbatim sample): "less but" / "so much better"
- **Climax word:** `FORM`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-bauhaus {
  --ff: "Poppins";
  --cfill: #f7f4ec;
  --cacc: #ff3b2e;
}
.s-bauhaus .flow {
  font-weight: 800;
  text-transform: uppercase;
}
.s-bauhaus .flow .w.act {
  color: #111;
  background: #ffd23f;
  border-radius: 3px;
  padding: 0 0.08em;
}
.s-bauhaus .climax {
  font-weight: 900;
  color: #ffd23f;
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **block** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **block** - `CLIMAX_OUT` = **fade** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-bauhaus bg-creator`, feed the transcript to the flow, set `CLIMAX_IN=block` / `CLIMAX_OUT=fade` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

design-forward, swiss, didone, bauhaus, brutalist, japanese, calligraphy, variable font, gallery, bauhaus, form
