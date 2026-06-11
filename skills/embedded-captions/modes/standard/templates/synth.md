---
name: cap-synth
description: "Cyber & Glitch caption template - vaporwave · glitch. Flow: glitch; climax 'OUTRUN' enters 'scan', exits 'scan-collapse'."
metadata:
  cluster: Cyber & Glitch
  tags: caption, talking-head, cyber, scan, glitch
---

# SYNTH

> Cyber & Glitch - **vaporwave · glitch**. flow: glitch · climax: sunset assemble

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **OUTRUN** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Orbitron'` |
| **Fill** | text `#f6e9ff` - active-word accent `#2de2e6` - climax fill: gradient |
| **Flow reveal** | `glitch` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`scan`** |
| **Climax exit** | **`scan-collapse`** |

## Copy

- Flow lines (verbatim sample): "drive into the" / "night"
- **Climax word:** `OUTRUN`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-synth {
  --ff: "Orbitron";
  --cfill: #f6e9ff;
  --cacc: #2de2e6;
}
.s-synth .climax span {
  background: linear-gradient(180deg, #ff2ea6, #ff9e2c 60%, #2de2e6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **glitch** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **scan** - `CLIMAX_OUT` = **scan-collapse** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-synth bg-neon`, feed the transcript to the flow, set `CLIMAX_IN=scan` / `CLIMAX_OUT=scan-collapse` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

cyber, glitch, hacker, tech, futuristic, terminal, synth, outrun
