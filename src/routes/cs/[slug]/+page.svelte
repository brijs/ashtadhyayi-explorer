<script lang="ts">
	import Explainer from '#lib/explainer/Explainer.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{data.def.title} · Pāṇini &amp; CS · Aṣṭādhyāyī Explorer</title>
</svelte:head>

{#key data.slug}
	<Explainer def={data.def} data={data.sceneData} clips={data.clips} />
{/key}
