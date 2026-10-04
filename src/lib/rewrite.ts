// A small context-sensitive rewrite engine over varṇas, with five vowel-sandhi sūtras as data.
// Used by the CS track. It models external vowel sandhi at a junction only; real sandhi has more rules.
import { toVarnas, fromVarnas, isVowel } from './varna.ts';

export type RuleId = '6.1.101' | '6.1.88' | '6.1.87' | '6.1.77' | '6.1.78';

export type RewriteRule = {
	id: RuleId;
	sutra: string;
	/** A → B / C _ D, written for display */
	notation: string;
	gloss: string;
	/** Given the vowel at the junction and the vowel after it, return the replacement and how many varṇas it consumes. */
	apply: (v: string, w: string) => { out: string[]; consumes: 1 | 2 } | null;
};

const SAVARNA: Record<string, string> = { 'अ': 'a', 'आ': 'a', 'इ': 'i', 'ई': 'i', 'उ': 'u', 'ऊ': 'u', 'ऋ': 'r', 'ॠ': 'r', 'ऌ': 'r' };
const LONG: Record<string, string> = { a: 'आ', i: 'ई', u: 'ऊ', r: 'ॠ' };
const A = ['अ', 'आ'];
const IK = ['इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ॠ', 'ऌ'];
const EC = ['ए', 'ओ', 'ऐ', 'औ'];
const YAN: Record<string, string> = { 'इ': 'य्', 'ई': 'य्', 'उ': 'व्', 'ऊ': 'व्', 'ऋ': 'र्', 'ॠ': 'र्', 'ऌ': 'ल्' };
// guṇa of the following vowel (1.1.2 अदेङ् गुणः), with ar/al from 1.1.51 उरण् रपरः
const GUNA: Record<string, string[]> = { 'इ': ['ए'], 'ई': ['ए'], 'उ': ['ओ'], 'ऊ': ['ओ'], 'ऋ': ['अ', 'र्'], 'ॠ': ['अ', 'र्'], 'ऌ': ['अ', 'ल्'] };
// vṛddhi (1.1.1 वृद्धिरादैच्)
const VRDDHI: Record<string, string> = { 'ए': 'ऐ', 'ऐ': 'ऐ', 'ओ': 'औ', 'औ': 'औ' };
const AYAV: Record<string, string[]> = { 'ए': ['अ', 'य्'], 'ओ': ['अ', 'व्'], 'ऐ': ['आ', 'य्'], 'औ': ['आ', 'व्'] };

/** Listed most specific first: an exception (apavāda) must be tried before the rule it overrides. */
export const RULES: RewriteRule[] = [
	{
		id: '6.1.101', sutra: 'अकः सवर्णे दीर्घः', notation: 'ak + similar ac → long', gloss: 'two similar vowels merge into one long vowel',
		apply: (v, w) => (SAVARNA[v] && SAVARNA[v] === SAVARNA[w] ? { out: [LONG[SAVARNA[v]]], consumes: 2 } : null)
	},
	{
		id: '6.1.88', sutra: 'वृद्धिरेचि', notation: 'a + ec → vṛddhi', gloss: 'a/ā before e, o, ai, au: both become ai or au',
		apply: (v, w) => (A.includes(v) && EC.includes(w) ? { out: [VRDDHI[w]], consumes: 2 } : null)
	},
	{
		id: '6.1.87', sutra: 'आद्गुणः', notation: 'a + ac → guṇa', gloss: 'a/ā before another vowel: both become its guṇa (e, o, ar, al)',
		apply: (v, w) => (A.includes(v) && GUNA[w] ? { out: GUNA[w], consumes: 2 } : null)
	},
	{
		id: '6.1.77', sutra: 'इको यणचि', notation: 'ik → yaṇ / _ ac', gloss: 'i, u, ṛ, ḷ become y, v, r, l before a vowel',
		apply: (v, w) => (IK.includes(v) && isVowel(w) ? { out: [YAN[v]], consumes: 1 } : null)
	},
	{
		id: '6.1.78', sutra: 'एचोऽयवायावः', notation: 'ec → ay av āy āv / _ ac', gloss: 'e, o, ai, au become ay, av, āy, āv before a vowel',
		apply: (v, w) => (EC.includes(v) && isVowel(w) ? { out: AYAV[v], consumes: 1 } : null)
	}
];

export type TraceStep = { rule: RewriteRule; before: string[]; after: string[]; at: number };

/** Join a + b and rewrite at the junction with the enabled rules, first match wins. */
export function rewrite(a: string, b: string, enabled: Set<RuleId>, order: RewriteRule[] = RULES): { result: string; trace: TraceStep[] } {
	const left = toVarnas(a).filter((x) => x.trim());
	const right = toVarnas(b).filter((x) => x.trim());
	let vs = [...left, ...right];
	const trace: TraceStep[] = [];
	const at = left.length - 1;
	const v = vs[at];
	const w = vs[at + 1];
	if (v && w && isVowel(v) && isVowel(w)) {
		for (const rule of order) {
			if (!enabled.has(rule.id)) continue;
			const r = rule.apply(v, w);
			if (!r) continue;
			const before = [...vs];
			vs = [...vs.slice(0, at), ...r.out, ...vs.slice(at + r.consumes)];
			trace.push({ rule, before, after: [...vs], at });
			break;
		}
	}
	return { result: trace.length ? fromVarnas(vs) : `${a} ${b}`, trace };
}

/** Textbook examples (as in the Laghu-siddhānta-kaumudī's ac-sandhi section) with the expected joined form. */
export const TESTS: { a: string; b: string; want: string; rule: RuleId }[] = [
	{ a: 'दधि', b: 'अत्र', want: 'दध्यत्र', rule: '6.1.77' },
	{ a: 'मधु', b: 'अरिः', want: 'मध्वरिः', rule: '6.1.77' },
	{ a: 'पितृ', b: 'आज्ञा', want: 'पित्राज्ञा', rule: '6.1.77' },
	{ a: 'दधि', b: 'इह', want: 'दधीह', rule: '6.1.101' },
	{ a: 'विद्या', b: 'आलयः', want: 'विद्यालयः', rule: '6.1.101' },
	{ a: 'देव', b: 'इन्द्रः', want: 'देवेन्द्रः', rule: '6.1.87' },
	{ a: 'गङ्गा', b: 'उदकम्', want: 'गङ्गोदकम्', rule: '6.1.87' },
	{ a: 'महा', b: 'ऋषिः', want: 'महर्षिः', rule: '6.1.87' },
	{ a: 'एक', b: 'एकम्', want: 'एकैकम्', rule: '6.1.88' },
	{ a: 'महा', b: 'औषधिः', want: 'महौषधिः', rule: '6.1.88' },
	{ a: 'हरे', b: 'ए', want: 'हरये', rule: '6.1.78' },
	{ a: 'नै', b: 'अकः', want: 'नायकः', rule: '6.1.78' },
	{ a: 'पौ', b: 'अकः', want: 'पावकः', rule: '6.1.78' }
];
