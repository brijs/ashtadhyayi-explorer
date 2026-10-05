// Cross-check src/lib/it.ts against vidyut: for every dhātu and every sup/tiṅ affix, the sounds we mark as it
// must be exactly the ones vidyut deletes at 1.3.9. Also checks that every sūtra cited in it.ts exists with that text.
// Run after `npm run data`: node scripts/check-its.ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { detectIts, stripIts, IT_RULES, IT_EFFECTS, KEPT_RULES, type ItContext } from '../src/lib/it.ts';
import { PICK_GROUPS } from '../src/lib/anubandha.ts';
import { harvestAll, enumNames } from './it-harvest.ts';
import { slp1ToDeva } from '../src/lib/slp1.ts';

const ROOT = join(import.meta.dirname, '..');
const wasmDir = join(ROOT, 'static', 'wasm');
const mod = await import(join(wasmDir, 'vidyut_prakriya.js'));
await mod.default({ module_or_path: readFileSync(join(wasmDir, 'vidyut_prakriya_bg.wasm')) });
const vidyut = mod.Vidyut.init();

type Step = { rule: { source: string; code: string }; result: { text: string }[] };
const problems: string[] = [];
const itCodes = (h: Step[]) => new Set(h.filter((s) => /^1\.3\.[2-8]/.test(s.rule.code)).map((s) => s.rule.code));

// 1. Dhātus: compare the text right after 1.3.9 and the set of it-rules used.
const dhatus: { c: string; a: string; d: string; g: string; ag: string | null }[] = JSON.parse(readFileSync(join(ROOT, 'static/data/dhatus.json'), 'utf8'));
let ok = 0;
for (const d of dhatus) {
	const p = vidyut.deriveDhatus({ aupadeshika: d.a, gana: d.g, antargana: d.ag, sanadi: [], prefixes: [] })[0];
	if (!p) continue;
	// only the root's own it-steps: the run of 1.3.x rules at the start (curādi roots then get ṇic, with its own)
	const end = p.history.findIndex((s: Step) => !s.rule.code.startsWith('1.3.'));
	const h: Step[] = end < 0 ? p.history : p.history.slice(0, end);
	const after = h.find((s) => s.rule.code === '1.3.9');
	const expected = after ? slp1ToDeva(after.result[0].text) : d.d;
	const units = detectIts(d.d, 'dhatu');
	const ours = stripIts(units);
	const ourCodes = new Set(units.filter((u) => u.it).map((u) => u.it!));
	const theirs = itCodes(h);
	const sameCodes = ourCodes.size === theirs.size && [...ourCodes].every((c) => theirs.has(c));
	if (ours !== expected || !sameCodes) problems.push(`dhātu ${d.c} ${d.d}: ours ${ours} [${[...ourCodes]}] vs vidyut ${expected} [${[...theirs]}]`);
	else ok++;
}
console.log(`dhātus: ${ok}/${dhatus.length} agree`);

// 2. Affixes: run real derivations and read off the affix right after its 1.3.9.
function affixAfterIt(h: Step[], introducedBy: string) {
	const i = h.findIndex((s) => s.rule.code === introducedBy);
	const j = h.findIndex((s, k) => k > i && s.rule.code === '1.3.9');
	if (i < 0) return null;
	const raw = h[i].result.at(-1)!.text;
	const done = j > 0 && h.slice(i + 1, j).every((s) => s.rule.code.startsWith('1.3.')) ? h[j].result.at(-1)!.text : raw;
	return { raw: slp1ToDeva(raw), done: slp1ToDeva(done) };
}
const supTin: { raw: string; done: string }[] = [];
const check = (raw: string, done: string, ctx: ItContext, label: string) => {
	const ours = stripIts(detectIts(raw, ctx));
	if (ours !== done) problems.push(`${label} ${raw}: ours ${ours} vs vidyut ${done}`);
	supTin.push({ raw, done });
};
const VIB = ['Prathama', 'Dvitiya', 'Trtiya', 'Caturthi', 'Panchami', 'Sasthi', 'Saptami'];
const VAC = ['Eka', 'Dvi', 'Bahu'];
let affixes = 0;
for (const vibhakti of VIB)
	for (const vacana of VAC) {
		const p = vidyut.deriveSubantas({ pratipadika: { basic: 'rAma' }, linga: 'Pum', vibhakti, vacana })[0];
		const a = p && affixAfterIt(p.history, '4.1.2');
		if (a) (check(a.raw, a.done, 'vibhakti', `sup ${vibhakti}/${vacana}`), affixes++);
	}
