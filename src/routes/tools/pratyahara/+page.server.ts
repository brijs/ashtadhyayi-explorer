import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getCorpus } from '#lib/server/data.ts';
import type { PageServerLoad } from './$types';

type P = { name: string; iast: string; letters: string[]; computedMatches: boolean; sutras: string[] };
type T = { key: string; usedIn?: string[] };

export const load: PageServerLoad = () => {
	const read = (f: string) => JSON.parse(readFileSync(join(process.cwd(), 'static', 'data', f), 'utf8'));
	const list: P[] = read('pratyahara.json');
	const usage = new Map((read('terms.json') as T[]).map((t) => [t.key, t.usedIn ?? []]));
	const { corpus } = getCorpus();
	// अण् and इण् are listed with their long reading (to the second ण्); they are still Śiva-sūtra pratyāhāras.
	const SHIVA_EXTRA = new Set(['अण्', 'इण्']);
	return {
		items: list.map((p, idx) => {
			// अण् is listed twice (to the 1st and to the 2nd ण्); word-level usage belongs to the common short reading
			const long = list.findIndex((q) => q.name === p.name) !== idx;
			const ids = long ? p.sutras : [...new Set([...p.sutras, ...(usage.get(p.name) ?? [])])];
			return {
				key: long ? `${p.name}-long` : p.name,
				long,
				name: p.name,
				iast: p.iast,
				letters: p.letters,
				shiva: p.computedMatches || SHIVA_EXTRA.has(p.name),
				uses: ids.length,
				sutras: ids.slice(0, 5).map((id) => ({ n: corpus[id].n, s: corpus[id].s }))
			};
		})
	};
};
