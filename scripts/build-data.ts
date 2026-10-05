// Normalize ashtadhyayi-com/data into the app's data files, cross-link and validate.
//   data-raw/*            (fetched by fetch-data.sh, gitignored)
//   → static/data/*.json  (client: search, lists, terms, pratyāhāras, adhikāras)
//   → generated/sutras.full.json (server-only, read during prerender)
// Run: node scripts/build-data.ts

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { devaToIast, asciiDigits } from '../src/lib/translit.ts';
import { pratyahara, splitPratyaharaName } from '../src/lib/varna.ts';
import { slp1ToDeva } from '../src/lib/slp1.ts';
import { LAKARAS, PURUSHAS, VACANAS, VIBHAKTIS } from '../src/lib/vidyut-enums.ts';

const ROOT = join(import.meta.dirname, '..');
const RAW = join(ROOT, 'data-raw');
const OUT_STATIC = join(ROOT, 'static', 'data');
const OUT_GEN = join(ROOT, 'generated');
mkdirSync(OUT_STATIC, { recursive: true });
mkdirSync(OUT_GEN, { recursive: true });

const load = (f: string) => JSON.parse(readFileSync(join(RAW, f), 'utf8'));
const errors: string[] = [];
const fail = (m: string) => errors.push(m);

// ---------- raw inputs ----------
type RawSutra = {
	i: string; a: string; p: string; n: string; s: string; e: string; pc: string; type: string;
	an: string; ad: string; ss: string; skn: string; lskn: string;
};
const raw: RawSutra[] = load('sutraani_data.txt').data;
const sutrartha: Record<string, string> = load('sutraani_sutrartha_english.txt');
const vasuSummary: Record<string, string> = load('sutraani_vasu_english_summary.txt');
// Short English is shown as plain text: unwrap <<quoted sūtras>> and [[x.y.z]] references.
const plainText = (t: string) =>
	t
		.replace(/<<(.+?)>>/g, '$1')
		.replace(/\[\[([0-9०-९.]+)\]\]/g, (_, r) => `(${asciiDigits(r)})`)
		.replace(/<[^>]+>/g, '')
		.replace(/\s+/g, ' ')
		.trim();
// sutrartha_english is cleaner but covers ~840 sūtras; Vasu's summary covers all.
const enShort: Record<string, string> = Object.fromEntries(
	Object.keys(vasuSummary).map((k) => [k, plainText(sutrartha[k]?.trim() || vasuSummary[k]?.trim() || '').replace(/।$/, '.')])
);
const vasuFull: Record<string, string> = load('sutraani_vasu_english.txt');
const kashika: Record<string, string> = load('sutraani_kashika.txt');
const kaumudi: Record<string, string> = load('sutraani_kaumudi.txt');
const prayogas: Record<string, any[]> = load('sutraani_sutra_prayogas.txt').data;
const vartikas: { sutra: string; vartika: string }[] = load('sutraani_vartika.txt').data;
const shivaRaw: any[] = load('shivasutra_data.txt').data;
const pratyRaw: { name: string; list: string; sutra: string; sutranum: string }[] = load('pratyahara_data.txt').data;

// ---------- ids ----------
const apn = (a: string | number, p: string | number, n: string | number) => `${a}.${p}.${n}`;
const idFromApn = (s: string) => {
	const [a, p, n] = s.split('.');
	return `${a}${p}${String(n).padStart(3, '0')}`;
};
const byId = new Map(raw.map((r) => [r.i, r]));
const ids = raw.map((r) => r.i);
const apnOf = (id: string) => {
	const r = byId.get(id)!;
	return apn(r.a, r.p, r.n);
};

// ---------- sūtra types ----------
const TYPE_INFO: Record<string, { en: string; sa: string }> = {
	V: { en: 'Operational rule', sa: 'विधिसूत्रम्' },
	S: { en: 'Definition', sa: 'संज्ञासूत्रम्' },
	P: { en: 'Meta-rule', sa: 'परिभाषासूत्रम्' },
	AD: { en: 'Heading', sa: 'अधिकारसूत्रम्' },
	AT: { en: 'Extension rule', sa: 'अतिदेशसूत्रम्' }
};
const parseTypes = (t: string) =>
	t.split('##').filter(Boolean).map((x) => {
		const [code, label] = x.split('$');
		if (!TYPE_INFO[code]) fail(`unknown type code ${code}`);
		return { code, label: label || '' };
	});

