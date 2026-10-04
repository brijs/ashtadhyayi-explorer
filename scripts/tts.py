"""Synthesize explainer narration with Kokoro (af_heart) → static/audio/**.mp3 + audio manifest.

Run `node scripts/narration.ts` first. Clips are cached by a hash of their spoken text,
so only changed captions are re-rendered. MP3 is written directly by libsndfile (no ffmpeg).
"""
import json, os, sys
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
K = os.environ.get('KOKORO_DIR', os.path.expanduser('~/.cache/kokoro'))
jobs = json.load(open(os.path.join(ROOT, 'generated', 'narration-jobs.json')))
voice = jobs['voice']
kokoro = None
manifest = {}
made = 0
for j in jobs['jobs']:
    out = os.path.join(ROOT, 'static', j['out'])
    manifest.setdefault(j['slug'], {})[j['id']] = j['out']
    if os.path.exists(out):
        continue
    os.makedirs(os.path.dirname(out), exist_ok=True)
    # drop stale versions of this clip
    for f in os.listdir(os.path.dirname(out)):
        if f.startswith(j['id'] + '.') and f != os.path.basename(out):
            os.remove(os.path.join(os.path.dirname(out), f))
    if kokoro is None:
        kokoro = Kokoro(os.path.join(K, 'kokoro-v1.0.onnx'), os.path.join(K, 'voices-v1.0.bin'))
    audio, sr = kokoro.create(j['say'], voice=voice, speed=1.0, lang='en-us')
    sf.write(out, audio, sr, format='MP3', subtype='MPEG_LAYER_III')
    made += 1
    print(f"  {j['out']}  {len(audio) / sr:.1f}s", flush=True)

with open(os.path.join(ROOT, 'src', 'lib', 'explainers', 'audio-manifest.json'), 'w') as f:
    json.dump(manifest, f, indent='\t', ensure_ascii=False)
    f.write('\n')
print(f"{made} new clips, {sum(len(v) for v in manifest.values())} total")
