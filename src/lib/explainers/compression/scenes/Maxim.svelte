<script lang="ts">
	import { toVarnas, isVowel } from '#lib/varna.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete, data }: SceneProps<{ syllables: number; perSutra: number; count: number }> = $props();
	const SHORT = 'इको यणचि';
	const LONG = 'इ ई उ ऊ ऋ ॠ ऌ इत्येतेषां स्थाने य् व् र् ल् इत्येते यथाक्रमं भवन्ति अ आ इ ई उ ऊ ऋ ॠ ऌ ए ऐ ओ औ इत्येषु परेषु';
	const syl = (s: string) => toVarnas(s).filter(isVowel).length;
	let open = $state(false);
	function expand() {
		open = !open;
		if (open) {
			react(`${syl(SHORT)} syllables instead of about ${syl(LONG)}: roughly ${Math.round(syl(LONG) / syl(SHORT))}× shorter, thanks to three pratyāhāras and the case conventions.`, 'happy');
			complete();
		}
	}
</script>

<blockquote class="maxim card">
	<span class="deva">अर्धमात्रालाघवेन पुत्रोत्सवं मन्यन्ते वैयाकरणाः</span>
	<small>"Grammarians celebrate saving half a mora as they would the birth of a son." (a traditional maxim)</small>
</blockquote>

<div class="stats">
	<div><b>{data.count.toLocaleString()}</b><span>sūtras</span></div>
	<div><b>{data.syllables.toLocaleString()}</b><span>syllables in all</span></div>
	<div><b>{data.perSutra.toFixed(1)}</b><span>syllables per sūtra</span></div>
</div>

<button class="cmp card" onclick={expand} aria-expanded={open}>
	<span class="deva short">{SHORT}</span>
	<span class="muted">{syl(SHORT)} syllables · tap to spell it out without pratyāhāras</span>
	{#if open}
		<span class="deva long">{LONG}</span>
		<span class="muted">≈ {syl(LONG)} syllables (an illustrative paraphrase)</span>
	{/if}
</button>

<style>
	.maxim {
		margin: 0 0 18px;
		padding: 16px 20px;
		display: flex;
		flex-direction: column;
		gap: 4px;
		max-width: 680px;
	}
	.maxim .deva {
		font-size: 22px;
	}
	.maxim small {
		color: var(--ink-2);
		font-family: var(--font-serif);
		font-size: 15px;
	}
	.stats {
		display: flex;
		gap: 28px;
		flex-wrap: wrap;
		margin-bottom: 18px;
	}
	.stats div {
		display: flex;
		flex-direction: column;
	}
	.stats b {
		font-family: var(--font-serif);
		font-size: 30px;
	}
	.stats span {
		font-size: 13px;
		color: var(--muted);
	}
	.cmp {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 16px 20px;
		max-width: 720px;
		text-align: left;
		cursor: pointer;
		color: var(--ink);
	}
	.short {
		font-size: 34px;
		font-weight: 600;
	}
	.long {
		font-size: 17px;
		line-height: 1.8;
		color: var(--r-target);
	}
</style>
