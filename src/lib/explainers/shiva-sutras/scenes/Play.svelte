<script lang="ts">
	import ShivaGrid from '#lib/components/ShivaGrid.svelte';
	import SutraRef from '#lib/components/SutraRef.svelte';
	import { SHIVA_FLAT, rangeSlots, pratyaharaName } from '#lib/varna.ts';
	import { devaToIast } from '#lib/translit.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	type Attested = { name: string; sutras: { n: string; s: string }[] };
	let { react, complete, data }: SceneProps<{ attested: Attested[] }> = $props();

	let start = $state<number | null>(null);
	let end = $state<number | null>(null);
	let built = $state(new Set<string>());
	const attested = $derived(new Map(data.attested.map((a) => [a.name, a])));

	const lit = $derived(start !== null && end !== null ? new Set(rangeSlots(start, end)) : new Set<number>());
	const marked = $derived(new Set([start, end].filter((x): x is number => x !== null)));
	const name = $derived(start !== null && end !== null ? pratyaharaName(start, end) : '');
	const letters = $derived([...lit].map((i) => SHIVA_FLAT[i].varna).map((v) => (v.length > 1 ? v[0] : v)));
	const used = $derived(name ? attested.get(name) : undefined);

	function pick(i: number) {
		const s = SHIVA_FLAT[i];
		if (!s.isIt) {
			start = i;
			end = null;
			return;
		}
		if (start === null || i < start) {
			react('Pick a starting sound first, then a marker after it.', 'think');
			return;
		}
		end = i;
		const nm = pratyaharaName(start, i);
		built = new Set([...built, nm]);
		if (attested.has(nm)) react(`${nm} (${devaToIast(nm)}) is one Pāṇini really uses.`, 'happy');
		else react(`${nm} is well-formed, but Pāṇini never needed it.`, 'think');
		if (built.size >= 3) complete();
	}
	const tryName = (nm: string) => {
		// find a start and marker for a listed name (first occurrence of the marker after the start)
		const startLetter = nm.length && SHIVA_FLAT.findIndex((s) => !s.isIt && (s.varna === nm[0] || s.varna === nm[0] + '्'));
		const markerV = nm.slice(-2);
		const st = startLetter as number;
		const m = SHIVA_FLAT.findIndex((s, i) => i > st && s.isIt && s.varna === markerV);
		if (st >= 0 && m >= 0) {
			start = st;
			pick(m);
		}
	};
</script>

<div class="result card" aria-live="polite">
	{#if name}
		<span class="nm deva">{name}</span>
		<span class="iast">{devaToIast(name)}</span>
		<span class="ls deva">{letters.join(' ')}</span>
		<span class="meta">
			{letters.length} sound{letters.length === 1 ? '' : 's'} ·
			{#if used}
				used in {#each used.sutras.slice(0, 2) as u, k (u.n)}{k ? ', ' : ''}<SutraRef n={u.n} s={u.s} />{/each}
			{:else}
				not used by Pāṇini
			{/if}
		</span>
	{:else if start !== null}
		<span class="muted">Start: <b class="deva">{SHIVA_FLAT[start].varna.length > 1 ? SHIVA_FLAT[start].varna[0] : SHIVA_FLAT[start].varna}</b>. Now pick a marker after it.</span>
	{:else}
		<span class="muted">Pick a starting sound.</span>
	{/if}
</div>

<ShivaGrid {lit} {marked} pickable={() => true} onpick={pick} />

<div class="try">
	<span class="eyebrow">Try these</span>
	{#each ['अण्', 'इक्', 'यण्', 'हल्', 'झल्', 'शर्', 'एङ्', 'जश्'] as nm (nm)}
		<button class="btn deva" onclick={() => tryName(nm)}>{nm}</button>
	{/each}
</div>

<style>
	.result {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 4px 14px;
		min-height: 64px;
		padding: 12px 18px;
		margin-bottom: 16px;
	}
	.nm {
		font-size: 30px;
		font-weight: 600;
		color: var(--saffron-ink);
	}
	.ls {
		font-size: 19px;
	}
	.meta {
		width: 100%;
		font-size: 14px;
		color: var(--ink-2);
	}
	.try {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		margin-top: 16px;
	}
	.try .btn {
		font-size: 17px;
		padding: 4px 14px;
	}
</style>
