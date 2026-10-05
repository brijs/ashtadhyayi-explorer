<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import { ITEMS, IT_SUTRAS } from '../items.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	let sel = $state(0);
	let seen = new Set<number>([0]);
	const item = $derived(ITEMS[sel]);

	function pick(i: number) {
		sel = i;
		seen.add(i);
		if (ITEMS[i].name === 'ष्वुन्') react('ष्वुन्: ष् is a tag by 1.3.6 षः प्रत्ययस्य. A ṣ-tagged affix takes ङीष् in the feminine (4.1.41): the Kāśikā gives नर्तकः "dancer", feminine नर्तकी.', 'surprised');
		else if (ITEMS[i].name === 'जस्') react('जस्: ज् is a tag by 1.3.7, but the final स् is kept, because 1.3.4 spares t-class, s and m at the end of case endings. That s becomes the ḥ in रामाः.', 'surprised');
		else react(`${ITEMS[i].name}: ${ITEMS[i].segs.filter((s) => s.it).map((s) => `${s.t} by ${s.it}`).join(', ')}.`, 'happy');
		if (seen.size >= 4) complete();
	}
</script>

<div class="list" role="group" aria-label="Items">
	{#each ITEMS as it, i (it.name)}
		<button class="btn deva" aria-pressed={sel === i} onclick={() => pick(i)}>{it.name}</button>
	{/each}
</div>

<div class="card show">
	<span class="kind">{item.kind}</span>
	<div class="segs">
		{#each item.segs as s, i (i)}
			<div class="seg" class:it={s.it} class:spared={s.kept}>
				<span class="t deva">{s.t}</span>
				{#if s.it}
					<span class="why"><SutraRef n={s.it} s={IT_SUTRAS[s.it]} /></span>
					<small>{s.note}</small>
				{:else if s.kept}
					<span class="why"><SutraRef n={s.kept} s={IT_SUTRAS[s.kept]} /></span>
					<small>{s.note}</small>
				{:else}
					<small>sound</small>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.list {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-bottom: 16px;
	}
	.list .btn {
		font-size: 18px;
	}
	.show {
		padding: 18px;
	}
	.kind {
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--muted);
		font-weight: 600;
	}
	.segs {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin-top: 10px;
	}
	.seg {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		min-width: 110px;
		max-width: 220px;
		padding: 10px;
		border-radius: 12px;
		border: 2px solid var(--r-subject);
		background: color-mix(in srgb, var(--r-subject) 8%, var(--surface));
		text-align: center;
	}
	.seg.it {
		border: 2px dashed var(--r-target);
		background: color-mix(in srgb, var(--r-target) 6%, var(--surface));
	}
	.seg.spared {
		border-color: var(--saffron);
		background: var(--saffron-soft);
	}
	.t {
		font-size: 34px;
		line-height: 1.3;
	}
	.why {
		font-size: 13px;
	}
	small {
		font-size: 12px;
		color: var(--ink-2);
	}
</style>
