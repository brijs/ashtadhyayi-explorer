<script lang="ts">
	import { resolve } from '$app/paths';
	import Quiz, { type Question } from '#lib/explainer/Quiz.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	const questions: Question[] = [
		{ q: 'A set of sounds can be named by a pratyāhāra when…', options: ['it has fewer than 5 sounds', 'it is an unbroken run ending right before a marker', 'it contains a vowel', 'always'], answer: 1, explain: 'Range encoding: first sound + the marker that closes the run.' },
		{ q: 'Why is ह listed twice in the Śiva sūtras?', options: ['A copying error', 'Classes like हश् and शल् both need it, and one position cannot serve both', 'For rhythm', 'It is two different sounds'], answer: 1, explain: 'Petersen (2004) showed one repetition is unavoidable and ह is an optimal choice.' },
		{ q: 'Testing "is य in यण्?" with bitsets takes…', options: ['a loop over all sounds', 'one shift and one AND', 'a dictionary lookup', 'a regex'], answer: 1, explain: '(mask >> i) & 1.' },
		{ q: 'What does 1.1.62 do?', options: ['Deletes affixes', 'Keeps the effects of a deleted affix', 'Defines lopa', 'Adds affixes'], answer: 1, explain: 'प्रत्ययलोपे प्रत्ययलक्षणम्: the zero still counts, as in राजा.' }
	];
	function done(score: number) {
		react(score === questions.length ? 'Compression expert. Beep.' : 'Good. Summary below.', score === questions.length ? 'happy' : 'think');
		complete();
	}
</script>

<Quiz {questions} ondone={done} />
<section class="sheet card">
	<h2>Pāṇini's compression toolkit</h2>
	<ul>
		<li><b>Pratyāhāras</b>: range encoding over an optimized ordering (Śiva sūtras).</li>
		<li><b>Anuvṛtti & adhikāra</b>: words stated once, carried by scope (<a href={resolve('/learn') + '/anuvritti/'}>lesson</a>).</li>
		<li><b>Case conventions</b>: role markers instead of words like "in place of" (<a href={resolve('/learn') + '/anatomy/'}>lesson</a>).</li>
		<li><b>Markers (it)</b>: metadata packed into names (<a href={resolve('/learn') + '/it-markers/'}>lesson</a>).</li>
		<li><b>Zero with memory</b>: lopa plus 1.1.62.</li>
	</ul>
</section>

<style>
	.sheet {
		margin-top: 24px;
		padding: 16px 22px;
		max-width: 720px;
	}
	.sheet h2 {
		font-size: 20px;
	}
	ul {
		padding-left: 18px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
</style>
