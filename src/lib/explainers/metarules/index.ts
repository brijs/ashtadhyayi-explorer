import type { ExplainerDef } from '#lib/explainer/types.ts';
import narration from './narration.json';
import Parse from './scenes/Parse.svelte';
import Where from './scenes/Where.svelte';
import Inherit from './scenes/Inherit.svelte';
import Zip from './scenes/Zip.svelte';
import Loop from './scenes/Loop.svelte';
import QuizScene from './scenes/QuizScene.svelte';

const def: ExplainerDef = {
	slug: 'metarules',
	title: 'Metarules & interpreters',
	sa: 'परिभाषाः',
	guide: 'bot',
	narration,
	scenes: [
		{ id: 'parse', title: 'Case endings as a parser', component: Parse, mood: 'happy' },
		{ id: 'where', title: 'Where does the substitute go?', component: Where, mood: 'think' },
		{ id: 'inherit', title: 'Substitutes inherit', component: Inherit },
		{ id: 'zip', title: 'Respective pairing = zip', component: Zip },
		{ id: 'loop', title: 'The interpreter loop', component: Loop, mood: 'happy' },
		{ id: 'quiz', title: 'Check yourself', component: QuizScene }
	]
};
export default def;
