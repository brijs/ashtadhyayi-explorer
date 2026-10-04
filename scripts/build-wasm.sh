#!/usr/bin/env bash
# Build vidyut-prakriya (MIT, ambuda-org/vidyut) to WebAssembly at a pinned commit.
# Output is committed under static/wasm/ so normal builds and CI need no Rust toolchain.
# Requires: rustup (with wasm32-unknown-unknown target) and wasm-pack.
set -euo pipefail
SHA="${VIDYUT_SHA:-8da2f90bee3ce1c07505fa432fc3729e3f7e02ea}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/vendor/vidyut"
export PATH="$HOME/.cargo/bin:$PATH"

if [ ! -d "$SRC/.git" ]; then
  git clone -q --filter=blob:none https://github.com/ambuda-org/vidyut.git "$SRC"
fi
git -C "$SRC" fetch -q origin "$SHA" 2>/dev/null || true
git -C "$SRC" checkout -q "$SHA"

cd "$SRC/vidyut-prakriya"
wasm-pack build --target web --release --out-dir "$SRC/pkg" -- --features serde

OUT="$ROOT/static/wasm"
mkdir -p "$OUT"
cp "$SRC/pkg/vidyut_prakriya.js" "$SRC/pkg/vidyut_prakriya_bg.wasm" "$SRC/pkg/vidyut_prakriya.d.ts" "$OUT/"
echo "$SHA" > "$OUT/VIDYUT_SHA"
ls -la "$OUT"
