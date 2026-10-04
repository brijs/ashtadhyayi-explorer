<script lang="ts">
	import { sutraHref } from '#lib/links.ts';

	/** Inline link to a sūtra: number, plus its text when given. */
	let { n, s = '' }: { n: string; s?: string } = $props();
</script>

<a class="sref" href={sutraHref(n)}><span class="num">{n}</span>{#if s}&nbsp;<span class="deva">{s}</span>{/if}</a>

<style>
	.sref {
		text-decoration: none;
		white-space: nowrap;
		border-bottom: 1px solid color-mix(in srgb, var(--indigo) 40%, transparent);
	}
	.sref:hover {
		border-bottom-color: var(--indigo);
	}
	.num {
		font-family: var(--font-mono);
		font-size: 0.85em;
	}
</style>
