#!/usr/bin/env bash
# Download the subset of ashtadhyayi-com/data we use, pinned to a commit.
# The full repo is ~1.7 GB, so we fetch individual files instead of cloning.
set -euo pipefail
SHA="${ASHTADHYAYI_DATA_SHA:-5744762f010d677cfb43f347a42d02796cf615d6}"
DIR="$(cd "$(dirname "$0")/.." && pwd)/data-raw"
mkdir -p "$DIR"
FILES=(
  sutraani/data.txt sutraani/sutrartha_english.txt sutraani/vasu_english_summary.txt
  sutraani/vasu_english.txt sutraani/kashika.txt sutraani/kaumudi.txt
  sutraani/sutra_prayogas.txt sutraani/vartika.txt
  shivasutra/data.txt pratyahara/data.txt dhatu/data.txt
)
for f in "${FILES[@]}"; do
  out="$DIR/$(echo "$f" | tr / _)"
  if [ -s "$out" ] && [ "$(cat "$DIR/.sha" 2>/dev/null)" = "$SHA" ]; then continue; fi
  curl -sfL "https://raw.githubusercontent.com/ashtadhyayi-com/data/$SHA/$f" -o "$out"
  echo "fetched $f ($(wc -c <"$out") bytes)"
done
echo "$SHA" > "$DIR/.sha"

# vidyut (MIT): dhātupāṭha and the texts of non-Aṣṭādhyāyī rules cited in derivations
VSHA="$(cat "$(dirname "$0")/../static/wasm/VIDYUT_SHA")"
for f in dhatupatha varttikas kashika kaumudi linganushasanam unadipatha dhatupatha-ganasutras; do
  out="$DIR/vidyut_$f.tsv"
  [ -s "$out" ] && grep -qx "$VSHA" "$DIR/.vsha" 2>/dev/null && continue
  curl -sfL "https://raw.githubusercontent.com/ambuda-org/vidyut/$VSHA/vidyut-prakriya/data/$f.tsv" -o "$out"
  echo "fetched vidyut $f.tsv"
done
echo "$VSHA" > "$DIR/.vsha"
