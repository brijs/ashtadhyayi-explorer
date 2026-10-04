<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import { RULES } from '#lib/rewrite.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete, panel }: SceneProps = $props();
	let flipped = $state(new Set<string>());

	function flip(id: string) {
		const s = new Set(flipped);
		if (s.has(id)) s.delete(id);
		else s.add(id);
		flipped = s;
		panel(id);
		if (s.size >= 3) {
			react('Same information, two notations. Pāṇini encodes "target", "replacement" and "context" with case endings instead of arrows and slashes.', 'happy');
			complete();
		}
	}
</script>

<div class="cards">
	{#each RULES as r (r.id)}
		<button class="card flip" class:back={flipped.has(r.id)} onclick={() => flip(r.id)} aria-pressed={flipped.has(r.id)}>
			<span class="n">{r.id}</span>
			{#if flipped.has(r.id)}
				<span class="nota">{r.notation}</span>
				<span class="gloss">{r.gloss}</span>
			{:else}
				<span class="deva s">{r.sutra}</span>
				<span class="hint muted">tap to translate</span>
			{/if}
		</button>
	{/each}
</div>

<p class="muted note">
	The A → B / C _ D format was popularized by Chomsky and Halle's <i>The Sound Pattern of English</i> (1968). Pāṇini's case
	conventions do the same job: <SutraRef n="1.1.49" /> (6th = target), <SutraRef n="1.1.66" /> (7th = right context),
	<SutraRef n="1.1.67" /> (5th = left context). Some rules here, like 6.1.87, also inherit words; the notation shows the
	rule as it is understood, not word for word.
</p>

<style>
	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
		gap: 12px;
	}
	.flip {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-height: 130px;
		padding: 16px;
		text-align: left;
		cursor: pointer;
		color: var(--ink);
		transition: transform 0.25s, background 0.25s;
	}
	.flip:hover {
		transform: translateY(-2px);
	}
	.flip.back {
		background: #1d2140;
		border-color: #1d2140;
		color: #e6e8ff;
	}
	.n {
		font-family: var(--font-mono);
		font-size: 12.5px;
		color: var(--saffron-ink);
	}
	.back .n {
		color: #f0a24c;
	}
	.s {
		font-size: 24px;
		line-height: 1.4;
	}
	.nota {
		font-family: var(--font-mono);
		font-size: 15px;
		color: #5fe0c0;
	}
	.gloss {
		font-size: 13.5px;
		color: #c9cbef;
	}
	.hint {
		font-size: 12px;
		margin-top: auto;
	}
	.note {
		margin-top: 18px;
		font-size: 14px;
		max-width: 50em;
	}
</style>
