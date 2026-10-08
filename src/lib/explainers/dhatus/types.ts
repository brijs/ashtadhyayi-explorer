// Shape of the prerendered data for this lesson (see lib/server/explainer-data.ts, loader `dhatus`).
export type DStep = { code: string; source: string; s: string; en: string; terms: { t: string; ch: boolean }[] };
export type Derivation = { word: string; hash: string; steps: DStep[] };

export type Stub = { n: string; s: string; iast: string; en: string };
export type Gana = {
	g: string;
	count: number;
	sample: { c: string; d: string; m: string; en: string; hi: string }[];
	first: { c: string; d: string };
	form: string;
	hash: string;
	codes: string[];
};
export type DhatuData = {
	total: number;
	distinctUpadesha: number;
	distinctNormal: number;
	sutraCount: number;
	ganas: Gana[];
	s: Stub[];
	pada: Record<string, string[]>;
	effects: Record<'agamat' | 'sphurgna' | 'sphurjathu' | 'krtrima', { word: string; fired: boolean }>;
	krt: { pacaka: Derivation; kartr: Derivation; gata: Derivation };
	sanadi: { bhavati: Derivation; bubhusati: Derivation; bhavayati: Derivation };
	unadi: { count: number; padas: number[]; texts: Record<string, string>; go: Derivation; karu: Derivation };
	linga: number;
};

export const sutra = (d: DhatuData, n: string) => d.s.find((x) => x.n === n)!;

export { GANA_SA, GANA_IAST } from '#lib/dhatu.ts';

/** The /tools/anubandha it-letter tool is built on another branch; flip to true once it is merged (the prerender fails on dead links). */
export const ANUBANDHA_TOOL = true;
