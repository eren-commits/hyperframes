/**
 * Offline audio baking for Codex Tetris composition.
 *
 * WebAudio synth (oscillators, noise) can't be captured by HyperFrames'
 * headless renderer — it only picks up file-based <audio> tracks. This script
 * pre-renders the chiptune BGM and SFX into WAV files that the composition
 * references as standard <audio> elements.
 *
 * Run: bun run bake-audio.ts
 * Output: bgm.wav, sfx.wav
 */

const SAMPLE_RATE = 44100;
const DURATION = 28;

// ---------------------------------------------------------------------------
// WAV writer
// ---------------------------------------------------------------------------

function writeWav(samples: Float32Array, path: string) {
  const n = samples.length;
  const dataSize = n * 2;
  const buf = new ArrayBuffer(44 + dataSize);
  const v = new DataView(buf);

  const str = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i));
  };

  str(0, "RIFF");
  v.setUint32(4, 36 + dataSize, true);
  str(8, "WAVE");
  str(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, SAMPLE_RATE, true);
  v.setUint32(28, SAMPLE_RATE * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  str(36, "data");
  v.setUint32(40, dataSize, true);

  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  Bun.write(path, new Uint8Array(buf));
  const kb = ((44 + dataSize) / 1024).toFixed(1);
  const sec = (n / SAMPLE_RATE).toFixed(1);
  console.log(`  ${path} — ${kb} KB, ${sec}s`);
}

// ---------------------------------------------------------------------------
// Oscillators
// ---------------------------------------------------------------------------

function square(phase: number): number {
  return phase % 1 < 0.5 ? 1 : -1;
}

function triangle(phase: number): number {
  const p = phase % 1;
  return p < 0.5 ? 4 * p - 1 : 3 - 4 * p;
}

function noise(seed: number): number {
  const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

// ---------------------------------------------------------------------------
// Note table
// ---------------------------------------------------------------------------

const FREQ: Record<string, number> = {
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  G3: 196.0,
  A3: 220.0,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  G5: 783.99,
  A5: 880.0,
  _: 0,
};

// ---------------------------------------------------------------------------
// BGM generator — chiptune loop in A minor
// ---------------------------------------------------------------------------

function generateBGM(): Float32Array {
  const numSamples = DURATION * SAMPLE_RATE;
  const out = new Float32Array(numSamples);

  const BPM = 150;
  const eighth = 60 / BPM / 2;

  type Note = [string, number];

  const melody: Note[] = [
    ["A4", eighth],
    ["C5", eighth],
    ["D5", eighth],
    ["E5", eighth],
    ["D5", eighth],
    ["C5", eighth],
    ["A4", eighth],
    ["G4", eighth],
    ["E5", eighth],
    ["D5", eighth],
    ["C5", eighth],
    ["A4", eighth],
    ["G4", eighth],
    ["A4", eighth],
    ["C5", eighth],
    ["D5", eighth],
    ["A4", eighth],
    ["A4", eighth],
    ["C5", eighth],
    ["C5", eighth],
    ["D5", eighth],
    ["E5", eighth],
    ["D5", eighth],
    ["C5", eighth],
    ["E5", eighth],
    ["G5", eighth],
    ["E5", eighth],
    ["D5", eighth],
    ["C5", eighth],
    ["A4", eighth],
    ["G4", eighth],
    ["A4", eighth],
  ];

  const bass: Note[] = [
    ["A3", eighth * 4],
    ["A3", eighth * 4],
    ["E3", eighth * 4],
    ["E3", eighth * 4],
    ["A3", eighth * 4],
    ["A3", eighth * 4],
    ["E3", eighth * 4],
    ["A3", eighth * 4],
  ];

  const loopLen = melody.reduce((s, [, d]) => s + d, 0);

  let melPhase = 0;
  let bassPhase = 0;
  let prevMelFreq = FREQ[melody[0][0]];
  let prevBassFreq = FREQ[bass[0][0]];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const lt = t % loopLen;

    // Current melody note
    let acc = 0;
    let melFreq = prevMelFreq;
    let melNoteDur = eighth;
    let noteStart = 0;
    for (const [note, dur] of melody) {
      if (lt >= acc && lt < acc + dur) {
        melFreq = FREQ[note];
        melNoteDur = dur;
        noteStart = acc;
        break;
      }
      acc += dur;
    }

    // Envelope: sharp attack, sustain, soft release
    const notePhase = (lt - noteStart) / melNoteDur;
    const melEnv =
      notePhase < 0.03 ? notePhase / 0.03 : notePhase > 0.85 ? 1 - (notePhase - 0.85) / 0.15 : 1;

    // Accumulate phase for click-free note changes
    melPhase += melFreq / SAMPLE_RATE;
    prevMelFreq = melFreq;

    // Current bass note
    acc = 0;
    let bassFreq = prevBassFreq;
    for (const [note, dur] of bass) {
      if (lt >= acc && lt < acc + dur) {
        bassFreq = FREQ[note];
        break;
      }
      acc += dur;
    }
    bassPhase += bassFreq / SAMPLE_RATE;
    prevBassFreq = bassFreq;

    // Mix: square melody + triangle bass + noise hi-hat
    const mel = square(melPhase) * 0.18 * melEnv;
    const bas = triangle(bassPhase) * 0.14;

    const eighthPhase = (lt % eighth) / eighth;
    const hatEnv = eighthPhase < 0.08 ? 1 - eighthPhase / 0.08 : 0;
    const hat = noise(i) * 0.04 * hatEnv;

    // Fade in first 0.5s, fade out last 1s
    let masterEnv = 1;
    if (t < 0.5) masterEnv = t / 0.5;
    if (t > DURATION - 1) masterEnv = DURATION - t;

    out[i] = (mel + bas + hat) * masterEnv;
  }

  return out;
}

