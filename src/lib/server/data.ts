// Server-only access to the generated sūtra corpus (used during prerendering).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { FullSutra, SutraStub, Term } from '#lib/types.ts';

let corpus: Record<string, FullSutra> | null = null;
let order: string[] = [];
let byApn: Map<string, string> = new Map();
let terms: Map<string, Term> | null = null;

function root() {
	return process.cwd();
}

export function getCorpus() {
	if (!corpus) {
		corpus = JSON.parse(readFileSync(join(root(), 'generated', 'sutras.full.json'), 'utf8')) as Record<string, FullSutra>;
		order = Object.keys(corpus).sort((a, b) => +a - +b);
		byApn = new Map(order.map((id) => [corpus![id].n, id]));
	}
	return { corpus, order, byApn };
}

export function getTerms() {
	if (!terms) {
		const list = JSON.parse(readFileSync(join(root(), 'static', 'data', 'terms.json'), 'utf8')) as Term[];
		terms = new Map(list.map((t) => [t.key, t]));
	}
	return terms;
}

export function stub(id: string): SutraStub {
	const s = getCorpus().corpus[id];
	return { id, n: s.n, s: s.s, en: s.en };
}
