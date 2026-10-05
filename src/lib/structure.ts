// The architecture of the Aṣṭādhyāyī: what each adhyāya and pāda does, and its role in a derivation.
// Summaries are written from the headings (adhikāra sūtras, see static/data/adhikaras.json) and the sūtras of
// each pāda, following the conventional outline (e.g. learnsanskrit.org's overview; Kiparsky 2009; Sharma 1987).
// Every sūtra number below exists in the corpus (checked at build time by the /engine page load).
// Sūtra counts and heading ranges are NOT written here: they are computed from the data.

export type Band = 'defs' | 'case' | 'verbal' | 'nominal' | 'stem' | 'pada' | 'tri';

export const BANDS: Record<Band, { label: string; short: string; blurb: string }> = {
	defs: { label: 'Definitions & metarules', short: 'Definitions', blurb: 'Technical terms and the rules for reading rules. Consulted throughout a derivation.' },
	case: { label: 'Compounds & case', short: 'Compounds & case', blurb: 'Which words combine into compounds, and which case (vibhakti) expresses which kāraka.' },
	verbal: { label: 'Affixes after roots', short: 'Verbal affixes', blurb: 'Affixes added after a dhātu: tense/mood (lakāra) and its tiṅ endings, vikaraṇas, sanādi, and kṛt affixes that make nouns from verbs.' },
	nominal: { label: 'Affixes after stems', short: 'Nominal affixes', blurb: 'Affixes added after a nominal stem: feminine (strī), case endings (sup) and derivational taddhitas.' },
	stem: { label: 'Stem & junction operations', short: 'Stem operations', blurb: 'Reduplication, sandhi, accent, augments, guṇa/vṛddhi, and changes to the stem (aṅga) before an affix.' },
	pada: { label: 'Words in the sentence', short: 'Word level', blurb: 'Repetition of words and accent of words in a sentence (8.1).' },
	tri: { label: 'Tripādī (final phonology)', short: 'Tripādī', blurb: 'The last three pādas (8.2–8.4): treated as not-yet-applied (asiddha) by every earlier rule, so they act as a final, one-way phonological pass.' }
};
export const BAND_ORDER: Band[] = ['defs', 'case', 'verbal', 'nominal', 'stem', 'pada', 'tri'];

export type Key = { n: string; why: string };
export type AdhyayaInfo = { a: number; band: Band; title: string; short: string; summary: string; headings: string[]; keys: Key[] };
export type PadaInfo = { a: number; p: number; band: Band; title: string; summary: string; keys: Key[] };

