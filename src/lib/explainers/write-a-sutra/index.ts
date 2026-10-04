import type { ExplainerDef } from '#lib/explainer/types.ts';
import narration from './narration.json';
import Intro from './scenes/Intro.svelte';
import Yan from './scenes/Yan.svelte';
import Jas from './scenes/Jas.svelte';
import Sandbox from './scenes/Sandbox.svelte';
import Reflect from './scenes/Reflect.svelte';

const def: ExplainerDef = {
	slug: 'write-a-sutra',
	title: 'Write your own sūtra',
	sa: 'सूत्ररचना',
	guide: 'bot',
	narration,
	scenes: [
		{ id: 'intro', title: 'Four slots, four cases', component: Intro, mood: 'happy' },
		{ id: 'yan', title: 'Challenge: semivowels', component: Yan, mood: 'think' },
		{ id: 'jas', title: 'Challenge: voicing', component: Jas, mood: 'think' },
		{ id: 'sandbox', title: 'Sandbox', component: Sandbox, mood: 'surprised' },
		{ id: 'reflect', title: 'What a real grammar needs', component: Reflect }
	]
};
export default def;