// ---------- padaccheda ----------
// ashtadhyayi.com encodes each pada as  word$S$vibhakti$vacana  (S = subanta, T = tiṅanta).
// In operational rules (vidhi, atideśa) the cases carry the meta-rule roles of 1.1.49/1.1.66/1.1.67.
// Elsewhere (definitions, meta-rules, headings) they are labelled neutrally.
const ROLE_BY_VIBHAKTI: Record<string, string> = {
	'1': 'subject', '2': 'object', '3': 'instrument', '4': 'purpose',
	'5': 'left', '6': 'target', '7': 'right', '0': 'avyaya'
};
const NEUTRAL_ROLE_BY_VIBHAKTI: Record<string, string> = {
	'1': 'nom', '2': 'object', '3': 'instrument', '4': 'purpose',
	'5': 'abl', '6': 'gen', '7': 'loc', '0': 'avyaya'
};
const ENDINGS = new Set([
	'', '्', 'ः', 'म्', 'ौ', 'ाः', 'ान्', 'स्य', 'ात्', 'ाद्', 'े', 'ेः', 'ोः', 'ि', 'ी', 'ीः', 'ाम्', 'ानाम्',
	'ेषु', 'ाय', 'ेन', 'ैः', 'ाभ्याम्', 'भ्यः', 'ो', 'ा', 'ु', 'यः', 'योः', 'ये', 'वः', 'नः', 'षु', 'सु',
	'ं', 'ां', 'स्', 'त्', 'द्', 'ाणाम्', 'ेभ्यः', 'ीनाम्', 'ूनाम्', 'ाणि', 'ानि'
]);

// ---------- term lexicon (saṃjñās + pratyāhāras) ----------
type Term = { key: string; iast: string; kind: 'samjna' | 'pratyahara'; sutras: string[]; letters?: string[]; en?: string };
const terms = new Map<string, Term>();
for (const r of raw) {
	for (const t of parseTypes(r.type)) {
		if (t.code !== 'S' || !t.label.endsWith('संज्ञा')) continue;
		const key = t.label.slice(0, -'संज्ञा'.length);
		if (!key) continue;
		const term = terms.get(key) ?? { key, iast: devaToIast(key), kind: 'samjna' as const, sutras: [] };
		if (!term.sutras.includes(r.i)) term.sutras.push(r.i);
		terms.set(key, term);
	}
}
for (const t of terms.values()) t.en = enShort[t.sutras[0]];

// pratyāhāras: computed from the Śiva sūtras and checked against ashtadhyayi.com's list
const pratyaharas = pratyRaw.map((p) => {
	const listed = p.list.split(',').map((x) => x.trim()).filter(Boolean);
	const split = splitPratyaharaName(p.name);
	let computed: string[] | null = null;
	if (split) {
		const r = pratyahara(split[0], split[1]);
		computed = r ? r.letters.map((v) => (v.endsWith('्') ? v.slice(0, -1) : v)) : null;
	}
	const listedNorm = listed.map((v) => (v.endsWith('्') ? v.slice(0, -1) : v));
	const ok = computed !== null && computed.join() === listedNorm.join();
	const sutraNums = [...p.sutranum.matchAll(/\[\[([\d.]+)\]\]/g)].map((m) => asciiDigits(m[1]));
	return { name: p.name, iast: devaToIast(p.name), letters: listedNorm, computedMatches: ok, sutras: sutraNums.map(idFromApn).filter((i) => byId.has(i)), affixes: computed === null ? listed : null };
});
const pratyMismatch = pratyaharas.filter((p) => !p.computedMatches).map((p) => p.name);
for (const p of pratyaharas) {
	if (terms.has(p.name)) continue;
	// classes of affixes (सुप्, तिङ्, कृञ् …) keep their listed forms with the virāma (जस्, not जस)
	terms.set(p.name, { key: p.name, iast: p.iast, kind: 'pratyahara', sutras: p.sutras, letters: p.affixes ?? p.letters });
}
for (const p of pratyaharas) delete (p as { affixes?: unknown }).affixes;
const termStems = [...terms.keys()]
	.map((k) => ({ key: k, stem: k.endsWith('्') ? k.slice(0, -1) : k, kind: terms.get(k)!.kind }))
	.sort((a, b) => b.stem.length - a.stem.length);

