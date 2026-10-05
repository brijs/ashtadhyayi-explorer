<script lang="ts">
	import { resolve } from '$app/paths';
	import { sutraHref } from '#lib/links.ts';
	import type { SutraStub, Term } from '#lib/types.ts';
	import type { Snippet } from 'svelte';
	import HoverCard from './HoverCard.svelte';

	let { term, refs, children }: { term: Term; refs: Record<string, SutraStub>; children: Snippet } = $props();
</script>

<HoverCard label="Term {term.iast}" trigger={children}>
	<span class="head">
		<span class="key deva">{term.key}</span>
		<span class="iast">{term.iast}</span>
		<span class="kind">{term.kind === 'pratyahara' ? 'pratyāhāra · sound class' : 'saṃjñā · technical term'}</span>
	</span>
	{#if term.letters?.length}
		<span class="letters">
			{#each term.letters as l, i (i)}<span class="letter deva">{l}</span>{/each}
		</span>
		{#if term.kind === 'pratyahara'}
			<a class="tool" href={resolve('/tools/pratyahara') + '/#' + encodeURIComponent(term.key)}>See it on the Śiva sūtras →</a>
		{/if}
	{/if}
	{#if term.en}<span class="en">{term.en}</span>{/if}
	{#if term.kind === 'samjna' && term.sutras.length}
		<span class="def">
			<span class="eyebrow">Defined by</span>
			{#each term.sutras.slice(0, 4) as id (id)}
				{#if refs[id]}
					<a href={sutraHref(refs[id].n)}><span class="n">{refs[id].n}</span> <span class="deva">{refs[id].s}</span></a>
				{/if}
			{/each}
		</span>
	{/if}
	{#if term.usedIn?.length}
		<span class="def">
			<span class="eyebrow">Appears in {term.usedIn.length} sūtra{term.usedIn.length === 1 ? '' : 's'}</span>
			{#each term.usedIn.slice(0, 6) as id (id)}
				{#if refs[id]}
					<a href={sutraHref(refs[id].n)}><span class="n">{refs[id].n}</span> <span class="deva">{refs[id].s}</span></a>
				{/if}
			{/each}
			{#if term.usedIn.length > 6}<span class="more muted">…and {term.usedIn.length - 6} more</span>{/if}
		</span>
	{/if}
</HoverCard>

<style>
	.head {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 4px 10px;
	}
	.key {
		font-size: 24px;
		line-height: 1.3;
	}
	.kind {
		width: 100%;
		font-size: 11.5px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--muted);
		font-weight: 600;
	}
	.letters {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}
	.letter {
		min-width: 30px;
		text-align: center;
		padding: 0 6px;
		border-radius: 6px;
		background: var(--saffron-soft);
		color: var(--saffron-ink);
		font-size: 17px;
	}
	.en {
		color: var(--ink-2);
	}
	.def {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.def a {
		text-decoration: none;
		color: var(--ink);
	}
	.def a:hover .deva {
		color: var(--indigo);
	}
	.n {
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--saffron-ink);
	}
	.tool {
		font-size: 13px;
	}
	.more {
		font-size: 12.5px;
	}
</style>
