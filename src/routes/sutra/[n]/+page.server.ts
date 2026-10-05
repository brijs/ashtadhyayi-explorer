import { error } from '@sveltejs/kit';
import { getCorpus, getTerms, stub } from '#lib/server/data.ts';
import type { Term } from '#lib/types.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => {
	const { corpus, order } = getCorpus();
	return order.map((id) => ({ n: corpus[id].n }));
};

export const load: PageServerLoad = ({ params }) => {
	const { corpus, byApn } = getCorpus();
	const id = byApn.get(params.n);
	if (!id) error(404, `No sūtra ${params.n}`);
	const s = corpus[id];

	const termMap = getTerms();
	const terms: Record<string, Term> = {};
	for (const p of s.pc) for (const part of p.parts) if (part.term && !part.it && termMap.has(part.term)) terms[part.term] = termMap.get(part.term)!;
	// stubs for every sūtra a term or link points to
	const refIds = new Set<string>([
		...s.an.map((x) => x.id),
		...s.ad.map((x) => x.id),
		...s.passesTo,
		...Object.values(terms).flatMap((t) => [...t.sutras.slice(0, 4), ...(t.usedIn ?? []).slice(0, 6)])
	]);
	if (s.prev) refIds.add(s.prev);
	if (s.next) refIds.add(s.next);
	if (s.scope) {
		refIds.add(s.scope.from);
		refIds.add(s.scope.to);
	}
	const refs = Object.fromEntries([...refIds].map((r) => [r, stub(r)]));

	return {
		sutra: s,
		terms,
		refs
	};
};
