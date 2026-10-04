<script lang="ts">
	import Quiz, { type Question } from '#lib/explainer/Quiz.svelte';
	import DerivationStrip from '#lib/components/DerivationStrip.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	type D = { word: string; hash: string; steps: any[] };
	let { react, complete, data }: SceneProps<{ bhavati: D }> = $props();
	const questions: Question[] = [
		{ q: 'Which rule chooses the present tense placeholder लट्?', options: ['3.2.123', '3.1.68', '7.3.84', '6.1.78'], answer: 0, explain: 'वर्तमाने लट्: "in the present, laṭ".' },
		{ q: 'Where does the अ in भवति come from?', options: ['the root', 'शप् (3.1.68), after its tags are deleted', 'the ending तिप्', 'sandhi'], answer: 1, explain: 'शप् minus श् and प् = अ.' },
		{ q: 'What turns भू into भो?', options: ['6.1.77', '7.3.84 guṇa', '1.3.9', '8.4.68'], answer: 1, explain: 'Guṇa before a sārvadhātuka affix; 1.1.50 picks ओ.' },
		{ q: 'What turns भो + अ into भव + अ?', options: ['6.1.78', '6.1.101', '6.1.87', '1.1.1'], answer: 0, explain: 'एचोऽयवायावः: ओ → अव् before a vowel.' }
	];
	function done(score: number) {
		react(score === questions.length ? 'You built भवति from scratch. Try another verb in the debugger.' : 'Nice. The strip above shows every step.', score === questions.length ? 'happy' : 'think');
		complete();
	}
</script>

<DerivationStrip steps={data.bhavati.steps} word={data.bhavati.word} hash={data.bhavati.hash} focus={['3.2.123', '3.4.78', '3.1.68', '7.3.84', '6.1.78']} />
<div class="q"><Quiz {questions} ondone={done} /></div>

<style>
	.q {
		margin-top: 22px;
	}
</style>
