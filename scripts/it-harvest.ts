// Harvest upadeśas and their it-deletion from real vidyut derivations.
// Every run of 1.3.x steps that ends in 1.3.9 tells us, for each term it touched, the aupadeśika text
// (before) and what 1.3.9 left (after), plus the rule that introduced the term just before.
// Used by build-data.ts (to colour affixes inside sūtras) and check-its.ts (to verify the detector).
import { slp1ToDeva } from '../src/lib/slp1.ts';

type Step = { rule: { source: string; code: string }; result: { text: string }[] };
export type Harvested = {
	/** Devanagari upadeśa as vidyut spells it, nasal vowels marked with ँ (except the yu/vu kept for 7.1.1) */
	u: string;
	/** what is left after 1.3.9 */
	done: string;
	/** the rule that introduced the term (the step right before its it-rules) */
	by: string;
	/** the it-rules vidyut applied */
	its: string[];
	/** what kind of derivation it came from */
	kind: 'krt' | 'taddhita' | 'tin' | 'sup' | 'sanadi';
};

const clean = (t: string) => t.replace(/[\\^]/g, '');

/** Read the it-steps off one derivation history. */
export function harvestHistory(h: Step[], kind: Harvested['kind'], out: Harvested[]) {
	for (let k = 1; k < h.length; k++) {
		if (h[k].rule.code.startsWith('1.3.') || !h[k + 1]?.rule.code.match(/^1\.3\.[2-8]/)) continue;
		let j = k + 1;
		const its: string[] = [];
		while (j < h.length && /^1\.3\.[2-8]/.test(h[j].rule.code)) its.push(h[j++].rule.code);
		if (h[j]?.rule.code !== '1.3.9') continue;
		const before = h[k].result, after = h[j].result;
		if (before.length !== after.length) continue;
		before.forEach((t, i) => {
			if (t.text === after[i].text) return;
			let raw = clean(t.text);
			const done = clean(after[i].text);
			// vidyut keeps the nasal of yu~/vu~ for 7.1.1 (युवोरनाकौ); tradition writes these without it
			if (done.includes('~')) raw = raw.replace(/([yv]u)~/g, '$1');
			out.push({ u: slp1ToDeva(raw), done: slp1ToDeva(done.replace(/([yv]u)~/g, '$1')), by: h[k].rule.code, its, kind });
		});
	}
}

const dh = (aupadeshika: string, gana: string, sanadi: string[] = [], prefixes: string[] = []) => ({ aupadeshika, gana, antargana: null, sanadi, prefixes });

// A spread of roots: every gaṇa, vowel- and consonant-final, seṭ and aniṭ.
const ROOTS = [
	['BU', 'Bhvadi'], ['qukf\\Y', 'Tanadi'], ['qupa\\ca~^z', 'Bhvadi'], ['ci\\Y', 'Svadi'], ['ga\\mx~', 'Bhvadi'], ['nftI~', 'Divadi'],
	['cara~', 'Bhvadi'], ['jYA\\', 'Kryadi'], ['zwu\\Y', 'Adadi'], ['eDa~\\', 'Bhvadi'], ['ya\\ja~^', 'Bhvadi'], ['quDA\\Y', 'Juhotyadi'],
	['ru\\Di~^r', 'Rudhadi'], ['df\\Si~r', 'Bhvadi'], ['vida~', 'Adadi'], ['qula\\Ba~\\z', 'Bhvadi'], ['pA\\', 'Bhvadi'], ['RI\\Y', 'Bhvadi'],
	['hf\\Y', 'Bhvadi'], ['Sru\\', 'Bhvadi'], ['kzi\\pa~^', 'Tudadi'], ['cura~', 'Curadi'], ['divu~', 'Divadi'], ['zu\\Y', 'Svadi'],
	['tu\\da~^', 'Tudadi'], ['tanu~^', 'Tanadi'], ['qukrI\\Y', 'Kryadi'], ['a\\da~', 'Adadi'], ['hu\\', 'Juhotyadi'], ['izu~', 'Tudadi'],
	['SIN', 'Adadi'], ['vada~', 'Bhvadi'], ['ra\\ma~\\', 'Bhvadi'], ['smf\\', 'Bhvadi'], ['janI~\\', 'Divadi'], ['Bi\\di~^r', 'Rudhadi']
] as const;
const UPAPADAS = [null, { stem: 'kumBa', linga: 'Pum', vibhakti: 'Dvitiya', vacana: 'Eka' }, { stem: 'priya', linga: 'Pum', vibhakti: 'Dvitiya', vacana: 'Eka' }];
const STEMS = [
	'upagu', 'dakza', 'aSva', 'go', 'deva', 'sundara', 'brAhmaRa', 'kim', 'idam', 'tad', 'yad', 'sarva', 'bahu', 'rAjan', 'puruza', 'kumAra',
	'nagara', 'grAma', 'Sukla', 'vfkza', 'mAtf', 'pitf', 'Bavat', 'kuru', 'agni', 'vAyu', 'Danu', 'paTin', 'aham', 'yuzmad', 'eka', 'dvi',
	'tri', 'catur', 'paYcan', 'hasta', 'danta', 'sTUla', 'pawu', 'mfdu', 'Sata', 'sahasra', 'loka', 'veda', 'vyAkaraRa', 'mukha', 'udaka', 'Darma', 'gfha', 'vasta'
];

