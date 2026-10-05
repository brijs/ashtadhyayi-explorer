import { getCorpus } from '#lib/server/data.ts';
import type { PageServerLoad } from './$types';

// The sup and tiṅ lists exactly as 4.1.2 and 3.4.78 give them (checked against vidyut by scripts/check-its.ts).
export const load: PageServerLoad = () => {
	const { corpus, byApn } = getCorpus();
	const parts = (n: string) => corpus[byApn.get(n)!].pc[0].parts.map((p) => p.w);
	return { sup: parts('4.1.2'), tin: parts('3.4.78') };
};
