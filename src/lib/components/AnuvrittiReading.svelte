<script lang="ts">
	import { fly } from 'svelte/transition';
	import { sutraHref } from '#lib/links.ts';
	import { settings } from '#lib/settings.svelte.ts';
	import type { Pada, SutraStub, WordRef } from '#lib/types.ts';

	let { pc, an, ad, ss, ssIast, refs }: { pc: Pada[]; an: WordRef[]; ad: WordRef[]; ss: string; ssIast: string; refs: Record<string, SutraStub> } = $props();

	let expanded = $state(false);
	// Show only the innermost headings; the full chain is in the context panel.
	const headings = $derived(ad.slice(-2));
	const hasMore = $derived(an.length > 0 || headings.length > 0);
</script>

<section class="anuvritti" aria-labelledby="anu-h">
	<div class="head">
		<h2 id="anu-h" class="eyebrow">Full reading</h2>
		{#if hasMore}
			<button class="btn" aria-pressed={expanded} onclick={() => (expanded = !expanded)}>
				{expanded ? 'Hide inherited words' : `Fill in inherited words (${an.length + headings.length})`}
			</button>
		{/if}
	</div>

	<div class="line" aria-live="polite">
		{#each pc as p, i (i)}
			<span class="w own" style="--c: var(--r-{p.role})">
				<span class="deva">{p.w}</span>
				{#if settings.iast}<i>{p.iast}</i>{/if}
			</span>
		{/each}
		{#if expanded}
			{#each an as x, i (x.id + x.w)}
				<a class="w inherited" href={sutraHref(refs[x.id]?.n ?? '')} in:fly={{ y: -18, duration: 380, delay: 70 * i }} title="Carried down (anuvṛtti) from {refs[x.id]?.n}: {refs[x.id]?.s}">
					<span class="deva">{x.w}</span>
					{#if settings.iast}<i>{x.iast}</i>{/if}
					<span class="src">↓ {refs[x.id]?.n}</span>
				</a>
			{/each}
			{#each headings as x, i (x.id + x.w)}
				<a class="w heading" href={sutraHref(refs[x.id]?.n ?? '')} in:fly={{ y: -18, duration: 380, delay: 70 * (an.length + i) }} title="Heading (adhikāra) from {refs[x.id]?.n}: {refs[x.id]?.s}">
					<span class="deva">{x.w}</span>
					{#if settings.iast}<i>{x.iast}</i>{/if}
					<span class="src">⌂ {refs[x.id]?.n}</span>
				</a>
			{/each}
		{/if}
	</div>

	{#if expanded}
		<div class="legend" in:fly={{ y: 6, duration: 250 }}>
			<span><span class="sw own-sw"></span>written in this sūtra</span>
			<span><span class="sw inh-sw"></span>carried down from an earlier sūtra (anuvṛtti)</span>
			<span><span class="sw head-sw"></span>supplied by a heading (adhikāra)</span>
		</div>
		{#if ss}
			<p class="ss">
				<span class="eyebrow">Traditional full reading</span>
				<span class="deva">{ss}</span>
				{#if settings.iast}<span class="iast">{ssIast}</span>{/if}
			</p>
		{/if}
	{:else if hasMore}
		<p class="muted hint">Pāṇini leaves out words that carry over from earlier sūtras. Expand to see the rule as a reader actually understands it.</p>
	{/if}
</section>

<style>
	.anuvritti {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
	}
	.head h2 {
		margin: 0;
	}
	.line {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.w {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		padding: 2px 12px 4px;
		border-radius: 8px;
		font-size: 20px;
		line-height: 1.5;
		text-decoration: none;
		color: var(--ink);
	}
	.w i {
		font-family: var(--font-serif);
		font-size: 13px;
		color: var(--ink-2);
		line-height: 1.2;
	}
	.own {
		background: color-mix(in srgb, var(--c) 10%, var(--surface));
		border: 1.5px solid color-mix(in srgb, var(--c) 50%, transparent);
	}
	.inherited {
		border: 1.5px dashed var(--indigo);
		background: var(--indigo-soft);
	}
	.heading {
		border: 1.5px dashed var(--saffron);
		background: var(--saffron-soft);
	}
	.src {
		font-family: var(--font-mono);
		font-size: 10.5px;
		color: var(--muted);
		line-height: 1.2;
	}
	.inherited:hover,
	.heading:hover {
		filter: brightness(0.97);
		text-decoration: underline;
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 6px 18px;
		font-size: 12.5px;
		color: var(--muted);
	}
	.sw {
		display: inline-block;
		width: 14px;
		height: 10px;
		border-radius: 3px;
		margin-right: 6px;
		vertical-align: middle;
	}
	.own-sw {
		border: 1.5px solid var(--ink-2);
	}
	.inh-sw {
		border: 1.5px dashed var(--indigo);
		background: var(--indigo-soft);
	}
	.head-sw {
		border: 1.5px dashed var(--saffron);
		background: var(--saffron-soft);
	}
	.ss {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 10px 14px;
		border-left: 3px solid var(--saffron);
		background: var(--surface-2);
		border-radius: 0 8px 8px 0;
	}
	.ss .deva {
		font-size: 19px;
	}
	.hint {
		margin: 0;
		font-size: 14px;
	}
</style>
