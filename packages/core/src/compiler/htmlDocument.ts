import { parseHTML } from "linkedom";

export const RUNTIME_BOOTSTRAP_ATTR = "data-hyperframes-preview-runtime";

const RUNTIME_SRC_MARKERS = [
  "hyperframe.runtime.iife.js",
  "hyperframes-runtime.modular.inline.js",
  "hyperframe-runtime.modular-runtime.inline.js",
  RUNTIME_BOOTSTRAP_ATTR,
];

const RUNTIME_INLINE_MARKERS = [
  "__hyperframeRuntimeBootstrapped",
  "__hyperframeRuntime",
  "__hyperframeRuntimeTeardown",
  "window.__player =",
  "window.__playerReady",
  "window.__renderReady",
];

/**
 * Parse a full HTML document or wrap a fragment so linkedom consistently puts
 * fragment content under document.body.
 */
export function parseHTMLContent(html: string): Document {
  const trimmed = html.trimStart().toLowerCase();
  if (trimmed.startsWith("<!doctype") || trimmed.startsWith("<html")) {
    return parseHTML(html).document;
  }
  return parseHTML(`<!DOCTYPE html><html><head></head><body>${html}</body></html>`).document;
}

export function stripEmbeddedRuntimeScripts(html: string): string {
  if (!html) return html;
  const scriptRe = /<script\b[^>]*>[\s\S]*?<\/script>/gi;

  const shouldStrip = (block: string): boolean => {
    const lowered = block.toLowerCase();
    for (const marker of RUNTIME_SRC_MARKERS) {
      if (lowered.includes(marker.toLowerCase())) return true;
    }
    for (const marker of RUNTIME_INLINE_MARKERS) {
      if (block.includes(marker)) return true;
    }
    return false;
  };

  return html.replace(scriptRe, (block) => (shouldStrip(block) ? "" : block));
}

function inlineScriptTags(scripts: readonly string[]): string {
  return scripts.map((source) => `<script>${source}</script>`).join("\n");
}

export function injectScriptsAtHeadStart(html: string, scripts: readonly string[]): string {
  if (scripts.length === 0) return html;
  const headTags = inlineScriptTags(scripts);
  if (html.includes("<head")) {
    return html.replace(/<head\b[^>]*>/i, (match) => `${match}\n${headTags}`);
  }
  if (html.includes("<body")) {
    return html.replace("<body", () => `${headTags}\n<body`);
  }
  return `${headTags}\n${html}`;
}

export function injectScriptsIntoHtml(
  html: string,
  headScripts: readonly string[],
  bodyScripts: readonly string[],
  stripEmbeddedRuntime = true,
): string {
  if (stripEmbeddedRuntime) {
    html = stripEmbeddedRuntimeScripts(html);
  }

  if (headScripts.length > 0) {
    const headTags = inlineScriptTags(headScripts);
    if (html.includes("</head>")) {
      // Function replacement avoids `$&` interpolation in runtime source.
      html = html.replace("</head>", () => `${headTags}\n</head>`);
    } else if (html.includes("<body")) {
      html = html.replace("<body", () => `${headTags}\n<body`);
    } else {
      html = `${headTags}\n${html}`;
    }
  }

  if (bodyScripts.length > 0) {
    const bodyTags = inlineScriptTags(bodyScripts);
    if (html.includes("</body>")) {
      html = html.replace("</body>", () => `${bodyTags}\n</body>`);
    } else {
      html = `${html}\n${bodyTags}`;
    }
  }

  return html;
}
