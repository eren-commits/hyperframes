#!/usr/bin/env node
/*
 * make-theme.cjs — THEME mode compiler (third compiler, beside standard/cinematic).
 *
 * A theme DNA (themes/<name>.json) is a complete visual constitution composed
 * from two registries implemented HERE, once, for all DNAs:
 *
 *   BODY PARADIGMS  how the transcript surface lives
 *     rail      lower-third lines that replace each other (fg alpha)
 *     panel     console log accumulating in a docked glass panel (fg alpha)
 *     poem      lines accumulate in open space, stanza by stanza (fg alpha)
 *     takeover  every beat owns the full frame as a hard-cut card (bg)
 *
 *   HERO SETPIECES  the climax choreography
 *     detonation  sliced stencil stamp: shear-in, snap, squash, cool, furniture
 *     decode      slot-machine glyph reels lock left→right, CRT-off exit
 *     drawon      single-line-font stroke-order writing (sequential dash reveal)
 *     assembly    inline word assembles from inbound particles (poem apex)
 *     colorflip   inline accent-color crush card (takeover apex)
 *
 * plus LINKAGES (theme interactions: redact-until-hero, disperse-on-last-word,
 * corrupt-on-last-word) and a PLATE budget compiled to _postfx.sh.
 *
 * Inputs : <project>/theme.json  { dna, lines:[[w,...],...], hero:{match,text?},
 *           minors?:[...], width?, height?, fps? }
 *          <project>/transcript.json (verbatim, word timings)
 *          themes/<dna>.json
 * Outputs: index.html (bg: plate reaction + embedded setpiece)
 *          rail.html  (fg alpha: body paradigm + front fx)   [unless body.layer=bg]
 *          _postfx.sh (plate reaction: punch/shake/grain after composite)
 *
 * Render: scripts/render-theme.sh <project>   (render-and-composite + postfx)
 *
 * Determinism contract: paused GSAP on window.__timelines["main"], seeded PRNG
 * only (mulberry32), set-chains / pure-f(t) keyframes, no Math.random/Date.now.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const PROJECT = path.resolve(process.argv[2] || ".");
const SKILL = path.resolve(__dirname, "..");
const F = 1 / 24;

// ---------- load inputs ----------
const theme = JSON.parse(fs.readFileSync(path.join(PROJECT, "theme.json"), "utf8"));
const dna = JSON.parse(fs.readFileSync(path.join(SKILL, "themes", theme.dna + ".json"), "utf8"));
const transcript = JSON.parse(fs.readFileSync(path.join(PROJECT, "transcript.json"), "utf8"));
const W = theme.width || 1280, H = theme.height || 720;

// FPS: matte.fps is AUTHORITATIVE (written by matte.cjs at the source's native
// rate; the matte overlay + postfx zoompan must run at this rate or the output
// retimes). theme.fps only overrides when matte.fps is absent.
function readMatteFps() {
  try {
    const v = parseInt(fs.readFileSync(path.join(PROJECT, "matte.fps"), "utf8").replace(/\D/g, ""), 10);
    return v > 0 ? v : null;
  } catch (e) { return null; }
}
const FPS = readMatteFps() || theme.fps || 24;

function probeDuration() {
  try {
    const out = execSync(
      `ffprobe -v error -show_entries format=duration -of csv=p=0 "${path.join(PROJECT, "source.mp4")}"`,
      { encoding: "utf8" });
    return parseFloat(out.trim());
  } catch (e) {
    const n = fs.readdirSync(path.join(PROJECT, "frames_fg")).length;
    return n / FPS;
  }
}
const DUR = +(theme.duration || probeDuration()).toFixed(6);

// ---------- scene awareness (safe-zones.json): inherit the typography system ----------
// The existing modes' scene intelligence applies here too: hero placement comes
// from the measured occlusion bands + subject anchor, panel/poem dock on the
// clearer side, and hero font size is width-fit to the actual word. Explicit
// theme.json values > scene auto > DNA fallback.
function readJson2(p) { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch (e) { return null; } }
const sz = readJson2(path.join(PROJECT, "safe-zones.json"));

// per-setpiece preferred band (topPct of the hero's TOP edge)
const SETPIECE_PREF_TOP = { detonation: 28, decode: 26, drawon: 18 };

function sceneHeroXY(setpiece, fontPx) {
  const exX = theme.hero && theme.hero.x, exY = theme.hero && theme.hero.y;
  let x = exX ?? null, y = exY ?? null;
  if (x == null && sz && sz.heroAnchor && sz.heroAnchor.centerXPct != null)
    x = (W * sz.heroAnchor.centerXPct) / 100;
  if (x == null) x = dna.hero.x ?? W / 2;
  if (y == null && sz && sz.heroBands && Array.isArray(sz.heroBands.profile)) {
    const pref = SETPIECE_PREF_TOP[setpiece] ?? 28;
    const ok = sz.heroBands.profile.filter((b) => b.occPct >= 18 && b.occPct <= 55);
    const pool = ok.length ? ok : sz.heroBands.profile;
    const best = pool.reduce((a, b) =>
      Math.abs(b.topPct - pref) < Math.abs(a.topPct - pref) ? b : a);
    y = (H * best.topPct) / 100 + fontPx * 0.55;       // band top → glyph center
  }
  if (y == null) y = dna.hero.y ?? H * 0.37;
  return { x: Math.round(x), y: Math.round(y) };
}

// width-fit: hero font size from the actual word (never overflow, never timid)
function fitHeroPx(text, basePx, emPerChar, maxFrac) {
  const est = (px) => text.length * emPerChar * px;
  let px = basePx;
  const maxW = W * (maxFrac || 0.92);
  if (est(px) > maxW) px = Math.floor(maxW / (text.length * emPerChar));
  // short words: allow growth toward the poster fill, capped
  else if (est(px) < W * 0.55) px = Math.min(Math.floor(maxW / (text.length * emPerChar)), Math.round(basePx * 1.25));
  return Math.max(64, px);
}

// clearer side for docked furniture (panel / poem): away from the subject
const CLEARER = (sz && sz.subject && sz.subject.clearerSide) || "left";

// ---------- word timing: sequential matcher (verbatim completeness) ----------
const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}']/gu, "");
const tWords = transcript.words.map((w) => ({
  text: w.text ?? w.word, start: w.start, end: w.end, used: false,
}));
let cursor = 0;
function takeWord(authored) {
  const target = norm(authored);
  for (let i = cursor; i < Math.min(cursor + 3, tWords.length); i++) {
    if (norm(tWords[i].text) === target) {
      if (tWords[i].used)
        throw new Error(`[make-theme] "${authored}" is already claimed by hero.match — embed setpieces own the hero word: leave it OUT of lines (rail↔climax hand-off)`);
      tWords[i].used = true; cursor = i + 1; return tWords[i];
    }
  }
  throw new Error(`[make-theme] cannot match authored word "${authored}" near transcript position ${cursor} ("${(tWords[cursor]||{}).text}") — lines must follow transcript order verbatim`);
}

// hero phrase: located independently in the transcript (it may sit between lines)
function findPhrase(phrase) {
  const parts = phrase.trim().split(/\s+/).map(norm);
  for (let i = 0; i <= tWords.length - parts.length; i++) {
    if (parts.every((p, k) => norm(tWords[i + k].text) === p)) {
      return { start: tWords[i].start, end: tWords[i + parts.length - 1].end,
               idx: i, len: parts.length };
    }
  }
  throw new Error(`[make-theme] hero phrase "${phrase}" not found in transcript`);
}
const heroInline = !!dna.hero.inline;
const hero = theme.hero ? findPhrase(theme.hero.match) : null;
if (!hero) throw new Error("[make-theme] theme.json requires hero:{match}");
const heroText = (theme.hero.text || theme.hero.match).toUpperCase();
const heroDisplay = theme.hero.text || theme.hero.match; // case preserved for drawon/assembly

// mark hero transcript words as consumed when the setpiece is EMBED (not inline):
// the rail/panel/poem must NOT contain them (rail↔climax hand-off), except panel
// with redact linkage (panel shows them redacted — author includes them).
const redactLinkage = (dna.linkages || []).includes("redact-until-hero");
if (!heroInline && !redactLinkage) {
  for (let k = 0; k < hero.len; k++) tWords[hero.idx + k].used = true;
}

// resolve lines: every entry gets word objects with timings + role flags
const minors = new Set((theme.minors || []).map(norm));
const LINES = (theme.lines || []).map((arr, li) => {
  const words = arr.map((a) => {
    const tw = takeWord(a);
    return { display: a, start: tw.start, end: tw.end,
             minor: minors.has(norm(a)),
             isHero: norm(a) === norm(theme.hero.match.split(/\s+/)[0]) &&
                     tw.start >= hero.start - 0.01 && tw.start <= hero.end + 0.01 };
  });
  return { id: li, words };
});
// completeness gate
const unused = tWords.filter((w) => !w.used);
if (unused.length)
  throw new Error(`[make-theme] transcript words not covered by lines/hero: ${unused.map((w) => w.text).join(" ")}`);

// per-line windows
LINES.forEach((L, i) => {
  L.in = L.words[0].start - 0.02;
  L.out = i + 1 < LINES.length ? LINES[i + 1].words[0].start - 0.02 : DUR - 0.1;
});
const LASTWORD = LINES[LINES.length - 1].words[LINES[LINES.length - 1].words.length - 1];

// hero window: onset → end of clip or next sentence boundary
const heroIn = hero.start;
const heroOut = Math.min(DUR - 0.06, (theme.hero.out ?? DUR - 0.1));

// ---------- hero geometry: scene-aware position + width-fit size (computed ONCE,
// shared by the setpiece and the front fx so flash/rings/sparks stay centered) ----
const HG = { x: dna.hero.x ?? W / 2, y: dna.hero.y ?? H * 0.37, fontPx: dna.hero.fontPx || 178 };
if (!heroInline) {
  if (dna.hero.setpiece === "detonation") {
    HG.fontPx = fitHeroPx(heroText, dna.hero.fontPx || 178, 0.56, 0.92);
    Object.assign(HG, sceneHeroXY("detonation", HG.fontPx));
    HG.halfW = (heroText.length * 0.56 * HG.fontPx) / 2;
  } else if (dna.hero.setpiece === "decode") {
    const units = [...heroText].reduce((a, c) => a + (c === " " ? 0.38 : 0.82), 0);
    HG.fontPx = Math.min(dna.hero.fontPx || 112, Math.floor((W * 0.94) / units));
    Object.assign(HG, sceneHeroXY("decode", HG.fontPx));
    HG.halfW = (units * HG.fontPx) / 2;
  } else if (dna.hero.setpiece === "drawon") {
    Object.assign(HG, sceneHeroXY("drawon", 130));
    HG.halfW = Math.min((dna.hero.params.targetWidth || 640), W - 200) / 2;
  }
  // keep the word on frame
  if (HG.halfW) HG.x = Math.max(HG.halfW + 12, Math.min(W - HG.halfW - 12, HG.x));
  HG.y = Math.max(HG.fontPx * 0.55 + 8, Math.min(H * 0.62, HG.y));
}

// ---------- shared emit helpers ----------
const MULBERRY = `function mulberry32(a){return function(){a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;}}`;
const GSAP = `<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>`;

function bgSkeleton(stageHtml, css, js) {
  return `<!doctype html>
<!-- generated by make-theme.cjs — theme DNA "${dna.name}" (bg layer) -->
<html lang="en">
<head>
<meta charset="utf-8">
${GSAP}
<style>
  html, body { margin:0; padding:0; width:${W}px; height:${H}px; overflow:hidden; background:#000; }
  #root { position:relative; width:${W}px; height:${H}px; }
  #a-roll { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:1; }
  #stage { position:absolute; inset:0; z-index:2; }
${css}
</style>
</head>
<body>
  <div id="root" data-composition-id="main" data-start="0" data-duration="${DUR}"
       data-width="${W}" data-height="${H}">
    <video id="a-roll" src="source.mp4" muted playsinline
           data-duration="${DUR}" data-track-index="0"></video>
    <div id="stage">
${stageHtml}
    </div>
    <audio id="a-roll-audio" src="source.mp4" data-start="0" data-duration="${DUR}"
           data-track-index="3" data-volume="1"></audio>
  </div>
<script>
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });
  const F = ${F};
  ${MULBERRY}
${js}
  tl.seek(0);
  window.__timelines["main"] = tl;
</script>
</body>
</html>`;
}

function fgSkeleton(stageHtml, css, js) {
  return `<!doctype html>
<!-- generated by make-theme.cjs — theme DNA "${dna.name}" (fg alpha layer) -->
<html lang="en">
<head>
<meta charset="utf-8">
${GSAP}
<style>
  html, body { margin:0; padding:0; width:${W}px; height:${H}px; overflow:hidden; background:transparent; }
  #root { position:relative; width:${W}px; height:${H}px; }
  #stage { position:absolute; inset:0; }
${css}
</style>
</head>
<body>
  <div id="root" data-composition-id="main" data-start="0" data-duration="${DUR}"
       data-width="${W}" data-height="${H}">
    <div id="stage">
${stageHtml}
    </div>
  </div>
<script>
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });
  const F = ${F};
  ${MULBERRY}
${js}
  tl.seek(0);
  window.__timelines["main"] = tl;
</script>
</body>
</html>`;
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const J = JSON.stringify;

/* =====================================================================
 * BODY PARADIGMS — each returns { css, html, js } for the fg (or bg) file
 * ===================================================================== */

