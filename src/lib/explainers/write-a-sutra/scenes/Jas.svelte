<script lang="ts">
	import Builder from '../Builder.svelte';
	import { CHALLENGES } from '#lib/dsl.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	const ch = CHALLENGES[1];
</script>

<p class="goal"><b>Goal:</b> {ch.goal} <span class="muted">Hint: which pratyāhāra covers stops and sibilants? Which names the voiced unaspirated stops?</span></p>
<Builder challenge={ch} onsolved={() => { react('Solved. Nearness by place picks the right stop: क् → ग्, ट् → ड्, च् → ज्, प् → ब्.', 'happy'); complete(); }} />

<style>
	.goal {
		font-size: 16px;
	}
</style>
