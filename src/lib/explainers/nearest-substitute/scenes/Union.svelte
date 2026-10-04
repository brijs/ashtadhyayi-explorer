<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import { placesOf, placeName } from '../places.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	const PAIRS = [
		{ a: 'अ', b: 'इ', ex: 'देव + इन्द्रः → देवेन्द्रः' },
		{ a: 'आ', b: 'उ', ex: 'गङ्गा + उदकम् → गङ्गोदकम्' },
		{ a: 'अ', b: 'ई', ex: 'गण + ईशः → गणेशः' },
		{ a: 'आ', b: 'ऋ', ex: 'महा + ऋषिः → महर्षिः' }
	];
	const GUNA = ['अ', 'ए', 'ओ'];
	let sel = $state<number | null>(null);
	let seen = new Set<number>();
	const union = $derived(sel === null ? [] : [...new Set([...placesOf(PAIRS[sel].a), ...placesOf(PAIRS[sel].b)])]);
	const score = (g: string) => placesOf(g).filter((p) => union.includes(p)).length - placesOf(g).filter((p) => !union.includes(p)).length;
	const best = $derived(sel === null ? '' : GUNA.reduce((x, y) => (score(y) > score(x) ? y : x)));

	function pick(i: number) {
		sel = i;
		seen.add(i);
		const p = PAIRS[i];
		react(p.b === 'ऋ' ? `${p.a} + ऋ: throat + roof. No guṇa vowel uses the roof, so अ is chosen and 1.1.51 adds र्: ${p.ex}.` : `${p.a} + ${p.b}: ${union.map((k) => placeName(k).en).join(' + ')} → ${best}. ${p.ex}.`, 'happy');
		if (seen.size >= 3) complete();
	}
</script>

<div class="pairs" role="group" aria-label="Pairs">
	{#each PAIRS as p, i (i)}
		<button class="btn deva" aria-pressed={sel === i} onclick={() => pick(i)}>{p.a} + {p.b}</button>
	{/each}
</div>

{#if sel !== null}
	<div class="calc card">
		<div class="side">
			<span class="deva big">{PAIRS[sel].a} + {PAIRS[sel].b}</span>
			<span class="muted">places: {union.map((k) => placeName(k).en).join(' + ')}</span>
		</div>
		<div class="cands">
			{#each GUNA as g (g)}
				<div class="cand" class:best={g === best}>
					<span class="deva">{g}</span>
					<small>{placesOf(g).map((k) => placeName(k).en).join(' + ')}</small>
				</div>
			{/each}
		</div>
		<p class="ex deva">{PAIRS[sel].ex}</p>
	</div>
{/if}
<p class="muted note">The rule is <SutraRef n="6.1.87" s="आद्गुणः" />: अ/आ and a following vowel are together replaced by one guṇa vowel. 1.1.50 picks the guṇa whose places best cover both.</p>

<style>
	.pairs {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 16px;
	}
	.pairs .btn {
		font-size: 19px;
	}
	.calc {
		padding: 18px;
		display: grid;
		gap: 12px;
	}
	.side {
		display: flex;
		align-items: baseline;
		gap: 14px;
		flex-wrap: wrap;
	}
	.big {
		font-size: 30px;
	}
	.cands {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 130px));
		gap: 10px;
	}
	.cand {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 0;
		text-align: center;
		padding: 8px;
		border-radius: 12px;
		border: 2px solid var(--line);
		opacity: 0.6;
	}
	.cand .deva {
		font-size: 30px;
	}
	.cand small {
		font-size: 11.5px;
		color: var(--muted);
	}
	.cand.best {
		opacity: 1;
		border-color: var(--r-subject);
		background: color-mix(in srgb, var(--r-subject) 10%, var(--surface));
	}
	.ex {
		font-size: 20px;
		margin: 0;
	}
	.note {
		margin-top: 16px;
		font-size: 14px;
		max-width: 46em;
	}
</style>