// Pratyāhāra names are short and many collide with affixes, roots and ordinary words, so they are matched
// more strictly than saṃjñās:
//  1. the ending must be one a consonant-final stem takes (हल् → हलः, हलि, हलोः …), so a-stem forms (हलात्,
//     अकाभ्याम्, and a nominative singular like इकः = the affix ika in 7.3.50) are not tagged;
//  2. inside a compound only the bare name counts (अच्-हलौ, or हल-आदेः where sandhi hides the virāma);
//  3. names that are also affixes, roots or words are tagged only in the sūtras listed in HOMONYM_PRATYAHARAS;
//  4. in a list of sup/tiṅ affixes (4.1.2, 3.4.101 …) the items are affixes, not sound classes: only the closing
//     class names सुप्/तिङ् are tagged.
// Endings of a consonant-final stem (forms in -bhyām/-bhis/-bhyas change the stem and never match).
const ANY_CONS_ENDING = new Set(['्', 'ौ', 'ः', 'म्', 'ा', 'े', 'ोः', 'ाम्', 'ि', 'सु', 'षु']);
// Where these names do denote a sound class (as the Kāśikā reads them). Elsewhere अण् is the taddhita affix aṇ,
// इण् the root i, कृञ् the root kṛ, अट् the augment aṭ, अम् the case ending or augment am, यञ् the affix yañ,
// चर्/यम् the roots car/yam, अलम् the particle, शर the reed, आप् the feminine affix, सुट् the augment suṭ,
// तृन् the affix tṛn, इच् the samāsānta ic, अक/इक/उक the affixes aka/ika/ukañ, and so on.
const HOMONYM_PRATYAHARAS: Record<string, string[]> = {
	'अण्': ['1.1.51', '1.1.69', '6.3.111', '7.4.13', '8.4.57'],
	'अक्': ['6.1.101', '6.1.128'],
	'इक्': ['1.1.3', '1.1.45', '1.1.48', '1.2.9', '6.1.77', '6.1.127', '6.3.61', '6.3.121', '6.3.123', '6.3.134', '7.1.73', '8.2.76'],
	'उक्': ['7.3.51'],
	'इच्': ['6.1.104', '6.3.68', '8.4.31'],
	'अट्': ['8.3.3', '8.3.9', '8.4.2', '8.4.63'],
	'इण्': ['8.3.39', '8.3.78'],
	'अम्': [],
	'यम्': ['8.4.64'],
	'यञ्': ['7.3.101'],
	'अश्': ['8.3.17'],
	'वश्': ['7.2.8'],
	'जश्': ['1.1.58', '8.2.39', '8.4.53'],
	'मय्': ['8.3.33'],
	'झय्': ['5.4.111', '8.2.10', '8.4.62'],
	'चर्': ['1.1.58', '8.4.54'],
	'शर्': ['8.3.28', '8.3.36', '8.3.58', '8.4.49'],
	'अल्': ['1.1.52', '1.1.65'],
	'वल्': ['6.1.66'],
	'आप्': ['7.2.112'],
	'सुट्': ['1.1.43'],
	'कृञ्': ['3.1.40'],
	'तृन्': ['2.3.69'],
	'तङ्': []
};
// Names that mostly denote the class, with the sūtras where they are something else: अच् is also the kṛt/taddhita
// affix ac (3.1.134, 3.2.9, 3.3.56, 5.2.127, 5.4.75, 5.4.118; and in 2.4.74 यङोऽचि च) and the root añc (6.4.138).
const NOT_PRATYAHARA: Record<string, string[]> = {
	'अच्': ['2.4.74', '3.1.134', '3.2.9', '3.3.56', '5.2.127', '5.4.75', '5.4.118', '6.4.138'],
	'सुप्': ['8.3.88'] // सुपि = a form of the root svap
};
// sup and tiṅ affixes as listed in 4.1.2 / 3.4.78, for recognising affix lists
const AFFIX_NAMES = new Set(['सुँ', 'औ', 'जस्', 'अम्', 'औट्', 'शस्', 'टा', 'भ्याम्', 'भिस्', 'ङे', 'भ्यस्', 'ङसिँ', 'ङस्', 'ओस्', 'आम्', 'ङि', 'सुप्',
	'तिप्', 'तस्', 'झि', 'सिप्', 'थस्', 'थ', 'मिप्', 'वस्', 'मस्', 'त', 'आताम्', 'झ', 'थास्', 'आथाम्', 'ध्वम्', 'इड्', 'इट्', 'वहि', 'महिङ्']);
