<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import { KINDS } from '../kinds.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	let sel = $state<string | null>(null);
	let seen = new Set<string>();
	const k = $derived(KINDS.find((x) => x.key === sel));
	function pick(key: string) {
		sel = key;
		seen.add(key);
		const kk = KINDS.find((x) => x.key === key)!;
		react(`${kk.iast}: ${kk.job}. Example: ${kk.ex.n} ${kk.ex.s}.`, 'happy');
		if (seen.size >= 4) complete();
	}
	const w = (key: string) => KINDS.find((x) => x.key === key)!;
</script>

<div class="verse card deva">
	<p>
		<button class:on={sel === 'S'} onclick={() => pick('S')}>संज्ञा</button> च
		<button class:on={sel === 'P'} onclick={() => pick('P')}>परिभाषा</button> च
		<button class:on={sel === 'V'} onclick={() => pick('V')}>विधिः</button>
		<button class:on={sel === 'N'} onclick={() => pick('N')}>नियमः</button> एव च ।
	</p>
	<p>
		<button class:on={sel === 'AT'} onclick={() => pick('AT')}>अतिदेशः</button>
		<button class:on={sel === 'AD'} onclick={() => pick('AD')}>अधिकारः</button> च षड्विधं सूत्रलक्षणम् ॥
	</p>
</div>

{#if k}
	<div class="kind card" style="--c: var(--t-{k.key === 'N' ? 'V' : k.key})">
		<span class="tt"><span class="deva">{k.sa}</span> · {k.iast} · <b>{k.en}</b></span>
		<span class="job">{k.job}</span>
		<span class="ex"><SutraRef n={k.ex.n} s={k.ex.s} /> {k.ex.why}</span>
	</div>
{:else}
	<p class="muted">"Definition and meta-rule, operation and restriction, extension and heading: the six marks of a sūtra."</p>
{/if}

<style>
	.verse {
		padding: 22px 26px;
		font-size: 26px;
		line-height: 2;
		max-width: 680px;
	}
	.verse p {
		margin: 0;
	}
	.verse button {
		font: inherit;
		background: none;
		border: none;
		border-bottom: 3px dotted var(--saffron);
		padding: 0 2px;
		cursor: pointer;
		color: var(--ink);
		line-height: 1.4;
	}
	.verse button.on {
		background: var(--saffron-soft);
		color: var(--saffron-ink);
		border-radius: 6px;
	}
	.kind {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 16px 20px;
		margin-top: 16px;
		max-width: 680px;
		border-left: 5px solid var(--c);
	}
	.tt {
		font-size: 18px;
	}
	.tt .deva {
		font-size: 22px;
	}
	.job {
		color: var(--ink-2);
	}
	.ex {
		font-size: 15px;
	}
</style>