export const ADHYAYAS: AdhyayaInfo[] = [
	{
		a: 1,
		short: 'Definitions',
		band: 'defs',
		title: 'Definitions & metarules',
		summary:
			'Sets up the vocabulary the rest of the grammar runs on (vṛddhi, guṇa, it, dhātu, prātipadika, pada, kāraka, person and number) and the metarules that say how rules are to be read and applied.',
		headings: ['1.4.1', '1.4.23', '1.4.56'],
		keys: [
			{ n: '1.1.1', why: 'The first definition: ā, ai, au are vṛddhi.' },
			{ n: '1.1.49', why: 'A genitive in a rule means "in place of".' },
			{ n: '1.3.1', why: 'Defines dhātu (verbal root): the input list for verbs.' },
			{ n: '1.4.2', why: 'In a conflict between two rules, the later one wins.' }
		]
	},
	{
		a: 2,
		short: 'Compounds & case',
		band: 'case',
		title: 'Compounds, case & deletions',
		summary:
			'Compounds (samāsa) and their types; which case ending expresses which kāraka relation; then the number and gender of compounds, root substitutes before ārdhadhātuka affixes, and zero-deletions (luk) of affixes.',
		headings: ['2.1.3', '2.3.1', '2.4.35'],
		keys: [
			{ n: '2.1.1', why: 'Only semantically connected words combine.' },
			{ n: '2.3.2', why: 'The accusative expresses an object (karman) not otherwise expressed.' },
			{ n: '2.4.71', why: 'Case endings inside a root or stem are deleted (luk).' }
		]
	},
	{
		a: 3,
		short: 'Root affixes',
		band: 'verbal',
		title: 'Affixes after roots',
		summary:
			'Opens the long affix section (3.1.1 pratyayaḥ, 3.1.2 paraś ca, running to the end of 5.4). Adhyāya 3 covers affixes added after a dhātu: sanādi affixes that make new roots, the vikaraṇas, kṛt affixes (which make nouns and participles from verbs), and the lakāras that express tense and mood, replaced by tiṅ endings.',
		headings: ['3.1.1', '3.1.2', '3.1.91'],
		keys: [
			{ n: '3.1.68', why: 'The default vikaraṇa śap between root and ending (bhav-a-ti).' },
			{ n: '3.1.133', why: 'Agent-noun affixes ṇvul and tṛc (pācaka, kartṛ).' },
			{ n: '3.2.123', why: 'laṭ for the present.' },
			{ n: '3.4.78', why: 'The l of a lakāra is replaced by a tiṅ ending (ti, tas, anti …).' }
		]
	},
	{
		a: 4,
		short: 'Stem affixes I',
		band: 'nominal',
		title: 'Affixes after stems (I)',
		summary:
			'Affixes added after a nominal stem (4.1.1, in force to 5.4.160): the 21 case endings (sup), feminine affixes (ṭāp, ṅīp …), and the start of the taddhitas: derived nouns for "descendant of", "dyed with", "deity of", "born in", "made of" and many more.',
		headings: ['4.1.1', '4.1.3', '4.1.76'],
		keys: [
			{ n: '4.1.2', why: 'The 21 sup (case) endings su, au, jas …' },
			{ n: '4.1.4', why: 'Feminine ṭāp: aja → ajā.' },
			{ n: '4.1.92', why: '"His descendant": upagu → aupagava.' }
		]
	},
	{
		a: 5,
		short: 'Stem affixes II',
		band: 'nominal',
		title: 'Affixes after stems (II)',
		summary:
			'More taddhitas: "good for", "bought with", "similar to", abstract nouns (-tva, -tā), possessives (-mat/-vat), pronominal adverbs (tatra, tataḥ), comparatives and superlatives (-tara, -tama), and affixes that close compounds (samāsānta).',
		headings: ['5.1.1', '5.3.1', '5.4.68'],
		keys: [
			{ n: '5.1.119', why: 'Abstract nouns in -tva and -tā (guru → gurutva).' },
			{ n: '5.2.94', why: 'Possessive matup ("having X").' },
			{ n: '5.3.55', why: 'Superlative -tama and -iṣṭha.' }
		]
	},
	{
		a: 6,
		short: 'Stem operations I',
		band: 'stem',
		title: 'Reduplication, sandhi, accent, stem changes',
		summary:
			'Operations on the string once affixes are in place: reduplication and saṃprasāraṇa, vowel sandhi at junctions (6.1.72 saṃhitāyām), accent, changes to the first member of compounds, and from 6.4.1 aṅgasya the long section of changes to the stem (aṅga) before an affix, which continues to the end of Adhyāya 7.',
		headings: ['6.1.1', '6.1.72', '6.4.1'],
		keys: [
			{ n: '6.1.8', why: 'Reduplication in the perfect (bhū → babhūva).' },
			{ n: '6.1.77', why: 'i, u, ṛ, ḷ → y, v, r, l before a vowel.' },
			{ n: '6.4.71', why: 'The augment a- of the past tenses (a-bhavat).' }
		]
	},
	{
		a: 7,
		short: 'Stem operations II',
		band: 'stem',
		title: 'Stem & affix operations (aṅga)',
		summary:
			'Still under 6.4.1 aṅgasya: replacing affixes after the stem (yu/vu → ana/aka, ṭā → ina), augments such as iṭ and num, guṇa and vṛddhi of the stem, changes of noun stems before case endings, and the rules for the reduplicated syllable.',
		headings: ['6.4.1', '7.4.58'],
		keys: [
			{ n: '7.1.1', why: 'vu → aka, yu → ana (ṇvul → -aka).' },
			{ n: '7.2.116', why: 'Penultimate a → ā before ṇit/ñit affixes (pac → pāc-aka).' },
			{ n: '7.3.84', why: 'Guṇa of the stem before an affix (bhū → bho).' }
		]
	},
	{
		a: 8,
		short: 'Sentence · Tripādī',
		band: 'tri',
		title: 'Words in the sentence, then the Tripādī',
		summary:
			'Pāda 1 repeats words and fixes the accent of words in a sentence. From 8.2.1 pūrvatrāsiddham the last three pādas form the Tripādī: each of its rules is treated as not applied (asiddha) by all earlier rules, and by earlier rules within it. This is where final-consonant changes, rutva/visarga, retroflexion (ṣ, ṇ) and assimilation happen.',
		headings: ['8.1.16', '8.2.1'],
		keys: [
			{ n: '8.2.1', why: 'The Tripādī is invisible to earlier rules.' },
			{ n: '8.3.15', why: 'Final r/s → visarga (rāmas → rāmaḥ).' },
			{ n: '8.4.2', why: 'n → ṇ after r/ṣ even across vowels and labials (rāmeṇa).' }
		]
	}
];

