# Aṣṭādhyāyī Explorer

SvelteKit 3 static site (adapter-static), deployed to https://brijs.github.io/ashtadhyayi-explorer/ by `.github/workflows/deploy.yml` on push to `main`.

- `npm run data` → fetch pinned data and build `static/data/` + `generated/` (both gitignored). Required before `npm run build`.
- `npm run check` (runs `svelte-kit sync` first; `npm i` prunes `node_modules/$app`).
- `npm run test:smoke` → Playwright walkthrough with system Chrome; `BASE_PATH=/ashtadhyayi-explorer` to test the Pages build.
- `npm run narration` → Kokoro clips (venv at `~/.cache/kokoro/venv`), cached by text hash.
- `./scripts/build-wasm.sh` → rebuild vidyut WebAssembly (needs `~/.cargo/bin`).

Conventions: imports use `#lib/x.ts` with extensions (no `$lib`); `resolve()`/`asset()` give relative paths during SSR, so never build links in server loads. Lessons live in `src/lib/explainers/<slug>/` and are registered in `registry.ts` and `catalog.ts`. Every factual claim in lessons should be traceable to the data, vidyut output, or a cited source.
