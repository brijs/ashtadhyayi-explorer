<script lang="ts">
	import { resolve } from '$app/paths';
	import Quiz, { type Question } from '#lib/explainer/Quiz.svelte';
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	const questions: Question[] = [
		{ q: 'Which part of शप् is actually pronounced?', options: ['श्', 'अ', 'प्', 'all of it'], answer: 1, explain: 'श् (1.3.8) and प् (1.3.3) are tags; only अ remains, as in भव-अ-ति.' },
		{ q: 'Why is the स् of जस् not deleted?', options: ['It is a vowel', '1.3.4 spares t-class, s, m at the end of case endings', 'It is nasal', 'It is a root'], answer: 1, explain: 'न विभक्तौ तुस्माः. That स् survives and becomes the visarga of रामाः.' },
		{ q: 'कृ + क्त्वा gives कृत्वा, with no guṇa. Why?', options: ['क्त्वा is k-tagged; 1.1.5 blocks guṇa', 'Roots never take guṇa', '7.2.115', 'Because of 1.3.4'], answer: 0, explain: 'क्ङिति च: a kit or ṅit affix blocks guṇa and vṛddhi.' },
		{ q: 'Which tag causes vṛddhi, as in कारक?', options: ['क्', 'प्', 'ण् (or ञ्)', 'च्'], answer: 2, explain: '7.2.115 अचो ञ्णिति: before a ñit or ṇit affix, a final vowel takes vṛddhi.' }
	];
	function done(score: number) {
		react(score === questions.length ? 'Perfect. You can decode affix names now.' : 'Good. Keep the cheat sheet.', score === questions.length ? 'happy' : 'think');
		complete();
	}
	const SHEET = [
		['क्, ङ्', 'kit, ṅit', 'block guṇa/vṛddhi', '1.1.5'],
		['ञ्, ण्', 'ñit, ṇit', 'vṛddhi of the stem', '7.2.115'],
		['श्', 'śit', 'affix is sārvadhātuka', '3.4.113'],
		['प्', 'pit', 'affix is low-pitched (anudātta)', '3.1.4'],
		['च्', 'cit', 'accent on the final', '6.1.163'],
		['ल्', 'lit', 'accent just before the affix', '6.1.193']
	];
</script>

<Quiz {questions} ondone={done} />

<section class="sheet card">
	<h2>Cheat sheet: common tags</h2>
	<table>
		<tbody>
			{#each SHEET as [t, name, eff, n] (t)}
				<tr><th class="deva">{t}</th><td><i>{name}</i></td><td>{eff}</td><td><SutraRef {n} /></td></tr>
			{/each}
		</tbody>
	</table>
	<p class="next">See tags at work in any derivation: <a href={resolve('/tools/prakriya') + '/'}>derivation debugger</a>. Next lesson: <a href={resolve('/learn') + '/nearest-substitute/'}>The nearest substitute →</a></p>
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
	table {
		border-collapse: collapse;
		width: 100%;
		font-size: 14.5px;
	}
	th,
	td {
		text-align: left;
		padding: 6px 8px;
		border-top: 1px solid var(--line);
	}
	th {
		font-size: 18px;
		color: var(--saffron-ink);
		white-space: nowrap;
	}
	.next {
		margin: 14px 0 0;
		font-size: 14.5px;
	}
</style>
