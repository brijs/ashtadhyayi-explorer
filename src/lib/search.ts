// Client-side sūtra search. Loads the core list once and builds a MiniSearch index in the browser.
import MiniSearch from 'minisearch';
import { asset } from '$app/paths';
import { asciiDigits, looseKey } from '#lib/translit.ts';
import type { CoreSutra } from '#lib/types.ts';

let corePromise: Promise<CoreSutra[]> | null = null;
let indexPromise: Promise<{ ms: MiniSearch<CoreSutra>; byApn: Map<string, CoreSutra>; byId: Map<string, CoreSutra> }> | null = null;

export function loadCore(): Promise<CoreSutra[]> {
	corePromise ??= fetch(asset('data/sutras.core.json')).then((r) => {
		if (!r.ok) throw new Error(`sutras.core.json: ${r.status}`);
		return r.json();
	});
	return corePromise;
}

// Split on whitespace and punctuation; also index hyphenated words joined ("semi-vowels" → "semivowels").
function tokenize(text: string): string[] {
	const out: string[] = [];
	for (const raw of text.split(/[\s,;:.!?()[\]{}"“”‘’'।॥|/]+/u)) {
		if (!raw) continue;
		const parts = raw.split('-').filter(Boolean);
		out.push(...parts);
		if (parts.length > 1) out.push(parts.join(''));
	}
	return out;
}

export function getIndex() {
	indexPromise ??= loadCore().then((core) => {
		const ms = new MiniSearch<CoreSutra>({
			fields: ['s', 'e', 'en'],
			storeFields: ['id', 'n', 's', 'en', 'ty'],
			tokenize,
			processTerm: (t) => {
				const k = looseKey(t);
				return k.length ? k : null;
			},
			searchOptions: {
				boost: { s: 3, e: 2, en: 1 },
				prefix: (term) => term.length > 2,
				fuzzy: (term) => (term.length > 4 ? 0.2 : false),
				combineWith: 'AND'
			}
		});
		ms.addAll(core);
		return {
			ms,
			byApn: new Map(core.map((c) => [c.n, c])),
			byId: new Map(core.map((c) => [c.id, c]))
		};
	});
	return indexPromise;
}

export type Hit = CoreSutra & { exact?: boolean };

/** "6.1.77", "6 1 77", "61077", "६.१.७७" → the sūtra; otherwise full-text search. */
export async function search(query: string, limit = 30): Promise<Hit[]> {
	const q = asciiDigits(query.trim());
	if (!q) return [];
	const { ms, byApn, byId } = await getIndex();
	const num = q.match(/^(\d)[.\s:-]+(\d)[.\s:-]+(\d{1,3})$/);
	if (num) {
		const hit = byApn.get(`${num[1]}.${num[2]}.${+num[3]}`);
		if (hit) return [{ ...hit, exact: true }];
	}
	if (/^\d{5}$/.test(q) && byId.has(q)) return [{ ...byId.get(q)!, exact: true }];
	// partial numbers: "6.1" lists that pāda
	const partial = q.match(/^(\d)[.\s:-]+(\d)[.\s:-]*$/);
	if (partial) {
		const prefix = `${partial[1]}.${partial[2]}.`;
		return [...byApn.values()].filter((c) => c.n.startsWith(prefix)).slice(0, limit);
	}
	let results = ms.search(q);
	if (!results.length) results = ms.search(q, { combineWith: 'OR' });
	return results.slice(0, limit).map((r) => byId.get(r.id as string)!);
}