/** Run a broad sample of derivations and harvest every upadeśa they process. */
export function harvestAll(vidyut: any, opts: { krt: string[]; taddhita: string[] }) {
	const out: Harvested[] = [];
	// vidyut prints a debug line for every upapada derivation
	const log = console.debug;
	console.debug = () => {};
	try {
		run();
	} finally {
		console.debug = log;
	}
	return out;
	function run() {
	const first = (f: () => any[]) => {
		try {
			return f()[0];
		} catch {
			return undefined;
		}
	};
	for (const krt of opts.krt) {
		search: for (const [a, g] of ROOTS)
			for (const upapada of UPAPADAS) {
				const p = first(() => vidyut.deriveKrdantas({ dhatu: dh(a, g), krt, unadi: null, lakara: null, prayoga: null, ...(upapada ? { upapada } : {}) }));
				if (p) {
					harvestHistory(p.history, 'krt', out);
					break search;
				}
			}
	}
	// ल्यप् replaces क्त्वा after a prefix (7.1.37)
	const lyap = first(() => vidyut.deriveKrdantas({ dhatu: dh('qukf\\Y', 'Tanadi', [], ['pra']), krt: 'ktvA', unadi: null, lakara: null, prayoga: null }));
	if (lyap) harvestHistory(lyap.history, 'krt', out);
	for (const taddhita of opts.taddhita)
		for (const basic of STEMS) {
			const p = first(() => vidyut.deriveTaddhitantas({ pratipadika: { basic }, taddhita }));
			if (p) {
				harvestHistory(p.history, 'taddhita', out);
				break;
			}
		}
	for (const lakara of ['Lat', 'Lit', 'Lut', 'Lrt', 'Let', 'Lot', 'Lan', 'VidhiLin', 'AshirLin', 'Lun', 'Lrn'])
		for (const [a, g] of ROOTS)
			for (const prayoga of ['Kartari', 'Karmani'])
				for (const pada of ['Parasmaipada', 'Atmanepada'])
					for (const purusha of ['Prathama', 'Madhyama', 'Uttama'])
						for (const vacana of ['Eka', 'Dvi', 'Bahu']) {
							const p = first(() => vidyut.deriveTinantas({ dhatu: dh(a, g), lakara, prayoga, purusha, vacana, skip_at_agama: false, pada }));
							if (p) harvestHistory(p.history, 'tin', out);
						}
	for (const sanadi of ['san', 'Ric', 'yaN'])
		for (const [a, g] of ROOTS.slice(0, 8)) {
			const p = first(() => vidyut.deriveTinantas({ dhatu: dh(a, g, [sanadi]), lakara: 'Lat', prayoga: 'Kartari', purusha: 'Prathama', vacana: 'Eka', skip_at_agama: false, pada: null }));
			if (p) harvestHistory(p.history, 'sanadi', out);
		}
	for (const basic of ['rAma', 'hari', 'guru', 'pitf'])
		for (const vibhakti of ['Prathama', 'Dvitiya', 'Trtiya', 'Caturthi', 'Panchami', 'Sasthi', 'Saptami'])
			for (const vacana of ['Eka', 'Dvi', 'Bahu']) {
				const p = first(() => vidyut.deriveSubantas({ pratipadika: { basic }, linga: 'Pum', vibhakti, vacana }));
				if (p) harvestHistory(p.history, 'sup', out);
			}
	}
}

/** Enum variant names from vidyut's TypeScript declarations. */
export function enumNames(dts: string, name: string): string[] {
	const m = dts.match(new RegExp(`export enum ${name} \\{([\\s\\S]*?)\\n\\}`));
	return m ? [...m[1].matchAll(/^\s+([A-Za-z0-9_]+)\s*=/gm)].map((x) => x[1]) : [];
}
