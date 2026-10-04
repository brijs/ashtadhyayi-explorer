<script lang="ts">
	import { fly } from 'svelte/transition';
	import SutraRef from '#lib/components/SutraRef.svelte';
	import { settings } from '#lib/settings.svelte.ts';
	import { devaToIast } from '#lib/translit.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	type W = { w: string; n: string };
	type S = { n: string; s: string; pc: string[]; an: W[]; ad: W[]; ss: string };
	let { react, complete, data }: SceneProps<{ s68: S }> = $props();
	const s = $derived(data.s68);

	let step = $state(0);
	const STEPS = [
		{ label: 'Own words', reading: '"In the agent (active) sense: śap." Śap what? Where? When?' },
		{ label: '+ anuvṛtti', reading: '"…when a sārvadhātuka affix follows." Better, but still: śap after what?' },
		{ label: '+ headings', reading: '"After a verbal root, the affix śap is added (with its accent), when a sārvadhātuka affix follows, in the active sense."' }
	];
	function next() {
		if (step >= 2) return;
		step++;
		if (step === 1) react('सार्वधातुके comes down from 3.1.67.', 'happy');
		if (step === 2) {
			react('Now the rule is complete. It is the step that inserts the अ in भू + अ + ति, on the way to भवति.', 'happy');
			complete();
		}
	}
</script>

<div class="build card">
	<div class="line">
		{#each s.pc as w (w)}
			<span class="w own"><span class="deva">{w}</span>{#if settings.iast}<i>{devaToIast(w)}</i>{/if}<small>{s.n}</small></span>
		{/each}
		{#if step >= 1}
			{#each s.an as x (x.w)}
				<span class="w inh" in:fly={{ y: -20, duration: 350 }}><span class="deva">{x.w}</span>{#if settings.iast}<i>{devaToIast(x.w)}</i>{/if}<small>↓ {x.n}</small></span>
			{/each}
		{/if}
		{#if step >= 2}
			{#each s.ad as x, i (x.w)}
				<span class="w head" in:fly={{ y: -20, duration: 350, delay: 90 * i }}><span class="deva">{x.w}</span>{#if settings.iast}<i>{devaToIast(x.w)}</i>{/if}<small>⌂ {x.n}</small></span>
			{/each}
		{/if}
	</div>
	<p class="reading">{STEPS[step].reading}</p>
	<div class="ctl">
		{#each STEPS as st, i (i)}
			<span class="pill" class:on={i <= step}>{st.label}</span>
		{/each}
		{#if step < 2}<button class="btn primary" onclick={next}>Add {STEPS[step + 1].label.replace('+ ', '')} ↓</button>{/if}
	</div>
</div>

{#if step === 2}
	<p class="ss" in:fly={{ y: 8 }}>
		<span class="eyebrow">Traditional full reading</span>
		<span class="deva">{s.ss}</span>
	</p>
{/if}

<p class="muted note">See <SutraRef n="3.1.68" s="कर्तरि शप्" /> and its context panel for the full heading chain.</p>

<style>
	.build {
		padding: 20px;
	}
	.line {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		min-height: 80px;
	}
	.w {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		padding: 4px 12px;
		border-radius: 10px;
		font-size: 22px;
		line-height: 1.4;
	}
	.w i {
		font-family: var(--font-serif);
		font-size: 12px;
		color: var(--ink-2);
	}
	.w small {
		font-family: var(--font-mono);
		font-size: 10.5px;
		color: var(--muted);
	}
	.own {
		border: 2px solid var(--ink-2);
		background: var(--surface);
	}
	.inh {
		border: 2px dashed var(--indigo);
		background: var(--indigo-soft);
	}
	.head {
		border: 2px dashed var(--saffron);
		background: var(--saffron-soft);
	}
	.reading {
		font-family: var(--font-serif);
		font-size: 18px;
		margin: 16px 0;
	}
	.ctl {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px;
	}
	.pill {
		padding: 2px 10px;
		border-radius: 999px;
		border: 1px solid var(--line);
		font-size: 12.5px;
		color: var(--muted);
	}
	.pill.on {
		color: var(--ink);
		border-color: var(--ink-2);
	}
	.ss {
		display: flex;
		flex-direction: column;
		padding: 10px 14px;
		margin-top: 16px;
		border-left: 3px solid var(--saffron);
		background: var(--surface-2);
		border-radius: 0 8px 8px 0;
	}
	.ss .deva {
		font-size: 20px;
	}
	.note {
		margin-top: 14px;
		font-size: 14px;
	}
</style>
