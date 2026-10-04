<script lang="ts">
	import { fly } from 'svelte/transition';
	import ShivaGrid from '#lib/components/ShivaGrid.svelte';
	import SutraRef from '#lib/components/SutraRef.svelte';
	import { SHIVA_FLAT } from '#lib/varna.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	let removed = $state(new Set<number>());
	const markerSlots = SHIVA_FLAT.flatMap((s, i) => (s.isIt ? [i] : []));
	const letters = SHIVA_FLAT.filter((s) => !s.isIt).length;

	function lift(i: number) {
		if (!SHIVA_FLAT[i].isIt) {
			react('That one is a real sound. Markers are the last item of each line.', 'think');
			return;
		}
		removed = new Set([...removed, i]);
		if (removed.size === 14) {
			react(`All 14 markers lifted. What remains: ${letters} slots, 42 distinct sounds (ह is listed twice).`, 'happy');
			complete();
		} else if (removed.size === 1) react('One marker gone. It never gets pronounced in a real word.', 'happy');
	}
	function liftAll() {
		for (const i of markerSlots) if (!removed.has(i)) lift(i);
	}
</script>

<div class="tray" aria-live="polite">
	<span class="eyebrow">Marker tray · {removed.size}/14</span>
	<div class="chips">
		{#each [...removed] as i (i)}
			<span class="chip deva" in:fly={{ y: 30, duration: 300 }}>{SHIVA_FLAT[i].varna}</span>
		{/each}
	</div>
	{#if removed.size < 14}<button class="btn" onclick={liftAll}>Lift all</button>{/if}
</div>
<ShivaGrid {removed} pickable={() => true} onpick={lift} />
<p class="muted note">
	Two sūtras do this work: <SutraRef n="1.3.3" s="हलन्त्यम्" /> (a final consonant in an original listing is
	an <i>it</i>) and <SutraRef n="1.3.9" s="तस्य लोपः" /> (an <i>it</i> is deleted).
</p>

<style>
	.tray {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 10px;
		min-height: 52px;
		padding: 8px 12px;
		margin-bottom: 14px;
		border: 1.5px dashed var(--line);
		border-radius: 12px;
		background: var(--surface-2);
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		flex: 1;
	}
	.chip {
		padding: 0 8px;
		border-radius: 6px;
		background: var(--surface);
		border: 1px dashed var(--muted);
		color: var(--muted);
		font-size: 17px;
	}
	.note {
		margin-top: 16px;
		font-size: 14px;
	}
</style>
