---
name: cap-ink
description: "Atelier · Design-Forward caption template - calligraphy. Flow: ink; climax 'muse' enters 'ink', exits 'fade'."
metadata:
  cluster: Atelier · Design-Forward
  tags: caption, talking-head, atelier, ink, ink
---

# INK

> Atelier · Design-Forward - **calligraphy**. flow: brush-wipe · climax: ink write-on

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **muse** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Caveat'` |
| **Fill** | text `#f2ece1` - active-word accent `#c0392b` - climax fill: solid |
| **Flow reveal** | `ink` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`ink`** |
| **Climax exit** | **`fade`** |

## Copy

- Flow lines (verbatim sample): "written entirely" / "by hand"
- **Climax word:** `muse`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-ink {
  --ff: "Caveat";
  --cfill: #f2ece1;
  --cacc: #c0392b;
}
.s-ink .flow {
  font-weight: 700;
  font-size: 9.5cqh;
}
.s-ink .climax {
  font-weight: 700;
  text-transform: none;
  font-size: 40cqh;
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **ink** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **ink** - `CLIMAX_OUT` = **fade** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-ink bg-outdoor`, feed the transcript to the flow, set `CLIMAX_IN=ink` / `CLIMAX_OUT=fade` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

design-forward, swiss, didone, bauhaus, brutalist, japanese, calligraphy, variable font, gallery, ink, muse
