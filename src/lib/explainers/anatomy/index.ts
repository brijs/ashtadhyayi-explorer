import type { ExplainerDef } from '#lib/explainer/types.ts';
import narration from './narration.json';
import Split from './scenes/Split.svelte';
import Cases from './scenes/Cases.svelte';
import Operators from './scenes/Operators.svelte';
import Direction from './scenes/Direction.svelte';
import Run from './scenes/Run.svelte';
import Nearest from './scenes/Nearest.svelte';
import QuizScene from './scenes/QuizScene.svelte';

const def: ExplainerDef = {
	slug: 'anatomy',
	title: 'Anatomy of a sūtra',
	sa: 'सूत्रस्य अङ्गानि',
	guide: 'shishya',
	narration,
	scenes: [
		{ id: 'split', title: 'Three words, fused', component: Split, mood: 'happy' },
		{ id: 'cases', title: 'Every word has a case', component: Cases },
		{ id: 'operators', title: 'Cases as operators', component: Operators, mood: 'think' },
		{ id: 'direction', title: 'Before or after?', component: Direction, mood: 'think' },
		{ id: 'run', title: 'Run the rule', component: Run, mood: 'happy' },
		{ id: 'nearest', title: 'The nearest substitute', component: Nearest },
		{ id: 'quiz', title: 'Check yourself', component: QuizScene }
	]
};
export default def;
