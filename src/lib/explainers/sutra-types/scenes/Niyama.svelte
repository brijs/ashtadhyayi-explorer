<script lang="ts">
	import DerivationStrip from '#lib/components/DerivationStrip.svelte';
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	type D = { word: string; hash: string; steps: any[] };
	let { react, complete, data }: SceneProps<{ patya: D; harina: D }> = $props();
	let show = $state<'hari' | 'pati'>('hari');
	let seen = new Set<string>(['hari']);
	function pick(v: 'hari' | 'pati') {
		show = v;
		seen.add(v);
		react(v === 'pati' ? 'पति alone is not घि, so 7.3.120 does not add ना; 6.1.77 makes इ → य्: पत्या.' : 'हरि is घि (1.4.7), so 7.3.120 replaces the ending with ना: हरिणा.', 'think');
		if (seen.size === 2) complete();
	}
</script>

<div class="rules card">
	<p><SutraRef n="1.4.7" s="शेषो घ्यसखि" />: short इ/उ stems (other than सखि) are called <b>घि</b>.</p>
	<p><SutraRef n="1.4.8" s="पतिः समास एव" />: पति is घि <b>only</b> in a compound (समास). This is the restriction.</p>
	<p><SutraRef n="7.3.120" s="आङो नाऽस्त्रियाम्" />: after a घि stem, the instrumental ending becomes ना.</p>
</div>

<div class="tabs" role="tablist">
	<button role="tab" aria-selected={show === 'hari'} onclick={() => pick('hari')}><span class="deva">हरि</span> + instr. sg.</button>
	<button role="tab" aria-selected={show === 'pati'} onclick={() => pick('pati')}><span class="deva">पति</span> + instr. sg.</button>
</div>

{#if show === 'hari'}
	<DerivationStrip steps={data.harina.steps} word={data.harina.word} hash={data.harina.hash} focus={['1.4.7', '7.3.120']} />
{:else}
	<DerivationStrip steps={data.patya.steps} word={data.patya.word} hash={data.patya.hash} focus={['6.1.77']} />
{/if}
<p class="muted note">In a compound like भूपति ("lord of the earth"), पति is घि again: भूपतिना. A restriction rule earns its place by stopping a general rule where it would otherwise overreach.</p>

<style>
	.rules {
		padding: 14px 18px;
		max-width: 720px;
		font-size: 15px;
	}
	.rules p {
		margin: 4px 0;
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
		font-size: 18px;
	}
	.note {
		margin-top: 12px;
		font-size: 14px;
		max-width: 48em;
	}
</style>
