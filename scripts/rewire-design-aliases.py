#!/usr/bin/env python3
"""
Rewire design.html alias tokens to reference the 4 core tokens
(--primary, --secondary, --tertiary, --accent) via var() or color-mix().

For each template:
1. Read template.html to get the original --tp-primary/secondary/tertiary/accent hex values
2. Read design.html <style id="ds-tokens"> :root block
3. For each alias, determine the mapping:
   - If the value is __PRIMARY__/__SECONDARY__/__TERTIARY__/__ACCENT__ → var(--primary) etc.
   - If the value is var(--primary) etc. → already wired, skip
   - If the value is a hex close to a core token → var(--coretoken) or color-mix()
   - If the value is a hardcoded hex far from all core tokens → keep as costume layer
4. Apply standard formulas for --ink-dim, --ink-fade, --hairline when hardcoded hex
"""

import os
import re
import sys
import math
from pathlib import Path


TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "skills" / "hyperframes" / "templates" / "presentations"

# The 4 placeholder patterns
PLACEHOLDERS = {
    "__PRIMARY__": "primary",
    "__SECONDARY__": "secondary",
    "__TERTIARY__": "tertiary",
    "__ACCENT__": "accent",
}

# Core tokens
CORE_TOKENS = ["primary", "secondary", "tertiary", "accent"]

# Distance thresholds
EXACT_THRESHOLD = 12     # RGB Euclidean distance for exact var() replacement
CLOSE_THRESHOLD = 50     # RGB distance for color-mix() derivation


def hex_to_rgb(hex_str):
    """Convert #RRGGBB or #RGB to (r, g, b) tuple."""
    h = hex_str.lstrip("#")
    if len(h) == 3:
        h = h[0]*2 + h[1]*2 + h[2]*2
    if len(h) != 6:
        return None
    try:
        return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))
    except ValueError:
        return None


def rgb_distance(rgb1, rgb2):
    """Euclidean distance in RGB space."""
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(rgb1, rgb2)))


def compute_mix_percentage(target_rgb, base_rgb, blend_rgb):
    """
    Compute the percentage for color-mix(in srgb, var(--base) XX%, var(--blend))
    that produces closest to target_rgb.
    """
    best_pct = 50
    best_dist = float("inf")
    for pct in range(0, 101):
        mixed = tuple(
            round(base_rgb[i] * pct / 100 + blend_rgb[i] * (100 - pct) / 100)
            for i in range(3)
        )
        d = rgb_distance(target_rgb, mixed)
        if d < best_dist:
            best_dist = d
            best_pct = pct
    return best_pct, best_dist


def parse_tp_values(template_html_path):
    """Extract --tp-primary, --tp-secondary, --tp-tertiary, --tp-accent hex values."""
    if not template_html_path.exists():
        return {}
    content = template_html_path.read_text()
    result = {}
    for token in CORE_TOKENS:
        pattern = rf"--tp-{token}\s*:\s*(#[0-9a-fA-F]{{3,8}})"
        m = re.search(pattern, content)
        if m:
            result[token] = m.group(1).lower()
    return result


def extract_ds_tokens_root(content):
    """
    Extract the content of <style id="ds-tokens"> ... :root{ ... } block.
    Returns (full_match_text, start_index, end_index) or None.
    """
    # Find <style id="ds-tokens">
    style_match = re.search(r'<style\s+id="ds-tokens"[^>]*>', content)
    if not style_match:
        return None

    style_start = style_match.end()
    # Find the closing </style>
    style_end_match = re.search(r"</style>", content[style_start:])
    if not style_end_match:
        return None

    style_content = content[style_start : style_start + style_end_match.start()]
    style_abs_start = style_start

    # Find :root{ ... }
    root_match = re.search(r":root\s*\{", style_content)
    if not root_match:
        return None

    # Find matching closing brace
    brace_start = root_match.end()
    depth = 1
    pos = brace_start
    while pos < len(style_content) and depth > 0:
        if style_content[pos] == "{":
            depth += 1
        elif style_content[pos] == "}":
            depth -= 1
        pos += 1

    root_inner = style_content[brace_start : pos - 1]
    abs_start = style_abs_start + root_match.start()
    abs_end = style_abs_start + pos

    return root_inner, abs_start, abs_end


