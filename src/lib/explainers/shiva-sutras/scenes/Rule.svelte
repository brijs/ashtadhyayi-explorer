<script lang="ts">
	import ShivaGrid from '#lib/components/ShivaGrid.svelte';
	import SutraRef from '#lib/components/SutraRef.svelte';
	import { SHIVA_FLAT, rangeSlots } from '#lib/varna.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();

	const A = 0;
	const CH = SHIVA_FLAT.findIndex((s) => s.isIt && s.varna === 'च्');
	let step = $state<'start' | 'marker' | 'sweep' | 'done'>('start');
	let lit = $state(new Set<number>());
	let marked = $state(new Set<number>());

	function pick(i: number) {
		if (step === 'start') {
			if (i !== A) return react('Start with अ, the very first sound.', 'think');
			marked = new Set([A]);
			step = 'marker';
			react('Good. Now find the marker च् at the end of line 4.', 'happy');
		} else if (step === 'marker') {
			if (i !== CH) return react(SHIVA_FLAT[i].isIt ? 'That is a marker, but not च्. Look at line 4.' : 'We need a marker this time: च् ends line 4.', 'think');
			marked = new Set([A, CH]);
			step = 'sweep';
			const slots = rangeSlots(A, CH);
			slots.forEach((s, k) =>
				setTimeout(() => {
					lit = new Set([...lit, s]);
					if (k === slots.length - 1) {
						step = 'done';
						react('अच् = all nine vowels, from अ up to the marker च्. (Each also stands for its long forms: more on that later.)', 'happy');
						complete();
					}
				}, 160 * (k + 1))
			);
		}
	}
</script>

<div class="formula card">
	<span class="part" class:on={marked.has(A)}><span class="deva">अ</span><small>first sound</small></span>
	<span class="plus">+</span>
	<span class="part" class:on={marked.has(CH)}><span class="deva">च्</span><small>marker</small></span>
	<span class="plus">=</span>
	<span class="part result" class:on={step === 'done'}><span class="deva">अच्</span><small>{step === 'done' ? '9 sounds' : '?'}</small></span>
</div>
<ShivaGrid {lit} {marked} pickable={() => step === 'start' || step === 'marker'} onpick={pick} />
<p class="muted note">The rule: <SutraRef n="1.1.71" s="आदिरन्त्येन सहेता" />, "the first, together with the final marker, names (the whole stretch)".</p>

<style>
	.formula {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		padding: 12px 18px;
		margin-bottom: 16px;
	}
	.part {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 64px;
		padding: 4px 10px;
		border-radius: 10px;
		border: 1.5px dashed var(--line);
		transition: all 0.25s;
	}
	.part .deva {
		font-size: 26px;
		line-height: 1.3;
	}
	.part small {
		font-size: 11.5px;
		color: var(--muted);
	}
	.part.on {
		border-style: solid;
		border-color: var(--indigo);
		background: var(--indigo-soft);
	}
	.result.on {
		border-color: var(--saffron);
		background: var(--saffron-soft);
	}
	.plus {
		font-size: 22px;
		color: var(--muted);
	}
	.note {
		margin-top: 16px;
		font-size: 14px;
	}
</style>
