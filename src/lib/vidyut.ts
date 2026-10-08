// Browser wrapper around vidyut-prakriya's WebAssembly build (static/wasm, MIT, ambuda-org/vidyut).
import { asset } from '$app/paths';

export type Dhatu = { c: string; a: string; d: string; n: string; m: string; en: string; hi: string; g: string; ag: string | null };
export type StepTerm = { text: string; wasChanged: boolean };
export type Step = { rule: { source: string; code: string }; result: StepTerm[] };
export type Prakriya = { text: string; history: Step[] };

export { LAKARAS, PRAYOGAS, PURUSHAS, VACANAS, VIBHAKTIS, LINGAS } from './vidyut-enums.ts';

type Wasm = {
	deriveTinantas(args: unknown): Prakriya[];
	deriveSubantas(args: unknown): Prakriya[];
};

let wasmP: Promise<Wasm> | null = null;
let dhatusP: Promise<Dhatu[]> | null = null;
let rulesP: Promise<Record<string, Record<string, string>>> | null = null;

export function loadVidyut(): Promise<Wasm> {
	wasmP ??= (async () => {
		const url = asset('wasm/vidyut_prakriya.js');
		const mod = await import(/* @vite-ignore */ url);
		await mod.default({ module_or_path: asset('wasm/vidyut_prakriya_bg.wasm') });
		return mod.Vidyut.init() as Wasm;
	})();
	return wasmP;
}

/** Hindi senses of roots that take an upasarga: code → [[prefix, meaning], …]. Only ~180 roots have them. */
let upasargasP: Promise<Record<string, [string, string][]>> | null = null;
export function loadUpasargas(): Promise<Record<string, [string, string][]>> {
	upasargasP ??= fetch(asset('data/dhatu-upasargas.json')).then((r) => r.json());
	return upasargasP;
}

export function loadDhatus(): Promise<Dhatu[]> {
	dhatusP ??= fetch(asset('data/dhatus.json')).then((r) => r.json());
	return dhatusP;
}

export function loadRuleTexts(): Promise<Record<string, Record<string, string>>> {
	rulesP ??= fetch(asset('data/vidyut-rules.json')).then((r) => r.json());
	return rulesP;
}

export type TinantaArgs = { dhatu: Dhatu; lakara: string; prayoga: string; purusha: string; vacana: string; pada?: string | null };
export type SubantaArgs = { stem: string; linga: string; vibhakti: string; vacana: string; nyap?: boolean };

export function deriveTinanta(w: Wasm, a: TinantaArgs): Prakriya[] {
	return w.deriveTinantas({
		dhatu: { aupadeshika: a.dhatu.a, gana: a.dhatu.g, antargana: a.dhatu.ag, sanadi: [], prefixes: [] },
		lakara: a.lakara,
		prayoga: a.prayoga,
		purusha: a.purusha,
		vacana: a.vacana,
		skip_at_agama: false,
		pada: a.pada ?? null
	});
}

export function deriveSubanta(w: Wasm, a: SubantaArgs): Prakriya[] {
	const pratipadika = a.nyap ? { nyap: a.stem } : { basic: a.stem };
	return w.deriveSubantas({ pratipadika, linga: a.linga, vibhakti: a.vibhakti, vacana: a.vacana });
}

/** Hash used to deep-link a derivation, e.g. "t=01.0001,Lat,Kartari,Prathama,Eka,Parasmaipada" or "s=rAma,Pum,Prathama,Eka". */
export const tinantaHash = (code: string, l: string, p: string, pu: string, v: string, pada?: string | null) =>
	`t=${code},${l},${p},${pu},${v}${pada ? ',' + pada : ''}`;
export const subantaHash = (stem: string, g: string, vi: string, v: string, nyap = false) => `s=${stem},${g},${vi},${v}${nyap ? ',nyap' : ''}`;
/** Feminine ā/ī stems default to the ṅyāp reading (नदी, लता); plain stems like लक्ष्मी are the exception. */
export const defaultNyap = (stem: string, linga: string) => linga === 'Stri' && /[AI]$/.test(stem);
