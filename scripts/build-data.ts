// Normalize ashtadhyayi-com/data into the app's data files, cross-link and validate.
//   data-raw/*            (fetched by fetch-data.sh, gitignored)
//   → static/data/*.json  (client: search, lists, terms, pratyāhāras, adhikāras)
//   → generated/sutras.full.json (server-only, read during prerender)
// Run: node scripts/build-data.ts

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { devaToIast, asciiDigits } from '../src/lib/translit.ts';
import { pratyahara, splitPratyaharaName } from '../src/lib/varna.ts';

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
// sutrartha_english is cleaner but covers ~840 sūtras; Vasu's summary covers all.
const enShort: Record<string, string> = Object.fromEntries(
	Object.keys(vasuSummary).map((k) => [k, (sutrartha[k]?.trim() || vasuSummary[k]?.trim() || '').replace(/।$/, '.')])
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
	return { name: p.name, iast: devaToIast(p.name), letters: listedNorm, computedMatches: ok, sutras: sutraNums.map(idFromApn).filter((i) => byId.has(i)) };
});
const pratyMismatch = pratyaharas.filter((p) => !p.computedMatches).map((p) => p.name);
for (const p of pratyaharas) {
	if (terms.has(p.name)) continue;
	terms.set(p.name, { key: p.name, iast: p.iast, kind: 'pratyahara', sutras: p.sutras, letters: p.letters });
}
const termStems = [...terms.keys()]
	.map((k) => ({ key: k, stem: k.endsWith('्') ? k.slice(0, -1) : k }))
	.sort((a, b) => b.stem.length - a.stem.length);

function matchTerm(part: string): string | undefined {
	for (const { key, stem } of termStems) {
		if (stem.length < 2 && part !== key && part.length > stem.length + 3) continue;
		if (part.startsWith(stem) && ENDINGS.has(part.slice(stem.length))) return key;
	}
	return undefined;
}

type Pada = { w: string; iast: string; kind: 'S' | 'T'; vib: string; vac: string; role: string; parts: { w: string; term?: string }[] };
const termUsage = new Map<string, Set<string>>();
function parsePc(id: string, pc: string, operational: boolean): Pada[] {
	const roles = operational ? ROLE_BY_VIBHAKTI : NEUTRAL_ROLE_BY_VIBHAKTI;
	return pc.split('##').filter(Boolean).map((x) => {
		const [w, kind = 'S', vib = '', vac = ''] = x.split('$');
		const role = kind === 'T' ? 'verb' : (roles[vib] ?? 'unknown');
		const parts = w.split('-').map((p) => ({ w: p, term: matchTerm(p) }));
		for (const part of parts) if (part.term) {
			if (!termUsage.has(part.term)) termUsage.set(part.term, new Set());
			termUsage.get(part.term)!.add(id);
		}
		return { w, iast: devaToIast(w), kind: kind as 'S' | 'T', vib, vac, role, parts };
	});
}

// ---------- word@sūtra references (anuvṛtti, adhikāra) ----------
const parseAn = (id: string, s: string) =>
	s.split('##').filter(Boolean).map((x) => {
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

const chips = Object.values(full).flatMap((f: any) => f.pc.flatMap((p: Pada) => p.parts));
console.log(`✓ ${raw.length} sūtras · ${terms.size} terms · ${adhikaras.length} adhikāra scopes · ${chips.filter((c) => c.term).length}/${chips.length} pada parts linked to terms`);
console.log(`  types: ${JSON.stringify(typeCounts)}`);
if (pratyMismatch.length) console.log(`  note: computed pratyāhāra ≠ listed for: ${pratyMismatch.join(' ')}`);
