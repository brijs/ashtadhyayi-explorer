<script lang="ts">
	import Builder from '../Builder.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';
	import type { DslRule } from '#lib/dsl.ts';

	let { react, complete, panel }: SceneProps = $props();
	let changes = -1;
	function onchange(r: DslRule) {
		changes++;
		panel(r.target + '→' + r.subst);
		if (changes === 1) react('See how the case endings change with each slot: 6th for the target, 7th for "before".', 'happy');
		if (changes >= 2) complete();
	}
</script>

<Builder {onchange} />
