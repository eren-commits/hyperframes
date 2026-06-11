# Caption Templates - HyperFrames rule set

> **DNA-first (2026-06):** for new Standard-mode work, set `"dna": "<name>"` in
> `standard.json` ([../../dna/README.md](../../dna/README.md)) — it fills font / fills /
> accent / climax-entrance and wires the climax three-act (rail yields → RMS-coupled
> per-letter entrance → breathe). **The 54 templates below are a LEGACY style-token
> library**: still compilable (explicit `font`/`cfill`/`cacc` fields always win over a
> DNA), and still useful as reference for looks no DNA covers yet — but many are
> preset-tier; run any pick through `references/reference-bar.md` before shipping.

> **In the embedded-captions skill, read [`PIPELINE.md`](PIPELINE.md) FIRST.** It overrides this library's
> asset-prep + contract for our pipeline: matte with **PP-MattingV2** (`scripts/matte.cjs`), NOT `remove-background`;
> use our `#root`/`#a-roll`/`#stage` contract; author **two files** (`index.html` = embed climax, `rail.html`
> = the rail). The style tokens + motion recipes below carry over unchanged.

Reproducible caption templates for talking-head video, authored for HyperFrames. Each template = a matted speaker + a flowing verbatim foreground caption + one climax word, on a single paused, seek-safe GSAP timeline.

## How to use this (a pull-based reference - don't read it all)

The order is **template-first**:

1. **Pick the template(s) you need** from the index below. _How many you read - one, a few, or none - is the calling agent's (or the upstream skill's) decision, not this folder's._ This is a reference library: pull only what you use.
2. **For each template you pick:** open its file in [`templates/`](templates/). It carries that template's style CSS + copy, and **names** its flow / climax-in / climax-out moves -> grep just those `### name`s in [`_motion.md`](_motion.md) (a catalog, not a read-through).
3. **Read [`_anatomy.md`](_anatomy.md) ONCE** - the shared scene + timeline engine, identical for all 54; only needed the first time you build with this set.

Net per template you touch: its one file + 2-3 named recipes; plus `_anatomy` once. Never the whole `_motion` catalog or all 54.

bash scripts/prepare.sh <project> # matte ∥ transcribe ∥ safe-zones (THIS skill — not remove-background)

## 54 templates

### Premium & Editorial

| Template        | File                                                   | Font                 | Climax  | Entrance -> Exit       | Scene                         |
| --------------- | ------------------------------------------------------ | -------------------- | ------- | ---------------------- | ----------------------------- |
| **KEYNOTE**     | [`templates/keynote.md`](templates/keynote.md)         | 'Inter'              | `FOCUS` | deblur -> fade         | dark studio (low-key)         |
| **EDITORIAL**   | [`templates/editorial.md`](templates/editorial.md)     | 'Playfair Display'   | `GRACE` | rise -> rise-off       | marble lobby (bright, warm)   |
| **DOCUMENTARY** | [`templates/documentary.md`](templates/documentary.md) | 'Inter'              | `WHY`   | expose -> expose-off   | podcast studio (mic in frame) |
| **WELLNESS**    | [`templates/wellness.md`](templates/wellness.md)       | 'Cormorant Garamond' | `calm`  | breathe -> breathe-off | bright beauty set             |
| **APEX MONO**   | [`templates/apex-mono.md`](templates/apex-mono.md)     | 'JetBrains Mono'     | `BUILD` | flip -> flip-off       | sci-fi cockpit                |

### Epic & Cinematic

| Template      | File                                               | Font     | Climax     | Entrance -> Exit      | Scene                 |
| ------------- | -------------------------------------------------- | -------- | ---------- | --------------------- | --------------------- |
| **TITAN**     | [`templates/titan.md`](templates/titan.md)         | 'Anton'  | `FEARLESS` | slam -> fade          | dark studio (low-key) |
| **TRAILER**   | [`templates/trailer.md`](templates/trailer.md)     | 'Cinzel' | `DESTINY`  | monument -> sink      | sci-fi cockpit        |
| **VOLT**      | [`templates/volt.md`](templates/volt.md)           | 'Anton'  | `RISE`     | fly -> fly-off        | outdoor / daylight    |
| **CINEMATIC** | [`templates/cinematic.md`](templates/cinematic.md) | 'Oswald' | `BEGIN`    | grandrise -> rise-off | dark studio (low-key) |

### Cyber & Glitch

| Template        | File                                                   | Font            | Climax   | Entrance -> Exit      | Scene                |
| --------------- | ------------------------------------------------------ | --------------- | -------- | --------------------- | -------------------- |
| **DATA BREACH** | [`templates/data-breach.md`](templates/data-breach.md) | 'Space Grotesk' | `ACCESS` | glitch -> glitch-out  | neon street at night |
| **TERMINAL**    | [`templates/terminal.md`](templates/terminal.md)       | 'VT323'         | `RUN`    | type -> untype        | sci-fi cockpit       |
| **SYNTH**       | [`templates/synth.md`](templates/synth.md)             | 'Orbitron'      | `OUTRUN` | scan -> scan-collapse | neon street at night |
| **HOLO HUD**    | [`templates/holo-hud.md`](templates/holo-hud.md)       | 'Orbitron'      | `ONLINE` | boot -> power-off     | sci-fi cockpit       |

