<script lang="ts">
	import { resolve } from '$app/paths';
	import Quiz, { type Question } from '#lib/explainer/Quiz.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();

	const questions: Question[] = [
		{ q: 'In "ik → yaṇ / _ ac", what does "_ ac" mean?', options: ['ik comes after a vowel', 'ik is replaced when a vowel follows', 'a vowel is inserted', 'ac is deleted'], answer: 1, explain: 'The underscore marks where the target sits: right before an ac vowel. In the sūtra, that is the 7th case अचि.' },
		{ q: 'Why must 6.1.101 be tried before 6.1.77?', options: ['It is shorter', 'It is an exception: tried later it could never apply', 'Alphabetical order', 'It is in an earlier chapter'], answer: 1, explain: 'दधि + इह matches both. If the general rule goes first, the exception never gets a chance: दध्यिह instead of दधीह.' },
		{ q: 'A test suite for a grammar is…', options: ['a list of known correct forms to check the rules against', 'a list of sūtras', 'a commentary', 'a dictionary'], answer: 0, explain: 'Like unit tests: attested forms from usage are the expected outputs.' },
		{ q: 'The finite-state machine for 6.1.77 needs to remember…', options: ['the whole word', 'only whether it is holding an ik vowel', 'all previous rules', 'nothing at all'], answer: 1, explain: 'One sound of look-ahead is enough, which is why such rules are "regular".' }
	];

	function done(score: number) {
		react(score === questions.length ? 'All correct. Beep boop.' : 'Good run. Read the notes below.', score === questions.length ? 'happy' : 'think');
		complete();
	}
</script>

<Quiz {questions} ondone={done} />

<section class="notes card">
	<h2>History, and where the analogy breaks</h2>
	<ul>
		<li>
			In 1967 Peter Ingerman proposed calling the notation used to define programming languages "Pāṇini–Backus Form"
			(<i>Communications of the ACM</i> 10:3, p. 137), crediting Pāṇini with a notation of comparable power.
		</li>
		<li>
			Modern phonology writes sound rules as A → B / C _ D, popularized by Chomsky and Halle's <i>The Sound Pattern of
			English</i> (1968). Kaplan and Kay (1994) showed that such rule systems compile to finite-state transducers.
		</li>
		<li>
			<b>Limits.</b> The Aṣṭādhyāyī is not a program. Its meta-language relies on a reader: which words carry down, how
			conflicts resolve, and what counts as an exception are settled by conventions and a long commentarial tradition.
			Implementations like vidyut make those decisions explicit, and each makes choices of its own.
		</li>
	</ul>
	<p class="next">More in <a href={resolve('/cs') + '/'}>Pāṇini & Computer Science</a>, or try the <a href={resolve('/tools/prakriya') + '/'}>derivation debugger</a>.</p>
</section>

<style>
	.notes {
		margin-top: 24px;
		padding: 18px 22px;
		max-width: 760px;
	}
	.notes h2 {
		font-size: 20px;
	}
	ul {
		padding-left: 18px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		font-size: 15px;
	}
	.next {
		margin: 12px 0 0;
		font-size: 14.5px;
	}
</style>
