import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { engineExamples, structureData, GROUPS } from '#lib/server/engine-data.ts';
import type { PageServerLoad } from './$types';

const readStatic = (f: string) => JSON.parse(readFileSync(join(process.cwd(), 'static', 'data', f), 'utf8'));

export const load: PageServerLoad = async () => {
	const examples = await engineExamples();
	const st = structureData();
	// which adhyāyas' rules fire in the curated examples (Aṣṭādhyāyī steps only)
	const exampleFires = [0, 0, 0, 0, 0, 0, 0, 0];
	for (const ex of examples) for (const r of ex.runs) for (const s of r.steps) if (s.source === 'ashtadhyayi') exampleFires[+s.code[0] - 1]++;
	const meta = readStatic('meta.json') as { count: number; typeCounts: Record<string, number> };
	const dhatuCount = (readStatic('dhatus.json') as unknown[]).length;
	return { examples, groups: GROUPS, st, exampleFires, meta, dhatuCount };
};
