#!/usr/bin/env node
/*
 * matte.cjs — PP-MattingV2 foreground matting in Node (Apache-2.0, no Python).
 *
 * Model: PaddleSeg PP-MattingV2 (stdc1-human), ONNX, run via the onnxruntime-node +
 * sharp that ship with hyperframes. Replaces the previous RobustVideoMatting engine
 * (GPL-3.0 — removed for licensing). Validated head-to-head vs RVM on real clips:
 * hair/edge quality on par, CPU speed on par (~0.45s/frame @1080p), temporal flicker
 * on par after the EMA smoothing below (RVM's recurrence advantage closed by EMA).
 *
 * Pipeline per frame:
 *   contain-pad the RGB into the model's fixed canvas (preserves aspect — the model
 *   is exported at a fixed size; squashing distorts humans) → /255, RGB, NCHW →
 *   alpha (model output is already 0..1, no sigmoid) → crop the padded region back →
 *   resize to source size → EMA(0.5) across frames (temporal smoothing) → RGBA png.
 *
 * ⚠ sharp note: resizing a 1-channel raw buffer returns a *3-channel* buffer from
 * .raw() — always read with resolveWithObject and stride by info.channels. Assuming
 * 1 channel silently produces a garbage matte (top-third smeared + striped).
 *
 *   node matte.cjs <project-dir>
 * Reads:  <project>/source.mp4  OR  <project>/frames_bg/f_%04d.png
 * Writes: <project>/frames_fg/f_%04d.png (RGBA, subject opaque), <project>/matte.fps
 * Env:    MATTE_MODEL — path to an alternative ppmattingv2 ONNX (dims parsed from the
 *                       `<H>x<W>.onnx` filename suffix, e.g. 1088x1920 for max detail)
 *         MATTE_EMA   — temporal smoothing weight for the NEW frame (default 0.5;
 *                       1 disables smoothing — use for very fast motion if ghosting)
 */
const path = require("path");
const fs = require("fs");
const os = require("os");
const cp = require("child_process");

// resolve a package from the hyperframes checkout (bun store or plain node_modules)
function hfResolve(pkg) {
  const roots = [
    process.env.HYPERFRAMES_ROOT,
    path.resolve(__dirname, "..", "..", ".."), // skills/embedded-captions/scripts → repo root if in-repo
    path.join(os.homedir(), "Downloads", "hyperframes"),
  ].filter(Boolean);
  for (const root of roots) {
    const cands = [path.join(root, "node_modules", pkg)];
    const bun = path.join(root, "node_modules", ".bun");
    try {
      if (fs.existsSync(bun))
        for (const d of fs.readdirSync(bun))
          if (d.startsWith(pkg + "@")) cands.push(path.join(bun, d, "node_modules", pkg));
    } catch {
      /* ignore */
    }
    for (const c of cands) {
      try {
        if (fs.existsSync(c)) return require(c);
      } catch {}
    }
  }
  console.error(
    `[matte] cannot find ${pkg} — set HYPERFRAMES_ROOT to a built hyperframes checkout`,
  );
  process.exit(3);
}
const ort = hfResolve("onnxruntime-node");
const sharp = hfResolve("sharp");

// Bundled with the skill (no auto-download: the upstream ONNX exports have no stable
// public URL). MATTE_MODEL may point at any ppmattingv2 `<H>x<W>.onnx` export.
const MODEL =
  process.env.MATTE_MODEL ||
  path.resolve(__dirname, "..", "assets", "ppmattingv2_stdc1_human_544x960.onnx");
const EMA = (() => {
  const v = parseFloat(process.env.MATTE_EMA || "0.5");
  return v > 0 && v <= 1 ? v : 0.5;
})();

function modelDims(modelPath) {
  const m = path.basename(modelPath).match(/(\d+)x(\d+)\.onnx$/i);
  if (!m) {
    console.error(`[matte] cannot parse <H>x<W> from model filename: ${modelPath}`);
    process.exit(3);
  }
  return { MH: parseInt(m[1], 10), MW: parseInt(m[2], 10) };
}
function ensureModel() {
  if (fs.existsSync(MODEL)) return;
  console.error(`[matte] model missing: ${MODEL}`);
  console.error(`        The PP-MattingV2 ONNX ships with this skill (assets/). If you moved the`);
  console.error(
    `        skill, restore assets/ppmattingv2_stdc1_human_544x960.onnx or set MATTE_MODEL.`,
  );
  process.exit(3);
}

