---
name: cap-nuke
description: "Impact 💥 Bold caption template - flash + shockwave + quake. Flow: pop; climax 'BLAST' enters 'nuke', exits 'fade'."
metadata:
  cluster: Impact 💥 Bold
  tags: caption, talking-head, impact, nuke, pop
---

# NUKE Nuclear Blast

> Impact 💥 Bold - **flash + shockwave + quake**. flow: pop · climax: erupt → blinding flash → ring → shake

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **BLAST** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Archivo Black'` |
| **Fill** | text `#fff` - active-word accent `#ffb04a` - climax fill: solid |
| **Flow reveal** | `pop` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`nuke`** |
| **Climax exit** | **`fade`** |

## Copy

- Flow lines (verbatim sample): "this changes" / "everything"
- **Climax word:** `BLAST`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-nuke {
  --ff: "Archivo Black";
  --cfill: #fff;
  --cacc: #ffb04a;
}
.s-nuke .flow {
  font-weight: 700;
}
.s-nuke .climax span {
  text-shadow:
    0 0 22px rgba(255, 150, 40, 0.7),
    0 0 62px rgba(255, 90, 0, 0.4);
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **pop** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **nuke** - `CLIMAX_OUT` = **fade** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.
- **Note:** climax effect: add a white `.flash` overlay (fade out 0.3s) + a brief stage shake.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-nuke bg-dark`, feed the transcript to the flow, set `CLIMAX_IN=nuke` / `CLIMAX_OUT=fade` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

impact, explosive, nuclear, meteor, shockwave, earthquake, power, slam, nuke nuclear blast, blast
