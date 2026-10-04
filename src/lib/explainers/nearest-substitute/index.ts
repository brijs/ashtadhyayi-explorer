import type { ExplainerDef } from '#lib/explainer/types.ts';
import narration from './narration.json';
import Choice from './scenes/Choice.svelte';
import MapScene from './scenes/Map.svelte';
import Guna from './scenes/Guna.svelte';
import Union from './scenes/Union.svelte';
import Effort from './scenes/Effort.svelte';
import QuizScene from './scenes/QuizScene.svelte';

const def: ExplainerDef = {
	slug: 'nearest-substitute',
	title: 'The nearest substitute',
	sa: 'स्थानेऽन्तरतमः',
	guide: 'shishya',
	narration,
	scenes: [
		{ id: 'choice', title: 'Which guṇa?', component: Choice, mood: 'think' },
		{ id: 'map', title: 'A map of the mouth', component: MapScene },
		{ id: 'guna', title: 'Match by place', component: Guna, mood: 'happy' },
		{ id: 'union', title: 'Two sounds, one substitute', component: Union, mood: 'surprised' },
		{ id: 'effort', title: 'Nearest in effort', component: Effort, mood: 'think' },
		{ id: 'quiz', title: 'Check yourself', component: QuizScene }
	]
};
export default def;