function ensureSource(project) {
  const src = path.join(project, "source.mp4");
  if (fs.existsSync(src)) return src;
  const EXCL = new Set(["final", "bg_plus_caps", "fg_caps", "audio"]);
  let cands = [];
  for (const f of fs.readdirSync(project)) {
    const ext = path.extname(f).slice(1).toLowerCase();
    if (
      ["mp4", "mov", "webm", "mkv", "m4v"].includes(ext) &&
      !EXCL.has(path.basename(f, path.extname(f))) &&
      !f.startsWith("index")
    )
      cands.push(path.join(project, f));
  }
  let found = cands.sort((a, b) => fs.statSync(b).size - fs.statSync(a).size)[0];
  if (!found) {
    const hj = path.join(project, "hyperframes.json");
    if (fs.existsSync(hj)) {
      try {
        const v = JSON.parse(fs.readFileSync(hj, "utf8")).video || "";
        if (v && fs.existsSync(path.join(project, v))) found = path.join(project, v);
      } catch {}
    }
  }
  if (found) {
    try {
      fs.symlinkSync(path.basename(found), src);
    } catch {
      fs.copyFileSync(found, src);
    }
    console.log(`[matte] resolved source.mp4 -> ${path.basename(found)}`);
  }
  return src;
}

function probeFps(src) {
  try {
    const out = cp
      .execFileSync("ffprobe", [
        "-v",
        "0",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=r_frame_rate",
        "-of",
        "default=nk=1:nw=1",
        src,
      ])
      .toString()
      .trim();
    const [n, d] = out.split("/");
    const f = parseFloat(n) / parseFloat(d || "1");
    return f > 0 ? Math.max(1, Math.round(f)) : 24;
  } catch {
    return 24;
  }
}

function extractFrames(src, dst, fps) {
  fs.mkdirSync(dst, { recursive: true });
  if (fs.readdirSync(dst).some((f) => f.endsWith(".png"))) return;
  cp.execFileSync("ffmpeg", ["-y", "-i", src, "-vf", `fps=${fps}`, path.join(dst, "f_%04d.png")], {
    stdio: "ignore",
  });
}

