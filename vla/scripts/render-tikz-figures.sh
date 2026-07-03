#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VLA_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

PAPER_ROOT="${PAPER_ROOT:-/Users/nolan/Desktop/boat-related/Liu-2026-OATVLA}"
OUT_DIR="${OUT_DIR:-$VLA_ROOT/media/fig/tikz}"
DPI="${DPI:-300}"
PREVIEW_BORDER="${PREVIEW_BORDER:-8pt}"
KEEP_BUILD="${KEEP_TIKZ_BUILD:-0}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_cmd tectonic
require_cmd pdftoppm

if [[ ! -d "$PAPER_ROOT" ]]; then
  echo "Paper source not found: $PAPER_ROOT" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

render_tex_input() {
  local name="$1"
  local input_ref="$2"
  local before_input="${3:-}"
  local after_input="${4:-}"
  local tmp_dir
  local wrapper
  local wrapper_base
  local pdf_path
  local png_prefix
  local png_path
  local rc

  tmp_dir="$(mktemp -d "/tmp/oat-vla-${name}.XXXXXX")"
  wrapper="$PAPER_ROOT/render_oat_vla_${name}.tex"
  wrapper_base="$(basename "$wrapper" .tex)"
  pdf_path="$tmp_dir/${wrapper_base}.pdf"
  png_prefix="$tmp_dir/${name}"
  png_path="${png_prefix}-1.png"

  cat > "$wrapper" <<EOF
\\documentclass[a4paper, 11pt]{article}
\\ifdefined\\XeTeXversion\\else\\pdfoutput=1\\fi
\\usepackage{etoolbox,verbatim}
\\PassOptionsToPackage{authoryear,round}{natbib}
\\newtoggle{arxiv}\\toggletrue{arxiv}
\\newtoggle{customthms}\\toggletrue{customthms}
\\newtoggle{colt}\\togglefalse{colt}
\\input{preamble/_preamble_includes}
\\usepackage[active,tightpage]{preview}
\\PreviewEnvironment{preview}
\\setlength\\PreviewBorder{$PREVIEW_BORDER}
\\pagestyle{empty}
\\begin{document}
\\begin{preview}
$before_input
\\input{$input_ref}
$after_input
\\end{preview}
\\end{document}
EOF

  set +e
  (
    cd "$PAPER_ROOT"
    tectonic --outdir "$tmp_dir" "$wrapper"
  )
  rc=$?
  set -e

  rm -f "$wrapper"

  if [[ "$rc" -ne 0 ]]; then
    echo "Failed to render $name" >&2
    exit "$rc"
  fi

  pdftoppm -f 1 -l 1 -r "$DPI" -png -cropbox "$pdf_path" "$png_prefix"
  cp "$png_path" "$OUT_DIR/${name}.png"

  if [[ "$KEEP_BUILD" == "1" ]]; then
    echo "kept build dir: $tmp_dir"
  else
    rm -rf "$tmp_dir"
  fi

  echo "rendered $OUT_DIR/${name}.png"
}

render_tikz_input() {
  local name="$1"
  local input_ref="$2"
  local tmp_dir
  local wrapper
  local wrapper_base
  local pdf_path
  local png_prefix
  local png_path
  local rc

  tmp_dir="$(mktemp -d "/tmp/oat-vla-${name}.XXXXXX")"
  wrapper="$PAPER_ROOT/render_oat_vla_${name}.tex"
  wrapper_base="$(basename "$wrapper" .tex)"
  pdf_path="$tmp_dir/${wrapper_base}.pdf"
  png_prefix="$tmp_dir/${name}"
  png_path="${png_prefix}-1.png"

  cat > "$wrapper" <<EOF
\\documentclass[a4paper, 11pt]{article}
\\ifdefined\\XeTeXversion\\else\\pdfoutput=1\\fi
\\usepackage{etoolbox,verbatim}
\\PassOptionsToPackage{authoryear,round}{natbib}
\\newtoggle{arxiv}\\toggletrue{arxiv}
\\newtoggle{customthms}\\toggletrue{customthms}
\\newtoggle{colt}\\togglefalse{colt}
\\input{preamble/_preamble_includes}
\\usepackage[active,tightpage]{preview}
\\PreviewEnvironment{tikzpicture}
\\setlength\\PreviewBorder{$PREVIEW_BORDER}
\\pagestyle{empty}
\\begin{document}
\\input{$input_ref}
\\end{document}
EOF

  set +e
  (
    cd "$PAPER_ROOT"
    tectonic --outdir "$tmp_dir" "$wrapper"
  )
  rc=$?
  set -e

  rm -f "$wrapper"

  if [[ "$rc" -ne 0 ]]; then
    echo "Failed to render $name" >&2
    exit "$rc"
  fi

  pdftoppm -f 1 -l 1 -r "$DPI" -png -cropbox "$pdf_path" "$png_prefix"
  cp "$png_path" "$OUT_DIR/${name}.png"

  if [[ "$KEEP_BUILD" == "1" ]]; then
    echo "kept build dir: $tmp_dir"
  else
    rm -rf "$tmp_dir"
  fi

  echo "rendered $OUT_DIR/${name}.png"
}

extract_codebook_tikz() {
  local output_path="$1"
  awk '
    /\\definecolor\{codeOAT\}/ {
      print;
      saw_color = 1;
      next;
    }
    saw_color && /\\begin\{tikzpicture\}\[x=1\.30cm,y=0\.075cm\]/ {
      printing = 1;
    }
    printing {
      print;
      if (/\\end\{tikzpicture\}/) {
        exit;
      }
    }
  ' "$PAPER_ROOT/body/experiments.tex" > "$output_path"

  if [[ ! -s "$output_path" ]]; then
    rm -f "$output_path"
    return 1
  fi
}

extract_heatmap_tikz() {
  local target="$1"
  local output_path="$2"
  awk -v target="$target" '
    /\\begin\{minipage\}/ {
      prefix_done = 1;
    }
    !prefix_done {
      print;
      next;
    }
    /\\begin\{tikzpicture\}\[x=0\.98cm,y=0\.98cm\]/ {
      count += 1;
      if (count == target) {
        printing = 1;
        print;
        next;
      }
    }
    printing {
      print;
      if (/\\end\{tikzpicture\}/) {
        print "\\endgroup";
        exit;
      }
    }
  ' "$PAPER_ROOT/figs/tikz/oat_ha_hl_heatmaps.tex" > "$output_path"

  if [[ ! -s "$output_path" ]]; then
    echo "Failed to extract heatmap TikZ #$target from $PAPER_ROOT/figs/tikz/oat_ha_hl_heatmaps.tex" >&2
    exit 1
  fi
}

render_tex_input "rate_distortion_curves" "figs/tikz/rate_distortion_curves"
render_tex_input "vlm_bar_success_grid" "figs/tikz/vlm_bar_success_grid"
render_tex_input "vlm_ki_success_grid" "figs/tikz/vlm_ki_success_grid"
