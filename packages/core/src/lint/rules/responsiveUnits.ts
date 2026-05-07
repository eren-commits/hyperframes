import postcss from "postcss";
import type { LintContext, HyperframeLintFinding, OpenTag } from "../context";
import { readAttr, truncateSnippet } from "../utils";

const HORIZONTAL_PROPS = new Set([
  "left",
  "right",
  "width",
  "max-width",
  "min-width",
  "padding-left",
  "padding-right",
  "margin-left",
  "margin-right",
  "gap",
  "column-gap",
  "font-size",
]);

const VERTICAL_PROPS = new Set([
  "top",
  "bottom",
  "height",
  "max-height",
  "min-height",
  "padding-top",
  "padding-bottom",
  "margin-top",
  "margin-bottom",
  "row-gap",
]);

const ALL_FLAGGED_PROPS = new Set([...HORIZONTAL_PROPS, ...VERTICAL_PROPS]);

const PX_VALUE_PATTERN = /^(\d+(?:\.\d+)?)px$/;
const CQ_UNIT_PATTERN = /\b\d+(?:\.\d+)?cq[wh]\b/;
const CONTAINER_TYPE_PATTERN = /container-type\s*:\s*(size|inline-size)/;
const MIN_PX_THRESHOLD = 4;

function isCompositionRoot(tag: OpenTag): boolean {
  return Boolean(readAttr(tag.raw, "data-composition-id"));
}

function suggestUnit(prop: string): string {
  return VERTICAL_PROPS.has(prop) ? "cqh" : "cqw";
}

function pxToContainerUnit(
  px: number,
  prop: string,
  compWidth: number,
  compHeight: number,
): string {
  const unit = suggestUnit(prop);
  const base = unit === "cqh" ? compHeight : compWidth;
  if (!Number.isFinite(base) || base <= 0) return `${px}px`;
  const value = (px / base) * 100;
  const rounded = Math.round(value * 100) / 100;
  return `${rounded}${unit}`;
}

function extractPxFindings(
  style: string,
  compWidth: number,
  compHeight: number,
  elementId: string | undefined,
  snippet: string | undefined,
): HyperframeLintFinding[] {
  const findings: HyperframeLintFinding[] = [];
  const pairs = style.split(";");
  for (const pair of pairs) {
    const colonIdx = pair.indexOf(":");
    if (colonIdx === -1) continue;
    const prop = pair.slice(0, colonIdx).trim().toLowerCase();
    const value = pair.slice(colonIdx + 1).trim();
    if (!ALL_FLAGGED_PROPS.has(prop)) continue;
    const match = PX_VALUE_PATTERN.exec(value);
    if (!match) continue;
    const px = parseFloat(match[1] ?? "0");
    if (px <= MIN_PX_THRESHOLD) continue;
    const suggested = pxToContainerUnit(px, prop, compWidth, compHeight);
    findings.push({
      code: "prefer_container_units",
      severity: "info",
      message: `${prop}: ${px}px could be ${suggested} for aspect-ratio independence.`,
      elementId,
      fixHint: `Use container-relative units (cqw/cqh) instead of px. Ensure the composition root has container-type:size, then replace ${prop}: ${px}px with ${prop}: ${suggested}.`,
      snippet,
    });
  }
  return findings;
}

