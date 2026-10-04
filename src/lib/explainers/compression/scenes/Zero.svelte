<script lang="ts">
	import DerivationStrip from '#lib/components/DerivationStrip.svelte';
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	type D = { word: string; hash: string; steps: any[] };
	let { react, complete, data }: SceneProps<{ raja: D }> = $props();
	let ghost = $state(true);
	let toggles = 0;
	function flip() {
		ghost = !ghost;
		toggles++;
		react(
			ghost
				? 'With 1.1.62: the deleted ending still counts, so राजान् is a pada and 8.2.7 drops the न्: राजा ✓.'
				: 'Without it: no ending, so not a pada; 8.2.7 cannot apply and we would be stuck with राजान् ✗.',
			ghost ? 'happy' : 'surprised'
		);
		if (toggles >= 2) complete();
	}
</script>

<div class="rules card">
	<p><SutraRef n="1.1.60" s="अदर्शनं लोपः" />: deletion (lopa) is "not being seen", a zero.</p>
	<p><SutraRef n="1.1.62" s="प्रत्ययलोपे प्रत्ययलक्षणम्" />: when an affix is deleted, its effects remain.</p>
</div>

<div class="sw">
	<span>राजन् + सुँ → 6.1.68 deletes सुँ → राजान् + ∅. Is it a word (pada) by 1.4.14?</span>
	<button class="btn" aria-pressed={ghost} onclick={flip}>{ghost ? 'Ghost affix ON (1.1.62)' : 'Ghost affix OFF'}</button>
	<span class="res deva" class:bad={!ghost}>{ghost ? 'राजा ✓' : 'राजान् ✗'}</span>
</div>

<DerivationStrip steps={data.raja.steps} word={data.raja.word} hash={data.raja.hash} focus={['6.1.68', '8.2.7']} />
<p class="muted note">A programmer might call this a tombstone: the element is gone from the output but leaves a marker that later logic still reads. vidyut applies the effect without listing 1.1.62 as a separate step.</p>

<style>
	.rules {
		padding: 12px 18px;
		max-width: 680px;
		font-size: 15px;
	}
	.rules p {
		margin: 4px 0;
	}
	.sw {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px 14px;
		margin: 16px 0;
		font-size: 15px;
	}
	.res {
		font-size: 28px;
		font-weight: 700;
		color: var(--r-subject);
	}
	.res.bad {
		color: var(--r-target);
	}
	.note {
		margin-top: 10px;
		font-size: 13.5px;
		max-width: 48em;
	}
</style>
