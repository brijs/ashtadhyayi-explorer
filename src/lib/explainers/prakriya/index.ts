import type { ExplainerDef } from '#lib/explainer/types.ts';
import narration from './narration.json';
import Root from './scenes/Root.svelte';
import Tense from './scenes/Tense.svelte';
import Ending from './scenes/Ending.svelte';
import Vikarana from './scenes/Vikarana.svelte';
import Guna from './scenes/Guna.svelte';
import Sandhi from './scenes/Sandhi.svelte';
import Review from './scenes/Review.svelte';

const def: ExplainerDef = {
	slug: 'prakriya',
	title: 'Building a word: भू → भवति',
	sa: 'प्रक्रिया',
	guide: 'shishya',
	narration,
	scenes: [
		{ id: 'root', title: 'Start with a root', component: Root, mood: 'happy' },
		{ id: 'tense', title: 'Choose a tense', component: Tense, mood: 'think' },
		{ id: 'ending', title: 'Add a personal ending', component: Ending },
		{ id: 'vikarana', title: 'A connector: शप्', component: Vikarana },
		{ id: 'guna', title: 'Strengthen the root', component: Guna, mood: 'think' },
		{ id: 'sandhi', title: 'Join the sounds', component: Sandhi, mood: 'surprised' },
		{ id: 'review', title: 'The whole derivation', component: Review, mood: 'happy' }
	]
};
export default def;
