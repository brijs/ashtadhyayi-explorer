<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete, panel }: SceneProps = $props();
	const PASSES = [
		{ label: 'Main grammar', range: '1.1.1 – 8.1.74', note: 'rules interact freely, settled by the conflict principles' },
		{ label: '8.2 pass', range: '8.2.1 – 8.2.108', note: 'e.g. 8.2.7 न-deletion, 8.2.66 स् → रु' },
		{ label: '8.3 pass', range: '8.3.1 – 8.3.119', note: 'e.g. 8.3.15 र् → visarga' },
		{ label: '8.4 pass', range: '8.4.1 – 8.4.68', note: 'e.g. 8.4.2 न् → ण् in रामेण' }
	];
	let k = $state(-1);
	function step() {
		if (k < PASSES.length - 1) k++;
		panel(PASSES[Math.max(0, k)].label);
		if (k === PASSES.length - 1) {
			react('Each later stage sees the output of earlier stages, never the reverse. Strictly, 8.2.1 makes every tripādī rule a stage of its own.', 'happy');
			complete();
		}
	}
</script>

<div class="pipe">
	{#each PASSES as p, i (i)}
		<div class="pass" class:done={i < k} class:on={i === k}>
			<b>{p.label}</b>
			<span class="r">{p.range}</span>
			<small>{p.note}</small>
		</div>
		{#if i < PASSES.length - 1}<span class="arr" class:lit={i < k}>→</span>{/if}
	{/each}
</div>
<button class="btn primary" onclick={step} disabled={k === PASSES.length - 1}>Run next pass ▶</button>

<div class="limits card">
	<h2>Where the analogy fits</h2>
	<ul>
		<li>Like compiler passes, the order of the tripādī is fixed, and earlier stages cannot see later output.</li>
		<li>Unlike most compilers, the main grammar has no fixed order: its rules compete, and conflicts are settled case by case.</li>
		<li>Smaller asiddha zones exist inside the main grammar too: <SutraRef n="6.4.22" s="असिद्धवदत्राभात्" /> and <SutraRef n="6.1.86" s="षत्वतुकोरसिद्धः" />.</li>
	</ul>
</div>

<style>
	.pipe {
		display: flex;
		align-items: stretch;
		gap: 6px;
		flex-wrap: wrap;
		margin-bottom: 14px;
	}
	.pass {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
		min-width: 150px;
		padding: 12px;
		border-radius: 12px;
		border: 2px solid var(--line);
		background: var(--surface);
		transition: all 0.3s;
	}
	.pass.on {
		border-color: var(--indigo);
		background: var(--indigo-soft);
		transform: translateY(-3px);
	}
	.pass.done {
		border-color: var(--r-subject);
	}
	.r {
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--saffron-ink);
	}
	.pass small {
		font-size: 12.5px;
		color: var(--ink-2);
	}
	.arr {
		align-self: center;
		color: var(--line);
		font-size: 20px;
	}
	.arr.lit {
		color: var(--r-subject);
	}
	.limits {
		margin-top: 18px;
		padding: 14px 20px;
		max-width: 720px;
	}
	.limits h2 {
		font-size: 18px;
	}
	.limits ul {
		padding-left: 18px;
		font-size: 14.5px;
	}
</style>
