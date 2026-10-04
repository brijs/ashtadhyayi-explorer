<script lang="ts">
	import DerivationStrip from '#lib/components/DerivationStrip.svelte';
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	type D = { word: string; hash: string; steps: any[] };
	let { react, complete, data }: SceneProps<{ rajabhih: D; ramaih: D }> = $props();
	let mode = $state<'real' | 'visible' | null>(null);
	let seen = new Set<string>();
	function pick(m: 'real' | 'visible') {
		mode = m;
		seen.add(m);
		react(
			m === 'visible'
				? 'If 8.2.7 were visible, राज would look like an अ-stem, 7.1.9 would turn भिस् into ऐस्, and we would get राजैः, like रामैः. Wrong!'
				: '8.2.7 is asiddha: to 7.1.9 the stem still ends in न्, so भिस् stays: राजभिः. Correct.',
			m === 'visible' ? 'surprised' : 'happy'
		);
		if (seen.size === 2) complete();
	}
</script>

<div class="flow">
	<div class="st card"><span class="eyebrow">start</span><span class="deva">राजन् + भिस्</span></div>
	<div class="st card"><span class="eyebrow"><SutraRef n="8.2.7" s="नलोपः प्रातिपदिकान्तस्य" /></span><span class="deva">राज + भिस्</span><small>न् deleted: now it ends in अ…</small></div>
	<div class="st card q">
		<span class="eyebrow">Can <SutraRef n="7.1.9" s="अतो भिस ऐस्" /> see that अ?</span>
		<div class="btns">
			<button class="btn" aria-pressed={mode === 'visible'} onclick={() => pick('visible')}>Pretend it can</button>
			<button class="btn" aria-pressed={mode === 'real'} onclick={() => pick('real')}>Apply 8.2.1 (it cannot)</button>
		</div>
		{#if mode === 'visible'}<span class="out bad deva">राजैः ✗</span>{/if}
		{#if mode === 'real'}<span class="out ok deva">राजभिः ✓</span>{/if}
	</div>
</div>

{#if mode === 'real'}
	<DerivationStrip steps={data.rajabhih.steps} word={data.rajabhih.word} hash={data.rajabhih.hash} focus={['8.2.7']} />
{:else if mode === 'visible'}
	<p class="muted cmp">Compare a true अ-stem, where 7.1.9 does apply:</p>
	<DerivationStrip steps={data.ramaih.steps} word={data.ramaih.word} hash={data.ramaih.hash} focus={['7.1.9']} />
{/if}

<style>
	.flow {
		display: flex;
		flex-direction: column;
		gap: 8px;
		max-width: 620px;
		margin-bottom: 16px;
	}
	.st {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 12px 16px;
	}
	.st .deva {
		font-size: 26px;
	}
	.st small {
		font-size: 13px;
		color: var(--ink-2);
	}
	.btns {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
	.out {
		font-size: 30px !important;
		font-weight: 700;
	}
	.out.bad {
		color: var(--r-target);
	}
	.out.ok {
		color: var(--r-subject);
	}
	.cmp {
		font-size: 14px;
	}
</style>
