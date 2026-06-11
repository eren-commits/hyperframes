---
name: cap-meteor
description: "Impact 💥 Bold caption template - crash-down + hard quake. Flow: pop; climax 'IMPACT' enters 'meteor', exits 'fade'."
metadata:
  cluster: Impact 💥 Bold
  tags: caption, talking-head, impact, meteor, pop
---

# METEOR Sky Fall

> Impact 💥 Bold - **crash-down + hard quake**. flow: fade · climax: falls from above → squash-impact → shock line + shake

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **IMPACT** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Anton'` |
| **Fill** | text `#fff` - active-word accent `#ff5a2c` - climax fill: stroke |
| **Flow reveal** | `pop` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`meteor`** |
| **Climax exit** | **`fade`** |

## Copy

- Flow lines (verbatim sample): "brace for" / "the impact"
- **Climax word:** `IMPACT`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-meteor {
  --ff: "Anton";
  --cfill: #fff;
  --cacc: #ff5a2c;
}
.s-meteor .climax span {
  -webkit-text-stroke: 2px rgba(0, 0, 0, 0.5);
  paint-order: stroke fill;
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **pop** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **meteor** - `CLIMAX_OUT` = **fade** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.
- **Note:** climax effect: crashes down from above + on-land stage shake.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-meteor bg-tactical`, feed the transcript to the flow, set `CLIMAX_IN=meteor` / `CLIMAX_OUT=fade` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

impact, explosive, nuclear, meteor, shockwave, earthquake, power, slam, meteor sky fall, impact
