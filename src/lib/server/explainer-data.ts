// Per-explainer data, computed at prerender time from the generated corpus.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { getCorpus } from './data.ts';
import { slp1ToDeva } from '#lib/slp1.ts';

type Loader = () => unknown | Promise<unknown>;

/** vidyut in Node, for derivations shown inside lessons (computed at prerender time). */
async function vidyutNode() {
	const dir = join(process.cwd(), 'static', 'wasm');
	const mod = await import(/* @vite-ignore */ pathToFileURL(join(dir, 'vidyut_prakriya.js')).href);
	await mod.default({ module_or_path: readFileSync(join(dir, 'vidyut_prakriya_bg.wasm')) });
	return mod.Vidyut.init();
}

const readStatic = (f: string) => JSON.parse(readFileSync(join(process.cwd(), 'static', 'data', f), 'utf8'));

const stubN = (n: string) => {
	const { corpus, byApn } = getCorpus();
	const s = corpus[byApn.get(n)!];
	return { n: s.n, s: s.s, iast: s.iast, en: s.en };
};

export type DStep = { code: string; source: string; s: string; en: string; terms: { t: string; ch: boolean }[] };
export type Derivation = { word: string; hash: string; steps: DStep[] };

let vidyutP: Promise<any> | null = null;
const vidyut = () => (vidyutP ??= vidyutNode());

/** Run one vidyut derivation at prerender time and return it with sūtra texts attached. */
async function derive(
	spec: { t: [string, string, string?] } | { s: [string, string, string, string, boolean?] } | { k: [string, string] },
	extra: Partial<{ lakara: string; purusha: string; vacana: string }> = {}
): Promise<Derivation> {
	const v = await vidyut();
	const { corpus, byApn } = getCorpus();
	const dhatus: { c: string; a: string; g: string; ag: string | null }[] = JSON.parse(readFileSync(join(process.cwd(), 'static', 'data', 'dhatus.json'), 'utf8'));
	const dh = (code: string) => {
		const d = dhatus.find((x) => x.c === code)!;
		return { aupadeshika: d.a, gana: d.g, antargana: d.ag, sanadi: [], prefixes: [] };
	};
	let ps: any[];
	let hash: string;
	if ('t' in spec) {
		const [code, , pada] = spec.t;
		const lakara = extra.lakara ?? 'Lat', purusha = extra.purusha ?? 'Prathama', vacana = extra.vacana ?? 'Eka';
		ps = v.deriveTinantas({ dhatu: dh(code), lakara, prayoga: 'Kartari', purusha, vacana, skip_at_agama: false, pada: pada ?? null });
		hash = `t=${code},${lakara},Kartari,${purusha},${vacana}${pada ? ',' + pada : ''}`;
	} else if ('s' in spec) {
		const [stem, linga, vibhakti, vacana, nyap] = spec.s;
		ps = v.deriveSubantas({ pratipadika: nyap ? { nyap: stem } : { basic: stem }, linga, vibhakti, vacana });
		hash = `s=${stem},${linga},${vibhakti},${vacana}${nyap ? ',nyap' : ''}`;
	} else {
		const [code, krt] = spec.k;
		ps = v.deriveKrdantas({ dhatu: dh(code), krt, unadi: null, lakara: null, prayoga: null, upapada: null });
		hash = '';
	}
	const p = ps[0];
	if (!p) throw new Error(`no derivation for ${JSON.stringify(spec)}`);
	return {
		word: slp1ToDeva(p.text),
		hash,
		steps: p.history.map((st: { rule: { source: string; code: string }; result: { text: string; wasChanged: boolean }[] }) => {
			const id = st.rule.source === 'ashtadhyayi' ? byApn.get(st.rule.code) : undefined;
			return {
				code: st.rule.code,
				source: st.rule.source,
				s: id ? corpus[id].s : '',
				en: id ? corpus[id].en : '',
				terms: st.result.map((t) => ({ t: slp1ToDeva(t.text), ch: t.wasChanged }))
			};
		})
	};
}

