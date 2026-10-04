import { getCorpus, stub } from '#lib/server/data.ts';
import type { PageServerLoad } from './$types';

// A small, hand-picked tour of landmark sūtras.
const LANDMARKS: { n: string; why: string }[] = [
	{ n: '1.1.1', why: 'The opening definition: ā, ai, au are called vṛddhi.' },
	{ n: '1.1.49', why: 'The 6th case means "in place of", the key to reading rules.' },
	{ n: '1.3.9', why: 'Marker letters (it) are deleted: metadata stripped after use.' },
	{ n: '1.4.2', why: 'When two rules conflict, the later one wins.' },
	{ n: '3.1.1', why: 'Heading: everything from here to 5.4 is a pratyaya (affix).' },
	{ n: '6.1.77', why: 'i, u, ṛ, ḷ become y, v, r, l before a vowel: dadhi + atra → dadhyatra.' },
	{ n: '8.2.1', why: 'The last three pādas are invisible to the rules before them.' },
	{ n: '8.4.68', why: 'The final sūtra: short a, treated as open (vivṛta) throughout the grammar, gets back its closed (saṃvṛta) sound.' }
];

export const load: PageServerLoad = () => {
	const { corpus, byApn } = getCorpus();
	const featured = corpus[byApn.get('6.1.77')!];
	return {
		landmarks: LANDMARKS.map((l) => ({ ...stub(byApn.get(l.n)!), why: l.why })),
		featured: { n: featured.n, s: featured.s, iast: featured.iast, pc: featured.pc, en: featured.en }
	};
};
