<script lang="ts">
	import { resolve } from '$app/paths';
	import Quiz, { type Question } from '#lib/explainer/Quiz.svelte';
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	const questions: Question[] = [
		{ q: 'What is the guṇa of उ?', options: ['अ', 'ए', 'ओ', 'उ'], answer: 2, explain: 'उ is made at the lips; ओ uses throat and lips, the nearest guṇa.', deva: true },
		{ q: 'Why does अ + इ give ए?', options: ['ए comes first', 'ए is made at throat + palate, covering both', 'by 6.1.77', 'it is random'], answer: 1, explain: '6.1.87 asks for guṇa; 1.1.50 picks ए, which shares both places.' },
		{ q: 'ऋ has no guṇa vowel at its own place. Its guṇa is…', options: ['ए', 'ओ', 'अर्', 'ऋ'], answer: 2, explain: 'अ is chosen and 1.1.51 उरण् रपरः adds र्: कृ → कर्.', deva: true },
		{ q: 'In वाग्घरिः, why घ rather than ग?', options: ['घ is voiced and breathy, like ह', 'घ is louder', 'ग is not allowed', 'random choice'], answer: 0, explain: 'Nearness counts effort too: ह is voiced and aspirated, and so is घ.' }
	];
	function done(score: number) {
		react(score === questions.length ? 'Excellent. You can predict substitutes now.' : 'Good. The place map below has it all.', score === questions.length ? 'happy' : 'think');
		complete();
	}
</script>

<Quiz {questions} ondone={done} />
<section class="sheet card">
	<h2>Summary</h2>
	<ul>
		<li><SutraRef n="1.1.50" s="स्थानेऽन्तरतमः" /> picks, among possible substitutes, the one nearest to the original.</li>
		<li>Nearness is judged first by place of articulation; also by effort (voice, aspiration), and in other cases by meaning or length.</li>
		<li>guṇa: इ→ए, उ→ओ, ऋ→अर्, ऌ→अल्. अ + इ → ए, अ + उ → ओ.</li>
	</ul>
	<p class="next">Next: <a href={resolve('/learn') + '/sutra-types/'}>Six kinds of sūtra →</a></p>
</section>

<style>
	.sheet {
		margin-top: 24px;
		padding: 18px 22px;
		max-width: 720px;
	}
	.sheet h2 {
		font-size: 20px;
	}
	ul {
		padding-left: 18px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.next {
		margin: 12px 0 0;
		font-size: 14.5px;
	}
</style>
