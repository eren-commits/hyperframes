# Step 6: Validate & Deliver

This is the quality gate. Before the user sees anything, YOU verify that the video matches the storyboard, the creative direction from Step 2, and DESIGN.md. Deliver something you'd be proud to post with your name on it.

## Lint + Validate + Snapshot

The `hyperframes` skill (which you loaded in Step 5) already covers the mechanics of linting, validating, and snapshotting. Follow those rules — run lint, validate, take snapshots scaled to the video length (formula: `max(beats × 3, ceil(duration_seconds / 2))`). Fix errors. This step adds the **pipeline-specific verification** on top of that.

**Errors:** Fix ALL of them. These are real problems — missing timeline registration, broken scripts, missing assets.

**Warnings:** Read each one and decide. Some are real quality issues you must fix:

- **GSAP tween overlaps** — elements fighting over the same property = visual glitches
- **Unscoped selectors** — will target elements in ALL compositions when bundled, causing data loss
- **Missing `class="clip"`** — element visible for entire video instead of its scheduled time
- **Missing `data-start` on root** — playback won't begin

Some are style suggestions you can safely ignore:

- **File too large** — composition works fine, just harder to read
- **Deprecated attributes** (data-layer, data-end) — still work, just not preferred
- **Dense tracks** — informational, not a bug

Don't blindly ignore 158 warnings. Don't blindly fix all of them either. Read them.

## Visual Verification (snapshot)

After lint and validate pass, capture snapshot frames to SEE your own output. **Take many snapshots — as much as you can actually read and view all of them without hitting diminishing returns**. This is your only visual feedback before the user sees the project. You wanna be honored and proud of what you give to the user.

Scale snapshot count to the video — not a fixed number. Formula: `max(beats × 3, ceil(duration_seconds / 2))`. A 3-beat 10s video: max(9, 5) = 9 frames. An 8-beat 60s video: max(24, 30) = 30 frames. Aim for at least 3 frames per beat: entrance, hold, and near-exit.

```bash
# Standard snapshot — Gemini vision runs automatically if GEMINI_API_KEY is set:
npx tsx packages/cli/src/cli.ts snapshot <project-dir> --frames <N>

# Pass a custom question to Gemini instead of the default prompt:
npx tsx packages/cli/src/cli.ts snapshot <project-dir> --frames <N> \
  --describe "Is the brand logo visible in every beat? Is any beat showing a black or blank frame?"
```

Output lands in `<project-dir>/snapshots/`. Gemini writes `snapshots/descriptions.md` automatically.

**Read `descriptions.md` before viewing the contact sheet.** It gives you an objective written description of every frame — what Gemini sees in each one. A description saying "black screen" or "loading overlay visible" for a content beat is a bug to fix. Compare every line against your storyboard spec before declaring the video done.

**Start with the contact sheet.** The snapshot command generates `snapshots/contact-sheet.jpg` (and `contact-sheet-2.jpg` etc. if you took many frames). View that first — it gives you the full picture of the video in one grid so you can spot obvious problems immediately (black frames, missing content, layout breaks). Then drill into individual frames for the beats that need closer inspection.

**View every snapshot image carefully.** Don't glance and move on. For each frame, check:

**Against the storyboard (STORYBOARD.md):**

- Does this frame match the beat description? Open the storyboard, find the beat for this timestamp, and compare. The storyboard said "MacBook mockup with dashboard on screen, aurora gradient background" — is that what you see?
- Are the specified assets actually visible? If the storyboard assigned `capture/screenshots/scroll-000.png` to this beat, is it showing?
- Does the animation sequence match? If the storyboard says "cards fly in from the right with back.out(1.4)" — at the right timestamp, are they mid-flight from the right?

**Against the creative direction (Step 2):**

- Does the overall feel match what the user asked for? If they said "cinematic, dark, premium" — does this look cinematic, dark, and premium? Or does it look generic? Be absolutely honest and real!!
- Are the brand colors from DESIGN.md actually being used? Check hex values against what's rendered. Again, no lies, be honest and real!

