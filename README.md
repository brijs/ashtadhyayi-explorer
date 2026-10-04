# Aṣṭādhyāyī Explorer

Look up, explore and learn all 3,983 sūtras of Pāṇini's Aṣṭādhyāyī: word-by-word case roles, inherited words (anuvṛtti), headings (adhikāra), commentaries, interactive explainers, and the grammar's connections to computer science.

**Live site:** https://brijs.github.io/ashtadhyayi-explorer/ *(not yet published)*

## Develop

```sh
npm install
npm run data        # fetch pinned ashtadhyayi-com/data files and build static/data + generated/
npm run dev         # http://localhost:5173
npm run build       # prerender all pages to build/
npm run test:smoke  # browser walkthrough + screenshots (uses your installed Chrome)
```

For a GitHub Pages build, set the base path: `BASE_PATH=/ashtadhyayi-explorer npm run build`.

## Layout

- `scripts/fetch-data.sh`: downloads the data files we use from [ashtadhyayi-com/data](https://github.com/ashtadhyayi-com/data) at a pinned commit.
- `scripts/build-data.ts`: normalizes, cross-links (anuvṛtti, adhikāra, terms, pratyāhāras) and validates the data.
- `src/lib/translit.ts`, `src/lib/varna.ts`: Devanagari↔IAST, search keys, varṇa segmentation, Śiva sūtras.
- `src/routes/sutra/[n]`: one prerendered page per sūtra.

## Credits

Sūtra text, padaccheda, anuvṛtti, commentaries and examples: [ashtadhyayi.com](https://ashtadhyayi.com) open data, used with credit as its README asks. English: Śrīśa Chandra Vasu (1897). Derivations (coming soon): [vidyut](https://github.com/ambuda-org/vidyut) (MIT).
