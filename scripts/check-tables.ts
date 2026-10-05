// Check src/lib/tables.ts against the corpus and vidyut: every cell must resolve, and for each table a real
// derivation must show that sūtra introducing exactly the cell's item in that cell's slot.
// Run after `npm run data`: node scripts/check-tables.ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TABLES, resolveTable, type ResolvedTable } from '../src/lib/tables.ts';
import { slp1ToDeva } from '../src/lib/slp1.ts';
import { toVarnas } from '../src/lib/varna.ts';
import type { FullSutra } from '../src/lib/types.ts';

const ROOT = join(import.meta.dirname, '..');
const wasmDir = join(ROOT, 'static', 'wasm');
const mod = await import(join(wasmDir, 'vidyut_prakriya.js'));
await mod.default({ module_or_path: readFileSync(join(wasmDir, 'vidyut_prakriya_bg.wasm')) });
const vidyut = mod.Vidyut.init();

const corpus: Record<string, FullSutra> = JSON.parse(readFileSync(join(ROOT, 'generated/sutras.full.json'), 'utf8'));
const byN = new Map(Object.values(corpus).map((s) => [s.n, s]));
const problems: string[] = [];

type Step = { rule: { code: string }; result: { text: string }[] };
/** The terms right after `code` fired, in Devanagari, e.g. ['भू', 'णल्']. */
const after = (ps: { history: Step[] }[], code: string) => {
	const st = ps[0]?.history.find((s) => s.rule.code === code);
	return st ? st.result.map((t) => slp1ToDeva(t.text)).filter(Boolean) : null;
};
const expect = (n: string, slot: string, got: string[] | null, want: string) => {
	if (!got) problems.push(`${n} ${slot}: ${n} did not apply`);
	else if (!got.includes(want)) problems.push(`${n} ${slot}: vidyut gives ${got.join('+')}, table says ${want}`);
};
// sound-wise prefix/suffix tests (चय् ends in अय्, आयन begins with आयन्)
const vs = (t: string) => toVarnas(t).join(' ');
const endsWith = (t: string, want: string) => vs(t).endsWith(vs(want));
const startsWith = (t: string, want: string) => vs(t).startsWith(vs(want));
const dhatu = (aupadeshika: string, gana: string) => ({ aupadeshika, gana, antargana: null, sanadi: [], prefixes: [] });
const VIB = ['Prathama', 'Dvitiya', 'Trtiya', 'Caturthi', 'Panchami', 'Sasthi', 'Saptami'];
const PUR = ['Prathama', 'Madhyama', 'Uttama'];
const VAC = ['Eka', 'Dvi', 'Bahu'];
const tin = (lakara: string, purusha: string, vacana: string, pada: string, d = dhatu('BU', 'Bhvadi')) =>
	vidyut.deriveTinantas({ dhatu: d, lakara, prayoga: 'Kartari', purusha, vacana, skip_at_agama: false, pada });
const sub = (stem: string, linga: string, vibhakti: string, vacana: string, nyap = false) =>
	vidyut.deriveSubantas({ pratipadika: nyap ? { nyap: stem } : { basic: stem }, linga, vibhakti, vacana });
const krt = (d: ReturnType<typeof dhatu>, k: string) => vidyut.deriveKrdantas({ dhatu: d, krt: k, unadi: null, lakara: null, prayoga: null, upapada: null });
const tad = (stem: string, t: string, nyap = false) => vidyut.deriveTaddhitantas({ pratipadika: nyap ? { nyap: stem } : { basic: stem }, taddhita: t, artha: null });

const resolved: Record<string, ResolvedTable> = {};
for (const [n, spec] of Object.entries(TABLES)) {
	if (n !== spec.sutra) problems.push(`${n}: key ≠ sutra ${spec.sutra}`);
	for (const b of [...spec.basis.map((x) => x.n), ...(spec.axes ?? [])]) if (!byN.has(b)) problems.push(`${n}: basis ${b} not found`);
	try {
		resolved[n] = resolveTable(spec, (m) => byN.get(m)?.pc);
	} catch (e) {
		problems.push(String((e as Error).message));
	}
}
const grid = (n: string, layer = 0) => {
	const t = resolved[n];
	return t?.kind === 'grid' ? t.layers[layer].cells : [];
};
const pairs = (n: string) => {
	const t = resolved[n];
	return t?.kind === 'pairs' ? t.pairs : [];
};

// 4.1.2: the ending 4.1.2 introduces for रामः etc. in each vibhakti × vacana
VIB.forEach((vi, r) => VAC.forEach((va, c) => expect('4.1.2', `${vi}/${va}`, after(sub('rAma', 'Pum', vi, va), '4.1.2'), grid('4.1.2')[r]?.[c]?.main.text)));
// 3.4.78: the ending for भवति / एधते in each puruṣa × vacana, both padas
for (const [layer, pada, d] of [[0, 'Parasmaipada', dhatu('BU', 'Bhvadi')], [1, 'Atmanepada', dhatu('eDa~\\', 'Bhvadi')]] as const)
	PUR.forEach((pu, r) => VAC.forEach((va, c) => expect('3.4.78', `${pada}/${pu}/${va}`, after(tin('Lat', pu, va, pada, d), '3.4.78'), grid('3.4.78', layer)[r]?.[c]?.main.text)));