const isAffixName = (w: string) => AFFIX_NAMES.has(w) || [...AFFIX_NAMES].some((a) => a.endsWith('्') && w.startsWith(a.slice(0, -1)) && ANY_CONS_ENDING.has(w.slice(a.length - 1)));
const CLASS_NAMES = new Set(['सुप्', 'तिङ्']);
const startsWithVowel = (w: string | undefined) => !!w && /^[अ-औॠॡ]/.test(w);

type MatchCtx = { sutra: string; vib: string; vac: string; final: boolean; next?: string; affixList: boolean };
function pratyaharaFits(key: string, ending: string, c: MatchCtx): boolean {
	const stem = key.slice(0, -1);
	if (stem.length < 2) return false; // र (1.1.51) would otherwise match every रः/रि/रोः, which are the sound r
	if (HOMONYM_PRATYAHARAS[key] && !HOMONYM_PRATYAHARAS[key].includes(c.sutra)) return false;
	if (NOT_PRATYAHARA[key]?.includes(c.sutra)) return false;
	if (c.affixList && !CLASS_NAMES.has(key)) return false;
	// sandhi can hide the virāma or the visarga before a vowel: हल-आदेः, सुप आत्मनः
	if (ending === '') return startsWithVowel(c.next);
	if (!c.final) return ending === '्';
	if (c.vib === '0' || (ending === 'ः' && c.vib === '1' && c.vac === '1')) return false;
	return ANY_CONS_ENDING.has(ending);
}

function matchTerm(part: string, c?: MatchCtx): string | undefined {
	for (const { key, stem, kind } of termStems) {
		if (kind === 'pratyahara') {
			if (!c || !part.startsWith(stem)) continue;
			const ending = part.slice(stem.length);
			if ((ending === '' || ENDINGS.has(ending)) && pratyaharaFits(key, ending, c)) return key;
			continue;
		}
		if (stem.length < 2 && part !== key && part.length > stem.length + 3) continue;
		if (part.startsWith(stem) && ENDINGS.has(part.slice(stem.length))) return key;
	}
	return undefined;
}

type Pada = { w: string; iast: string; kind: 'S' | 'T'; vib: string; vac: string; role: string; parts: { w: string; term?: string }[] };
const termUsage = new Map<string, Set<string>>();
function parsePc(id: string, pc: string, operational: boolean): Pada[] {
	const roles = operational ? ROLE_BY_VIBHAKTI : NEUTRAL_ROLE_BY_VIBHAKTI;
	const padas = pc.split('##').filter(Boolean).map((x) => x.split('$'));
	return padas.map(([w, kind = 'S', vib = '', vac = ''], pi) => {
		const role = kind === 'T' ? 'verb' : (roles[vib] ?? 'unknown');
		const ws = w.split('-');
		const affixList = ws.length >= 3 && ws.filter(isAffixName).length * 2 >= ws.length;
		const parts = ws.map((p, i) => {
			const final = i === ws.length - 1;
			const next = final ? padas[pi + 1]?.[0] : ws[i + 1];
			return { w: p, term: matchTerm(p, { sutra: apnOf(id), vib, vac, final, next, affixList }) };
		});
		for (const part of parts) if (part.term) {
			if (!termUsage.has(part.term)) termUsage.set(part.term, new Set());
			termUsage.get(part.term)!.add(id);
		}
		return { w, iast: devaToIast(w), kind: kind as 'S' | 'T', vib, vac, role, parts };
	});
}

// ---------- word@sūtra references (anuvṛtti, adhikāra) ----------
// The upstream data repeats some word@source pairs (e.g. त्रीणि@1.4.101 in 1.4.103); keep the first.
const parseAn = (id: string, s: string) =>
	[...new Set(s.split('##').filter(Boolean))].map((x) => {
		const [w, src] = x.split('$');
		if (!byId.has(src)) fail(`${apnOf(id)}: anuvṛtti source ${src} not found`);
		return { w, iast: devaToIast(w), id: src };
	});
const parseAd = (id: string, s: string) =>
	s.split('##').filter(Boolean).map((x) => {
		const [w, a, p, n] = x.split('$');
		const src = idFromApn(apn(a, p, n));
		if (!byId.has(src)) fail(`${apnOf(id)}: adhikāra source ${apn(a, p, n)} not found`);
		return { w, iast: devaToIast(w), id: src };
	});

