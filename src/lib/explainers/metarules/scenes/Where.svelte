<script lang="ts">
	import DerivationStrip from '#lib/components/DerivationStrip.svelte';
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	type D = { word: string; hash: string; steps: any[] };
	let { react, complete, data }: SceneProps<{ tau: D; bhavishyati: D }> = $props();
	const CASES = [
		{ key: 'tau', rule: '7.2.102', s: 'त्यदादीनामः', from: ['त्', 'अ', 'द्'], sub: 'अ', meta: '1.1.52', metaS: 'अलोऽन्त्यस्य', ans: 'last', result: ['त्', 'अ', 'अ'], note: 'one-letter substitute → only the last letter: तद् → तअ (later contracted: तौ)' },
		{ key: 'bhavishyati', rule: '2.4.52', s: 'अस्तेर्भूः', from: ['अ', 'स्'], sub: 'भू', meta: '1.1.55', metaS: 'अनेकाल्शित्सर्वस्य', ans: 'whole', result: ['भू'], note: 'multi-letter substitute → the whole: अस् → भू (as in भविष्यति)' }
	] as const;
	let cur = $state(0);
	let answered = $state<Record<string, string>>({});
	function guess(g: 'last' | 'whole') {
		const c = CASES[cur];
		if (g !== c.ans) return react(`Not here. The substitute ${c.sub} has ${c.sub.length > 1 ? 'more than one letter' : 'just one letter'}.`, 'think');
		answered = { ...answered, [c.key]: g };
		react(`${c.meta}: ${c.note}.`, 'happy');
		if (Object.keys(answered).length === 2) complete();
		else cur = 1 - cur;
	}
	const c = $derived(CASES[cur]);
</script>

<div class="tabs" role="tablist">
	{#each CASES as k, i (k.key)}
		<button role="tab" aria-selected={cur === i} onclick={() => (cur = i)}><SutraRef n={k.rule} s={k.s} /></button>
	{/each}
</div>

<div class="vis card">
	<div class="row">
		<span class="lab">target</span>
		{#each c.from as l, i (i)}<span class="t deva" class:hit={answered[c.key] && (c.ans === 'whole' || i === c.from.length - 1)}>{l}</span>{/each}
		<span class="lab">substitute</span><span class="t deva sub">{c.sub}</span>
	</div>
	<p class="q">Which part does <b class="deva">{c.sub}</b> replace?</p>
	<div class="btns">
		<button class="btn" onclick={() => guess('last')}>only the last letter</button>
		<button class="btn" onclick={() => guess('whole')}>the whole thing</button>
	</div>
	{#if answered[c.key]}
		<div class="row res"><span class="lab">result</span>{#each c.result as l, i (i)}<span class="t deva done">{l}</span>{/each}</div>
	{/if}
</div>

{#if answered[c.key]}
	<DerivationStrip steps={data[c.key].steps} word={data[c.key].word} hash={data[c.key].hash} focus={[c.rule]} />
{/if}

<style>
	.tabs {
		display: flex;
		gap: 6px;
		margin-bottom: 12px;
	}
	.tabs button {
		padding: 6px 14px;
		border-radius: 999px;
		border: 1px solid var(--line);
		background: var(--surface);
		cursor: pointer;
	}
	.tabs button[aria-selected='true'] {
		border-color: var(--saffron);
		background: var(--saffron-soft);
	}
	.vis {
		padding: 16px;
		margin-bottom: 14px;
		max-width: 640px;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
	}
	.lab {
		font-size: 12px;
		color: var(--muted);
		margin: 0 4px 0 10px;
	}
	.lab:first-child {
		margin-left: 0;
	}
	.t {
		display: grid;
		place-items: center;
		min-width: 44px;
		height: 48px;
		border-radius: 8px;
		border: 1.5px solid var(--line);
		font-size: 22px;
	}
	.t.hit {
		border-color: var(--r-target);
		background: color-mix(in srgb, var(--r-target) 12%, var(--surface));
	}
	.t.sub,
	.t.done {
		border-color: var(--r-subject);
		background: color-mix(in srgb, var(--r-subject) 12%, var(--surface));
	}
	.q {
		margin: 14px 0 8px;
	}
	.btns {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
	.res {
		margin-top: 14px;
	}
</style>