export const responsiveUnitRules: Array<(ctx: LintContext) => HyperframeLintFinding[]> = [
  // prefer_container_units — suggest cqw/cqh for px layout properties
  (ctx) => {
    const findings: HyperframeLintFinding[] = [];
    if (!ctx.rootTag || !readAttr(ctx.rootTag.raw, "data-composition-id")) return findings;

    const widthRaw = parseInt(readAttr(ctx.rootTag.raw, "data-width") || "", 10);
    const heightRaw = parseInt(readAttr(ctx.rootTag.raw, "data-height") || "", 10);
    const compWidth = Number.isFinite(widthRaw) && widthRaw > 0 ? widthRaw : 1920;
    const compHeight = Number.isFinite(heightRaw) && heightRaw > 0 ? heightRaw : 1080;

    for (const tag of ctx.tags) {
      if (isCompositionRoot(tag)) continue;
      if (tag.name === "script" || tag.name === "style" || tag.name === "audio") continue;
      const style = readAttr(tag.raw, "style") || "";
      if (!style) continue;
      const elementId = readAttr(tag.raw, "id") || undefined;
      findings.push(
        ...extractPxFindings(style, compWidth, compHeight, elementId, truncateSnippet(tag.raw)),
      );
    }

    for (const block of ctx.styles) {
      try {
        const root = postcss.parse(block.content);
        root.walkDecls((decl) => {
          const prop = decl.prop.toLowerCase();
          if (!ALL_FLAGGED_PROPS.has(prop)) return;
          const match = PX_VALUE_PATTERN.exec(decl.value.trim());
          if (!match) return;
          const px = parseFloat(match[1] ?? "0");
          if (px <= MIN_PX_THRESHOLD) return;
          const suggested = pxToContainerUnit(px, prop, compWidth, compHeight);
          findings.push({
            code: "prefer_container_units",
            severity: "info",
            message: `${prop}: ${px}px could be ${suggested} for aspect-ratio independence.`,
            fixHint: `Use container-relative units (cqw/cqh) instead of px. Ensure the composition root has container-type:size, then replace ${prop}: ${px}px with ${prop}: ${suggested}.`,
          });
        });
      } catch {
        void 0;
      }
    }

    return findings;
  },

  // composition_root_missing_container_type — fires when cqw/cqh used but root lacks container-type
  (ctx) => {
    if (!ctx.rootTag || !readAttr(ctx.rootTag.raw, "data-composition-id")) return [];
    const rootStyle = readAttr(ctx.rootTag.raw, "style") || "";
    const hasContainerType = CONTAINER_TYPE_PATTERN.test(rootStyle);
    if (hasContainerType) return [];

    for (const block of ctx.styles) {
      if (CONTAINER_TYPE_PATTERN.test(block.content)) return [];
    }

    let usesCqUnits = false;
    for (const tag of ctx.tags) {
      const style = readAttr(tag.raw, "style") || "";
      if (CQ_UNIT_PATTERN.test(style)) {
        usesCqUnits = true;
        break;
      }
    }
    if (!usesCqUnits) {
      for (const block of ctx.styles) {
        if (CQ_UNIT_PATTERN.test(block.content)) {
          usesCqUnits = true;
          break;
        }
      }
    }

    if (!usesCqUnits) return [];

    return [
      {
        code: "composition_root_missing_container_type",
        severity: "warning",
        message:
          "Composition uses cqw/cqh units but the root element is missing container-type:size. Container query units will resolve against the viewport instead of the composition dimensions.",
        fixHint:
          'Add style="container-type:size" to the composition root element (the one with data-composition-id).',
        snippet: truncateSnippet(ctx.rootTag.raw),
      },
    ];
  },

  // gsap_prefer_container_units — flag GSAP tween props using bare numbers (px) for position/size
  (ctx) => {
    const findings: HyperframeLintFinding[] = [];
    if (!ctx.rootTag || !readAttr(ctx.rootTag.raw, "data-composition-id")) return findings;

    const widthRaw = parseInt(readAttr(ctx.rootTag.raw, "data-width") || "", 10);
    const heightRaw = parseInt(readAttr(ctx.rootTag.raw, "data-height") || "", 10);
    const compWidth = Number.isFinite(widthRaw) && widthRaw > 0 ? widthRaw : 1920;
    const compHeight = Number.isFinite(heightRaw) && heightRaw > 0 ? heightRaw : 1080;

    const GSAP_V_PROPS = new Set(["y", "top", "bottom", "height"]);
    const GSAP_TWEEN = /\.(to|from|fromTo|set)\s*\(/g;
    const PROP_NUM =
      /\b(x|y|left|right|top|bottom|width|height|fontSize|padding)\s*:\s*(-?\d+(?:\.\d+)?)\b/g;

    for (const script of ctx.scripts) {
      if (!GSAP_TWEEN.test(script.content)) {
        GSAP_TWEEN.lastIndex = 0;
        continue;
      }
      GSAP_TWEEN.lastIndex = 0;

      let propMatch: RegExpExecArray | null;
      PROP_NUM.lastIndex = 0;
      while ((propMatch = PROP_NUM.exec(script.content)) !== null) {
        const prop = propMatch[1] ?? "";
        const value = parseFloat(propMatch[2] ?? "0");
        if (Math.abs(value) <= MIN_PX_THRESHOLD) continue;

        const absValue = Math.abs(value);
        const sign = value < 0 ? "-" : "";
        let suggested: string;
        if (GSAP_V_PROPS.has(prop)) {
          const cq = Math.round((absValue / compHeight) * 100 * 100) / 100;
          suggested = `"${sign}${cq}cqh"`;
        } else {
          const cq = Math.round((absValue / compWidth) * 100 * 100) / 100;
          suggested = `"${sign}${cq}cqw"`;
        }

        findings.push({
          code: "gsap_prefer_container_units",
          severity: "info",
          message: `GSAP ${prop}: ${value} (px) could be ${suggested} for aspect-ratio independence.`,
          fixHint: `Use string values with cqw/cqh in GSAP tweens for responsive positioning: ${prop}: ${suggested}`,
        });
      }
    }

    return findings;
  },
];
