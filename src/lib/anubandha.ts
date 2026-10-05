// Pick lists for the it-letter finder. Each upadeśa is spelt as vidyut spells it (nasal vowels marked with ँ),
// and scripts/check-its.ts verifies that vidyut introduces it by the sūtra given in `by` and deletes
// exactly the sounds our detector marks. (Sup and tiṅ come straight from 4.1.2 and 3.4.78.)
import type { ItContext } from './it.ts';

export type Pick = { u: string; by: string };
export type PickGroup = { id: string; label: string; ctx: ItContext; blurb: string; items: Pick[] };

const p = (list: string): Pick[] =>
	list.split(/\s+/).filter(Boolean).map((x) => {
		const [u, by] = x.split('@');
		return { u, by };
	});

export const PICK_GROUPS: PickGroup[] = [
	{
		id: 'krt',
		label: 'Kṛt affixes',
		ctx: 'pratyaya',
		blurb: 'Primary affixes added to roots (3.1.91 onward).',
		items: p(
			'ण्वुल्@3.1.133 तृच्@3.1.133 क्त@3.2.102 क्तवतुँ@3.2.102 क्त्वा@3.4.21 ल्यप्@7.1.37 तुमुँन्@3.3.10 तव्यत्@3.1.96 अनीयर्@3.1.96 ' +
				'यत्@3.1.97 ण्यत्@3.1.125 क्यप्@3.1.107 घञ्@3.3.24 ल्युट्@3.3.115 क्तिन्@3.3.94 शतृँ@3.2.124 शानच्@3.2.124 क्विँप्@3.2.76 ' +
				'अण्@3.2.1 अच्@3.1.134.1 ष्वुन्@3.1.145 णमुँल्@3.4.22 णिनिँ@3.2.78 खल्@3.3.126 ष्ट्रन्@3.2.182 क्वसुँ@3.2.107 कानच्@3.2.106'
		)
	},
	{
		id: 'vikarana',
		label: 'Vikaraṇas & sanādi',
		ctx: 'pratyaya',
		blurb: 'Affixes between a root and its ending, and the derivational affixes of 3.1.',
		items: p('शप्@3.1.68 श्यन्@3.1.69 श्नु@3.1.73 श@3.1.77 श्ना@3.1.81 यक्@3.1.67 सिँच्@3.1.44 चिण्@3.1.66 अङ्@3.1.57 चङ्@3.1.48 तासिँ@3.1.33 सिँप्@3.1.34 णिच्@3.1.26 सन्@3.1.7 यङ्@3.1.22')
	},
	{
		id: 'lakara',
		label: 'Lakāras',
		ctx: 'pratyaya',
		blurb: 'The ten tense and mood markers; their ल् survives for 3.4.77.',
		items: p('लँट्@3.2.123 लिँट्@3.2.115 लुँट्@3.3.15 लृँट्@3.3.13 लेँट्@3.4.7 लोँट्@3.3.162 लङ्@3.2.111 लिँङ्@3.3.173 लुँङ्@3.2.110 लृँङ्@3.3.139')
	},
	{
		id: 'taddhita',
		label: 'Taddhitas',
		ctx: 'taddhita',
		blurb: 'Secondary affixes added to nouns (4.1.76 onward), where 1.3.8 does not apply.',
		items: p(
			'अण्@4.1.92 इञ्@4.1.95 अञ्@4.1.168 यञ्@4.1.105 ठक्@4.2.45 ठञ्@4.3.79 ढक्@4.1.123 ढञ्@5.1.10 फक्@4.1.99 खञ्@5.2.1 छस्@4.2.115 ' +
				'मतुँप्@5.2.94 तसिँल्@5.3.7 त्रल्@5.3.13 तल्@5.1.119 तमप्@5.3.55 तरप्@5.3.57 इष्ठन्@5.3.55 ईयसुँन्@5.3.57 मयट्@5.4.21 ष्ठन्@4.4.10 च्विँ@5.4.50'
		)
	},
	{
		id: 'agama',
		label: 'Augments',
		ctx: 'agama',
		blurb: 'Āgamas: sounds inserted into a form. Only 1.3.2 and 1.3.3 apply to them.',
		items: p('इट्@7.2.35 तुँक्@6.1.71 आट्@6.4.72 अट्@6.4.71 युँक्@7.3.33 मुँक्@7.2.82 वुँक्@6.4.88 रुँट्@7.1.6 नुँट्@7.1.54 ईट्@7.3.96 पुँक्@7.3.36')
	}
];

/** Spelling variants learners will type: the conventional spelling without the nasal mark. */
export const plainSpelling = (u: string) => u.replace(/ँ/g, '');
