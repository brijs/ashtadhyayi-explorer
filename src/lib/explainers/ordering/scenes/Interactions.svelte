<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	const PAIRS = [
		{ a: '8.2.66', as: 'ससजुषो रुः', b: '8.3.15', bs: 'खरवसानयोर्विसर्जनीयः', ex: 'रामस् → रामर् → रामः', kind: 'feeding', why: 'स् → र् creates the र् that 8.3.15 turns into visarga.' },
		{ a: '7.3.84', as: 'सार्वधातुकार्धधातुकयोः', b: '6.1.78', bs: 'एचोऽयवायावः', ex: 'भू + अ → भो + अ → भव् + अ', kind: 'feeding', why: 'guṇa creates the ओ that 6.1.78 needs.' },
		{ a: '6.1.101', as: 'अकः सवर्णे दीर्घः', b: '6.1.77', bs: 'इको यणचि', ex: 'दधि + इह → दधीह', kind: 'bleeding', why: 'merging इ + इ into ई removes the "इ before a vowel" that 6.1.77 needed.' }
	];
	let ans = $state<Record<number, string>>({});
	function judge(i: number, k: string) {
		ans = { ...ans, [i]: k };
		const p = PAIRS[i];
		react(k === p.kind ? `Yes, ${p.kind}: ${p.why}` : `Look again: ${p.why}`, k === p.kind ? 'happy' : 'think');
		if (PAIRS.every((p, j) => ans[j] === p.kind)) complete();
	}
</script>

<div class="defs">
	<span><b>feeding</b>: A creates an input for B</span>
	<span><b>bleeding</b>: A destroys an input for B</span>
</div>
<ul class="pairs">
	{#each PAIRS as p, i (i)}
		<li class:right={ans[i] === p.kind} class:wrong={ans[i] && ans[i] !== p.kind}>
			<span class="rules"><SutraRef n={p.a} s={p.as} /> then <SutraRef n={p.b} s={p.bs} /></span>
			<span class="ex deva">{p.ex}</span>
			<span class="b">
				<button class="btn" onclick={() => judge(i, 'feeding')}>feeding</button>
				<button class="btn" onclick={() => judge(i, 'bleeding')}>bleeding</button>
			</span>
		</li>
	{/each}
</ul>
<p class="muted note">The terms come from generative phonology: Kiparsky, "Linguistic universals and linguistic change" (1968).</p>

<style>
	.defs {
		display: flex;
		flex-wrap: wrap;
		gap: 6px 20px;
		font-size: 14.5px;
		margin-bottom: 12px;
	}
	.pairs {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
		max-width: 780px;
	}
	li {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 4px 12px;
		padding: 12px 14px;
		border-radius: 12px;
		border: 1.5px solid var(--line);
		background: var(--surface);
	}
	li.right {
		border-color: var(--r-subject);
	}
	li.wrong {
		border-color: var(--r-target);
	}
	.rules {
		font-size: 14px;
	}
	.ex {
		grid-column: 1;
		font-size: 19px;
	}
	.b {
		grid-row: 1 / span 2;
		grid-column: 2;
		display: flex;
		gap: 6px;
		align-items: center;
	}
	.b .btn {
		font-size: 13px;
		padding: 4px 12px;
	}
	.note {
		margin-top: 12px;
		font-size: 13.5px;
	}
	@media (max-width: 600px) {
		li {
			grid-template-columns: minmax(0, 1fr);
		}
		.b {
			grid-row: auto;
			grid-column: 1;
		}
	}
</style>
