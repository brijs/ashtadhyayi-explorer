<script lang="ts">
	import { sutraHref } from '#lib/links.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	type Row = { n: string; s: string; en: string; aci: boolean; an: { w: string; n: string }[] };
	let { react, complete, data }: SceneProps<{ river: Row[] }> = $props();
	let sel = $state<string | null>(null);
	let looked = new Set<string>();
	const count = $derived(data.river.filter((r) => r.aci && r.n !== '6.1.77').length);

	function pick(r: Row) {
		sel = r.n;
		looked.add(r.n);
		if (r.n === '6.1.77') react('This is the source: अचि is written here.', 'happy');
		else if (!r.an.length) react(`${r.n} inherits nothing: its own words are enough.`, 'think');
		else react(`${r.n} inherits: ${r.an.map((x) => `${x.w} (from ${x.n})`).join(', ')}.`, r.aci ? 'happy' : 'think');
		if (looked.size >= 3) complete();
	}
</script>

<p class="legend"><span class="dot"></span> receives <span class="deva">अचि</span> from 6.1.77 · {count} sūtras in this stretch</p>
<ol class="river">
	{#each data.river as r (r.n)}
		<li class:aci={r.aci} class:src={r.n === '6.1.77'} class:sel={sel === r.n}>
			<span class="flow" aria-hidden="true"></span>
			<button onclick={() => pick(r)}>
				<span class="n">{r.n}</span>
				<span class="s deva">{r.s}</span>
			</button>
			{#if sel === r.n}<a class="open" href={sutraHref(r.n)}>open →</a>{/if}
		</li>
	{/each}
</ol>

<style>
	.legend {
		font-size: 14px;
		color: var(--ink-2);
	}
	.dot {
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--indigo);
		margin-right: 4px;
	}
	.river {
		list-style: none;
		padding: 0;
		margin: 0;
		columns: 2;
		column-gap: 28px;
		max-width: 820px;
	}
	li {
		position: relative;
		display: flex;
		align-items: center;
		gap: 8px;
		break-inside: avoid;
		padding-left: 18px;
	}
	.flow {
		position: absolute;
		left: 4px;
		top: 0;
		bottom: 0;
		width: 4px;
		background: var(--line);
		opacity: 0.4;
	}
	.aci .flow {
		background: var(--indigo);
		opacity: 1;
	}
	.src .flow {
		background: var(--saffron);
		top: 40%;
	}
	button {
		display: flex;
		align-items: baseline;
		gap: 8px;
		flex: 1;
		min-width: 0;
		padding: 3px 8px;
		border: none;
		border-radius: 6px;
		background: none;
		text-align: left;
		cursor: pointer;
		color: var(--ink-2);
	}
	.aci button {
		color: var(--ink);
	}
	button:hover,
	.sel button {
		background: var(--surface-2);
	}
	.n {
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--saffron-ink);
		flex-shrink: 0;
	}
	.s {
		font-size: 16px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.open {
		font-size: 12.5px;
		white-space: nowrap;
	}
	@media (max-width: 700px) {
		.river {
			columns: 1;
		}
	}
</style>
