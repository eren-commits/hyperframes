---
name: cap-judgement
description: "Impact 💥 Bold caption template - light-beam descent + bloom. Flow: pop; climax 'POWER' enters 'judge', exits 'fade'."
metadata:
  cluster: Impact 💥 Bold
  tags: caption, talking-head, impact, judge, pop
---

# JUDGEMENT Divine Punishment

> Impact 💥 Bold - **light-beam descent + bloom**. flow: fade · climax: descends in a beam of light → weight → shake

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **POWER** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Cinzel'` |
| **Fill** | text `#fff` - active-word accent `#ffe9a8` - climax fill: solid |
| **Flow reveal** | `pop` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`judge`** |
| **Climax exit** | **`fade`** |

## Copy

- Flow lines (verbatim sample): "from high" / "above it descends"
- **Climax word:** `POWER`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-judge {
  --ff: "Cinzel";
  --cfill: #fff;
  --cacc: #ffe9a8;
}
.s-judge .climax span {
  text-shadow:
    0 0 30px rgba(255, 240, 180, 0.7),
    0 0 72px rgba(255, 210, 120, 0.4);
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **pop** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **judge** - `CLIMAX_OUT` = **fade** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.
- **Note:** climax effect: descends from above + a light-shaft `.flash`.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-judge bg-dark`, feed the transcript to the flow, set `CLIMAX_IN=judge` / `CLIMAX_OUT=fade` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

impact, explosive, nuclear, meteor, shockwave, earthquake, power, slam, judgement divine punishment, power