### Horror & Tension

| Template       | File                                                 | Font            | Climax     | Entrance -> Exit | Scene                          |
| -------------- | ---------------------------------------------------- | --------------- | ---------- | ---------------- | ------------------------------ |
| **DREAD**      | [`templates/dread.md`](templates/dread.md)           | 'Special Elite' | `RUN`      | loom -> drag     | gritty basement, overhead lamp |
| **POSSESSED**  | [`templates/possessed.md`](templates/possessed.md)   | 'Special Elite' | `LEAVE`    | possess -> snap  | dark studio (low-key)          |
| **THRILLER**   | [`templates/thriller.md`](templates/thriller.md)     | 'Oswald'        | `BEHIND`   | glimpse -> cut   | dark studio (low-key)          |
| **TRUE CRIME** | [`templates/true-crime.md`](templates/true-crime.md) | 'Special Elite' | `UNSOLVED` | seep -> bleed    | gritty basement, overhead lamp |

### Luxury & Elegant

| Template    | File                                           | Font               | Climax    | Entrance -> Exit | Scene             |
| ----------- | ---------------------------------------------- | ------------------ | --------- | ---------------- | ----------------- |
| **FASHION** | [`templates/fashion.md`](templates/fashion.md) | 'Playfair Display' | `COUTURE` | hairrise -> lift | bright beauty set |

### Retro & Analog

| Template      | File                                               | Font             | Climax     | Entrance -> Exit   | Scene                         |
| ------------- | -------------------------------------------------- | ---------------- | ---------- | ------------------ | ----------------------------- |
| **VHS**       | [`templates/vhs.md`](templates/vhs.md)             | 'VT323'          | `REWIND`   | vhs -> vhs-out     | bright home office            |
| **NEWSPRINT** | [`templates/newsprint.md`](templates/newsprint.md) | 'Special Elite'  | `BREAKING` | stamp -> lift2     | podcast studio (mic in frame) |
| **ARCADE**    | [`templates/arcade.md`](templates/arcade.md)       | 'Press Start 2P' | `1UP`      | blink -> blink-out | bright home office            |
| **CLI**       | [`templates/cli.md`](templates/cli.md)             | 'VT323'          | `LIVE`     | type -> untype     | sci-fi cockpit                |

### Neon & Night

| Template          | File                                                       | Font      | Climax    | Entrance -> Exit   | Scene                |
| ----------------- | ---------------------------------------------------------- | --------- | --------- | ------------------ | -------------------- |
| **NEON DISTRICT** | [`templates/neon-district.md`](templates/neon-district.md) | 'Monoton' | `OPEN`    | ignite -> neon-out | neon street at night |
| **BAR SIGN**      | [`templates/bar-sign.md`](templates/bar-sign.md)           | 'Monoton' | `WHISKEY` | buzz -> power-down | neon street at night |

### Hype & Sport

| Template      | File                                               | Font                | Climax       | Entrance -> Exit | Scene                          |
| ------------- | -------------------------------------------------- | ------------------- | ------------ | ---------------- | ------------------------------ |
| **PRIMETIME** | [`templates/primetime.md`](templates/primetime.md) | 'Teko'              | `GAME ON`    | stomp -> knock   | outdoor / daylight             |
| **GYM**       | [`templates/gym.md`](templates/gym.md)             | 'Saira Stencil One' | `NO EXCUSES` | punch -> knock   | gritty basement, overhead lamp |
| **STREET**    | [`templates/street.md`](templates/street.md)       | 'Permanent Marker'  | `FRESH`      | slap -> peel     | outdoor / daylight             |

### Playful & Friendly

| Template    | File                                           | Font      | Climax     | Entrance -> Exit     | Scene              |
| ----------- | ---------------------------------------------- | --------- | ---------- | -------------------- | ------------------ |
| **CANDY**   | [`templates/candy.md`](templates/candy.md)     | 'Baloo 2' | `YAY!`     | jelly -> popout      | bright home office |
| **KIDS**    | [`templates/kids.md`](templates/kids.md)       | 'Fredoka' | `WOW`      | dropb -> hop         | bright home office |
| **VLOG**    | [`templates/vlog.md`](templates/vlog.md)       | 'Caveat'  | `obsessed` | scrawl -> scrawl-off | bright beauty set  |
| **STICKER** | [`templates/sticker.md`](templates/sticker.md) | 'Baloo 2' | `OMG`      | popr -> popout       | outdoor / daylight |

### Creator & Social

