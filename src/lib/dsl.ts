// A toy "write your own sūtra" language: target (6th case), substitute (1st), left context (5th),
// right context (7th) or word-end (अन्ते). Substitutes are chosen by nearness (1.1.50).
import { toVarnas, fromVarnas, isVowel, isConsonant } from './varna.ts';
import { lettersOf, nearest } from './phonetics.ts';

export type DslRule = { target: string; subst: string; left: string | null; right: string | null };
export const END = 'END';

/** Case forms of a pratyāhāra name: इक् → इकः (6th/5th), अचि (7th), यण् (1st). */
function stem(name: string) {
	return name.endsWith('्') ? name.slice(0, -1) : name;
}
const sixth = (n: string) => (n.endsWith('्') ? stem(n) + 'ः' : n + 'स्य');
const seventh = (n: string) => (n.endsWith('्') ? stem(n) + 'ि' : n);

/** The sūtra as Pāṇini's conventions would phrase it (words unjoined; real sūtras also apply sandhi). */
export function sutraText(r: DslRule): string[] {
	const words = [sixth(r.target), r.subst];
	if (r.left) words.push(sixth(r.left)); // the 5th case of these names looks the same as the 6th
	if (r.right) words.push(r.right === END ? 'अन्ते' : seventh(r.right));
	return words;
}

export type Change = { from: string; to: string; at: number };

/** Apply the rule once, left to right, across a phrase in saṃhitā (words separated by spaces). */
export function applyRule(r: DslRule, phrase: string): { output: string; changes: Change[] } {
	const target = new Set(lettersOf(r.target));
	const subst = lettersOf(r.subst);
	const left = r.left ? new Set(lettersOf(r.left)) : null;
	const right = r.right && r.right !== END ? new Set(lettersOf(r.right)) : null;
	const toks: string[] = [];
	phrase
		.trim()
		.split(/\s+/)
		.forEach((w, i) => {
			if (i) toks.push('#');
			toks.push(...toVarnas(w).filter((t) => t.trim()));
		});
	const changes: Change[] = [];
	const out = [...toks];
	for (let i = 0; i < toks.length; i++) {
		const t = toks[i];
		if (t === '#' || !target.has(t)) continue;
		let p = i - 1;
		while (p >= 0 && toks[p] === '#') p--;
		let n = i + 1;
		const atEnd = n >= toks.length || toks[n] === '#';
		while (n < toks.length && toks[n] === '#') n++;
		if (left && !(p >= 0 && left.has(toks[p]))) continue;
		if (r.right === END && !atEnd) continue;
		if (right && !(n < toks.length && right.has(toks[n]))) continue;
		if (!subst.length) continue;
		const to = nearest(t, subst);
		if (to !== t) {
			out[i] = to;
			changes.push({ from: t, to, at: i });
		}
	}
	// write out: a word boundary between a consonant and a vowel closes up (saṃhitā), others stay spaced
	let s = '';
	let seg: string[] = [];
	for (let i = 0; i < out.length; i++) {
		if (out[i] !== '#') {
			seg.push(out[i]);
			continue;
		}
		const prev = out[i - 1];
		const next = out[i + 1];
		if (changes.length && prev && next && isConsonant(prev) && isVowel(next)) continue;
		s += fromVarnas(seg) + ' ';
		seg = [];
	}
	s += fromVarnas(seg);
	return { output: s, changes };
}

export type Challenge = {
	id: string;
	title: string;
	goal: string;
	tests: { input: string; want: string }[];
	pāṇini?: { n: string; s: string; note: string };
};

export const CHALLENGES: Challenge[] = [
	{
		id: 'yan',
		title: 'Vowels to semivowels',
		goal: 'i, u, ṛ, ḷ become y, v, r, l when any vowel follows.',
		tests: [
			{ input: 'दधि अत्र', want: 'दध्यत्र' },
			{ input: 'मधु अरिः', want: 'मध्वरिः' },
			{ input: 'पितृ आज्ञा', want: 'पित्राज्ञा' },
			{ input: 'दधि करोति', want: 'दधि करोति' }
		],
		pāṇini: { n: '6.1.77', s: 'इको यणचि', note: 'Exactly your rule, with sandhi applied to the sūtra itself.' }
	},
	{
		id: 'jas',
		title: 'Voicing at the end of a word',
		goal: 'A stop or sibilant at the end of a word becomes the voiced, unaspirated stop of its place.',
		tests: [
			{ input: 'वाक् ईशः', want: 'वागीशः' },
			{ input: 'षट् आननः', want: 'षडाननः' },
			{ input: 'अच् अन्तः', want: 'अजन्तः' },
			{ input: 'सुप् अन्तः', want: 'सुबन्तः' }
		],
		pāṇini: { n: '8.2.39', s: 'झलां जशोऽन्ते', note: 'Pāṇini uses the plural झलाम्, "of the jhal sounds", and अन्ते, "at the end (of a pada)".' }
	}
];

export const TARGET_OPTIONS = ['इक्', 'अच्', 'यण्', 'एच्', 'झल्', 'हल्', 'अक्', 'जश्', 'खर्', 'शर्'];
export const SUBST_OPTIONS = ['यण्', 'जश्', 'चर्', 'अच्', 'इक्', 'अक्', 'ई', 'ऊ'];
export const CONTEXT_OPTIONS = ['अच्', 'हल्', 'झल्', 'यण्', 'खर्', 'इक्', 'अक्'];
