import type { ExplainerDef } from '#lib/explainer/types.ts';
import narration from './narration.json';
import Split from './scenes/Split.svelte';
import Rajabhih from './scenes/Rajabhih.svelte';
import Order from './scenes/Order.svelte';
import Passes from './scenes/Passes.svelte';
import QuizScene from './scenes/QuizScene.svelte';

const def: ExplainerDef = {
	slug: 'asiddha',
	title: 'The invisible last three pādas',
	sa: 'पूर्वत्रासिद्धम्',
	guide: 'shishya',
	narration,
	scenes: [
		{ id: 'split', title: 'A grammar in two parts', component: Split, mood: 'surprised' },
		{ id: 'rajabhih', title: 'The case of राजभिः', component: Rajabhih, mood: 'think' },
		{ id: 'order', title: 'Strict order inside', component: Order },
		{ id: 'passes', title: 'Like compiler passes', component: Passes, mood: 'happy' },
		{ id: 'quiz', title: 'Check yourself', component: QuizScene }
	]
};
export default def;
