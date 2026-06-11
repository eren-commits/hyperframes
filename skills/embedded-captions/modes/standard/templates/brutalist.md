---
name: cap-brutalist
description: "Atelier · Design-Forward caption template - mono · raw. Flow: editwipe; climax 'RAW' enters 'editwipe', exits 'sweep-off'."
metadata:
  cluster: Atelier · Design-Forward
  tags: caption, talking-head, atelier, editwipe, editwipe
---

# BRUTALIST

> Atelier · Design-Forward - **mono · raw**. flow: clip-wipe · climax: hard wipe

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **RAW** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'JetBrains Mono'` |
| **Fill** | text `#f4f4f4` - active-word accent `#ff2d2d` - climax fill: solid |
| **Flow reveal** | `editwipe` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`editwipe`** |
| **Climax exit** | **`sweep-off`** |

## Copy

- Flow lines (verbatim sample): "no decoration" / "only truth"
- **Climax word:** `RAW`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-brut {
  --ff: "JetBrains Mono";
  --cfill: #f4f4f4;
  --cacc: #ff2d2d;
}
.s-brut .flow {
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: -0.02em;
}
.s-brut .climax {
  font-weight: 700;
  font-size: 42cqh;
  letter-spacing: -0.05em;
}
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

Build the `_anatomy.md` scene with class `stage s-brut bg-dark`, feed the transcript to the flow, set `CLIMAX_IN=editwipe` / `CLIMAX_OUT=sweep-off` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

design-forward, swiss, didone, bauhaus, brutalist, japanese, calligraphy, variable font, gallery, brutalist, raw
