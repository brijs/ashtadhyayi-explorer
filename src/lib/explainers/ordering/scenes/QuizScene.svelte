<script lang="ts">
	import Quiz, { type Question } from '#lib/explainer/Quiz.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	const questions: Question[] = [
		{ q: 'In CSS, p.note beats p regardless of order. The Pāṇinian counterpart is…', options: ['1.4.2', 'apavāda beats utsarga', 'anuvṛtti', 'asiddha'], answer: 1, explain: 'The more specific rule wins wherever it applies.' },
		{ q: 'Two equally specific CSS rules: the later wins. Pāṇini says…', options: ['the earlier wins', '1.4.2: the later wins', 'both apply', 'neither'], answer: 1, explain: 'विप्रतिषेधे परं कार्यम्.' },
		{ q: '8.2.66 creates the र् that 8.3.15 uses. This is…', options: ['feeding', 'bleeding', 'counterfeeding', 'counterbleeding'], answer: 0, explain: 'A creates an input for B.' },
		{ q: '8.2.7 could feed 7.1.9 but does not. This is…', options: ['feeding', 'bleeding', 'counterfeeding', 'an apavāda'], answer: 2, explain: 'The tripādī (8.2.1) keeps later rules invisible to earlier ones.' }
	];
	function done(score: number) {
		react(score === questions.length ? 'Order restored. Beep.' : 'Good. Re-run the scenes for a refresher.', score === questions.length ? 'happy' : 'think');
		complete();
	}
</script>

<Quiz {questions} ondone={done} />
