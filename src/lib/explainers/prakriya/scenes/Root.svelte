<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import State from '../State.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	let open = $state(false);
	function tap() {
		open = true;
		react('भू is root no. 1 of the first class (bhvādi), meaning "existence". 1.3.1 calls it a dhātu, which unlocks all the verb rules.', 'happy');
		complete();
	}
</script>

<State pieces={['भू']} />
<button class="entry card" onclick={tap} aria-expanded={open}>
	<span class="deva big">भू</span>
	{#if open}
		<span class="meta"><span class="code">01.0001</span> <span class="deva">भू सत्तायाम्</span> · "in the sense of existence" · class 1 (<span class="deva">भ्वादि</span>)</span>
		<span class="rule"><SutraRef n="1.3.1" s="भूवादयो धातवः" />: भू and the rest (of the list) are called dhātu.</span>
	{:else}
		<span class="muted">tap for its Dhātupāṭha entry</span>
	{/if}
</button>

<style>
	.entry {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 18px 22px;
		max-width: 560px;
		text-align: left;
		cursor: pointer;
		color: var(--ink);
	}
	.big {
		font-size: 44px;
		line-height: 1.3;
	}
	.code {
		font-family: var(--font-mono);
		color: var(--saffron-ink);
	}
	.meta,
	.rule {
		font-size: 15px;
	}
	.rule {
		color: var(--ink-2);
	}
</style>
