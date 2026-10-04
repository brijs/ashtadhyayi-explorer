<script lang="ts">
	import { resolve } from '$app/paths';
	import Quiz, { type Question } from '#lib/explainer/Quiz.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	const questions: Question[] = [
		{ q: 'Your sūtra for 6.1.77 read इकः यण् अचि. Why does Pāṇini write इको यणचि?', options: ['A different rule', 'Sūtras are pronounced with sandhi', 'A typo', 'Vedic spelling'], answer: 1, explain: 'The words of a sūtra join like any Sanskrit phrase; padaccheda undoes it.' },
		{ q: 'How did your rule pick ग् for क् (8.2.39)?', options: ['Alphabetical order', 'Nearest by place and effort (1.1.50)', 'Random', 'By position (1.3.10)'], answer: 1, explain: 'क् and ग् share the throat; ग् is the voiced unaspirated stop there.' },
		{ q: 'What does the toy language lack that the Aṣṭādhyāyī has?', options: ['Case endings', 'Inherited words, conflict resolution and meaning conditions', 'Pratyāhāras', 'Substitutes'], answer: 1, explain: 'Those are what make thousands of rules work together.' }
	];
	function done(score: number) {
		react(score === questions.length ? 'You are a sūtrakāra now. Beep!' : 'Nice work. Keep exploring.', 'happy');
		complete();
	}
</script>

<Quiz {questions} ondone={done} />
<section class="next card">
	<p>Keep going: explore real derivations in the <a href={resolve('/tools/prakriya') + '/'}>debugger</a>, or browse all <a href={resolve('/adhyaya/[a]', { a: '6' }) + '/'}>sandhi rules in adhyāya 6</a>.</p>
</section>

<style>
	.next {
		margin-top: 20px;
		padding: 12px 18px;
		max-width: 720px;
	}
	.next p {
		margin: 0;
	}
</style>
