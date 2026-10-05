import type { ExplainerDef } from '#lib/explainer/types.ts';
import narration from './narration.json';
import Inputs from './scenes/Inputs.svelte';
import Ganas from './scenes/Ganas.svelte';
import WhatIs from './scenes/WhatIs.svelte';
import Markers from './scenes/Markers.svelte';
import Krdanta from './scenes/Krdanta.svelte';
import Ganapatha from './scenes/Ganapatha.svelte';
import Unadi from './scenes/Unadi.svelte';
import Claims from './scenes/Claims.svelte';
import QuizScene from './scenes/QuizScene.svelte';

const def: ExplainerDef = {
	slug: 'dhatus',
	title: 'Where words come from',
	sa: 'धातवः',
	guide: 'shishya',
	narration,
	scenes: [
		{ id: 'inputs', title: 'A rulebook needs a lexicon', component: Inputs, mood: 'think' },
		{ id: 'ganas', title: 'The Dhātupāṭha: ten classes of roots', component: Ganas, mood: 'happy' },
		{ id: 'what-is', title: 'What counts as a dhātu?', component: WhatIs, mood: 'think' },
		{ id: 'markers', title: 'A root is listed with its tags', component: Markers, mood: 'surprised' },
		{ id: 'krdanta', title: 'From root to noun: kṛt affixes', component: Krdanta, mood: 'happy' },
		{ id: 'ganapatha', title: 'The Gaṇapāṭha: "sarva and the rest"', component: Ganapatha },
		{ id: 'unadi', title: 'Uṇādi: are all nouns from verbs?', component: Unadi, mood: 'think' },
		{ id: 'claims', title: 'Common claims, checked', component: Claims, mood: 'think' },
		{ id: 'quiz', title: 'Check yourself', component: QuizScene }
	]
};
export default def;
