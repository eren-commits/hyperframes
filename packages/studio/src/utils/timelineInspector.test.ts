import { describe, expect, it } from "vitest";
import { Window } from "happy-dom";
import {
  canInspectTimelineElement,
  getTimelineElementKey,
  isTimelineLayerVisibleInPreview,
  isAudioTimelineElement,
  shouldShowTimelineInspectorBounds,
} from "./timelineInspector";

function attachVisibleBox(
  element: HTMLElement,
  rect = { left: 10, top: 10, width: 80, height: 24 },
) {
  Object.defineProperty(element, "getBoundingClientRect", {
    configurable: true,
    value: () => ({
      ...rect,
      right: rect.left + rect.width,
      bottom: rect.top + rect.height,
      x: rect.left,
      y: rect.top,
      toJSON: () => ({}),
    }),
  });
}

function createDocument(markup: string): Document {
  const window = new Window();
  window.document.body.innerHTML = markup;
  return window.document;
}

describe("getTimelineElementKey", () => {
  it("prefers stable timeline keys over DOM ids", () => {
    expect(getTimelineElementKey({ id: "card", key: "index.html#card" })).toBe("index.html#card");
    expect(getTimelineElementKey({ id: "card" })).toBe("card");
  });
});

describe("canInspectTimelineElement", () => {
  it("allows visual timeline clips to opt into preview inspection", () => {
    expect(canInspectTimelineElement({ tag: "section" })).toBe(true);
    expect(canInspectTimelineElement({ tag: "video", src: "assets/demo.mp4" })).toBe(true);
  });

  it("blocks audio-only clips from opening the visual inspector", () => {
    expect(canInspectTimelineElement({ tag: "audio" })).toBe(false);
    expect(canInspectTimelineElement({ tag: "music" })).toBe(false);
    expect(canInspectTimelineElement({ tag: "sfx" })).toBe(false);
    expect(canInspectTimelineElement({ tag: "div", src: "assets/narration.mp3" })).toBe(false);
  });
});

describe("isAudioTimelineElement", () => {
  it("identifies audio-only clips by tag or source extension", () => {
    expect(isAudioTimelineElement({ tag: "audio" })).toBe(true);
    expect(isAudioTimelineElement({ tag: "sfx" })).toBe(true);
    expect(isAudioTimelineElement({ tag: "div", src: "assets/narration.wav" })).toBe(true);
    expect(isAudioTimelineElement({ tag: "video", src: "assets/demo.mp4" })).toBe(false);
  });
});

describe("shouldShowTimelineInspectorBounds", () => {
  const element = { start: 2, duration: 4 };

  it("shows bounds at the clip start and end only", () => {
    expect(shouldShowTimelineInspectorBounds(2, element)).toBe(true);
    expect(shouldShowTimelineInspectorBounds(6, element)).toBe(true);
    expect(shouldShowTimelineInspectorBounds(4, element)).toBe(false);
  });

  it("allows a small boundary tolerance", () => {
    expect(shouldShowTimelineInspectorBounds(2.04, element, 0.05)).toBe(true);
    expect(shouldShowTimelineInspectorBounds(2.08, element, 0.05)).toBe(false);
  });

  it("rejects missing and invalid timing", () => {
    expect(shouldShowTimelineInspectorBounds(0, null)).toBe(false);
    expect(shouldShowTimelineInspectorBounds(Number.NaN, element)).toBe(false);
    expect(shouldShowTimelineInspectorBounds(0, { start: Number.NaN, duration: 1 })).toBe(false);
  });
});

describe("isTimelineLayerVisibleInPreview", () => {
  it("treats ancestor opacity as hidden for nested clip layers", () => {
    const doc = createDocument(`
      <div id="clip" style="opacity: 0">
        <span id="label" style="opacity: 1">Label</span>
      </div>
    `);
    const label = doc.getElementById("label");
    expect(label).not.toBeNull();
    attachVisibleBox(label as HTMLElement);

    expect(isTimelineLayerVisibleInPreview(label as HTMLElement)).toBe(false);
  });

  it("accepts a boxed layer when ancestors are visible", () => {
    const doc = createDocument(`
      <div id="clip" style="opacity: 1">
        <span id="label" style="opacity: 1">Label</span>
      </div>
    `);
    const label = doc.getElementById("label");
    expect(label).not.toBeNull();
    attachVisibleBox(label as HTMLElement);

    expect(isTimelineLayerVisibleInPreview(label as HTMLElement)).toBe(true);
  });
});