def parse_css_vars(css_text):
    """
    Parse CSS custom property declarations from a :root block.
    Returns list of (var_name, value, full_match) tuples.
    Handles both single-line and multi-line declarations.
    """
    results = []
    # Match --varname: value; patterns
    # Value can contain nested parens, commas, etc.
    # We need to handle values that span complex expressions like box-shadows
    pattern = re.compile(
        r"(--[\w-]+)\s*:\s*"
        r"((?:[^;{}]|\{[^}]*\})*?)"
        r"\s*(?=[;}]|$)",
        re.DOTALL,
    )

    for m in pattern.finditer(css_text):
        var_name = m.group(1)
        value = m.group(2).strip()
        results.append((var_name, value, m.group(0)))

    return results


def is_color_value(value):
    """Check if a value is a simple hex color."""
    return bool(re.match(r"^#[0-9a-fA-F]{3,8}$", value.strip()))


def is_placeholder(value):
    """Check if a value is a __PLACEHOLDER__."""
    return value.strip() in PLACEHOLDERS


def is_already_var_ref(value):
    """Check if a value already references var(--primary/secondary/tertiary/accent)."""
    return bool(
        re.match(
            r"^var\(\s*--(primary|secondary|tertiary|accent)\s*\)$", value.strip()
        )
    )


def is_already_color_mix(value):
    """Check if value is already a color-mix expression."""
    return value.strip().startswith("color-mix(")


