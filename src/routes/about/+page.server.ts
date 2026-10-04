import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const meta = JSON.parse(readFileSync(join(process.cwd(), 'static', 'data', 'meta.json'), 'utf8'));
	return { meta };
};
