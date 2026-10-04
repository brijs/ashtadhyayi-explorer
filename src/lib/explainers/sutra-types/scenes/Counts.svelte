<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import { TYPE_INFO } from '#lib/types.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	type Ex = { n: string; s: string; en: string };
	let { react, complete, data }: SceneProps<{ counts: Record<string, number>; examples: Record<string, Ex[]> }> = $props();
	const ORDER = ['V', 'S', 'AT', 'AD', 'P'] as const;
	const total = $derived(ORDER.reduce((n, k) => n + (data.counts[k] ?? 0), 0));
	const max = $derived(Math.max(...ORDER.map((k) => data.counts[k] ?? 0)));
	let sel = $state<(typeof ORDER)[number] | null>(null);
	let seen = new Set<string>();
	function pick(k: (typeof ORDER)[number]) {
		sel = k;
		seen.add(k);
		react(`${TYPE_INFO[k].en}s: ${data.counts[k]} of ${total.toLocaleString()} sūtras (${((100 * data.counts[k]) / total).toFixed(1)}%).`, 'happy');
		if (seen.size >= 2) complete();
	}
</script>

<div class="chart" role="group" aria-label="Sūtras by kind">
	{#each ORDER as k (k)}
		<button class="row" class:on={sel === k} onclick={() => pick(k)} style="--c: var(--t-{k})">
			<span class="lab">{TYPE_INFO[k].en} <i>{TYPE_INFO[k].iast}</i></span>
			<span class="track"><span class="bar" style="width: {Math.max(1.5, (100 * (data.counts[k] ?? 0)) / max)}%"></span></span>
			<span class="num">{(data.counts[k] ?? 0).toLocaleString()}</span>
		</button>
	{/each}
</div>
<p class="muted small">Counted by each sūtra's first listed kind in ashtadhyayi.com's data. Restrictions (niyama) are counted among operational rules there.</p>

{#if sel}
	<ul class="ex">
		{#each data.examples[sel] as e (e.n)}
			<li><SutraRef n={e.n} s={e.s} /> <span class="muted">{e.en.slice(0, 90)}{e.en.length > 90 ? '…' : ''}</span></li>
		{/each}
	</ul>
{/if}

<style>
	.chart {
		display: flex;
		flex-direction: column;
		gap: 6px;
		max-width: 720px;
	}
	.row {
		display: grid;
		grid-template-columns: 200px minmax(0, 1fr) 60px;
		align-items: center;
		gap: 10px;
		padding: 4px 6px;
		border: none;
		border-radius: 8px;
		background: none;
		cursor: pointer;
		color: var(--ink);
		text-align: left;
	}
	.row:hover,
	.row.on {
		background: var(--surface-2);
	}
	.lab i {
		font-family: var(--font-serif);
		color: var(--muted);
	}
	.track {
		height: 18px;
		border-radius: 4px;
		background: var(--surface-2);
	}
	.bar {
		display: block;
		height: 100%;
		border-radius: 4px;
		background: var(--c);
		transition: width 0.6s;
	}
	.num {
		font-family: var(--font-mono);
		font-size: 13px;
		text-align: right;
	}
	.small {
		font-size: 13px;
	}
	.ex {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 14.5px;
	}
	@media (max-width: 600px) {
		.row {
			grid-template-columns: 120px minmax(0, 1fr) 46px;
		}
		.lab i {
			display: none;
		}
	}
</style>