function paradigmRail() {
  const b = dna.body;
  const lineData = LINES.map((L) => ({
    id: "r" + L.id, in: +L.in.toFixed(3), out: +L.out.toFixed(3),
    words: L.words.map((w) => [w.display, +w.start.toFixed(3), w.minor ? 1 : 0]),
  }));
  const css = `
  .rail { position:absolute; left:${W / 2}px; top:${H - b.bottomPx}px; opacity:0; white-space:nowrap;
          font-family:'${dna.fonts.body}', sans-serif; font-size:${b.fontPx}px; line-height:1;
          letter-spacing:${b.letterSpacing || "0.02em"}; color:${dna.palette.body};
          ${b.textTransform ? "text-transform:" + b.textTransform + ";" : ""}
          text-shadow: ${b.glow || "0 3px 14px rgba(0,0,0,0.65), 0 1px 3px rgba(0,0,0,0.5)"}; }
  .rail .w { display:inline-block; opacity:0; margin:0 0.14em; }
  .rail .w.minor { font-size:${Math.round(b.fontPx * (b.minorScale || 1.4))}px; }
  .rail .w.em { color:${dna.palette.em || dna.palette.accent}; font-weight:700; }
  ${b.rule ? `#rrule { position:absolute; left:${W / 2}px; top:${H - b.bottomPx + 38}px; width:0; height:2px;
          background:${b.rule.color}; opacity:0.5; transform:translateX(-50%);
          box-shadow: 0 0 12px ${dna.palette.accent}; }` : ""}`;
  const html = lineData.map((L) => `      <div class="rail" id="${L.id}"></div>`).join("\n")
    + (b.rule ? `\n      <div id="rrule"></div>` : "");
  const stamp = b.entrance === "stamp";
  const js = `
  // ---- body paradigm: RAIL (${b.entrance} in / ${b.exit} out) ----
  const HOT = ${J(dna.palette.hot || dna.palette.accent)}, BONE = ${J(dna.palette.body)};
  const RAIL = ${J(lineData)};
  const rrnd = mulberry32(2026);
  RAIL.forEach((L) => {
    const line = document.getElementById(L.id);
    L.words.forEach(([txt,,minor]) => {
      const s = document.createElement("span");
      s.className = "w" + (minor ? (${J(stamp)} ? " minor" : " em") : "");
      s.textContent = txt; line.appendChild(s);
    });
    gsap.set(line, { xPercent: -50, yPercent: -100 });
    tl.set(line, { opacity: 1 }, L.in);
    L.words.forEach(([txt, st, minor], wi) => {
      const el = line.children[wi];
${stamp ? `      // STAMP: 1f appear oversized+hot, crush, recoil, cool to bone
      tl.set(el, { opacity: 1, scale: minor ? 2.1 : 1.28, color: HOT, transformOrigin: "50% 80%" }, st);
      tl.to(el, { scale: 1, duration: 0.11, ease: "power3.in" }, st + 0.01);
      tl.set(el, { scaleX: 1.05, scaleY: 0.95 }, st + 0.12);
      tl.to(el, { scaleX: 1, scaleY: 1, duration: 0.22, ease: "elastic.out(1, 0.45)" }, st + 0.16);
      tl.to(el, { color: minor ? "#F2CFA0" : BONE, duration: minor ? 0.6 : 0.32, ease: "power1.in" }, st + 0.15);
      tl.set(line, { y: minor ? 4 : 2 }, st + 0.02);
      tl.to(line, { y: 0, duration: 0.18, ease: "power2.out" }, st + 0.06);` : `      // FLICK: tube lights with seeded double-flicks
      tl.set(el, { opacity: 0.35 }, st);
      if (rrnd() < 0.35) { tl.set(el, { opacity: 0.08 }, st + F); tl.set(el, { opacity: 1 }, st + 2 * F); }
      else { tl.set(el, { opacity: 1 }, st + F); }
      if (minor) tl.fromTo(el, { scale: ${dna.body.emScale || 1.18} }, { scale: 1, duration: 0.3, ease: "power2.out" }, st + F);`}
    });
${b.exit === "drop" ? `    const xo = L.out - 0.18;   // exit completes before the next line stamps
    tl.to(line, { y: 34, opacity: 0, duration: 0.16, ease: "power2.in" }, xo);
    tl.set(line, { display: "none" }, xo + 0.18);` : `    // POWERCUT exit (completes before the next line)
    const xo = L.out - 0.17;
    tl.set(line, { opacity: 0.5 }, xo); tl.set(line, { opacity: 0.12 }, xo + F);
    tl.set(line, { opacity: 0 }, xo + 3 * F); tl.set(line, { display: "none" }, xo + 4 * F);`}
  });
${b.rule ? `  tl.fromTo("#rrule", { width: 0, opacity: 0 }, { width: ${b.rule.width}, opacity: 0.5, duration: 0.4, ease: "power2.out" }, 0.25);
  tl.to("#rrule", { opacity: 0, duration: 0.3 }, ${(DUR - 0.2).toFixed(2)});` : ""}
${b.yield ? `  // rail yields while the apex lands (furniture never contests the hero)
  RAIL.forEach((L) => {
    if (L.in < ${heroIn.toFixed(3)} + 0.9 && L.out > ${heroIn.toFixed(3)} - 0.3) {
      tl.to("#" + L.id, { opacity: ${b.yield.dim}, duration: 0.2 }, ${(heroIn - (b.yield.pre || 0.2)).toFixed(3)});
      tl.to("#" + L.id, { opacity: 1, duration: 0.25 }, ${(heroIn + (b.yield.post || 0.9)).toFixed(3)});
    }
  });` : ""}`;
  return { css, html, js };
}

