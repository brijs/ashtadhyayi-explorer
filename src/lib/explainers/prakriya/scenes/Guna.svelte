<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import State from '../State.svelte';
	import Choice from '../Choice.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	let done = $state(false);
	const OPTS = [{ label: 'ए', sub: 'throat + palate' }, { label: 'ओ', sub: 'throat + lips' }, { label: 'अ', sub: 'throat' }];
	function pick(i: number, ok: boolean) {
		if (!ok) return react(`${OPTS[i].label} is a guṇa vowel, but ऊ is made at the lips. Which guṇa uses the lips?`, 'think');
		done = true;
		react('ओ: nearest by place (1.1.50). 7.3.84 turns भू into भो.', 'happy');
		complete();
	}
</script>

<State pieces={done ? ['भो', 'अ', 'ति'] : ['भू', 'अ', 'ति']} fresh={done ? 0 : -1} />
<p class="q">guṇa of <span class="deva">ऊ</span> =</p>
<Choice options={OPTS} answer={1} onpick={pick} />
<p class="muted note"><SutraRef n="7.3.84" s="सार्वधातुकार्धधातुकयोः" /> requires guṇa; <SutraRef n="1.4.13" /> first names भू the aṅga (stem) so the rule can find it. See <a href="../nearest-substitute/">The nearest substitute</a>.</p>

<style>
	.q {
		font-size: 18px;
	}
	.note {
		margin-top: 14px;
		font-size: 14px;
	}
</style>
