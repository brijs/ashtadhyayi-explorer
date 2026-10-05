// Data for the /engine page, computed at prerender time: curated vidyut derivations, the text's layout for the
// zoomable map, and usage statistics (which adhyāyas' rules fire in derivations).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getCorpus } from './data.ts';
import { derive, type DeriveExtra, type DeriveSpec } from './explainer-data.ts';
import type { EngineExample, EngineRun } from '#lib/engine/steps.ts';
import { ADHYAYAS, PADAS, citedNumbers, bandOf } from '#lib/structure.ts';

type Def = Omit<EngineExample, 'runs'> & { runs: { label: string; spec: DeriveSpec; extra?: DeriveExtra }[] };

// Every explanation below describes steps that appear in the vidyut output for that example (checked by `focus`:
// each listed sūtra must occur in the derivation, or the build fails).
const DEFS: Def[] = [
	{
		id: 'bhavati', word: 'भवति', iast: 'bhavati', gloss: '"(he/she/it) is, becomes"', group: 'verb',
		input: { base: 'root भू (Dhātupāṭha 01.0001, "to be")', baseNote: 'a dhātu by 1.3.1', intent: 'present tense · 3rd person · singular · active' },
		illustrates: 'The classic verb pipeline: the present-tense lakāra laṭ is added (3.2.123), its l is replaced by the ending tip (3.4.78), the vikaraṇa śap is inserted (3.1.68), the root takes guṇa (7.3.84: bhū → bho), and sandhi turns o + a into av + a (6.1.78). Marker letters are stripped by 1.3.9 again and again along the way.',
		focus: ['3.2.123', '3.4.78', '3.1.68', '7.3.84', '6.1.78'],
		runs: [{ label: 'tiṅanta', spec: { t: ['01.0001', 'BU', 'Parasmaipada'] } }]
	},
	{
		id: 'abhavat', word: 'अभवत्', iast: 'abhavat', gloss: '"(he/she/it) was"', group: 'verb',
		input: { base: 'root भू (01.0001)', baseNote: 'a dhātu by 1.3.1', intent: 'imperfect (laṅ) · 3rd person · singular · active' },
		illustrates: 'Same root, different tense. laṅ (3.2.111) is a ṅit lakāra, so the i of ti is dropped (3.4.100). The augment aṭ is placed before the stem (6.4.71). At the very end the Tripādī makes the final t voiced (8.2.39) and then, optionally, voiceless again at the end of the utterance (8.4.56): two rules from the last pādas that the rest of the grammar cannot see.',
		focus: ['3.2.111', '3.4.100', '6.4.71', '8.2.39', '8.4.56'],
		runs: [{ label: 'tiṅanta', spec: { t: ['01.0001', 'BU', 'Parasmaipada'] }, extra: { lakara: 'Lan', want: 'aBavat' } }]
	},
	{
		id: 'babhuva', word: 'बभूव', iast: 'babhūva', gloss: '"(he/she/it) was / became" (perfect)', group: 'verb',
		input: { base: 'root भू (01.0001)', baseNote: 'a dhātu by 1.3.1', intent: 'perfect (liṭ) · 3rd person · singular · active' },
		illustrates: 'Reduplication, the signature of the perfect. tip is replaced by ṇal (3.4.82); bhū gets the augment vuk (6.4.88); then 6.1.8 doubles the root and Adhyāya 7 reshapes the copy: shorten it (7.4.59), make its vowel a (7.4.73), and in the Tripādī bh → b (8.4.54).',
		focus: ['3.4.82', '6.4.88', '6.1.8', '7.4.59', '7.4.73', '8.4.54'],
		runs: [{ label: 'tiṅanta', spec: { t: ['01.0001', 'BU', 'Parasmaipada'] }, extra: { lakara: 'Lit' } }]
	},
	{
		id: 'gacchati', word: 'गच्छति', iast: 'gacchati', gloss: '"(he/she/it) goes"', group: 'verb',
		input: { base: 'root गम्ऌँ (01.1137, "to go")', baseNote: 'a dhātu by 1.3.1', intent: 'present tense · 3rd person · singular · active' },
		illustrates: 'A stem change: before śap, gam becomes gach (7.3.77). Then a tuk augment is inserted before ch (6.1.73) and the Tripādī assimilates t to c (8.4.40): gac-cha-ti.',
		focus: ['7.3.77', '6.1.73', '8.4.40'],
		runs: [{ label: 'tiṅanta', spec: { t: ['01.1137', 'gamx~'] } }]
	},
	{
		id: 'bubhushati', word: 'बुभूषति', iast: 'bubhūṣati', gloss: '"wants to be"', group: 'verb',
		input: { base: 'root भू (01.0001) + desiderative', baseNote: 'bhū + san is itself a new dhātu by 3.1.32', intent: 'desire (san) · present · 3rd person · singular · active' },
		illustrates: 'Two passes through the line. First the desiderative affix san (3.1.7) makes a new root: it is reduplicated (6.1.9) and the copy shortened (7.4.59), and 3.1.32 declares bubhūs- a dhātu. Then that root goes through the ordinary present-tense steps (3.2.123, 3.4.78, 3.1.68). The Tripādī turns s into ṣ (8.3.59) and bh into b (8.4.54).',
		focus: ['3.1.7', '6.1.9', '7.4.59', '3.1.32', '3.2.123', '8.3.59'],
		runs: [{ label: 'tiṅanta', spec: { t: ['01.0001', 'BU', 'Parasmaipada'] }, extra: { sanadi: ['san'] } }]
	},
	{
		id: 'bhavayati', word: 'भावयति', iast: 'bhāvayati', gloss: '"causes to be, brings about"', group: 'verb',
		input: { base: 'root भू (01.0001) + causative', baseNote: 'bhū + ṇic is a new dhātu by 3.1.32', intent: 'causative (ṇic) · present · 3rd person · singular · active' },
		illustrates: 'The causative ṇic (3.1.26) has a ṇ marker, so the root vowel takes vṛddhi (7.2.115: bhū → bhau → bhāv). The new root bhāvi- then takes laṭ, tip and śap like any other, and its final i takes guṇa (7.3.84) and becomes ay (6.1.78).',
		focus: ['3.1.26', '7.2.115', '3.1.32', '7.3.84', '6.1.78'],
		runs: [{ label: 'tiṅanta', spec: { t: ['01.0001', 'BU'] }, extra: { sanadi: ['Ric'], want: 'BAvayati' } }]
	},
	{
		id: 'anubhavati', word: 'अनुभवति', iast: 'anubhavati', gloss: '"experiences"', group: 'verb',
		input: { base: 'root भू (01.0001) + prefix अनु', baseNote: 'anu is labelled upasarga and gati (1.4.59–60)', intent: 'present · 3rd person · singular · active' },
		illustrates: 'A prefix is handled by Adhyāya 1 labels: anu is a nipāta (1.4.58), an upasarga (1.4.59) and gati (1.4.60), and 1.4.80 places it before the root. The verb itself is derived exactly as in bhavati.',
		focus: ['1.4.58', '1.4.59', '1.4.60', '1.4.80', '7.3.84'],
		runs: [{ label: 'tiṅanta', spec: { t: ['01.0001', 'BU', 'Parasmaipada'] }, extra: { prefixes: ['anu'] } }]
	},
	{
		id: 'pacakah', word: 'पाचकः', iast: 'pācakaḥ', gloss: '"a cook"', group: 'krt',
		input: { base: 'root डुपचँष् (01.1151, "to cook")', baseNote: 'a dhātu by 1.3.1', intent: 'agent noun (kṛt ṇvul) → then masculine · nominative · singular' },
		illustrates: 'Two chained runs. Word formation: the kṛt affix ṇvul (3.1.133) is added, vu becomes aka (7.1.1), and the ṇ marker triggers vṛddhi of the root vowel (7.2.116: pac → pāc). 1.2.46 then declares pācaka a nominal stem, which is the handoff. Inflection: the stem takes su (4.1.2), s → ru (8.2.66) → visarga (8.3.15).',
		focus: ['3.1.133', '7.1.1', '7.2.116', '1.2.46', '4.1.2', '8.3.15'],
		runs: [
			{ label: 'kṛdanta: pac + ṇvul', spec: { k: ['01.1151', 'Rvul'] } },
			{ label: 'subanta: pācaka + su', spec: { s: ['pAcaka', 'Pum', 'Prathama', 'Eka'] } }
		]
	},
	{
		id: 'gatah', word: 'गतः', iast: 'gataḥ', gloss: '"gone"', group: 'krt',
		input: { base: 'root गम्ऌँ (01.1137)', baseNote: 'a dhātu by 1.3.1', intent: 'past participle (kta) → then masculine · nominative · singular' },
		illustrates: 'The past participle affix kta (3.2.102) is kit, and before it the nasal of gam is dropped (6.4.37): gam-ta → ga-ta. No iṭ augment, by 7.2.10. Handoff at 1.2.46, then the participle is inflected like any a-stem.',
		focus: ['3.2.102', '7.2.10', '6.4.37', '1.2.46', '8.2.66'],
		runs: [
			{ label: 'kṛdanta: gam + kta', spec: { k: ['01.1137', 'kta'] } },
			{ label: 'subanta: gata + su', spec: { s: ['gata', 'Pum', 'Prathama', 'Eka'] } }
		]
	},
	{
		id: 'aupagavah', word: 'औपगवः', iast: 'aupagavaḥ', gloss: '"a descendant of Upagu"', group: 'taddhita',
		input: { base: 'stem उपगु (a prātipadika by 1.2.45)', baseNote: 'a noun stem, not a root', intent: '"his descendant" (taddhita aṇ) → then masculine · nominative · singular' },
		illustrates: 'Noun from noun. The taddhita aṇ comes in the sense "his descendant" (4.1.92). Its ṇ marker gives vṛddhi of the first vowel (7.2.117: u → au), the final u takes guṇa before the affix (6.4.146) and o + a → ava (6.1.78). Handoff at 1.2.46, then inflection.',
		focus: ['4.1.92', '7.2.117', '6.4.146', '6.1.78', '1.2.46'],
		runs: [
			{ label: 'taddhitānta: upagu + aṇ', spec: { tad: ['upagu', 'aR'] } },
			{ label: 'subanta: aupagava + su', spec: { s: ['Opagava', 'Pum', 'Prathama', 'Eka'] } }
		]
	},
	{
		id: 'ramah-pl', word: 'रामाः', iast: 'rāmāḥ', gloss: '"Rāmas" (nominative plural)', group: 'noun',
		input: { base: 'stem राम (a prātipadika by 1.2.45)', baseNote: 'masculine a-stem', intent: 'masculine · nominative · plural' },
		illustrates: 'A noun ending: jas (4.1.2) loses its j as a marker; a + a merge into one long ā (6.1.102), then the Tripādī turns final s into ru (8.2.66) and visarga (8.3.15).',
		focus: ['4.1.2', '6.1.102', '8.2.66', '8.3.15'],
		runs: [{ label: 'subanta', spec: { s: ['rAma', 'Pum', 'Prathama', 'Bahu'] } }]
	},
	{
		id: 'ramena', word: 'रामेण', iast: 'rāmeṇa', gloss: '"by Rāma" (instrumental)', group: 'noun',
		input: { base: 'stem राम', baseNote: 'masculine a-stem', intent: 'masculine · instrumental · singular' },
		illustrates: 'The ending ṭā is replaced by ina after an a-stem (7.1.12), a + i → e by guṇa sandhi (6.1.87), and in the Tripādī the n becomes ṇ because r precedes it in the same word (8.4.2).',
		focus: ['7.1.12', '6.1.87', '8.4.2'],
		runs: [{ label: 'subanta', spec: { s: ['rAma', 'Pum', 'Trtiya', 'Eka'] } }]
	},
	{
		id: 'raja', word: 'राजा', iast: 'rājā', gloss: '"king"', group: 'noun',
		input: { base: 'stem राजन्', baseNote: 'masculine n-stem', intent: 'masculine · nominative · singular' },
		illustrates: 'Lengthening (6.4.8), loss of su after a consonant (6.1.68), and the Tripādī deletes the final n (8.2.7). Because 8.2.7 is in the Tripādī, it is asiddha: no rule before 8.2.1 can see that the n is gone.',
		focus: ['6.4.8', '6.1.68', '8.2.7'],
		runs: [{ label: 'subanta', spec: { s: ['rAjan', 'Pum', 'Prathama', 'Eka'] } }]
	},
	{
		id: 'nadi', word: 'नदी', iast: 'nadī', gloss: '"river"', group: 'noun',
		input: { base: 'feminine stem नदी (ending in the strī affix ṅī)', baseNote: 'taken as a ṅyāp-ending stem', intent: 'feminine · nominative · singular' },
		illustrates: 'Why there is no -ḥ: the stem is labelled nadī (1.4.3), and 6.1.68 deletes the s of su after a long ī that is a feminine affix. Compare rāmāḥ.',
		focus: ['1.4.3', '6.1.68'],
		runs: [{ label: 'subanta', spec: { s: ['nadI', 'Stri', 'Prathama', 'Eka', true] } }]
	}
];

