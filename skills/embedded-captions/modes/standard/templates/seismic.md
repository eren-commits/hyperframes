---
name: cap-seismic
description: "Impact 💥 Bold caption template - fissure line + long rumble. Flow: pop; climax 'QUAKE' enters 'seismic', exits 'fade'."
metadata:
  cluster: Impact 💥 Bold
  tags: caption, talking-head, impact, seismic, pop
---

# SEISMIC Earthquake

> Impact 💥 Bold - **fissure line + long rumble**. flow: fade · climax: slam → gold fissure splits frame → sustained shake

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **QUAKE** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Saira Stencil One'` |
| **Fill** | text `#fff` - active-word accent `#ffb000` - climax fill: solid |
| **Flow reveal** | `pop` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`seismic`** |
| **Climax exit** | **`fade`** |

## Copy

- Flow lines (verbatim sample): "the ground" / "splits open"
- **Climax word:** `QUAKE`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-seismic {
  --ff: "Saira Stencil One";
  --cfill: #fff;
  --cacc: #ffb000;
}
.s-seismic .flow {
  font-family: "Oswald";
  font-weight: 700;
  text-transform: uppercase;
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **pop** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **seismic** - `CLIMAX_OUT` = **fade** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.
- **Note:** climax effect: stage-level quake (decaying x/y jitter) on the beat.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-seismic bg-outdoor`, feed the transcript to the flow, set `CLIMAX_IN=seismic` / `CLIMAX_OUT=fade` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

impact, explosive, nuclear, meteor, shockwave, earthquake, power, slam, seismic earthquake, quake
