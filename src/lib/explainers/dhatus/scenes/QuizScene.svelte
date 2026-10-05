<script lang="ts">
	import { resolve } from '$app/paths';
	import Quiz, { type Question } from '#lib/explainer/Quiz.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	const questions: Question[] = [
		{ q: 'Which sūtra makes बुभूष (भू + सन्) a dhātu?', options: ['1.3.1 भूवादयो धातवः', '3.1.32 सनाद्यन्ता धातवः', '1.2.45', '3.3.1'], answer: 1, explain: 'It is not in the list, so 1.3.1 does not cover it; 3.1.32 adds whatever ends in san and the rest.' },
		{ q: 'Why does दिव् take श्यन् (दीव्यति)?', options: ['It ends in a tag ञ्', 'It belongs to the divādi class, and 3.1.69 says so', 'Because of 1.3.12', 'Every root takes श्यन्'], answer: 1, explain: 'दिवादिभ्यः श्यन्: "after div and the rest", a class of the Dhātupāṭha.' },
		{ q: 'पच् + ण्वुल् → पाचक. What makes पाचक a noun stem?', options: ['1.2.46: it ends in a kṛt affix', '1.3.1', 'It is listed in the Gaṇapāṭha', '3.1.32'], answer: 0, explain: 'कृत्तद्धितसमासाश्च: forms ending in kṛt or taddhita affixes, and compounds, are prātipadikas.' },
		{ q: 'Who is reported (Nirukta 1.12) as saying that not all nouns come from verbs?', options: ['Śākaṭāyana', 'Gārgya', 'Pāṇini', 'Patañjali'], answer: 1, explain: 'Gārgya and some grammarians; Śākaṭāyana and the etymologists held that all do.' }
	];
	function done(score: number) {
		react(score === questions.length ? 'Perfect. You know where the words come from.' : 'Good. The browser below has every root.', score === questions.length ? 'happy' : 'think');
		complete();
	}
</script>

<Quiz {questions} ondone={done} />

<p class="next card">
	Explore all the roots in the <a href={resolve('/tools') + '/dhatupatha/'}>Dhātupāṭha browser</a>, or watch one become a verb in the
	<a href={resolve('/learn') + '/prakriya/'}>Building a word</a> lesson.
</p>

<style>
	.next {
		margin-top: 22px;
		padding: 14px 18px;
		max-width: 720px;
		font-size: 15px;
	}
</style>
