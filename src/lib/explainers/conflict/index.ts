import type { ExplainerDef } from '#lib/explainer/types.ts';
import narration from './narration.json';
import Clash from './scenes/Clash.svelte';
import Later from './scenes/Later.svelte';
import Apavada from './scenes/Apavada.svelte';
import Ladder from './scenes/Ladder.svelte';
import QuizScene from './scenes/QuizScene.svelte';

const def: ExplainerDef = {
	slug: 'conflict',
	title: 'When rules collide',
	sa: 'विप्रतिषेधः',
	guide: 'shishya',
	narration,
	scenes: [
		{ id: 'clash', title: 'Two rules, one form', component: Clash, mood: 'surprised' },
		{ id: 'later', title: 'The later rule wins', component: Later, mood: 'happy' },
		{ id: 'apavada', title: 'Exceptions win', component: Apavada, mood: 'think' },
		{ id: 'ladder', title: 'A ladder of strength', component: Ladder },
		{ id: 'quiz', title: 'Check yourself', component: QuizScene }
	]
};
export default def;
