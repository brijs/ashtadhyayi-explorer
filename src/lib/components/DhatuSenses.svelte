<script lang="ts">
	// A root's meanings in three languages. The sources list their own senses for each language, so the three often differ
	// (and Hindi is missing for ~10% of roots); a missing one is simply left out.
	import type { Dhatu } from '#lib/vidyut.ts';

	let { d, inline = false }: { d: Pick<Dhatu, 'm' | 'en' | 'hi'>; inline?: boolean } = $props();
</script>

<span class="senses" class:inline>
	{#if d.m}<span class="s"><abbr class="l" title="Sanskrit (Dhātupāṭha artha)">सं</abbr><span class="deva t">{d.m}</span></span>{/if}
	{#if d.en}<span class="s"><abbr class="l" title="English">En</abbr><span class="t en" lang="en">{d.en}</span></span>{/if}
	{#if d.hi}<span class="s"><abbr class="l" title="Hindi">हि</abbr><span class="deva t" lang="hi">{d.hi}</span></span>{/if}
</span>

<style>
	.senses {
		display: flex;
		flex-direction: column;
		gap: 1px;
		min-width: 0;
	}
	.senses.inline {
		flex-direction: row;
		flex-wrap: wrap;
		gap: 0 14px;
	}
	.s {
		display: flex;
		align-items: baseline;
		gap: 6px;
		min-width: 0;
	}
	.l {
		flex: none;
		min-width: 1.7em;
		padding: 0 3px;
		border-radius: 4px;
		background: var(--surface-3);
		color: var(--muted);
		font-size: 10.5px;
		font-weight: 600;
		text-align: center;
		text-decoration: none;
		font-family: var(--font-ui), var(--font-deva);
	}
	.t {
		overflow-wrap: anywhere;
	}
</style>