function paradigmPanel() {
  const b = dna.body;
  const lockT = heroIn + 0.30 + (dna.hero.params.lockStagger || 0.045) * (heroText.length - 1) + 0.083;
  const lineData = LINES.map((L) => ({
    id: "ln" + L.id,
    words: L.words.map((w) => [w.display, +w.start.toFixed(3),
      // redaction: words inside the hero phrase window get blocks until lock
      redactLinkage && w.start >= hero.start - 0.01 && w.start <= hero.end + 0.01 ? +lockT.toFixed(3) : 0]),
  }));
  const lineH = Math.round(b.fontPx * 1.35);
  const maxVis = Math.max(3, Math.floor((H * 0.48 - 60) / lineH));
  const dockCss = CLEARER === "right"
    ? `right:${b.panel.left}px;` : `left:${b.panel.left}px;`;
  const css = `
  #panel { position:absolute; ${dockCss} bottom:${b.panel.bottom}px; width:${b.panel.width}px;
           padding:18px 22px 22px; background:${dna.palette.panelBg};
           border:1px solid ${dna.palette.accent}59; border-radius:4px; opacity:0;
           box-shadow: 0 0 24px rgba(0,0,0,0.35), inset 0 0 60px ${dna.palette.accent}0a; }
  #panel .hd { font-family:'${dna.fonts.tag}', monospace; font-size:22px; color:${dna.palette.prompt};
               letter-spacing:2px; border-bottom:1px solid ${dna.palette.accent}40;
               padding-bottom:8px; margin-bottom:10px; }
  .ln { font-family:'${dna.fonts.body}', monospace; font-size:${b.fontPx}px; line-height:1.35;
        color:${dna.palette.body}; text-shadow: 0 0 8px ${dna.palette.accent}59;
        white-space:nowrap; opacity:0; }
  .ln .pr { color:${dna.palette.prompt}; margin-right:8px; }
  .ln .w { display:inline-block; overflow:hidden; vertical-align:bottom; white-space:nowrap;
           margin-right:0.3em; }
  .ln .red { color:#7adcff; }
  .caret { display:inline-block; width:14px; height:26px; background:${dna.palette.body};
           vertical-align:baseline; opacity:0; margin-left:4px; }
  #logclip { max-height:${maxVis * lineH}px; overflow:hidden; }
  #logwrap { position:relative; }`;
  const html = `      <div id="panel">
        <div class="hd">${esc(theme.panelHeader || "OBS-01 // " + (b.panel.header || "LOG_"))}</div>
        <div id="logclip"><div id="logwrap">
${lineData.map((L) => `        <div class="ln" id="${L.id}"></div>`).join("\n")}
        </div></div>
      </div>`;
  const js = `
  // ---- body paradigm: PANEL (typed console log, accumulate) ----
  tl.fromTo("#panel", { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }, 0.05);
${b.yield ? `  tl.to("#panel", { opacity: ${b.yield.dim}, duration: 0.25, ease: "power1.in" }, ${(heroIn - 0.08).toFixed(3)});
  tl.to("#panel", { opacity: 1, duration: 0.3, ease: "power1.out" }, ${(lockT + 0.15).toFixed(3)});` : ""}
  const LOG = ${J(lineData)};
  const MAXVIS = ${maxVis}, LINEH = ${lineH};
  LOG.forEach((L, li) => {
    if (li >= MAXVIS) {  // terminal scroll: older rows slide up out of the clip
      tl.to("#logwrap", { y: -(li - MAXVIS + 1) * LINEH, duration: 0.28, ease: "power2.out" },
            L.words[0][1] - 0.10);
    }
    const line = document.getElementById(L.id);
    const p = document.createElement("span"); p.className = "pr"; p.textContent = "$";
    line.appendChild(p);
    tl.set(line, { opacity: 1 }, L.words[0][1] - 0.03);
    L.words.forEach(([txt, st, redUntil]) => {
      const wrap = document.createElement("span"); wrap.className = "w";
      const inner = document.createElement("span");
      inner.textContent = redUntil ? "█".repeat(Math.max(3, txt.length - 1)) : txt;
      wrap.appendChild(inner); line.appendChild(wrap);
      tl.fromTo(wrap, { width: 0 }, { width: "auto", duration: 0.12,
                ease: "steps(" + Math.max(2, txt.length) + ")" }, st);
      if (redUntil) {
        const real = document.createElement("span");
        real.textContent = txt; real.style.display = "none"; real.className = "red";
        wrap.appendChild(real);
        tl.set(inner, { display: "none" }, redUntil);
        tl.set(real, { display: "inline" }, redUntil);
      }
    });
${b.caret ? `    const c = document.createElement("span"); c.className = "caret"; line.appendChild(c);
    const lastEnd = L.words[L.words.length - 1][1] + 0.25;
    for (let bk = 0; bk < 4; bk++) tl.set(c, { opacity: bk % 2 === 0 ? 1 : 0 }, lastEnd + bk * 0.22);
    tl.set(c, { opacity: 0 }, lastEnd + 0.9);` : ""}
  });
${(dna.linkages || []).includes("corrupt-on-last-word") ? `  // the feed corrupts on the final word
  const NZ = ${(LASTWORD.start + 0.04).toFixed(3)};
  [[3,0],[-4,1],[3,2],[-2,3],[0,4]].forEach(([dx, k]) => {
    tl.set("#panel", { x: dx, filter: dx ? "hue-rotate(" + dx * 8 + "deg)" : "none" }, NZ + k * F);
  });
  tl.set("#panel", { x: 0, filter: "none" }, NZ + 5 * F);` : ""}`;
  return { css, html, js };
}

