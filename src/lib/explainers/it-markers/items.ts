// Upadeśa items with their tags (anubandhas). The segmentation comes from detectIts (src/lib/it.ts), which
// scripts/check-its.ts verifies against vidyut, so the scenes cannot drift from the detector.
import { detectIts, stripIts, joinVarnas, IT_RULES, KEPT_RULES, type ItContext } from '#lib/it.ts';

export type Seg = { t: string; it?: string; kept?: string; note?: string };
export type Item = { name: string; kind: string; ctx: ItContext; segs: Seg[]; result: string };

const NOTE: Record<string, string> = {
	'1.3.2': 'nasalised vowel',
	'1.3.3': 'final consonant',
	'1.3.5': 'initial ḍu of a root',
	'1.3.6': 'initial ṣ of an affix',
	'1.3.7': 'initial c- or ṭ-class of an affix',
	'1.3.8': 'initial ś, l or k-class of a non-taddhita affix'
};
const KEPT_NOTE: Record<string, string> = {
	'1.3.4': 'NOT a tag: 1.3.4 spares t-class, s, m at the end of case endings'
};

function item(name: string, kind: string, ctx: ItContext, after = ''): Item {
	const units = detectIts(name, ctx);
	// keep running sounds together (ति, त्वा); a tag (ड्+उ of 1.3.5 together), or a sound saved by a rule, stands alone
	const groups: { vs: string[]; it?: string; kept?: string }[] = [];
	for (const u of units) {
		const prev = groups.at(-1);
		if (prev && !u.kept && !prev.kept && (u.it ?? '') === (prev.it ?? '') && (!u.it || u.it === '1.3.5' || u.it === '1.3.3.1')) prev.vs.push(u.v);
		else groups.push({ vs: [u.v], it: u.it ?? undefined, kept: u.kept });
	}
	const segs: Seg[] = groups.map((g) => {
		const t = joinVarnas(g.vs);
		if (g.it) return { t, it: g.it, note: NOTE[g.it] };
		if (g.kept) return { t, kept: g.kept, note: KEPT_NOTE[g.kept] ?? KEPT_RULES[g.kept]?.why };
		return { t };
	});
	return { name, kind, ctx, segs, result: stripIts(units) + after };
}

export const ITEMS: Item[] = [
	item('शप्', 'affix (vikaraṇa)', 'pratyaya'),
	item('तिप्', 'personal ending', 'vibhakti'),
	item('क्त्वा', 'kṛt affix', 'pratyaya'),
	item('तृच्', 'kṛt affix', 'pratyaya'),
	item('ण्वुल्', 'kṛt affix', 'pratyaya', ' (→ अक, 7.1.1)'),
	item('घञ्', 'kṛt affix', 'pratyaya'),
	item('ष्वुन्', 'kṛt affix', 'pratyaya', ' (→ अक, 7.1.1)'),
	item('जस्', 'case ending', 'vibhakti'),
	item('डुकृञ्', 'root', 'dhatu'),
	item('एधँ', 'root', 'dhatu')
];

export const IT_SUTRAS: Record<string, string> = Object.fromEntries(
	['1.3.2', '1.3.3', '1.3.4', '1.3.5', '1.3.6', '1.3.7', '1.3.8', '1.3.9'].map((n) => [n, IT_RULES[n].s])
);
