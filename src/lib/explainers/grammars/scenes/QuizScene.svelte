<script lang="ts">
	import Quiz, { type Question } from '#lib/explainer/Quiz.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	const questions: Question[] = [
		{ q: 'Who proposed the name "Pāṇini–Backus Form", and when?', options: ['Chomsky, 1957', 'Ingerman, 1967', 'Backus, 1959', 'Knuth, 1964'], answer: 1, explain: 'P. Z. Ingerman, letter in Communications of the ACM 10(3), 1967.' },
		{ q: 'A BNF grammar for our toy verb yields…', options: ['भवति', 'भू + अ + ति', 'भो + अ + ति', 'nothing'], answer: 1, explain: 'Context-free rules only concatenate; Pāṇini then rewrites in context.' },
		{ q: 'In the passive छिद्यते, why is the agent देवदत्तेन (3rd case)?', options: ['Random', 'The verb ending now expresses the object, so the agent gets the 3rd case (2.3.18)', 'Because of sandhi', 'The agent is now the object'], answer: 1, explain: 'Roles stay the same; which one the verb expresses changes (3.4.69, 2.3.1).' },
		{ q: 'Which statement is fair?', options: ['Pāṇini wrote BNF', 'Sanskrit is the best computer language', 'The Aṣṭādhyāyī is a precise, generative rule system', 'It needs no interpretation'], answer: 2, explain: 'Precise and generative, yes; the other claims overreach.' }
	];
	function done(score: number) {
		react(score === questions.length ? 'Balanced and correct. Beep.' : 'Good. References below.', score === questions.length ? 'happy' : 'think');
		complete();
	}
</script>

<Quiz {questions} ondone={done} />
<section class="refs card">
	<h2>References</h2>
	<ul>
		<li>P. Z. Ingerman, "Pāṇini-Backus Form suggested", <i>Communications of the ACM</i> 10(3), 1967, p. 137.</li>
		<li>P. Kiparsky & J. F. Staal, "Syntactic and semantic relations in Pāṇini", <i>Foundations of Language</i> 5, 1969, pp. 83–117.</li>
		<li>C. J. Fillmore, "The Case for Case", in Bach & Harms (eds.), <i>Universals in Linguistic Theory</i>, 1968.</li>
	</ul>
</section>

<style>
	.refs {
		margin-top: 24px;
		padding: 14px 20px;
		max-width: 760px;
		font-size: 14.5px;
	}
	.refs h2 {
		font-size: 18px;
	}
	ul {
		padding-left: 18px;
	}
</style>
