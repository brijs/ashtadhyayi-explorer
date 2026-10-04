<script lang="ts">
	import { sutraHref } from '#lib/links.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	type H = { n: string; s: string; en: string; from: string; to: string; count: number; x0: number; x1: number };
	let { react, complete, data }: SceneProps<{ headings: H[]; adhyayaStarts: number[]; total: number }> = $props();

	let sel = $state<H | null>(null);
	let picks = new Set<string>();

	function pick(h: H) {
		sel = h;
		picks.add(h.n);
		react(`${h.s} (${h.n}) governs ${h.count.toLocaleString()} sūtras, from ${h.from} to ${h.to}.`, 'happy');
		if (picks.size >= 2) complete();
	}
	const bounds = $derived([...data.adhyayaStarts, 1]);
</script>

<div class="bar" role="img" aria-label="All 3,983 sūtras across 8 adhyāyas{sel ? `, with ${sel.n} spanning ${sel.from} to ${sel.to}` : ''}">
	{#each data.adhyayaStarts as x, i (i)}
		<span class="adh" style="left: {x * 100}%; width: {(bounds[i + 1] - x) * 100}%"><span>{i + 1}</span></span>
	{/each}
	{#if sel}
		{#key sel.n}
			<span class="span" style="left: {sel.x0 * 100}%; width: {Math.max(0.4, (sel.x1 - sel.x0) * 100)}%"></span>
		{/key}
	{/if}
</div>
<p class="axis muted">Adhyāya 1 → 8 · each sūtra is a sliver of this bar</p>

<div class="list">
	{#each data.headings as h (h.n)}
		<button class="h" aria-pressed={sel?.n === h.n} onclick={() => pick(h)}>
			<span class="n">{h.n}</span>
			<span class="s deva">{h.s}</span>
			<span class="c">{h.count}</span>
		</button>
	{/each}
</div>

{#if sel}
	<p class="detail card">
		<a href={sutraHref(sel.n)} class="deva big">{sel.s}</a>
		<span>{sel.en.replace(/<<|>>|\[\[|\]\]/g, '')}</span>
	</p>
{/if}

<style>
	.bar {
		position: relative;
		height: 54px;
		border-radius: 10px;
		background: var(--surface-2);
		overflow: hidden;
		border: 1px solid var(--line);
	}
	.adh {
		position: absolute;
		top: 0;
		bottom: 0;
		border-left: 1px solid var(--line);
		display: flex;
		align-items: flex-end;
		padding: 0 0 4px 6px;
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--muted);
	}
	.span {
		position: absolute;
		top: 8px;
		bottom: 18px;
		border-radius: 6px;
		background: var(--saffron);
		opacity: 0.85;
		animation: grow 0.6s ease-out both;
		transform-origin: left;
	}
	@keyframes grow {
		from { transform: scaleX(0); }
	}
	.axis {
		font-size: 12.5px;
		margin: 6px 0 16px;
	}
	.list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 8px;
	}
	.h {
		display: flex;
		align-items: baseline;
		gap: 8px;
		padding: 8px 12px;
		border-radius: 10px;
		border: 1.5px solid var(--line);
		background: var(--surface);
		cursor: pointer;
		text-align: left;
		color: var(--ink);
		min-width: 0;
	}
	.h[aria-pressed='true'] {
		border-color: var(--saffron);
		background: var(--saffron-soft);
	}
	.n {
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--saffron-ink);
	}
	.s {
		font-size: 17px;
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.c {
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--muted);
	}
	.detail {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 14px 18px;
		margin-top: 16px;
		font-size: 15px;
		color: var(--ink-2);
	}
	.big {
		font-size: 22px;
		text-decoration: none;
	}
</style>
