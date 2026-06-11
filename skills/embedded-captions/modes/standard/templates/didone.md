---
name: cap-didone
description: "Atelier · Design-Forward caption template - fashion · hairline serif. Flow: rise; climax 'VOGUE' enters 'rise', exits 'rise-off'."
metadata:
  cluster: Atelier · Design-Forward
  tags: caption, talking-head, atelier, rise, rise
---

# DIDONE

> Atelier · Design-Forward - **fashion · hairline serif**. flow: rise · climax: italic hairline rise

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **VOGUE** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Bodoni Moda'` |
| **Fill** | text `#fbf7f2` - active-word accent `#caa14a` - climax fill: solid |
| **Flow reveal** | `rise` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`rise`** |
| **Climax exit** | **`rise-off`** |

## Copy

- Flow lines (verbatim sample): "the art of" / "restraint"
- **Climax word:** `VOGUE`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-didone {
  --ff: "Bodoni Moda";
  --cfill: #fbf7f2;
  --cacc: #caa14a;
}
.s-didone .flow {
  font-weight: 700;
  letter-spacing: 0.02em;
}
.s-didone .climax {
  font-weight: 900;
  font-style: italic;
}
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

Build the `_anatomy.md` scene with class `stage s-didone bg-beauty`, feed the transcript to the flow, set `CLIMAX_IN=rise` / `CLIMAX_OUT=rise-off` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

design-forward, swiss, didone, bauhaus, brutalist, japanese, calligraphy, variable font, gallery, didone, vogue
