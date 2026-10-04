// Upadeśa items with their tags (anubandhas) and the sūtra that makes each one an it.
export type Seg = { t: string; it?: string; note?: string };
export type Item = { name: string; kind: string; segs: Seg[]; result: string };

export const ITEMS: Item[] = [
	{ name: 'शप्', kind: 'affix (vikaraṇa)', segs: [{ t: 'श्', it: '1.3.8', note: 'initial ś of a non-taddhita affix' }, { t: 'अ' }, { t: 'प्', it: '1.3.3', note: 'final consonant' }], result: 'अ' },
	{ name: 'तिप्', kind: 'personal ending', segs: [{ t: 'ति' }, { t: 'प्', it: '1.3.3', note: 'final consonant' }], result: 'ति' },
	{ name: 'क्त्वा', kind: 'kṛt affix', segs: [{ t: 'क्', it: '1.3.8', note: 'initial k-class of a non-taddhita affix' }, { t: 'त्वा' }], result: 'त्वा' },
	{ name: 'तृच्', kind: 'kṛt affix', segs: [{ t: 'तृ' }, { t: 'च्', it: '1.3.3', note: 'final consonant' }], result: 'तृ' },
	{ name: 'ण्वुल्', kind: 'kṛt affix', segs: [{ t: 'ण्', it: '1.3.7', note: 'initial ṭ-class of an affix' }, { t: 'वु' }, { t: 'ल्', it: '1.3.3', note: 'final consonant' }], result: 'वु (→ अक, 7.1.1)' },
	{ name: 'घञ्', kind: 'kṛt affix', segs: [{ t: 'घ्', it: '1.3.8', note: 'initial k-class of a non-taddhita affix' }, { t: 'अ' }, { t: 'ञ्', it: '1.3.3', note: 'final consonant' }], result: 'अ' },
	{ name: 'जस्', kind: 'case ending', segs: [{ t: 'ज्', it: '1.3.7', note: 'initial c-class of an affix' }, { t: 'अ' }, { t: 'स्', note: 'NOT a tag: 1.3.4 spares t-class, s, m at the end of case endings' }], result: 'अस्' },
	{ name: 'डुकृञ्', kind: 'root', segs: [{ t: 'डु', it: '1.3.5', note: 'initial ḍu of a root' }, { t: 'कृ' }, { t: 'ञ्', it: '1.3.3', note: 'final consonant' }], result: 'कृ' },
	{ name: 'एधँ', kind: 'root', segs: [{ t: 'एध्' }, { t: 'अँ', it: '1.3.2', note: 'nasalized vowel' }], result: 'एध्' }
];

export const IT_SUTRAS: Record<string, string> = {
	'1.3.2': 'उपदेशेऽजनुनासिक इत्',
	'1.3.3': 'हलन्त्यम्',
	'1.3.4': 'न विभक्तौ तुस्माः',
	'1.3.5': 'आदिर्ञिटुडवः',
	'1.3.7': 'चुटू',
	'1.3.8': 'लशक्वतद्धिते',
	'1.3.9': 'तस्य लोपः'
};
