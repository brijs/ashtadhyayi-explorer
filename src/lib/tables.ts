// Implied tables: sūtras whose lists are really tables, read by 1.3.10 यथासङ्ख्यमनुदेशः समानाम् ("equal lists pair
// up in order") and the definitions 1.4.99–1.4.108. Hand-curated; every cell points at a pada part of the sūtra (or a
// pratyāhāra, expanded from the Śiva sūtras), so the text comes from the data. scripts/check-tables.ts checks each
// cell against vidyut-prakriya derivations.
import type { ItContext } from './it.ts';
import type { Pada } from './types.ts';
import { pratyahara, splitPratyaharaName } from './varna.ts';
import { PURUSHAS, VACANAS, VIBHAKTIS } from './vidyut-enums.ts';

export type Label = { sa: string; en: string };

/** Where a cell's text comes from: a pada part ([pada, part]) of this sūtra or of `sutra`, or the `index`-th sound of
 *  a pratyāhāra. `stem` gives the citation form when the part is inflected (वोः is the genitive of वु). */
export type Src = { part: [number, number]; sutra?: string; stem?: string } | { cls: string; index: number };
/** A cell: the item, and optionally what it replaces (`for`). */
export type Cell = { src: Src; for?: Src };

type Basis = { n: string; why: string };
/** `axes`: further sūtras that define the rows or columns (they link here) without being cited one by one. */
type Common = { sutra: string; title: Label; basis: Basis[]; axes?: string[]; note?: string };
export type GridSpec = Common & {
	kind: 'grid';
	rowAxis: Label;
	colAxis: Label;
	rows: Label[];
	cols: Label[];
	/** one 3×3 (etc.) block per layer, e.g. parasmaipada and ātmanepada */
	layers: { label?: Label; basis?: string; cells: Cell[][] }[];
	ctx?: ItContext;
	forCtx?: ItContext;
};
export type PairsSpec = Common & {
	kind: 'pairs';
	from: Label;
	to: Label;
	pairs: { from: Src; to: Src }[];
	fromCtx?: ItContext;
	toCtx?: ItContext;
};
export type TableSpec = GridSpec | PairsSpec;

const lab = (sa: string, en: string): Label => ({ sa, en });
const VIB_ROWS = VIBHAKTIS.filter((v) => v.id !== 'Sambodhana').map((v) => lab(v.sa, v.en));
const VAC_COLS = VACANAS.map((v) => lab(v.sa, v.en));
const PUR_ROWS = PURUSHAS.map((p) => lab(p.sa, p.en));
/** rows × cols cells reading pada `p`'s parts in order from `start` */
const block = (rows: number, cols: number, p: number, start = 0, sutra?: string): Cell[][] =>
	Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => ({ src: { part: [p, start + r * cols + c] as [number, number], sutra } })));
const part = (p: number, i: number, stem?: string, sutra?: string): Src => ({ part: [p, i], stem, sutra });
const cls = (name: string, n: number) => Array.from({ length: n }, (_, index): Src => ({ cls: name, index }));

const YATHA = (what: string): Basis => ({ n: '1.3.10', why: `Two lists of equal length pair up in order (यथासङ्ख्यम्), so ${what}.` });

