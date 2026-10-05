import { error } from '@sveltejs/kit';
import { getCorpus, getTerms, stub } from '#lib/server/data.ts';
import { TABLES, resolveTable, tablesBasedOn } from '#lib/tables.ts';
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
	const termKeys = [...s.pc.flatMap((p) => p.parts.filter((part) => !part.it).map((part) => part.term)), ...s.an.map((x) => x.term), ...s.ad.map((x) => x.term)];
	for (const k of termKeys) if (k && termMap.has(k)) terms[k] = termMap.get(k)!;
	// an implied table (1.3.10), filled from the corpus
	const spec = TABLES[s.n];
	const table = spec ? resolveTable(spec, (n) => (byApn.has(n) ? corpus[byApn.get(n)!].pc : undefined)) : null;
	// tables whose rows or columns this sūtra defines (1.4.99–1.4.108) or which it licenses (1.3.10)
	const tableLinks = tablesBasedOn(s.n).map((t) => ({ id: byApn.get(t.sutra)!, title: t.title }));
	// stubs for every sūtra a term or link points to
	const refIds = new Set<string>([
		...s.an.map((x) => x.id),
		...s.ad.map((x) => x.id),
		...s.passesTo,
		...Object.values(terms).flatMap((t) => [...t.sutras.slice(0, 4), ...(t.usedIn ?? []).slice(0, 6)]),
		...(spec?.basis ?? []).map((b) => byApn.get(b.n)!),
		...tableLinks.map((t) => t.id)
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
		refs,
		table,
		tableLinks
	};
};
