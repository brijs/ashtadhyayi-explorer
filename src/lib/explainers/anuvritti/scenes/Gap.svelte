<script lang="ts">
	import { settings } from '#lib/settings.svelte.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	type S = { n: string; s: string; iast: string; en: string; pc: string[] };
	let { react, complete, data }: SceneProps<{ s78: S }> = $props();
	let asked = $state(false);

	function ask() {
		asked = true;
		react('The words on the page only say what changes, not when. A reader is expected to carry a word down from above.', 'surprised');
		complete();
	}
</script>

<div class="card sut">
	<span class="n">{data.s78.n}</span>
	<span class="s deva">{data.s78.s}</span>
	{#if settings.iast}<span class="iast">{data.s78.iast}</span>{/if}
	<div class="parts">
		<span class="w deva" style="--c: var(--r-target)">एचः <small>in place of एच् (ए ओ ऐ औ)</small></span>
		<span class="arr">→</span>
		<span class="w deva" style="--c: var(--r-subject)">अय्-अव्-आय्-आवः <small>अय् अव् आय् आव्, respectively</small></span>
		<span class="arr">/</span>
		<button class="w q" class:asked onclick={ask} aria-label="When does this apply?">{asked ? '?!' : '?'}<small>when?</small></button>
	</div>
</div>

<style>
	.sut {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 24px;
		max-width: 720px;
	}
	.n {
		font-family: var(--font-mono);
		color: var(--saffron-ink);
	}
	.s {
		font-size: 40px;
		font-weight: 600;
		line-height: 1.4;
	}
	.parts {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 12px;
	}
	.w {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 6px 14px;
		border-radius: 12px;
		border: 2px solid color-mix(in srgb, var(--c) 60%, transparent);
		background: color-mix(in srgb, var(--c) 10%, var(--surface));
		font-size: 24px;
		line-height: 1.4;
	}
	.w small {
		font-family: var(--font-ui);
		font-size: 11.5px;
		color: var(--muted);
	}
	.arr {
		color: var(--muted);
		font-size: 22px;
	}
	.q {
		--c: var(--r-right);
		border-style: dashed;
		cursor: pointer;
		min-width: 80px;
		font-family: var(--font-serif);
		font-weight: 700;
		color: var(--r-right);
		animation: wiggle 2s ease-in-out infinite;
	}
	.q.asked {
		animation: none;
	}
	@keyframes wiggle {
		0%, 80%, 100% { transform: rotate(0); }
		85% { transform: rotate(-6deg); }
		90% { transform: rotate(6deg); }
	}
</style>
