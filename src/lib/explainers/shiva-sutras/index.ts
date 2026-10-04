import type { ExplainerDef } from '#lib/explainer/types.ts';
import narration from './narration.json';
import Welcome from './scenes/Welcome.svelte';
import Order from './scenes/Order.svelte';
import Markers from './scenes/Markers.svelte';
import Rule from './scenes/Rule.svelte';
import Play from './scenes/Play.svelte';
import IkoYanaci from './scenes/IkoYanaci.svelte';
import QuizScene from './scenes/QuizScene.svelte';

const def: ExplainerDef = {
	slug: 'shiva-sutras',
	title: 'Śiva sūtras & pratyāhāras',
	sa: 'माहेश्वरसूत्राणि',
	guide: 'shishya',
	narration,
	scenes: [
		{ id: 'welcome', title: 'Fourteen lines of sound', component: Welcome, mood: 'happy' },
		{ id: 'order', title: 'Not an alphabet', component: Order, mood: 'think' },
		{ id: 'markers', title: 'The markers', component: Markers },
		{ id: 'rule', title: 'First sound + marker', component: Rule },
		{ id: 'play', title: 'Build your own', component: Play, mood: 'happy' },
		{ id: 'iko-yanaci', title: 'Three names, one rule', component: IkoYanaci, mood: 'surprised' },
		{ id: 'quiz', title: 'Check yourself', component: QuizScene }
	]
};
export default def;