async function main() {
  const project = path.resolve(process.argv[2] || "");
  if (!process.argv[2]) {
    console.error("usage: matte.cjs <project-dir>");
    process.exit(1);
  }
  const src = ensureSource(project);
  const framesBg = path.join(project, "frames_bg");
  const framesFg = path.join(project, "frames_fg");

  if (!fs.existsSync(src) && !fs.existsSync(framesBg)) {
    console.error(`[matte] no source video found in ${project}`);
    process.exit(2);
  }
  ensureModel();

  if (fs.existsSync(src) && !fs.existsSync(framesBg)) {
    const fps = probeFps(src);
    fs.writeFileSync(path.join(project, "matte.fps"), String(fps));
    console.log(`[matte] source fps=${fps} (native) → extracting frames_bg`);
    extractFrames(src, framesBg, fps);
  } else if (!fs.existsSync(path.join(project, "matte.fps"))) {
    fs.writeFileSync(
      path.join(project, "matte.fps"),
      String(fs.existsSync(src) ? probeFps(src) : 24),
    );
  }

  const files = fs
    .readdirSync(framesBg)
    .filter((f) => f.endsWith(".png"))
    .sort()
    .map((f) => path.join(framesBg, f));
  if (!files.length) {
    console.error(`[matte] no input frames in ${framesBg}`);
    process.exit(2);
  }
  fs.mkdirSync(framesFg, { recursive: true });

  const meta = await sharp(files[0]).metadata();
  const W0 = meta.width,
    H0 = meta.height,
    N = W0 * H0;
  const { MH, MW } = modelDims(MODEL);

  // contain-pad geometry: scale source into the model canvas preserving aspect,
  // centered on black; alpha is later cropped back from exactly this region.
  const scale = Math.min(MW / W0, MH / H0);
  const rw = Math.max(1, Math.round(W0 * scale)),
    rh = Math.max(1, Math.round(H0 * scale));
  const ox = Math.floor((MW - rw) / 2),
    oy = Math.floor((MH - rh) / 2);

  const session = await ort.InferenceSession.create(MODEL, {
    executionProviders: ["cpu"],
    graphOptimizationLevel: "all",
  });
  const inName = session.inputNames[0],
    outName = session.outputNames[0];

  // Resume: if a previous run died mid-way, frames_fg already holds a prefix. Find the
  // first missing output and restart 3 frames earlier (EMA warm-up), skipping re-writes
  // of the existing prefix. A crashed 20-min matte then costs seconds, not a full redo.
  let firstMissing = files.length;
  for (let i = 0; i < files.length; i++) {
    if (!fs.existsSync(path.join(framesFg, path.basename(files[i])))) {
      firstMissing = i;
      break;
    }
  }
  const startAt = Math.max(0, firstMissing - 3);
  if (firstMissing >= files.length) {
    console.log(`[matte] frames_fg already complete (${files.length} frames) — nothing to do`);
    return;
  }
  if (firstMissing > 0)
    console.log(
      `[matte] resume: ${firstMissing}/${files.length} already done — restarting at ${startAt} (EMA warm-up)`,
    );

  console.log(
    `[matte] PP-MattingV2 ${MH}x${MW} · ${files.length} frames ${W0}x${H0} → fit ${rw}x${rh} @ (${ox},${oy}) · EMA=${EMA}`,
  );
  const t0 = Date.now();
  let prev = null; // EMA state (full-res alpha, Float32)
  for (let i = startAt; i < files.length; i++) {
    const { data } = await sharp(files[i])
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true }); // RGB HWC uint8, W0×H0
    // contain-pad into the model canvas
    const padded = await sharp(files[i])
      .removeAlpha()
      .resize(rw, rh, { fit: "fill" })
      .extend({
        top: oy,
        bottom: MH - rh - oy,
        left: ox,
        right: MW - rw - ox,
        background: { r: 0, g: 0, b: 0 },
      })
      .raw()
      .toBuffer(); // RGB HWC uint8, MW×MH
    const M = MH * MW;
    const inp = new Float32Array(3 * M);
    for (let p = 0; p < M; p++) {
      inp[p] = padded[p * 3] / 255;
      inp[M + p] = padded[p * 3 + 1] / 255;
      inp[2 * M + p] = padded[p * 3 + 2] / 255;
    }
    const out = await session.run({ [inName]: new ort.Tensor("float32", inp, [1, 3, MH, MW]) });
    const o = out[outName].data;
    const off = o.length === 2 * M ? M : 0; // tolerate a 2-channel (bg,fg) export
    const a1 = Buffer.alloc(M);
    for (let p = 0; p < M; p++) a1[p] = Math.max(0, Math.min(255, Math.round(o[off + p] * 255)));
    // crop the model canvas back to the content region, then up to source size.
    // resolveWithObject + stride by info.channels — see the sharp note in the header.
    const { data: af, info: ai } = await sharp(a1, { raw: { width: MW, height: MH, channels: 1 } })
      .extract({ left: ox, top: oy, width: rw, height: rh })
      .resize(W0, H0, { fit: "fill" })
      .raw()
      .toBuffer({ resolveWithObject: true });
    const ch = ai.channels;
    if (!prev) {
      prev = new Float32Array(N);
      for (let p = 0; p < N; p++) prev[p] = af[p * ch];
    } else for (let p = 0; p < N; p++) prev[p] = EMA * af[p * ch] + (1 - EMA) * prev[p];

    if (i < firstMissing) continue; // resume warm-up frame — EMA updated, no re-write
    const rgba = Buffer.allocUnsafe(N * 4);
    for (let p = 0; p < N; p++) {
      rgba[p * 4] = data[p * 3];
      rgba[p * 4 + 1] = data[p * 3 + 1];
      rgba[p * 4 + 2] = data[p * 3 + 2];
      rgba[p * 4 + 3] = Math.round(prev[p]);
    }
    await sharp(rgba, { raw: { width: W0, height: H0, channels: 4 } })
      .png()
      .toFile(path.join(framesFg, path.basename(files[i])));
    if (i % 30 === 0 || i === files.length - 1)
      console.log(
        `  ${i + 1}/${files.length} — ${((i + 1) / ((Date.now() - t0) / 1000)).toFixed(1)} fps`,
      );
  }
  console.log(`[matte] done in ${((Date.now() - t0) / 1000).toFixed(1)}s → ${framesFg}`);
}
main().catch((e) => {
  console.error("[matte]", e.message);
  process.exit(1);
});
