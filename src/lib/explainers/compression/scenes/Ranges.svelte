<script lang="ts">
	import ShivaGrid from '#lib/components/ShivaGrid.svelte';
	import { SHIVA_FLAT, rangeSlots, pratyaharaName } from '#lib/varna.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete, panel }: SceneProps = $props();
	let sel = $state(new Set<number>());
	let checks = 0;

	function toggle(i: number) {
		if (SHIVA_FLAT[i].isIt) return;
		const s = new Set(sel);
		if (s.has(i)) s.delete(i);
		else s.add(i);
		sel = s;
	}
	// A set is nameable if it is exactly the letters from its first slot up to some marker.
	const verdict = $derived.by(() => {
		if (!sel.size) return null;
		const lo = Math.min(...sel);
		for (let m = lo + 1; m < SHIVA_FLAT.length; m++) {
			if (!SHIVA_FLAT[m].isIt) continue;
			const r = rangeSlots(lo, m);
			if (r.length === sel.size && r.every((x) => sel.has(x))) return { ok: true as const, name: pratyaharaName(lo, m) };
			if (r.length > sel.size) break;
		}
		return { ok: false as const };
	});
	function check() {
		if (!verdict) return react('Select some sounds first.', 'think');
		checks++;
		panel(verdict.ok ? verdict.name : 'no name');
		react(verdict.ok ? `Nameable: ${verdict.name}. ${sel.size} sounds for the price of 2 letters.` : 'Not nameable: the run has gaps or does not end right before a marker. You would have to list the sounds.', verdict.ok ? 'happy' : 'think');
		if (checks >= 2) complete();
	}
	const presets: [string, number[]][] = [
		['अ इ उ', [0, 1, 2]],
		['इ उ ऋ ऌ', [1, 2, 4, 5]],
		['अ उ', [0, 2]]
	];
</script>

<div class="ctl">
	<button class="btn primary" onclick={check}>Can this be named?</button>
	<button class="btn" onclick={() => (sel = new Set())}>Clear</button>
	{#each presets as [label, slots] (label)}
		<button class="btn deva" onclick={() => { sel = new Set(slots); check(); }}>{label}</button>
	{/each}
	<span class="cost">{sel.size ? `listing: ${sel.size} sounds` : ''}{verdict?.ok ? ` · as a name: 2 letters (${verdict.name})` : ''}</span>
</div>
<ShivaGrid lit={sel} pickable={(i) => !SHIVA_FLAT[i].isIt} onpick={toggle} />
<p class="muted note">In data-compression terms this is range encoding over a fixed ordering. It only works because the ordering puts useful classes next to each other, and because the markers sit at the right places.</p>

<style>
	.ctl {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		margin-bottom: 14px;
	}
	.ctl .deva {
		font-size: 16px;
	}
	.cost {
		font-size: 13.5px;
		color: var(--ink-2);
	}
	.note {
		margin-top: 14px;
		font-size: 14px;
		max-width: 48em;
	}
</style>