export const TABLES: Record<string, TableSpec> = {
	'4.1.2': {
		sutra: '4.1.2',
		kind: 'grid',
		title: lab('सुप्', 'The 21 case endings'),
		rowAxis: lab('विभक्ति', 'case'),
		colAxis: lab('वचन', 'number'),
		rows: VIB_ROWS,
		cols: VAC_COLS,
		layers: [{ cells: block(7, 3, 0) }],
		ctx: 'vibhakti',
		basis: [
			{ n: '1.4.103', why: 'The sup endings, too, come in threes (त्रीणि त्रीणि, carried from 1.4.101), seven triads in all.' },
			{ n: '1.4.102', why: 'The three in each triad are singular, dual and plural (एकवचन, द्विवचन, बहुवचन), one by one.' },
			{ n: '1.4.104', why: 'Each triad (of sup, and of tiṅ) is called a vibhakti.' },
			YATHA('the 21 endings fill the 7 × 3 grid row by row')
		]
	},
	'3.4.78': {
		sutra: '3.4.78',
		kind: 'grid',
		title: lab('तिङ्', 'The 18 verb endings'),
		rowAxis: lab('पुरुष', 'person'),
		colAxis: lab('वचन', 'number'),
		rows: PUR_ROWS,
		cols: VAC_COLS,
		layers: [
			{ label: lab('परस्मैपदम्', 'parasmaipada'), basis: '1.4.99', cells: block(3, 3, 0, 0) },
			// इड् is इट् in sandhi before वहि
			{ label: lab('आत्मनेपदम्', 'ātmanepada'), basis: '1.4.100', cells: block(3, 3, 0, 9).map((row, r) => (r === 2 ? [{ src: part(0, 15, 'इट्') }, ...row.slice(1)] : row)) }
		],
		ctx: 'vibhakti',
		basis: [
			{ n: '1.4.99', why: 'The substitutes of a lakāra are parasmaipada: the first nine.' },
			{ n: '1.4.100', why: 'Except that तङ् (त … महिङ्, the last nine) and the āna affixes are ātmanepada.' },
			{ n: '1.4.101', why: 'Each nine falls into three triads: prathama, madhyama and uttama puruṣa.' },
			{ n: '1.4.102', why: 'Within each triad: singular, dual, plural, one by one.' },
			YATHA('the items fill the grid in the order listed')
		],
		axes: ['1.4.104', '1.4.105', '1.4.106', '1.4.107', '1.4.108'],
		note: 'Which row is used is fixed by 1.4.105–1.4.108: madhyama when the agent is युष्मद् "you", uttama when it is अस्मद् "I", prathama otherwise (शेषे प्रथमः).'
	},
	'3.4.82': {
		sutra: '3.4.82',
		kind: 'grid',
		title: lab('लिट्', 'Perfect (liṭ) parasmaipada endings'),
		rowAxis: lab('पुरुष', 'person'),
		colAxis: lab('वचन', 'number'),
		rows: PUR_ROWS,
		cols: VAC_COLS,
		layers: [
			{
				cells: [
					[0, 1, 2],
					[3, 4, 5],
					[6, 7, 8]
				].map((row) => row.map((i) => ({ src: part(1, i, i === 8 ? 'म' : undefined), for: part(0, i, undefined, '3.4.78') })))
			}
		],
		ctx: 'vibhakti',
		forCtx: 'vibhakti',
		basis: [
			YATHA('the nine substitutes replace the nine parasmaipada endings तिप् … मस् of 3.4.78 one for one'),
			{ n: '1.4.99', why: 'परस्मैपदानाम् names the first nine endings of 3.4.78 (लः परस्मैपदम्).' }
		]
	},
	'3.4.101': {
		sutra: '3.4.101',
		kind: 'pairs',
		title: lab('ङिल्लकार', 'Endings of the ṅit lakāras (laṅ, liṅ, luṅ, lṛṅ)'),
		from: lab('स्थानी', 'in place of'),
		to: lab('आदेश', 'substitute'),
		pairs: [0, 1, 2, 3].map((i) => ({ from: part(0, i, i === 3 ? 'मिप्' : undefined), to: part(1, i, i === 3 ? 'अम्' : undefined) })),
		fromCtx: 'vibhakti',
		toCtx: 'vibhakti',
		basis: [YATHA('तस् → ताम्, थस् → तम्, थ → त, मिप् → अम् (the Kāśikā: चतुर्णां यथासंख्यं तामादय आदेशाः)')]
	},
	'6.1.77': {
		sutra: '6.1.77',
		kind: 'pairs',
		title: lab('इको यणचि', 'Vowels to semivowels'),
		from: lab('इक्', 'in place of'),
		to: lab('यण्', 'substitute'),
		pairs: cls('इक्', 4).map((from, i) => ({ from, to: cls('यण्', 4)[i] })),
		basis: [
			YATHA('the four इक् vowels take the four यण् semivowels in order'),
			{ n: '1.1.50', why: 'The nearest substitute gives the same pairs: each vowel and its semivowel share a place of articulation.' },
			{ n: '1.1.69', why: 'इ also stands for ई, उ for ऊ, ऋ for ॠ, so नदी + औ → नद्यौ.' }
		],
		note: 'vidyut confirms the first three rows (नद्यौ, वध्वौ, पित्रा); its sample words give no case of ऌ → ल्, which follows from the order alone.'
	},
	'6.1.78': {
		sutra: '6.1.78',
		kind: 'pairs',
		title: lab('एचोऽयवायावः', 'Diphthongs before a vowel'),
		from: lab('एच्', 'in place of'),
		to: lab('आदेश', 'substitute'),
		pairs: cls('एच्', 4).map((from, i) => ({ from, to: part(1, i, i === 3 ? 'आव्' : undefined) })),
		basis: [YATHA('ए → अय्, ओ → अव्, ऐ → आय्, औ → आव् (the Kāśikā: आदेशा यथासंख्यं भवन्ति)')]
	},
	'7.1.1': {
		sutra: '7.1.1',
		kind: 'pairs',
		title: lab('युवोरनाकौ', 'यु and वु in affixes'),
		from: lab('स्थानी', 'in place of'),
		to: lab('आदेश', 'substitute'),
		pairs: [
			{ from: part(0, 0), to: part(1, 0) },
			{ from: part(0, 1, 'वु'), to: part(1, 1, 'अक') }
		],
		basis: [YATHA('यु → अन (ल्युट् gives भवन), वु → अक (ण्वुल् gives भावक); the Kāśikā: योरनः, वोरकः')]
	},
	'7.1.2': {
		sutra: '7.1.2',
		kind: 'pairs',
		title: lab('प्रत्ययादि', 'Initial sounds of affixes'),
		from: lab('स्थानी', 'in place of'),
		to: lab('आदेश', 'substitute'),
		pairs: [0, 1, 2, 3, 4].map((i) => ({ from: part(1, i, i === 4 ? 'घ' : undefined), to: part(0, i, i === 4 ? 'इय्' : undefined) })),
		basis: [YATHA('फ → आयन्, ढ → एय्, ख → ईन्, छ → ईय्, घ → इय्; the sūtra names the substitutes first')]
	},
	'7.1.12': {
		sutra: '7.1.12',
		kind: 'pairs',
		title: lab('टाङसिङसाम्', 'Endings after a-stems'),
		from: lab('स्थानी', 'in place of'),
		to: lab('आदेश', 'substitute'),
		pairs: [
			{ from: part(0, 6, undefined, '4.1.2'), to: part(1, 0) },
			{ from: part(0, 12, undefined, '4.1.2'), to: part(1, 1) },
			{ from: part(0, 15, undefined, '4.1.2'), to: part(1, 2, 'स्य') }
		],
		fromCtx: 'vibhakti',
		toCtx: 'vibhakti',
		basis: [YATHA('टा → इन (रामेण), ङसि → आत् (रामात्), ङस् → स्य (रामस्य); the Kāśikā: आदेशा भवन्ति यथासंख्यम्')],
		note: 'The endings being replaced are shown in their 4.1.2 form, with their it-letters.'
	}
};