**Technical quality:**

- Is there visible content? All-white or all-black frames mean compositions aren't rendering.
- Can you read ALL text? White text on white/light background is invisible. Every text element needs contrast against what's directly behind it.
- Are images and assets showing? Empty space where an image should be means a path issue or missing file.
- Do background images fill the intended area? Check against the storyboard — if it said full-bleed, it should be full-bleed.
- Does the frame density match the storyboard spec? A beat planned as sparse should have open space — "too empty" is only wrong if the storyboard called for rich. Check the spec, not your instinct.
- Are elements overlapping incorrectly? Text over text, or content bleeding off edges?

**Fix issues as you find them.** Go back to that composition, fix the problem, re-snapshot at that timestamp, verify. Accumulating issues to fix later means they compound — a timing bug in beat 2 breaks beat 3. Fix one, re-verify, move on.

**Take your time reviewing.** A 30-second video has ~900 frames at 30fps — even 15 snapshots sample less than 2% of them. If something looks off in one snapshot, it's probably off for dozens of surrounding frames too. Worth checking a couple more around that timestamp.

## Preview (always do this)

Always start the preview so the user can see and scrub through the project:

```bash
npx hyperframes preview
```

The Studio URL is the deliverable. In your final response, always include it:

```text
http://localhost:<port>/#project/<project-name>
```

Use the actual port and project name from the preview command output. Do NOT present `index.html` as the project link — that's the source file. The user-facing project is the running Studio preview.

## Render (on-demand only)

**Do NOT render automatically.** Preview is the delivery — the user scrubs, spots tweaks, and you iterate. Rendering takes minutes per pass and is wasted if the user wants changes.

Only render when the user **explicitly asks** — "render it", "make the final", "export the MP4", "I'm happy, produce the file."

When rendering, **always specify quality and resolution explicitly.** Don't use defaults silently — pick the right settings for the use case and tell the user what you're rendering:

```bash
# Standard quality, 1080p landscape (default for most videos)
npx hyperframes render --output renders/<name>.mp4 --quality standard --fps 30

# High quality for final delivery
npx hyperframes render --output renders/<name>.mp4 --quality high --fps 30

# Portrait for Instagram Stories / TikTok
npx hyperframes render --output renders/<name>.mp4 --quality standard --fps 30 --resolution portrait

# 4K for premium output
npx hyperframes render --output renders/<name>.mp4 --quality high --fps 30 --resolution 4k
```

**Available options:**

| Flag              | Values                                                                                     | Notes                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `--quality`       | `draft`, `standard`, `high`                                                                | draft = fast/low, standard = balanced, high = slow/best                            |
| `--fps`           | `24`, `30`, `60`                                                                           | 30 is standard, 24 for cinematic feel, 60 for smooth motion                        |
| `--resolution`    | `landscape` (1920×1080), `portrait` (1080×1920), `landscape-4k` (3840×2160), `portrait-4k` | Aliases: `1080p`, `4k`, `uhd`                                                      |
| `--format`        | `mp4`, `webm`, `mov`, `png-sequence`                                                       | mp4 default. mov/webm for transparency. png-sequence for AE/Nuke                   |
| `--output`        | path                                                                                       | Always set to `renders/<project-name>.mp4` for readable names                      |
| `--gpu`           | flag                                                                                       | Use GPU encoding if available (faster)                                             |
| `--crf`           | integer                                                                                    | Override encoder quality (lower = better, mutually exclusive with --video-bitrate) |
| `--video-bitrate` | e.g. `10M`                                                                                 | Target bitrate (mutually exclusive with --crf)                                     |

Tell the user what you're rendering and why: "Rendering at standard quality, 1080p landscape, 30fps — this gives good quality with reasonable render time. Want me to use high quality or 4K instead?"
