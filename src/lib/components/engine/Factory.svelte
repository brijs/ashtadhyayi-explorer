<script lang="ts">
	import { onMount } from 'svelte';
	import { ADHYAYAS, BANDS } from '#lib/structure.ts';
	import type { FlatStep } from '#lib/engine/steps.ts';
	import type { Factory } from '#lib/engine/factory-scene.ts';
	import FactoryFallback from './FactoryFallback.svelte';

	// The 3D word factory (three.js, loaded on demand) with a 2D fallback when WebGL is unavailable.
	let { steps, idx, playing, input }: { steps: FlatStep[]; idx: number; playing: boolean; input: string } = $props();

	let canvas: HTMLCanvasElement | undefined = $state();
	let overlay: HTMLDivElement | undefined = $state();
	let root: HTMLDivElement | undefined = $state();
	let mode = $state<'loading' | '3d' | '2d'>('loading');
	let scene: Factory | null = null;

	const STATION_LABELS = ['Control room', 'Compounds & case', 'Root affixes', 'Stem affixes I', 'Stem affixes II', 'Machining I', 'Machining II', 'Tripādī'];
	const stations = ADHYAYAS.map((a) => ({ a: a.a, label: STATION_LABELS[a.a - 1], band: a.a === 8 ? 'tri' : a.band }));

	const formOf = (st: FlatStep) => st.terms.map((t) => t.t).join(' + ');
	const cur = $derived(steps[idx]);

	function webgl() {
		try {
			const c = document.createElement('canvas');
			return !!(c.getContext('webgl2') || c.getContext('webgl'));
		} catch {
			return false;
		}
	}

	onMount(() => {
		let disposed = false;
		let io: IntersectionObserver | undefined;
		const mo = new MutationObserver(() => scene?.retheme());
		const mq = matchMedia('(prefers-color-scheme: dark)');
		const onScheme = () => scene?.retheme();
		if (!webgl()) {
			mode = '2d';
			return;
		}
		(async () => {
			try {
				const { createFactory } = await import('#lib/engine/factory-scene.ts');
				if (disposed || !canvas || !overlay) return;
				scene = createFactory({ canvas, overlay, reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, stations, inputLabel: input });
				mode = '3d';
				scene.setStep(steps[idx] ? { a: steps[idx].a, code: steps[idx].code, form: formOf(steps[idx]), source: steps[idx].source, band: steps[idx].band } : null, true);
				scene.setPlaying(playing);
				io = new IntersectionObserver(([e]) => scene?.setVisible(e.isIntersecting), { rootMargin: '80px' });
				if (root) io.observe(root);
				mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
				mq.addEventListener('change', onScheme);
			} catch (e) {
				console.warn('3D factory unavailable, using 2D', e);
				mode = '2d';
			}
		})();
		return () => {
			disposed = true;
			io?.disconnect();
			mo.disconnect();
			mq.removeEventListener('change', onScheme);
			scene?.dispose();
			scene = null;
		};
	});

	$effect(() => {
		const st = cur;
		if (mode !== '3d' || !scene) return;
		scene.setStep(st ? { a: st.a, code: st.code, form: formOf(st), source: st.source, band: st.band } : null);
	});
	$effect(() => {
		const p = playing;
		if (mode === '3d') scene?.setPlaying(p);
	});
	$effect(() => {
		const i = input;
		if (mode === '3d') scene?.setInput(i);
	});
</script>

<div class="factory" bind:this={root} data-mode={mode}>
	{#if mode === '2d'}
		<FactoryFallback {steps} {idx} {stations} />
	{:else}
		<canvas bind:this={canvas} aria-label="3D assembly line: eight stations, one per adhyāya. The word token moves to the station whose rule fires at the current step."></canvas>
		<div class="overlay" bind:this={overlay} aria-hidden="true"></div>
		{#if mode === 'loading'}<p class="loading muted">Building the factory…</p>{/if}
	{/if}
	<p class="legend">
		{#each ['defs', 'case', 'verbal', 'nominal', 'stem', 'tri'] as const as b (b)}
			<span><i style="background: var(--b-{b})"></i>{BANDS[b].short}</span>
		{/each}
	</p>
</div>

<style>
	.factory {
		position: relative;
		border-radius: var(--radius);
		background: radial-gradient(120% 90% at 50% 0%, var(--surface) 0%, var(--surface-2) 100%);
		border: 1px solid var(--line);
		overflow: hidden;
	}
	canvas {
		display: block;
		width: 100%;
		height: clamp(260px, 42vw, 440px);
	}
	.overlay {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
	}
	.loading {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		margin: 0;
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 12px;
		margin: 0;
		padding: 8px 12px;
		border-top: 1px solid var(--line);
		font-size: 12px;
		color: var(--ink-2);
		background: var(--surface);
	}
	.legend i {
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 3px;
		margin-right: 5px;
		vertical-align: -1px;
	}
	/* overlay labels are created by factory-scene.ts */
	.overlay :global(> div) {
		position: absolute;
		left: 0;
		top: 0;
		white-space: nowrap;
		will-change: transform;
	}
	.overlay :global(.f-station) {
		display: flex;
		flex-direction: column;
		align-items: center;
		translate: -50% 0;
		font-size: 11px;
		line-height: 1.2;
		color: var(--ink-2);
	}
	.overlay :global(.f-station b) {
		display: grid;
		place-items: center;
		width: 20px;
		height: 20px;
		border-radius: 999px;
		background: var(--surface);
		border: 1px solid var(--line);
		font-size: 11.5px;
		color: var(--ink);
	}
	.overlay :global(.f-station.on b) {
		background: var(--saffron);
		border-color: var(--saffron);
		color: #fff;
	}
	.overlay :global(.f-station span) {
		margin-top: 2px;
		padding: 0 4px;
		border-radius: 4px;
		background: color-mix(in srgb, var(--surface) 80%, transparent);
	}
	.overlay :global(.f-glass),
	.overlay :global(.f-wh),
	.overlay :global(.f-slip) {
		translate: -50% -100%;
		font-size: 11px;
		color: var(--ink-2);
		background: color-mix(in srgb, var(--surface) 85%, transparent);
		padding: 1px 6px;
		border-radius: 5px;
		border: 1px solid var(--line);
	}
	.overlay :global(.f-wh) {
		display: flex;
		flex-direction: column;
		align-items: center;
		line-height: 1.25;
	}
	.overlay :global(.f-slip) {
		max-width: 180px;
		white-space: normal;
		text-align: center;
		translate: -50% 0;
		background: #fff6e0;
		color: #5a4a2a;
		border-color: #e6d4ac;
	}
	.overlay :global(.f-token) {
		display: flex;
		flex-direction: column;
		align-items: center;
		translate: -50% -100%;
		padding: 3px 9px 2px;
		border-radius: 8px;
		background: var(--surface);
		border: 2px solid var(--c, var(--saffron));
		box-shadow: var(--shadow);
		line-height: 1.2;
	}
	.overlay :global(.f-code) {
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--c, var(--saffron-ink));
		font-weight: 600;
	}
	.overlay :global(.f-form) {
		font-size: 17px;
		color: var(--ink);
	}
	@media (max-width: 600px) {
		.overlay :global(.f-station span),
		.overlay :global(.f-slip) {
			display: none;
		}
		.overlay :global(.f-form) {
			font-size: 14px;
		}
	}
</style>