def classify_alias(var_name, value, tp_values):
    """
    Classify an alias and determine its replacement.

    Returns (action, new_value, details) where action is one of:
    - 'skip_core': this is one of the 4 core tokens
    - 'skip_non_color': not a color token (font, padding, etc.)
    - 'placeholder_to_var': __PLACEHOLDER__ → var(--core)
    - 'already_wired': already uses var(--core)
    - 'already_color_mix': already a color-mix expression (leave alone)
    - 'hex_to_var': hardcoded hex close to core → var(--core)
    - 'hex_to_mix': hardcoded hex derivable from core → color-mix()
    - 'hex_kept': hardcoded hex far from all cores (costume layer)
    - 'special_dim': --ink-dim hardcoded → standard formula
    - 'special_fade': --ink-fade hardcoded → standard formula
    - 'special_hairline': --hairline hardcoded → standard formula
    """
    # Skip the 4 core tokens themselves
    if var_name in ("--primary", "--secondary", "--tertiary", "--accent"):
        return ("skip_core", value, "core token")

    # Skip non-color tokens
    non_color_prefixes = (
        "--f-",
        "--pad-",
        "--glow-",
        "--border",
        "--shadow",
        "--bevel-",
        "--note-shadow",
    )
    if any(var_name.startswith(p) for p in non_color_prefixes):
        return ("skip_non_color", value, "not a color alias")

    # Placeholder → var()
    stripped = value.strip()
    if stripped in PLACEHOLDERS:
        core = PLACEHOLDERS[stripped]
        return ("placeholder_to_var", f"var(--{core})", f"__PLACEHOLDER__ → var(--{core})")

    # Already wired with var(--core)
    if is_already_var_ref(stripped):
        return ("already_wired", value, "already uses var(--core)")

    # Already a color-mix expression — check if it references aliases vs core
    if is_already_color_mix(stripped):
        return ("already_color_mix", value, "already color-mix")

    # Special handling for --ink-dim, --ink-fade, --hairline with hardcoded hex
    # Only apply the standard formula if the result is close to the original hex.
    # Otherwise keep as costume — the formula assumes a specific primary/secondary polarity.
    if var_name in ("--ink-dim", "--ink-fade", "--hairline") and is_color_value(stripped) and tp_values:
        target_rgb = hex_to_rgb(stripped)
        primary_rgb = hex_to_rgb(tp_values.get("primary", "#000000"))
        secondary_rgb = hex_to_rgb(tp_values.get("secondary", "#000000"))
        if target_rgb and primary_rgb and secondary_rgb:
            formulas = {
                "--ink-dim": (55, secondary_rgb, "color-mix(in srgb,var(--primary) 55%,var(--secondary))"),
                "--ink-fade": (28, secondary_rgb, "color-mix(in srgb,var(--primary) 28%,var(--secondary))"),
                "--hairline": (12, (0, 0, 0), "color-mix(in srgb,var(--primary) 12%,transparent)"),
            }
            pct, blend_rgb, formula = formulas[var_name]
            computed = tuple(
                round(primary_rgb[i] * pct / 100 + blend_rgb[i] * (100 - pct) / 100)
                for i in range(3)
            )
            dist = rgb_distance(target_rgb, computed)
            if dist <= 35:
                action_name = {"--ink-dim": "special_dim", "--ink-fade": "special_fade", "--hairline": "special_hairline"}[var_name]
                return (
                    action_name,
                    formula,
                    f"hardcoded {stripped} → standard formula (dist from computed={dist:.1f})",
                )
            else:
                return (
                    "hex_kept",
                    value,
                    f"{stripped} standard formula too far (dist={dist:.1f}), kept as costume",
                )

    # Hex color → check distance to core tokens
    if is_color_value(stripped) and tp_values:
        target_rgb = hex_to_rgb(stripped)
        if target_rgb:
            best_core = None
            best_dist = float("inf")
            for core, hex_val in tp_values.items():
                core_rgb = hex_to_rgb(hex_val)
                if core_rgb:
                    d = rgb_distance(target_rgb, core_rgb)
                    if d < best_dist:
                        best_dist = d
                        best_core = core

            if best_dist <= EXACT_THRESHOLD:
                return (
                    "hex_to_var",
                    f"var(--{best_core})",
                    f"{stripped} ≈ --{best_core} ({tp_values[best_core]}) dist={best_dist:.1f}",
                )

            if best_dist <= CLOSE_THRESHOLD:
                # Try color-mix between the closest core and each other core
                best_mix_core = best_core
                target_rgb_val = target_rgb
                core_rgb = hex_to_rgb(tp_values[best_core])

                # Try mixing with transparent
                pct_t, dist_t = compute_mix_percentage(
                    target_rgb_val, core_rgb, (0, 0, 0)
                )
                # Try mixing with each other core
                best_blend = None
                best_blend_pct = 50
                best_blend_dist = dist_t
                best_blend_name = "transparent"

                for other_core, other_hex in tp_values.items():
                    if other_core == best_core:
                        continue
                    other_rgb = hex_to_rgb(other_hex)
                    if other_rgb:
                        pct, dist = compute_mix_percentage(
                            target_rgb_val, core_rgb, other_rgb
                        )
                        if dist < best_blend_dist:
                            best_blend_dist = dist
                            best_blend_pct = pct
                            best_blend_name = f"var(--{other_core})"

                if best_blend_dist <= 15:
                    # If percentage is >= 99%, it's close enough to be a direct var() reference
                    effective_pct = pct_t if best_blend_name == "transparent" else best_blend_pct
                    if effective_pct >= 99:
                        return (
                            "hex_to_var",
                            f"var(--{best_core})",
                            f"{stripped} ≈ --{best_core} via mix@{effective_pct}% (dist={best_blend_dist:.1f})",
                        )
                    # Transparent mixing produces alpha-transparent colors in CSS,
                    # not solid darkened/lightened colors. Only allow for --hairline
                    # which intentionally wants semi-transparency.
                    if best_blend_name == "transparent" and var_name != "--hairline":
                        pass  # fall through to hex_kept
                    elif best_blend_name == "transparent":
                        new_val = f"color-mix(in srgb,var(--{best_core}) {pct_t}%,transparent)"
                        return (
                            "hex_to_mix",
                            new_val,
                            f"{stripped} → mix (base=--{best_core}, dist={best_blend_dist:.1f})",
                        )
                    else:
                        new_val = f"color-mix(in srgb,var(--{best_core}) {best_blend_pct}%,{best_blend_name})"
                        return (
                            "hex_to_mix",
                            new_val,
                            f"{stripped} → mix (base=--{best_core}, dist={best_blend_dist:.1f})",
                        )

            # Too far from all cores
            return (
                "hex_kept",
                value,
                f"{stripped} dist={best_dist:.1f} from --{best_core} (costume)",
            )

    # Hex without tp_values available — can't compute distance
    if is_color_value(stripped) and not tp_values:
        return ("hex_kept", value, f"{stripped} (no tp-values for distance calc)")

    # Not a simple hex — could be a complex value
    return ("skip_non_color", value, "complex value")


