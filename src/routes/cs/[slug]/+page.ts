import { error } from '@sveltejs/kit';
import { EXPLAINER_MODULES } from '#lib/explainers/registry.ts';
import manifest from '#lib/explainers/audio-manifest.json';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	const mod = EXPLAINER_MODULES[data.slug];
	if (!mod) error(404, 'Explainer not found');
	const def = (await mod()).default;
	return { ...data, def, clips: (manifest as Record<string, Record<string, string>>)[data.slug] ?? {} };
};
