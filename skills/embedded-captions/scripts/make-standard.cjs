#!/usr/bin/env node
/*
 * make-standard.cjs — compile standard.json + transcript.json → index.html + rail.html
 * (STANDARD MODE). The agent authors a small JSON of creative choices; everything
 * deterministic is GENERATED, so whole bug classes are impossible by construction:
 *   - word/group timings come from the transcript BY SEQUENCE (no hand-copied times)
 *   - rail lines pre-empt: each line's exit completes before the next line's first word
 *   - every PROMOTED word is lifted OUT of the rail (never duplicated); its rail line
 *     freezes at the pre-part, the climax holds across the page-flip to the end of its
 *     thought, the rail resumes fresh — the canonical hand-off, generated every time
 *   - MULTI-CLIMAX: `climaxes: [...]` promotes one peak per beat (scarcity per block,
 *     not per clip). Windows never overlap (out_i ≤ in_{i+1} − 0.25). The largest
 *     font_cqh is the APEX (per-letter + glow + breathe privileges); smaller ones are
 *     MINOR peaks (whole-unit entrance, damped amplitude).
 *   - the canvas duration = the SOURCE clip length; climax line-fit vs frame width
 *   - seek-safe GSAP only, one paused timeline on window.__timelines.main, BOTH files
 * Also emits a derived plan.json (each climax as a hero group) so the timing +
 * occlusion gates (incl. the hero-weak advisory) run for Standard automatically.
 *
 *   node make-standard.cjs <project-dir>
 *
 * standard.json schema (see modes/standard/PIPELINE.md):
 * {
 *   "dna": "keynote",                      // DNA fills font/fills/accent/entrance defaults
 *   "width": 1920, "height": 1080, "fps": 30,
 *   "font": null, "rail_font": null, "cfill": null, "cacc": null,   // explicit overrides win
 *   "climax_css": "", "rail_css": "",
 *   "rail": { "bottom_pct": 9, "width_pct": 90, "font_cqh": 6.4,
 *     "lines": [["You","need","to"], ["judge","us","by","the","actions"], ...] },
 *   "climaxes": [                          // 1..N — one per beat; legacy "climax": {} still works
 *     { "match": "actions", "occurrence": 1, "text": "ACTIONS",
 *       "top_pct": 37, "font_cqh": 44, "entrance": "rise", "exit": "rise-off", "hold": "thought" }
 *   ]
 * }
 */
const path = require("path");
const fs = require("fs");
const cp = require("child_process");
const dnaLib = require("./lib-dna.cjs");

