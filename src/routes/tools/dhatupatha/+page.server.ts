// Summary statistics for the Dhātupāṭha browser, computed once at prerender time; the list itself is fetched client-side.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { detectIts, itName } from '#lib/it.ts';
import type { Dhatu } from '#lib/vidyut.ts';
import { padaMarker } from '#lib/dhatu.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const list: Dhatu[] = JSON.parse(readFileSync(join(process.cwd(), 'static', 'data', 'dhatus.json'), 'utf8'));
	const ganas: Record<string, number> = {};
	const antar: Record<string, number> = {};
	const tags: Record<string, number> = {};
	const pada = { A: 0, U: 0, P: 0 };
	for (const d of list) {
		ganas[d.g] = (ganas[d.g] ?? 0) + 1;
		if (d.ag) antar[d.ag] = (antar[d.ag] ?? 0) + 1;
		const units = detectIts(d.d, 'dhatu');
		const names = new Set(units.map((_, i) => itName(units, i)).filter((x): x is string => !!x));
		for (const n of names) tags[n] = (tags[n] ?? 0) + 1;
		// curādi roots take णिच्, which brings its own pada rule (1.3.74), so only the other nine classes are counted
		if (d.g !== 'Curadi') pada[padaMarker(d)]++;
	}
	return {
		total: list.length,
		distinct: new Set(list.map((d) => d.a)).size,
		ganas,
		antar,
		tags: Object.entries(tags).sort((a, b) => b[1] - a[1]),
		pada,
		nonCuradi: list.length - (ganas.Curadi ?? 0)
	};
};
