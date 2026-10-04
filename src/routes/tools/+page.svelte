<script lang="ts">
	import { resolve } from '$app/paths';
	import { TOOLS } from '#lib/catalog.ts';
	import LessonGrid from '#lib/components/LessonGrid.svelte';
</script>

<svelte:head><title>Tools · Aṣṭādhyāyī Explorer</title></svelte:head>

<div class="wrap page">
	<p class="eyebrow">Tools</p>
	<h1>Playgrounds</h1>
	<p class="lede">Hands-on instruments for the grammar's moving parts.</p>
	<LessonGrid lessons={TOOLS} hrefFor={(slug) => resolve('/tools') + '/' + slug + '/'} />
</div>

<style>
	.page { padding-top: 36px; }
	h1 { font-size: clamp(32px, 5vw, 44px); }
	.lede { font-family: var(--font-serif); font-size: 18px; color: var(--ink-2); max-width: 40em; }
</style>
