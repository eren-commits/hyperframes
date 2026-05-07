import { describe, it, expect } from "vitest";
import { lintHyperframeHtml } from "../hyperframeLinter";

function findByCode(html: string, code: string) {
  return lintHyperframeHtml(html).findings.filter((f) => f.code === code);
}

describe("prefer_container_units", () => {
  it("flags px positioning on elements inside a composition", () => {
    const html = `<div data-composition-id="test" data-width="1920" data-height="1080">
      <h1 style="position:absolute; left:96px; top:108px; font-size:64px;">Title</h1>
    </div>`;
    const findings = findByCode(html, "prefer_container_units");
    expect(findings.length).toBeGreaterThanOrEqual(3);
    expect(findings.some((f) => f.message.includes("left"))).toBe(true);
    expect(findings.some((f) => f.message.includes("top"))).toBe(true);
    expect(findings.some((f) => f.message.includes("font-size"))).toBe(true);
  });

  it("suggests cqw for horizontal properties", () => {
    const html = `<div data-composition-id="test" data-width="1920" data-height="1080">
      <div style="left:192px;">content</div>
    </div>`;
    const findings = findByCode(html, "prefer_container_units");
    expect(findings[0].message).toContain("cqw");
  });

  it("suggests cqh for vertical properties", () => {
    const html = `<div data-composition-id="test" data-width="1920" data-height="1080">
      <div style="top:108px;">content</div>
    </div>`;
    const findings = findByCode(html, "prefer_container_units");
    expect(findings[0].message).toContain("cqh");
  });

  it("calculates correct container unit values", () => {
    const html = `<div data-composition-id="test" data-width="1920" data-height="1080">
      <div style="left:96px;">content</div>
    </div>`;
    const findings = findByCode(html, "prefer_container_units");
    expect(findings[0].message).toContain("5cqw");
  });

  it("ignores small px values (borders, shadows)", () => {
    const html = `<div data-composition-id="test" data-width="1920" data-height="1080">
      <div style="width:4px; height:2px;">content</div>
    </div>`;
    const findings = findByCode(html, "prefer_container_units");
    expect(findings).toHaveLength(0);
  });

  it("skips composition root but flags children with px", () => {
    const html = `<div data-composition-id="test" data-width="1920" data-height="1080" style="width:1920px; height:1080px;">
      <div style="left:200px;">child</div>
    </div>`;
    const findings = findByCode(html, "prefer_container_units");
    expect(findings).toHaveLength(1);
    expect(findings[0].message).toContain("left");
  });

  it("ignores script, style, and audio tags", () => {
    const html = `<div data-composition-id="test" data-width="1920" data-height="1080">
      <script style="width:500px;"></script>
      <audio style="width:100px;" data-start="0" src="vo.mp3"></audio>
    </div>`;
    const findings = findByCode(html, "prefer_container_units");
    expect(findings).toHaveLength(0);
  });

  it("severity is info (suggestion, not error)", () => {
    const html = `<div data-composition-id="test" data-width="1920" data-height="1080">
      <div style="left:200px;">content</div>
    </div>`;
    const findings = findByCode(html, "prefer_container_units");
    expect(findings[0].severity).toBe("info");
  });

  it("does not flag border-radius", () => {
    const html = `<div data-composition-id="test" data-width="1920" data-height="1080">
      <div style="border-radius:16px;">content</div>
    </div>`;
    const findings = findByCode(html, "prefer_container_units");
    expect(findings).toHaveLength(0);
  });

  it("flags px in style blocks", () => {
    const html = `<div data-composition-id="test" data-width="1920" data-height="1080">
      <style>.title { left: 96px; font-size: 64px; }</style>
      <div class="title">content</div>
    </div>`;
    const findings = findByCode(html, "prefer_container_units");
    expect(findings.length).toBeGreaterThanOrEqual(2);
  });

  it("returns no findings for HTML without a composition root", () => {
    const html = `<div><h1 style="left:200px;">no composition</h1></div>`;
    const findings = findByCode(html, "prefer_container_units");
    expect(findings).toHaveLength(0);
  });

  it("handles malformed data-width gracefully", () => {
    const html = `<div data-composition-id="test" data-width="abc" data-height="1080">
      <div style="left:96px;">content</div>
    </div>`;
    const findings = findByCode(html, "prefer_container_units");
    expect(findings).toHaveLength(1);
    expect(findings[0].message).toContain("5cqw");
  });
});

