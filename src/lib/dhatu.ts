// Dhātupāṭha helpers shared by the dhātus lesson and the Dhātupāṭha browser.
import type { Dhatu } from './vidyut.ts';

export const GANAS = ['Bhvadi', 'Adadi', 'Juhotyadi', 'Divadi', 'Svadi', 'Tudadi', 'Rudhadi', 'Tanadi', 'Kryadi', 'Curadi'] as const;

export const GANA_SA: Record<string, string> = {
	Bhvadi: 'भ्वादि', Adadi: 'अदादि', Juhotyadi: 'जुहोत्यादि', Divadi: 'दिवादि', Svadi: 'स्वादि',
	Tudadi: 'तुदादि', Rudhadi: 'रुधादि', Tanadi: 'तनादि', Kryadi: 'क्र्यादि', Curadi: 'चुरादि'
};
export const GANA_IAST: Record<string, string> = {
	Bhvadi: 'bhvādi', Adadi: 'adādi', Juhotyadi: 'juhotyādi', Divadi: 'divādi', Svadi: 'svādi',
	Tudadi: 'tudādi', Rudhadi: 'rudhādi', Tanadi: 'tanādi', Kryadi: 'kryādi', Curadi: 'curādi'
};
/** vidyut's antargaṇa ids → the sub-list's name (each is named after its first root). */
export const ANTAR_SA: Record<string, string> = { Ghatadi: 'घटादि', Akusmiya: 'आकुस्मीय', Asvadiya: 'आस्वदीय', Adhrshiya: 'आधृषीय' };

export type PadaMark = 'A' | 'U' | 'P';
/**
 * Which endings the root's own markers call for. Accent survives only in the SLP1 upadeśa (`\` anudātta, `^` svarita):
 * an anudātta it-vowel or ṅ → ātmanepada (1.3.12); a svarita it-vowel or ñ → both (1.3.72); otherwise parasmaipada (1.3.78).
 * Curādi roots add णिच्, which has its own rule (1.3.74), so callers should not apply this to them.
 */
export function padaMarker(d: Pick<Dhatu, 'a'>): PadaMark {
	const bare = d.a.replace(/[\\^]/g, '');
	if (/~\\/.test(d.a) || bare.endsWith('N')) return 'A';
	if (/~\^/.test(d.a) || bare.endsWith('Y')) return 'U';
	return 'P';
}
export const PADA_INFO: Record<PadaMark, { label: string; short: string; n: string }> = {
	A: { label: 'ātmanepada (middle)', short: 'Ā', n: '1.3.12' },
	U: { label: 'ubhayapada (both)', short: 'U', n: '1.3.72' },
	P: { label: 'parasmaipada (active)', short: 'P', n: '1.3.78' }
};
