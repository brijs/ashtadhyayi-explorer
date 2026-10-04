import type { ExplainerDef } from '#lib/explainer/types.ts';
import narration from './narration.json';
import Maxim from './scenes/Maxim.svelte';
import Ranges from './scenes/Ranges.svelte';
import Bitsets from './scenes/Bitsets.svelte';
import Optimal from './scenes/Optimal.svelte';
import Zero from './scenes/Zero.svelte';
import QuizScene from './scenes/QuizScene.svelte';

const def: ExplainerDef = {
	slug: 'compression',
	title: 'Pratyāhāras as compression',
	sa: 'लाघवम्',
	guide: 'bot',
	narration,
	scenes: [
		{ id: 'maxim', title: 'Half a syllable saved', component: Maxim, mood: 'happy' },
		{ id: 'ranges', title: 'Range encoding', component: Ranges },
		{ id: 'bitsets', title: 'Classes as bitsets', component: Bitsets, mood: 'happy' },
		{ id: 'optimal', title: 'Why ह appears twice', component: Optimal, mood: 'think' },
		{ id: 'zero', title: 'A zero with memory', component: Zero, mood: 'surprised' },
		{ id: 'quiz', title: 'Check yourself', component: QuizScene }
	]
};
export default def;
