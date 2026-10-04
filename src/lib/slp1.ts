// SLP1 ↔ Devanagari / IAST. vidyut works in SLP1 (one ASCII letter per sound).
// Dependency-free; used in the browser and by build scripts.

const V: [string, string, string][] = [
	// slp1, independent, mātrā
	['a', 'अ', ''], ['A', 'आ', 'ा'], ['i', 'इ', 'ि'], ['I', 'ई', 'ी'], ['u', 'उ', 'ु'], ['U', 'ऊ', 'ू'],
	['f', 'ऋ', 'ृ'], ['F', 'ॠ', 'ॄ'], ['x', 'ऌ', 'ॢ'], ['X', 'ॡ', 'ॣ'], ['e', 'ए', 'े'], ['E', 'ऐ', 'ै'],
	['o', 'ओ', 'ो'], ['O', 'औ', 'ौ']
];
const C: [string, string][] = [
	['k', 'क'], ['K', 'ख'], ['g', 'ग'], ['G', 'घ'], ['N', 'ङ'], ['c', 'च'], ['C', 'छ'], ['j', 'ज'], ['J', 'झ'], ['Y', 'ञ'],
	['w', 'ट'], ['W', 'ठ'], ['q', 'ड'], ['Q', 'ढ'], ['R', 'ण'], ['t', 'त'], ['T', 'थ'], ['d', 'द'], ['D', 'ध'], ['n', 'न'],
	['p', 'प'], ['P', 'फ'], ['b', 'ब'], ['B', 'भ'], ['m', 'म'], ['y', 'य'], ['r', 'र'], ['l', 'ल'], ['v', 'व'],
	['S', 'श'], ['z', 'ष'], ['s', 'स'], ['h', 'ह'], ['L', 'ळ']
];
const OTHER: Record<string, string> = { M: 'ं', H: 'ः', '~': 'ँ', "'": 'ऽ', '.': '।', '|': '।' };

const VOW = new Map(V.map(([s, ind, m]) => [s, { ind, m }]));
const CON = new Map(C);
const VIRAMA = '्';

/** "Bavati" → "भवति". Vedic accent marks (\ ^) are dropped. */
export function slp1ToDeva(s: string): string {
	let out = '';
	const t = s.replace(/[\\^]/g, '');
	for (let i = 0; i < t.length; i++) {
		const ch = t[i];
		const c = CON.get(ch);
		if (c) {
			const next = VOW.get(t[i + 1]);
			if (next) {
				out += c + next.m;
				i++;
			} else out += c + VIRAMA;
			continue;
		}
		const v = VOW.get(ch);
		if (v) out += v.ind;
		else out += OTHER[ch] ?? ch;
	}
	return out;
}

const IAST: Record<string, string> = {
	a: 'a', A: 'ā', i: 'i', I: 'ī', u: 'u', U: 'ū', f: 'ṛ', F: 'ṝ', x: 'ḷ', X: 'ḹ', e: 'e', E: 'ai', o: 'o', O: 'au',
	k: 'k', K: 'kh', g: 'g', G: 'gh', N: 'ṅ', c: 'c', C: 'ch', j: 'j', J: 'jh', Y: 'ñ', w: 'ṭ', W: 'ṭh', q: 'ḍ', Q: 'ḍh',
	R: 'ṇ', t: 't', T: 'th', d: 'd', D: 'dh', n: 'n', p: 'p', P: 'ph', b: 'b', B: 'bh', m: 'm', y: 'y', r: 'r', l: 'l',
	v: 'v', S: 'ś', z: 'ṣ', s: 's', h: 'h', L: 'ḻ', M: 'ṃ', H: 'ḥ', '~': '̃'
};

export function slp1ToIast(s: string): string {
	return [...s.replace(/[\\^]/g, '')].map((ch) => IAST[ch] ?? ch).join('');
}

const DEVA_TO_SLP = new Map<string, string>([
	...V.map(([s, ind]) => [ind, s] as [string, string]),
	...V.filter(([, , m]) => m).map(([s, , m]) => [m, s] as [string, string]),
	...C.map(([s, d]) => [d, s] as [string, string]),
	['ं', 'M'], ['ः', 'H'], ['ँ', '~'], ['ऽ', "'"]
]);
const MATRAS = new Set(V.map(([, , m]) => m).filter(Boolean));

/** "भवति" → "Bavati" */
export function devaToSlp1(s: string): string {
	let out = '';
	for (let i = 0; i < s.length; i++) {
		const ch = s[i];
		if (CON.has(DEVA_TO_SLP.get(ch) ?? '') && C.some(([, d]) => d === ch)) {
			out += DEVA_TO_SLP.get(ch);
			const next = s[i + 1];
			if (next === VIRAMA) i++;
			else if (next && MATRAS.has(next)) {
				out += DEVA_TO_SLP.get(next);
				i++;
			} else out += 'a';
			continue;
		}
		out += DEVA_TO_SLP.get(ch) ?? ch;
	}
	return out;
}

// IAST → SLP1 (longest match first: "kh" before "k", "ai" before "a")
const IAST_TO_SLP = Object.entries(IAST)
	.filter(([s]) => s !== '~')
	.map(([s, i]) => [i, s] as [string, string])
	.sort((a, b) => b[0].length - a[0].length);

export function iastToSlp1(s: string): string {
	const t = s.normalize('NFC');
	let out = '';
	let i = 0;
	while (i < t.length) {
		const hit = IAST_TO_SLP.find(([iast]) => t.startsWith(iast, i));
		if (hit) {
			out += hit[1];
			i += hit[0].length;
		} else {
			out += t[i];
			i++;
		}
	}
	return out;
}

/** Accept Devanagari, IAST or SLP1 and return SLP1. */
export function toSlp1(s: string): string {
	const t = s.trim();
	if (/[ऀ-ॿ]/.test(t)) return devaToSlp1(t);
	if (/[āīūṛṝḷḹṅñṭḍṇśṣṃḥ]/.test(t)) return iastToSlp1(t);
	return t;
}
