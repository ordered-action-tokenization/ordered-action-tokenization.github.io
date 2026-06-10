#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRAXIS_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

PAPER_ROOT="${PAPER_ROOT:-/Users/nolan/Desktop/boat-related/Liu-2026-Praxis}"
OUT_DIR="${OUT_DIR:-$PRAXIS_ROOT/media/fig/tikz}"
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

PAPER_ROOT="$(cd "$PAPER_ROOT" && pwd)"
mkdir -p "$OUT_DIR"
OUT_DIR="$(cd "$OUT_DIR" && pwd)"

render_tikz_input() {
  local name="$1"
  local input_ref="$2"
  local tmp_dir
  local wrapper
  local wrapper_base
  local extracted
  local source_path
  local pdf_path
  local png_prefix
  local png_path
  local rc

  tmp_dir="$(mktemp -d "/tmp/praxis-tikz-${name}.XXXXXX")"
  wrapper="$PAPER_ROOT/render_praxis_${name}.tex"
  wrapper_base="$(basename "$wrapper" .tex)"
  extracted="$PAPER_ROOT/render_praxis_${name}_source.tex"
  source_path="$PAPER_ROOT/${input_ref}.tex"
  pdf_path="$tmp_dir/${wrapper_base}.pdf"
  png_prefix="$tmp_dir/${name}"
  png_path="${png_prefix}-1.png"

  if [[ ! -f "$source_path" ]]; then
    echo "Figure source not found: $source_path" >&2
    exit 1
  fi

  awk '
    /\\begin\{tikzpicture\}/ {
      printing = 1
    }
    printing {
      print
      if (/\\end\{tikzpicture\}/) {
        exit
      }
    }
  ' "$source_path" > "$extracted"

  if [[ ! -s "$extracted" ]]; then
    echo "No tikzpicture found in $source_path" >&2
    exit 1
  fi

  cat > "$wrapper" <<EOF
\\documentclass[a4paper, 11pt]{article}
\\ifdefined\\XeTeXversion\\else\\pdfoutput=1\\fi
\\usepackage{etoolbox,verbatim}
\\PassOptionsToPackage{authoryear,round}{natbib}
\\newtoggle{arxiv}\\toggletrue{arxiv}
\\newtoggle{customthms}\\toggletrue{customthms}
\\newtoggle{colt}\\togglefalse{colt}
\\input{preamble-claude/_preamble_includes}
\\captionsetup{
  font={small},
  labelfont={bf,color=praxisprimaryactive},
  textfont={color=praxisbody},
  justification=raggedright,
  singlelinecheck=false,
  labelsep=colon,
  skip=8pt
}
\\usepackage[active,tightpage]{preview}
\\PreviewEnvironment{tikzpicture}
\\setlength\\PreviewBorder{$PREVIEW_BORDER}
\\pagestyle{empty}
\\begin{document}
\\input{$extracted}
\\end{document}
EOF

  set +e
  (
    cd "$PAPER_ROOT"
    tectonic --outdir "$tmp_dir" "$wrapper"
  )
  rc=$?
  set -e

  rm -f "$wrapper" "$extracted"

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

render_tikz_input "teaser" "figs-claude/tikz/fig_teaser"
render_tikz_input "design_matrix" "figs-claude/tikz/fig_design_matrix"
render_tikz_input "cell_assembly" "figs-claude/tikz/fig_backbone_adapter"
render_tikz_input "objective_families" "figs-claude/tikz/fig_objective_families"
render_tikz_input "praxis_eval_boundary" "figs-claude/tikz/fig_praxis_eval_boundary"
