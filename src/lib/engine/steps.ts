// Client-side helpers for the engine page: flatten an example's derivation runs into one step list.
import { bandOfN, BANDS, padaInfo, type Band } from '#lib/structure.ts';

export type DStep = { code: string; source: string; s: string; en: string; terms: { t: string; ch: boolean }[] };
export type EngineRun = { label: string; word: string; hash: string; steps: DStep[] };
export type EngineExample = {
	id: string;
	word: string;
	iast: string;
	gloss: string;
	group: 'verb' | 'krt' | 'taddhita' | 'noun';
	input: { base: string; baseNote: string; intent: string };
	illustrates: string;
	focus: string[];
	runs: EngineRun[];
};

export type FlatStep = DStep & {
	/** index in the flat list */
	i: number;
	run: number;
	/** first step of a later run: the handoff point */
	handoff: boolean;
	/** adhyāya 1–8, or 0 for a rule from outside the Aṣṭādhyāyī (Dhātupāṭha, vārttika …) */
	a: number;
	p: number;
	band: Band | 'outside';
	sutra: boolean;
};

export const SOURCE_LABEL: Record<string, string> = {
	varttika: 'vārttika',
	dhatupatha: 'Dhātupāṭha',
	unadi: 'Uṇādi',
	kashika: 'Kāśikā',
	kaumudi: 'Kaumudī',
	linganushasanam: 'Liṅgānuśāsana'
};

export function flatten(ex: EngineExample): FlatStep[] {
	const out: FlatStep[] = [];
	ex.runs.forEach((r, run) =>
		r.steps.forEach((st, j) => {
			const sutra = st.source === 'ashtadhyayi';
			const [a, p] = sutra ? st.code.split('.').map(Number) : [0, 0];
			out.push({ ...st, i: out.length, run, handoff: run > 0 && j === 0, a, p, band: sutra ? bandOfN(st.code) : 'outside', sutra });
		})
	);
	return out;
}

export const bandColor = (b: Band | 'outside') => (b === 'outside' ? 'var(--muted)' : `var(--b-${b})`);
export const stepTitle = (st: FlatStep) => (st.sutra ? `${st.code} · ${padaInfo(st.a, st.p).title}` : `${SOURCE_LABEL[st.source] ?? st.source} ${st.code}`);
export const bandLabel = (b: Band | 'outside') => (b === 'outside' ? 'Outside the Aṣṭādhyāyī' : BANDS[b].label);

/** Marker and naming bookkeeping that recurs in nearly every derivation. */
export const BOOKKEEPING = new Set(['1.3.2', '1.3.3', '1.3.4', '1.3.5', '1.3.6', '1.3.7', '1.3.8', '1.3.9', '1.4.13', '1.4.14', '1.2.45', '8.4.68']);
