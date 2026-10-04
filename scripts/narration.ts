// Turn explainer captions into speakable text for Kokoro (English G2P), and list synthesis jobs.
//   src/lib/explainers/*/narration.json → generated/narration-jobs.json
// Then run: ~/.cache/kokoro/venv/bin/python scripts/tts.py
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { devaToIast } from '../src/lib/translit.ts';

const ROOT = join(import.meta.dirname, '..');
const DIR = join(ROOT, 'src', 'lib', 'explainers');
const VOICE = 'af_heart';

// Whole-word respellings for terms English G2P gets wrong (IAST, lowercase).
const RESPELL: Record<string, string> = {
	'sūtra': 'sootra', 'sūtras': 'sootras', 'pāṇini': 'Paanini', "pāṇini's": "Paanini's", 'śiva': 'Shiva', "śiva's": "Shiva's",
	'pratyāhāra': 'prut-yaa-haara', 'pratyāhāras': 'prut-yaa-haaras', 'anuvṛtti': 'unoo-vritti', 'adhikāra': 'udhi-kaara',
	'adhikāras': 'udhi-kaaras', 'kāśikā': 'Kaashikaa', 'apavāda': 'upa-vaada', 'saṃhitā': 'sum-hitaa', 'śap': 'shup',
	'it': 'it', 'aṣṭādhyāyī': 'ush-taadh-yaa-yee', 'paribhāṣā': 'pari-bhaa-shaa', 'vidhi': 'vidhi'
};

// A lone vowel letter is said as its sound ("इ" → "ee", not the pronoun "I").
const VOWEL_NAMES: Record<string, string> = {
	a: 'uh', 'ā': 'aa', i: 'ee', 'ī': 'ee', u: 'oo', 'ū': 'oo', 'ṛ': 'ri', 'ḷ': 'lri', e: 'ay', ai: 'ai', o: 'oh', au: 'ow'
};

// IAST → rough English spelling for anything not in the dictionary.
function spell(iast: string): string {
	return iast
		.replace(/ā/g, 'aa').replace(/ī/g, 'ee').replace(/ū/g, 'oo')
		.replace(/ṝ/g, 'ree').replace(/ṛ/g, 'ri').replace(/ḹ/g, 'lree').replace(/ḷ/g, 'lri')
		.replace(/ai/g, 'ai').replace(/au/g, 'ow')
		.replace(/[śṣ]/g, 'sh').replace(/ch/g, 'chh').replace(/c(?!h)/g, 'ch')
		.replace(/ñ/g, 'ny').replace(/ṅ/g, 'ng').replace(/ṇ/g, 'n').replace(/ṭ/g, 't').replace(/ḍ/g, 'd')
		.replace(/ṃ/g, 'm').replace(/ḥ/g, 'h').replace(/m̐/g, 'm');
}

function speakable(text: string): string {
	let t = text
		// sūtra numbers: "1.3.3" → "1 3 3" (read "one three three")
		.replace(/\b(\d)\.(\d)\.(\d+)\b/g, '$1 $2 $3')
		// Devanagari words: lone consonant markers get their "a" (च् → cha)
		.replace(/[ऀ-ॿ]+(?:-[ऀ-ॿ]+)*/g, (w) => {
			const parts = w.split('-').map((p) => {
				const iast = devaToIast(p);
				if (VOWEL_NAMES[iast]) return VOWEL_NAMES[iast];
				const bare = iast.match(/^([^aeiouāīūṛṝḷḹ]+)$/) ? iast + 'a' : iast;
				return RESPELL[bare.toLowerCase()] ?? spell(bare);
			});
			return parts.join(', ');
		});
	// romanized Sanskrit words with diacritics
	t = t.replace(/[A-Za-zĀāĪīŪūṚṛṜṝḶḷŚśṢṣṆṇṬṭḌḍÑñṄṅṂṃḤḥ']+/g, (w) => {
		const key = w.toLowerCase();
		if (RESPELL[key]) return /^[A-ZĀĪŪŚṢ]/.test(w) && !/^[A-Z]/.test(RESPELL[key]) ? RESPELL[key][0].toUpperCase() + RESPELL[key].slice(1) : RESPELL[key];
		return /[āīūṛṝḷḹśṣṇṭḍñṅṃḥ]/i.test(w) ? spell(w) : w;
	});
	return t.replace(/\s+/g, ' ').trim();
}

const jobs: { slug: string; id: string; text: string; say: string; out: string }[] = [];
for (const slug of readdirSync(DIR)) {
	const f = join(DIR, slug, 'narration.json');
	if (!existsSync(f)) continue;
	const n: Record<string, string> = JSON.parse(readFileSync(f, 'utf8'));
	for (const [id, text] of Object.entries(n)) {
		const say = speakable(text);
		const h = createHash('md5').update(say + VOICE).digest('hex').slice(0, 8);
		jobs.push({ slug, id, text, say, out: `audio/${slug}/${id}.${h}.mp3` });
	}
}
mkdirSync(join(ROOT, 'generated'), { recursive: true });
writeFileSync(join(ROOT, 'generated', 'narration-jobs.json'), JSON.stringify({ voice: VOICE, jobs }, null, 1));
console.log(`${jobs.length} narration clips listed`);
if (process.argv.includes('--show')) for (const j of jobs) console.log(`\n[${j.slug}/${j.id}]\n${j.say}`);
