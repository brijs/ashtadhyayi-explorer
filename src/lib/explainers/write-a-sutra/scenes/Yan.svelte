<script lang="ts">
	import Builder from '../Builder.svelte';
	import { CHALLENGES } from '#lib/dsl.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	const ch = CHALLENGES[0];
</script>

<p class="goal"><b>Goal:</b> {ch.goal}</p>
<Builder challenge={ch} onsolved={() => { react('All tests pass. You just wrote इको यणचि!', 'happy'); complete(); }} />

<style>
	.goal {
		font-size: 16px;
	}
</style>
