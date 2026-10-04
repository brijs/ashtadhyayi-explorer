<script lang="ts">
	import ShivaGrid from '#lib/components/ShivaGrid.svelte';
	import { SHIVA_FLAT, rangeSlots, splitPratyaharaName } from '#lib/varna.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete, data }: SceneProps<{ names: string[] }> = $props();
	const H = SHIVA_FLAT.map((s, i) => ({ s, i })).filter(({ s }) => !s.isIt && s.varna === 'ह्').map(({ i }) => i);
	// ranges of the pratyāhāras Pāṇini uses; अण्/इण् may run to either ण् — take every reading
	const ranges = $derived(
		data.names.flatMap((nm) => {
			const sp = splitPratyaharaName(nm);
			if (!sp) return [];
			const s = SHIVA_FLAT.findIndex((x) => !x.isIt && x.varna === sp[0]);
			const ends = SHIVA_FLAT.map((x, i) => (i > s && x.isIt && x.varna === sp[1] ? i : -1)).filter((i) => i >= 0);
			const pick = nm === 'अण्' || nm === 'इण्' ? ends.slice(0, 1) : ends.slice(0, 1);
			return pick.map((e) => ({ nm, slots: new Set(rangeSlots(s, e)) }));
		})
	);
	let sel = $state<number | null>(null);
	let seen = new Set<number>();
	const using = $derived(sel === null ? [] : ranges.filter((r) => r.slots.has(sel!)).map((r) => r.nm));
	function pick(i: number) {
		if (!H.includes(i)) return react('Tap one of the two ह tiles (lines 5 and 14).', 'think');
		sel = i;
		seen.add(i);
		const line = SHIVA_FLAT[i].line + 1;
		react(`The ह in line ${line} is used by: ${ranges.filter((r) => r.slots.has(i)).map((r) => r.nm).join(', ')}.`, 'happy');
		if (seen.size === 2) complete();
	}
</script>

<ShivaGrid marked={new Set(H)} lit={sel !== null ? new Set([sel]) : new Set()} pickable={(i) => H.includes(i)} onpick={pick} />
{#if sel !== null}
	<p class="using">Classes that need <b>this</b> ह: <span class="deva">{using.join('  ')}</span></p>
{/if}
<div class="card note">
	<p>
		Each class must be one unbroken run. ह belongs with the voiced sounds in some classes (like हश्) and with the
		sibilants in others (like शल्), and no single position satisfies both. One sound has to be listed twice.
	</p>
	<p>
		Wiebke Petersen (<i>Journal of Logic, Language and Information</i>, 2004) proved that Pāṇini's arrangement is
		optimal for this method, that a repetition is unavoidable, and that repeating ह is an optimal choice.
	</p>
</div>

<style>
	.using {
		font-size: 15px;
		margin-top: 12px;
	}
	.using .deva {
		font-size: 18px;
		color: var(--saffron-ink);
	}
	.note {
		margin-top: 16px;
		padding: 12px 18px;
		max-width: 720px;
		font-size: 14.5px;
	}
	.note p {
		margin: 6px 0;
	}
</style>
