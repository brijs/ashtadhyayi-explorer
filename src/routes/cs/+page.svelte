<script lang="ts">
	import { resolve } from '$app/paths';
	import { CS_LESSONS } from '#lib/catalog.ts';
	import LessonGrid from '#lib/components/LessonGrid.svelte';
</script>

<svelte:head><title>Pāṇini &amp; Computer Science · Aṣṭādhyāyī Explorer</title></svelte:head>

<div class="wrap page">
	<p class="eyebrow">Pāṇini ↔ Computer Science</p>
	<h1>A grammar that reads like a program</h1>
	<p class="lede">
		The Aṣṭādhyāyī is a finite set of rules that generates an open-ended language, written in a meta-language with its
		own conventions for scope, inheritance, ordering and conflict. Sūtra-bot walks through the ideas a programmer will
		recognize, with runnable examples. Each claim cites its source, and we point out where the analogies break down.
	</p>
	<LessonGrid lessons={CS_LESSONS} hrefFor={(slug) => resolve('/cs') + '/' + slug + '/'} />
</div>

<style>
	.page { padding-top: 36px; }
	h1 { font-size: clamp(32px, 5vw, 44px); }
	.lede { font-family: var(--font-serif); font-size: 18px; color: var(--ink-2); max-width: 42em; }
</style>
