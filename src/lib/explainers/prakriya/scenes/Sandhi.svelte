<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import State from '../State.svelte';
	import Choice from '../Choice.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	let done = $state(false);
	const OPTS = [{ label: 'भोअति' }, { label: 'भवति' }, { label: 'भावति' }, { label: 'भोति' }];
	function pick(i: number, ok: boolean) {
		if (!ok) return react(i === 2 ? 'आव् is for औ. ओ becomes अव्.' : 'Two vowels cannot simply sit side by side here. 6.1.78 applies.', 'think');
		done = true;
		react('भव् + अ + ति = भवति. Done! A root, a tense, an ending, a connector, guṇa and sandhi.', 'happy');
		complete();
	}
</script>

<State pieces={done ? ['भव्', 'अ', 'ति'] : ['भो', 'अ', 'ति']} fresh={done ? 0 : -1} />
<Choice options={OPTS} answer={1} onpick={pick} />
<p class="muted note"><SutraRef n="6.1.78" s="एचोऽयवायावः" />: ए ओ ऐ औ → अय् अव् आय् आव् before a vowel. You met it in the Anuvṛtti lesson, inheriting अचि from 6.1.77.</p>
{#if done}<p class="final deva">भवति</p>{/if}

<style>
	.note {
		margin-top: 14px;
		font-size: 14px;
	}
	.final {
		font-size: 64px;
		font-weight: 700;
		color: var(--r-subject);
		margin: 10px 0 0;
		animation: pop 0.5s;
	}
	@keyframes pop {
		from { transform: scale(0.7); opacity: 0; }
	}
</style>
