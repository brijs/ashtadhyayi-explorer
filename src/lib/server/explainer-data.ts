// Per-explainer data, computed at prerender time from the generated corpus.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getCorpus } from './data.ts';

type Loader = () => unknown;

const readStatic = (f: string) => JSON.parse(readFileSync(join(process.cwd(), 'static', 'data', f), 'utf8'));

const stubN = (n: string) => {
	const { corpus, byApn } = getCorpus();
	const s = corpus[byApn.get(n)!];
	return { n: s.n, s: s.s, iast: s.iast, en: s.en };
};

const LOADERS: Record<string, Loader> = {
	'shiva-sutras': () => {
		const { corpus } = getCorpus();
		const list: { name: string; sutras: string[] }[] = readStatic('pratyahara.json');
		const terms: { key: string; usedIn?: string[] }[] = readStatic('terms.json');
		const usage = new Map(terms.map((t) => [t.key, t.usedIn ?? []]));
		return {
			attested: list.filter((p, i) => list.findIndex((q) => q.name === p.name) === i).map((p) => {
				const ids = [...new Set([...p.sutras, ...(usage.get(p.name) ?? [])])];
				return { name: p.name, sutras: ids.slice(0, 3).map((id) => ({ n: corpus[id].n, s: corpus[id].s })) };
			})
		};
	},
	anatomy: () => ({ s: ['6.1.77', '1.1.49', '1.1.66', '1.1.67', '6.1.101', '1.1.50'].map(stubN) }),
	anuvritti: () => {
		const { corpus, order, byApn } = getCorpus();
		const full = (n: string) => {
			const s = corpus[byApn.get(n)!];
			return { n: s.n, s: s.s, iast: s.iast, en: s.en, pc: s.pc.map((p) => p.w), an: s.an.map((x) => ({ w: x.w, n: corpus[x.id].n })), ad: s.ad.map((x) => ({ w: x.w, n: corpus[x.id].n })), ss: s.ss };
		};
		// the stretch of 6.1 where अचि (from 6.1.77) flows down
		const aciFrom = byApn.get('6.1.77')!;
		const river = order
			.filter((id) => corpus[id].a === 6 && corpus[id].p === 1 && corpus[id].k >= 72 && corpus[id].k <= 112)
			.map((id) => {
				const s = corpus[id];
				return { n: s.n, s: s.s, en: s.en, aci: s.an.some((x) => x.id === aciFrom) || id === aciFrom, an: s.an.map((x) => ({ w: x.w, n: corpus[x.id].n })) };
			});
		// heading spans, positioned on a 0..1 scale over the whole text
		const pos = new Map(order.map((id, i) => [id, i / (order.length - 1)]));
		const adhyayaStarts = [1, 2, 3, 4, 5, 6, 7, 8].map((a) => pos.get(order.find((id) => corpus[id].a === a)!)!);
		const headings = ['1.4.1', '2.1.3', '3.1.1', '3.1.91', '4.1.1', '4.1.76', '6.1.72', '6.4.1', '8.1.16', '8.2.1'].map((n) => {
			const id = byApn.get(n)!;
			const sc = corpus[id].scope!;
			return { n, s: corpus[id].s, en: corpus[id].en, from: corpus[sc.from].n, to: corpus[sc.to].n, count: sc.count, x0: pos.get(sc.from)!, x1: pos.get(sc.to)! };
		});
		return { s77: full('6.1.77'), s78: full('6.1.78'), s68: full('3.1.68'), s67: full('3.1.67'), river, headings, adhyayaStarts, total: order.length };
	}
};

export function explainerData(slug: string) {
	return LOADERS[slug]?.() ?? {};
}