function paradigmPoem() {
  const b = dna.body;
  const colLeft = CLEARER === "right" ? Math.round(W * 0.52) : b.left;
  const scrimSide = CLEARER === "right" ? "right" : "left";
  // stanza split: break after a line whose last word ends a sentence
  const stanzas = [[]];
  LINES.forEach((L) => {
    stanzas[stanzas.length - 1].push(L);
    const last = L.words[L.words.length - 1].display;
    if (/[.!?]$/.test(last) && L !== LINES[LINES.length - 1]) stanzas.push([]);
  });
  if (stanzas.some((s) => s.length > b.stanzaTops.length))
    console.warn("[make-theme] poem stanza exceeds available slots — extra lines share the last slot");
  const stanzaData = stanzas.map((s, si) => s.map((L, li) => ({
    id: "s" + si + "l" + L.id,
    top: b.stanzaTops[Math.min(li, b.stanzaTops.length - 1)] + si * 16,
    words: L.words.map((w) => [w.display, +w.start.toFixed(3),
      w.isHero && heroInline ? "big" : (w.minor ? "em" : "")]),
  })));
  const lastStanzaIdx = stanzaData.length - 1;
  const css = `
  ${b.scrim ? `#pscrim { position:absolute; inset:0; opacity:0;
            background: linear-gradient(${scrimSide === "left" ? "100deg" : "260deg"},
              rgba(4,8,16,${b.scrim.opacity}) 0%, rgba(4,8,16,${b.scrim.opacity * 0.6}) 38%, rgba(4,8,16,0) 62%); }` : ""}
  .pline { position:absolute; left:${colLeft}px; white-space:nowrap;
           font-family:'${dna.fonts.body}', serif; font-weight:600; font-size:${b.fontPx}px;
           line-height:1; color:${dna.palette.body};
           text-shadow: 0 0 14px rgba(255,244,214,0.5), 0 2px 12px rgba(0,0,0,0.6); }
  .pline .l { display:inline-block; opacity:0; }
  .pline .sp { display:inline-block; width:0.28em; }
  .pline .big { font-size:${Math.round(b.fontPx * (b.bigScale || 2))}px; font-style:italic; font-weight:700;
                text-shadow: 0 0 24px rgba(255,244,214,0.7), 0 2px 14px rgba(0,0,0,0.6); }
  .pline .em  { font-size:${Math.round(b.fontPx * (b.emScale || 1.38))}px; font-style:italic; font-weight:700; }
  .star { position:absolute; border-radius:50%; background:#fff7e0; opacity:0;
          box-shadow: 0 0 8px rgba(255,247,224,0.9); }`;
  const html = (b.scrim ? `      <div id="pscrim"></div>\n` : "")
    + stanzaData.flat().map((L) => `      <div class="pline" id="${L.id}" style="top:${L.top}px"></div>`).join("\n");
  const disperse = (dna.linkages || []).includes("disperse-on-last-word");
  const js = `
  // ---- body paradigm: POEM (condense, accumulate, ${disperse ? "disperse" : "hold"}) ----
  const prnd = mulberry32(${b.seed || 777});
  const stage = document.getElementById("stage");
${b.scrim ? `  tl.fromTo("#pscrim", { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power1.out" }, 0.15);
  tl.to("#pscrim", { opacity: 0, duration: 0.4, ease: "power1.in" }, ${(LASTWORD.start + 0.15).toFixed(3)});` : ""}
  const STANZAS = ${J(stanzaData)};
  const lastLetters = [];
  STANZAS.forEach((stanza, si) => {
    stanza.forEach((L) => {
      const line = document.getElementById(L.id);
      L.words.forEach(([txt, st, cls], wi) => {
        if (wi > 0) { const g = document.createElement("span"); g.className = "sp"; line.appendChild(g); }
        const letters = [];
        for (const ch of txt) {
          const l = document.createElement("span");
          l.className = "l" + (cls ? " " + cls : ""); l.textContent = ch;
          line.appendChild(l); letters.push(l);
        }
        const spread = cls === "big" ? ${dna.hero.params.spread || 150} : 46;
        letters.forEach((l, li) => {
          const sx = (prnd() - 0.5) * 2 * spread, sy = (prnd() - 0.5) * 2 * spread * 0.7;
          tl.fromTo(l, { x: sx, y: sy, opacity: 0, filter: "blur(6px)" },
            { x: 0, y: 0, opacity: 1, filter: "blur(0px)",
              duration: cls === "big" ? 0.7 : 0.5, ease: "power2.out" },
            st - 0.04 + li * (cls === "big" ? 0.03 : 0.016));
          if (si === ${lastStanzaIdx}) lastLetters.push(l);
        });
        if (cls === "big") {
          // SETPIECE assembly: star particles fly INTO the apex as it forms
          const lt = line.style.top ? parseFloat(line.style.top) : 110;
          for (let i = 0; i < ${dna.hero.params.particles || 22}; i++) {
            const p = document.createElement("div");
            p.className = "star"; stage.appendChild(p);
            const s = 2 + Math.round(prnd() * 3);
            const tx = ${colLeft} + 90 + prnd() * 240, ty = lt - 20 + prnd() * 70;
            const fx = tx + (prnd() - 0.5) * 560, fy = ty + (prnd() - 0.5) * 380;
            gsap.set(p, { width: s, height: s, left: fx, top: fy });
            tl.to(p, { keyframes: { x: [0, (tx - fx) * 0.6, tx - fx], y: [0, (ty - fy) * 0.6, ty - fy],
                                    opacity: [0, 0.95, 0] },
                       duration: 0.5 + prnd() * 0.2, ease: "power2.in" }, st - 0.05 + prnd() * 0.3);
          }
          tl.fromTo(letters, { textShadow: "0 0 30px rgba(255,244,214,0.9), 0 2px 12px rgba(0,0,0,0.5)" },
            { textShadow: "0 0 18px rgba(255,244,214,0.55), 0 2px 12px rgba(0,0,0,0.5)",
              duration: 0.8, ease: "power1.out" }, st + 0.55);
        }
      });
    });
    // earlier stanzas drift out before the next stanza begins
    if (si < STANZAS.length - 1) {
      const nextIn = STANZAS[si + 1][0].words[0][1];
      stanza.forEach((L, k) => {
        tl.to("#" + L.id + " .l", { y: -10, opacity: 0, filter: "blur(4px)",
          duration: 0.5, ease: "power1.in", stagger: 0.008 }, nextIn - 0.62 + k * 0.12);
        tl.set("#" + L.id, { display: "none" }, nextIn + 0.1);
      });
    }
  });
${disperse ? `  // SEMANTIC EXIT: the whole visible poem disperses on the final word.
  // Clamped so the scatter COMPLETES before the clip ends (stagger included).
  const NZ = ${Math.min(LASTWORD.start + 0.06, DUR - 0.58).toFixed(3)};
  const DDUR = ${Math.min(0.42, Math.max(0.24, DUR - Math.min(LASTWORD.start + 0.06, DUR - 0.58) - 0.14)).toFixed(2)};
  lastLetters.forEach((l) => {
    const dx = (prnd() - 0.5) * 260, dy = (prnd() - 0.5) * 200 - 40;
    tl.to(l, { x: dx, y: dy, opacity: 0, filter: "blur(7px)",
               duration: DDUR, ease: "power2.in" }, NZ + prnd() * 0.05);
  });` : ""}`;
  return { css, html, js };
}

function paradigmTakeover() {
  const b = dna.body;
  // each LINE is a card; minors hot; hero = colorflip apex inline
  const cards = LINES.map((L, i) => {
    const txt = L.words.map((w) => w.display).join(" ").toUpperCase();
    const isHero = L.words.some((w) => w.isHero);
    const hot = isHero || L.words.some((w) => w.minor);
    const contentish = txt.replace(/[^A-Z]/g, "").length;
    const px = isHero ? (dna.hero.fontPx || 196)
      : Math.min(b.sizes.minor, Math.round(Math.min(b.sizes.content, (W * 0.86) / (0.55 * Math.max(3, txt.length)))));
    return { id: "c" + i, txt, in: +L.in.toFixed(3), out: +L.out.toFixed(3),
             px, hot: hot ? 1 : 0, hero: isHero ? 1 : 0,
             last: i === LINES.length - 1 ? 1 : 0 };
  });
  // a held card before a silence ≥0.5s creeps, then VOID until the next card
  for (let i = 0; i + 1 < cards.length; i++) {
    const gap = cards[i + 1].in - LINES[i].words[LINES[i].words.length - 1].end;
    if (gap > 0.5) { cards[i].creep = 1; cards[i].out = +(cards[i + 1].in - Math.min(0.6, gap * 0.45)).toFixed(3); }
  }
  const css = `
  #dim { position:absolute; inset:0; opacity:0; background:#05070c; }
  .card { position:absolute; opacity:0; white-space:nowrap;
          font-family:'${dna.fonts.body}', sans-serif; line-height:1; letter-spacing:0.015em;
          color:${dna.palette.body}; text-shadow: 0 4px 26px rgba(0,0,0,0.65); }
  .card.hot { color:${dna.palette.accent};
              text-shadow: 0 0 34px ${dna.palette.accent}73, 0 4px 26px rgba(0,0,0,0.65); }`;
  const html = `      <div id="dim"></div>`;
  const js = `
  // ---- body paradigm: TAKEOVER (hard-cut full-frame cards) + colorflip apex ----
  const stage = document.getElementById("stage");
  const ANCH = ${J(b.anchors)};
  tl.fromTo("#dim", { opacity: 0 }, { opacity: ${b.baseDim}, duration: 0.25, ease: "power2.in" }, 0.05);
  const CARDS = ${J(cards)};
  CARDS.forEach((c, ci) => {
    const el = document.createElement("div");
    el.className = "card" + (c.hot ? " hot" : "");
    el.textContent = c.txt; el.style.fontSize = c.px + "px";
    stage.appendChild(el);
    const [ax, ay] = ANCH[ci % ANCH.length];
    gsap.set(el, { left: ax, top: ay, xPercent: -50, yPercent: -50,
                   rotation: (ci % 2 === 0 ? 1 : -1) * (0.8 + (ci % 3) * 0.7) });
    if (c.hero) {
      // SETPIECE colorflip: crush-in, squash, settle; plate dim deepens
      tl.set("#dim", { opacity: ${dna.hero.params.dimKick} }, c.in);
      tl.to("#dim", { opacity: ${b.baseDim}, duration: 0.5, ease: "power2.out" }, c.in + 0.12);
      tl.set(el, { opacity: 1, scale: ${dna.hero.params.crushFrom}, filter: "blur(10px) brightness(2.6)" }, c.in - 0.04);
      tl.to(el, { scale: 1, filter: "blur(0px) brightness(1)", duration: 0.11, ease: "power4.in" }, c.in - 0.04);
      tl.set(el, { scaleX: 1.10, scaleY: 0.92 }, c.in + 0.07);
      tl.to(el, { scaleX: 1, scaleY: 1, duration: 0.45, ease: "elastic.out(1.05, 0.36)" }, c.in + 0.15);
      tl.to(el, { scale: 1.05, duration: Math.max(0.2, c.out - c.in - 0.3), ease: "power1.inOut" }, c.in + 0.25);
    } else if (c.hot) {
      tl.set(el, { opacity: 1, scale: ${b.hotSnap} }, c.in);
      tl.to(el, { scale: 1, duration: 0.22, ease: "back.out(1.8)" }, c.in + 0.02);
    } else {
      tl.set(el, { opacity: 1, scale: 0.94 }, c.in);
      tl.to(el, { scale: c.creep ? ${b.creepScale} : 1.0,
                  duration: Math.max(0.08, c.out - c.in - 0.02),
                  ease: c.creep ? "power1.in" : "power2.out" }, c.in + 0.01);
    }
    if (c.last && ${J(!!dna.hero.params.dissolveLast)}) {
      tl.to(el, { filter: "blur(9px)", opacity: 0, duration: 0.32, ease: "power2.in" }, c.out - 0.23);
      tl.set(el, { display: "none" }, c.out + 0.1);
    } else {
      tl.set(el, { opacity: 0, display: "none" }, c.out);
    }
  });
  tl.to("#dim", { opacity: 0, duration: 0.3, ease: "power1.in" }, ${(DUR - 0.27).toFixed(2)});`;
  return { css, html, js };
}

/* =====================================================================
 * HERO SETPIECES (embedded, bg layer) — { css, html, js } for index.html
 * ===================================================================== */

function setpieceDetonation() {
  const h = dna.hero, p = h.params, I = heroIn;
  const bw = Math.min(p.barWidth, W - 100, HG.halfW * 2 + 140);
  const css = `
  #scrim { position:absolute; inset:0; opacity:0;
           background: radial-gradient(120% 105% at 50% 38%, rgba(0,0,0,0) 26%, rgba(0,0,0,0.8) 100%); }
  #dimP { position:absolute; inset:0; opacity:0; background:#000; }
  #det { position:absolute; left:${HG.x}px; top:${HG.y}px; opacity:0; }
  .band, #heat { position:absolute; left:0; top:0; transform:translate(-50%,-50%);
          font-family:'${dna.fonts.hero}', sans-serif; font-size:${HG.fontPx}px; line-height:1;
          letter-spacing:0.012em; white-space:nowrap; color:${dna.palette.body};
          text-shadow: 0 3px 18px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.4); }
  ${p.slices.map((s, i) => `#b${i + 1} { clip-path: inset(${s[0]}% 0 ${s[1]}% 0); }`).join("\n  ")}
  #heat { top:6px; color:#ff7a28; filter:blur(24px); opacity:0; text-shadow:none; }
  .bar { position:absolute; left:50%; width:${bw}px; height:3px; margin-left:-${bw / 2}px;
         background:${dna.palette.body}; opacity:0.85; transform-origin:50% 50%; }
  #barT { top:-${Math.round(HG.fontPx * 0.7)}px; } #barB { top:${Math.round(HG.fontPx * 0.66)}px; }
  .tick { position:absolute; width:3px; height:14px; background:${dna.palette.hot}; top:-${Math.round(HG.fontPx * 0.7)}px; opacity:0; }
  #tickL { left:calc(50% - ${bw / 2}px); } #tickR { left:calc(50% + ${bw / 2 - 3}px); }
  #tagwrap { position:absolute; left:50%; transform:translateX(-50%); top:${Math.round(HG.fontPx * 0.7)}px;
             overflow:hidden; white-space:nowrap; }
  #tag { font-family:'${dna.fonts.tag}', monospace; font-size:21px; letter-spacing:0.34em;
         color:${dna.palette.hot}; white-space:nowrap; text-shadow: 0 2px 8px rgba(0,0,0,0.6); }`;
  const html = `      <div id="scrim"></div><div id="dimP"></div>
      <div id="det">
        <div id="heat">${esc(heroText)}</div>
        ${p.slices.map((_, i) => `<div class="band" id="b${i + 1}">${esc(heroText)}</div>`).join("\n        ")}
        ${p.bars ? `<div class="bar" id="barT"></div><div class="bar" id="barB"></div>` : ""}
        ${p.ticks ? `<div class="tick" id="tickL"></div><div class="tick" id="tickR"></div>` : ""}
        ${p.tag ? `<div id="tagwrap"><div id="tag">${esc(p.tag)}&nbsp;//&nbsp;T+${heroIn.toFixed(2)}S</div></div>` : ""}
      </div>`;
  const bandIds = p.slices.map((_, i) => "#b" + (i + 1));
  const js = `
  // ---- setpiece: DETONATION (charge → sheared slices snap → cool → furniture) ----
  const I = ${I.toFixed(3)}, HOTC = ${J(dna.palette.hot)}, BONEC = ${J(dna.palette.body)};
  tl.fromTo("#scrim", { opacity: 0 }, { opacity: ${dna.plate.charge}, duration: 0.40, ease: "power2.in" }, I - 0.42);
  tl.set("#dimP", { opacity: ${dna.plate.dim} }, I);
  tl.to("#dimP",  { opacity: ${(dna.plate.dim * 0.47).toFixed(2)}, duration: 0.9, ease: "power2.out" }, I + 0.10);
  tl.to("#scrim", { opacity: 0.30, duration: 0.9, ease: "power2.out" }, I + 0.10);
  tl.to(["#scrim","#dimP"], { opacity: 0, duration: 0.45, ease: "power1.in" }, ${(heroOut - 0.25).toFixed(3)});
  tl.set("#det", { opacity: 1 }, I - 0.05);
  tl.fromTo("#det", { scale: 3.4 }, { scale: 1.0, duration: 0.10, ease: "power4.in" }, I - 0.05);
  const BANDS = ${J(bandIds)};
  const SHEAR = ${J(p.sliceShear)};
  BANDS.forEach((sel, i) => {
    tl.fromTo(sel, { x: SHEAR[i], filter: "blur(14px) brightness(3.4)" },
      { x: SHEAR[i] * 0.26, filter: "blur(0px) brightness(1.5)", duration: 0.10, ease: "power4.in" }, I - 0.05);
  });
  tl.set(BANDS, { x: 0, filter: "brightness(1.9)" }, I + 0.05);
  tl.set("#det", { scaleX: 1.12, scaleY: 0.90 }, I + 0.05);
  tl.to("#det",  { scaleX: 1, scaleY: 1, duration: 0.55, ease: "elastic.out(1.05, 0.34)" }, I + 0.13);
  tl.to(BANDS, { filter: "brightness(1)", duration: 0.5, ease: "power2.out" }, I + 0.15);
  tl.set(BANDS, { color: HOTC }, I + 0.05);
  tl.to(BANDS, { color: BONEC, duration: 0.9, ease: "power1.in" }, I + 0.22);
