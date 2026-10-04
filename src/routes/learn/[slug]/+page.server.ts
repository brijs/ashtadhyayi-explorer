import { error } from '@sveltejs/kit';
import { EXPLAINERS } from '#lib/catalog.ts';
import { explainerData } from '#lib/server/explainer-data.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => EXPLAINERS.filter((e) => e.status === 'ready').map((e) => ({ slug: e.slug }));

export const load: PageServerLoad = ({ params }) => {
	const lesson = EXPLAINERS.find((e) => e.slug === params.slug && e.status === 'ready');
	if (!lesson) error(404, 'Explainer not found');
	return { slug: params.slug, sceneData: explainerData(params.slug) };
};
