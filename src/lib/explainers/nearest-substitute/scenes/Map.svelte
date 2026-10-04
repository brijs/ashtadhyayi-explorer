<script lang="ts">
	import { PLACES, DOUBLE, placeName } from '../places.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	const POS: Record<string, [number, number]> = { kantha: [40, 150], talu: [110, 52], murdha: [175, 34], danta: [245, 58], oshtha: [282, 104], nasika: [205, 6] };
	let sel = $state<string | null>(null);
	let seen = new Set<string>();
	function pick(k: string) {
		sel = k;
		seen.add(k);
		const p = placeName(k);
		react(`${p.en} (${p.sa}): ${p.sounds.join(' ')}`, 'happy');
		if (seen.size >= 3) complete();
	}
	const lit = $derived(sel ? new Set(PLACES.find((p) => p.key === sel)!.sounds) : new Set<string>());
	const doubles = $derived(sel ? Object.entries(DOUBLE).filter(([, ps]) => ps.includes(sel!)).map(([s]) => s) : []);
</script>

<div class="layout">
	<svg viewBox="0 -10 320 200" role="img" aria-label="Places of articulation">
		<path d="M30 180 C30 110 60 40 150 28 C230 18 290 50 300 110" fill="none" stroke="var(--line)" stroke-width="10" stroke-linecap="round" />
		<path d="M60 170 C110 140 200 130 290 130" fill="none" stroke="var(--surface-3)" stroke-width="16" stroke-linecap="round" />
		{#each PLACES as p (p.key)}
			{@const [x, y] = POS[p.key]}
			<g class="pt" class:on={sel === p.key} role="button" tabindex="0" aria-label={p.en} onclick={() => pick(p.key)} onkeydown={(e) => e.key === 'Enter' && pick(p.key)}>
				<circle cx={x} cy={y} r={sel === p.key ? 13 : 9} />
				<text x={x} y={y + (y < 80 ? -16 : 30)} text-anchor="middle">{p.en}</text>
			</g>
		{/each}
	</svg>
	<div class="sounds">
		{#each PLACES.filter((p) => p.key !== 'nasika') as p (p.key)}
			<div class="row" class:on={sel === p.key}>
				<button class="pl" onclick={() => pick(p.key)}><span class="deva">{p.sa}</span> <small>{p.en}</small></button>
				<span class="ss deva">{#each p.sounds as s (s)}<span class:lit={lit.has(s)}>{s}</span>{/each}</span>
			</div>
		{/each}
		{#if doubles.length}<p class="dbl">Also partly here: <span class="deva">{doubles.join(' ')}</span> (two-place sounds)</p>{/if}
	</div>
</div>
<p class="muted note">Two-place sounds: ए ऐ (throat + palate), ओ औ (throat + lips), व (teeth + lips). Nasals also use the nose.</p>

<style>
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
		gap: 20px;
		align-items: center;
	}
	svg {
		width: 100%;
		max-width: 400px;
	}
	.pt {
		cursor: pointer;
	}
	.pt circle {
		fill: var(--surface);
		stroke: var(--muted);
		stroke-width: 2;
	}
	.pt.on circle {
		fill: var(--saffron);
		stroke: var(--saffron);
	}
	.pt text {
		font-size: 13px;
		fill: var(--ink-2);
		font-family: var(--font-ui);
	}
	.pt.on text {
		fill: var(--saffron-ink);
		font-weight: 700;
	}
	.sounds {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.row {
		display: flex;
		align-items: baseline;
		gap: 10px;
		padding: 4px 8px;
		border-radius: 8px;
	}
	.row.on {
		background: var(--saffron-soft);
	}
	.pl {
		min-width: 110px;
		text-align: left;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--ink);
		padding: 0;
	}
	.pl .deva {
		font-size: 17px;
	}
	.pl small {
		color: var(--muted);
	}
	.ss {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		font-size: 20px;
	}
	.ss .lit {
		color: var(--saffron-ink);
		font-weight: 700;
	}
	.dbl {
		font-size: 13.5px;
		color: var(--ink-2);
		margin: 4px 0 0;
	}
	.note {
		margin-top: 14px;
		font-size: 14px;
	}
	@media (max-width: 760px) {
		.layout {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
