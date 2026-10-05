// It-saṃjñā (anubandha detection), 1.3.2–1.3.8, over Devanagari upadeśas.
// Checked against vidyut for every dhātu and every sup/tiṅ affix by scripts/check-its.ts.
import { toVarnas, fromVarnas, isVowel, isConsonant } from './varna.ts';

/** What kind of upadeśa this is; the rules that apply depend on it. */
export type ItContext = 'dhatu' | 'pratyaya' | 'vibhakti' | 'taddhita' | 'agama' | 'other';

export const CONTEXTS: { id: ItContext; label: string; hint: string }[] = [
	{ id: 'dhatu', label: 'Dhātu', hint: 'a root from the Dhātupāṭha, e.g. डुकृञ्' },
	{ id: 'pratyaya', label: 'Affix (kṛt, vikaraṇa…)', hint: 'e.g. ण्वुल्, शप्, क्त्वा' },
	{ id: 'vibhakti', label: 'Case / verb ending', hint: 'sup or tiṅ (1.4.104), e.g. जस्, तिप्' },
	{ id: 'taddhita', label: 'Taddhita affix', hint: 'secondary noun affix, e.g. ष्यञ्, ठक्' },
	{ id: 'agama', label: 'Augment (āgama)', hint: 'e.g. इट्, नुँम्' },
	{ id: 'other', label: 'Other', hint: 'only 1.3.2 and 1.3.3 apply' }
];

/** One sound of the upadeśa. `it` is the sūtra that makes it an it; `kept` the one that prevents it. */
export type ItUnit = { v: string; it: string | null; kept?: string };

/** The sūtras (and one vārttika) that decide it-hood, in the order they appear. */
export const IT_RULES: Record<string, { s: string; en: string }> = {
	'1.3.2': { s: 'उपदेशेऽजनुनासिक इत्', en: 'A nasalised vowel in an upadeśa is an it.' },
	'1.3.3': { s: 'हलन्त्यम्', en: 'The final consonant of an upadeśa is an it.' },
	'1.3.3.1': { s: 'इर इत्संज्ञा वाच्या', en: 'Vārttika: a root-final इर् is an it as a whole.' },
	'1.3.4': { s: 'न विभक्तौ तुस्माः', en: 'But in a case or verb ending, a final t-row consonant, स् or म् is not.' },
	'1.3.5': { s: 'आदिर्ञिटुडवः', en: 'Initial ञि, टु and डु (of a root) are its.' },
	'1.3.6': { s: 'षः प्रत्ययस्य', en: 'The initial ष् of an affix is an it.' },
	'1.3.7': { s: 'चुटू', en: 'The initial c-row and ṭ-row consonants of an affix are its.' },
	'1.3.8': { s: 'लशक्वतद्धिते', en: 'The initial ल्, श् and k-row consonants of an affix are its, unless it is a taddhita.' },
	'1.3.9': { s: 'तस्य लोपः', en: 'An it is deleted.' }
};

const NASAL = 'ँ';
const TU = new Set(['त्', 'थ्', 'द्', 'ध्', 'न्']);
const CU = new Set(['च्', 'छ्', 'ज्', 'झ्', 'ञ्']);
const TTU = new Set(['ट्', 'ठ्', 'ड्', 'ढ्', 'ण्']);
const KU = new Set(['क्', 'ख्', 'ग्', 'घ्', 'ङ्']);
// Initial sounds of taddhitas that are replaced rather than dropped (7.1.2 आयनेयीनीयियः फढखछघां प्रत्ययादीनाम्, 7.3.50 ठस्येकः).
const TADDHITA_REPLACED: Record<string, string> = { 'फ्': '7.1.2', 'ढ्': '7.1.2', 'ख्': '7.1.2', 'छ्': '7.1.2', 'घ्': '7.1.2', 'ठ्': '7.3.50' };

/** Split a Devanagari upadeśa into sounds and mark which are its. */
export function detectIts(upadesha: string, ctx: ItContext): ItUnit[] {
	const units: ItUnit[] = [];
	for (const v of toVarnas(upadesha.trim())) {
		if (v === NASAL && units.length && isVowel(units.at(-1)!.v)) units.at(-1)!.v += NASAL;
		else if (isVowel(v) || isConsonant(v) || v === 'ं' || v === 'ः') units.push({ v, it: null });
	}
	if (!units.length) return units;
	const mark = (i: number, code: string) => {
		if (units[i] && !units[i].it && !units[i].kept) units[i].it = code;
	};
	const isAffix = ctx === 'pratyaya' || ctx === 'vibhakti' || ctx === 'taddhita';
	const last = units.length - 1;

	// vārttika on 1.3.3: root-final इर्
	if (ctx === 'dhatu' && last >= 2 && units[last].v === 'र्' && units[last - 1].v.startsWith('इ') && units[last - 1].v.endsWith(NASAL)) {
		mark(last - 1, '1.3.3.1');
		mark(last, '1.3.3.1');
	}
	// 1.3.5: initial ञि टु डु of a root
	if (ctx === 'dhatu' && units.length > 2) {
		const pair = units[0].v + units[1].v;
		if (pair === 'ञ्इ' || pair === 'ट्उ' || pair === 'ड्उ') {
			mark(0, '1.3.5');
			mark(1, '1.3.5');
		}
	}
	// 1.3.6–1.3.8: the initial sound of an affix
	if (isAffix && units.length > 1) {
		const v = units[0].v;
		if (ctx === 'taddhita' && TADDHITA_REPLACED[v]) units[0].kept = TADDHITA_REPLACED[v];
		else if (ctx === 'vibhakti' && v === 'झ्') units[0].kept = '7.1.3';
		else if (v === 'ष्') mark(0, '1.3.6');
		else if (CU.has(v) || TTU.has(v)) mark(0, '1.3.7');
		else if (ctx !== 'taddhita' && (v === 'ल्' || v === 'श्' || KU.has(v))) mark(0, '1.3.8');
	}
	// 1.3.3 (blocked by 1.3.4 in vibhaktis)
	if (isConsonant(units[last].v) && units.length > 1) {
		if (ctx === 'vibhakti' && (TU.has(units[last].v) || units[last].v === 'स्' || units[last].v === 'म्')) units[last].kept = '1.3.4';
		else mark(last, '1.3.3');
	}
	// 1.3.2: nasalised vowels
	units.forEach((u, i) => u.v.endsWith(NASAL) && mark(i, '1.3.2'));
	return units;
}

