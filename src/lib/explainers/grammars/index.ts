import type { ExplainerDef } from '#lib/explainer/types.ts';
import narration from './narration.json';
import Bnf from './scenes/Bnf.svelte';
import Ingerman from './scenes/Ingerman.svelte';
import Tree from './scenes/Tree.svelte';
import Karaka from './scenes/Karaka.svelte';
import Limits from './scenes/Limits.svelte';
import QuizScene from './scenes/QuizScene.svelte';

const def: ExplainerDef = {
	slug: 'grammars',
	title: 'Grammars, BNF & Pāṇini',
	sa: 'व्याकरणम्',
	guide: 'bot',
	narration,
	scenes: [
		{ id: 'bnf', title: 'A grammar in BNF', component: Bnf, mood: 'happy' },
		{ id: 'ingerman', title: '"Pāṇini–Backus Form"', component: Ingerman },
		{ id: 'tree', title: 'Trees vs rewriting', component: Tree, mood: 'think' },
		{ id: 'karaka', title: 'From meaning to case', component: Karaka, mood: 'surprised' },
		{ id: 'limits', title: 'Fair and unfair claims', component: Limits, mood: 'think' },
		{ id: 'quiz', title: 'Check yourself', component: QuizScene }
	]
};
export default def;
