// A rule-by-rule account of how 1.3.2–1.3.9 treat one upadeśa: which rule fires on which sound, and why the
// others do not apply. Built on detectIts (it.ts), so it always agrees with the colouring.
import { detectIts, stripIts, type ItContext, type ItUnit } from './it.ts';
import { isConsonant } from './varna.ts';

export type TraceStatus = 'fired' | 'blocked' | 'no' | 'na';
export type TraceStep = {
	rule: string;
	status: TraceStatus;
	/** indices of the sounds this step is about */
	on: number[];
	/** one-line explanation */
	why: string;
	/** for 'blocked': the rule that stops it */
	by?: string;
};

const NASAL = 'ँ';
const CU = ['च्', 'छ्', 'ज्', 'झ्', 'ञ्'];
const TTU = ['ट्', 'ठ्', 'ड्', 'ढ्', 'ण्'];
const KU = ['क्', 'ख्', 'ग्', 'घ्', 'ङ्'];

const isAffixCtx = (c: ItContext) => c === 'pratyaya' || c === 'vibhakti' || c === 'taddhita';

export function traceIts(upadesha: string, ctx: ItContext): { units: ItUnit[]; steps: TraceStep[]; result: string } {
	const units = detectIts(upadesha, ctx);
	const steps: TraceStep[] = [];
	if (!units.length) return { units, steps, result: '' };
	const last = units.length - 1;
	const first = units[0];
	const affix = isAffixCtx(ctx);
	const by = (code: string) => units.map((u, i) => (u.it === code ? i : -1)).filter((i) => i >= 0);
	const q = (i: number) => units[i].v;

	// 1.3.2
	const nas = by('1.3.2');
	const yuvu = units.map((u, i) => (u.kept === '7.1.1' ? i : -1)).filter((i) => i >= 0);
	if (nas.length) steps.push({ rule: '1.3.2', status: 'fired', on: nas, why: `${nas.map(q).join(', ')}: nasalised vowel${nas.length > 1 ? 's' : ''}` });
	else if (yuvu.length) steps.push({ rule: '1.3.2', status: 'blocked', on: yuvu, by: '7.1.1', why: 'the nasal उँ of यु/वु stays, so that 7.1.1 can replace यु/वु with अन/अक' });
	else steps.push({ rule: '1.3.2', status: 'no', on: [], why: units.some((u) => u.v.endsWith(NASAL)) ? 'its nasal vowel is already part of another it' : 'no nasalised vowel (written with ँ)' });

	// vārttika on 1.3.3 (root-final इर्)
	const ir = by('1.3.3.1');
	if (ir.length) steps.push({ rule: '1.3.3.1', status: 'fired', on: ir, why: 'a root ending in इँर्: the whole इर् is an it' });

	// 1.3.3 and 1.3.4
	const lastU = units[last];
	if (ir.length) steps.push({ rule: '1.3.3', status: 'no', on: [last], why: 'the final र् already belongs to the it इर्' });
	else if (!isConsonant(lastU.v)) steps.push({ rule: '1.3.3', status: 'no', on: [last], why: `ends in a vowel (${lastU.v})` });
	else if (units.length === 1) steps.push({ rule: '1.3.3', status: 'no', on: [], why: 'a single sound: nothing would be left' });
	else if (lastU.kept === '1.3.4') steps.push({ rule: '1.3.3', status: 'blocked', on: [last], by: '1.3.4', why: `final ${lastU.v} would be an it, but this is a vibhakti` });
	else steps.push({ rule: '1.3.3', status: 'fired', on: [last], why: `final consonant ${lastU.v}` });
	if (ctx === 'vibhakti')
		steps.push(
			lastU.kept === '1.3.4'
				? { rule: '1.3.4', status: 'fired', on: [last], why: `final ${lastU.v}${lastU.v === 'स्' || lastU.v === 'म्' ? '' : ' (a t-row sound)'} of a vibhakti is not an it` }
				: { rule: '1.3.4', status: 'no', on: [], why: isConsonant(lastU.v) ? `final ${lastU.v} is not a t-row sound, स् or म्` : 'no final consonant to protect' }
		);
	else steps.push({ rule: '1.3.4', status: 'na', on: [], why: 'only for vibhaktis (sup and tiṅ endings)' });

	// 1.3.5
	const adi = by('1.3.5');
	if (ctx === 'dhatu')
		steps.push(adi.length ? { rule: '1.3.5', status: 'fired', on: adi, why: `initial ${units[0].v[0]}${units[1].v === 'इ' ? 'ि' : 'ु'} of a root` } : { rule: '1.3.5', status: 'no', on: [], why: 'does not begin with ञि, टु or डु' });
	else steps.push({ rule: '1.3.5', status: 'na', on: [], why: 'only for roots (dhātus)' });

	// 1.3.6–1.3.8: the initial of an affix
	if (!affix) {
		for (const r of ['1.3.6', '1.3.7', '1.3.8']) steps.push({ rule: r, status: 'na', on: [], why: 'only for affixes (pratyayas)' });
	} else {
		const v = first.v;
		const done = first.it === '1.3.6';
		steps.push(done ? { rule: '1.3.6', status: 'fired', on: [0], why: 'initial ष् of an affix' } : { rule: '1.3.6', status: 'no', on: [], why: `initial ${v} is not ष्` });
		if (done) steps.push({ rule: '1.3.7', status: 'no', on: [], why: 'the initial is already an it' });
		else if (first.it === '1.3.7') steps.push({ rule: '1.3.7', status: 'fired', on: [0], why: `initial ${v} is a ${CU.includes(v) ? 'c-row' : 'ṭ-row'} sound` });
		else if ((CU.includes(v) || TTU.includes(v)) && first.kept) steps.push({ rule: '1.3.7', status: 'blocked', on: [0], by: first.kept, why: `initial ${v} is replaced later instead` });
		else steps.push({ rule: '1.3.7', status: 'no', on: [], why: `initial ${v} is not a c-row or ṭ-row sound` });
		const lsk = v === 'ल्' || v === 'श्' || KU.includes(v);
		if (done || first.it === '1.3.7') steps.push({ rule: '1.3.8', status: 'no', on: [], why: 'the initial is already an it' });
		else if (first.it === '1.3.8') steps.push({ rule: '1.3.8', status: 'fired', on: [0], why: `initial ${v} of a non-taddhita affix` });
		else if (lsk && ctx === 'taddhita') steps.push({ rule: '1.3.8', status: 'blocked', on: [0], by: first.kept, why: `initial ${v}, but this is a taddhita (अतद्धिते)` });
		else if (lsk && first.kept) steps.push({ rule: '1.3.8', status: 'blocked', on: [0], by: first.kept, why: `initial ${v} must stay` });
		else steps.push({ rule: '1.3.8', status: 'no', on: [], why: `initial ${v} is not ल्, श् or a k-row sound` });
	}

	// 1.3.9
	const gone = units.map((u, i) => (u.it ? i : -1)).filter((i) => i >= 0);
	const result = stripIts(units);
	const as = units.findIndex((u) => u.as);
	steps.push(
		gone.length
			? { rule: '1.3.9', status: 'fired', on: gone, why: `delete ${gone.map(q).join(', ')} → ${result || '∅'}${as >= 0 ? ` (${units[as].v} reverts to ${units[as].as}, 8.4.41)` : ''}` }
			: { rule: '1.3.9', status: 'no', on: [], why: 'no it-letters: nothing to delete' }
	);
	return { units, steps, result };
}