${p.bars ? `  tl.fromTo(["#barT","#barB"], { scaleX: 0, opacity: 0.85 }, { scaleX: 1, duration: 0.34, ease: "expo.out" }, I + 0.16);` : ""}
${p.ticks ? `  tl.set(["#tickL","#tickR"], { opacity: 1 }, I + 0.42);
  tl.fromTo(["#tickL","#tickR"], { scaleY: 0 }, { scaleY: 1, duration: 0.14, ease: "back.out(2)" }, I + 0.42);` : ""}
${p.tag ? `  tl.fromTo("#tagwrap", { width: 0 }, { width: 340, duration: 0.45, ease: "steps(16)" }, I + 0.5);` : ""}
  tl.fromTo("#heat", { opacity: 0 }, { opacity: 0.75, duration: 0.3 }, I + 0.06);
  tl.to("#heat", { keyframes: { opacity: [0.75, 0.5, 0.6, 0.4, 0.46, 0.30] }, duration: 1.4, ease: "none" }, I + 0.5);
  tl.to("#det", { scale: 1.035, duration: 1.2, ease: "power1.inOut" }, I + 0.75);
  // EXIT: the stamp shears apart
  BANDS.forEach((sel, i) => {
    tl.to(sel, { x: -SHEAR[i] * 1.5, opacity: 0, duration: 0.16, ease: "power2.in" }, ${(heroOut - 0.18).toFixed(3)} + i * 0.01);
  });
  tl.to(["#barT","#barB","#tickL","#tickR","#tagwrap","#heat"], { opacity: 0, duration: 0.13 }, ${(heroOut - 0.18).toFixed(3)});
  tl.set("#det", { display: "none" }, ${(heroOut + 0.02).toFixed(3)});`;
  return { css, html, js };
}

function setpieceDecode() {
  const h = dna.hero, p = h.params, I = heroIn;
  const lockStagger = p.lockStagger || 0.045;
  const E = theme.hero.exitAt ?? Math.min(heroOut, I + 1.75);
  const broom = Math.min(HG.x, W - HG.x) - HG.halfW;     // room for brackets
  const useBrackets = !!p.brackets && broom > 22;
  const boff = Math.max(14, Math.min(40, Math.floor(broom - 8)));
  const css = `
  #dimP { position:absolute; inset:0; opacity:0; background:#021018; }
  #blk { position:absolute; left:${HG.x}px; top:${HG.y}px; transform:translate(-50%,-50%); opacity:0; }
  #word { display:flex; align-items:flex-start; justify-content:center;
          font-family:'${dna.fonts.hero}', sans-serif; font-weight:800; font-size:${HG.fontPx}px;
          line-height:${HG.fontPx}px; color:#eafaff;
          text-shadow: 0 0 14px ${dna.palette.accent}8c, 0 3px 16px rgba(0,0,0,0.6); }
  .reel { display:block; height:${HG.fontPx}px; width:0.82em; overflow:hidden; text-align:center; }
  .reel.sp { width:0.38em; }
  .col { display:block; } .col span { display:block; height:${HG.fontPx}px; }
  .br { position:absolute; width:26px; height:26px; opacity:0; }
  .br.tl { left:-${boff}px; top:-30px; border-left:3px solid ${dna.palette.accent}; border-top:3px solid ${dna.palette.accent}; }
  .br.tr { right:-${boff}px; top:-30px; border-right:3px solid ${dna.palette.accent}; border-top:3px solid ${dna.palette.accent}; }
  .br.bl { left:-${boff}px; bottom:-34px; border-left:3px solid ${dna.palette.accent}; border-bottom:3px solid ${dna.palette.accent}; }
  .br.brr{ right:-${boff}px; bottom:-34px; border-right:3px solid ${dna.palette.accent}; border-bottom:3px solid ${dna.palette.accent}; }`;
  const html = `      <div id="dimP"></div>
      <div id="blk">
        <div id="word"></div>
        ${useBrackets ? `<div class="br tl"></div><div class="br tr"></div><div class="br bl"></div><div class="br brr"></div>` : ""}
      </div>`;
  const js = `
  // ---- setpiece: DECODE (glyph reels lock left→right, CRT-off exit) ----
  const I = ${I.toFixed(3)}, TEXT = ${J(heroText)}, GLYPHS = ${J(p.glyphs)};
  const drnd = mulberry32(${p.seed || 99});
  tl.fromTo("#dimP", { opacity: 0 }, { opacity: ${dna.plate.dim}, duration: 0.3, ease: "power2.in" }, I - 0.25);
  tl.to("#dimP", { opacity: 0, duration: 0.4, ease: "power1.in" }, ${(E + 0.05).toFixed(3)});
  const word = document.getElementById("word");
  const reels = [];
  for (let i = 0; i < TEXT.length; i++) {
    const ch = TEXT[i];
    const reel = document.createElement("span");
    reel.className = "reel" + (ch === " " ? " sp" : "");
    const col = document.createElement("span"); col.className = "col";
    if (ch !== " ") {
      const n = 5 + Math.floor(drnd() * 4);
      for (let k = 0; k < n; k++) {
        const s = document.createElement("span");
        s.textContent = GLYPHS[Math.floor(drnd() * GLYPHS.length)]; col.appendChild(s);
      }
      const fin = document.createElement("span"); fin.textContent = ch; col.appendChild(fin);
      reel.dataset.steps = n;
    }
    reel.appendChild(col); word.appendChild(reel); reels.push({ el: reel, col, ch, i });
  }
  tl.set("#blk", { opacity: 1 }, I - 0.02);
  reels.forEach((r) => {
    if (r.ch === " ") return;
    const lock = I + 0.30 + ${lockStagger} * r.i;
    const steps = parseInt(r.el.dataset.steps, 10);
    tl.fromTo(r.col, { y: 0 }, { y: -${HG.fontPx} * steps, duration: lock - I, ease: "steps(" + steps + ")" }, I);
    tl.set(r.el, { color: "#bfe9ff",
      textShadow: "3px 0 10px ${dna.palette.accent}cc, -3px 0 10px ${dna.palette.magenta}cc" }, I);
    tl.set(r.el, { textShadow: "-3px 0 10px ${dna.palette.accent}cc, 3px 0 10px ${dna.palette.magenta}cc" }, I + 0.12 + 0.02 * r.i);
    tl.set(r.el, { color: "#ffffff", textShadow: "0 0 22px rgba(255,255,255,0.95)" }, lock);
    tl.set(r.el, { color: "#eafaff",
      textShadow: "0 0 14px ${dna.palette.accent}8c, 0 3px 16px rgba(0,0,0,0.6)" }, lock + 0.083);
  });
  const LOCKED = I + 0.30 + ${lockStagger} * (TEXT.length - 1) + 0.083;
  tl.set("#blk", { scale: 1.04 }, LOCKED - 0.083);
  tl.to("#blk", { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.4)" }, LOCKED);
${useBrackets ? `  [".br.tl",".br.tr",".br.bl",".br.brr"].forEach((sel, k) => {
    tl.fromTo(sel, { opacity: 0, scale: 0.3 }, { opacity: 0.95, scale: 1, duration: 0.22, ease: "expo.out" }, I - 0.12 + k * 0.05);
  });` : ""}
  // EXIT: CRT power-off
  tl.to("#blk", { filter: "brightness(2.6)", duration: 0.07, ease: "power2.in" }, ${E.toFixed(3)});
  tl.to("#blk", { scaleY: 0.012, duration: 0.13, ease: "power4.in" }, ${(E + 0.06).toFixed(3)});
  tl.set("#blk", { opacity: 0, display: "none" }, ${(E + 0.20).toFixed(3)});`;
  return { css, html, js };
}

function setpieceDrawon() {
  const h = dna.hero, p = h.params, I = heroIn;
  // generate the stroke path at COMPILE time — any word, zero tuning
  const fontPath = path.join(SKILL, "assets/strokefonts", dna.fonts.strokeFont);
  const gen = path.join(SKILL, "scripts/gen-stroke-path.py");
  const tw = Math.min(p.targetWidth || 640, W - 200);
  const D = execSync(
    `python3 "${gen}" "${fontPath}" "${heroDisplay.toLowerCase()}" ${tw} 185 ${Math.round(380 - tw / 2)}`,
    { encoding: "utf8" }).trim();
  const WIN = p.window || 0.78;
  const css = `
  #spill { position:absolute; left:${HG.x}px; top:${HG.y}px; width:820px; height:440px;
           margin-left:-410px; margin-top:-220px; border-radius:50%; opacity:0;
           background: radial-gradient(50% 50% at 50% 50%, ${dna.palette.accent}57 0%, ${dna.palette.accent}00 70%); }
  #sign { position:absolute; left:${HG.x}px; top:${HG.y}px; }
  #neonsvg { position:absolute; left:0; top:0; margin-left:-380px; margin-top:-150px;
             transform:rotate(${p.rotate || -3}deg); overflow:visible; }
  #coreG { filter: drop-shadow(0 0 5px #fff) drop-shadow(0 0 16px ${dna.palette.accent}); }
  #pen  { filter: drop-shadow(0 0 8px #fff) drop-shadow(0 0 22px ${dna.palette.accent}); }`;
  const html = `      <div id="spill"></div>
      <div id="sign">
        <svg id="neonsvg" width="760" height="300" viewBox="0 0 760 300">
          <defs><filter id="haloblur" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="10"/></filter></defs>
          <path id="tubeP" fill="none" stroke="rgba(255,235,245,0.16)" stroke-width="${p.tubeWidth + 1}"
                stroke-linecap="round" stroke-linejoin="round" opacity="0"/>
          <g id="haloG" filter="url(#haloblur)" opacity="0.9"></g>
          <g id="coreG"></g>
          <circle id="pen" r="6" fill="#fff" opacity="0"/>
        </svg>
      </div>`;
  const js = `
  // ---- setpiece: DRAWON (single-line font, SEQUENTIAL stroke reveal) ----
  // SVG dash restarts per subpath → one <path> per pen stroke, revealed in
  // writing order at constant pen speed; nib rides each stroke, hops at lifts.
  const I = ${I.toFixed(3)}, WIN = ${WIN}, DRAWN = I + WIN, ENDT = ${heroOut.toFixed(3)};
  const D = ${J(D)};
  document.getElementById("tubeP").setAttribute("d", D);
  const subs = D.split(/(?=M )/).map(s => s.trim()).filter(Boolean);
  const SVGNS = "http://www.w3.org/2000/svg";
  function mk(parent, d, stroke, w) {
    const el = document.createElementNS(SVGNS, "path");
    el.setAttribute("d", d); el.setAttribute("fill", "none");
    el.setAttribute("stroke", stroke); el.setAttribute("stroke-width", w);
    el.setAttribute("stroke-linecap", "round"); el.setAttribute("stroke-linejoin", "round");
    el.setAttribute("opacity", "0");  // hidden until its turn (kills round-cap dot)
    document.getElementById(parent).appendChild(el);
    return el;
  }
  const strokes = subs.map((d) => ({ halo: mk("haloG", d, ${J(dna.palette.accent)}, ${p.haloWidth}),
                                     core: mk("coreG", d, "#fff", ${p.tubeWidth}) }));
  let total = 0;
  strokes.forEach((s) => { s.len = s.core.getTotalLength(); total += s.len; });
  tl.fromTo("#tubeP", { opacity: 0 }, { opacity: 1, duration: 0.35 }, I - 0.6);
  tl.fromTo("#spill", { opacity: 0 }, { opacity: ${p.spill || 0.38}, duration: WIN + 0.2, ease: "power1.in" }, I);
  const pen = document.getElementById("pen");
  let t = I;
  strokes.forEach((s) => {
    const d = WIN * s.len / total;
    gsap.set([s.core, s.halo], { strokeDasharray: s.len, strokeDashoffset: s.len });
    tl.set([s.core, s.halo], { opacity: 1 }, t);
    tl.fromTo([s.core, s.halo], { strokeDashoffset: s.len }, { strokeDashoffset: 0, duration: d, ease: "none" }, t);
    const n = Math.max(4, Math.round(s.len / 14)), xs = [], ys = [];
    for (let k = 0; k <= n; k++) {
      const pt = s.core.getPointAtLength(s.len * k / n); xs.push(pt.x); ys.push(pt.y);
    }
    tl.set(pen, { x: xs[0], y: ys[0] }, t);
    tl.to(pen, { keyframes: { x: xs, y: ys }, duration: d, ease: "none" }, t);
    t += d;
  });
  gsap.set(pen, { attr: { cx: 0, cy: 0 } });
  tl.set(pen, { opacity: 1 }, I - 0.01);
  tl.to(pen, { scale: 2.2, opacity: 0, duration: 0.12, ease: "power2.in", transformOrigin: "50% 50%" }, DRAWN);
${p.hum ? `  const humStart = DRAWN + 0.08, humDur = Math.max(0.2, ENDT - humStart);
  const NN = Math.max(6, Math.round(humDur / (2 * F)));
  const humVals = [];
  for (let k = 0; k <= NN; k++) {
    const tt = k / NN * humDur;
    humVals.push(0.78 + 0.06 * Math.sin(2 * Math.PI * 9 * tt) + 0.05 * Math.sin(2 * Math.PI * 13 * tt + 1.1));
  }
  tl.to("#haloG", { keyframes: { opacity: humVals }, duration: humDur, ease: "none" }, humStart);
  tl.set("#coreG", { opacity: 0.45 }, ENDT + (${p.buzzDipAt || -0.18}));
  tl.set("#coreG", { opacity: 1 }, ENDT + (${p.buzzDipAt || -0.18}) + F);` : ""}`;
  return { css, html, js };
}

