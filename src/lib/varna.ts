// Varṇa (phoneme) segmentation for Devanagari and the Śiva sūtras / pratyāhāra machinery.
// Varṇas are written in their independent forms: vowels as 'इ', consonants with virāma as 'क्'.

const MATRA_TO_VOWEL: Record<string, string> = {
	'ा': 'आ', 'ि': 'इ', 'ी': 'ई', 'ु': 'उ', 'ू': 'ऊ', 'ृ': 'ऋ', 'ॄ': 'ॠ',
	'ॢ': 'ऌ', 'ॣ': 'ॡ', 'े': 'ए', 'ै': 'ऐ', 'ो': 'ओ', 'ौ': 'औ'
};
const VOWEL_TO_MATRA: Record<string, string> = Object.fromEntries(
	Object.entries(MATRA_TO_VOWEL).map(([m, v]) => [v, m])
);
export const VOWELS = ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ॠ', 'ऌ', 'ॡ', 'ए', 'ऐ', 'ओ', 'औ'];
const VOWEL_SET = new Set(VOWELS);
const VIRAMA = '्';

export const isConsonantChar = (ch: string) => ch >= 'क' && ch <= 'ह' || ch === 'ळ';
export const isVowel = (v: string) => VOWEL_SET.has(v);
export const isConsonant = (v: string) => v.length === 2 && v[1] === VIRAMA && isConsonantChar(v[0]);

/** "दधि" → ["द्","अ","ध्","इ"]. Non-letters (spaces, +, ं, ः, ३) are kept as their own tokens. */
export function toVarnas(dev: string): string[] {
	const out: string[] = [];
	for (let i = 0; i < dev.length; i++) {
		const ch = dev[i];
		if (isConsonantChar(ch)) {
			out.push(ch + VIRAMA);
			const next = dev[i + 1];
			if (next === VIRAMA) i++;
			else if (next && MATRA_TO_VOWEL[next]) {
				out.push(MATRA_TO_VOWEL[next]);
				i++;
			} else out.push('अ');
		} else if (/[़॒॑]/.test(ch)) {
			continue;
		} else out.push(ch);
	}
	return out;
}

/** Inverse of toVarnas. */
export function fromVarnas(vs: string[]): string {
	let out = '';
	for (let i = 0; i < vs.length; i++) {
		const v = vs[i];
		if (isConsonant(v)) {
			const next = vs[i + 1];
			if (next && isVowel(next)) {
				out += v[0] + (next === 'अ' ? '' : VOWEL_TO_MATRA[next]);
				i++;
			} else out += v;
		} else out += v;
	}
	return out;
}

/** Display form of a varṇa: consonants get the uccāraṇa 'a' (क्→क) when `pronounce` is set. */
export const showVarna = (v: string, pronounce = false) => (pronounce && isConsonant(v) ? v[0] : v);

// The fourteen Māheśvara (Śiva) sūtras. The last item of each line is the it-marker.
export const SHIVA_SUTRAS: string[][] = [
	['अ', 'इ', 'उ', 'ण्'],
	['ऋ', 'ऌ', 'क्'],
	['ए', 'ओ', 'ङ्'],
	['ऐ', 'औ', 'च्'],
	['ह्', 'य्', 'व्', 'र्', 'ट्'],
	['ल्', 'ण्'],
	['ञ्', 'म्', 'ङ्', 'ण्', 'न्', 'म्'],
	['झ्', 'भ्', 'ञ्'],
	['घ्', 'ढ्', 'ध्', 'ष्'],
	['ज्', 'ब्', 'ग्', 'ड्', 'द्', 'श्'],
	['ख्', 'फ्', 'छ्', 'ठ्', 'थ्', 'च्', 'ट्', 'त्', 'व्'],
	['क्', 'प्', 'य्'],
	['श्', 'ष्', 'स्', 'र्'],
	['ह्', 'ल्']
];

export type ShivaSlot = { varna: string; line: number; pos: number; isIt: boolean };

/** Flattened sequence of all 56 slots (42 letters + 14 markers). */
export const SHIVA_FLAT: ShivaSlot[] = SHIVA_SUTRAS.flatMap((line, li) =>
	line.map((varna, pos) => ({ varna, line: li, pos, isIt: pos === line.length - 1 }))
);

/** Letters from the first occurrence of `first` (as a letter) up to the it-marker `it`.
 *  `itOccurrence` picks which marker when it repeats (ण् marks lines 1 and 6). */
export function pratyahara(first: string, it: string, itOccurrence = 1): { letters: string[]; startIdx: number; endIdx: number } | null {
	const startIdx = SHIVA_FLAT.findIndex((s) => !s.isIt && s.varna === first);
	if (startIdx < 0) return null;
	let seen = 0;
	for (let i = startIdx; i < SHIVA_FLAT.length; i++) {
		const s = SHIVA_FLAT[i];
		if (s.isIt && s.varna === it && ++seen === itOccurrence) {
			const letters = SHIVA_FLAT.slice(startIdx, i).filter((x) => !x.isIt).map((x) => x.varna);
			return { letters, startIdx, endIdx: i };
		}
	}
	return null;
}

/** Split a pratyāhāra name like "यण्" into [first letter, it-marker]. */
export function splitPratyaharaName(name: string): [string, string] | null {
	const vs = toVarnas(name);
	if (vs.length < 2) return null;
	const it = vs[vs.length - 1];
	if (!isConsonant(it)) return null;
	// first letter: consonants in names carry an uccāraṇa 'a' (हल् = ह्+अ+ल्)
	const first = vs[0];
	return [first, it];
}

/** Slot indices of the letters (not markers) from slot `start` up to marker slot `end`. */
export function rangeSlots(start: number, end: number): number[] {
	const out: number[] = [];
	for (let i = start; i < end; i++) if (!SHIVA_FLAT[i].isIt) out.push(i);
	return out;
}

/** Name of the pratyāhāra from letter slot `start` and marker slot `end`, e.g. अ + च् → अच्, ह + ल् → हल्. */
export function pratyaharaName(start: number, end: number): string {
	const first = SHIVA_FLAT[start].varna;
	return (isConsonant(first) ? first[0] : first) + SHIVA_FLAT[end].varna;
}
