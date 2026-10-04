<script lang="ts">
	import { onMount } from 'svelte';
	import ShivaGrid from '#lib/components/ShivaGrid.svelte';
	import { SHIVA_SUTRAS } from '#lib/varna.ts';
	import { devaToIast } from '#lib/translit.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	let visible = $state(0);

	onMount(() => {
		const t = setInterval(() => {
			visible++;
			if (visible >= 14) clearInterval(t);
		}, 90);
		return () => clearInterval(t);
	});

	const lineText = (li: number) =>
		SHIVA_SUTRAS[li].map((v, i, a) => (i === a.length - 1 || v.length === 1 ? v : v[0])).join('');

	function look(li: number) {
		const t = lineText(li);
		react(`Line ${li + 1}: ${t} (${devaToIast(t)}). The last sound is the odd one out. We'll see why soon.`, 'happy');
		complete();
	}
</script>

<ShivaGrid visibleLines={visible} onlineclick={look} />
<p class="note muted">The fourteen lines are recited as one verse: अइउण् । ऋऌक् । एओङ् । ऐऔच् । … । हल् ॥</p>

<style>
	.note {
		margin-top: 18px;
		font-size: 14px;
	}
</style>