/** The sūtras whose tables a definition or meta-rule helps read, for "See the table this defines". */
export const tablesBasedOn = (n: string) =>
	Object.values(TABLES).filter((t) => t.sutra !== n && (t.basis.some((b) => b.n === n) || t.axes?.includes(n)));

// ---------- resolution (server side, from the corpus) ----------

export type Text = { text: string; written?: string };
export type ResolvedCell = { main: Text; for?: Text };
export type ResolvedTable =
	| (Omit<GridSpec, 'layers'> & { layers: { label?: Label; basis?: string; cells: ResolvedCell[][] }[] })
	| (Omit<PairsSpec, 'pairs'> & { pairs: { from: Text; to: Text }[] });

/** Sounds of a pratyāhāra in order, e.g. इक् → इ उ ऋ ऌ, यण् → य् व् र् ल्. */
export function classSounds(name: string): string[] {
	const split = splitPratyaharaName(name);
	return (split && pratyahara(split[0], split[1])?.letters) || [];
}

/** Fill a spec with text from the corpus; `pcOf` returns a sūtra's padas. Throws if a reference is out of range. */
export function resolveTable(spec: TableSpec, pcOf: (n: string) => Pada[] | undefined): ResolvedTable {
	const text = (src: Src): Text => {
		if ('cls' in src) {
			const t = classSounds(src.cls)[src.index];
			if (!t) throw new Error(`${spec.sutra}: ${src.cls}[${src.index}] out of range`);
			return { text: t };
		}
		const w = pcOf(src.sutra ?? spec.sutra)?.[src.part[0]]?.parts[src.part[1]]?.w;
		if (!w) throw new Error(`${spec.sutra}: no part ${src.part} in ${src.sutra ?? spec.sutra}`);
		return src.stem && src.stem !== w ? { text: src.stem, written: w } : { text: w };
	};
	if (spec.kind === 'grid')
		return { ...spec, layers: spec.layers.map((l) => ({ ...l, cells: l.cells.map((row) => row.map((c) => ({ main: text(c.src), for: c.for && text(c.for) }))) })) };
	return { ...spec, pairs: spec.pairs.map((p) => ({ from: text(p.from), to: text(p.to) })) };
}