/* =====================================================================
 * FRONT FX (fg layer additions) — flash / rings / sparks / scanband
 * ===================================================================== */
function frontFx() {
  const fx = dna.fx || {};
  let css = "", html = "", js = "";
  const I = heroIn;
  if (fx.flash) {
    css += `
  #fxflash { position:absolute; inset:0; opacity:0;
           background: radial-gradient(95% 80% at 50% 37%, rgba(255,250,240,0.95) 0%, rgba(255,235,210,0.7) 38%, rgba(120,90,60,0) 100%); }`;
    html += `      <div id="fxflash"></div>\n`;
    js += `
  tl.set("#fxflash", { opacity: ${fx.flash} }, ${(I + 0.045).toFixed(3)});
  tl.to("#fxflash", { opacity: 0, duration: 0.17, ease: "expo.out" }, ${(I + 0.085).toFixed(3)});`;
  }
  if (fx.rings) {
    css += `
  .fxring { position:absolute; left:${HG.x}px; top:${HG.y}px; width:90px; height:32px;
          margin-left:-45px; margin-top:-16px; border-radius:50%; opacity:0; }
  #fxr1 { border:4px solid rgba(255,228,196,0.95); filter:blur(1.5px); }
  #fxr2 { border:3px solid rgba(255,150,70,0.8); filter:blur(3px); }`;
    html += `      <div class="fxring" id="fxr1"></div>\n      <div class="fxring" id="fxr2"></div>\n`;
    js += `
  tl.set("#fxr1", { opacity: 1, scale: 1 }, ${(I + 0.05).toFixed(3)});
  tl.to("#fxr1", { scale: 16, opacity: 0, duration: 0.58, ease: "expo.out" }, ${(I + 0.05).toFixed(3)});
  tl.to("#fxr1", { filter: "blur(7px)", duration: 0.58, ease: "power1.in" }, ${(I + 0.05).toFixed(3)});
  tl.set("#fxr2", { opacity: 0.55, scale: 1 }, ${(I + 0.13).toFixed(3)});
  tl.to("#fxr2", { scale: 11, opacity: 0, duration: 0.72, ease: "expo.out" }, ${(I + 0.13).toFixed(3)});`;
  }
  if (fx.sparks) {
    css += `
  .fxspark { position:absolute; left:${HG.x}px; top:${HG.y}px; border-radius:2px;
           background:#ffd9a8; opacity:0; }
  .fxember { position:absolute; border-radius:50%; background:#ff9544; filter:blur(1px); opacity:0; }`;
    js += `
  { const frnd = mulberry32(${fx.seed || 7});
    const stg = document.getElementById("stage");
    for (let i = 0; i < ${fx.sparks}; i++) {
      const el = document.createElement("div"); el.className = "fxspark"; stg.appendChild(el);
      const ang = frnd() * Math.PI * 2, dist = 130 + frnd() * 330;
      const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist * 0.55;
      const grav = 40 + frnd() * 90, s = 3 + Math.round(frnd() * 5), d = 0.6 + frnd() * 0.45;
      gsap.set(el, { width: s, height: s, x: 0, y: 0 });
      tl.set(el, { opacity: 1 }, ${(I + 0.05).toFixed(3)});
      tl.to(el, { keyframes: { x: [0, dx*0.55, dx*0.85, dx],
                               y: [0, dy*0.55 + grav*0.15, dy*0.85 + grav*0.55, dy + grav],
                               opacity: [1, 1, 0.65, 0] }, duration: d, ease: "power2.out" }, ${(I + 0.05).toFixed(3)});
    }
    for (let i = 0; i < ${fx.embers || 0}; i++) {
      const el = document.createElement("div"); el.className = "fxember"; stg.appendChild(el);
      const s = 3 + Math.round(frnd() * 3);
      gsap.set(el, { width: s, height: s, left: ${HG.x - 220} + frnd() * 440, top: ${HG.y + 32} + frnd() * 60 });
      const t0 = ${(I + 0.6).toFixed(3)} + frnd() * 0.9, dr = 1.0 + frnd() * 0.7;
      const yA = -40 - frnd() * 50, yB = -80 - frnd() * 60;
      const xA = (frnd() - 0.5) * 30, xB = (frnd() - 0.5) * 50;
      tl.to(el, { keyframes: { opacity: [0, 0.75, 0.4, 0.8, 0],
                               y: [0, yA*0.5, yA, (yA+yB)/2, yB],
                               x: [0, xA*0.5, xA, (xA+xB)/2, xB] }, duration: dr, ease: "power1.out" }, t0);
    }
  }`;
  }
  if (fx.scanband) {
    const lockT = heroIn + 0.30 + (dna.hero.params.lockStagger || 0.045) * (heroText.length - 1) + 0.083;
    css += `
  #fxband { position:absolute; left:0; top:-80px; width:100%; height:70px; opacity:0;
          background: linear-gradient(180deg, ${dna.palette.accent}00 0%, ${dna.palette.accent}66 50%, ${dna.palette.accent}00 100%); }
  #fxlock { position:absolute; inset:0; opacity:0;
               background: radial-gradient(80% 60% at 52% 35%, ${dna.palette.accent}99 0%, ${dna.palette.accent}00 70%); }`;
    html += `      <div id="fxband"></div>\n      <div id="fxlock"></div>\n`;
    js += `
  tl.set("#fxband", { opacity: 0.5 }, ${(I - 0.05).toFixed(3)});
  tl.fromTo("#fxband", { y: 0 }, { y: ${H + 160}, duration: 0.5, ease: "power1.in" }, ${(I - 0.05).toFixed(3)});
  tl.set("#fxband", { opacity: 0 }, ${(I + 0.46).toFixed(3)});
  tl.set("#fxlock", { opacity: ${fx.lockflash || 0.55} }, ${(lockT - 0.083).toFixed(3)});
  tl.to("#fxlock", { opacity: 0, duration: 0.2, ease: "expo.out" }, ${lockT.toFixed(3)});`;
  }
  return { css, html, js };
}

