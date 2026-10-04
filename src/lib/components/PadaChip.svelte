<script lang="ts">
	import { ROLE_INFO, VIBHAKTI_NAME, VACANA_NAME, type Pada, type SutraStub, type Term } from '#lib/types.ts';
	import { devaToIast } from '#lib/translit.ts';
	import { settings } from '#lib/settings.svelte.ts';
	import TermPopover from './TermPopover.svelte';

	let { pada, terms, refs, showRole = true }: { pada: Pada; terms: Record<string, Term>; refs: Record<string, SutraStub>; showRole?: boolean } = $props();
	const info = $derived(ROLE_INFO[pada.role]);
	const grammar = $derived(
		pada.kind === 'T'
			? 'tiṅanta'
			: pada.vib === '0'
				? 'avyaya'
				: [VIBHAKTI_NAME[pada.vib], VACANA_NAME[pada.vac]].filter(Boolean).join(' · ')
	);
</script>

<span class="chip" style="--c: var(--r-{pada.role})" title={info.explain}>
	{#if showRole}<span class="role">{info.label}</span>{/if}
	<span class="word deva">
		{#each pada.parts as part, i (i)}
			{#if i > 0}<span class="hy">-</span>{/if}
			{#if part.term && terms[part.term]}
				<TermPopover term={terms[part.term]} {refs}>{part.w}</TermPopover>
			{:else}
				{part.w}
			{/if}
		{/each}
	</span>
	{#if settings.iast}<span class="iast">{pada.iast || devaToIast(pada.w)}</span>{/if}
	<span class="gram">{grammar}</span>
</span>

<style>
	.chip {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		gap: 0;
		padding: 6px 14px 8px;
		border-radius: 12px;
		border: 1.5px solid color-mix(in srgb, var(--c) 55%, transparent);
		background: color-mix(in srgb, var(--c) 8%, var(--surface));
		min-width: 72px;
		text-align: center;
	}
	.role {
		font-size: 10.5px;
		font-weight: 700;
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--c);
	}
	.word {
		font-size: 24px;
		line-height: 1.5;
		color: var(--ink);
	}
	.hy {
		color: var(--muted);
		margin: 0 1px;
	}
	.iast {
		font-size: 14px;
		line-height: 1.3;
	}
	.gram {
		font-size: 11.5px;
		color: var(--muted);
		font-family: var(--font-serif);
		font-style: italic;
	}
</style>
