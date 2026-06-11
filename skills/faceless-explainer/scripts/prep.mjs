#!/usr/bin/env node
// Phase 4a — prep + group plan (deterministic; no subagent).
//
// Reads:  section_plan.md (Phase 3), narrator_scripts.json (Phase 2),
//         audio_meta.json (Phase 2.5, optional), capture/assets/ (Phase 1 —
//         hyperframes capture), design-system/fonts/ (Phase 1b, populated by
//         build-design.mjs from capture's font binaries),
//         hyperframes-animation/rules/*.md (existence only).
// Writes: public/<assets>, public/fonts/<woff2>, ./group_spec.json inside the
//         HyperFrames project root passed via --hyperframes. The
//         product-launch-video orchestrator initializes that project root
//         before calling prep.
//
// section_plan.md anchors recognised:
//   **Effects:**     — required, 2-5 backtick-wrapped rule ids
//   **Duration:**    — required, positive float seconds
//   **Continuity:**  — required, "break" | "continue" (scene 1 must be break)
//   (Components/Surface anchors removed — the design system is a style REFERENCE.
//    Every available component path is forwarded to every worker in
//    design_chunks.components[]; the Phase 4b worker self-picks by visual
//    judgment. No scene-level surface commitment.)
//   **SFX:**         — optional (soft), bullet list of "`<file>.mp3` at <T>s,
//                      volume <V> — note" cues (T is scene-local). Resolved
//                      against the SFX manifest; cues citing unknown files are
//                      dropped with an anomaly (validate.mjs section catches
//                      those typos earlier, in-loop). Omitted entirely → no SFX.
//
// Usage:
//   node prep.mjs --section-plan <path> --narrator-scripts <path> \
//                 --rules-dir <abs> --capture <path> --hyperframes <path> \
//                 --out <path> [--audio-meta <path>] [--design-system <path>] \
//                 [--scenes-per-group <int>]
//
// Exit 0 = group_spec.json written + summary on stdout.
// Exit 1 = structural failure (missing anchor / missing rule / bad value) on stderr.

import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { loadTransitionRegistry, transitionsByName } from "./lib/transition-registry.mjs";
import { resolveDimensions } from "./lib/dimensions.mjs";

// ---------- argv ----------
const argv = process.argv.slice(2);
const flag = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : def;
};
function die(msg) {
  console.error(`✗ prep.mjs: ${msg}`);
  process.exit(1);
}
const round3 = (n) => Number(n.toFixed(3));

const sectionPlanPath = resolve(flag("section-plan", "./section_plan.md"));
const narratorScriptsPath = resolve(flag("narrator-scripts", "./narrator_scripts.json"));
const audioMetaPath = flag("audio-meta") ? resolve(flag("audio-meta")) : null;
const rulesDirArg = flag("rules-dir");
if (!rulesDirArg) die("Missing required --rules-dir");
const rulesDir = resolve(rulesDirArg);
// `--capture` is the v3 flag (hyperframes capture). `--research` kept as a
// deprecated alias to make in-flight projects upgrade cleanly. Either one
// resolves to the same on-disk root that holds the page-load artifacts that
// downstream phases reference.
const captureDir = resolve(flag("capture", flag("research", "./capture")));
const designSystemDir = resolve(flag("design-system", "./design-system"));
const hyperframesDir = resolve(flag("hyperframes", "."));
const outPath = resolve(flag("out", "./group_spec.json"));
const scenesPerGroupMax = parseInt(flag("scenes-per-group", "3"), 10);
// Optional — orchestrator passes <SKILL_DIR>/assets/sfx absolute path.
// If absent: SFX cues in section_plan are silently ignored.
// (Captions are written by the Phase 4a.5 captions agent, not by prep.)
const sfxLibDir = flag("sfx-lib") ? resolve(flag("sfx-lib")) : null;
if (!isFinite(scenesPerGroupMax) || scenesPerGroupMax < 1) {
  die(`--scenes-per-group must be a positive integer (got "${flag("scenes-per-group")}")`);
}

// ---------- Step 1: bootstrap HyperFrames project root ----------
if (!existsSync(hyperframesDir)) {
  console.log(`HyperFrames project root missing → npx hyperframes init ${hyperframesDir}`);
  const r = spawnSync(
    "npx",
    [
      "hyperframes",
      "init",
      hyperframesDir,
      "--example",
      "blank",
      "--non-interactive",
      "--skip-skills",
    ],
    { stdio: "inherit" },
  );
  if (r.status !== 0) die("npx hyperframes init failed");
}

// ---------- Step 2: copy capture assets → public/ ----------
const publicDir = join(hyperframesDir, "public");
mkdirSync(publicDir, { recursive: true });

// `.bin` is the capture-stage fallback name for images with unrecognized MIME
// (typically image/* with a missing or CDN-rewritten Content-Type). Downstream
// Phase 4b workers reference them as <img src>; browsers render by magic bytes
// and almost all display correctly. Include it in the allowlist to avoid orphaning files.
const ASSET_EXTS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".svg",
  ".bin",
  // Video extensions — Phase 3 frequently quotes hero/demo .mp4 from the
  // capture. Forgetting these forces Phase 4b workers to substitute poster
  // .webp, losing motion fidelity. Keep in sync with the playable formats
  // hyperframes-core accepts in <video>/clip sub-comps.
  ".mp4",
  ".mov",
  ".webm",
]);
const collisions = [];
let copied = 0;

function walk(dir) {
  if (!existsSync(dir)) return;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.isFile() && ASSET_EXTS.has(extname(ent.name).toLowerCase())) {
      const target = join(publicDir, ent.name);
      if (existsSync(target)) {
        collisions.push({ kept: target, skipped: p });
      } else {
        copyFileSync(p, target);
        copied++;
      }
    }
  }
}
// hyperframes capture writes assets/ + screenshots/ + extracted/ under
// captureDir. We want only image/video media (assets/ + screenshots/), not
// the JSON manifests under extracted/.
walk(join(captureDir, "assets"));
walk(join(captureDir, "screenshots"));

