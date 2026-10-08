<script lang="ts">
	// Hindi senses a root takes with each upasarga (prefix), e.g. अधि + भू. Renders nothing for roots without any.
	import { onMount } from 'svelte';
	import { loadUpasargas } from '#lib/vidyut.ts';

	let { code, root }: { code: string; root: string } = $props();
	let all = $state<Record<string, [string, string][]>>({});
	onMount(() => {
		loadUpasargas().then((u) => (all = u)).catch(() => {});
	});
	const list = $derived(all[code] ?? []);
</script>

{#if list.length}
	<details class="ups">
		<summary>With a prefix <span class="deva">उपसर्ग</span> <span class="n">{list.length}</span></summary>
		<ul class="deva">
			{#each list as [u, m] (u)}
				<li><b>{u}</b> + <span class="r">{root}</span> <span class="arrow" aria-hidden="true">→</span> {m}</li>
			{/each}
		</ul>
	</details>
{/if}

<style>
	.ups {
		font-size: 13.5px;
		color: var(--ink-2);
	}
	summary {
		cursor: pointer;
		color: var(--muted);
		font-size: 12.5px;
	}
	.n {
		font-family: var(--font-mono);
		font-size: 11px;
	}
	ul {
		list-style: none;
		margin: 4px 0 0;
		padding: 0;
		columns: 2 260px;
		column-gap: 24px;
	}
	li {
		break-inside: avoid;
		padding: 1px 0;
	}
	.r,
	.arrow {
		color: var(--muted);
	}
</style>
