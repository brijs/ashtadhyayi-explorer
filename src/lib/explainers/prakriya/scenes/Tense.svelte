<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import State from '../State.svelte';
	import Choice from '../Choice.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	let done = $state(false);
	const OPTS = [
		{ label: 'लङ्', sub: 'imperfect (was)' },
		{ label: 'लट्', sub: 'present (is)' },
		{ label: 'लृट्', sub: 'future (will be)' },
		{ label: 'लोट्', sub: 'imperative (be!)' }
	];
	function pick(i: number, ok: boolean) {
		if (!ok) return react(`${OPTS[i].label} is the ${OPTS[i].sub.split(' ')[0]}. We want "is, now".`, 'think');
		done = true;
		react('लट् (3.2.123 वर्तमाने लट्). Its tags ट् and अ are deleted (1.3.3, 1.3.2, 1.3.9), leaving just ल्.', 'happy');
		complete();
	}
</script>

<State pieces={done ? ['भू', 'ल्'] : ['भू']} fresh={done ? 1 : -1} />
<Choice options={OPTS} answer={1} onpick={pick} />
<p class="muted note">All ten lakāras start with ल; that shared ल् is what the next rule replaces. <SutraRef n="3.2.123" s="वर्तमाने लट्" /></p>

<style>
	.note {
		margin-top: 16px;
		font-size: 14px;
	}
</style>