// ---------- Step 2b: copy design-system/fonts → public/fonts/ ----------
// Phase 1b's download-fonts.mjs writes self-hosted brand fonts into
// design-system/fonts/. Copy them into public/fonts/ so the
// renderer resolves the @font-face rules that index.html declares.
const fontsSrcDir = join(designSystemDir, "fonts");
let fontsCopied = 0;
const FONT_EXTS = new Set([".woff2", ".woff", ".ttf", ".otf"]);
if (existsSync(fontsSrcDir)) {
  const fontsDestDir = join(publicDir, "fonts");
  mkdirSync(fontsDestDir, { recursive: true });
  for (const ent of readdirSync(fontsSrcDir, { withFileTypes: true })) {
    if (!ent.isFile()) continue;
    if (!FONT_EXTS.has(extname(ent.name).toLowerCase())) continue;
    const src = join(fontsSrcDir, ent.name);
    const dest = join(fontsDestDir, ent.name);
    if (!existsSync(dest)) {
      copyFileSync(src, dest);
      fontsCopied++;
    }
  }
}

// ---------- Step 2c: extract @font-face block from design.html ----------
// download-fonts.mjs wraps its injection with two comment anchors. Pull the
// block out, rewrite url('fonts/<file>') → url('public/fonts/<file>') so the
// paths resolve against the HyperFrames project root, and emit into group_spec.font_face_css
// so Phase 4c can paste it into index.html's <head>. @font-face is global by
// spec and cannot be class-scoped — declaring it once at the document root is
// the only way it actually loads.
let fontFaceCss = "";
const designHtmlPath = join(designSystemDir, "design.html");
if (existsSync(designHtmlPath)) {
  const designHtml = readFileSync(designHtmlPath, "utf8");
  const m = designHtml.match(
    /\/\*\s*===\s*auto-injected by download-fonts\.mjs\s*===\s*\*\/([\s\S]*?)\/\*\s*===\s*end download-fonts\.mjs block\s*===\s*\*\//,
  );
  if (m) {
    fontFaceCss = m[1].trim().replace(/url\(\s*(['"]?)fonts\//g, "url($1public/fonts/");
  }
}

// ---------- Step 3: parse section_plan.md ----------
if (!existsSync(sectionPlanPath)) die(`section_plan.md not found at ${sectionPlanPath}`);
const planText = readFileSync(sectionPlanPath, "utf8");

const sceneHeadRe = /^## Scene\s+(\d+)\s*:\s*(.+?)\s*$/gm;
const heads = [...planText.matchAll(sceneHeadRe)];
if (heads.length === 0) die("no '## Scene N: <name>' headings found in section_plan.md");

// Film Direction: the film-level header (`## Film Direction` ... up to the first
// `## Scene`). Written once by visual-design; the orchestrator prepends it to
// every scene worker's shared packet header and to the finalize dispatch, so
// per-scene creative_brief can stay deltas-only. validate.mjs section enforces
// presence and size; prep just extracts what is there (tolerant when absent).
let film_direction = "";
{
  const fdHead = planText.match(/^## Film Direction[ \t]*$/m);
  if (fdHead && fdHead.index < heads[0].index) {
    film_direction = planText.slice(fdHead.index + fdHead[0].length, heads[0].index).trim();
  }
}

const ANCHORS = ["Effects", "Duration", "Continuity"];
// Components/Surface anchors removed — the design system is a style REFERENCE,
// not a plan-time contract (workers self-pick components from the forwarded
// library; no scene-level surface commitment). Blueprint + Bridge are kept only as
// legacy optional anchors so old plans do not leak them into creative_brief; both ignored.
const OPTIONAL_ANCHORS = ["Blueprint", "Transition", "Bridge"];

function anchorRe(name) {
  return new RegExp(`^\\*\\*${name}:\\*\\*\\s*(.*)$`, "m");
}

function parseSceneBlock(body, sceneId, isFirst) {
  const raw = {};
  let lastAnchorEnd = 0;
  for (const a of ANCHORS) {
    const m = body.match(anchorRe(a));
    if (!m) die(`${sceneId}: missing **${a}:** anchor in section_plan.md`);
    raw[a] = m[1].trim();
    const end = m.index + m[0].length;
    if (end > lastAnchorEnd) lastAnchorEnd = end;
  }
  // Optional anchors — include them in lastAnchorEnd when present to avoid leaking
  // into creative_brief; missing optional anchors are fine.
  for (const a of OPTIONAL_ANCHORS) {
    const m = body.match(anchorRe(a));
    if (m) {
      raw[a] = m[1].trim();
      const end = m.index + m[0].length;
      if (end > lastAnchorEnd) lastAnchorEnd = end;
    }
  }

  // Effects: ordered backtick-wrapped ids inside [...]
  const effects = [...raw.Effects.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
  if (effects.length === 0) die(`${sceneId}: **Effects:** has no backtick-wrapped ids`);

  // Duration: leading float
  const durM = raw.Duration.match(/[\d.]+/);
  if (!durM) die(`${sceneId}: **Duration:** could not parse float from "${raw.Duration}"`);
  const estimatedDuration_s = parseFloat(durM[0]);
  if (!isFinite(estimatedDuration_s) || estimatedDuration_s <= 0)
    die(`${sceneId}: **Duration:** ${estimatedDuration_s} is not a positive float`);

  // Continuity: break | continue (scene 1 must be break)
  const cont = raw.Continuity.toLowerCase();
  if (cont !== "break" && cont !== "continue")
    die(`${sceneId}: **Continuity:** must be "break" or "continue" (got "${raw.Continuity}")`);
  if (isFirst && cont !== "break") die(`${sceneId}: scene 1 must be **Continuity:** break`);

  // Transition (OPTIONAL): how THIS scene is entered.
  //   **Transition:** <type> [DIRECTION] [<dur>s]
  // Parsed loosely here (validator already shape-checked); null when absent so
  // Step 6.5 can default-fill. Scene 1's transition is the open (no between-
  // scene transition precedes it) — parsed but ignored at injection time.
  let transition = null;
  if (raw.Transition) {
    const tokens = raw.Transition.trim().split(/\s+/);
    const type = tokens[0].toLowerCase();
    let direction = null;
    let durationOverride = null;
    for (const tok of tokens.slice(1)) {
      if (/^[\d.]+s$/i.test(tok)) durationOverride = parseFloat(tok);
      else direction = tok.toUpperCase();
    }
    // Legacy Bridge anchor is intentionally ignored. Continue runs now use one
    // shared-DOM group composition; break seams use only Tier-B wrapper transitions.
    if (type) transition = { type, direction, duration_s: durationOverride, bridge_id: null };
  }

  // SFX (optional / soft anchor; omitted entirely = no SFX for this scene):
  //   **SFX:**
  //   - `impact-bass-1.mp3` at 0.2s, volume 0.35 — hero snap
  //   - `whoosh-short.mp3` at 4.1s — exit
  // (or `**SFX:** none`, or no anchor at all). The validator
  // (validate.mjs section) no longer requires the anchor; when present it
  // checks each cited file against the manifest. This parser accepts either
  // form. "none" / any non-empty trailer skips the bullet scan (no cues).
  // sfx_cues[].t is SCENE-LOCAL seconds (this function knows nothing about
  // global timing; we add s.start_s offset in Step 6).
  const sfxCues = [];
  const sfxHeaderRe = /^\*\*SFX:\*\*[ \t]*(.*)$/m;
  const sfxHeaderM = body.match(sfxHeaderRe);
  if (sfxHeaderM) {
    const sfxHeaderEnd = sfxHeaderM.index + sfxHeaderM[0].length;
    if (sfxHeaderEnd > lastAnchorEnd) lastAnchorEnd = sfxHeaderEnd;
  }
  if (sfxHeaderM && sfxHeaderM[1].trim() === "") {
    const sfxHeaderEnd = sfxHeaderM.index + sfxHeaderM[0].length;
    const afterHeader = body.slice(sfxHeaderEnd);
    const lines = afterHeader.split("\n");
    let consumed = 0; // chars consumed past the header
    for (let li = 0; li < lines.length; li++) {
      const line = lines[li];
      const trimmed = line.trim();
      if (trimmed === "") {
        consumed += line.length + 1;
        continue;
      }
      if (!trimmed.startsWith("-")) break; // next anchor / prose / scene heading
      // Parse: `<file>.mp3` at <T>s[, volume <V>][, — <note>]
      const cueRe =
        /^[\s\-*]+`([^`]+\.mp3)`\s+at\s+([\d.]+)\s*s(?:[,\s]+volume\s+([\d.]+))?(?:\s*[—–-]\s*(.*))?$/;
      const m = trimmed.match(cueRe);
      if (m) {
        const file = m[1];
        const tLocal = parseFloat(m[2]);
        const volume = m[3] != null ? parseFloat(m[3]) : null;
        const note = m[4] ? m[4].trim() : "";
        if (!isFinite(tLocal) || tLocal < 0) {
          die(`${sceneId}: **SFX:** invalid t for "${file}": "${m[2]}"`);
        }
        sfxCues.push({ file, t_local: tLocal, volume, note });
      } else {
        die(`${sceneId}: **SFX:** unparseable cue line: "${trimmed}"`);
      }
      consumed += line.length + 1;
    }
    const sfxBlockEnd = sfxHeaderEnd + consumed;
    if (sfxBlockEnd > lastAnchorEnd) lastAnchorEnd = sfxBlockEnd;
  }

  // creative_brief = everything after the LAST anchor line, verbatim
  const brief = body.slice(lastAnchorEnd).replace(/^\s*\n+/, "");

  return {
    effects,
    estimatedDuration_s,
    continuity: cont,
    transition,
    sfxCues,
    creative_brief: brief,
  };
}

const scenes = [];
for (let i = 0; i < heads.length; i++) {
  const m = heads[i];
  const sceneNumber = parseInt(m[1], 10);
  const sceneName = m[2].trim();
  const start = m.index + m[0].length;
  const end = i + 1 < heads.length ? heads[i + 1].index : planText.length;
  const body = planText.slice(start, end);
  const sceneId = `scene_${sceneNumber}`;
  const parsed = parseSceneBlock(body, sceneId, i === 0);
  scenes.push({ sceneNumber, sceneId, sceneName, ...parsed });
}

// ---------- Step 4: resolve rule_paths ----------
const ruleStatCache = new Map();
function statRule(p) {
  if (ruleStatCache.has(p)) return ruleStatCache.get(p);
  let st;
  try {
    st = statSync(p);
  } catch {
    st = null;
  }
  ruleStatCache.set(p, st);
  return st;
}
for (const s of scenes) {
  s.rule_paths = s.effects.map((id) => {
    const p = join(rulesDir, `${id}.md`);
    const st = statRule(p);
    if (!st || !st.isFile() || st.size === 0) die(`${s.sceneId}: rule file empty or missing: ${p}`);
    return p;
  });
}

// anomalies collected throughout the rest of the script (non-fatal mismatches:
// chunks missing → fallback, audio duration drift, voice file dropped, asset
// candidate not on disk, BGM still rendering). Declared up-front so Step 4b
// can append to it.
const anomalies = [];

// ---------- Step 4b: resolve design_chunks ----------
// Phase 1b's emit-chunks.mjs writes design-system/chunks/{tokens.css, easings.js,
// components/<id>.html, index.json}. Downstream Phase 4b workers read only the
// chunks listed in their dispatch — never design.html — cutting per-worker
// must-read load by ~4× (12 KB design.html → 1-3 KB per chunk file).
//
// Resolution policy:
//   - chunks/index.json missing       → degrade gracefully: design_chunks = null
//                                       for every scene, log an anomaly, and let
//                                       the worker fall back to reading design.html.
//   - index.json present              → every scene gets tokens_file + easings_file
//                                       + the FULL component library (worker picks).
const chunksDir = join(designSystemDir, "chunks");
const chunksIndexPath = join(chunksDir, "index.json");
let chunksIndex = null;
if (existsSync(chunksIndexPath)) {
  try {
    chunksIndex = JSON.parse(readFileSync(chunksIndexPath, "utf8"));
  } catch (e) {
    anomalies.push(
      `design-system/chunks/index.json present but unreadable (${e.message}) — workers will fall back to design.html`,
    );
  }
} else {
  anomalies.push(
    `design-system/chunks/ missing — Phase 1b's emit-chunks.mjs was not run. Workers will fall back to reading design.html (slower).`,
  );
}

let availableComponents = null;
if (chunksIndex) {
  availableComponents = new Map(
    (chunksIndex.components || []).map((c) => [c.id, join(designSystemDir, c.file)]),
  );
}

for (const s of scenes) {
  if (!chunksIndex) {
    s.design_chunks = null;
    continue;
  }
  const tokensAbs = join(designSystemDir, chunksIndex.tokens_file || "chunks/tokens.css");
  const easingsAbs = join(designSystemDir, chunksIndex.easings_file || "chunks/easings.js");
  const voiceAbs = join(designSystemDir, chunksIndex.voice_file || "chunks/voice.md");
  if (!existsSync(tokensAbs))
    die(`design_chunks: tokens_file "${tokensAbs}" referenced by index.json but missing on disk`);
  if (!existsSync(easingsAbs))
    die(`design_chunks: easings_file "${easingsAbs}" referenced by index.json but missing on disk`);
  if (!existsSync(voiceAbs))
    die(`design_chunks: voice_file "${voiceAbs}" referenced by index.json but missing on disk`);

  // Optional chunks (null when preset declared no §H / §T). Worker reads
  // these on demand — paths are passed through dispatch verbatim. We only check
  // file existence when index.json references one (consistency guard); the
  // worker then opens it lazily without re-checking.
  const hintsAbs = chunksIndex.hints_file ? join(designSystemDir, chunksIndex.hints_file) : null;
  if (hintsAbs && !existsSync(hintsAbs))
    die(`design_chunks: hints_file "${hintsAbs}" referenced by index.json but missing on disk`);
  const typeRolesAbs = chunksIndex.type_roles_file
    ? join(designSystemDir, chunksIndex.type_roles_file)
    : null;
  if (typeRolesAbs && !existsSync(typeRolesAbs))
    die(
      `design_chunks: type_roles_file "${typeRolesAbs}" referenced by index.json but missing on disk`,
    );

  // Components are a style REFERENCE library, not a plan-time citation. Forward
  // EVERY available component to every worker; the worker picks which to use by
  // visual judgment (see agents/hyperframes-scene.md). Existence is guaranteed by
  // emit-chunks; filter defensively so a stale index entry never ships a missing path.
  const componentPaths = availableComponents
    ? [...availableComponents.values()].filter((abs) => existsSync(abs))
    : [];
  s.design_chunks = {
    tokens_file: tokensAbs,
    easings_file: easingsAbs,
    voice_file: voiceAbs,
    hints_file: hintsAbs,
    type_roles_file: typeRolesAbs,
    components: componentPaths,
  };
}

// ---------- Step 4b: extract the :root token block from tokens.css ----------
// tokens.css is a single global :root {…} block (brand colors, font roles,
// spacing/radius). Emit it into group_spec.brand_tokens_css so assemble-index.mjs
// can declare it ONCE in index.html's <head>. CSS custom properties inherit
// through the light DOM into every mounted sub-composition, so scenes reference
// var(--*) WITHOUT re-declaring the block locally (see agents/hyperframes-scene.md).
let brandTokensCss = "";
if (chunksIndex) {
  const tokensAbs = join(designSystemDir, chunksIndex.tokens_file || "chunks/tokens.css");
  if (existsSync(tokensAbs)) {
    const tokensRaw = readFileSync(tokensAbs, "utf8");
    const m = tokensRaw.match(/:root\s*\{[\s\S]*\}/);
    brandTokensCss = (m ? m[0] : tokensRaw).trim();
  }
}

// ---------- Step 5: cross-check narrator + audio merge ----------
if (!existsSync(narratorScriptsPath))
  die(`narrator_scripts.json not found at ${narratorScriptsPath}`);
const narratorScripts = JSON.parse(readFileSync(narratorScriptsPath, "utf8"));
const narratorByNumber = new Map((narratorScripts.scenes || []).map((s) => [s.sceneNumber, s]));

// Canvas dimensions — landscape 1920×1080 unless the upstream intent layer set
// `orientation`/`dimensions` in narrator_scripts.json (or --width/--height here
// override for testing). The resolved size is stamped into group_spec.width/
// height; every downstream script + scene worker reads it from there. See the
// seam doc at scripts/lib/dimensions.mjs.
const {
  width: CANVAS_W,
  height: CANVAS_H,
  source: dimSource,
} = resolveDimensions({ width: flag("width"), height: flag("height") }, narratorScripts);

let audioMeta = null;
if (audioMetaPath) {
  if (existsSync(audioMetaPath)) {
    audioMeta = JSON.parse(readFileSync(audioMetaPath, "utf8"));
  } else {
    console.log(`audio-meta path given but file missing — proceeding without audio`);
  }
}

// Duration truth ladder (highest → lowest):
//   audio_meta.scenes[sceneId].voiceDuration   <- measured TTS wav = TRUE TRUTH
//   section_plan.md "**Duration:** Xs"          ← plan agent decision (already
//                                                  reconciled with audio per guide)
//   narrator_scripts.json estimatedDuration    ← earliest estimate
//
// Final s.estimatedDuration_s = highest-priority source that exists.
// Mismatch anomalies surface upstream inconsistencies but do NOT block.

// ffprobe a media file's container duration in seconds (NaN on any failure).
function ffprobeDurationSeconds(absPath) {
  const r = spawnSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", absPath],
    { encoding: "utf8" },
  );
  if (r.status !== 0) return NaN;
  return parseFloat((r.stdout || "").trim());
}

for (const s of scenes) {
  const planDur = s.estimatedDuration_s; // value as parsed from section_plan
  const narrator = narratorByNumber.get(s.sceneNumber);
  let narratorDur = NaN;
  if (narrator?.estimatedDuration != null) {
    const m = String(narrator.estimatedDuration).match(/[\d.]+/);
    narratorDur = m ? parseFloat(m[0]) : NaN;
  }
  let audioDur = NaN;
  let audioScene = null;
  let audioDurSource = null;
  if (audioMeta) {
    audioScene = audioMeta.scenes?.[s.sceneId] || null;
    if (audioScene && isFinite(audioScene.voiceDuration) && audioScene.voiceDuration > 0) {
      audioDur = audioScene.voiceDuration;
      audioDurSource = "audio_meta";
    } else if (audioScene) {
      // audio_meta lists the scene but voiceDuration is missing/0 (e.g. an
      // interrupted or partially-written audio.mjs run). The TTS wav on disk is
      // still the real truth — ffprobe it before falling back to the plan
      // estimate, so a stale 0 doesn't inflate the scene into dead air (visual
      // slot far longer than the voiceover → captions vanish mid-scene).
      const voiceRel = audioScene.voicePath || `assets/voice/${s.sceneId}.wav`;
      const voiceAbs = join(hyperframesDir, voiceRel);
      if (existsSync(voiceAbs)) {
        const probed = ffprobeDurationSeconds(voiceAbs);
        if (isFinite(probed) && probed > 0) {
          audioDur = probed;
          audioDurSource = "voice_probe";
          anomalies.push(
            `${s.sceneId}: audio_meta.voiceDuration missing/0 — recovered ${probed.toFixed(3)}s by ffprobing ${voiceRel} (vs section_plan ${planDur}s)`,
          );
        }
      }
    }
  }

  // Pick final value by truth ladder.
  let finalDur = planDur;
  let source = "section_plan";
  if (isFinite(audioDur)) {
    finalDur = audioDur;
    source = audioDurSource || "audio_meta";
  }
  // Round to 3 decimals — naive cumulative `start_s += dur` accumulates
  // float error fast enough that lint catches it (2.24 + 6.357 = 8.597000…1
  // → overlapping_clips_same_track). Round per scene and we emit a
  // precomputed start_s below so finalize never accumulates.
  s.estimatedDuration_s = Number(finalDur.toFixed(3));

  // Anomalies: surface cross-stage inconsistencies. audio_meta is truth when
  // present; plan and narrator are estimates that may legitimately differ within
  // small tolerances (guide.md §1 lets plan agent keep narrator when audio diff
  // <10%). Report divergence but don't moralize about it.
  const pct = (a, b) => (b > 0 ? (Math.abs(a - b) / b) * 100 : 0);
  if (source === "audio_meta") {
    if (Math.abs(audioDur - planDur) > 0.01) {
      const p = pct(audioDur, planDur).toFixed(1);
      anomalies.push(
        `${s.sceneId}: audio_meta ${audioDur}s (truth) overrides section_plan ${planDur}s (${p}% diff)`,
      );
    }
    if (isFinite(narratorDur) && Math.abs(audioDur - narratorDur) / audioDur > 0.1) {
      const p = pct(audioDur, narratorDur).toFixed(1);
      anomalies.push(
        `${s.sceneId}: narrator estimate ${narratorDur}s off by ${p}% vs audio_meta ${audioDur}s (truth)`,
      );
    }
  } else if (
    source === "section_plan" &&
    isFinite(narratorDur) &&
    Math.abs(narratorDur - planDur) > 0.01
  ) {
    const p = pct(narratorDur, planDur).toFixed(1);
    anomalies.push(
      `${s.sceneId}: section_plan ${planDur}s vs narrator ${narratorDur}s (${p}% — no audio_meta available; using section_plan)`,
    );
  }

  // audio merge: voice + words paths (independent of duration)
  s.voicePath = audioScene?.voicePath || "";
  s.wordsPath = audioScene?.wordsPath || "";

  // disk checks (drop missing voice/words paths to empty + record anomaly)
  if (s.voicePath && !existsSync(join(hyperframesDir, s.voicePath))) {
    anomalies.push(`${s.sceneId}: voicePath "${s.voicePath}" not on disk — dropping to ""`);
    s.voicePath = "";
  }
  if (s.wordsPath && !existsSync(join(hyperframesDir, s.wordsPath))) {
    anomalies.push(`${s.sceneId}: wordsPath "${s.wordsPath}" not on disk — dropping to ""`);
    s.wordsPath = "";
  }
  // Check assetCandidates[] — worker may reference any of them as
  // assets in the scene HTML. Missing assets caused 50s+ of finalize
  // "hunt-and-cp" debugging in past runs.
  const narratorScene = narratorByNumber.get(s.sceneNumber);
  const candidates = Array.isArray(narratorScene?.assetCandidates)
    ? narratorScene.assetCandidates
    : [];
  for (const cand of candidates) {
    if (
      cand?.path &&
      typeof cand.path === "string" &&
      cand.path.startsWith("public/") &&
      !existsSync(join(hyperframesDir, cand.path))
    ) {
      anomalies.push(
        `${s.sceneId}: assetCandidate "${cand.path}" listed in narrator_scripts.json but not in public/ — Phase 4b worker may fail`,
      );
    }
  }
  s.assetCandidates = candidates;
}

// ---------- Step 6: group by continuity, cap=N ----------
const groups = [];
let cur = null;
// Precomputed cumulative scene start — finalize reads this verbatim instead of
// accumulating in JS, dodging FP-precision overlaps that lint catches as
// `overlapping_clips_same_track`.
let runningStart = 0;
for (const s of scenes) {
  const startNew = s.continuity === "break" || !cur || cur.scene_ids.length >= scenesPerGroupMax;
  if (startNew) {
    if (cur) groups.push(cur);
    cur = {
      worker_id: `w${groups.length + 1}`,
      scene_ids: [],
      scenes: {},
    };
  }
  const start_s = Number(runningStart.toFixed(3));
  cur.scene_ids.push(s.sceneId);
  cur.scenes[s.sceneId] = {
    start_s,
    effects: s.effects,
    rule_paths: s.rule_paths,
    assetCandidates: s.assetCandidates,
    estimatedDuration_s: s.estimatedDuration_s,
    voicePath: s.voicePath,
    wordsPath: s.wordsPath,
    design_chunks: s.design_chunks,
    creative_brief: s.creative_brief,
  };
  runningStart += s.estimatedDuration_s;
}
if (cur) groups.push(cur);

// ---------- Step 6.6: visual clips ----------
// Logical scenes remain the timing authority for voice / captions / SFX. Visual
// clips are the top-level sub-comps mounted on track 0:
//   - single-scene worker -> compositions/scene_N.html
//   - multi-scene continue worker -> compositions/group_wN.html
// A group composition owns true shared DOM across its logical scene run.
const visual_clips = [];
const scene_to_visual = {};
const internal_seams = [];

for (const g of groups) {
  const firstSid = g.scene_ids[0];
  const lastSid = g.scene_ids[g.scene_ids.length - 1];
  const firstScene = g.scenes[firstSid];
  const lastScene = g.scenes[lastSid];
  const start_s = firstScene.start_s;
  const end_s = round3(lastScene.start_s + lastScene.estimatedDuration_s);
  const duration_s = round3(end_s - start_s);
  const isGroupClip = g.scene_ids.length > 1;
  const composition_id = isGroupClip ? `group_${g.worker_id}` : firstSid;
  const composition_file = `compositions/${composition_id}.html`;

  g.start_s = start_s;
  g.duration_s = duration_s;
  g.composition_id = composition_id;
  g.composition_file = composition_file;
  g.kind = isGroupClip ? "group" : "scene";

  for (const sid of g.scene_ids) {
    const sceneEntry = g.scenes[sid];
    sceneEntry.local_start_s = round3(sceneEntry.start_s - start_s);
    sceneEntry.visual_id = composition_id;
    scene_to_visual[sid] = composition_id;
  }

  for (let i = 1; i < g.scene_ids.length; i++) {
    const fromSid = g.scene_ids[i - 1];
    const toSid = g.scene_ids[i];
    internal_seams.push({
      from_scene: fromSid,
      to_scene: toSid,
      visual_id: composition_id,
      worker_id: g.worker_id,
      global_time_s: g.scenes[toSid].start_s,
      local_time_s: g.scenes[toSid].local_start_s,
      is_break: false,
    });
  }

  visual_clips.push({
    id: composition_id,
    file: composition_file,
    kind: isGroupClip ? "group" : "scene",
    worker_id: g.worker_id,
    scene_ids: [...g.scene_ids],
    start_s,
    duration_s,
  });
}

// ---------- Step 6.7: visual-clip transitions (Tier B harness) ----------
// One record per adjacent VISUAL clip boundary. Same-worker internal seams live
// inside group_wN.html and keep real shared DOM; the top-level harness does not
// inject a wrapper transition between logical scenes in the same visual clip.
// `is_break` is derived from the GROUPING (different visual_id / worker_id), not
// re-read from the plan's Continuity anchor, because the cap=N grouping is the
// authority on which scenes a single worker actually owns.
//
// Determinism: the planner optionally names a transition per scene (the ENTERING
// transition). When absent, we default-fill from the registry's rules. No agent.
const transitions = [];
let txRegistry = null;
let txByName = new Map();
try {
  txRegistry = loadTransitionRegistry();
  txByName = transitionsByName();
} catch (e) {
  anomalies.push(`transition registry unreadable — scene transitions skipped (${e.message})`);
}
if (txRegistry) {
  // scene_id -> worker_id (so we can tell break vs continue boundaries from grouping)
  const sceneWorker = new Map();
  for (const g of groups) for (const sid of g.scene_ids) sceneWorker.set(sid, g.worker_id);

  // Energy classification for the DEFAULT transition (only when the planner did
  // not name one). We scan the entering scene's TONE words — the mood the brief
  // actually describes — NOT layout jargon. Critically we do NOT match words like
  // "hero" / "reveal" / "drop" / "punch": those are composition/layout terms
  // ("centered hero composition", "product reveal") that say nothing about energy,
  // and matching them made every scene default to zoom-through (observed on a real
  // 8-scene promo). Only genuine high-energy TONE words promote to zoom-through;
  // everything else gets the calm universal default (blur-crossfade), which suits
  // most moods and keeps the whole video to ~2 transition types (the "repeat 2-3"
  // principle) instead of a monotonous zoom on every cut.
  const HIGH_TONE_RX =
    /\b(explosive|high[- ]energy|frenetic|kinetic|momentum|powerful|adrenaline|hype|punchy|aggressive|fast[- ]cut|rapid)\b/i;

  const briefFor = (sid) => {
    for (const g of groups) if (g.scenes[sid]) return g.scenes[sid].creative_brief || "";
    return "";
  };

  for (let i = 1; i < scenes.length; i++) {
    const fromScene = scenes[i - 1];
    const toScene = scenes[i];
    const fromSid = fromScene.sceneId;
    const toSid = toScene.sceneId;
    const fromVisual = scene_to_visual[fromSid];
    const toVisual = scene_to_visual[toSid];
    const is_break = sceneWorker.get(fromSid) !== sceneWorker.get(toSid);
    if (fromVisual === toVisual) continue;

    // The ENTERING transition is named on the destination scene.
    const named = toScene.transition; // { type, direction, duration_s, bridge_id } | null
    let type = named?.type || null;
    let direction = named?.direction || null;
    let durationOverride = named?.duration_s ?? null;

    // Default-fill (no named transition): one calm universal — blur-crossfade,
    // which masks any background shift and reads intentional — unless the entering
    // beat's TONE reads HIGH energy, which promotes to zoom-through. (The old
    // surface-conflict and calm branches both resolved to blur-crossfade too, so
    // they were redundant; zoom-through itself blurs, so it still masks a bg clash.)
    if (!type) {
      // Scan only the FIRST ~160 chars (the beat's mood parenthetical) — the rest is
      // layout prose full of false-positive words.
      const tone = briefFor(toSid).slice(0, 160);
      type = HIGH_TONE_RX.test(tone)
        ? txRegistry.default_high_energy || "zoom-through"
        : txRegistry.default_calm || "blur-crossfade";
    }

    const rec = txByName.get(type);
    // All harness transitions are Tier-B visual-clip boundaries. Continue seams
    // inside a group_wN.html are authored by that worker's shared timeline.

    // Resolve direction default for directional types.
    if (rec && Array.isArray(rec.directions) && rec.directions.length > 0 && !direction) {
      direction = rec.default_direction || rec.directions[0];
    }

    const duration_s = Number(
      (durationOverride != null ? durationOverride : (rec?.default_duration_s ?? 0.5)).toFixed(3),
    );

    transitions.push({
      from: fromVisual,
      to: toVisual,
      from_scene: fromSid,
      to_scene: toSid,
      type,
      direction: direction || null,
      duration_s,
      tier: "b",
      is_break,
      bridge_id: null,
      from_worker: sceneWorker.get(fromSid),
      to_worker: sceneWorker.get(toSid),
    });
  }
}

// ---------- Step 6.5: SFX library copy + cue → global timing ----------
// SFX library is OPT-IN: when orchestrator passes --sfx-lib the directory is
// copied into <PROJECT_DIR>/assets/sfx/ and section_plan **SFX:** cues are
// validated against manifest.json. Without --sfx-lib, scene cues are silently
// dropped (warning only). Voice/bgm live under assets/; SFX matches.
const sfx = [];
if (sfxLibDir) {
  const sfxManifestPath = join(sfxLibDir, "manifest.json");
  if (!existsSync(sfxManifestPath)) {
    die(`--sfx-lib points to ${sfxLibDir} but manifest.json is missing`);
  }
  let sfxManifest;
  try {
    sfxManifest = JSON.parse(readFileSync(sfxManifestPath, "utf8"));
  } catch (e) {
    die(`sfx manifest.json parse: ${e.message}`);
  }
  // Build filename → { duration, key } lookup so cues can reference by filename
  // (matching v1 storyboard syntax: `impact-bass-1.mp3` not the manifest key).
  const sfxByFile = new Map();
  for (const [key, entry] of Object.entries(sfxManifest)) {
    if (entry?.file && isFinite(entry.duration)) {
      sfxByFile.set(entry.file, { key, duration: entry.duration });
    }
  }

  // Copy entire SFX directory into <PROJECT_DIR>/assets/sfx/ (mp3 + manifest +
  // CREDITS). Idempotent: skip files that already exist (e.g. re-runs).
  const sfxDestDir = join(hyperframesDir, "assets", "sfx");
  mkdirSync(sfxDestDir, { recursive: true });
  let sfxCopied = 0;
  for (const ent of readdirSync(sfxLibDir, { withFileTypes: true })) {
    if (!ent.isFile()) continue;
    const src = join(sfxLibDir, ent.name);
    const dest = join(sfxDestDir, ent.name);
    if (!existsSync(dest)) {
      copyFileSync(src, dest);
      sfxCopied++;
    }
  }

  // Resolve each scene's cues against manifest + add scene.start_s offset.
  for (const g of groups) {
    for (const sid of g.scene_ids) {
      const sceneEntry = g.scenes[sid];
      const sceneCues = scenes.find((x) => x.sceneId === sid)?.sfxCues || [];
      for (const cue of sceneCues) {
        const hit = sfxByFile.get(cue.file);
        if (!hit) {
          anomalies.push(
            `${sid}: SFX cue file "${cue.file}" not in manifest — dropping (known files: ${[...sfxByFile.keys()].slice(0, 5).join(", ")}${sfxByFile.size > 5 ? ", …" : ""})`,
          );
          continue;
        }
        const tGlobal = Number((sceneEntry.start_s + cue.t_local).toFixed(3));
        sfx.push({
          file: cue.file,
          t: tGlobal,
          duration: hit.duration,
          volume: cue.volume != null ? cue.volume : 0.35,
          scene_id: sid,
          t_local: cue.t_local,
          note: cue.note || "",
        });
      }
    }
  }
  // Sort by global t for predictable index.html emission order.
  sfx.sort((a, b) => a.t - b.t);
  console.log(`  sfx lib copied: ${sfxCopied} file(s) → assets/sfx/`);
} else {
  // Surface plan cues that won't make it to the timeline because no lib was provided.
  let droppedCueCount = 0;
  for (const s of scenes) droppedCueCount += s.sfxCues?.length || 0;
  if (droppedCueCount > 0) {
    anomalies.push(
      `section_plan declares ${droppedCueCount} SFX cue(s) but --sfx-lib not passed — all cues dropped`,
    );
  }
}

// ---------- Step 7: emit group_spec.json ----------
const total_duration_s = scenes.reduce((sum, s) => sum + s.estimatedDuration_s, 0);
// BGM may still be rendering (audio.mjs spawns detached and exits before it
// finishes). Trust audio_meta.bgm_path; Phase 4c wait-bgm.mjs writes the final
// status before assemble-index decides whether to emit the <audio> element.
let bgm_path = "";
if (audioMeta?.bgm_path) {
  bgm_path = audioMeta.bgm_path;
  if (!existsSync(join(hyperframesDir, audioMeta.bgm_path))) {
    if (audioMeta.bgm_pending) {
      anomalies.push(
        `bgm "${audioMeta.bgm_path}" still rendering (bgm_pending=true) — Phase 4c wait-bgm will check before emitting <audio>`,
      );
    } else {
      anomalies.push(
        `bgm "${audioMeta.bgm_path}" listed in audio_meta but missing — Phase 4c will skip if still absent`,
      );
    }
  }
}

// Single deterministic gate for the readability-A keep-out + caption band:
// same condition captions.mjs group uses to emit-vs-skip (≥1 scene has a usable
// on-disk wordsPath). When true: build-captions(-html) emit captions, assemble
// mounts track-12, AND every scene worker receives `Captions: enabled` so it
// keeps foreground content in the upper ~83% and reserves the bottom ~17% band.
// When false: no captions and scene workers use full-canvas layouts.
const captions_enabled = scenes.some((s) => Boolean(s.wordsPath));

const spec = {
  scenes_per_group_max: scenesPerGroupMax,
  total_scenes: scenes.length,
  width: CANVAS_W,
  height: CANVAS_H,
  captions_enabled,
  film_direction,
  total_duration_s: Number(total_duration_s.toFixed(3)),
  bgm_path,
  font_face_css: fontFaceCss,
  brand_tokens_css: brandTokensCss,
  groups,
  visual_clips,
  scene_to_visual,
  internal_seams,
  transitions,
  sfx,
};

writeFileSync(outPath, JSON.stringify(spec, null, 2));

// Captions: built deterministically in Phase 4a.5 (captions.mjs group →
// caption_groups.json, then captions.mjs html → compositions/captions.html).
// This script only emits the `captions_enabled` gate above; assemble-index.mjs
// checks compositions/captions.html existence and emits the track-12 clip if present.

// ---------- Step 8: summary ----------
console.log(`✓ wrote ${outPath}`);
console.log(
  `  scenes: ${spec.total_scenes}, groups: ${groups.length}, total: ${spec.total_duration_s}s`,
);
console.log(`  canvas: ${CANVAS_W}×${CANVAS_H} (${dimSource})`);
console.log(
  `  captions: ${captions_enabled ? "enabled (scene keep-out + band reserved)" : "disabled (full-canvas scenes)"}`,
);
console.log(
  `  film direction: ${film_direction ? `${film_direction.split(/\s+/).length} words (forward to worker shared header + finalize dispatch)` : "(none — legacy plan format)"}`,
);
console.log(`  bgm: ${bgm_path || "(none)"}`);
console.log(
  `  sfx cues:      ${sfx.length}${sfxLibDir ? "" : " (--sfx-lib not passed; cues dropped)"}`,
);
console.log(
  `  visual clips:  ${visual_clips.map((v) => `${v.id}:${v.scene_ids.join("+")}`).join("  ")}`,
);
if (transitions.length) {
  const tb = transitions.filter((t) => t.tier === "b").length;
  const ta = transitions.filter((t) => t.tier === "a").length;
  console.log(`  transitions:   ${transitions.length} (tier-b ${tb}, tier-a ${ta})`);
  for (const t of transitions) {
    const dir = t.direction ? ` ${t.direction}` : "";
    console.log(
      `    ${t.from}→${t.to}: ${t.type}${dir} ${t.duration_s}s [tier ${t.tier}, ${t.from_scene}→${t.to_scene}]`,
    );
  }
} else {
  console.log(`  transitions:   0 (single visual clip or registry unavailable)`);
}
console.log(`  assets copied: ${copied} (collisions skipped: ${collisions.length})`);
console.log(`  fonts copied:  ${fontsCopied}`);
console.log(
  `  @font-face block: ${fontFaceCss ? `${fontFaceCss.length}B extracted (Phase 4c will inject into index.html <head>)` : "(none — design.html has no auto-injected block)"}`,
);
if (chunksIndex) {
  const libCount = chunksIndex.components?.length || 0;
  const uniqueComps = new Set();
  for (const s of scenes) {
    for (const p of s.design_chunks?.components || []) uniqueComps.add(basename(p, ".html"));
  }
  console.log(
    `  design-chunks:    ${libCount} component(s) available, forwarded as a style-reference library to every worker (${[...uniqueComps].join(", ") || "none"})`,
  );
} else {
  console.log(`  design-chunks:    none (workers will fall back to design.html)`);
}
for (const g of groups) {
  const items = g.scene_ids.map((id) => `${id}(${g.scenes[id].estimatedDuration_s}s)`).join(", ");
  console.log(`  ${g.worker_id}: ${g.composition_id} ← ${items}`);
}
if (collisions.length) {
  console.log(`\nasset collisions (first-wins, skipped duplicates):`);
  for (const c of collisions.slice(0, 5))
    console.log(`  ${basename(c.kept)} ← skipped ${c.skipped}`);
  if (collisions.length > 5) console.log(`  …and ${collisions.length - 5} more`);
}
if (anomalies.length) {
  console.log(`\nanomalies (non-fatal):`);
  for (const a of anomalies) console.log(`  - ${a}`);
}
