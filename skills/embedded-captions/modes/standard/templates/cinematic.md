---
name: cap-cinematic
description: "Epic & Cinematic caption template - film · slam. Flow: pop; climax 'BEGIN' enters 'grandrise', exits 'rise-off'."
metadata:
  cluster: Epic & Cinematic
  tags: caption, talking-head, epic, grandrise, pop
---

# CINEMATIC

> Epic & Cinematic - **film · slam**. flow: pop · climax: slam, gold accent

A complete caption template (see `../_anatomy.md` for the scene engine, `../_motion.md` for the named moves). The flow caption reveals verbatim word-by-word; the climax **BEGIN** is the one big beat behind the speaker.

## Recipe

|     |     |
| --- | --- |

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
| **Font** | `'Oswald'` |
| **Fill** | text `#e9e6dd` - active-word accent `#e3c06a` - climax fill: solid |
| **Flow reveal** | `pop` (per-word, from `transcribe`) -> active word gets the accent |
| **Climax entrance** | **`grandrise`** |
| **Climax exit** | **`rise-off`** |

## Copy

- Flow lines (verbatim sample): "every ending is" / "a beginning"
- **Climax word:** `BEGIN`

(Swap in the real `transcript.json` words for the flow; keep the climax as the hand-authored headline beat.)

## Style (drop in beside the `_anatomy.md` base CSS)

```css
.s-cine {
  --ff: "Oswald";
  --cfill: #e9e6dd;
  --cacc: #e3c06a;
}
```

## Motion (names -> `../_motion.md`)

- `FLOW_IN` = **pop** - `FLOW_OUT` = fade-out (~75% of entry)
- `CLIMAX_IN` = **grandrise** - `CLIMAX_OUT` = **rise-off** (ends `opacity:0`, hard exit)
- Climax dwell **>=1 s** after the entrance settles; effects only at the climax.

## Reproduce

```bash
bash scripts/prepare.sh   <project>      # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)
npx hyperframes transcribe   subject.mp4 --model small      # -> transcript.json
```

Build the `_anatomy.md` scene with class `stage s-cine bg-dark`, feed the transcript to the flow, set `CLIMAX_IN=grandrise` / `CLIMAX_OUT=rise-off` from `_motion.md`, then `npx hyperframes lint && npx hyperframes validate`.

## Triggers

epic, cinematic, trailer, motivational, bold, dramatic, cinematic, begin
