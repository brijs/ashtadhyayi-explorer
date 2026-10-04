<script lang="ts">
	import DerivationStrip from '#lib/components/DerivationStrip.svelte';
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	type D = { word: string; hash: string; steps: any[] };
	let { react, complete, data }: SceneProps<{ pl: D; du: D }> = $props();
	let show = $state<'pl' | 'du'>('pl');
	let seen = new Set<string>(['pl']);
	function pick(v: 'pl' | 'du') {
		show = v;
		seen.add(v);
		react(v === 'du' ? 'वृक्ष + भ्याम् (dual): 7.3.103 needs a plural, so there is no conflict and 7.3.102 applies: वृक्षाभ्याम्.' : 'Plural: both match, and the later 7.3.103 wins: वृक्षेभ्यः.', 'happy');
		if (seen.size === 2) complete();
	}
</script>

<div class="rule card">
	<SutraRef n="1.4.2" s="विप्रतिषेधे परं कार्यम्" />
	<span>"In a conflict, the later (rule) is to be applied."</span>
</div>
<div class="tabs" role="tablist">
	<button role="tab" aria-selected={show === 'pl'} onclick={() => pick('pl')}>plural <span class="deva">भ्यस्</span></button>
	<button role="tab" aria-selected={show === 'du'} onclick={() => pick('du')}>dual <span class="deva">भ्याम्</span></button>
</div>
{#if show === 'pl'}
	<DerivationStrip steps={data.pl.steps} word={data.pl.word} hash={data.pl.hash} focus={['7.3.103']} />
{:else}
	<DerivationStrip steps={data.du.steps} word={data.du.word} hash={data.du.hash} focus={['7.3.102']} />
{/if}
<p class="muted note">vidyut lists only the rule that actually fired; the losing candidate leaves no trace in the derivation.</p>

<style>
	.rule {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 14px 18px;
		max-width: 560px;
		font-family: var(--font-serif);
		font-size: 16px;
	}
	.rule :global(.sref) {
		font-size: 19px;
	}
	.tabs {
		display: flex;
		gap: 6px;
		margin: 16px 0 10px;
	}
	.tabs button {
		padding: 6px 14px;
		border-radius: 999px;
		border: 1px solid var(--line);
		background: var(--surface);
		cursor: pointer;
		color: var(--ink);
	}
	.tabs button[aria-selected='true'] {
		border-color: var(--saffron);
		background: var(--saffron-soft);
	}
	.tabs .deva {
		font-size: 17px;
	}
	.note {
		margin-top: 10px;
		font-size: 13.5px;
	}
</style>
