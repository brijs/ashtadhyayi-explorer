<script lang="ts">
	import type { FlatStep } from '#lib/engine/steps.ts';

	// 2D stand-in for the 3D factory (no WebGL): the same eight stations, the glass wall and a moving token.
	let { steps, idx, stations }: { steps: FlatStep[]; idx: number; stations: { a: number; label: string; band: string }[] } = $props();
	const W = 900;
	const sx = (a: number) => 120 + (a - 1) * 100;
	const cur = $derived(steps[idx]);
	const tx = $derived(cur && cur.a ? sx(cur.a) : 40);
</script>

<svg class="factory-fallback" viewBox="0 0 {W} 210" role="img" aria-label="Assembly line with eight stations; the token is at station {cur?.a || 'inputs'}">
	<rect x="20" y="128" width={W - 40} height="16" rx="4" fill="var(--ink-2)" opacity="0.5" />
	<g>
		<rect x="10" y="70" width="60" height="58" rx="4" fill="var(--surface-3)" stroke="var(--line)" />
		<text x="40" y="62" text-anchor="middle" font-size="12" fill="var(--ink-2)">Inputs</text>
	</g>
	{#each stations as s (s.a)}
		<g class:on={cur?.a === s.a}>
			<rect x={sx(s.a) - 36} y={s.a >= 6 && s.a <= 7 ? 40 : 62} width="72" height={s.a >= 6 && s.a <= 7 ? 88 : 66} rx="6" fill="var(--b-{s.band})" class="st" />
			<text x={sx(s.a)} y={s.a >= 6 && s.a <= 7 ? 64 : 84} text-anchor="middle" font-size="18" font-weight="700" fill="#fff">{s.a}</text>
			<text x={sx(s.a)} y="168" text-anchor="middle" font-size="11" fill="var(--ink-2)">{s.label}</text>
		</g>
	{/each}
	<line x1={(sx(7) + sx(8)) / 2} x2={(sx(7) + sx(8)) / 2} y1="20" y2="150" stroke="var(--r-object)" stroke-width="3" stroke-dasharray="6 4" />
	<text x={(sx(7) + sx(8)) / 2} y="14" text-anchor="middle" font-size="11" fill="var(--ink-2)">8.2.1 one-way glass</text>
	<g class="token" style="transform: translateX({tx}px)">
		<rect x="-22" y="112" width="44" height="18" rx="9" fill="var(--saffron)" />
	</g>
	<text x={W / 2} y="198" text-anchor="middle" font-size="15" class="deva" fill="var(--ink)">{cur ? `${cur.sutra ? cur.code : cur.source} → ${cur.terms.map((t) => t.t).join(' + ')}` : ''}</text>
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: auto;
		padding: 8px;
	}
	.st {
		transition: filter 0.3s;
	}
	.on .st {
		filter: brightness(1.25) drop-shadow(0 0 6px var(--saffron));
	}
	.token {
		transition: transform 0.45s ease-in-out;
	}
</style>
