import type { ExplainerDef } from '#lib/explainer/types.ts';
import narration from './narration.json';
import Tags from './scenes/Tags.svelte';
import Detect from './scenes/Detect.svelte';
import Flow from './scenes/Flow.svelte';
import Strip from './scenes/Strip.svelte';
import Effects from './scenes/Effects.svelte';
import Flags from './scenes/Flags.svelte';
import QuizScene from './scenes/QuizScene.svelte';

const def: ExplainerDef = {
	slug: 'it-markers',
	title: 'It-markers',
	sa: 'इत्संज्ञा',
	guide: 'shishya',
	narration,
	scenes: [
		{ id: 'tags', title: 'Letters that are not sounds', component: Tags, mood: 'surprised' },
		{ id: 'detect', title: 'Which letters are tags?', component: Detect, mood: 'think' },
		{ id: 'flow', title: 'The order of checks', component: Flow, mood: 'think' },
		{ id: 'strip', title: 'Delete after use', component: Strip },
		{ id: 'effects', title: 'What tags do', component: Effects, mood: 'happy' },
		{ id: 'flags', title: 'Tags as flags', component: Flags, mood: 'think' },
		{ id: 'quiz', title: 'Check yourself', component: QuizScene }
	]
};
export default def;
