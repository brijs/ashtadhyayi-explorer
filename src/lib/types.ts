import type { ItContext } from './it.ts';

export type Role =
	| 'target' | 'subject' | 'left' | 'right' | 'nom' | 'gen' | 'abl' | 'loc'
	| 'object' | 'instrument' | 'purpose' | 'avyaya' | 'verb' | 'unknown';

/** One member of a pada. `it`: the part is an upadeśa whose it-letters can be shown (checked against vidyut at
 * build time); `u` its upadeśa spelling when it differs from `w` (nasal vowels marked, case ending removed);
 * `end` the case ending that `w` adds to it. */
export type PadaPart = { w: string; term?: string; it?: ItContext; u?: string; end?: string };
export type Pada = { w: string; iast: string; kind: 'S' | 'T'; vib: string; vac: string; role: Role; parts: PadaPart[] };
/** A word carried in from another sūtra; `term` is the saṃjñā or pratyāhāra it names, as tagged in that sūtra. */
export type WordRef = { w: string; iast: string; id: string; term?: string };
export type SutraType = { code: 'V' | 'S' | 'P' | 'AD' | 'AT'; label: string };

export type Prayoga = { word: string; text: string; loc: string; url: string; pada: string; ref: string };

export type FullSutra = {
	id: string;
	n: string;
	a: number;
	p: number;
	k: number;
	s: string;
	iast: string;
	types: SutraType[];
	pc: Pada[];
	an: WordRef[];
	ad: WordRef[];
	ss: string;
	ssIast: string;
	en: string;
	enVasu: string;
	kashika: string;
	kaumudi: string;
	vartikas: string[];
	prayogas: Prayoga[];
	skn: number | null;
	lskn: number | null;
	prev: string | null;
	next: string | null;
	passesTo: string[];
	scope: { from: string; to: string; count: number } | null;
	/** live derivations (vidyut) in which this sūtra applies: word, debugger hash, description */
	examples?: { w: string; h: string; d: string }[];
};

/** Minimal sūtra info used in lists and links. */
export type SutraStub = { id: string; n: string; s: string; en: string };

/** Client-side core record (static/data/sutras.core.json). */
export type CoreSutra = { id: string; n: string; s: string; e: string; ty: SutraType['code'][]; en: string };

export type Term = {
	key: string;
	iast: string;
	kind: 'samjna' | 'pratyahara';
	sutras: string[];
	letters?: string[];
	en?: string;
	usedIn?: string[];
};

export const TYPE_INFO: Record<SutraType['code'], { en: string; sa: string; iast: string; blurb: string }> = {
	V: { en: 'Operational rule', sa: 'विधिः', iast: 'vidhi', blurb: 'Prescribes an operation: a substitution, an affix, an augment, an accent.' },
	S: { en: 'Definition', sa: 'संज्ञा', iast: 'saṃjñā', blurb: 'Defines a technical term used by other rules.' },
	P: { en: 'Meta-rule', sa: 'परिभाषा', iast: 'paribhāṣā', blurb: 'Tells you how to read and apply the other rules.' },
	AD: { en: 'Heading', sa: 'अधिकारः', iast: 'adhikāra', blurb: 'A heading whose words carry into a block of following rules.' },
	AT: { en: 'Extension', sa: 'अतिदेशः', iast: 'atideśa', blurb: 'Treats one thing as if it were another, extending its properties.' }
};

export const ROLE_INFO: Record<Role, { label: string; short: string; explain: string }> = {
	target: {
		label: 'Target',
		short: 'in place of',
		explain: 'Ṣaṣṭhī (6th case): names what gets replaced, "in place of X" (1.1.49 षष्ठी स्थानेयोगा).'
	},
	subject: {
		label: 'Substitute / term',
		short: 'becomes',
		explain: 'Prathamā (1st case): in operational rules, the substitute or the thing introduced; in definitions, the term or its referent.'
	},
	left: {
		label: 'Left context',
		short: 'after',
		explain: 'Pañcamī (5th case): "after X", the operation applies to what follows (1.1.67 तस्मादित्युत्तरस्य). Also used for limits and sources.'
	},
	right: {
		label: 'Right context',
		short: 'before',
		explain: 'Saptamī (7th case): "when X follows", the operation applies to what precedes (1.1.66 तस्मिन्निति निर्दिष्टे पूर्वस्य). Also a condition or domain ("in the sense of").'
	},
	nom: { label: 'Term / subject', short: '', explain: 'Prathamā (1st case): the term being defined, or the subject of the statement.' },
	gen: { label: 'Of', short: 'of', explain: 'Ṣaṣṭhī (6th case): "of X". In this kind of sūtra it marks a relation, not a substitution.' },
	abl: { label: 'From / after', short: 'from', explain: 'Pañcamī (5th case): "from X" or "after X"; in headings, often the limit of their scope.' },
	loc: { label: 'In / when', short: 'in', explain: 'Saptamī (7th case): "in X" or "when X", a domain or condition.' },
	object: { label: 'Object', short: 'object', explain: 'Dvitīyā (2nd case).' },
	instrument: { label: 'With / by', short: 'with', explain: 'Tṛtīyā (3rd case): accompaniment or means.' },
	purpose: { label: 'For', short: 'for', explain: 'Caturthī (4th case).' },
	avyaya: { label: 'Indeclinable', short: 'particle', explain: 'An avyaya such as च "and", वा "optionally", न "not".' },
	verb: { label: 'Verb', short: 'verb', explain: 'A finite verb form (tiṅanta).' },
	unknown: { label: 'Word', short: '', explain: 'Case not marked in the source data.' }
};

export const VIBHAKTI_NAME: Record<string, string> = {
	'1': 'prathamā', '2': 'dvitīyā', '3': 'tṛtīyā', '4': 'caturthī', '5': 'pañcamī', '6': 'ṣaṣṭhī', '7': 'saptamī', '0': 'avyaya'
};
export const VACANA_NAME: Record<string, string> = { '1': 'ekavacana', '2': 'dvivacana', '3': 'bahuvacana' };
