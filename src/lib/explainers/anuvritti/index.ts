import type { ExplainerDef } from '#lib/explainer/types.ts';
import narration from './narration.json';
import Gap from './scenes/Gap.svelte';
import Flow from './scenes/Flow.svelte';
import River from './scenes/River.svelte';
import Headings from './scenes/Headings.svelte';
import Assemble from './scenes/Assemble.svelte';
import Code from './scenes/Code.svelte';
import QuizScene from './scenes/QuizScene.svelte';

const def: ExplainerDef = {
	slug: 'anuvritti',
	title: 'Anuvṛtti & adhikāra',
	sa: 'अनुवृत्तिः अधिकारश्च',
	guide: 'shishya',
	narration,
	scenes: [
		{ id: 'gap', title: 'Something is missing', component: Gap, mood: 'think' },
		{ id: 'flow', title: 'Words flow down', component: Flow },
		{ id: 'river', title: 'How far a word flows', component: River },
		{ id: 'headings', title: 'Headings rule blocks', component: Headings, mood: 'surprised' },
		{ id: 'assemble', title: 'Assemble a full reading', component: Assemble, mood: 'happy' },
		{ id: 'code', title: 'A programmer’s view', component: Code, mood: 'think' },
		{ id: 'quiz', title: 'Check yourself', component: QuizScene }
	]
};
export default def;
