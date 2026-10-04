<script lang="ts">
	import Quiz, { type Question } from '#lib/explainer/Quiz.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	const questions: Question[] = [
		{ q: 'In 7.1.9 अतो भिस ऐस्, what is अतः (5th case)?', options: ['the target', 'the left context: "after a"', 'the substitute', 'the right context'], answer: 1, explain: '1.1.67: the 5th case marks what comes before; the change applies after it.' },
		{ q: 'A substitute of one letter replaces…', options: ['the whole target', 'the last letter (1.1.52)', 'the first letter', 'nothing'], answer: 1, explain: 'अलोऽन्त्यस्य. Multi-letter substitutes replace the whole (1.1.55).' },
		{ q: '1.1.56 is most like…', options: ['a loop', 'inheritance: a substitute keeps the original\'s properties', 'a hash table', 'recursion'], answer: 1, explain: 'स्थानिवत्: like the original, except for sound-based operations.' },
		{ q: 'Pairing ए ओ ऐ औ with अय् अव् आय् आव् in order is…', options: ['zip (1.3.10)', 'nearest match (1.1.50)', 'random', 'sorting'], answer: 0, explain: 'यथासंख्यम्: respective correspondence for equal-length lists.' }
	];
	function done(score: number) {
		react(score === questions.length ? 'Interpreter complete. Beep beep.' : 'Good. Note below.', score === questions.length ? 'happy' : 'think');
		complete();
	}
</script>

<Quiz {questions} ondone={done} />
<section class="sheet card">
	<p>
		Pāṇini states many meta-rules as sūtras (1.1.49–1.1.67 and others). Later grammarians also collected unstated
		working principles, most influentially in Nāgeśa Bhaṭṭa's <i>Paribhāṣenduśekhara</i> (18th century). Together they
		play the role that an interpreter's semantics plays for a programming language.
	</p>
</section>

<style>
	.sheet {
		margin-top: 24px;
		padding: 14px 20px;
		max-width: 720px;
		font-size: 15px;
	}
</style>
