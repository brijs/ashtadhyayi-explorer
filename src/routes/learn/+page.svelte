<script lang="ts">
	import { resolve } from '$app/paths';
	import { EXPLAINERS } from '#lib/catalog.ts';
	import LessonGrid from '#lib/components/LessonGrid.svelte';
</script>

<svelte:head><title>Learn · Aṣṭādhyāyī Explorer</title></svelte:head>

<div class="wrap page">
	<p class="eyebrow">Explainers</p>
	<h1>Learn the machinery</h1>
	<p class="lede">
		Short, interactive lessons, each built around one idea and a few sūtras. They work silently, or you can switch on
		narration and let the śiṣya ask the questions you'd ask.
	</p>
	<LessonGrid lessons={EXPLAINERS} hrefFor={(slug) => resolve('/learn') + '/' + slug + '/'} />
</div>

<style>
	.page { padding-top: 36px; }
	h1 { font-size: clamp(32px, 5vw, 44px); }
	.lede { font-family: var(--font-serif); font-size: 18px; color: var(--ink-2); max-width: 40em; }
</style>