// ---------- rich text (commentaries) ----------
const BASE = '@@BASE@@';
function richText(s: string | undefined): string {
	if (!s) return '';
	let t = s;
	const keep: string[] = [];
	const stash = (html: string) => `\u0001${keep.push(html) - 1}\u0002`;
	t = t.replace(/<(\/?)(i|b|em|strong)\s*>/gi, (_, sl, tag) => stash(`<${sl}${tag.toLowerCase()}>`));
	t = t.replace(/<br\s*\/?>/gi, () => stash('<br>'));
	t = t.replace(/<<(.+?)>>/g, (_, q) => `\u0003${q}\u0004`);
	t = t.replace(/`([^`]+)`/g, (_, q) => `\u0003${q}\u0004`);
	t = t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	t = t.replace(/\[\[([0-9०-९]+\.[0-9०-९]+\.[0-9०-९]+)\]\]/g, (m, ref) => {
		const a = asciiDigits(ref);
		return byId.has(idFromApn(a)) ? `<a class="sref" href="${BASE}/sutra/${a}/">${a}</a>` : a;
	});
	t = t.replace(/\u0003/g, '<span class="sq">').replace(/\u0004/g, '</span>');
	t = t.replace(/\u0001(\d+)\u0002/g, (_, k) => keep[+k]);
	return t
		.split(/\n\s*\n/)
		.map((para) => para.trim())
		.filter(Boolean)
		.map((para) => `<p>${para.replace(/\n/g, '<br>')}</p>`)
		.join('');
}

// ---------- assemble ----------
const vartikaBy = new Map<string, string[]>();
for (const v of vartikas) {
	const id = idFromApn(asciiDigits(v.sutra));
	if (!byId.has(id)) { fail(`vārttika on unknown sūtra ${v.sutra}`); continue; }
	vartikaBy.set(id, [...(vartikaBy.get(id) ?? []), v.vartika]);
}

const full: Record<string, any> = {};
const passesTo = new Map<string, Set<string>>();
const governs = new Map<string, string[]>();

for (const r of raw) {
	const an = parseAn(r.i, r.an);
	const ad = parseAd(r.i, r.ad);
	for (const x of an) {
		if (!passesTo.has(x.id)) passesTo.set(x.id, new Set());
		passesTo.get(x.id)!.add(r.i);
	}
	for (const x of ad) governs.set(x.id, [...(governs.get(x.id) ?? []), r.i]);
	const types = parseTypes(r.type);
	const operational = types.some((t) => t.code === 'V' || t.code === 'AT');
	full[r.i] = {
		id: r.i,
		n: apn(r.a, r.p, r.n),
		a: +r.a, p: +r.p, k: +r.n,
		s: r.s,
		iast: devaToIast(r.s),
		types,
		pc: parsePc(r.i, r.pc, operational),
		an,
		ad,
		ss: r.ss.trim(),
		ssIast: r.ss.trim() ? devaToIast(r.ss.trim()) : '',
		en: enShort[r.i] ?? '',
		enVasu: richText(vasuFull[r.i]),
		kashika: richText(kashika[r.i]),
		kaumudi: richText(kaumudi[r.i]),
		vartikas: vartikaBy.get(r.i) ?? [],
		prayogas: (prayogas[apn(r.a, r.p, r.n)] ?? []).map((x) => ({ ...x, ref: richText(x.ref) })),
		skn: +r.skn || null,
		lskn: +r.lskn || null
	};
	if (!enShort[r.i]) fail(`${apnOf(r.i)}: missing English`);
}

// sequence + reverse links + adhikāra scopes
ids.forEach((id, idx) => {
	full[id].prev = ids[idx - 1] ?? null;
	full[id].next = ids[idx + 1] ?? null;
	full[id].passesTo = [...(passesTo.get(id) ?? [])];
	const g = governs.get(id);
	full[id].scope = g ? { from: g[0], to: g[g.length - 1], count: g.length } : null;
});

// Inherited words (anuvṛtti, adhikāra) carry the term their source sūtra tagged, so they get the same hover card.
// The word is looked up among the source's pada parts; failing that (a different case form), it is matched afresh
// in the source sūtra's context.
for (const f of Object.values(full)) {
	for (const x of [...f.an, ...f.ad] as { w: string; id: string; term?: string }[]) {
		const src: Pada[] = full[x.id].pc;
		const term =
			src.flatMap((p) => p.parts).find((pt) => pt.w === x.w)?.term ??
			src.find((p) => p.w === x.w && p.parts.length === 1)?.parts[0].term ??
			(x.w.includes('-') ? undefined : matchTerm(x.w, { sutra: full[x.id].n, vib: '', vac: '', final: true, affixList: false }));
		if (term) x.term = term;
	}
}

const adhikaras = [...governs.entries()]
	.map(([id, g]) => ({ id, n: apnOf(id), s: byId.get(id)!.s, from: g[0], to: g[g.length - 1], count: g.length, isAD: parseTypes(byId.get(id)!.type).some((t) => t.code === 'AD') }))
	.sort((x, y) => +x.id - +y.id);

// client core: small enough for search + lists + map
const core = raw.map((r) => {
	const f = full[r.i];
	return { id: r.i, n: f.n, s: r.s, e: r.e, ty: [...new Set(f.types.map((t: any) => t.code))], en: f.en };
});

// Śiva sūtras with Kāśikā notes
const shiva = shivaRaw.map((x) => ({ id: +x.id, s: x.sutra, iast: devaToIast(x.sutra), kashika: richText(x.kashika) }));

for (const t of terms.values()) (t as any).usedIn = [...(termUsage.get(t.key) ?? [])].sort((a, b) => +a - +b);

// ---------- vidyut: dhātupāṭha + rule texts for derivations ----------
const tsv = (f: string) =>
	readFileSync(join(RAW, `vidyut_${f}.tsv`), 'utf8')
		.split(/\r?\n/)
		.slice(1)
		.filter(Boolean)
		.map((l) => l.split('\t'));
const GANA: Record<string, string> = {
	'01': 'Bhvadi', '02': 'Adadi', '03': 'Juhotyadi', '04': 'Divadi', '05': 'Svadi',
	'06': 'Tudadi', '07': 'Rudhadi', '08': 'Tanadi', '09': 'Kryadi', '10': 'Curadi'
};
// antargana ranges as in vidyut's own demo (www/static/vidyut-prakriya-app.js)
function antargana(gana: string, n: number): string | null {
	if (gana === '01' && n >= 867 && n <= 932) return 'Ghatadi';
	if (gana === '10') {
		if (n >= 279 && n <= 337) return 'Asvadiya';
		if (n >= 192 && n <= 236) return 'Akusmiya';
		if (n >= 338 && n <= 388) return 'Adhrshiya';
	}
	return null;
}
const wasmDir = join(ROOT, 'static', 'wasm');
const vidyutMod = await import(join(wasmDir, 'vidyut_prakriya.js'));
await vidyutMod.default({ module_or_path: readFileSync(join(wasmDir, 'vidyut_prakriya_bg.wasm')) });
const vidyut = vidyutMod.Vidyut.init();
const dhatus = tsv('dhatupatha')
	.filter(([code, a]) => GANA[code.slice(0, 2)] && a && a !== '-')
	.map(([code, a, artha]) => {
		const g = code.slice(0, 2);
		const ag = antargana(g, +code.slice(3));
		let normal = '';
		try {
			normal = vidyut.deriveDhatus({ aupadeshika: a, gana: GANA[g], antargana: ag, sanadi: [], prefixes: [] })[0]?.text ?? '';
		} catch {
			/* leave blank */
		}
		if (!normal) fail(`dhātu ${code} ${a}: no normal form`);
		return { c: code, a, d: slp1ToDeva(a), n: slp1ToDeva(normal), m: slp1ToDeva(artha ?? ''), g: GANA[g], ag };
	});
// Sample derivations → for each sūtra, a few live examples that use it (linked from sūtra pages).
type Example = { w: string; h: string; d: string; steps: number };
const examples = new Map<string, Example[]>();
const record = (ps: { text: string; history: { rule: { source: string; code: string } }[] }[], h: string, d: string) => {
	const p = ps[0];
	if (!p) return 0;
	const ex = { w: slp1ToDeva(p.text), h, d, steps: p.history.length };
	for (const code of new Set(p.history.filter((st) => st.rule.source === 'ashtadhyayi').map((st) => st.rule.code))) {
		const id = idFromApn(code);
		if (!byId.has(id)) continue;
		const list = examples.get(id) ?? [];
		if (!list.some((e) => e.w === ex.w)) list.push(ex);
		examples.set(id, list);
	}
	return 1;
};
// [dhātupāṭha code, expected 3rd sg. present]. The expected forms double as a correctness check on vidyut.
const SAMPLE_ROOTS: [string, string][] = [
	['01.0001', 'भवति'], ['01.1137', 'गच्छति'], ['01.0381', 'पठति'], ['01.1164', 'वदति'], ['08.0010', 'करोति'],
	['02.0060', 'अस्ति'], ['02.0040', 'एति'], ['03.0010', 'ददाति'], ['04.0001', 'दीव्यति'], ['05.0001', 'सुनोति'],
	['06.0001', 'तुदति'], ['07.0001', 'रुणद्धि'], ['08.0001', 'तनोति'], ['09.0001', 'क्रीणाति'], ['01.1049', 'नयति'],
	['01.0642', 'जयति'], ['01.1092', 'शृणोति'], ['01.1143', 'पश्यति'], ['01.1077', 'तिष्ठति'], ['01.1074', 'पिबति'],
	['01.0051', 'खादति'], ['09.0043', 'जानाति'], ['01.0994', 'बोधति'], ['01.1130', 'लभते'], ['01.0574', 'सेवते'],
	['01.0862', 'वर्तते'], ['01.0953', 'रमते'], ['01.1157', 'यजति'], ['02.0002', 'हन्ति'], ['02.0058', 'वक्ति'],
	['06.0092', 'लिखति'], ['01.1151', 'पचति'], ['04.0091', 'नश्यति'], ['01.0919', 'स्मरति'], ['01.1047', 'धरति'],
	['01.1046', 'हरति'], ['06.0166', 'मुञ्चति'], ['10.0002', 'चिन्तयति'], ['10.0001', 'चोरयति'], ['10.0389', 'कथयति']
];
let derived = 0;
for (const [code, expected] of SAMPLE_ROOTS) {
	const d = dhatus.find((x) => x.c === code);
	if (!d) { fail(`sample root ${code} not in dhātupāṭha`); continue; }
	const dh = { aupadeshika: d.a, gana: d.g, antargana: d.ag, sanadi: [], prefixes: [] };
	const pada = /ते$/.test(expected) ? 'Atmanepada' : 'Parasmaipada';
	const derive = (l: string, p: string, pu: string, v: string) =>
		vidyut.deriveTinantas({ dhatu: dh, lakara: l, prayoga: p, purusha: pu, vacana: v, skip_at_agama: false, pada: p === 'Kartari' ? pada : null });
	const lat = derive('Lat', 'Kartari', 'Prathama', 'Eka').map((x: { text: string }) => slp1ToDeva(x.text));
	if (!lat.includes(expected)) fail(`vidyut: ${d.n} (${code}) लट् gave ${lat.join('/') || 'nothing'}, expected ${expected}`);
	const cells: [string, string, string, string][] = LAKARAS.map((l) => [l.id, 'Kartari', 'Prathama', 'Eka']);
	if (code === '01.0001') for (const pu of PURUSHAS) for (const v of VACANAS) cells.push(['Lat', 'Kartari', pu.id, v.id]);
	cells.push(['Lat', 'Karmani', 'Prathama', 'Eka']);
	for (const [l, p, pu, v] of cells) {
		const la = LAKARAS.find((x) => x.id === l)!.sa;
		derived += record(derive(l, p, pu, v), `t=${d.c},${l},${p},${pu},${v}${p === 'Kartari' ? ',' + pada : ''}`, `${d.n} · ${la}${p === 'Karmani' ? ' · कर्मणि' : ''} · ${PURUSHAS.find((x) => x.id === pu)!.sa} ${VACANAS.find((x) => x.id === v)!.sa}`);
	}
}
// [stem (SLP1), gender, expected nom. sg.] — also a correctness check on vidyut
const SAMPLE_NOUNS: [string, string, string][] = [
	['rAma', 'Pum', 'रामः'], ['hari', 'Pum', 'हरिः'], ['guru', 'Pum', 'गुरुः'], ['pitf', 'Pum', 'पिता'], ['rAjan', 'Pum', 'राजा'],
	['sarva', 'Pum', 'सर्वः'], ['nadI', 'Stri', 'नदी'], ['latA', 'Stri', 'लता'], ['mati', 'Stri', 'मतिः'], ['Denu', 'Stri', 'धेनुः'],
	['mAtf', 'Stri', 'माता'], ['vAri', 'Napumsaka', 'वारि'], ['maDu', 'Napumsaka', 'मधु'], ['jagat', 'Napumsaka', 'जगत्'],
	['Pala', 'Napumsaka', 'फलम्'], ['manas', 'Napumsaka', 'मनः']
];
for (const [stem, g, expected] of SAMPLE_NOUNS) {
	for (const vi of VIBHAKTIS) for (const v of VACANAS) {
		// feminine ā/ī stems are derived as ṅyāp-ending (नदी, लता), not as plain stems (cf. लक्ष्मीः)
		const nyap = g === 'Stri' && /[AI]$/.test(stem);
		const ps = vidyut.deriveSubantas({ pratipadika: nyap ? { nyap: stem } : { basic: stem }, linga: g, vibhakti: vi.id, vacana: v.id });
		if (vi.id === 'Prathama' && v.id === 'Eka' && !ps.some((x: { text: string }) => slp1ToDeva(x.text) === expected))
			fail(`vidyut: ${stem} ${g} nom. sg. gave ${ps.map((x: { text: string }) => slp1ToDeva(x.text)).join('/')}, expected ${expected}`);
		derived += record(ps, `s=${stem},${g},${vi.id},${v.id}${nyap ? ',nyap' : ''}`, `${slp1ToDeva(stem)} · ${vi.sa} ${v.sa}`);
	}
}
for (const [id, list] of examples) {
	full[id].examples = list.sort((a, b) => a.steps - b.steps).slice(0, 4).map(({ w, h, d }) => ({ w, h, d }));
}

const ruleTexts: Record<string, Record<string, string>> = {};
for (const [src, file] of [['varttika', 'varttikas'], ['kashika', 'kashika'], ['kaumudi', 'kaumudi'], ['linganushasanam', 'linganushasanam'], ['unadi', 'unadipatha'], ['dhatupatha', 'dhatupatha-ganasutras']]) {
	ruleTexts[src] = Object.fromEntries(tsv(file).map(([c, t]) => [c, slp1ToDeva(t ?? '')]));
}

// ---------- validation ----------
const typeCounts: Record<string, number> = {};
for (const r of raw) {
	const c = parseTypes(r.type)[0]?.code ?? '?';
	typeCounts[c] = (typeCounts[c] ?? 0) + 1;
}
const expect = (cond: boolean, m: string) => { if (!cond) fail(m); };
expect(raw.length === 3983, `expected 3983 sūtras, got ${raw.length}`);
expect(Object.entries({ S: 200, V: 3629, AD: 64, AT: 67, P: 23 }).every(([k, v]) => typeCounts[k] === v), `type counts changed: ${JSON.stringify(typeCounts)}`);
expect(new Set(ids).size === ids.length, 'duplicate ids');
expect(full['61077']?.s === 'इको यणचि', '6.1.77 text mismatch');
expect(full['11001']?.iast === 'vṛddhirādaic', `1.1.1 IAST: ${full['11001']?.iast}`);

if (errors.length) {
	console.error(`✗ ${errors.length} validation errors:\n  ` + errors.slice(0, 30).join('\n  '));
	process.exit(1);
}

// ---------- write ----------
const w = (dir: string, name: string, data: unknown) => {
	const json = JSON.stringify(data);
	writeFileSync(join(dir, name), json);
	console.log(`  ${name.padEnd(22)} ${(json.length / 1024).toFixed(0).padStart(6)} KB`);
};
console.log('writing:');
w(OUT_STATIC, 'sutras.core.json', core);
w(OUT_STATIC, 'terms.json', [...terms.values()]);
w(OUT_STATIC, 'pratyahara.json', pratyaharas);
w(OUT_STATIC, 'shivasutra.json', shiva);
w(OUT_STATIC, 'adhikaras.json', adhikaras);
w(OUT_STATIC, 'meta.json', { sha: readFileSync(join(RAW, '.sha'), 'utf8').trim(), count: raw.length, typeCounts, builtAt: new Date().toISOString().slice(0, 10) });
w(OUT_GEN, 'sutras.full.json', full);
w(OUT_STATIC, 'dhatus.json', dhatus);
w(OUT_STATIC, 'vidyut-rules.json', ruleTexts);

const chips = Object.values(full).flatMap((f: any) => f.pc.flatMap((p: Pada) => p.parts));
console.log(`✓ ${raw.length} sūtras · ${terms.size} terms · ${adhikaras.length} adhikāra scopes · ${chips.filter((c) => c.term).length}/${chips.length} pada parts linked to terms`);
console.log(`  types: ${JSON.stringify(typeCounts)} · ${dhatus.length} dhātus`);
console.log(`  ${derived} sample derivations → live examples for ${examples.size} sūtras`);
if (pratyMismatch.length) console.log(`  note: computed pratyāhāra ≠ listed for: ${pratyMismatch.join(' ')}`);
