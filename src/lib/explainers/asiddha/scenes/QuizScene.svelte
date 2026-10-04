<script lang="ts">
	import { resolve } from '$app/paths';
	import Quiz, { type Question } from '#lib/explainer/Quiz.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	const questions: Question[] = [
		{ q: 'What does "asiddha" mean in 8.2.1?', options: ['deleted', 'treated as not having happened, for earlier rules', 'optional', 'Vedic only'], answer: 1, explain: 'An asiddha change is invisible to the rules before it.' },
		{ q: 'Why राजभिः and not राजैः?', options: ['7.1.9 cannot see that 8.2.7 removed the न्', '7.1.9 is later', 'राज is feminine', '8.2.7 does not apply'], answer: 0, explain: 'To 7.1.9, the stem still ends in न्, so it is not an अ-stem.' },
		{ q: 'In रामः, which rule must apply first?', options: ['8.3.15', '8.2.66', 'either', 'neither'], answer: 1, explain: 'Within the tripādī, rules apply in text order: स् → रु first, then र् → ः.' },
		{ q: 'Where does the tripādī begin?', options: ['6.4.1', '8.1.1', '8.2.1', '3.1.1'], answer: 2, explain: '8.2.1 पूर्वत्रासिद्धम् opens the last three pādas.' }
	];
	function done(score: number) {
		react(score === questions.length ? 'Well done. That is one of the subtlest ideas in the grammar.' : 'Good. Revisit the राजभिः scene if needed.', score === questions.length ? 'happy' : 'think');
		complete();
	}
</script>

<Quiz {questions} ondone={done} />
<section class="sheet card">
	<ul>
		<li><b>8.2.1</b>: rules from 8.2.1 to 8.4.68 are asiddha (not effective) for the rules before them, and for each other in reverse order.</li>
		<li>Effect: the main grammar works on forms as if the tripādī had not yet happened; the tripādī then applies in strict sequence.</li>
	</ul>
	<p class="next">Next: <a href={resolve('/learn') + '/prakriya/'}>Building a word: भू → भवति →</a></p>
</section>

<style>
	.sheet {
		margin-top: 24px;
		padding: 16px 22px;
		max-width: 720px;
	}
	ul {
		padding-left: 18px;
	}
	.next {
		margin: 8px 0 0;
		font-size: 14.5px;
	}
</style>
