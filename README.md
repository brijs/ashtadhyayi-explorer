# Aṣṭādhyāyī Explorer

Look up, explore and learn all 3,983 sūtras of Pāṇini's Aṣṭādhyāyī: word-by-word case roles, inherited words (anuvṛtti), headings (adhikāra), commentaries, interactive explainers, and the grammar's connections to computer science.

[![Deploy](https://github.com/brijs/ashtadhyayi-explorer/actions/workflows/deploy.yml/badge.svg)](https://github.com/brijs/ashtadhyayi-explorer/actions/workflows/deploy.yml)

**Live site: https://brijs.github.io/ashtadhyayi-explorer/**

## What's inside

- **Sūtra Explorer**: all 3,983 sūtras, with word-by-word case roles, technical-term popovers, inherited words (anuvṛtti) and headings (adhikāra), a rewrite-rule sketch, and English, Kāśikā and Siddhānta Kaumudī commentary. Search in Devanagari, IAST, loose romanization, English or by number.
- **Learn**: 9 interactive explainers (Śiva sūtras, anatomy of a sūtra, anuvṛtti, it-markers, the nearest substitute, kinds of sūtra, rule conflict, the tripādī, building भवति), with optional narration.
- **Pāṇini & CS**: 6 lessons on rewrite rules, compression, metarules, grammars and BNF, rule ordering, and writing your own sūtra.
- **Tools**: a pratyāhāra calculator and a derivation debugger that runs [vidyut](https://github.com/ambuda-org/vidyut) in the browser, linking every step to its sūtra.

## Develop

```sh
npm install
npm run data        # fetch pinned ashtadhyayi-com/data files and build static/data + generated/
npm run dev         # http://localhost:5173
npm run build       # prerender all pages to build/
npm run test:smoke  # browser walkthrough + screenshots (uses your installed Chrome)
npm run narration   # re-render changed explainer narration (Kokoro, af_heart; venv at ~/.cache/kokoro/venv)
./scripts/build-wasm.sh  # rebuild vidyut-prakriya WebAssembly (needs rustup + wasm-pack); output is committed
```

For a GitHub Pages build, set the base path: `BASE_PATH=/ashtadhyayi-explorer npm run build`. Pushing to `main` deploys via `.github/workflows/deploy.yml`.

## Layout

- `scripts/fetch-data.sh`: downloads the data files we use from [ashtadhyayi-com/data](https://github.com/ashtadhyayi-com/data) at a pinned commit.
- `scripts/build-data.ts`: normalizes, cross-links (anuvṛtti, adhikāra, terms, pratyāhāras) and validates the data.
- `src/lib/translit.ts`, `src/lib/varna.ts`: Devanagari↔IAST, search keys, varṇa segmentation, Śiva sūtras.
- `src/routes/sutra/[n]`: one prerendered page per sūtra.
- `src/lib/explainer/`: the explainer engine (scenes, captions, narration, guide characters); lessons live in `src/lib/explainers/<slug>/`.
- `src/routes/tools/`: pratyāhāra calculator and derivation debugger (vidyut WebAssembly in `static/wasm/`).
- `src/lib/rewrite.ts`, `src/lib/sandhi.ts`: small rule engines used by the lessons.

## Credits

Sūtra text, padaccheda, anuvṛtti, commentaries and examples: [ashtadhyayi.com](https://ashtadhyayi.com) open data, used with credit as its README asks. English: Śrīśa Chandra Vasu (1897). Derivations: [vidyut](https://github.com/ambuda-org/vidyut) (MIT), compiled to WebAssembly.