// 3.4.82: liṭ substitutes (बभूव …), and that each replaces the 3.4.78 ending in the same cell
PUR.forEach((pu, r) =>
	VAC.forEach((va, c) => {
		const ps = tin('Lit', pu, va, 'Parasmaipada');
		const cell = grid('3.4.82')[r]?.[c];
		expect('3.4.82', `${pu}/${va}`, after(ps, '3.4.82'), cell?.main.text);
		expect('3.4.82', `${pu}/${va} (replaced)`, after(ps, '3.4.78'), cell?.for?.text ?? '');
	})
);
// 3.4.101: laṅ (अभवताम्, अभवतम्, अभवत, अभवम्)
[['Prathama', 'Dvi'], ['Madhyama', 'Dvi'], ['Madhyama', 'Bahu'], ['Uttama', 'Eka']].forEach(([pu, va], i) => {
	const ps = tin('Lan', pu, va, 'Parasmaipada');
	expect('3.4.101', `${pu}/${va}`, after(ps, '3.4.101'), pairs('3.4.101')[i]?.to.text);
	expect('3.4.101', `${pu}/${va} (replaced)`, after(ps, '3.4.78'), pairs('3.4.101')[i]?.from.text);
});
// 6.1.77: नद्यौ (ई→य्, via 1.1.69), वध्वौ (ऊ→व्), पित्रा (ऋ→र्). No ready vidyut case for ऌ→ल्.
const yan = pairs('6.1.77');
for (const [ps, i] of [[sub('nadI', 'Stri', 'Prathama', 'Dvi', true), 0], [sub('vaDU', 'Stri', 'Prathama', 'Dvi'), 1], [sub('pitf', 'Pum', 'Trtiya', 'Eka'), 2]] as const) {
	const got = after(ps, '6.1.77');
	const want = yan[i]?.to.text;
	if (!got?.some((t) => endsWith(t, want))) problems.push(`6.1.77 row ${i}: vidyut gives ${got?.join('+')}, table says ${yan[i]?.from.text} → ${want}`);
}
// 6.1.78 and 7.1.1: चयन (ए→अय्), भवन (ओ→अव्), नायक (ऐ→आय्), भावक (औ→आव्); यु→अन (ल्युट्), वु→अक (ण्वुल्)
const ec = pairs('6.1.78');
for (const [d, k, i] of [[dhatu('ci\\Y', 'Svadi'), 'lyuw', 0], [dhatu('BU', 'Bhvadi'), 'lyuw', 1], [dhatu('RI\\Y', 'Bhvadi'), 'Rvul', 2], [dhatu('BU', 'Bhvadi'), 'Rvul', 3]] as const) {
	const ps = krt(d, k);
	const got = after(ps, '6.1.78');
	if (!got?.some((t) => endsWith(t, ec[i]?.to.text))) problems.push(`6.1.78 row ${i}: vidyut gives ${got?.join('+')}, table says ${ec[i]?.from.text} → ${ec[i]?.to.text}`);
	expect('7.1.1', k, after(ps, '7.1.1'), pairs('7.1.1')[k === 'lyuw' ? 0 : 1]?.to.text);
}
// 7.1.2: नाडायन, वैनतेय, कुलीन, शालीय, क्षत्रिय (the substitute replaces the affix's first consonant: फ → आयन)
for (const [stem, t, nyap, i] of [['naqa', 'Pak', false, 0], ['vinatA', 'Qak', true, 1], ['kula', 'Ka', false, 2], ['SAlA', 'Ca', false, 3], ['kzatra', 'Ga', false, 4]] as const) {
	const got = after(tad(stem, t, nyap), '7.1.2');
	const want = pairs('7.1.2')[i]?.to.text;
	if (!got?.some((x) => startsWith(x, want))) problems.push(`7.1.2 ${t}: vidyut gives ${got?.join('+')}, table says ${want}`);
}
// 7.1.12: रामेण, रामात्, रामस्य
[['Trtiya', 0], ['Panchami', 1], ['Sasthi', 2]].forEach(([vi, i]) => {
	const ps = sub('rAma', 'Pum', vi as string, 'Eka');
	expect('7.1.12', vi as string, after(ps, '7.1.12'), pairs('7.1.12')[i as number]?.to.text);
	expect('7.1.12', `${vi} (replaced)`, after(ps, '4.1.2'), pairs('7.1.12')[i as number]?.from.text);
});

const checked = new Set(['4.1.2', '3.4.78', '3.4.82', '3.4.101', '6.1.77', '6.1.78', '7.1.1', '7.1.2', '7.1.12']);
for (const n of Object.keys(TABLES)) if (!checked.has(n)) problems.push(`${n}: no vidyut check written for this table`);

console.log(`tables: ${Object.keys(TABLES).length} checked`);
if (problems.length) {
	console.error(`✗ ${problems.length} problems:\n  ` + problems.join('\n  '));
	process.exit(1);
}
console.log('✓ every table agrees with the corpus and vidyut');
