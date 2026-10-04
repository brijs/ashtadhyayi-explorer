<script lang="ts">
	import { resolve } from '$app/paths';
	import Quiz, { type Question } from '#lib/explainer/Quiz.svelte';
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();

	const questions: Question[] = [
		{ q: 'What is anuvṛtti?', options: ['A sandhi rule', 'A word carried down from an earlier sūtra', 'A commentary', 'A type of affix'], answer: 1, explain: 'Words "continue" (anu-vṛt) into following sūtras so they need not be repeated.' },
		{ q: 'Where does 6.1.78 एचोऽयवायावः get "when a vowel follows"?', options: ['From 6.1.77 इको यणचि', 'From 1.1.1', 'From the commentary', 'It is not needed'], answer: 0, explain: 'अचि is carried down from 6.1.77, and it keeps flowing through 28 later sūtras.' },
		{ q: 'प्रत्ययः (3.1.1) is a heading. What does it do?', options: ['Defines one affix', 'Makes everything up to 5.4.160 an affix', 'Ends chapter 3', 'Nothing by itself'], answer: 1, explain: 'An adhikāra governs a whole block: 1,821 sūtras from 3.1.1 to 5.4.160 introduce affixes.' },
		{ q: 'To read a sūtra fully you combine…', options: ['only its own words', 'its words + commentary', 'its own words + inherited words + headings', 'the previous and next sūtra'], answer: 2, explain: 'That is the "Fill in inherited words" button on every sūtra page.' }
	];

	function done(score: number) {
		react(score === questions.length ? 'Excellent. You can now read any sūtra in full.' : 'Good. The summary has it all.', score === questions.length ? 'happy' : 'think');
		complete();
	}
</script>

<Quiz {questions} ondone={done} />

<section class="sheet card">
	<h2>Summary</h2>
	<ul>
		<li><b>Anuvṛtti</b>: a word continues from an earlier sūtra into later ones, until it no longer fits.</li>
		<li><b>Adhikāra</b>: a heading sūtra whose words govern a whole block (<SutraRef n="3.1.1" s="प्रत्ययः" /> covers 3.1.1–5.4.160).</li>
		<li>Headings are recognized by convention (<SutraRef n="1.3.11" s="स्वरितेनाधिकारः" />); their limits are often stated, as in <SutraRef n="1.4.1" s="आ कडारादेका संज्ञा" />.</li>
		<li><b>Full reading</b> = own words + inherited words + headings.</li>
	</ul>
	<p class="next">
		Try it on any sūtra: e.g. <a href={resolve('/sutra/[n]', { n: '6.1.101' }) + '/'}>6.1.101</a>, then press "Fill in inherited words".
	</p>
</section>

<style>
	.sheet {
		margin-top: 24px;
		padding: 20px 22px;
		max-width: 720px;
	}
	.sheet h2 {
		font-size: 22px;
	}
	ul {
		padding-left: 18px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.next {
		margin: 14px 0 0;
		font-size: 14.5px;
	}
</style>