const norm = (s) =>
  String(s == null ? "" : s)
    .toLowerCase()
    .replace(/[^a-z0-9']/g, "");
const esc = (t) =>
  String(t)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const LOOKAHEAD = 40;

function die(msg) {
  console.error(`[make-standard] ${msg}`);
  process.exit(1);
}

function sourceDurationSec(project) {
  for (const c of ["source.mp4"].concat(
    fs
      .readdirSync(project)
      .filter(
        (f) =>
          /\.(mp4|mov|webm|mkv|m4v)$/i.test(f) &&
          !/^(final|bg_plus_caps|fg_caps|rail|index)/.test(f),
      ),
  )) {
    const p = path.join(project, c);
    if (!fs.existsSync(p)) continue;
    try {
      const d = parseFloat(
        cp
          .execFileSync(
            "ffprobe",
            [
              "-v",
              "error",
              "-show_entries",
              "format=duration",
              "-of",
              "default=nokey=1:noprint_wrappers=1",
              p,
            ],
            { encoding: "utf8" },
          )
          .trim(),
      );
      if (d > 0) return d;
    } catch {}
  }
  return null;
}

// crude width estimate (same approach as fit-fonts): chars × per-family advance × px size
const ADV = {
  anton: 0.44,
  oswald: 0.45,
  teko: 0.4,
  "bebas neue": 0.4,
  "press start 2p": 1.05,
  vt323: 0.52,
  monoton: 0.62,
  "special elite": 0.55,
  "jetbrains mono": 0.6,
  "archivo black": 0.62,
  bangers: 0.5,
  "bodoni moda": 0.5,
  "playfair display": 0.52,
  cinzel: 0.62,
  "cormorant garamond": 0.45,
  fredoka: 0.55,
  "baloo 2": 0.55,
  "permanent marker": 0.55,
  caveat: 0.4,
  orbitron: 0.66,
  sora: 0.54,
  "space grotesk": 0.54,
  "saira stencil one": 0.46,
  audiowide: 0.6,
  creepster: 0.45,
};

function main() {
  const project = path.resolve(process.argv[2] || "");
  if (!process.argv[2]) die("usage: make-standard.cjs <project-dir>");
  const sj = path.join(project, "standard.json");
  const tj = path.join(project, "transcript.json");
  if (!fs.existsSync(sj))
    die(`missing ${sj} — author it first (schema in this file's header / PIPELINE.md)`);
  if (!fs.existsSync(tj)) die(`missing ${tj} — run prepare.sh (or transcribe.cjs) first`);
  const S = JSON.parse(fs.readFileSync(sj, "utf8"));
  const trWords = (JSON.parse(fs.readFileSync(tj, "utf8")).words || []).filter(
    (w) => w && "start" in w && "end" in w,
  );
  if (!trWords.length) die("transcript has no word timings");

  const W = S.width || 1920,
    H = S.height || 1080,
    FPS = S.fps || 30;
  const srcDur = sourceDurationSec(project);
  const DUR = +(srcDur || trWords[trWords.length - 1].end + 0.5).toFixed(3);
  // DNA tokens fill the defaults (explicit S.* fields win).
  let dna = null,
    dnaAccent = null;
  if (S.dna) {
    dna = dnaLib.load(S.dna);
    const sz0 = (() => {
      try {
        return JSON.parse(fs.readFileSync(path.join(project, "safe-zones.json"), "utf8"));
      } catch {
        return {};
      }
    })();
    dnaAccent =
      dna.palette.accent === "scene"
        ? (sz0.palette && sz0.palette.accentSuggestion) || dna.palette.accent_fallback
        : dna.palette.accent;
    console.log(`[make-standard] DNA "${dna.name}" (${dna.register}) — accent ${dnaAccent}`);
    // CATEGORY LOCK: classic DNAs live in their validated home (cinematic).
    // Using one under Standard is a cross-category combo: allowed ONLY where
    // explicitly validated (deliveries.rail === "validated"); otherwise ERROR.
    // To validate a new combo: render it, review it, then flip the DNA's flag.
    const dlv = dna.deliveries && dna.deliveries.rail;
    if (dlv && dlv !== "validated" && S.allow_unvalidated_dna !== true)
      throw new Error(
        `[make-standard] DNA "${dna.name}" is NOT validated for Standard (rail) — its home is cinematic. ${dna.deliveries.note || ""} Validated rail DNAs: keynote, cream. (Deliberate experiment: set "allow_unvalidated_dna": true in standard.json — renders carry only the static skin; fx/wordCss/motion grammar are cinematic-engine features.)`,
      );
  }
  const FONT = S.font || (dna ? dna.font.family : "Inter");
  const RFONT = S.rail_font || FONT;
  const CFILL = S.cfill || (dna ? dna.palette.cap_color : "#f3efe6");
  let CACC = S.cacc || dnaAccent || "#e3c06a";
  // HIGHLIGHT DIRECTION — the karaoke accent must be BRIGHTER than the fill, or the
  // active word visibly dims (scene-sampled accents on dark scenes come out darker
  // than the cap color — a real cold-start trap). Same hue, lifted lightness.
  {
    const hx = (c) => {
      const m = String(c)
        .trim()
        .match(/^#?([0-9a-f]{6})$/i);
      return m ? [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)) : null;
    };
    const luma = (rgb) => 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    const fa = hx(CACC),
      ff = hx(CFILL);
    // a highlight must not read as "lights off": lift only when the accent is MUCH
    // darker than the fill (gap > 60), and only up to fill−45 — never bleach to white
    // (a saturated accent on a light fill reads by HUE; that is the classic karaoke).
    const chroma = fa ? Math.max(...fa) - Math.min(...fa) : 0;
    if (fa && ff && !S.cacc && luma(fa) < luma(ff) - 60 && chroma < 90) {
      const target = Math.min(luma(ff) - 45, 205);
      let [r, g, b] = fa.map((v) => v / 255);
      const mx = Math.max(r, g, b),
        mn = Math.min(r, g, b);
      let h = 0,
        sst = 0,
        l = (mx + mn) / 2;
      if (mx !== mn) {
        const d = mx - mn;
        sst = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
        h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
        h /= 6;
      }
      const h2c = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const from = CACC;
      for (let tries = 0; tries < 8 && l < 0.8; tries++) {
        l = Math.min(0.8, l + 0.07);
        const q = l < 0.5 ? l * (1 + sst) : l + sst - l * sst,
          p = 2 * l - q;
        const rgb = [h2c(p, q, h + 1 / 3), h2c(p, q, h), h2c(p, q, h - 1 / 3)].map((v) =>
          Math.round(v * 255),
        );
        CACC = "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("");
        if (luma(rgb) >= target) break;
      }
      console.log(
        `[make-standard] accent ${from} reads as "lights off" vs fill (gap ${Math.round(luma(ff) - luma(fa))}) -> lifted to ${CACC} (same hue, saturation kept)`,
      );
    }
  }
  const rail = S.rail || {};
  const clList = Array.isArray(S.climaxes) ? S.climaxes.slice() : S.climax ? [S.climax] : [];
  if (dna && dna.hero)
    clList.forEach((c) => {
      if (!c.entrance) c.entrance = dna.hero.entrance;
    });
  const lines = (rail.lines || []).map((ws) => ws.map((t) => String(t)));
  if (!lines.length) die("rail.lines is empty");

  // ── 1. sequence-match every rail word to the transcript ─────────────────────
  let p = 0;
  const unmatched = [];
  const L = lines.map((ws, li) => ({
    li,
    words: ws.map((text) => {
      const target = norm(text);
      let found = -1;
      for (let j = p; j < Math.min(trWords.length, p + LOOKAHEAD); j++)
        if (norm(trWords[j].text) === target) {
          found = j;
          break;
        }
      if (found < 0) {
        unmatched.push(text);
        return { text, start: null, end: null };
      }
      p = found + 1;
      return { text, start: trWords[found].start, end: trWords[found].end, ti: found };
    }),
  }));
  if (unmatched.length)
    die(
      `words not found in transcript (in order): ${unmatched.join(" ")} — fix rail.lines to match the transcript verbatim`,
    );

  // COMPLETENESS GATE — the rail is verbatim by definition; the sequence matcher's
  // lookahead must not silently skip transcript words the author forgot. Declared
  // filler goes in standard.json "drops": [].
  {
    const consumed = new Set();
    for (const ln of L) for (const w of ln.words) if (w.ti != null) consumed.add(w.ti);
    const dropOk = new Set((S.drops || []).map(norm));
    const FILLER = new Set(["um", "uh", "er", "ah", "hmm", "mm"]);
    const skipped = trWords
      .map((w, i) => ({ w, i }))
      .filter(
        ({ w, i }) => !consumed.has(i) && !dropOk.has(norm(w.text)) && !FILLER.has(norm(w.text)),
      );
    if (skipped.length)
      die(
        `VERBATIM VIOLATION — ${skipped.length} transcript word(s) never authored: ` +
          `${skipped.map(({ w }) => `"${w.text}"`).join(" ")} — add them to rail.lines, or declare true filler in "drops": []`,
      );
  }

  // ── 2. locate every promoted word; lift each out (hand-off by construction) ─
  // match supports PHRASES ("pixel size", "skin food") — a peak is a semantic unit,
  // not necessarily one token; the whole phrase lifts as the climax.
  const ARTICLES = new Set([
    "the",
    "a",
    "an",
    "this",
    "that",
    "these",
    "those",
    "my",
    "our",
    "his",
    "her",
    "their",
    "its",
  ]);
  const promos = [];
  for (const c of clList) {
    if (!c.match) die("every climax needs a `match` word/phrase");
    const toks = String(c.match).trim().split(/\s+/).map(norm);
    let want = c.occurrence || 1,
      seen = 0,
      found = null;
    outer: for (const ln of L)
      for (let wi = 0; wi + toks.length <= ln.words.length; wi++) {
        let ok = true;
        for (let k = 0; k < toks.length; k++)
          if (norm(ln.words[wi + k].text) !== toks[k]) {
            ok = false;
            break;
          }
        if (ok) {
          seen++;
          if (seen === want) {
            found = {
              ln,
              wi,
              wiEnd: wi + toks.length - 1,
              words: ln.words.slice(wi, wi + toks.length),
              cfg: c,
            };
            break outer;
          }
        }
      }
    if (!found)
      die(
        `climax.match "${c.match}" (occurrence ${c.occurrence || 1}) not found in rail.lines (phrase must sit within ONE line)`,
      );
    // never strand a determiner: "the | STARS" leaves an orphan "the" that vanishes the
    // moment the peak lifts — absorb a leading article into the promoted phrase
    if (found.wi > 0 && ARTICLES.has(norm(found.ln.words[found.wi - 1].text))) {
      const before = found.ln.words.slice(0, found.wi - 1);
      if (before.length === 0) {
        // the article IS the line start — a true orphan if left behind
        found.wi -= 1;
        found.words = found.ln.words.slice(found.wi, found.wiEnd + 1);
        if (c.text) {
          // display case follows the authored text (an all-caps climax gets THE, not The)
          const art = found.words[0].text;
          const artD =
            c.text === c.text.toUpperCase()
              ? art.toUpperCase()
              : art.charAt(0).toUpperCase() + art.slice(1);
          c.text = artD + " " + c.text;
        }
        console.log(
          `[make-standard] absorbed leading "${found.words[0].text}" into the climax (never strand a determiner)`,
        );
      }
    }
    found.w = found.words[0];
    found.wLast = found.words[found.words.length - 1];
    promos.push(found);
  }
  promos.sort((a, b) => a.w.start - b.w.start);

  // split each promoted line around ALL its promo SPANS; promoted words join NO segment
  const segs = [];
  for (const ln of L) {
    const linePromos = promos.filter((pp) => pp.ln === ln).sort((a, b) => a.wi - b.wi);
    if (!linePromos.length) {
      segs.push({ words: ln.words, kind: "normal" });
      continue;
    }
    let cur = 0;
    for (const pp of linePromos) {
      const pre = ln.words.slice(cur, pp.wi);
      if (pre.length) segs.push({ words: pre, kind: "pre" });
      cur = pp.wiEnd + 1;
    }
    const post = ln.words.slice(cur);
    if (post.length) segs.push({ words: post, kind: "post" });
  }
  const segsT = segs.filter((s) => s.words.length);
  if (!segsT.length) die("rail has no words left after lifting the climaxes — add narration lines");

  // ── 3. timing: line enter/exit with pre-emption; hand-off freeze + page-flip ─
  const EXIT_D = 0.22,
    ENTER_D = 0.22,
    LEAD = 0.15;
  for (let i = 0; i < segsT.length; i++) {
    const s = segsT[i];
    s.first = s.words[0].start;
    s.last = s.words[s.words.length - 1].end;
    s.enter = Math.max(0, s.first - LEAD);
  }
  for (let i = 0; i < segsT.length; i++) {
    const s = segsT[i],
      nx = segsT[i + 1];
    let exitAt = s.last + 1.1;
    if (nx) exitAt = Math.min(exitAt, nx.enter - EXIT_D - 0.02);
    // hand-off freeze: a PRE segment holds (frozen) until the page-flip moment
    if (s.kind === "pre" && nx) exitAt = nx.enter - EXIT_D - 0.02;
    s.exit = Math.max(s.enter + ENTER_D + 0.1, Math.min(exitAt, DUR - 0.05));
  }
  // SWALLOW GATE — pre-emption must never eat content: if a line exits before its own
  // last words are spoken, those words reveal inside an opacity-0 container (silent
  // verbatim loss). At dense pace the only legal split is one sentence per line.
  {
    const eaten = [];
    for (const s2 of segsT) {
      const lost = s2.words.filter((w) => w.start >= s2.exit - 0.04);
      const faded = s2.words.filter((w) => w.start < s2.exit - 0.04 && w.end > s2.exit + 0.08);
      if (lost.length)
        eaten.push(
          `"${s2.words
            .map((w) => w.text)
            .join(" ")
            .slice(
              0,
              40,
            )}" exits ${s2.exit.toFixed(2)}s but loses: ${lost.map((w) => w.text).join(" ")}`,
        );
      else if (faded.length)
        eaten.push(
          `"${s2.words
            .map((w) => w.text)
            .join(" ")
            .slice(
              0,
              40,
            )}" exits ${s2.exit.toFixed(2)}s while still SPEAKING: ${faded.map((w) => w.text).join(" ")} (reveals half-faded)`,
        );
    }
    if (eaten.length)
      die(
        `RAIL PRE-EMPTION SWALLOW - ${eaten.length} line(s) would silently lose words:\n  ${eaten.join("\n  ")}\n  Merge each into the next line (dense pace leaves no room for the split).`,
      );
  }

  // ── 4. climax windows: enter when spoken; hold to end of THOUGHT; never overlap ─
  const climaxes = promos.map((pp, i) => {
    const c = pp.cfg;
    const t0 = pp.w.start;
    let tEnd;
    if (typeof c.hold === "number") tEnd = t0 + c.hold;
    else {
      tEnd = pp.w.end + 2.2;
      for (let j = pp.wLast.ti; j < trWords.length; j++) {
        if (/[.!?…]$/.test(String(trWords[j].text).trim())) {
          tEnd = trWords[j].end + 0.35;
          break;
        }
        if (j === trWords.length - 1) tEnd = trWords[j].end + 0.35;
      }
    }
    return {
      id: `climax-${i}`,
      text:
        c.text ||
        pp.words
          .map((w) => w.text)
          .join(" ")
          .toUpperCase(),
      in: Math.max(0, t0 - 0.02),
      out: Math.min(Math.max(tEnd, t0 + 1.0), DUR - 0.05),
      exitD: 0.5,
      top: c.top_pct ?? 37,
      entrance: c.entrance || "rise",
      exit: c.exit || "rise-off",
      cqh: c.font_cqh ?? 44,
      promo: pp,
    };
  });
  // scarcity: peaks never co-visible — earlier window yields to the next peak's entrance
  for (let i = 0; i < climaxes.length - 1; i++) {
    const clamped = Math.min(
      climaxes[i].out,
      Math.max(climaxes[i].in + 0.8, climaxes[i + 1].in - 0.25),
    );
    if (clamped < climaxes[i].out - 0.01)
      console.log(
        `[make-standard] climax "${climaxes[i].text}" hold clamped to ${clamped.toFixed(2)}s — the next peak needs the stage`,
      );
    climaxes[i].out = clamped;
  }
  // APEX = largest cqh; minors are damped (whole-unit, no glow/breathe, amp ×0.7)
  const apexCqh = Math.max(...climaxes.map((c) => c.cqh));
  climaxes.forEach((c) => {
    c.minor = c.cqh < apexCqh - 1e-6;
  });
  // a MINOR peak is still a peak — pre-pass floor at 3× the rail type (a 13cqh word
  // over a 5.8cqh rail reads as a label, not a beat). The real-measure pass below
  // raises minors further to 0.55× the apex's FINAL size.
  const railCqh0 = (S.rail && S.rail.font_cqh) || 6.4;
  for (const c of climaxes)
    if (c.minor && c.cqh < railCqh0 * 3) {
      console.log(
        `[make-standard] minor climax "${c.text}" ${c.cqh}cqh < 3× rail — floored to ${Math.ceil(railCqh0 * 3)}cqh`,
      );
      c.cqh = Math.ceil(railCqh0 * 3);
    }
  // ADV line-fit per climax
  for (const c of climaxes) {
    const adv = ADV[FONT.toLowerCase()] ?? 0.56;
    const estW =
      (c.text.replace(/\s/g, "").length + (c.text.split(/\s+/).length - 1) * 0.5) *
      adv *
      ((c.cqh / 100) * H);
    const maxW = W * 0.96;
    if (estW > maxW) {
      const ncqh = Math.max(8, Math.floor((c.cqh * maxW) / estW));
      console.log(
        `[make-standard] climax "${c.text}" would overflow — font ${c.cqh}cqh → ${ncqh}cqh`,
      );
      c.cqh = ncqh;
    }
  }

  // safe-zones → fg verdict + bright-band treatment (scene-level, applies to all peaks)
  let fgVerdict = false,
    heroBright = false,
    heroBandsS = null;
  try {
    const sz = JSON.parse(fs.readFileSync(path.join(project, "safe-zones.json"), "utf8"));
    fgVerdict = sz.recommendation === "fg";
    heroBandsS = sz.heroBands || null;
    const bl = sz.heroAnchor && sz.heroAnchor.bandLuma;
    if (bl != null && bl > 160) heroBright = true;
  } catch {}
  let heroFeasible = heroBandsS ? heroBandsS.feasible : !fgVerdict;
  const fgClimax = climaxes.length > 0 && !heroFeasible;
  if (fgClimax)
    console.log(
      `[make-standard] no hero band ≤62% predicted occlusion → climaxes rendered in FRONT (fg = last resort).`,
    );
  if (climaxes.length && heroBright)
    console.log(
      `[make-standard] hero band is bright (washout risk) → climaxes get a scrim + heavy stroke.`,
    );
  for (const c of climaxes) {
    if (heroFeasible && heroBandsS && heroBandsS.profile && heroBandsS.best) {
      const near = heroBandsS.profile.reduce((a, b) =>
        Math.abs(b.topPct - c.top) < Math.abs(a.topPct - c.top) ? b : a,
      );
      if (near.occPct > 62) {
        console.log(
          `[make-standard] climax "${c.text}" top ${c.top}% sits in a ${near.occPct}%-occluded band → moved to ${heroBandsS.best.topPct}%`,
        );
        c.top = +(heroBandsS.best.topPct + 6.5).toFixed(1);
      }
    }
    const halfPct = (c.cqh * 1.12) / 2 + 0.6;
    const clamped = Math.min(100 - halfPct, Math.max(halfPct, c.top));
    if (Math.abs(clamped - c.top) > 0.2) {
      console.log(
        `[make-standard] climax "${c.text}" top ${c.top}% would clip → ${clamped.toFixed(1)}%`,
      );
      c.top = +clamped.toFixed(1);
    }
  }

  // ── 5. emit index.html (climaxes BEHIND subject via matte, unless fg verdict) ─
  const hero = dna && dna.hero ? dna.hero : null;
  // scene-resolved climax shadow (same source as the cinematic engine) — the legacy
  // 48px dark halo read as a smoke cloud behind the glyphs on bright scenes
  let climaxShadow = "0 2px 10px rgba(0,0,0,.38)";
  try {
    if (dna) {
      const tk = dnaLib.resolveTokens(dna, project, {});
      if (tk && tk.textShadow) climaxShadow = tk.textShadow;
    }
  } catch {}
  const heroGlow = hero ? hero.glow || 0 : 0;
  const heroBreathe = hero ? hero.breathe || 0 : 0;
  const dnaPerLetter = !!(hero && hero.perLetter);
  // per-climax loudness amplitude (RMS percentile of its window)
  for (const c of climaxes) {
    const impact = dnaLib.heroImpact(project, c.in, Math.min(c.in + 0.7, c.out));
    c.amp = +((0.75 + impact * 0.5) * (c.minor ? 0.7 : 1)).toFixed(3);
  }

  function buildIndexHtml() {
    const heroCaseCss =
      hero && hero.case && hero.case !== "none" ? `text-transform:${hero.case};` : "";
    const heroTrackCss = hero && hero.tracking ? `letter-spacing:${hero.tracking};` : "";
    const heroExtraCss = hero && hero.css ? hero.css : "";
    const sharedCss = climaxes.length
      ? `
  .climax{position:absolute;left:50%;transform:translate(-50%,-50%);white-space:nowrap;
    font-family:'${FONT}',sans-serif;font-weight:${(hero && hero.weight) || 800};${heroCaseCss}${heroTrackCss}${heroExtraCss}${(S.climax_css || "").trim()}
    line-height:1.12;color:${CFILL};
    ${
      heroBright
        ? "text-shadow:0 1px 6px rgba(0,0,0,.6);-webkit-text-stroke:2px rgba(0,0,0,.55);"
        : `text-shadow:${climaxShadow};`
    }
    paint-order:stroke fill}
  .climax .w{display:inline-block;opacity:0}
  .climax .w .l{display:inline-block;will-change:transform,opacity}
  .climax-glow{filter:blur(0.06em);opacity:0}`
      : "";
    const perCss = climaxes
      .map(
        (c) =>
          // text-indent mirrors letter-spacing so a tracked word stays optically centered
          // (the trailing letter-space otherwise shifts the glyphs half a gap left)
          `\n  #${c.id},#${c.id}-glow{top:${c.top}%;font-size:${c.cqh}cqh;${c.track ? `letter-spacing:${c.track}em;text-indent:${c.track}em;` : ""}}`,
      )
      .join("");
    const divs = climaxes
      .map((c) => {
        const perLetter = dnaPerLetter && !c.minor;
        const span = perLetter
          ? `<span class="w">${[...c.text].map((ch) => (ch === " " ? " " : `<span class="l">${esc(ch)}</span>`)).join("")}</span>`
          : `<span class="w">${esc(c.text)}</span>`;
        const glowDiv =
          !c.minor && heroGlow > 0
            ? `<div id="${c.id}-glow" class="cap climax climax-glow" aria-hidden="true"><span class="w">${esc(c.text)}</span></div>`
            : "";
        return `${glowDiv}<div id="${c.id}" class="cap climax">${span}</div>`;
      })
      .join("\n      ");
    const entrances = (c) =>
      ({
        rise: `gsap.fromTo(el,{yPercent:${(12 * c.amp).toFixed(1)}},{yPercent:0,duration:.6,ease:'power2.out'})`,
        "scale-settle": `gsap.fromTo(el,{scale:${(1 + 0.1 * c.amp).toFixed(3)}},{scale:1,duration:.5,ease:'expo.out'})`,
        settle: `gsap.fromTo(el,{scale:${(1 + 0.1 * c.amp).toFixed(3)}},{scale:1,duration:.5,ease:'expo.out'})`,
        emergence: `gsap.fromTo(el,{scale:${Math.max(0.74, 1 - 0.18 * c.amp).toFixed(3)}},{scale:1,duration:.55,ease:'expo.out'})`,
        slam: `gsap.fromTo(el,{scale:${(1 + 0.22 * c.amp).toFixed(3)}},{scale:1,duration:.16,ease:'back.out(2.2)'})`,
        "wipe-up": `gsap.fromTo(el,{clipPath:'inset(100% 0% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:.45,ease:'expo.out'})`,
        pop: `gsap.fromTo(el,{scale:.55},{scale:1,duration:.5,ease:'back.out(1.6)'})`,
      })[c.entrance] ||
      `gsap.fromTo(el,{yPercent:${(12 * c.amp).toFixed(1)}},{yPercent:0,duration:.6,ease:'power2.out'})`;
    const exits = (c) =>
      ({
        "rise-off": `gsap.to(el,{opacity:0,yPercent:-42,duration:${c.exitD},ease:'power2.in'})`,
        fade: `gsap.to(el,{opacity:0,duration:${c.exitD},ease:'power2.in'})`,
        "shrink-off": `gsap.to(el,{opacity:0,scale:.8,duration:${c.exitD},ease:'power2.in'})`,
      })[c.exit] || `gsap.to(el,{opacity:0,duration:${c.exitD},ease:'power2.in'})`;
    const js = climaxes
      .map((c) => {
        const perLetter = dnaPerLetter && !c.minor;
        const letterJs = perLetter
          ? `      tl.set(w,{opacity:1},${c.in.toFixed(3)});
      [...document.querySelectorAll('#${c.id} .l')].forEach(function(l,i){tl.fromTo(l,{opacity:0,y:'0.16em',scale:1.05},{opacity:1,y:0,scale:1,duration:.3,ease:'power4.out',overwrite:'auto'},${c.in.toFixed(3)}+i*${(hero && hero.letterStagger) || 0.014});});`
          : `      tl.fromTo(w,{opacity:0,y:10,scale:1.06},{opacity:1,y:0,scale:1,duration:.3,ease:'power4.out',overwrite:'auto'},${c.in.toFixed(3)});`;
        const glowJs =
          !c.minor && heroGlow > 0
            ? `      var gw=document.querySelector('#${c.id}-glow');
      tl.set(gw.querySelector('.w'),{opacity:1},${c.in.toFixed(3)});
      tl.fromTo(gw,{opacity:0},{opacity:${Math.min(0.5, heroGlow * c.amp).toFixed(3)},duration:.5,ease:'power2.out'},${(c.in + (c.entrance === "slam" ? 0.17 : 0.08)).toFixed(3)});
      tl.to(gw,{opacity:0,duration:.4,ease:'power2.in'},${(c.out - c.exitD).toFixed(3)});`
            : "";
        const breatheJs =
          !c.minor && heroBreathe > 0 && c.out - c.in > 1.4
            ? `      tl.fromTo(el,{scale:1},{scale:${(1 + heroBreathe).toFixed(4)},duration:${(c.out - c.in - 1.2).toFixed(3)},ease:'sine.inOut',overwrite:'auto'},${(c.in + 0.7).toFixed(3)});`
            : "";
        return `    (function(){var el=document.querySelector('#${c.id}');
      var w=document.querySelector('#${c.id} .w');
      tl.set(el,{opacity:1},${Math.max(0, c.in - 0.01).toFixed(3)});
      tl.add(${entrances(c)}, ${c.in.toFixed(3)});
${letterJs}
${glowJs}
${breatheJs}
      tl.add(${exits(c)}, ${(c.out - c.exitD).toFixed(3)});
      tl.set(el,{opacity:0},${c.out.toFixed(3)});
    })();`;
      })
      .join("\n");
    return `<!doctype html><html lang="en"><head><meta charset="UTF-8">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${W}px;height:${H}px;overflow:hidden;background:#000}
  #a-roll{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1}
  #stage{position:absolute;inset:0;z-index:2;container-type:size;pointer-events:none}${sharedCss}${perCss}
</style></head><body>
  <div id="root" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="${W}" data-height="${H}">
    <video id="a-roll" src="source.mp4" muted playsinline data-start="0" data-duration="${DUR}" data-track-index="0"></video>
    <div id="stage">
      ${divs}
    </div>
    <audio id="a-roll-audio" src="source.mp4" data-start="0" data-duration="${DUR}" data-track-index="3" data-volume="1"></audio>
  </div>
  <script>
    window.__timelines=window.__timelines||{};
    const tl=gsap.timeline({paused:true});
    tl.add(function(){},0);
${js}
    tl.add(function(){},${DUR});
    window.__timelines["main"]=tl;
  </script>
</body></html>\n`;
  }
  let indexHtml = buildIndexHtml();

  // ── 6. emit rail.html (verbatim rail, transparent; karaoke accent; hand-off) ─
  const lineDivs = segsT
    .map(
      (s, i) =>
        `      <div id="line-${i}" class="cap line"><span class="grade-pad">${s.words
          .map((w, wi) => `<span class="w" data-i="${wi}">${esc(w.text)}</span>`)
          .join(" ")}</span></div>`,
    )
    .join("\n");
  const railFontCqh = rail.font_cqh ?? 6.4;
  const railJs = segsT
    .map((s, i) => {
      const wordCalls = s.words
        .map(
          (w, wi) =>
            `      tl.set(W[${i}][${wi}],{opacity:1,color:'${CACC}'},${w.start.toFixed(3)});\n` +
            (wi > 0
              ? `      tl.set(W[${i}][${wi - 1}],{color:'${CFILL}'},${w.start.toFixed(3)});\n`
              : ""),
        )
        .join("");
      const lastIdx = s.words.length - 1;
      return (
        `      // line ${i} (${s.kind})\n` +
        `      tl.fromTo(LN[${i}],{opacity:0,y:14},{opacity:1,y:0,duration:${ENTER_D},ease:'power2.out'},${s.enter.toFixed(3)});\n` +
        wordCalls +
        `      tl.set(W[${i}][${lastIdx}],{color:'${CFILL}'},${Math.min(s.words[lastIdx].end + 0.25, s.exit).toFixed(3)});\n` +
        `      tl.to(LN[${i}],{opacity:0,y:-10,duration:${EXIT_D},ease:'power2.in'},${s.exit.toFixed(3)});\n` +
        `      tl.set(LN[${i}],{opacity:0},${(s.exit + EXIT_D + 0.01).toFixed(3)});\n` +
        `      tl.set(W[${i}],{opacity:0},${(s.exit + EXIT_D + 0.01).toFixed(3)});\n`
      );
    })
    .join("");
  // act 1 per climax — the rail yields for the peak's LANDING only (in−0.35 → in+0.9),
  // then recovers DURING the hold: the rail is the verbatim track and must stay
  // readable (on short clips dense with climaxes a full-hold dim left it ghosted
  // nearly throughout — a real QA catch on a 6s two-peak case).
  const dimJs = climaxes
    .map(
      (
        c,
      ) => `      tl.to(document.querySelector('.rail'),{opacity:${Math.max(0.45, (hero && hero.dimOthers) != null ? hero.dimOthers : 0.55).toFixed(2)},duration:.3,ease:'power2.out',overwrite:'auto'},${Math.max(0, c.in - 0.35).toFixed(3)});
      tl.to(document.querySelector('.rail'),{opacity:1,duration:.35,ease:'power2.out',overwrite:'auto'},${Math.min(c.in + 0.9, Math.max(0, c.out - 0.25)).toFixed(3)});\n`,
    )
    .join("");
  const railHtml = `<!doctype html><html lang="en"><head><meta charset="UTF-8">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${W}px;height:${H}px;overflow:hidden;background:transparent}
  .grade{position:absolute;inset:0;z-index:1;pointer-events:none;
    background:radial-gradient(130% 100% at 50% 28%, transparent 42%, rgba(0,0,0,.55))}
  #stage{position:absolute;inset:0;z-index:2;container-type:size}
  .rail{position:absolute;left:50%;bottom:${rail.bottom_pct ?? 9}%;transform:translateX(-50%);width:${rail.width_pct ?? 90}%}
  .line{position:absolute;left:0;right:0;bottom:0;text-align:center;opacity:0;
    font-family:'${RFONT}',sans-serif;font-weight:${(S.rail && S.rail.weight) || 600};${(S.rail_css || "").trim()}
    line-height:1.18;font-size:${railFontCqh}cqh;color:${CFILL};
    text-shadow:0 2px 10px rgba(0,0,0,.65)}
  .line .w{display:inline-block;opacity:0;margin:0 .1em;color:${CFILL}}
</style></head><body>
  <div id="root" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="${W}" data-height="${H}">
    <div class="grade"></div>
    <div id="stage"><div class="rail">
${lineDivs}
    </div></div>
  </div>
  <script>
    window.__timelines=window.__timelines||{};
    const tl=gsap.timeline({paused:true});
    const LN=[...document.querySelectorAll('.line')];
    const W=LN.map(function(l){return [...l.querySelectorAll('.w')]});
    tl.add(function(){},0);
${railJs}${dimJs}      tl.add(function(){},${DUR});
    window.__timelines["main"]=tl;
  </script>
</body></html>\n`;

  // ── 7. derived plan.json → timing/occlusion gates run for Standard ──────────
  const plan = {
    mode: "standard",
    template: S.template || "standard",
    ...(S.dna ? { dna: S.dna } : {}),
    compiled_by: "make-standard.cjs",
    width: W,
    height: H,
    fps: FPS,
    duration: DUR,
    ...(fgClimax ? { caption_layer: "fg" } : {}),
    groups: climaxes.map((c) => ({
      id: c.id,
      hero: true,
      ...(c.minor ? { minor: true } : {}),
      in: c.in,
      out: c.out,
      layer: fgClimax ? "fg" : "bg",
      words: c.promo.words.map((w) => ({
        text: w.text,
        start: w.start,
        end: Math.min(w.end, DUR - 0.05),
        ti: w.ti,
      })),
    })),
  };

  fs.writeFileSync(path.join(project, "plan.json"), JSON.stringify(plan, null, 2));
  fs.writeFileSync(path.join(project, "index.html"), indexHtml);
  fs.writeFileSync(path.join(project, "rail.html"), railHtml);

  // REAL-measure line-fit per climax: measure each peak's bbox in Chromium; re-emit on overflow.
  if (climaxes.length) {
    const times = climaxes.map((c) => ((c.in + Math.min(c.out, c.in + 1.2)) / 2).toFixed(2));
    cp.spawnSync("node", [path.join(__dirname, "measure-layout.cjs"), project, ...times], {
      stdio: "ignore",
      timeout: 90000,
    });
    try {
      const lay = JSON.parse(fs.readFileSync(path.join(project, "_layout.json"), "utf8"));
      let reEmit = false;
      const maxW = W * 0.96;
      const measuredCap = (i) => {
        const sample = (lay.samples || []).reduce(
          (a, b) => (Math.abs(b.t - +times[i]) < Math.abs((a ? a.t : 1e9) - +times[i]) ? b : a),
          null,
        );
        return sample && (sample.caps || []).find((x) => x.id === climaxes[i].id);
      };
      // pass 1 — APEXES first: their final size sets the minors' floor.
      // A peak is a FRAME EVENT: anything under 88% of usable width is raised toward a
      // 93% fill (the old <72% trigger left a dead zone where 75–88%-wide words never
      // grew). Height cap = sizeRange[1] × 1.25 — a std apex bursts a rail, not a body
      // composition, so it earns more height than the cinematic cap; clamped to 46cqh
      // so short words stop at monumental, not absurd. Formal register keeps ×1.0.
      for (let i = 0; i < climaxes.length; i++) {
        const c = climaxes[i];
        if (c.minor) continue;
        const cap = measuredCap(i);
        if (!cap || !cap.cap_bbox) continue;
        if (cap.cap_bbox.w > maxW) {
          const newCqh = Math.max(8, Math.floor((c.cqh * maxW) / cap.cap_bbox.w));
          console.log(
            `[make-standard] climax "${c.text}" REAL width ${Math.round(cap.cap_bbox.w)}px > ${Math.round(maxW)}px → ${c.cqh}cqh → ${newCqh}cqh (re-emit)`,
          );
          c.cqh = newCqh;
          reEmit = true;
        } else if (cap.cap_bbox.w < maxW * 0.88) {
          const r1 = dna && dna.hero && dna.hero.sizeRange ? dna.hero.sizeRange[1] : 0.34;
          const cqhCap = Math.min(
            46,
            Math.round(r1 * (dna && dna.register === "formal" ? 100 : 125)),
          );
          const fit = Math.floor((c.cqh * (maxW * 0.93)) / cap.cap_bbox.w);
          const newCqh = Math.min(cqhCap, fit);
          if (newCqh > c.cqh * 1.05 || fit > cqhCap) {
            if (newCqh > c.cqh)
              console.log(
                `[make-standard] apex "${c.text}" TIMID (${Math.round(cap.cap_bbox.w)}px of ${Math.round(maxW)}px) → ${c.cqh}cqh → ${newCqh}cqh (width-fit, cap ${cqhCap})`,
              );
            // SHORT-WORD FILL: when the height cap binds before the width target, the
            // word fills the frame with TRACKING instead (film-title craft — HER, DUNE:
            // letterspace until the word owns the width; ≤0.32em so it stays a word).
            const wAtCap = (cap.cap_bbox.w * newCqh) / c.cqh;
            // never letterspace lowercase (tracked lowercase falls apart — caps only)
            const capsy =
              (dna && dna.hero && dna.hero.case === "uppercase") ||
              String(c.text) === String(c.text).toUpperCase();
            if (fit > cqhCap && wAtCap < maxW * 0.85 && capsy) {
              const fontPx = (newCqh / 100) * H;
              // letter-spacing adds a gap after EVERY char (N gaps) and the centering
              // text-indent adds one more — budget N+1 gaps or the word leaves the frame
              const gaps = String(c.text).length + 1;
              const tr = +Math.min(0.32, (maxW * 0.88 - wAtCap) / (gaps * fontPx)).toFixed(3);
              if (tr >= 0.04) {
                c.track = tr;
                console.log(
                  `[make-standard] apex "${c.text}" short word at height cap (${Math.round(wAtCap)}px of ${Math.round(maxW)}px) → tracked +${tr}em to fill`,
                );
              }
            }
            c.cqh = newCqh;
            reEmit = true;
          }
        }
      }
      // pass 2 — MINORS ride the apex: floor at max(3× rail, 0.55× apex-final). A
      // minor is a damped BEAT in the same family as the apex, not a label; measured
      // width caps the raise so long phrases never spill the frame.
      const apexFinal = Math.max(...climaxes.filter((x) => !x.minor).map((x) => x.cqh), 0);
      for (let i = 0; i < climaxes.length; i++) {
        const c = climaxes[i];
        const cap = measuredCap(i);
        if (!c.minor) continue;
        if (cap && cap.cap_bbox && cap.cap_bbox.w > maxW) {
          const newCqh = Math.max(8, Math.floor((c.cqh * maxW) / cap.cap_bbox.w));
          console.log(
            `[make-standard] climax "${c.text}" REAL width ${Math.round(cap.cap_bbox.w)}px > ${Math.round(maxW)}px → ${c.cqh}cqh → ${newCqh}cqh (re-emit)`,
          );
          c.cqh = newCqh;
          reEmit = true;
          continue;
        }
        const floor = Math.max(Math.ceil(railCqh0 * 3), Math.round(apexFinal * 0.55));
        if (c.cqh >= floor) continue;
        let target = floor;
        if (cap && cap.cap_bbox && cap.cap_bbox.w > 0) {
          // a minor never rivals the apex's width: cap the RAISE at 72% of usable
          // (long-phrase minors at the 0.55x floor were visually tying the apex)
          const wAt = (cap.cap_bbox.w * target) / c.cqh;
          if (wAt > maxW * 0.72)
            target = Math.max(c.cqh, Math.floor((c.cqh * (maxW * 0.72)) / cap.cap_bbox.w));
        }
        if (target > c.cqh) {
          console.log(
            `[make-standard] minor "${c.text}" ${c.cqh}cqh rides the apex (${apexFinal}cqh) → ${target}cqh (0.55× family)`,
          );
          c.cqh = target;
          reEmit = true;
        }
      }
      if (reEmit) {
        // sizes changed → re-clamp vertical span so no peak clips the frame edge
        for (const c of climaxes) {
          const halfPct = (c.cqh * 1.12) / 2 + 0.6;
          const clamped = Math.min(100 - halfPct, Math.max(halfPct, c.top));
          if (Math.abs(clamped - c.top) > 0.2) {
            console.log(
              `[make-standard] climax "${c.text}" top ${c.top}% would clip at ${c.cqh}cqh → ${clamped.toFixed(1)}%`,
            );
            c.top = +clamped.toFixed(1);
          }
        }
        indexHtml = buildIndexHtml();
        fs.writeFileSync(path.join(project, "index.html"), indexHtml);
      }
      try {
        fs.unlinkSync(path.join(project, "_layout.json"));
      } catch {}
    } catch {
      /* measurement unavailable — estimate already applied */
    }
  }
  const apexN = climaxes.filter((c) => !c.minor).length;
  console.log(
    `[make-standard] ${segsT.length} rail line(s)${climaxes.length ? `, ${climaxes.length} climax(es): ${climaxes.map((c) => `"${c.text}"[${c.in.toFixed(2)}–${c.out.toFixed(2)}s${c.minor ? " minor" : " APEX"}]`).join(" · ")}` : " (no climax)"}, canvas ${DUR}s`,
  );
  if (apexN > 1)
    console.log(
      `[make-standard] note: ${apexN} climaxes share the apex size — consider differentiating font_cqh so one peak rules`,
    );
  console.log(
    `[make-standard] → index.html + rail.html + plan.json (gates will check timing/occlusion/hand-off)`,
  );
}
main();