/* =====================================================================
 * ASSEMBLE + POSTFX
 * ===================================================================== */
const PARADIGMS = { rail: paradigmRail, panel: paradigmPanel, poem: paradigmPoem, takeover: paradigmTakeover };
const SETPIECES = { detonation: setpieceDetonation, decode: setpieceDecode, drawon: setpieceDrawon };

if (!PARADIGMS[dna.body.paradigm]) throw new Error("[make-theme] unknown body paradigm: " + dna.body.paradigm);
const body = PARADIGMS[dna.body.paradigm]();

let setp = { css: "", html: "", js: "" };
if (!heroInline) {
  if (!SETPIECES[dna.hero.setpiece]) throw new Error("[make-theme] unknown setpiece: " + dna.hero.setpiece);
  setp = SETPIECES[dna.hero.setpiece]();
}
const fx = frontFx();

// bg file: plate reaction + embedded setpiece (+ body if body.layer === "bg")
const bodyInBg = dna.body.layer === "bg";
const poemScrimInBg = dna.body.paradigm === "poem" && dna.body.scrim;
let bgExtra = { css: "", html: "", js: "" };
if (poemScrimInBg) {
  // poem keeps its scrim BEHIND the subject (subject stays lit) while the poem
  // itself rides the fg alpha layer
  const bgScrimSide = (typeof CLEARER !== "undefined" && CLEARER === "right") ? "right" : "left";
  bgExtra.css = `
  #pscrimBg { position:absolute; inset:0; opacity:0;
            background: linear-gradient(${bgScrimSide === "left" ? "100deg" : "260deg"},
              rgba(4,8,16,${dna.body.scrim.opacity}) 0%, rgba(4,8,16,${(dna.body.scrim.opacity * 0.6).toFixed(2)}) 38%, rgba(4,8,16,0) 62%); }`;
  bgExtra.html = `      <div id="pscrimBg"></div>`;
  bgExtra.js = `
  tl.fromTo("#pscrimBg", { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power1.out" }, 0.15);
  tl.to("#pscrimBg", { opacity: 0, duration: 0.4, ease: "power1.in" }, ${(LASTWORD.start + 0.15).toFixed(3)});`;
}

