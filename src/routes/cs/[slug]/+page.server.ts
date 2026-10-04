import { error } from '@sveltejs/kit';
import { CS_LESSONS } from '#lib/catalog.ts';
import { explainerData } from '#lib/server/explainer-data.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => CS_LESSONS.filter((e) => e.status === 'ready').map((e) => ({ slug: e.slug }));

export const load: PageServerLoad = async ({ params }) => {
	const lesson = CS_LESSONS.find((e) => e.slug === params.slug && e.status === 'ready');
	if (!lesson) error(404, 'Lesson not found');
	return { slug: params.slug, sceneData: await explainerData(params.slug) };
};
