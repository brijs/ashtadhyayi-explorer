// Places of articulation, as listed in the Laghu-siddhānta-kaumudī (अकुहविसर्जनीयानां कण्ठः, …).
export type Place = { key: string; en: string; sa: string; sounds: string[] };
export const PLACES: Place[] = [
	{ key: 'kantha', en: 'throat', sa: 'कण्ठः', sounds: ['अ', 'आ', 'क', 'ख', 'ग', 'घ', 'ङ', 'ह', 'ः'] },
	{ key: 'talu', en: 'palate', sa: 'तालु', sounds: ['इ', 'ई', 'च', 'छ', 'ज', 'झ', 'ञ', 'य', 'श'] },
	{ key: 'murdha', en: 'roof', sa: 'मूर्धा', sounds: ['ऋ', 'ॠ', 'ट', 'ठ', 'ड', 'ढ', 'ण', 'र', 'ष'] },
	{ key: 'danta', en: 'teeth', sa: 'दन्ताः', sounds: ['ऌ', 'त', 'थ', 'द', 'ध', 'न', 'ल', 'स'] },
	{ key: 'oshtha', en: 'lips', sa: 'ओष्ठौ', sounds: ['उ', 'ऊ', 'प', 'फ', 'ब', 'भ', 'म'] },
	{ key: 'nasika', en: 'nose (also)', sa: 'नासिका', sounds: ['ञ', 'म', 'ङ', 'ण', 'न', 'ं'] }
];
/** Sounds made at two places. */
export const DOUBLE: Record<string, string[]> = { 'ए': ['kantha', 'talu'], 'ऐ': ['kantha', 'talu'], 'ओ': ['kantha', 'oshtha'], 'औ': ['kantha', 'oshtha'], 'व': ['danta', 'oshtha'] };

export function placesOf(s: string): string[] {
	if (DOUBLE[s]) return DOUBLE[s];
	return PLACES.filter((p) => p.sounds.includes(s)).map((p) => p.key);
}
export const placeName = (k: string) => PLACES.find((p) => p.key === k)!;
