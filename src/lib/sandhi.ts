// A tiny, honest rule engine for the vowel sandhi of 6.1.77 इको यणचि and its exception 6.1.101 अकः सवर्णे दीर्घः.
// Used by explainers and the CS track. Not a full sandhi implementation.
import { toVarnas, fromVarnas, isVowel } from './varna.ts';

export const IK = ['इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ॠ', 'ऌ'];
const YAN: Record<string, string> = { 'इ': 'य्', 'ई': 'य्', 'उ': 'व्', 'ऊ': 'व्', 'ऋ': 'र्', 'ॠ': 'र्', 'ऌ': 'ल्' };
const SAVARNA_GROUP: Record<string, string> = { 'अ': 'a', 'आ': 'a', 'इ': 'i', 'ई': 'i', 'उ': 'u', 'ऊ': 'u', 'ऋ': 'r', 'ॠ': 'r', 'ऌ': 'r' };
const LONG: Record<string, string> = { a: 'आ', i: 'ई', u: 'ऊ', r: 'ॠ' };

export type Step = {
	/** index in the varṇa array being examined */
	at: number;
	kind: 'scan' | 'yan' | 'dirgha';
	varnas: string[];
	note: string;
	sutra?: string;
};

/** Join two words in saṃhitā and record every step of applying 6.1.77 (or 6.1.101 where it takes over). */
export function runIkoYanaci(a: string, b: string): { steps: Step[]; result: string; input: string[] } {
	let vs = [...toVarnas(a), ...toVarnas(b)].filter((v) => v.trim());
	const input = [...vs];
	const steps: Step[] = [];
	for (let i = 0; i < vs.length; i++) {
		const v = vs[i];
		const next = vs[i + 1];
		if (!IK.includes(v)) {
			steps.push({ at: i, kind: 'scan', varnas: [...vs], note: `${v}: not an इक् vowel` });
			continue;
		}
		if (!next || !isVowel(next)) {
			steps.push({ at: i, kind: 'scan', varnas: [...vs], note: `${v} is an इक्, but ${next ? next + ' is not a vowel' : 'nothing follows'}` });
			continue;
		}
		if (SAVARNA_GROUP[v] && SAVARNA_GROUP[v] === SAVARNA_GROUP[next]) {
			const long = LONG[SAVARNA_GROUP[v]];
			vs = [...vs.slice(0, i), long, ...vs.slice(i + 2)];
			steps.push({ at: i, kind: 'dirgha', varnas: [...vs], note: `${v} + ${next} are similar vowels: both become one long ${long}`, sutra: '6.1.101' });
			continue;
		}
		vs = [...vs.slice(0, i), YAN[v], ...vs.slice(i + 1)];
		steps.push({ at: i, kind: 'yan', varnas: [...vs], note: `${v} before the vowel ${next} → ${YAN[v]}`, sutra: '6.1.77' });
	}
	return { steps, result: fromVarnas(vs), input };
}
