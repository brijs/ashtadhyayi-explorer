// Phonetic features of varṇas (places as in the Laghu-siddhānta-kaumudī; effort as in the śikṣā tradition),
// and a "nearest" chooser modelled on 1.1.50 स्थानेऽन्तरतमः. Varṇas use the forms of varna.ts (क्, अ, …).
import { pratyahara, SHIVA_FLAT, splitPratyaharaName } from './varna.ts';

export type Place = 'kantha' | 'talu' | 'murdha' | 'danta' | 'oshtha' | 'nasika';
export type Features = { places: Place[]; vowel: boolean; long?: boolean; voiced: boolean; asp: boolean; nasal: boolean };

const F: Record<string, Features> = {};
const v = (s: string, places: Place[], long = false) => (F[s] = { places, vowel: true, long, voiced: true, asp: false, nasal: false });
v('अ', ['kantha']); v('आ', ['kantha'], true);
v('इ', ['talu']); v('ई', ['talu'], true);
v('उ', ['oshtha']); v('ऊ', ['oshtha'], true);
v('ऋ', ['murdha']); v('ॠ', ['murdha'], true);
v('ऌ', ['danta']);
v('ए', ['kantha', 'talu'], true); v('ऐ', ['kantha', 'talu'], true);
v('ओ', ['kantha', 'oshtha'], true); v('औ', ['kantha', 'oshtha'], true);

const STOPS: [Place, string][] = [['kantha', 'कखगघङ'], ['talu', 'चछजझञ'], ['murdha', 'टठडढण'], ['danta', 'तथदधन'], ['oshtha', 'पफबभम']];
for (const [place, row] of STOPS) {
	[...row].forEach((c, i) => {
		F[c + '्'] = { places: i === 4 ? [place, 'nasika'] : [place], vowel: false, voiced: i >= 2, asp: i === 1 || i === 3, nasal: i === 4 };
	});
}
const c = (s: string, places: Place[], voiced: boolean, asp: boolean) => (F[s + '्'] = { places, vowel: false, voiced, asp, nasal: false });
c('य', ['talu'], true, false); c('र', ['murdha'], true, false); c('ल', ['danta'], true, false); c('व', ['danta', 'oshtha'], true, false);
c('श', ['talu'], false, true); c('ष', ['murdha'], false, true); c('स', ['danta'], false, true);
c('ह', ['kantha'], true, true);

export const features = (s: string): Features | undefined => F[s];

/** Similar-sound expansion for vowels (1.1.69 अणुदित् सवर्णस्य चाप्रत्ययः): इ also stands for ई, etc. */
const LONG_OF: Record<string, string> = { 'अ': 'आ', 'इ': 'ई', 'उ': 'ऊ', 'ऋ': 'ॠ' };

/** Letters denoted by a pratyāhāra name like "इक्" (with long vowels added), or a single sound like "य्"/"ए". */
export function lettersOf(name: string): string[] {
	if (F[name]) return LONG_OF[name] ? [name, LONG_OF[name]] : [name];
	const split = splitPratyaharaName(name);
	if (!split) return [];
	const r = pratyahara(split[0], split[1]);
	if (!r) return [];
	return r.letters.flatMap((l) => (LONG_OF[l] ? [l, LONG_OF[l]] : [l])).filter((l, i, a) => a.indexOf(l) === i);
}

/** Score how near `b` is to `a` (higher is nearer): place first, then effort. */
export function nearness(a: string, b: string): number {
	const fa = F[a];
	const fb = F[b];
	if (!fa || !fb) return -99;
	const shared = fa.places.filter((p) => fb.places.includes(p)).length;
	const extra = fb.places.filter((p) => !fa.places.includes(p)).length;
	let s = 4 * shared - extra;
	if (fa.vowel === fb.vowel) s += 2;
	if (fa.voiced === fb.voiced) s += 1;
	if (fa.asp === fb.asp) s += 1;
	if (fa.nasal === fb.nasal) s += 1;
	if (fa.vowel && fb.vowel && !!fa.long === !!fb.long) s += 0.5;
	return s;
}

/** 1.1.50: among candidate substitutes, the nearest to the original. */
export function nearest(original: string, candidates: string[]): string {
	return candidates.reduce((best, c) => (nearness(original, c) > nearness(original, best) ? c : best), candidates[0]);
}

/** All pratyāhāra names derivable from the Śiva sūtras that Pāṇini actually uses (for pickers). */
export const COMMON_CLASSES = ['अच्', 'हल्', 'इक्', 'यण्', 'एच्', 'एङ्', 'अक्', 'झल्', 'जश्', 'चर्', 'झश्', 'खर्', 'शर्', 'यर्', 'झय्', 'हश्', 'अण्', 'इण्', 'यञ्', 'मय्'];
export const ALL_SLOTS = SHIVA_FLAT;