| Template        | File                                                   | Font    | Climax    | Entrance -> Exit     | Scene                         |
| --------------- | ------------------------------------------------------ | ------- | --------- | -------------------- | ----------------------------- |
| **HORMOZI**     | [`templates/hormozi.md`](templates/hormozi.md)         | 'Inter' | `MONEY`   | boxpop -> fade       | bright home office            |
| **PODCAST**     | [`templates/podcast.md`](templates/podcast.md)         | 'Inter' | `MINDSET` | slideup -> slidedown | podcast studio (mic in frame) |
| **EDUCATION**   | [`templates/education.md`](templates/education.md)     | 'Inter' | `LEARN`   | flip -> flip-off     | bright home office            |
| **BEAUTY VLOG** | [`templates/beauty-vlog.md`](templates/beauty-vlog.md) | 'Sora'  | `GLOW`    | shimmer -> shim-out  | bright beauty set             |

### Ultra ✦ Maximum Flash

| Template         | File                                                     | Font            | Climax   | Entrance -> Exit       | Scene                 |
| ---------------- | -------------------------------------------------------- | --------------- | -------- | ---------------------- | --------------------- |
| **VOLTAGE**      | [`templates/voltage.md`](templates/voltage.md)           | 'Orbitron'      | `CHARGE` | volt -> neon-out       | sci-fi cockpit        |
| **HYPERDRIVE**   | [`templates/hyperdrive.md`](templates/hyperdrive.md)     | 'Orbitron'      | `WARP`   | hyper -> hyper-out     | sci-fi cockpit        |
| **LIQUID METAL** | [`templates/liquid-metal.md`](templates/liquid-metal.md) | 'Archivo Black' | `FLUX`   | liquid -> liquid-out   | dark studio (low-key) |
| **PRISM**        | [`templates/prism.md`](templates/prism.md)               | 'Archivo Black' | `PRISM`  | prism -> prism-out     | neon street at night  |
| **SHATTER**      | [`templates/shatter.md`](templates/shatter.md)           | 'Archivo Black' | `BREAK`  | shatter -> shatter-out | dark studio (low-key) |
| **MONOLITH**     | [`templates/monolith.md`](templates/monolith.md)         | 'Archivo Black' | `EMPIRE` | extrude -> fade        | sci-fi cockpit        |

### Atelier · Design-Forward

| Template                      | File                                                   | Font               | Climax    | Entrance -> Exit      | Scene                         |
| ----------------------------- | ------------------------------------------------------ | ------------------ | --------- | --------------------- | ----------------------------- |
| **SWISS**                     | [`templates/swiss.md`](templates/swiss.md)             | 'Inter'            | `ORDER`   | editwipe -> sweep-off | podcast studio (mic in frame) |
| **DIDONE**                    | [`templates/didone.md`](templates/didone.md)           | 'Bodoni Moda'      | `VOGUE`   | rise -> rise-off      | bright beauty set             |
| **BAUHAUS**                   | [`templates/bauhaus.md`](templates/bauhaus.md)         | 'Poppins'          | `FORM`    | block -> fade         | bright home office            |
| **BRUTALIST**                 | [`templates/brutalist.md`](templates/brutalist.md)     | 'JetBrains Mono'   | `RAW`     | editwipe -> sweep-off | dark studio (low-key)         |
| **TATEGAKI Vertical Writing** | [`templates/tategaki.md`](templates/tategaki.md)       | 'Shippori Mincho'  | `SILENCE` | vert -> fade          | dark studio (low-key)         |
| **INK**                       | [`templates/ink.md`](templates/ink.md)                 | 'Caveat'           | `muse`    | ink -> fade           | outdoor / daylight            |
| **VARIABLE**                  | [`templates/variable.md`](templates/variable.md)       | 'Inter'            | `BOLD`    | weight -> fade        | sci-fi cockpit                |
| **MID-CENTURY**               | [`templates/mid-century.md`](templates/mid-century.md) | 'Playfair Display' | `ICON`    | rise -> rise-off      | podcast studio (mic in frame) |

### Impact 💥 Bold

| Template                        | File                                                 | Font                | Climax   | Entrance -> Exit | Scene                          |
| ------------------------------- | ---------------------------------------------------- | ------------------- | -------- | ---------------- | ------------------------------ |
| **NUKE Nuclear Blast**          | [`templates/nuke.md`](templates/nuke.md)             | 'Archivo Black'     | `BLAST`  | nuke -> fade     | dark studio (low-key)          |
| **METEOR Sky Fall**             | [`templates/meteor.md`](templates/meteor.md)         | 'Anton'             | `IMPACT` | meteor -> fade   | gritty basement, overhead lamp |
| **SONIC BOOM**                  | [`templates/sonic-boom.md`](templates/sonic-boom.md) | 'Archivo Black'     | `BOOM`   | sonic -> fade    | sci-fi cockpit                 |
| **SEISMIC Earthquake**          | [`templates/seismic.md`](templates/seismic.md)       | 'Saira Stencil One' | `QUAKE`  | seismic -> fade  | outdoor / daylight             |
| **JUDGEMENT Divine Punishment** | [`templates/judgement.md`](templates/judgement.md)   | 'Cinzel'            | `POWER`  | judge -> fade    | dark studio (low-key)          |