/** What is left after 1.3.9 deletes the its. */
export const stripIts = (units: ItUnit[]) => fromVarnas(units.filter((u) => !u.it).map((u) => u.v));

/** Name of the marker as used in the grammar: क् → "kit", डु → "ḍvit", इँ → "idit". */
export function itName(units: ItUnit[], i: number): string | null {
	const u = units[i];
	if (!u?.it) return null;
	if (u.it === '1.3.5') return units[0].v === 'ञ्' ? 'ñīt' : units[0].v === 'ट्' ? 'ṭvit' : 'ḍvit';
	if (u.it === '1.3.3.1') return 'irit';
	return EFFECT_KEY[u.v] ?? null;
}

const EFFECT_KEY: Record<string, string> = {
	'क्': 'kit', 'ङ्': 'ṅit', 'ञ्': 'ñit', 'ण्': 'ṇit', 'प्': 'pit', 'श्': 'śit', 'ल्': 'lit', 'च्': 'cit',
	'ट्': 'ṭit', 'म्': 'mit', 'ष्': 'ṣit', 'इँ': 'idit', 'ईँ': 'īdit', 'उँ': 'udit', 'ऊँ': 'ūdit', 'ऋँ': 'ṛdit',
	'ऌँ': 'ḷdit', 'आँ': 'ādit'
};

/** What each kind of marker does elsewhere in the grammar. Sūtra texts are checked against the corpus. */
export const IT_EFFECTS: Record<string, { sutra: string; en: string }[]> = {
	kit: [{ sutra: '1.1.5', en: 'blocks guṇa and vṛddhi of the preceding stem' }, { sutra: '1.1.46', en: 'an augment marked with क् attaches at the end' }],
	ṅit: [{ sutra: '1.1.5', en: 'blocks guṇa and vṛddhi' }, { sutra: '1.1.53', en: 'a ṅ-marked substitute replaces only the final sound' }, { sutra: '1.3.12', en: 'a root marked with ṅ takes ātmanepada endings' }],
	ñit: [{ sutra: '7.2.115', en: 'causes vṛddhi of a stem-final vowel' }, { sutra: '1.3.72', en: 'a root marked with ñ takes ātmanepada when the fruit goes to the agent' }],
	ṇit: [{ sutra: '7.2.115', en: 'causes vṛddhi of a stem-final vowel' }, { sutra: '7.2.116', en: 'and of a penultimate अ' }],
	pit: [{ sutra: '3.1.4', en: 'the affix is unaccented (anudātta)' }],
	śit: [{ sutra: '3.4.113', en: 'the affix is sārvadhātuka' }],
	lit: [{ sutra: '6.1.193', en: 'the accent falls on the syllable before the affix' }],
	cit: [{ sutra: '6.1.163', en: 'the word is accented on its last syllable' }],
	ṭit: [{ sutra: '1.1.46', en: 'an augment marked with ट् attaches at the beginning' }],
	mit: [{ sutra: '1.1.47', en: 'attaches after the last vowel' }],
	ṣit: [{ sutra: '4.1.41', en: 'the feminine takes ङीष्' }],
	idit: [{ sutra: '7.1.58', en: 'the root takes the augment नुँम्' }],
	īdit: [{ sutra: '7.2.14', en: 'no इट् before the niṣṭhā affixes' }],
	ādit: [{ sutra: '7.2.16', en: 'no इट् before the niṣṭhā affixes' }],
	udit: [{ sutra: '7.2.56', en: 'optional इट् before क्त्वा' }],
	ūdit: [{ sutra: '7.2.44', en: 'optional इट्' }],
	ṛdit: [{ sutra: '7.4.2', en: 'no shortening of the penultimate before the causative' }],
	ḷdit: [{ sutra: '3.1.55', en: 'the aorist takes अङ् (in parasmaipada)' }],
	irit: [{ sutra: '3.1.57', en: 'the aorist optionally takes अङ्' }],
	ñīt: [{ sutra: '3.2.187', en: 'क्त in the present sense' }],
	ṭvit: [{ sutra: '3.3.89', en: 'takes the kṛt affix अथुच्' }],
	ḍvit: [{ sutra: '3.3.88', en: 'takes the kṛt affix क्त्रि' }]
};