export const PADAS: PadaInfo[] = [
	// ---- 1
	{ a: 1, p: 1, band: 'defs', title: 'Basic terms; how to read a rule', summary: 'vṛddhi and guṇa (1.1.1–3), savarṇa, pragṛhya, sarvanāma, avyaya; metarules for substitution: the genitive means "in place of" (1.1.49), a substitute behaves like the original (1.1.56), locative/ablative mark the right/left context (1.1.66–67).', keys: [{ n: '1.1.1', why: 'vṛddhi' }, { n: '1.1.2', why: 'guṇa' }, { n: '1.1.49', why: 'genitive = in place of' }, { n: '1.1.56', why: 'sthānivat' }, { n: '1.1.62', why: 'a deleted affix still counts' }] },
	{ a: 1, p: 2, band: 'defs', title: 'kit/ṅit status, accent, prātipadika', summary: 'Which affixes behave as kit or ṅit (1.2.1–26, an atideśa block; kit/ṅit affixes block guṇa by 1.1.5), the accent terms udātta/anudātta/svarita, the definition of a nominal stem (prātipadika, 1.2.45–46), upasarjana, and ekaśeṣa (one word standing for several, 1.2.64).', keys: [{ n: '1.2.1', why: 'kit/ṅit by extension' }, { n: '1.2.29', why: 'udātta' }, { n: '1.2.45', why: 'prātipadika' }, { n: '1.2.46', why: 'kṛt/taddhita/compound stems are prātipadikas' }, { n: '1.2.64', why: 'ekaśeṣa' }] },
	{ a: 1, p: 3, band: 'defs', title: 'dhātu, it-markers, voice', summary: 'Defines dhātu (1.3.1); marker letters (it, 1.3.2–8) and their deletion (1.3.9); then which roots take ātmanepada endings (1.3.12 onward) and which take parasmaipada (1.3.78).', keys: [{ n: '1.3.1', why: 'dhātu' }, { n: '1.3.2', why: 'nasal vowels are it' }, { n: '1.3.9', why: 'it is deleted' }, { n: '1.3.12', why: 'ātmanepada' }, { n: '1.3.78', why: 'parasmaipada elsewhere' }] },
	{ a: 1, p: 4, band: 'defs', title: 'One label each; kāraka; person & number', summary: 'Under 1.4.1, labels such as laghu/guru, aṅga (1.4.13), pada (1.4.14) and bha (1.4.18); the conflict rule 1.4.2; the six kārakas (1.4.23 kārake: apādāna 1.4.24 … kartṛ 1.4.54); nipāta, upasarga and gati (1.4.56ff); persons and numbers of verb endings (1.4.99–108).', keys: [{ n: '1.4.2', why: 'later rule wins' }, { n: '1.4.13', why: 'aṅga' }, { n: '1.4.14', why: 'pada' }, { n: '1.4.23', why: 'kāraka heading' }, { n: '1.4.49', why: 'karman' }, { n: '1.4.101', why: 'three persons' }] },
	// ---- 2
	{ a: 2, p: 1, band: 'case', title: 'Compounds: avyayībhāva, tatpuruṣa', summary: 'Only connected words combine (2.1.1). Under 2.1.3 samāsa: avyayībhāva compounds (2.1.5–21), then tatpuruṣa (from 2.1.22), including dvigu (2.1.52) and karmadhāraya types.', keys: [{ n: '2.1.1', why: 'sāmarthya' }, { n: '2.1.3', why: 'samāsa heading' }, { n: '2.1.5', why: 'avyayībhāva' }, { n: '2.1.22', why: 'tatpuruṣa' }, { n: '2.1.52', why: 'dvigu' }] },
	{ a: 2, p: 2, band: 'case', title: 'Compounds: bahuvrīhi, dvandva, order', summary: 'The rest of tatpuruṣa, then bahuvrīhi (2.2.23) and dvandva (2.2.29), and which member is placed first (2.2.30–38).', keys: [{ n: '2.2.23', why: 'bahuvrīhi' }, { n: '2.2.29', why: 'dvandva' }, { n: '2.2.30', why: 'upasarjana first' }] },
	{ a: 2, p: 3, band: 'case', title: 'Case for each kāraka', summary: 'Under 2.3.1 anabhihite ("if not already expressed"): accusative for the object (2.3.2), instrumental for agent and instrument (2.3.18), dative, ablative, locative; nominative for the bare stem meaning (2.3.46); genitive for the rest (2.3.50).', keys: [{ n: '2.3.1', why: 'if not already expressed' }, { n: '2.3.2', why: 'accusative' }, { n: '2.3.18', why: 'instrumental' }, { n: '2.3.46', why: 'nominative' }, { n: '2.3.50', why: 'genitive' }] },
	{ a: 2, p: 4, band: 'case', title: 'Number/gender of compounds; root substitutes; luk', summary: 'Singular and gender of certain compounds (2.4.1–31); substitutes for roots before ārdhadhātuka affixes (under 2.4.35, e.g. as → bhū 2.4.52); luk deletion of affixes, e.g. of a case ending inside a stem (2.4.71) and of śap after ad etc. (2.4.72).', keys: [{ n: '2.4.35', why: 'ārdhadhātuka heading' }, { n: '2.4.52', why: 'as → bhū' }, { n: '2.4.71', why: 'luk of sup' }, { n: '2.4.72', why: 'luk of śap' }] },
	// ---- 3
	{ a: 3, p: 1, band: 'verbal', title: 'sanādi, vikaraṇas, kṛtya, agent nouns', summary: 'Opens the affix headings (3.1.1–3). Affixes that make new roots: desiderative san (3.1.7), intensive yaṅ (3.1.22), causative ṇic (3.1.26); 3.1.32 calls the results dhātus. Then vikaraṇas (sya/tās 3.1.33, cli 3.1.43, śap 3.1.68, u 3.1.79 …). From 3.1.91 dhātoḥ: kṛtya affixes (3.1.95) and agent affixes ṇvul/tṛc (3.1.133).', keys: [{ n: '3.1.1', why: 'pratyaya heading' }, { n: '3.1.7', why: 'san (desiderative)' }, { n: '3.1.26', why: 'ṇic (causative)' }, { n: '3.1.68', why: 'śap' }, { n: '3.1.91', why: '"after a root" heading' }, { n: '3.1.133', why: 'ṇvul, tṛc' }] },
	{ a: 3, p: 2, band: 'verbal', title: 'kṛt with upapadas; past and present', summary: 'kṛt affixes after a root with a dependent word (3.2.1 karmaṇy aṇ …); past-time affixes (3.2.84 bhūte), including niṣṭhā kta/ktavatu (3.2.102) and laṅ/liṭ (3.2.111, 3.2.115); laṭ for the present (3.2.123) and its participles; habitual agents (3.2.134ff).', keys: [{ n: '3.2.84', why: 'past heading' }, { n: '3.2.102', why: 'niṣṭhā (kta)' }, { n: '3.2.111', why: 'laṅ' }, { n: '3.2.115', why: 'liṭ' }, { n: '3.2.123', why: 'laṭ' }] },
	{ a: 3, p: 3, band: 'verbal', title: 'uṇādi, future, action nouns, moods', summary: 'uṇādi affixes (3.3.1); future lṛṭ and luṭ (3.3.13, 3.3.15); action and instrument nouns: ghañ (3.3.18 bhāve), feminine ktin (3.3.94), lyuṭ (3.3.115); then the moods: liṅ (3.3.161) and loṭ (3.3.162).', keys: [{ n: '3.3.1', why: 'uṇādi' }, { n: '3.3.13', why: 'lṛṭ' }, { n: '3.3.18', why: 'ghañ heading' }, { n: '3.3.161', why: 'liṅ' }, { n: '3.3.162', why: 'loṭ' }] },
	{ a: 3, p: 4, band: 'verbal', title: 'Gerunds; lakāra → tiṅ endings', summary: 'Infinitive and gerund affixes (ktvā 3.4.21, ṇamul); voice of the lakāra (3.4.69); then under 3.4.77 lasya the l is replaced by the 18 tiṅ endings (3.4.78) with their adjustments; sārvadhātuka vs ārdhadhātuka (3.4.113–114).', keys: [{ n: '3.4.21', why: 'ktvā' }, { n: '3.4.69', why: 'voice' }, { n: '3.4.77', why: '"in place of l" heading' }, { n: '3.4.78', why: 'tiṅ endings' }, { n: '3.4.113', why: 'sārvadhātuka' }, { n: '3.4.114', why: 'ārdhadhātuka' }] },
	// ---- 4
	{ a: 4, p: 1, band: 'nominal', title: 'sup, feminine affixes, descendants', summary: 'After 4.1.1 ṅyāp-prātipadikāt: the sup endings (4.1.2); feminine affixes under 4.1.3 striyām (ṭāp 4.1.4, ṅīp 4.1.5 …); 4.1.76 taddhitāḥ opens the taddhitas, 4.1.83 makes aṇ the default, and 4.1.92 starts "his descendant" (apatya).', keys: [{ n: '4.1.1', why: 'after a stem heading' }, { n: '4.1.2', why: 'sup' }, { n: '4.1.4', why: 'ṭāp' }, { n: '4.1.76', why: 'taddhita heading' }, { n: '4.1.92', why: 'descendant' }] },
	{ a: 4, p: 2, band: 'nominal', title: 'Taddhitas: dyed, deity, group, place', summary: 'Taddhitas meaning "dyed with" (4.2.1), "whose deity is" (4.2.24), "a group of" (4.2.37), place names (4.2.67), and from 4.2.92 śeṣe the "remaining" senses such as "belonging to / coming from".', keys: [{ n: '4.2.24', why: 'deity' }, { n: '4.2.37', why: 'group' }, { n: '4.2.92', why: 'remaining senses' }] },
	{ a: 4, p: 3, band: 'nominal', title: 'Taddhitas: born in, his, made of', summary: 'Continuing the śeṣa senses: "born there" (4.3.25), "this is his" (4.3.120), "a product of" (4.3.134), with many stem-specific affixes.', keys: [{ n: '4.3.25', why: 'born there' }, { n: '4.3.120', why: 'this is his' }, { n: '4.3.134', why: 'product of' }] },
	{ a: 4, p: 4, band: 'nominal', title: 'ṭhak and yat senses', summary: 'Two default-affix blocks: ṭhak for senses like "plays / digs / wins with" (4.4.2) and "lives by" (4.4.12), from 4.4.1 to 4.4.74; and yat for senses like "what bears it" (4.4.76), from 4.4.75 to the end of the pāda.', keys: [{ n: '4.4.1', why: 'ṭhak heading' }, { n: '4.4.75', why: 'yat heading' }] },
	// ---- 5
	{ a: 5, p: 1, band: 'nominal', title: 'cha and ṭhañ senses; abstract nouns', summary: 'Default-affix blocks: cha (5.1.1), e.g. for "good for" (5.1.5); ṭhañ (5.1.18), e.g. for "bought with" (5.1.37); vati "like" (5.1.115); abstract nouns in -tva/-tā (5.1.119).', keys: [{ n: '5.1.1', why: 'cha heading' }, { n: '5.1.5', why: 'good for' }, { n: '5.1.18', why: 'ṭhañ heading' }, { n: '5.1.37', why: 'bought with' }, { n: '5.1.115', why: 'vati' }, { n: '5.1.119', why: 'tva, tal' }] },
	{ a: 5, p: 2, band: 'nominal', title: 'Fields, measures, possessives', summary: 'Affixes for fields of a crop, measures and quantities (5.2.41), and the possessive senses "who has / in which is" with matup (5.2.94) and its rivals (-in/-ika 5.2.115, -vin 5.2.121 …).', keys: [{ n: '5.2.94', why: 'matup' }] },
	{ a: 5, p: 3, band: 'nominal', title: 'Pronominal adverbs, comparison', summary: 'Under 5.3.1, case-like affixes on pronouns (tasil 5.3.7, tral 5.3.10: tataḥ, tatra); comparatives and superlatives (5.3.55, 5.3.57); ka for "unknown" and diminutive (5.3.70 heading; 5.3.73, 5.3.86).', keys: [{ n: '5.3.1', why: 'vibhakti-like affixes' }, { n: '5.3.10', why: 'tral' }, { n: '5.3.55', why: 'superlative' }, { n: '5.3.57', why: 'comparative' }] },
	{ a: 5, p: 4, band: 'nominal', title: 'Meaning-preserving affixes; compound finals', summary: 'Affixes that do not change the sense (svārthika) and the samāsānta affixes added at the end of compounds (5.4.68 to the end of 5.4), which closes the affix section opened at 3.1.1.', keys: [{ n: '5.4.68', why: 'samāsānta heading' }] },
	// ---- 6
	{ a: 6, p: 1, band: 'stem', title: 'Reduplication, saṃprasāraṇa, sandhi, accent', summary: 'Reduplication (6.1.1, in the perfect 6.1.8); saṃprasāraṇa (y/v → i/u, e.g. 6.1.15); sandhi under 6.1.72 saṃhitāyām: yaṇ (6.1.77), ay/āv (6.1.78), single replacements under 6.1.84 (guṇa 6.1.87, long vowel 6.1.101); deletion of su/ti/si after consonants and ī/ā (6.1.68); accent from 6.1.158.', keys: [{ n: '6.1.8', why: 'reduplication' }, { n: '6.1.68', why: 'loss of -s after ī/ā' }, { n: '6.1.77', why: 'yaṇ sandhi' }, { n: '6.1.87', why: 'guṇa sandhi' }, { n: '6.1.101', why: 'savarṇa dīrgha' }] },
	{ a: 6, p: 2, band: 'stem', title: 'Accent of compounds', summary: 'Which syllable of a compound carries the udātta accent: first member keeps its accent (6.2.1 …), then headings for initial and final accent of the second member (6.2.64, 6.2.92, 6.2.111, 6.2.143).', keys: [{ n: '6.2.1', why: 'bahuvrīhi accent' }] },
	{ a: 6, p: 3, band: 'stem', title: 'First member of compounds', summary: 'Changes to the first member before a second member: non-deletion of its case ending (6.3.1 aluk), mahat → mahā (6.3.46), lengthening and other substitutions, and (under 6.3.114 saṃhitāyām) lengthening of a final vowel before certain words.', keys: [{ n: '6.3.1', why: 'aluk heading' }, { n: '6.3.46', why: 'mahā-' }] },
	{ a: 6, p: 4, band: 'stem', title: 'aṅga operations begin', summary: '6.4.1 aṅgasya opens the stem section (to 7.4.97). Lengthening, nasal deletion (6.4.37), the past-tense augment a- (6.4.71), and from 6.4.22 a block treated as asiddha among itself; bha-stem operations (6.4.129ff, e.g. 6.4.148).', keys: [{ n: '6.4.1', why: 'aṅga heading' }, { n: '6.4.22', why: 'asiddhavat block' }, { n: '6.4.37', why: 'nasal deletion' }, { n: '6.4.71', why: 'aṭ augment' }, { n: '6.4.148', why: 'final a/i of bha deleted' }] },
	// ---- 7
	{ a: 7, p: 1, band: 'stem', title: 'Affix substitutes after the stem; num', summary: 'Replacements of affixes after particular stems: yu/vu → ana/aka (7.1.1), jh → ant (7.1.3), bhis → ais (7.1.9), ṭā → ina (7.1.12); the augment num (7.1.58 …).', keys: [{ n: '7.1.1', why: 'yu, vu → ana, aka' }, { n: '7.1.3', why: 'jh → ant' }, { n: '7.1.12', why: 'ṭā → ina' }, { n: '7.1.58', why: 'num' }] },
	{ a: 7, p: 2, band: 'stem', title: 'iṭ augment; vṛddhi; pronouns', summary: 'vṛddhi in the s-aorist (7.2.1); the iṭ augment and when it is blocked (7.2.10, 7.2.35); pronoun stem substitutions (7.2.102); vṛddhi before ñit/ṇit affixes (7.2.115–117).', keys: [{ n: '7.2.10', why: 'no iṭ' }, { n: '7.2.35', why: 'iṭ' }, { n: '7.2.102', why: 'tyadādi → a' }, { n: '7.2.115', why: 'vṛddhi of final vowel' }, { n: '7.2.116', why: 'vṛddhi of penultimate a' }] },
	{ a: 7, p: 3, band: 'stem', title: 'guṇa; noun stems before endings', summary: 'Taddhita vṛddhi variants (7.3.1–31); k/g for c/j (7.3.52); gam → gacch (7.3.77); guṇa before affixes (7.3.84); stem changes before case endings (7.3.102 lengthening, 7.3.103 -e-, 7.3.119).', keys: [{ n: '7.3.52', why: 'c/j → k/g' }, { n: '7.3.77', why: 'gam → gacch' }, { n: '7.3.84', why: 'guṇa' }, { n: '7.3.102', why: 'lengthening before sup' }] },
	{ a: 7, p: 4, band: 'stem', title: 'Causative aorist; the reduplicated syllable', summary: 'Shortening in the causative aorist (7.4.1), various stem substitutions, then under 7.4.58 the shape of the reduplicated syllable: short vowel (7.4.59), only the first consonant kept (7.4.60), k → c (7.4.62).', keys: [{ n: '7.4.1', why: 'causative aorist' }, { n: '7.4.58', why: 'abhyāsa heading' }, { n: '7.4.59', why: 'short' }, { n: '7.4.60', why: 'first consonant' }, { n: '7.4.62', why: 'k → c' }] },
	// ---- 8
	{ a: 8, p: 1, band: 'pada', title: 'Repetition; accent in the sentence', summary: 'Doubling of words (8.1.1, e.g. for "every" 8.1.4); 8.1.16 padasya heads the word-level rules to 8.3.54; accent of words in a sentence, e.g. a finite verb loses its accent after a non-verb (8.1.28).', keys: [{ n: '8.1.1', why: 'doubling heading' }, { n: '8.1.4', why: 'repetition' }, { n: '8.1.16', why: 'pada heading' }, { n: '8.1.28', why: 'verb unaccented' }] },
	{ a: 8, p: 2, band: 'tri', title: 'Tripādī begins: final consonants', summary: '8.2.1 pūrvatrāsiddham. Deletion of final n of a stem (8.2.7) and of the last of a final cluster (8.2.23); c/j → k/g (8.2.30); voiced finals (8.2.39); niṣṭhā t → n (8.2.42); s → ru (8.2.66); pluta vowels (8.2.82ff).', keys: [{ n: '8.2.1', why: 'asiddha' }, { n: '8.2.7', why: 'final n deleted' }, { n: '8.2.39', why: 'jaś at word end' }, { n: '8.2.66', why: 's → ru' }] },
	{ a: 8, p: 3, band: 'tri', title: 'Visarga, anusvāra, s → ṣ', summary: 'ru/r → visarga (8.3.15), final m → anusvāra (8.3.23), and the retroflex ṣ (8.3.55 heading; 8.3.59 after i/u etc.).', keys: [{ n: '8.3.15', why: 'visarga' }, { n: '8.3.23', why: 'anusvāra' }, { n: '8.3.55', why: 'retroflex heading' }, { n: '8.3.59', why: 's → ṣ' }] },
	{ a: 8, p: 4, band: 'tri', title: 'n → ṇ; assimilation; last rule', summary: 'ṇatva (8.4.1, 8.4.2); assimilation of s/dentals to palatals (8.4.40) and of stops in voicing (8.4.53, 8.4.55); svarita accent (8.4.66); and the last sūtra 8.4.68 a a, restoring the closed short a.', keys: [{ n: '8.4.1', why: 'ṇatva' }, { n: '8.4.2', why: 'ṇatva across letters' }, { n: '8.4.40', why: 'ścutva' }, { n: '8.4.55', why: 'cartva' }, { n: '8.4.68', why: 'last sūtra' }] }
];