export const GROUPS: Record<EngineExample['group'], string> = {
	verb: 'Verbs (tiṅanta)',
	krt: 'Nouns from verbs (kṛt)',
	taddhita: 'Nouns from nouns (taddhita)',
	noun: 'Inflected nouns (subanta)'
};

let cache: Promise<EngineExample[]> | null = null;
export function engineExamples() {
	cache ??= (async () => {
		const out: EngineExample[] = [];
		for (const d of DEFS) {
			const runs: EngineRun[] = [];
			for (const r of d.runs) {
				const dv = await derive(r.spec, r.extra);
				runs.push({ label: r.label, word: dv.word, hash: dv.hash, steps: dv.steps.map((st) => ({ ...st, terms: st.terms.filter((t) => t.t !== '') })) });
			}
			const final = runs[runs.length - 1].word;
			if (final !== d.word) throw new Error(`engine example ${d.id}: vidyut gave ${final}, expected ${d.word}`);
			const codes = new Set(runs.flatMap((r) => r.steps.map((s) => s.code)));
			const missing = d.focus.filter((n) => !codes.has(n));
			if (missing.length) throw new Error(`engine example ${d.id}: focus sūtras not in derivation: ${missing.join(' ')}`);
			out.push({ ...d, runs });
		}
		return out;
	})();
	return cache;
}

