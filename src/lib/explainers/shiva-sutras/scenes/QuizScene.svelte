<script lang="ts">
	import { resolve } from '$app/paths';
	import Quiz, { type Question } from '#lib/explainer/Quiz.svelte';
	import SutraRef from '#lib/components/SutraRef.svelte';
	import { SHIVA_FLAT, rangeSlots } from '#lib/varna.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();

	const set = (startV: string, markerV: string) => {
		const s = SHIVA_FLAT.findIndex((x) => !x.isIt && x.varna === startV);
		const e = SHIVA_FLAT.findIndex((x, i) => i > s && x.isIt && x.varna === markerV);
		return rangeSlots(s, e).map((i) => SHIVA_FLAT[i].varna).map((v) => (v.length > 1 ? v[0] : v)).join(' ');
	};

	const questions: Question[] = [
		{ q: 'How many different sounds do the Śiva sūtras list (markers aside)?', options: ['14', '42', '43', '56'], answer: 1, explain: 'There are 43 letter slots, but ह is listed twice, so 42 distinct sounds, plus 14 markers.' },
		{ q: 'Which sounds does एच् name?', options: ['ए ओ', 'ए ओ ऐ औ', 'अ इ उ', 'इ उ ऋ ऌ'], answer: 1, explain: 'From ए (line 3) up to the marker च् (end of line 4): ए ओ ऐ औ.', deva: true },
		{ q: 'In the name हल्, what is ल्?', options: ['A consonant in the class', 'The marker ending line 14', 'A vowel', 'An abbreviation of लोप'], answer: 1, explain: 'ल् is the it-marker that closes line 14. हल् runs from the first ह (line 5) to there: every consonant.' },
		{ q: 'Which pratyāhāra means "any vowel"?', options: ['हल्', 'यण्', 'अच्', 'इक्'], answer: 2, explain: 'अच् runs from अ to the marker च्: all nine vowels (and, by 1.1.69, their long forms).', deva: true }
	];

	const sheet = [
		['अच्', 'all vowels', set('अ', 'च्')],
		['हल्', 'all consonants', 'ह य व र … स ह'],
		['इक्', 'i u ṛ ḷ', set('इ', 'क्')],
		['यण्', 'semivowels', set('य्', 'ण्')],
		['एच्', 'diphthongs', set('ए', 'च्')],
		['एङ्', 'e o', set('ए', 'ङ्')],
		['झल्', 'stops, sibilants, h (no nasals or semivowels)', set('झ्', 'ल्')],
		['शर्', 'sibilants', set('श्', 'र्')]
	];

	function done(score: number) {
		react(score === questions.length ? 'Perfect! You can read pratyāhāras now.' : 'Good effort. The cheat sheet below has everything.', score === questions.length ? 'happy' : 'think');
		complete();
	}
</script>

<Quiz {questions} ondone={done} />

<section class="sheet card">
	<h2>Cheat sheet</h2>
	<ul class="rules">
		<li><SutraRef n="1.3.3" s="हलन्त्यम्" /> The final consonant of a listing is a marker (<i>it</i>).</li>
		<li><SutraRef n="1.3.9" s="तस्य लोपः" /> Markers are deleted.</li>
		<li><SutraRef n="1.1.71" s="आदिरन्त्येन सहेता" /> First sound + later marker = every sound in between.</li>
		<li><SutraRef n="1.1.69" s="अणुदित् सवर्णस्य चाप्रत्ययः" /> A vowel or semivowel in a pratyāhāra also stands for its similar sounds (इ covers ई, …).</li>
	</ul>
	<table>
		<tbody>
			{#each sheet as [nm, gloss, letters] (nm)}
				<tr><th class="deva">{nm}</th><td>{gloss}</td><td class="deva">{letters}</td></tr>
			{/each}
		</tbody>
	</table>
	<p class="next">
		Next: <a href={resolve('/tools') + '/pratyahara/'}>open the pratyāhāra calculator</a> or continue to
		<a href={resolve('/learn') + '/anatomy/'}>Anatomy of a sūtra →</a>
	</p>
</section>

<style>
	.sheet {
		margin-top: 24px;
		padding: 20px 22px;
		max-width: 760px;
	}
	.sheet h2 {
		font-size: 22px;
	}
	.rules {
		padding-left: 18px;
		font-size: 14.5px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	table {
		border-collapse: collapse;
		width: 100%;
		font-size: 14.5px;
	}
	th,
	td {
		text-align: left;
		padding: 6px 10px;
		border-bottom: 1px solid var(--line);
		vertical-align: top;
	}
	th {
		font-size: 19px;
		font-weight: 600;
		color: var(--saffron-ink);
		width: 70px;
	}
	td.deva {
		font-size: 17px;
	}
	.next {
		margin: 16px 0 0;
		font-size: 14.5px;
	}
	@media (max-width: 560px) {
		td:nth-child(2) {
			display: none;
		}
	}
</style>
