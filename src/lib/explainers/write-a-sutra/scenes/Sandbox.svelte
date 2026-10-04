<script lang="ts">
	import Builder from '../Builder.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';
	import type { DslRule } from '#lib/dsl.ts';

	let { react, complete }: SceneProps = $props();
	let n = -1;
	function onchange(r: DslRule) {
		n++;
		if (n === 2) {
			react(`Your grammar now rewrites ${r.target} as ${r.subst}. Pāṇini had to make thousands of such choices consistent with each other.`, 'happy');
			complete();
		}
	}
</script>

<Builder initial={{ target: 'अक्', subst: 'इक्', left: null, right: 'हल्' }} {onchange} />
