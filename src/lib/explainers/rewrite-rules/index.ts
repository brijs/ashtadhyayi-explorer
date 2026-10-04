import type { ExplainerDef } from '#lib/explainer/types.ts';
import narration from './narration.json';
import Machine from './scenes/Machine.svelte';
import Notation from './scenes/Notation.svelte';
import Engine from './scenes/Engine.svelte';
import Tests from './scenes/Tests.svelte';
import Order from './scenes/Order.svelte';
import Automaton from './scenes/Automaton.svelte';
import QuizScene from './scenes/QuizScene.svelte';

const def: ExplainerDef = {
	slug: 'rewrite-rules',
	title: 'Sūtras as rewrite rules',
	sa: 'सूत्राणि नियमाः इव',
	guide: 'bot',
	narration,
	scenes: [
		{ id: 'machine', title: 'A grammar that runs', component: Machine, mood: 'happy' },
		{ id: 'notation', title: 'Two notations, one rule', component: Notation },
		{ id: 'engine', title: 'Rules as data', component: Engine, mood: 'happy' },
		{ id: 'tests', title: 'Test-driven grammar', component: Tests, mood: 'think' },
		{ id: 'order', title: 'When two rules match', component: Order, mood: 'surprised' },
		{ id: 'automaton', title: 'From rules to a machine', component: Automaton },
		{ id: 'quiz', title: 'Check yourself', component: QuizScene }
	]
};
export default def;
