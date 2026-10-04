import type { ExplainerDef } from '#lib/explainer/types.ts';
import narration from './narration.json';
import Css from './scenes/Css.svelte';
import Elsewhere from './scenes/Elsewhere.svelte';
import Interactions from './scenes/Interactions.svelte';
import Counterfeeding from './scenes/Counterfeeding.svelte';
import QuizScene from './scenes/QuizScene.svelte';

const def: ExplainerDef = {
	slug: 'ordering',
	title: 'Rule ordering & specificity',
	sa: 'बलाबलम्',
	guide: 'bot',
	narration,
	scenes: [
		{ id: 'css', title: 'Pāṇini in your stylesheet', component: Css, mood: 'happy' },
		{ id: 'elsewhere', title: 'The Elsewhere Condition', component: Elsewhere, mood: 'think' },
		{ id: 'interactions', title: 'Feeding and bleeding', component: Interactions },
		{ id: 'counterfeeding', title: 'Too late to feed', component: Counterfeeding, mood: 'surprised' },
		{ id: 'quiz', title: 'Check yourself', component: QuizScene }
	]
};
export default def;
