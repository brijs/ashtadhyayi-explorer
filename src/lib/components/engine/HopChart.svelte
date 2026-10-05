<script lang="ts">
	import { ADHYAYAS } from '#lib/structure.ts';
	import { bandColor, bandLabel, SOURCE_LABEL, type FlatStep } from '#lib/engine/steps.ts';

	// Chapter-hop chart: x = step, y = adhyāya. Shows how a derivation hands off between chapters.
	let { steps, idx, onselect }: { steps: FlatStep[]; idx: number; onselect: (i: number) => void } = $props();

	let w = $state(720);
	const H = 236;
	const narrow = $derived(w < 520);
	const L = $derived(narrow ? 40 : 128);
	const R = 14;
	const T = 16;
	const ROW = 23;
	const rowY = (a: number) => T + a * ROW; // a = 0 (outside) … 8
	const x = $derived((i: number) => L + (steps.length < 2 ? 0 : (i * (Math.max(w, 320) - L - R)) / (steps.length - 1)));
	const pts = $derived(steps.map((s) => `${x(s.i).toFixed(1)},${rowY(s.a)}`).join(' '));
	let hover = $state<number | null>(null);
	const tip = $derived(hover === null ? null : steps[hover]);
	const fires = $derived([0, 1, 2, 3, 4, 5, 6, 7, 8].map((a) => steps.filter((s) => s.a === a).length));
</script>

<div class="hop" bind:clientWidth={w}>
	<svg width="100%" height={H} viewBox="0 0 {Math.max(w, 320)} {H}" role="group" aria-label="Chapter-hop chart: which adhyāya each step's rule comes from">
		{#each [0, 1, 2, 3, 4, 5, 6, 7, 8] as a (a)}
			<rect x={L - 6} y={rowY(a) - ROW / 2} width={Math.max(w, 320) - L - R + 12} height={ROW} fill={a ? `var(--b-${ADHYAYAS[a - 1].band})` : 'var(--muted)'} opacity={a % 2 ? 0.09 : 0.05} />
			<text x="6" y={rowY(a) + 4} font-size="11.5" fill="var(--ink-2)">
				{a ? (narrow ? `${a}` : `${a} · ${['Definitions', 'Compounds, case', 'Root affixes', 'Stem affixes', 'Stem affixes', 'Stem ops', 'Stem ops', 'Tripādī'][a - 1]}`) : narrow ? 'in' : 'Input lists'}
			</text>
			<text x={L - 12} y={rowY(a) + 4} font-size="10.5" fill="var(--muted)" text-anchor="end">{fires[a] || ''}</text>
		{/each}
		{#each steps.filter((s) => s.handoff) as s (s.i)}
			<line x1={x(s.i) - 6} x2={x(s.i) - 6} y1={T - 8} y2={H - 6} stroke="var(--saffron)" stroke-dasharray="4 3" />
			<text x={x(s.i) - 2} y={H - 4} font-size="10.5" fill="var(--saffron-ink)">handoff → new run</text>
		{/each}
		<polyline points={pts} fill="none" stroke="var(--ink-2)" stroke-width="1.2" opacity="0.45" stroke-linejoin="round" />
		{#if steps[idx]}
			<line x1={x(idx)} x2={x(idx)} y1={T - 8} y2={rowY(8) + 10} stroke="var(--saffron)" stroke-width="1.5" opacity="0.5" />
		{/if}
		{#each steps as s (s.i)}
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<circle
				cx={x(s.i)}
				cy={rowY(s.a)}
				r={s.i === idx ? 7 : 4.5}
				fill={bandColor(s.band)}
				stroke={s.i === idx ? 'var(--ink)' : 'var(--surface)'}
				stroke-width={s.i === idx ? 2 : 1}
				role="button"
				tabindex="0"
				aria-label="Step {s.i + 1}: {s.sutra ? 'sūtra ' + s.code : s.source}"
				onclick={() => onselect(s.i)}
				onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onselect(s.i))}
				onpointerenter={() => (hover = s.i)}
				onpointerleave={() => (hover = null)}
				onfocus={() => (hover = s.i)}
				onblur={() => (hover = null)}
			/>
		{/each}
	</svg>
	{#if tip}
		<div class="tip card" style="left: {Math.min(Math.max(x(tip.i) - 140, 4), Math.max(w, 320) - 284)}px; top: {rowY(tip.a) > H / 2 ? rowY(tip.a) - 112 : rowY(tip.a) + 14}px">
			<span class="tc" style="color: {bandColor(tip.band)}">{tip.sutra ? tip.code : (SOURCE_LABEL[tip.source] ?? tip.source) + ' ' + tip.code} · {bandLabel(tip.band)}</span>
			{#if tip.s}<span class="ts deva">{tip.s}</span>{/if}
			{#if tip.en}<span class="te">{tip.en}</span>{/if}
			<span class="tr deva">→ {tip.terms.map((t) => t.t).join(' + ')}</span>
		</div>
	{/if}
</div>

<style>
	.hop {
		position: relative;
		min-width: 0;
	}
	svg {
		display: block;
		overflow: visible;
	}
	circle {
		cursor: pointer;
		transition: r 0.15s;
	}
	circle:focus-visible {
		outline: none;
		stroke: var(--focus);
		stroke-width: 3;
	}
	.tip {
		position: absolute;
		width: 280px;
		padding: 8px 10px;
		display: flex;
		flex-direction: column;
		gap: 2px;
		pointer-events: none;
		z-index: 5;
		font-size: 12.5px;
		line-height: 1.4;
	}
	.tc {
		font-family: var(--font-mono);
		font-size: 11.5px;
		font-weight: 600;
	}
	.ts {
		font-size: 15px;
	}
	.te {
		color: var(--ink-2);
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.tr {
		font-size: 14px;
	}
</style>
