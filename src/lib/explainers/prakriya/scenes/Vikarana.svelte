<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import State from '../State.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	let stage = $state(0);
	function next() {
		stage++;
		if (stage === 1) react('शप् slots in between root and ending.', 'happy');
		if (stage === 2) {
			react('श् (1.3.8) and प् (1.3.3) are tags and drop out (1.3.9). Just अ is left.', 'happy');
			complete();
		}
	}
	const pieces = $derived(stage === 0 ? ['भू', 'ति'] : stage === 1 ? ['भू', 'शप्', 'ति'] : ['भू', 'अ', 'ति']);
</script>

<State {pieces} fresh={stage ? 1 : -1} />
<button class="btn primary" onclick={next} disabled={stage === 2}>{stage === 0 ? 'Apply 3.1.68 कर्तरि शप्' : stage === 1 ? 'Delete the tags' : 'Done'}</button>
<p class="note">
	<SutraRef n="3.1.68" s="कर्तरि शप्" />: in the active, a root takes शप् before a sārvadhātuka ending. Other classes
	get other connectors, or none: तुद् + श → तुदति, दिव् + श्यन् → दीव्यति.
</p>

<style>
	.note {
		margin-top: 16px;
		font-size: 15px;
		max-width: 46em;
	}
</style>