// ---------------------------------------------------------------------------
// SFX generator — game events baked at specific timestamps
// ---------------------------------------------------------------------------

function generateSFX(): Float32Array {
  const numSamples = DURATION * SAMPLE_RATE;
  const out = new Float32Array(numSamples);

  type Event = [number, "drop" | "clear" | "gameover" | "boot"];

  const events: Event[] = [
    [1.5, "boot"],
    [6.0, "boot"],
    [10.2, "drop"],
    [12.0, "drop"],
    [13.5, "drop"],
    [14.8, "drop"],
    [15.2, "clear"],
    [16.8, "drop"],
    [18.2, "drop"],
    [19.5, "clear"],
    [20.5, "drop"],
    [21.8, "gameover"],
  ];

  for (const [time, type] of events) {
    const start = Math.floor(time * SAMPLE_RATE);

    if (type === "drop") {
      const dur = 0.07;
      const n = Math.floor(dur * SAMPLE_RATE);
      let phase = 0;
      for (let j = 0; j < n && start + j < numSamples; j++) {
        const p = j / n;
        const freq = 800 - 600 * p;
        phase += freq / SAMPLE_RATE;
        out[start + j] += square(phase) * 0.22 * (1 - p);
      }
    }

    if (type === "clear") {
      const dur = 0.25;
      const n = Math.floor(dur * SAMPLE_RATE);
      let phase1 = 0;
      let phase2 = 0;
      for (let j = 0; j < n && start + j < numSamples; j++) {
        const p = j / n;
        const freq = 300 + 1700 * p;
        phase1 += freq / SAMPLE_RATE;
        phase2 += (freq * 1.5) / SAMPLE_RATE;
        const env = p < 0.1 ? p / 0.1 : 1 - (p - 0.1) / 0.9;
        out[start + j] += (square(phase1) * 0.18 + triangle(phase2) * 0.1) * env;
      }
    }

    if (type === "gameover") {
      const dur = 0.7;
      const n = Math.floor(dur * SAMPLE_RATE);
      let phase1 = 0;
      let phase2 = 0;
      for (let j = 0; j < n && start + j < numSamples; j++) {
        const p = j / n;
        const freq = 500 - 400 * p;
        phase1 += freq / SAMPLE_RATE;
        phase2 += (freq * 0.75) / SAMPLE_RATE;
        const env = 1 - p;
        out[start + j] += (square(phase1) * 0.25 + square(phase2) * 0.12) * env;
      }
    }

    if (type === "boot") {
      const dur = 0.15;
      const n = Math.floor(dur * SAMPLE_RATE);
      let phase = 0;
      for (let j = 0; j < n && start + j < numSamples; j++) {
        const p = j / n;
        const freq = 200 + 800 * p;
        phase += freq / SAMPLE_RATE;
        const env = p < 0.3 ? p / 0.3 : 1 - (p - 0.3) / 0.7;
        out[start + j] += square(phase) * 0.2 * env;
      }
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log("Baking audio for Codex Tetris...");
const dir = import.meta.dir;
writeWav(generateBGM(), `${dir}/bgm.wav`);
writeWav(generateSFX(), `${dir}/sfx.wav`);
console.log("Done. Audio files ready for <audio> tracks.");
