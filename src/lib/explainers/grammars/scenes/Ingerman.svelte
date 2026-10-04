<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	const CARDS = [
		{ bnf: 'Named categories: <digit>, <expr>', pan: 'Technical terms (saṃjñā) and pratyāhāras: इक्, धातु, प्रत्यय', ex: '1.1.1, 1.3.1' },
		{ bnf: 'Rules that rewrite a symbol', pan: 'Operational sūtras: in place of X, put Y', ex: '6.1.77' },
		{ bnf: 'Context-free: a symbol rewrites regardless of neighbours', pan: 'Context-sensitive: "when a vowel follows", "after a"', ex: '1.1.66, 1.1.67' },
		{ bnf: 'Alternatives with |', pan: 'Options with वा / विभाषा, lists joined by च', ex: '1.1.44' },
		{ bnf: 'Meta-language defined outside the grammar', pan: 'Meta-language defined inside the grammar, by its own sūtras', ex: '1.1.49' }
	];
	let flipped = $state(new Set<number>());
	function flip(i: number) {
		const s = new Set(flipped);
		s.add(i);
		flipped = s;
		if (s.size >= 3) {
			react('Comparable toolkits. A key difference: Pāṇini describes his own notation with rules written in that same notation.', 'happy');
			complete();
		}
	}
</script>

<div class="letter card">
	<span class="eyebrow">1967 · Communications of the ACM 10(3), p. 137</span>
	<p>Peter Z. Ingerman, <b>"Pāṇini-Backus Form suggested"</b>: a short letter proposing that BNF be renamed, since Pāṇini had devised a notation of comparable power more than two thousand years earlier.</p>
</div>

<div class="cards">
	{#each CARDS as c, i (i)}
		<button class="c card" class:back={flipped.has(i)} onclick={() => flip(i)}>
			<span class="eyebrow">BNF</span>
			<span>{c.bnf}</span>
			{#if flipped.has(i)}
				<span class="eyebrow pan">Pāṇini</span>
				<span>{c.pan}</span>
				<span class="ex">e.g. {#each c.ex.split(', ') as n, k (n)}{k ? ', ' : ''}<SutraRef {n} />{/each}</span>
			{:else}
				<span class="muted hint">tap for Pāṇini's counterpart</span>
			{/if}
		</button>
	{/each}
</div>

<style>
	.letter {
		padding: 14px 18px;
		max-width: 720px;
		margin-bottom: 16px;
	}
	.letter p {
		margin: 4px 0 0;
		font-size: 15px;
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
		gap: 10px;
	}
	.c {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 14px;
		text-align: left;
		cursor: pointer;
		color: var(--ink);
		font-size: 14.5px;
	}
	.c.back {
		border-color: var(--saffron);
	}
	.pan {
		margin-top: 8px;
		color: var(--saffron-ink);
	}
	.ex {
		font-size: 13px;
	}
	.hint {
		font-size: 12px;
		margin-top: auto;
	}
</style>
