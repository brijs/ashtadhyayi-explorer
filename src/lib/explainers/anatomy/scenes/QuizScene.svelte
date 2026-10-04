<script lang="ts">
	import { resolve } from '$app/paths';
	import Quiz, { type Question } from '#lib/explainer/Quiz.svelte';
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();

	const questions: Question[] = [
		{ q: 'In an operational rule, a word in the 6th case names…', options: ['the substitute', 'what gets replaced', 'what must follow', 'what must precede'], answer: 1, explain: '1.1.49 षष्ठी स्थानेयोगा: the 6th case means "in place of".' },
		{ q: 'अचि is in the 7th case. So the rule applies…', options: ['after a vowel', 'when a vowel follows', 'in place of a vowel', 'only to vowels'], answer: 1, explain: '1.1.66: with the 7th case, the operation is on what comes before it, so "when a vowel follows".' },
		{ q: 'मधु + इह → ?', options: ['मधुइह', 'मध्विह', 'मधूह', 'मधविह'], answer: 1, explain: 'उ is an इक्, and इ is a vowel that is not similar to उ, so उ → व्: मध्विह.', deva: true },
		{ q: 'Why does दधि + इह give दधीह and not दध्यिह?', options: ['6.1.77 is optional', 'A more specific rule, 6.1.101, applies to similar vowels', 'इह is not a vowel', 'Sandhi is not applied to दधि'], answer: 1, explain: 'अकः सवर्णे दीर्घः is an exception (apavāda) to इको यणचि: similar vowels merge into one long vowel.' }
	];

	function done(score: number) {
		react(score === questions.length ? 'Full marks. You can read a sūtra like a rule now.' : 'Nice. Keep the summary below handy.', score === questions.length ? 'happy' : 'think');
		complete();
	}
</script>

<Quiz {questions} ondone={done} />

<section class="sheet card">
	<h2>How to read an operational sūtra</h2>
	<ol>
		<li><b>Split</b> it into words (padaccheda).</li>
		<li><b>6th case</b> = what is replaced (<SutraRef n="1.1.49" />).</li>
		<li><b>1st case</b> = what replaces it.</li>
		<li><b>7th case</b> = what must follow; operate on what precedes it (<SutraRef n="1.1.66" />).</li>
		<li><b>5th case</b> = what must precede; operate on what follows it (<SutraRef n="1.1.67" />).</li>
		<li>Several candidate substitutes? Pick the <b>nearest</b> (<SutraRef n="1.1.50" />).</li>
		<li>Words missing? They are <b>inherited</b> from earlier sūtras. That's the next lesson.</li>
	</ol>
	<p class="next">
		Next: <a href={resolve('/learn') + '/anuvritti/'}>Anuvṛtti & adhikāra →</a> · See it live on
		<a href={resolve('/sutra/[n]', { n: '6.1.77' }) + '/'}>the 6.1.77 page</a>
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
	ol {
		padding-left: 20px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.next {
		margin: 14px 0 0;
		font-size: 14.5px;
	}
</style>
