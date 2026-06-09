import { describe, expect, it, vi } from "vitest";
import type { Page } from "puppeteer-core";
import { detectSwiftShader, resolveDrawElementCaptureMode } from "./drawElementService.js";

// ── detectSwiftShader ──────────────────────────────────────────────────────────

describe("detectSwiftShader", () => {
  function makePage(evaluateResult: unknown): Page {
    return {
      evaluate: vi.fn().mockResolvedValue(evaluateResult),
    } as unknown as Page;
  }

  it("returns true when renderer includes 'swiftshader'", async () => {
    const page = makePage(true);
    expect(await detectSwiftShader(page)).toBe(true);
  });

  it("returns false for a standard GPU renderer string", async () => {
    const page = makePage(false);
    expect(await detectSwiftShader(page)).toBe(false);
  });

  it("returns false when WebGL is unavailable", async () => {
    const page = makePage(false);
    expect(await detectSwiftShader(page)).toBe(false);
  });

  it("passes a function to page.evaluate", async () => {
    const page = makePage(false);
    await detectSwiftShader(page);
    expect(page.evaluate).toHaveBeenCalledWith(expect.any(Function));
  });
});

// ── resolveDrawElementCaptureMode ──────────────────────────────────────────────

describe("resolveDrawElementCaptureMode", () => {
  // signature: (isSwiftShader, transparent, hasVideo?, beginFramePaints?)
  it("opaque + SwiftShader → drawelement (opaque works on SwiftShader)", () => {
    expect(resolveDrawElementCaptureMode(true, false)).toBe("drawelement");
  });

  it("transparent + SwiftShader → screenshot (SwiftShader bug: sub-layers dropped)", () => {
    expect(resolveDrawElementCaptureMode(true, true)).toBe("screenshot");
  });

  it("transparent + GPU → drawelement (GPU handles transparent correctly)", () => {
    expect(resolveDrawElementCaptureMode(false, true)).toBe("drawelement");
  });

  it("opaque + GPU → drawelement", () => {
    expect(resolveDrawElementCaptureMode(false, false)).toBe("drawelement");
  });

  // ── video routing: needs a per-frame BeginFrame paint for a fresh snapshot ──
  it("video without BeginFrame paint → screenshot (stale snapshot otherwise)", () => {
    expect(resolveDrawElementCaptureMode(false, false, /* hasVideo */ true, /* bf */ false)).toBe(
      "screenshot",
    );
  });

  it("video WITH BeginFrame paint → drawelement (Linux headless-shell paints each frame)", () => {
    expect(resolveDrawElementCaptureMode(false, false, /* hasVideo */ true, /* bf */ true)).toBe(
      "drawelement",
    );
  });

  it("no video → drawelement regardless of BeginFrame", () => {
    expect(resolveDrawElementCaptureMode(false, false, false, false)).toBe("drawelement");
  });

  it("transparent + SwiftShader still screenshot even with BeginFrame", () => {
    expect(resolveDrawElementCaptureMode(true, true, false, true)).toBe("screenshot");
  });
});