const dhatu = (aupadeshika: string, gana: string) => ({ aupadeshika, gana, antargana: null, sanadi: [], prefixes: [] });
for (const [dh, pada] of [[dhatu('BU', 'Bhvadi'), 'Parasmaipada'], [dhatu('eDa~\\', 'Bhvadi'), 'Atmanepada']] as const)
	for (const purusha of ['Prathama', 'Madhyama', 'Uttama'])
		for (const vacana of VAC) {
			const p = vidyut.deriveTinantas({ dhatu: dh, lakara: 'Lat', prayoga: 'Kartari', purusha, vacana, skip_at_agama: false, pada })[0];
			const a = p && affixAfterIt(p.history, '3.4.78');
			if (a) (check(a.raw, a.done, 'vibhakti', `tiṅ ${pada}/${purusha}/${vacana}`), affixes++);
		}
console.log(`sup/tiṅ affixes checked: ${affixes}`);

// 3. Every upadeśa vidyut processes in a broad sample of derivations (all kṛt and taddhita affixes it knows,
//    every lakāra, vikaraṇa, tiṅ substitute, augment…), in the context implied by the rule that introduces it.
const dts = readFileSync(join(wasmDir, 'vidyut_prakriya.d.ts'), 'utf8');
const harvested = harvestAll(vidyut, { krt: enumNames(dts, 'BaseKrt'), taddhita: enumNames(dts, 'Taddhita') });
const num = (code: string) => {
	const [a, p, k] = code.split('.').map(Number);
	return a * 10000 + p * 1000 + k;
};
const ctxFor = (by: string, kind: string): ItContext[] => {
	const x = num(by);
	if (kind === 'sup' || (x >= 34078 && x <= 34112)) return ['vibhakti', 'agama'];
	if (x >= 41076 && x <= 54160) return ['taddhita'];
	if (x >= 31001 && x < 41076) return ['pratyaya'];
	return ['agama', 'pratyaya', 'vibhakti', 'dhatu']; // augments and substitutes introduced outside the affix headings
};
// vidyut exempts these taddhitas from 1.3.7 by a hard-coded list (it_samjna.rs), with no sūtra; we leave them alone
// (they are not coloured in sūtras either: build-data only marks parts our detector gets right).
const KNOWN_EXCEPTIONS = new Set(['जातीयर्', 'चरट्', 'चुञ्चुप्', 'चणप्', 'जाहच्']);
const seen = new Set<string>();
let hv = 0;
for (const e of harvested) {
	const key = `${e.u}@${e.by}`;
	if (seen.has(key) || e.by === '1.3.1' || KNOWN_EXCEPTIONS.has(e.u)) continue;
	seen.add(key);
	const ok = ctxFor(e.by, e.kind).some((c) => stripIts(detectIts(e.u, c)) === e.done);
	if (!ok) problems.push(`harvest ${e.kind} ${e.u} (by ${e.by}): ours ${stripIts(detectIts(e.u, ctxFor(e.by, e.kind)[0]))} vs vidyut ${e.done}`);
	else hv++;
}
console.log(`upadeśas harvested from vidyut derivations: ${hv} agree (${KNOWN_EXCEPTIONS.size} known exceptions skipped)`);

