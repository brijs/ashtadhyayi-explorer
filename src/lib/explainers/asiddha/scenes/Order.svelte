<script lang="ts">
	import DerivationStrip from '#lib/components/DerivationStrip.svelte';
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	type D = { word: string; hash: string; steps: any[] };
	let { react, complete, data }: SceneProps<{ ramah: D }> = $props();
	let order = $state<'right' | 'wrong' | null>(null);
	let seen = new Set<string>();
	function run(o: 'right' | 'wrong') {
		order = o;
		seen.add(o);
		react(
			o === 'right'
				? '8.2.66 first: स् → रु (→ र्). Then 8.3.15: final र् → ः. Result: रामः.'
				: 'Reversed: 8.3.15 finds no र् yet and does nothing; then 8.2.66 makes रामर्. Nothing fixes it afterwards. Order matters.',
			o === 'right' ? 'happy' : 'surprised'
		);
		if (seen.size === 2) complete();
	}
</script>

<div class="two">
	<div class="card col">
		<span class="eyebrow">text order</span>
		<ol>
			<li><SutraRef n="8.2.66" s="ससजुषो रुः" /> final स् → रु</li>
			<li><SutraRef n="8.3.15" s="खरवसानयोर्विसर्जनीयः" /> final र् → ः</li>
		</ol>
		<button class="btn" aria-pressed={order === 'right'} onclick={() => run('right')}>Run in this order</button>
		{#if order === 'right'}<p class="trace deva">रामस् → राम<b>रु</b> → राम<b>र्</b> → राम<b>ः</b> ✓</p>{/if}
	</div>
	<div class="card col">
		<span class="eyebrow">reversed</span>
		<ol>
			<li><SutraRef n="8.3.15" /> final र् → ः</li>
			<li><SutraRef n="8.2.66" /> final स् → रु</li>
		</ol>
		<button class="btn" aria-pressed={order === 'wrong'} onclick={() => run('wrong')}>Run reversed</button>
		{#if order === 'wrong'}<p class="trace bad deva">रामस् → रामस् (no र् yet) → राम<b>र्</b> ✗</p>{/if}
	</div>
</div>

{#if order === 'right'}
	<DerivationStrip steps={data.ramah.steps} word={data.ramah.word} hash={data.ramah.hash} focus={['8.2.66', '8.3.15']} />
{/if}

<style>
	.two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
		margin-bottom: 14px;
	}
	.col {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 14px 16px;
	}
	ol {
		margin: 0;
		padding-left: 18px;
		font-size: 14.5px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.col .btn {
		align-self: flex-start;
	}
	.trace {
		margin: 0;
		font-size: 22px;
	}
	.trace b {
		color: var(--saffron-ink);
	}
	.trace.bad b {
		color: var(--r-target);
	}
	@media (max-width: 640px) {
		.two {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
