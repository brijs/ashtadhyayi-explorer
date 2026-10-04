// Catalog of explainers, tools and CS lessons. Drives index pages and "Explained in" links on sūtra pages.

export type Lesson = {
	slug: string;
	title: string;
	sa?: string;
	blurb: string;
	sutras: string[]; // a.p.n sūtras this lesson teaches
	status: 'ready' | 'soon';
	minutes?: number;
};

export const EXPLAINERS: Lesson[] = [
	{ slug: 'shiva-sutras', title: 'Śiva sūtras & pratyāhāras', sa: 'माहेश्वरसूत्राणि', blurb: '14 lines of sounds and a trick that turns any stretch of them into a two-letter name.', sutras: ['1.3.3', '1.3.9', '1.1.71', '1.1.69'], status: 'ready', minutes: 8 },
	{ slug: 'anatomy', title: 'Anatomy of a sūtra', sa: 'सूत्रस्य अङ्गानि', blurb: 'Case endings as operators: how इको यणचि packs a whole rewrite rule into three words.', sutras: ['6.1.77', '1.1.49', '1.1.66', '1.1.67'], status: 'ready', minutes: 8 },
	{ slug: 'anuvritti', title: 'Anuvṛtti & adhikāra', sa: 'अनुवृत्तिः अधिकारश्च', blurb: 'Words that flow down into later rules, and headings that scope whole chapters.', sutras: ['1.3.11', '3.1.1', '3.1.2', '6.1.72'], status: 'ready', minutes: 8 },
	{ slug: 'it-markers', title: 'It-markers', sa: 'इत्संज्ञा', blurb: 'Tags attached to affixes and roots that switch rules on, then vanish.', sutras: ['1.3.2', '1.3.3', '1.3.9'], status: 'soon' },
	{ slug: 'nearest-substitute', title: 'The nearest substitute', sa: 'स्थानेऽन्तरतमः', blurb: 'Which y, v, r or l replaces which vowel? Nearest match on a map of the mouth.', sutras: ['1.1.50'], status: 'soon' },
	{ slug: 'sutra-types', title: 'Six kinds of sūtra', sa: 'सूत्रप्रकाराः', blurb: 'Definitions, meta-rules, operations, restrictions, extensions and headings.', sutras: ['1.1.1', '1.1.49', '6.1.77'], status: 'soon' },
	{ slug: 'conflict', title: 'When rules collide', sa: 'विप्रतिषेधः', blurb: 'Later beats earlier, the specific beats the general, and other tie-breakers.', sutras: ['1.4.2'], status: 'soon' },
	{ slug: 'asiddha', title: 'The invisible last three pādas', sa: 'पूर्वत्रासिद्धम्', blurb: 'Why the final 3 pādas behave like a later compiler pass.', sutras: ['8.2.1', '6.1.86', '6.4.22'], status: 'soon' },
	{ slug: 'prakriya', title: 'Building a word: भू → भवति', sa: 'प्रक्रिया', blurb: 'Watch a root, a tense and a person become a finished verb, rule by rule.', sutras: ['1.3.1', '3.2.123', '3.4.78', '3.1.68', '7.3.84', '6.1.78'], status: 'soon' }
];

export const CS_LESSONS: Lesson[] = [
	{ slug: 'rewrite-rules', title: 'Sūtras as rewrite rules', blurb: 'Write A → B / C _ D, run it on real Sanskrit, and watch a rule engine work.', sutras: ['6.1.77', '6.1.87', '6.1.101'], status: 'soon' },
	{ slug: 'compression', title: 'Pratyāhāras as compression', blurb: 'Ranges, bitsets and the empty string: how Pāṇini kept the grammar short.', sutras: ['1.1.71', '1.1.60'], status: 'soon' },
	{ slug: 'metarules', title: 'Metarules & interpreters', blurb: 'Paribhāṣās tell you how to execute the other rules, like an interpreter for a DSL.', sutras: ['1.1.49', '1.1.66', '1.1.67'], status: 'soon' },
	{ slug: 'grammars', title: 'Grammars, BNF & Pāṇini', blurb: 'Formal grammars, the "Pāṇini–Backus form" proposal, and where the analogy holds or breaks.', sutras: [], status: 'soon' },
	{ slug: 'ordering', title: 'Rule ordering & specificity', blurb: 'Conflict resolution, exceptions, and asiddha as ordered passes.', sutras: ['1.4.2', '8.2.1'], status: 'soon' },
	{ slug: 'write-a-sutra', title: 'Write your own sūtra', blurb: 'A tiny DSL: compose a sūtra from case-marked words and run it.', sutras: [], status: 'soon' }
];

export const TOOLS: Lesson[] = [
	{ slug: 'pratyahara', title: 'Pratyāhāra calculator', sa: 'प्रत्याहारः', blurb: 'Pick a start sound and a marker; see the class light up on the Śiva sūtras.', sutras: ['1.1.71'], status: 'ready' },
	{ slug: 'prakriya', title: 'Derivation debugger', sa: 'प्रक्रिया', blurb: 'Step through real word derivations; every step links to the sūtra that fired.', sutras: [], status: 'soon' },
	{ slug: 'sandhi', title: 'Sandhi playground', sa: 'सन्धिः', blurb: 'Join two words and see which sūtras apply.', sutras: ['6.1.77', '6.1.87', '6.1.101'], status: 'soon' }
];