// 4. The it-letter finder's pick lists: each item is vidyut's own spelling, introduced by the sūtra we name.
let picks = 0;
for (const g of PICK_GROUPS)
	for (const it of g.items) {
		const e = harvested.find((x) => x.u === it.u && x.by === it.by);
		const ours = stripIts(detectIts(it.u, g.ctx));
		if (!e) problems.push(`pick ${g.id} ${it.u}@${it.by}: vidyut never introduces it by that rule`);
		else if (ours !== e.done) problems.push(`pick ${g.id} ${it.u}: ours ${ours} vs vidyut ${e.done}`);
		else picks++;
	}
console.log(`pick-list upadeśas: ${picks} agree`);

// 5. The sup and tiṅ lists as the corpus spells them in 4.1.2 and 3.4.78 (shown with it-letters on those pages).
const corpusEarly: Record<string, { n: string; pc: { parts: { w: string; it?: string; u?: string }[] }[] }> = JSON.parse(readFileSync(join(ROOT, 'generated/sutras.full.json'), 'utf8'));
const byNum = new Map(Object.values(corpusEarly).map((s) => [s.n, s]));
const lists = [...byNum.get('4.1.2')!.pc[0].parts, ...byNum.get('3.4.78')!.pc[0].parts].map((x) => x.w);
if (lists.length !== supTin.length) problems.push(`4.1.2 + 3.4.78 have ${lists.length} parts, vidyut gave ${supTin.length} affixes`);
lists.forEach((w, i) => {
	const ours = stripIts(detectIts(w, 'vibhakti'));
	if (supTin[i] && ours !== supTin[i].done) problems.push(`corpus ${w} (≙ vidyut ${supTin[i].raw}): ours ${ours} vs vidyut ${supTin[i].done}`);
});
// 6. Every part build-data marked in a sūtra: our detector, in the stored context, matches some vidyut it-step.
let marked = 0;
for (const s of Object.values(corpusEarly))
	for (const pada of s.pc)
		for (const part of pada.parts) {
			if (!part.it || s.n === '4.1.2' || s.n === '3.4.78') continue;
			const u = part.u ?? part.w;
			const ours = stripIts(detectIts(u, part.it as ItContext));
			if (!harvested.some((e) => e.u === u && e.done === ours)) problems.push(`sūtra ${s.n} ${part.w}: ${u} → ${ours} not attested in vidyut`);
			else marked++;
		}
console.log(`sūtra parts marked with it-letters: ${marked} verified (+ ${lists.length} in 4.1.2/3.4.78)`);

// 7. Every cited sūtra exists, and IT_RULES quotes the corpus text.
const corpus: Record<string, { n: string; s: string }> = JSON.parse(readFileSync(join(ROOT, 'generated/sutras.full.json'), 'utf8'));
const byN = new Map(Object.values(corpus).map((s) => [s.n, s.s]));
const norm = (s: string) => s.replace(/[\s।॥ऽ]/g, '');
for (const [n, r] of Object.entries(IT_RULES)) {
	if (n.split('.').length > 3) continue; // vārttika
	if (!byN.has(n)) problems.push(`IT_RULES ${n}: no such sūtra`);
	else if (norm(byN.get(n)!) !== norm(r.s)) problems.push(`IT_RULES ${n}: text "${r.s}" ≠ corpus "${byN.get(n)}"`);
}
for (const [n, r] of Object.entries(KEPT_RULES)) {
	if (!byN.has(n)) problems.push(`KEPT_RULES ${n}: no such sūtra`);
	else if (norm(byN.get(n)!) !== norm(r.s)) problems.push(`KEPT_RULES ${n}: text "${r.s}" ≠ corpus "${byN.get(n)}"`);
}
for (const g of PICK_GROUPS) for (const it of g.items) if (!byN.has(it.by.split('.').slice(0, 3).join('.'))) problems.push(`pick ${it.u}: no sūtra ${it.by}`);
for (const [k, list] of Object.entries(IT_EFFECTS)) for (const e of list) if (!byN.has(e.sutra)) problems.push(`IT_EFFECTS ${k}: no sūtra ${e.sutra}`);

if (problems.length) {
	console.error(`\n${problems.length} problem(s):\n` + problems.slice(0, 60).join('\n'));
	process.exit(1);
}
console.log('✓ it-saṃjñā detection agrees with vidyut');
