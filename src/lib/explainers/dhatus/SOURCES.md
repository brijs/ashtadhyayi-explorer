# Sources for the "Where words come from" lesson

Each claim in the scenes, and where it comes from. "Corpus" = `generated/sutras.full.json` (ashtadhyayi.com data, incl. its Kāśikā text); "vidyut" = derivations run at prerender time in `explainer-data.ts` (loader `dhatus`); "vidyut data" = `static/data/dhatus.json` and `vidyut-rules.json`.

## Sūtras (corpus)
- 1.3.1 भूवादयो धातवः; 3.1.32 सनाद्यन्ता धातवः; 1.2.45 अर्थवदधातुरप्रत्ययः प्रातिपदिकम्; 1.2.46 कृत्तद्धितसमासाश्च; 1.1.27 सर्वादीनि सर्वनामानि; 3.3.1 उणादयो बहुलम्; 3.4.75 ताभ्यामन्यत्रोणादयः; 3.1.91 धातोः; 3.1.93 कृदतिङ्; 3.1.133 ण्वुल्तृचौ; 3.2.102 निष्ठा.
- Vikaraṇas: 3.1.68 कर्तरि शप्, 2.4.72 अदिप्रभृतिभ्यः शपः (luk), 2.4.75 जुहोत्यादिभ्यः श्लुः, 3.1.69 दिवादिभ्यः श्यन्, 3.1.73 स्वादिभ्यः श्नुः, 3.1.77 तुदादिभ्यः शः, 3.1.78 रुधादिभ्यः श्नम्, 3.1.79 तनादिकृञ्भ्य उः, 3.1.81 क्र्यादिभ्यः श्ना, 3.1.25 (…चुरादिभ्यो णिच्). For each gaṇa the lesson derives the class's first root with vidyut and marks whether that sūtra fires.
- Pāṇini names Śākaṭāyana in 3.4.111, 8.3.18, 8.4.50 and Gārgya in 7.3.99, 8.3.20, 8.4.67 (corpus search).
- Kāśikā on 1.3.1: धातुशब्दः पूर्वाचार्यसंज्ञा; only क्रियावचन roots. On 3.1.32: examples चिकीर्षति, पुत्रीयति, पुत्रकाम्यति. On 1.1.27: सर्व, विश्व, उभ, उभय, डतर, डतम, इतर, अन्य, अन्यतर, त्व, नेम, सम… On 5.2.127: अर्शस् etc., आकृतिगणश्चायम्. On 3.3.1: यतो विहितास्ततोऽन्यत्रापि भवन्ति। केचिदविहिता एव प्रयोगत उन्नीयन्ते, the Uṇ. 1.1 examples (कारुः …), and the verse नाम च धातुजमाह निरुक्ते व्याकरणे शकटस्य च तोकम् credited to म०भा० 3.3.1.

## vidyut (prerendered)
- पाचक (पच् + ण्वुल्, 3.1.133, 7.2.116, 1.2.46), कर्तृ (कृ + तृच्), गत (गम् + क्त, 6.4.37).
- बुभूषति (3.1.7 + 3.1.32), भावयति (3.1.26 + 3.1.32); causative root भावि.
- गो = गम् + डो via Uṇādi 2.68 गमेर्डोः, then 1.2.46; कारु = कृ + उण् via Uṇādi 1.1. (अश् + क्वन्, Uṇ. 1.149, gives no result in this vidyut build, so अश्व is not derived in the lesson.)
- Marker effects: अगमत् (ऌदित्, 3.1.55), स्फूर्ग्ण (ओदित् 8.2.45, आदित् 7.2.16), स्फूर्जथु (ट्वित्, 3.3.89), कृत्रिम (ड्वित्, 3.3.88). Present forms: भवति, एधते, करोति/कुरुते, पचति/पचते, गच्छति, स्फूर्जति.
- Pada from markers (Dhātupāṭha browser): anudātta it-vowel or ङ् → Ā (1.3.12), svarita it-vowel or ञ् → U (1.3.72), else P (1.3.78). Checked against vidyut's लट् derivations: agrees for 1,730 of the 1,737 non-curādi roots; the 7 others have their own rules (e.g. शद्, 1.3.60).

## vidyut data
- 2,229 Dhātupāṭha entries, 1,965 distinct upadeśas, per-gaṇa counts (Bhvādi 1,156 … Curādi 492), 4 antargaṇas; 748 Uṇādi sūtras in 5 pādas (157/123/160/238/70, the pañcapādī); 189 Liṅgānuśāsana entries.

## Scholarship
- Abhyankar, K. V., *A Dictionary of Sanskrit Grammar* (Baroda, 3rd ed. 1986), via https://kosha.sanskrit.today :
  - s.v. gaṇapāṭha: "the mention individually of the several words forming a class or gaṇa, named after the first word"; "traditionally ascribed to Pāṇini … questioned, however, by modern scholars"; lists Śikṣā, Dhātupāṭha, Liṅgānuśāsana as supplementary works. https://kosha.sanskrit.today/word/sa/गणपाठ
  - s.v. śākaṭāyana: grammarian quoted by Pāṇini, author of the Uṇādisūtrapāṭha, held that all substantives derive from roots. https://kosha.sanskrit.today/word/sa/शाकटायन
  - s.v. avyutpanna: उणादयोऽव्युत्पन्नानि प्रातिपदिकानि, M.Bh. on 1.1.61 vārt. 4; Paribhāṣenduśekhara 22. https://kosha.sanskrit.today/word/sa/अव्युत्पन्न
- Visigalli, P., "Philosophy of Grammar in Ancient India: Reinterpreting the Gārgya Controversy in Nirukta 1.12–1.14", *Acta Orientalia Acad. Sci. Hung.* 76.2 (2023) 169–192, doi:10.1556/062.2023.00307 — Śākaṭāyana and the etymologists: all nouns derive from verbs; Gārgya and the grammarians: only regular ones. https://real.mtak.hu/191914/
- Scharf, P., Sanskrit Library notes on the Mādhavīya-dhātuvṛtti index (2009): the Dhātupāṭha as integral to Pāṇini's system; 2,669 roots and variants indexed (with the Nāmadhātuvṛtti). https://www.sanskritlibrary.org/Sanskrit/Vyakarana/Dhatupatha/mdhvcanidx/disp1/CanIndexAbout.html
- Secondary: Wikipedia, "Unadi-Sutras" (authorship of the pañcapādī uncertain: Pāṇini, or predecessors such as Śākaṭāyana, Āpiśali; or Kātyāyana) https://en.wikipedia.org/wiki/Unadi-Sutras ; "Śākaṭāyana" ("a theory Pāṇini did not assert", citing Staal 2003, Katre 2015) https://en.wikipedia.org/wiki/Śākaṭāyana
- Popular root count: A. K. Aggarwal, *Dhatupatha of Panini* (1943 roots; 2056 with alternate listings), as summarised in bookseller listings. Used only to say "figures near 2,000".

## Not used (could not verify)
- That the meaning glosses (arthanirdeśa) were added by Bhīmasena: seen only in a search snippet from a Cambridge library catalogue page that refused access.
- Exact counts for the Kṣīrataraṅgiṇī recension; Liebich (1928) and Palsule (1955, 1961) concordances are the standard references for comparing recensions.
