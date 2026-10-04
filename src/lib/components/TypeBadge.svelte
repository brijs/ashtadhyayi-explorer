<script lang="ts">
	import { TYPE_INFO, type SutraType } from '#lib/types.ts';

	let { code, label = '', compact = false }: { code: SutraType['code']; label?: string; compact?: boolean } = $props();
	const info = $derived(TYPE_INFO[code]);
</script>

<span class="badge" class:compact style="--c: var(--t-{code})" title="{info.en} ({info.iast}): {info.blurb}">
	{#if compact}
		{info.iast}
	{:else}
		<span class="en">{info.en}</span>
		<span class="sa">{info.iast}</span>
		{#if label}<span class="label deva">{label}</span>{/if}
	{/if}
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: baseline;
		gap: 6px;
		padding: 2px 10px;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--c) 45%, transparent);
		background: color-mix(in srgb, var(--c) 10%, transparent);
		color: var(--c);
		font-size: 13px;
		font-weight: 600;
		white-space: nowrap;
	}
	.compact {
		font-size: 11px;
		padding: 0 7px;
		font-family: var(--font-serif);
		font-style: italic;
		font-weight: 600;
	}
	.sa {
		font-family: var(--font-serif);
		font-style: italic;
		font-weight: 500;
		opacity: 0.85;
	}
	.label {
		font-weight: 500;
		color: var(--ink-2);
		font-size: 13px;
	}
</style>