export const padaInfo = (a: number, p: number) => PADAS.find((x) => x.a === a && x.p === p)!;
export const adhyayaInfo = (a: number) => ADHYAYAS[a - 1];
export const bandOf = (a: number, p: number): Band => padaInfo(a, p).band;
/** "6.1.77" → band */
export const bandOfN = (n: string): Band => {
	const [a, p] = n.split('.').map(Number);
	return a >= 1 && a <= 8 && p >= 1 && p <= 4 ? bandOf(a, p) : 'defs';
};

/** Every sūtra number cited in this file (validated against the corpus at build time). */
export function citedNumbers(): string[] {
	const out = new Set<string>();
	for (const a of ADHYAYAS) {
		a.headings.forEach((n) => out.add(n));
		a.keys.forEach((k) => out.add(k.n));
	}
	for (const p of PADAS) p.keys.forEach((k) => out.add(k.n));
	return [...out];
}

export const SOURCES = [
	{ id: 'kiparsky', text: 'Paul Kiparsky, "On the Architecture of Pāṇini’s Grammar", in G. Huet, A. Kulkarni, P. Scharf (eds.), Sanskrit Computational Linguistics (LNCS 5402), Springer, 2009 (symposium paper, 2007).', url: 'https://link.springer.com/book/10.1007/978-3-642-00155-0' },
	{ id: 'cardona', text: 'George Cardona, Pāṇini: A Survey of Research, The Hague: Mouton, 1976; and Pāṇini: His Work and its Traditions, vol. 1, Delhi: Motilal Banarsidass, 1988 (2nd ed. 1997).', url: '' },
	{ id: 'sharma', text: 'Rama Nath Sharma, The Aṣṭādhyāyī of Pāṇini, vol. 1: Introduction to the Aṣṭādhyāyī as a Grammatical Device, New Delhi: Munshiram Manoharlal, 1987.', url: '' },
	{ id: 'learnsanskrit', text: 'learnsanskrit.org, "An overview of the Aṣṭādhyāyī" (chapter-by-chapter contents and the four stages of a derivation).', url: 'https://learnsanskrit.org/vyakarana/introduction/an-overview-of-the-ashtadhyayi/' },
	{ id: 'wikipedia', text: 'Wikipedia, "Aṣṭādhyāyī": "takes material from lexical lists (Dhātupāṭha, Gaṇapāṭha) as input and describes algorithms to be applied to them for generation of well-formed words."', url: 'https://en.wikipedia.org/wiki/A%E1%B9%A3%E1%B9%AD%C4%81dhy%C4%81y%C4%AB' }
];
