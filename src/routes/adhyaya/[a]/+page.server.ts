import { error } from '@sveltejs/kit';
import { getCorpus } from '#lib/server/data.ts';
import { adhyayaSummary } from '#lib/server/engine-data.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => [1, 2, 3, 4, 5, 6, 7, 8].map((a) => ({ a: String(a) }));

export const load: PageServerLoad = ({ params }) => {
	const a = +params.a;
	if (!(a >= 1 && a <= 8)) error(404, 'Adhyāya not found');
	const { corpus, order } = getCorpus();
	const padas: { p: number; sutras: { id: string; n: string; k: number; s: string; en: string; ty: string[] }[] }[] = [1, 2, 3, 4].map((p) => ({ p, sutras: [] }));
	for (const id of order) {
		const s = corpus[id];
		if (s.a !== a) continue;
		padas[s.p - 1].sutras.push({ id, n: s.n, k: s.k, s: s.s, en: s.en, ty: [...new Set(s.types.map((t) => t.code))] });
	}
	// headings (adhikāras) that open in this adhyāya, to show as section markers
	const headings = new Set(order.filter((id) => corpus[id].a === a && corpus[id].scope && corpus[id].types.some((t) => t.code === 'AD')));
	return { a, padas, headings: [...headings], summary: adhyayaSummary(a) };
};