/** Per-sūtra layout data for the map, the per-pāda structure, heading spans, and usage statistics. */
export function structureData() {
	const { corpus, order, byApn } = getCorpus();
	for (const n of citedNumbers()) if (!byApn.has(n)) throw new Error(`structure.ts cites ${n}, which is not in the corpus`);

	const usage = JSON.parse(readFileSync(join(process.cwd(), 'generated', 'usage.json'), 'utf8')) as {
		derivations: number;
		usage: Record<string, [number, number, number]>;
	};
	const adhikaras = JSON.parse(readFileSync(join(process.cwd(), 'static', 'data', 'adhikaras.json'), 'utf8')) as {
		id: string; n: string; s: string; from: string; to: string; count: number; isAD: boolean;
	}[];

	// per sūtra: type code and sample-usage count, in text order
	const types: string[] = [];
	const heat: number[] = [];
	const padaCounts: number[][] = [1, 2, 3, 4, 5, 6, 7, 8].map(() => [0, 0, 0, 0]);
	for (const id of order) {
		const s = corpus[id];
		types.push(s.types.find((t) => t.code !== 'V')?.code ?? 'V');
		heat.push(usage.usage[id]?.[0] ?? 0);
		padaCounts[s.a - 1][s.p - 1]++;
	}
	// heading spans: keep scopes that start at their own sūtra (a few upstream records are off) and span ≥ 5 sūtras
	const spans = adhikaras
		.filter((x) => x.isAD && x.from === x.id && x.count >= 5)
		.map((x) => ({ n: x.n, s: x.s, from: order.indexOf(x.from), to: order.indexOf(x.to), toN: corpus[x.to].n, count: x.count }));
	const span = (n: string) => {
		const x = spans.find((sp) => sp.n === n);
		if (!x) throw new Error(`no heading scope for ${n}`);
		return x;
	};

	// which adhyāyas' rules fire, over the build's sample derivations (scripts/build-data.ts)
	const perA = [1, 2, 3, 4, 5, 6, 7, 8].map((a) => ({ a, fires: 0, changes: 0, distinct: 0, total: 0 }));
	for (const id of order) {
		const a = corpus[id].a - 1;
		perA[a].total++;
		const u = usage.usage[id];
		if (!u) continue;
		perA[a].fires += u[1];
		perA[a].changes += u[2];
		perA[a].distinct++;
	}

	const adhyayas = ADHYAYAS.map((x) => ({
		...x,
		count: padaCounts[x.a - 1].reduce((m, c) => m + c, 0),
		headingSpans: x.headings.map((n) => {
			const sp = spans.find((s) => s.n === n);
			return { n, s: corpus[byApn.get(n)!].s, toN: sp?.toN ?? '', count: sp?.count ?? 0 };
		}),
		keys: x.keys.map((k) => ({ ...k, s: corpus[byApn.get(k.n)!].s })),
		padas: PADAS.filter((p) => p.a === x.a).map((p) => ({ ...p, count: padaCounts[x.a - 1][p.p - 1], keys: p.keys.map((k) => ({ ...k, s: corpus[byApn.get(k.n)!].s })) }))
	}));

	return {
		total: order.length,
		types: types.join(','),
		heat,
		padaCounts,
		spans,
		adhyayas,
		sample: { derivations: usage.derivations, perA },
		anchors: Object.fromEntries(['1.4.1', '2.1.3', '2.3.1', '3.1.1', '3.1.91', '4.1.1', '4.1.3', '4.1.76', '6.1.72', '6.4.1', '8.1.16', '8.2.1'].map((n) => [n, { toN: span(n).toN, count: span(n).count }])),
		bands: PADAS.map((p) => bandOf(p.a, p.p))
	};
}

/** Summary + pāda summaries for one adhyāya (used on /adhyaya/[a]). */
export function adhyayaSummary(a: number) {
	return structureData().adhyayas[a - 1];
}