describe("composition_root_missing_container_type", () => {
  it("warns when cqw/cqh used but root lacks container-type", () => {
    const html = `<div data-composition-id="test" data-width="1920" data-height="1080">
      <h1 style="font-size:3.33cqw;">Title</h1>
    </div>`;
    const findings = findByCode(html, "composition_root_missing_container_type");
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe("warning");
  });

  it("does not warn when root has container-type:size", () => {
    const html = `<div data-composition-id="test" data-width="1920" data-height="1080" style="container-type:size;">
      <h1 style="font-size:3.33cqw;">Title</h1>
    </div>`;
    const findings = findByCode(html, "composition_root_missing_container_type");
    expect(findings).toHaveLength(0);
  });

  it("does not warn when no cqw/cqh units are used", () => {
    const html = `<div data-composition-id="test" data-width="1920" data-height="1080">
      <h1 style="font-size:64px;">Title</h1>
    </div>`;
    const findings = findByCode(html, "composition_root_missing_container_type");
    expect(findings).toHaveLength(0);
  });

  it("detects cqw/cqh in style blocks", () => {
    const html = `<div data-composition-id="test" data-width="1920" data-height="1080">
      <style>.title { font-size: 3.33cqw; }</style>
      <h1 class="title">Title</h1>
    </div>`;
    const findings = findByCode(html, "composition_root_missing_container_type");
    expect(findings).toHaveLength(1);
  });

  it("accepts container-type from style block on root", () => {
    const html = `<div data-composition-id="test" data-width="1920" data-height="1080">
      <style>[data-composition-id="test"] { container-type: size; }</style>
      <h1 style="font-size:3.33cqw;">Title</h1>
    </div>`;
    const findings = findByCode(html, "composition_root_missing_container_type");
    expect(findings).toHaveLength(0);
  });
});

describe("gsap_prefer_container_units", () => {
  it("flags GSAP tween props with bare number values", () => {
    const html = `<div data-composition-id="test" data-width="1920" data-height="1080">
      <script>
        const tl = gsap.timeline({ paused: true });
        tl.to("#title", { x: 500, y: 200, opacity: 0, duration: 0.8 });
      </script>
    </div>`;
    const findings = findByCode(html, "gsap_prefer_container_units");
    expect(findings.length).toBeGreaterThanOrEqual(2);
    expect(findings.some((f) => f.message.includes("x:"))).toBe(true);
    expect(findings.some((f) => f.message.includes("y:"))).toBe(true);
  });

  it("suggests cqw for horizontal GSAP props", () => {
    const html = `<div data-composition-id="test" data-width="1920" data-height="1080">
      <script>
        tl.to("#el", { x: 96 });
      </script>
    </div>`;
    const findings = findByCode(html, "gsap_prefer_container_units");
    expect(findings[0].message).toContain("5cqw");
  });

  it("suggests cqh for vertical GSAP props", () => {
    const html = `<div data-composition-id="test" data-width="1920" data-height="1080">
      <script>
        tl.from("#el", { y: 108 });
      </script>
    </div>`;
    const findings = findByCode(html, "gsap_prefer_container_units");
    expect(findings[0].message).toContain("10cqh");
  });

  it("handles negative values", () => {
    const html = `<div data-composition-id="test" data-width="1920" data-height="1080">
      <script>
        tl.to("#el", { x: -192 });
      </script>
    </div>`;
    const findings = findByCode(html, "gsap_prefer_container_units");
    expect(findings[0].message).toContain("-10cqw");
  });

  it("ignores small values", () => {
    const html = `<div data-composition-id="test" data-width="1920" data-height="1080">
      <script>
        tl.to("#el", { x: 2, y: 1 });
      </script>
    </div>`;
    const findings = findByCode(html, "gsap_prefer_container_units");
    expect(findings).toHaveLength(0);
  });

  it("ignores non-position props like opacity and duration", () => {
    const html = `<div data-composition-id="test" data-width="1920" data-height="1080">
      <script>
        tl.to("#el", { opacity: 0, duration: 0.8, scale: 1.5 });
      </script>
    </div>`;
    const findings = findByCode(html, "gsap_prefer_container_units");
    expect(findings).toHaveLength(0);
  });

  it("does not flag scripts without GSAP tween calls", () => {
    const html = `<div data-composition-id="test" data-width="1920" data-height="1080">
      <script>
        const width = 500;
        const height = 200;
      </script>
    </div>`;
    const findings = findByCode(html, "gsap_prefer_container_units");
    expect(findings).toHaveLength(0);
  });
});