def process_template(template_dir, dry_run=False):
    """Process a single template directory. Returns report dict."""
    name = template_dir.name
    design_path = template_dir / "design.html"
    template_path = template_dir / "template.html"

    if not design_path.exists():
        return {"name": name, "error": "no design.html", "conversions": []}

    # Get tp- values from template.html
    tp_values = parse_tp_values(template_path)

    # Read design.html
    content = design_path.read_text()

    # Extract ds-tokens :root block
    root_info = extract_ds_tokens_root(content)
    if not root_info:
        return {"name": name, "error": "no ds-tokens :root block", "conversions": []}

    root_inner, root_abs_start, root_abs_end = root_info
    root_block = content[root_abs_start:root_abs_end]

    # Parse all CSS vars in the :root block
    vars_list = parse_css_vars(root_inner)

    conversions = []
    replacements = []  # (old_text, new_text) pairs to apply

    for var_name, value, full_match in vars_list:
        action, new_value, details = classify_alias(var_name, value, tp_values)

        if action.startswith("skip_"):
            continue

        if action in ("already_wired", "already_color_mix"):
            conversions.append(
                {
                    "var": var_name,
                    "action": action,
                    "old": value,
                    "new": value,
                    "details": details,
                }
            )
            continue

        if new_value != value:
            old_decl = f"{var_name}:{value}"
            new_decl = f"{var_name}:{new_value}"
            replacements.append((old_decl, new_decl))
            conversions.append(
                {
                    "var": var_name,
                    "action": action,
                    "old": value,
                    "new": new_value,
                    "details": details,
                }
            )
        else:
            conversions.append(
                {
                    "var": var_name,
                    "action": action,
                    "old": value,
                    "new": value,
                    "details": details,
                }
            )

    # Apply replacements
    if not dry_run and replacements:
        new_content = content
        for old_text, new_text in replacements:
            new_content = new_content.replace(old_text, new_text, 1)
        design_path.write_text(new_content)

    return {
        "name": name,
        "tp_values": tp_values,
        "conversions": conversions,
        "replacements_count": len(
            [c for c in conversions if c["old"] != c["new"]]
        ),
    }


def main():
    dry_run = "--dry-run" in sys.argv

    if dry_run:
        print("=== DRY RUN MODE — no files will be modified ===\n")

    template_dirs = sorted(
        [d for d in TEMPLATES_DIR.iterdir() if d.is_dir() and (d / "design.html").exists()]
    )

    print(f"Found {len(template_dirs)} templates with design.html\n")

    total_converted = 0
    total_kept = 0
    total_already = 0

    for tdir in template_dirs:
        report = process_template(tdir, dry_run=dry_run)
        name = report["name"]

        if "error" in report:
            print(f"  {name}: SKIP — {report['error']}")
            continue

        conversions = report["conversions"]
        changed = [c for c in conversions if c["old"] != c["new"]]
        kept = [c for c in conversions if c["action"] == "hex_kept"]
        already = [
            c
            for c in conversions
            if c["action"] in ("already_wired", "already_color_mix")
        ]

        total_converted += len(changed)
        total_kept += len(kept)
        total_already += len(already)

        # Summary line
        tp_str = (
            ", ".join(f"{k}={v}" for k, v in report.get("tp_values", {}).items())
            if report.get("tp_values")
            else "none"
        )

        if changed:
            print(f"  {name}: {len(changed)} converted, {len(kept)} kept as hex, {len(already)} already wired")
            for c in changed:
                print(f"    {c['action']:20s} {c['var']:20s} {c['old']:30s} → {c['new']}")
        elif kept or already:
            print(f"  {name}: 0 converted, {len(kept)} kept as hex, {len(already)} already wired")
        else:
            print(f"  {name}: no aliases to process")

        if kept and ("--verbose" in sys.argv or "-v" in sys.argv):
            for c in kept:
                print(f"    KEPT  {c['var']:20s} {c['old']:30s}  ({c['details']})")

    print(f"\n{'='*60}")
    print(f"TOTAL: {total_converted} aliases converted, {total_kept} kept as hex (costume), {total_already} already wired")
    if dry_run:
        print("(dry run — no files modified)")


if __name__ == "__main__":
    main()
