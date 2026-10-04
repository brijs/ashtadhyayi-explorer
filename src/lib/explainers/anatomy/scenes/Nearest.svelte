<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();

	// Places of articulation, back of the mouth to front (Pāṇinīya śikṣā tradition).
	const PLACES = [
		{ key: 'kantha', label: 'throat', sa: 'कण्ठ', x: 40, y: 150 },
		{ key: 'talu', label: 'palate', sa: 'तालु', x: 110, y: 52 },
		{ key: 'murdhan', label: 'roof', sa: 'मूर्धन्', x: 175, y: 34 },
		{ key: 'danta', label: 'teeth', sa: 'दन्त', x: 245, y: 58 },
		{ key: 'oshtha', label: 'lips', sa: 'ओष्ठ', x: 282, y: 104 }
	];
	const VOWELS = [
		{ v: 'इ', place: 'talu', yan: 'य' },
		{ v: 'उ', place: 'oshtha', yan: 'व' },
		{ v: 'ऋ', place: 'murdhan', yan: 'र' },
		{ v: 'ऌ', place: 'danta', yan: 'ल' }
	];
	const YAN = [
		{ v: 'ल', place: 'danta' },
		{ v: 'य', place: 'talu' },
		{ v: 'र', place: 'murdhan' },
		{ v: 'व', place: 'oshtha' }
	];
	const placeLabel = (k: string) => PLACES.find((p) => p.key === k)!;

	let sel = $state<number | null>(null);
	let matched = $state(new Set<string>());
	let wrongFlash = $state<string | null>(null);
	const focusPlace = $derived(sel !== null ? VOWELS[sel].place : null);

	function pickYan(y: (typeof YAN)[number]) {
		if (sel === null) return react('Tap a vowel on the left first.', 'think');
		const vw = VOWELS[sel];
		if (vw.yan !== y.v) {
			wrongFlash = y.v;
			setTimeout(() => (wrongFlash = null), 400);
			return react(`${y.v} is made at the ${placeLabel(y.place).label}, but ${vw.v} is made at the ${placeLabel(vw.place).label}. Look for a closer match.`, 'think');
		}
		matched = new Set([...matched, vw.v]);
		react(`${vw.v} and ${y.v}: both at the ${placeLabel(vw.place).label} (${placeLabel(vw.place).sa}).`, 'happy');
		sel = null;
		if (matched.size === 4) complete();
	}
</script>

<div class="layout">
	<svg viewBox="0 0 320 200" class="mouth" role="img" aria-label="Places of articulation from throat to lips">
		<path d="M30 180 C30 110 60 40 150 28 C230 18 290 50 300 110" fill="none" stroke="var(--line)" stroke-width="10" stroke-linecap="round" />
		<path d="M60 170 C110 140 200 130 290 130" fill="none" stroke="var(--surface-3)" stroke-width="16" stroke-linecap="round" />
		<text x="170" y="160" text-anchor="middle" class="tongue">tongue</text>
		{#each PLACES as p (p.key)}
			<g class:on={focusPlace === p.key}>
				<circle cx={p.x} cy={p.y} r={focusPlace === p.key ? 11 : 7} class="pt" />
				<text x={p.x} y={p.y + (p.y < 80 ? -16 : 28)} text-anchor="middle" class="pl">{p.label}</text>
			</g>
		{/each}
	</svg>

	<div class="match">
		<div class="col">
			<span class="eyebrow">इक् vowel</span>
			{#each VOWELS as vw, i (vw.v)}
				<button class="tile deva" class:sel={sel === i} class:done={matched.has(vw.v)} disabled={matched.has(vw.v)} onclick={() => (sel = i)}>{vw.v}</button>
			{/each}
		</div>
		<div class="col">
			<span class="eyebrow">यण् semivowel</span>
			{#each YAN as y (y.v)}
				{@const isDone = VOWELS.some((vw) => vw.yan === y.v && matched.has(vw.v))}
				<button class="tile deva" class:done={isDone} class:wrong={wrongFlash === y.v} disabled={isDone} onclick={() => pickYan(y)}>{y.v}</button>
			{/each}
		</div>
	</div>
</div>

<p class="muted note">
	<SutraRef n="1.1.50" s="स्थानेऽन्तरतमः" />: when a substitute could be one of several, the nearest one is chosen. Here "nearest"
	means the same place of articulation.
</p>

<style>
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
		gap: 24px;
		align-items: center;
	}
	.mouth {
		width: 100%;
		max-width: 420px;
	}
	.pt {
		fill: var(--surface);
		stroke: var(--muted);
		stroke-width: 2;
		transition: r 0.2s;
	}
	.on .pt {
		fill: var(--saffron);
		stroke: var(--saffron);
	}
	.pl {
		font-size: 13px;
		fill: var(--ink-2);
		font-family: var(--font-ui);
	}
	.on .pl {
		fill: var(--saffron-ink);
		font-weight: 700;
	}
	.tongue {
		font-size: 11px;
		fill: var(--muted);
		font-family: var(--font-ui);
	}
	.match {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}
	.col {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.tile {
		height: 54px;
		border-radius: 12px;
		border: 2px solid var(--line);
		background: var(--surface);
		font-size: 26px;
		cursor: pointer;
		color: var(--ink);
		transition: all 0.2s;
	}
	.tile.sel {
		border-color: var(--saffron);
		background: var(--saffron-soft);
	}
	.tile.done {
		border-color: var(--r-subject);
		background: color-mix(in srgb, var(--r-subject) 12%, var(--surface));
		color: var(--r-subject);
		cursor: default;
	}
	.tile.wrong {
		animation: shake 0.35s;
		border-color: var(--r-target);
	}
	@keyframes shake {
		25% { transform: translateX(-5px); }
		75% { transform: translateX(5px); }
	}
	.note {
		margin-top: 18px;
		font-size: 14px;
		max-width: 46em;
	}
	@media (max-width: 700px) {
		.layout {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
