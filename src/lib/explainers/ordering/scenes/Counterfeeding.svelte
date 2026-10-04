<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import { resolve } from '$app/paths';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	let order = $state<'pāṇini' | 'naive'>('pāṇini');
	let flips = 0;
	function flip() {
		order = order === 'pāṇini' ? 'naive' : 'pāṇini';
		flips++;
		react(order === 'naive' ? 'If every rule could see every other rule\'s output, 8.2.7 would feed 7.1.9: राजैः, which is wrong.' : '8.2.1 makes 8.2.7 invisible to 7.1.9: counterfeeding. राजभिः ✓', order === 'naive' ? 'surprised' : 'happy');
		if (flips >= 2) complete();
	}
</script>

<div class="pipe">
	<div class="stage card" class:dim={order === 'pāṇini'}>
		<span class="eyebrow">7.1.9 (main grammar)</span>
		<span class="deva">अतो भिस ऐस्</span>
		<small>needs a stem ending in अ</small>
	</div>
	<span class="arr" aria-hidden="true">{order === 'naive' ? '⇄' : '→'}</span>
	<div class="stage card">
		<span class="eyebrow">8.2.7 (tripādī)</span>
		<span class="deva">नलोपः प्रातिपदिकान्तस्य</span>
		<small>राजन् → राज</small>
	</div>
	<span class="arr" aria-hidden="true">→</span>
	<div class="stage card out">
		<span class="eyebrow">result</span>
		<span class="deva big" class:bad={order === 'naive'}>{order === 'naive' ? 'राजैः ✗' : 'राजभिः ✓'}</span>
	</div>
</div>
<button class="btn" onclick={flip}>{order === 'pāṇini' ? 'Let every rule see everything' : 'Restore 8.2.1'}</button>
<p class="note">
	In Kiparsky's terms, Pāṇini's <SutraRef n="8.2.1" s="पूर्वत्रासिद्धम्" /> enforces <b>counterfeeding</b>: a later rule
	that could feed an earlier one is kept from doing so. More in <a href={resolve('/learn') + '/asiddha/'}>the asiddha explainer</a>.
</p>

<style>
	.pipe {
		display: flex;
		align-items: stretch;
		gap: 8px;
		flex-wrap: wrap;
		margin-bottom: 14px;
	}
	.stage {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 12px 14px;
		min-width: 170px;
		flex: 1;
	}
	.stage.dim {
		opacity: 0.55;
	}
	.stage .deva {
		font-size: 18px;
	}
	.stage small {
		color: var(--ink-2);
		font-size: 12.5px;
	}
	.big {
		font-size: 28px !important;
		font-weight: 700;
		color: var(--r-subject);
	}
	.big.bad {
		color: var(--r-target);
	}
	.arr {
		align-self: center;
		font-size: 22px;
		color: var(--muted);
	}
	.note {
		margin-top: 14px;
		font-size: 15px;
		max-width: 48em;
	}
</style>
