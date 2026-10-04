export type Kind = { key: string; sa: string; iast: string; en: string; job: string; ex: { n: string; s: string; why: string } };
// Traditional verse: संज्ञा च परिभाषा च विधिर्नियम एव च । अतिदेशोऽधिकारश्च षड्विधं सूत्रलक्षणम् ॥
export const KINDS: Kind[] = [
	{ key: 'S', sa: 'संज्ञा', iast: 'saṃjñā', en: 'Definition', job: 'gives a technical name to a set of things', ex: { n: '1.1.1', s: 'वृद्धिरादैच्', why: 'names आ ऐ औ "vṛddhi"' } },
	{ key: 'P', sa: 'परिभाषा', iast: 'paribhāṣā', en: 'Meta-rule', job: 'tells you how to read and apply other rules', ex: { n: '1.1.49', s: 'षष्ठी स्थानेयोगा', why: 'the 6th case means "in place of"' } },
	{ key: 'V', sa: 'विधिः', iast: 'vidhi', en: 'Operation', job: 'prescribes a change: substitute, add, delete', ex: { n: '6.1.77', s: 'इको यणचि', why: 'i u ṛ ḷ → y v r l before a vowel' } },
	{ key: 'N', sa: 'नियमः', iast: 'niyama', en: 'Restriction', job: 'narrows where another rule applies', ex: { n: '1.4.8', s: 'पतिः समास एव', why: 'पति is "ghi" only in a compound' } },
	{ key: 'AT', sa: 'अतिदेशः', iast: 'atideśa', en: 'Extension', job: 'treats one thing as if it were another', ex: { n: '1.1.56', s: 'स्थानिवदादेशोऽनल्विधौ', why: 'a substitute behaves like what it replaced' } },
	{ key: 'AD', sa: 'अधिकारः', iast: 'adhikāra', en: 'Heading', job: 'its words carry into a block of rules', ex: { n: '3.1.1', s: 'प्रत्ययः', why: 'everything to 5.4.160 is an affix' } }
];