const LOADERS: Record<string, Loader> = {
	grammars: async () => ({ bhavati: await derive({ t: ['01.0001', 'BU', 'Parasmaipada'] }) }),
	metarules: async () => {
		const { corpus, byApn } = getCorpus();
		const pick = (n: string) => {
			const x = corpus[byApn.get(n)!];
			return { n: x.n, s: x.s, en: x.en, pc: x.pc.map((p) => ({ w: p.w, role: p.role })), an: x.an.map((a) => a.w) };
		};
		return {
			sutras: ['6.1.77', '8.2.39', '7.1.9', '6.1.78', '2.4.52', '7.2.102'].map(pick),
			bhavishyati: await derive({ t: ['02.0060', 'asa~'] }, { lakara: 'Lrt' }),
			tau: await derive({ s: ['tad', 'Pum', 'Prathama', 'Dvi'] }),
			bhavati: await derive({ t: ['01.0001', 'BU', 'Parasmaipada'] })
		};
	},
	compression: async () => {
		const { corpus, order } = getCorpus();
		const { toVarnas, isVowel } = await import('#lib/varna.ts');
		const syl = (t: string) => toVarnas(t).filter(isVowel).length;
		const total = order.reduce((n, id) => n + syl(corpus[id].s), 0);
		const list: { name: string; computedMatches: boolean }[] = readStatic('pratyahara.json');
		return {
			syllables: total,
			perSutra: total / order.length,
			count: order.length,
			names: [...new Set(list.filter((p) => p.computedMatches || p.name === 'अण्' || p.name === 'इण्').map((p) => p.name))],
			raja: await derive({ s: ['rAjan', 'Pum', 'Prathama', 'Eka'] })
		};
	},
	prakriya: async () => ({ bhavati: await derive({ t: ['01.0001', 'BU', 'Parasmaipada'] }) }),
	asiddha: async () => {
		const { corpus, order, byApn } = getCorpus();
		const tri = corpus[byApn.get('8.2.1')!].scope!;
		const start = order.indexOf(tri.from);
		return {
			tripadi: { count: tri.count, startFrac: start / order.length, total: order.length },
			rajabhih: await derive({ s: ['rAjan', 'Pum', 'Trtiya', 'Bahu'] }),
			ramaih: await derive({ s: ['rAma', 'Pum', 'Trtiya', 'Bahu'] }),
			ramah: await derive({ s: ['rAma', 'Pum', 'Prathama', 'Eka'] })
		};
	},
	conflict: async () => ({
		pl: await derive({ s: ['vfkza', 'Pum', 'Caturthi', 'Bahu'] }),
		du: await derive({ s: ['vfkza', 'Pum', 'Caturthi', 'Dvi'] })
	}),
	'sutra-types': async () => {
		const { corpus, order } = getCorpus();
		const counts: Record<string, number> = {};
		const examples: Record<string, { n: string; s: string; en: string }[]> = {};
		for (const id of order) {
			const s = corpus[id];
			const c = s.types[0]?.code ?? 'V';
			counts[c] = (counts[c] ?? 0) + 1;
			const list = (examples[c] ??= []);
			// spread examples across the text: take every k-th
			list.push({ n: s.n, s: s.s, en: s.en });
		}
		for (const c of Object.keys(examples)) {
			const l = examples[c];
			const step = Math.max(1, Math.floor(l.length / 8));
			examples[c] = l.filter((_, i) => i % step === 0).slice(0, 8);
		}
		return {
			counts,
			examples,
			patya: await derive({ s: ['pati', 'Pum', 'Trtiya', 'Eka'] }),
			harina: await derive({ s: ['hari', 'Pum', 'Trtiya', 'Eka'] })
		};
	},
	'it-markers': async () => ({
		ktva: await derive({ k: ['08.0010', 'ktvA'] }),
		trc: await derive({ k: ['08.0010', 'tfc'] }),
		nvul: await derive({ k: ['08.0010', 'Rvul'] })
	}),
	'rewrite-rules': async () => ({ bhavati: (await derive({ t: ['01.0001', 'BU', 'Parasmaipada'] })).steps }),
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

export async function explainerData(slug: string) {
	return (await LOADERS[slug]?.()) ?? {};
}
