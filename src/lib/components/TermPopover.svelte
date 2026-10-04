<script lang="ts">
	import { resolve } from '$app/paths';
	import { sutraHref } from '#lib/links.ts';
	import type { SutraStub, Term } from '#lib/types.ts';
	import type { Snippet } from 'svelte';

	let { term, refs, children }: { term: Term; refs: Record<string, SutraStub>; children: Snippet } = $props();

	let open = $state(false);
	let root: HTMLSpanElement | undefined = $state();
	let alignRight = $state(false);
	const uid = $props.id();

	function toggle() {
		open = !open;
		if (open && root) {
			const r = root.getBoundingClientRect();
			alignRight = r.left > window.innerWidth - 340;
		}
	}
	function onDocClick(e: MouseEvent) {
		if (open && root && !root.contains(e.target as Node)) open = false;
	}
	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) {
			open = false;
			(root?.querySelector('button') as HTMLButtonElement | null)?.focus();
		}
	}
</script>

<svelte:document onclick={onDocClick} onkeydown={onKey} />

<span class="term" bind:this={root}>
	<button class="trigger" aria-expanded={open} aria-controls="pop-{uid}" onclick={toggle}>
		{@render children()}
	</button>
	{#if open}
		<span class="pop card" class:right={alignRight} id="pop-{uid}" role="dialog" aria-label="Term {term.iast}">
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
		</span>
	{/if}
</span>

<style>
	.term {
		position: relative;
		display: inline-block;
	}
	.trigger {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		color: inherit;
		font: inherit;
		border-bottom: 2px dotted currentColor;
		line-height: inherit;
	}
	.trigger:hover {
		color: var(--saffron-ink);
	}
	.pop {
		position: absolute;
		top: calc(100% + 8px);
		left: -12px;
		z-index: 30;
		width: min(320px, calc(100vw - 32px));
		padding: 14px 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		text-align: left;
		box-shadow: var(--shadow-lg);
		font-family: var(--font-ui);
		font-size: 14px;
		line-height: 1.5;
		color: var(--ink);
		cursor: auto;
		animation: pop-in 0.16s ease-out;
	}
	.pop.right {
		left: auto;
		right: -12px;
	}
	@keyframes pop-in {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
	}
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
