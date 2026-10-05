<script lang="ts">
	import { sutraHref } from '#lib/links.ts';
	import { IT_RULES, KEPT_RULES } from '#lib/it.ts';
	import HoverCard from './HoverCard.svelte';

	// A sūtra number from the it-saṃjñā section (or a rule that keeps a sound) with a card: text, English, link.
	let { n, showText = false }: { n: string; showText?: boolean } = $props();
	const r = $derived(IT_RULES[n] ?? KEPT_RULES[n]);
	const page = $derived(n.split('.').slice(0, 3).join('.'));
	const varttika = $derived(n.split('.').length > 3);
</script>

{#if r}
	<HoverCard label="Sūtra {n}" underline={false} triggerClass="irr-trigger">
		{#snippet trigger()}<span class="irr"><span class="num">{n}</span>{#if showText}&nbsp;<span class="deva">{r.s}</span>{/if}</span>{/snippet}
		<span class="eyebrow">{varttika ? `Vārttika on ${page}` : `Sūtra ${n}`}</span>
		<span class="s deva">{r.s}</span>
		<span class="en">{r.en}</span>
		<a href={sutraHref(page)}>Open {page} →</a>
	</HoverCard>
{:else}
	<a class="irr" href={sutraHref(page)}><span class="num">{n}</span></a>
{/if}

<style>
	.irr {
		white-space: nowrap;
		border-bottom: 1px dotted color-mix(in srgb, var(--indigo) 60%, transparent);
		color: var(--indigo);
		text-decoration: none;
	}
	.num {
		font-family: var(--font-mono);
		font-size: 0.88em;
	}
	.s {
		font-size: 19px;
		line-height: 1.4;
	}
	.en {
		color: var(--ink-2);
		font-size: 13.5px;
	}
</style>
