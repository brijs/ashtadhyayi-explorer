import type { ExplainerDef } from '#lib/explainer/types.ts';
import narration from './narration.json';
import Verse from './scenes/Verse.svelte';
import Sort from './scenes/Sort.svelte';
import Counts from './scenes/Counts.svelte';
import Niyama from './scenes/Niyama.svelte';
import QuizScene from './scenes/QuizScene.svelte';

const def: ExplainerDef = {
	slug: 'sutra-types',
	title: 'Six kinds of sūtra',
	sa: 'सूत्रप्रकाराः',
	guide: 'shishya',
	narration,
	scenes: [
		{ id: 'verse', title: 'Six kinds in one verse', component: Verse, mood: 'happy' },
		{ id: 'sort', title: 'Sort them', component: Sort, mood: 'think' },
		{ id: 'counts', title: 'How many of each?', component: Counts },
		{ id: 'niyama', title: 'A restriction at work', component: Niyama, mood: 'surprised' },
		{ id: 'quiz', title: 'Check yourself', component: QuizScene }
	]
};
export default def;
