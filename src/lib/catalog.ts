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
	{ slug: 'it-markers', title: 'It-markers', sa: 'इत्संज्ञा', blurb: 'Tags attached to affixes and roots that switch rules on, then vanish.', sutras: ['1.3.2', '1.3.3', '1.3.4', '1.3.5', '1.3.6', '1.3.7', '1.3.8', '1.3.9', '1.1.5', '7.2.115', '4.1.41'], status: 'ready' },
	{ slug: 'nearest-substitute', title: 'The nearest substitute', sa: 'स्थानेऽन्तरतमः', blurb: 'Which y, v, r or l replaces which vowel? Nearest match on a map of the mouth.', sutras: ['1.1.50', '1.1.51', '1.1.2', '6.1.87', '8.4.62'], status: 'ready' },
	{ slug: 'sutra-types', title: 'Six kinds of sūtra', sa: 'सूत्रप्रकाराः', blurb: 'Definitions, meta-rules, operations, restrictions, extensions and headings.', sutras: ['1.4.8', '1.4.7', '1.1.56', '1.2.4', '7.3.120'], status: 'ready' },
	{ slug: 'conflict', title: 'When rules collide', sa: 'विप्रतिषेधः', blurb: 'Later beats earlier, the specific beats the general, and other tie-breakers.', sutras: ['1.4.2', '7.3.102', '7.3.103', '6.1.101'], status: 'ready' },
	{ slug: 'asiddha', title: 'The invisible last three pādas', sa: 'पूर्वत्रासिद्धम्', blurb: 'Why the final 3 pādas behave like a later compiler pass.', sutras: ['8.2.1', '8.2.7', '7.1.9', '8.2.66', '8.3.15', '6.4.22', '6.1.86'], status: 'ready' },
	{ slug: 'prakriya', title: 'Building a word: भू → भवति', sa: 'प्रक्रिया', blurb: 'Watch a root, a tense and a person become a finished verb, rule by rule.', sutras: ['1.3.1', '3.2.123', '3.4.78', '3.4.77', '1.3.78', '3.1.68', '7.3.84', '6.1.78'], status: 'ready' },
	{ slug: 'dhatus', title: 'Where words come from', sa: 'धातवः', blurb: 'Roots, word lists and uṇādi: the lexicon the rules plug into, and how nouns are made from verbs.', sutras: ['1.3.1', '3.1.32', '1.2.45', '1.2.46', '1.1.27', '3.3.1', '3.4.75', '3.1.93', '3.1.133', '3.1.68', '2.4.72'], status: 'ready', minutes: 10 }
];

export const CS_LESSONS: Lesson[] = [
	{ slug: 'rewrite-rules', title: 'Sūtras as rewrite rules', blurb: 'Write A → B / C _ D, run it on real Sanskrit, and watch a rule engine work.', sutras: ['6.1.77', '6.1.87', '6.1.101'], status: 'ready' },
	{ slug: 'compression', title: 'Pratyāhāras as compression', blurb: 'Range encoding, bitsets, a provably optimal ordering, and a zero that remembers.', sutras: ['1.1.71', '1.1.60', '1.1.62', '6.1.68', '8.2.7'], status: 'ready' },
	{ slug: 'metarules', title: 'Metarules & interpreters', blurb: 'Paribhāṣās tell you how to execute the other rules, like an interpreter for a DSL.', sutras: ['1.1.49', '1.1.66', '1.1.67', '1.1.52', '1.1.55', '1.1.56', '1.3.10', '2.4.52', '7.2.102'], status: 'ready' },
	{ slug: 'grammars', title: 'Grammars, BNF & Pāṇini', blurb: 'Formal grammars, the "Pāṇini–Backus form" proposal, kāraka roles, and where the analogy holds or breaks.', sutras: ['1.4.23', '1.4.42', '1.4.49', '1.4.54', '2.3.1', '2.3.2', '2.3.18', '3.4.69'], status: 'ready' },
	{ slug: 'ordering', title: 'Rule ordering & specificity', blurb: 'CSS specificity, the Elsewhere Condition, feeding and bleeding, and asiddha as counterfeeding.', sutras: ['1.4.2', '8.2.1', '8.2.66', '8.3.15', '6.1.101'], status: 'ready' },
	{ slug: 'write-a-sutra', title: 'Write your own sūtra', blurb: 'A tiny rule language: compose a sūtra from case-marked words, run it, and compare with Pāṇini.', sutras: ['8.2.39'], status: 'ready' }
];

export const TOOLS: Lesson[] = [
	{ slug: 'pratyahara', title: 'Pratyāhāra calculator', sa: 'प्रत्याहारः', blurb: 'Pick a start sound and a marker; see the class light up on the Śiva sūtras.', sutras: ['1.1.71'], status: 'ready' },
	{ slug: 'anubandha', title: 'It-letter finder', sa: 'अनुबन्धः', blurb: 'Which letters of an affix or root are tags? Rule-by-rule through 1.3.2–1.3.9, with what each tag does.', sutras: ['1.3.2', '1.3.3', '1.3.4', '1.3.5', '1.3.6', '1.3.7', '1.3.8', '1.3.9', '1.1.5', '7.2.115', '7.2.116', '3.4.113', '7.1.1', '7.1.2', '7.1.3', '7.3.50', '3.4.77'], status: 'ready' },
	{ slug: 'prakriya', title: 'Derivation debugger', sa: 'प्रक्रिया', blurb: 'Step through real word derivations; every step links to the sūtra that fired.', sutras: [], status: 'ready' },
	{ slug: 'dhatupatha', title: 'Dhātupāṭha browser', sa: 'धातुपाठः', blurb: 'All the roots: filter by class, search by root or meaning, see each root\'s tags, and derive its verb.', sutras: ['1.3.1'], status: 'ready' },
	{ slug: 'sandhi', title: 'Sandhi playground', sa: 'सन्धिः', blurb: 'Join two words and see which sūtras apply.', sutras: ['6.1.77', '6.1.87', '6.1.101'], status: 'soon' }
];