const bgHtml = bgSkeleton(
  [bgExtra.html, setp.html, bodyInBg ? body.html : ""].filter(Boolean).join("\n"),
  [bgExtra.css, setp.css, bodyInBg ? body.css : ""].filter(Boolean).join("\n"),
  [bgExtra.js, setp.js, bodyInBg ? body.js : ""].filter(Boolean).join("\n"));
fs.writeFileSync(path.join(PROJECT, "index.html"), bgHtml);

// fg file (rail.html): body paradigm (when fg) + front fx
if (!bodyInBg || fx.html || fx.js) {
  const fgHtml = fgSkeleton(
    [!bodyInBg ? body.html : "", fx.html].filter(Boolean).join("\n"),
    [!bodyInBg ? body.css : "", fx.css].filter(Boolean).join("\n"),
    [!bodyInBg ? body.js : "", fx.js].filter(Boolean).join("\n"));
  fs.writeFileSync(path.join(PROJECT, "rail.html"), fgHtml);
} else if (fs.existsSync(path.join(PROJECT, "rail.html"))) {
  fs.unlinkSync(path.join(PROJECT, "rail.html"));
}

// _postfx.sh: plate reaction after the matte composite (subject+text move as one)
const P = dna.plate || {};
const anchorT = (heroIn + 0.045).toFixed(3);
let filter;
if (P.punch) {
  const minor = P.minorPunch && LINES.find((L) => L.words.some((w) => w.minor));
  const minorT = minor ? (minor.words.find((w) => w.minor).start + 0.01).toFixed(3) : null;
  filter = `zoompan=
    z='1+${P.punch}*exp(-${P.punchDecay || 9}*(time-${anchorT}))*between(time,${anchorT},${anchorT}+${P.shakeWindow || 0.6})${minorT ? `+${P.minorPunch}*exp(-10*(time-${minorT}))*between(time,${minorT},${minorT}+0.4)` : ""}':
    x='iw/2-(iw/zoom/2)${P.shakeAmpX ? `+${P.shakeAmpX}*exp(-${P.shakeDecay || 7}*(time-${anchorT}))*sin(2*PI*${P.shakeHz || 12}*(time-${anchorT}))*between(time,${anchorT},${anchorT}+${P.shakeWindow || 0.6})` : ""}':
    y='ih/2-(ih/zoom/2)${P.shakeAmpY ? `+${P.shakeAmpY}*exp(-${P.shakeDecay || 7}*(time-${anchorT}))*cos(2*PI*${((P.shakeHz || 12) * 1.31).toFixed(2)}*(time-${anchorT}))*between(time,${anchorT},${anchorT}+${P.shakeWindow || 0.6})` : ""}':
    d=1:s=${W}x${H}:fps=${FPS}`;
} else if (P.pushIn) {
  filter = `zoompan=z='1+${P.pushIn}*time/${DUR.toFixed(2)}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${W}x${H}:fps=${FPS}`;
} else {
  filter = `null`;
}
const rgba = P.rgbashift
  ? `,rgbashift=rh=-${P.rgbashift}:bh=${P.rgbashift}:enable='between(t,${anchorT},${(heroIn + 0.125).toFixed(3)})+between(t,${(LASTWORD.start + 0.04).toFixed(3)},${(LASTWORD.start + 0.17).toFixed(3)})',format=yuv420p` : "";
fs.writeFileSync(path.join(PROJECT, "_postfx.sh"), `#!/usr/bin/env bash
# generated by make-theme.cjs — plate reaction for theme "${dna.name}"
set -euo pipefail
cd "$(dirname "$0")"
ffmpeg -y -v error -i final.mp4 -filter_complex "
  [0:v]${filter}${rgba},
  noise=alls=${P.grain || 5}:allf=t+u[v]" \\
  -map "[v]" -map 0:a -c:v libx264 -crf 16 -preset medium -profile:v high -c:a copy \\
  final_fx.mp4
echo "[postfx] ${dna.name} → final_fx.mp4"
`);

console.log(`[make-theme] ${dna.name}: index.html${!bodyInBg || fx.html ? " + rail.html" : ""} + _postfx.sh`);
console.log(`[make-theme]   body=${dna.body.paradigm}(${dna.body.layer}) hero=${heroInline ? "inline:" + dna.hero.setpiece : dna.hero.setpiece} @${heroIn.toFixed(2)}s lines=${LINES.length} dur=${DUR}s`);
