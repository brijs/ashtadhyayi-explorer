// Devanagari → IAST transliteration and a script-agnostic "loose key" used for search.
// Dependency-free so it can run in the browser and in the Node build scripts.

const VOWELS: Record<string, string> = {
	'अ': 'a', 'आ': 'ā', 'इ': 'i', 'ई': 'ī', 'उ': 'u', 'ऊ': 'ū', 'ऋ': 'ṛ', 'ॠ': 'ṝ',
	'ऌ': 'ḷ', 'ॡ': 'ḹ', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au'
};

const MATRAS: Record<string, string> = {
	'ा': 'ā', 'ि': 'i', 'ी': 'ī', 'ु': 'u', 'ू': 'ū', 'ृ': 'ṛ', 'ॄ': 'ṝ', 'ॢ': 'ḷ',
	'ॣ': 'ḹ', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au'
};

const CONSONANTS: Record<string, string> = {
	'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ṅ',
	'च': 'c', 'छ': 'ch', 'ज': 'j', 'झ': 'jh', 'ञ': 'ñ',
	'ट': 'ṭ', 'ठ': 'ṭh', 'ड': 'ḍ', 'ढ': 'ḍh', 'ण': 'ṇ',
	'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
	'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
	'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
	'श': 'ś', 'ष': 'ṣ', 'स': 's', 'ह': 'h', 'ळ': 'ḻ'
};

const OTHERS: Record<string, string> = {
	'ं': 'ṃ', 'ः': 'ḥ', 'ँ': 'm̐', 'ऽ': "'", '।': '|', '॥': '||', 'ॐ': 'oṃ',
	'०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
};

const VIRAMA = '्';
// Vedic accents, nukta, joiners: dropped.
const IGNORED = /[़॒॑॓॔‌‍᳐-᳿]/g;

export const DEVANAGARI_RE = /[ऀ-ॿ]/;

export function devaToIast(input: string): string {
	const s = input.replace(IGNORED, '');
	let out = '';
	for (let i = 0; i < s.length; i++) {
		const ch = s[i];
		const c = CONSONANTS[ch];
		if (c !== undefined) {
			out += c;
			const next = s[i + 1];
			if (next === VIRAMA) i++;
			else if (next !== undefined && MATRAS[next] !== undefined) {
				out += MATRAS[next];
				i++;
			} else out += 'a';
			continue;
		}
		out += VOWELS[ch] ?? MATRAS[ch] ?? OTHERS[ch] ?? ch;
	}
	return out;
}

/** Convert Devanagari digits in a string (e.g. "६.१.७७") to ASCII. */
export function asciiDigits(s: string): string {
	return s.replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - 0x0966));
}

const CONS_LOOSE = 'bcdfghjklmnpqrstvwxyz';

/**
 * A lossy, script-agnostic key so that "इको यणचि", "iko yaṇaci", "iko yanaci",
 * Harvard-Kyoto "iko yaNaci" and ashtadhyayi.com's "ikoyanachi" all collide.
 */
export function looseKey(input: string): string {
	let s = DEVANAGARI_RE.test(input) ? devaToIast(input) : input;
	s = s
		.toLowerCase()
		.replace(/m̐/g, 'm')
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/z/g, 's')
		.replace(/sh/g, 's')
		.replace(/ch/g, 'c')
		.replace(/w/g, 'v')
		.replace(/aa/g, 'a')
		.replace(/(ii|ee)/g, 'i')
		.replace(/(uu|oo)/g, 'u')
		.replace(/rr+/g, 'r')
		.replace(/'/g, '');
	// ṛ is often written ri / ru between consonants ("vruddhi", "kritya").
	s = s.replace(new RegExp(`([${CONS_LOOSE}])r[iu](?=[${CONS_LOOSE}])`, 'g'), '$1r');
	return s;
}
