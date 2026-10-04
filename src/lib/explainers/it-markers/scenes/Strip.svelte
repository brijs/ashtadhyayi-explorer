<script lang="ts">
	import { fade } from 'svelte/transition';
	import SutraRef from '#lib/components/SutraRef.svelte';
	import { ITEMS } from '../items.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	let stripped = $state(false);
	function go() {
		stripped = !stripped;
		if (stripped) {
			react('What remains is what you hear. The tags are gone, but the grammar has already recorded what they said.', 'happy');
			complete();
		}
	}
</script>

<button class="btn primary" onclick={go}>{stripped ? 'Put the tags back' : 'Apply 1.3.9: delete all tags'}</button>

<table>
	<thead><tr><th>item</th><th>after 1.3.9</th></tr></thead>
	<tbody>
		{#each ITEMS as it (it.name)}
			<tr>
				<td class="deva">
					{#each it.segs as s, i (i)}
						{#if !(stripped && s.it)}<span class:tag={s.it} out:fade={{ duration: 300 }}>{s.t}</span>{/if}
					{/each}
				</td>
				<td class="deva res">{stripped ? it.result : ''}</td>
			</tr>
		{/each}
	</tbody>
</table>
<p class="muted note"><SutraRef n="1.3.9" s="तस्य लोपः" />: "its (the it's) deletion". Deletion itself is defined in <SutraRef n="1.1.60" s="अदर्शनं लोपः" />: lopa means "not being seen".</p>

<style>
	table {
		border-collapse: collapse;
		margin-top: 16px;
		min-width: min(420px, 100%);
	}
	th {
		text-align: left;
		font-size: 12px;
		color: var(--muted);
		padding: 4px 12px 4px 0;
	}
	td {
		padding: 6px 12px 6px 0;
		border-top: 1px solid var(--line);
		font-size: 22px;
	}
	.tag {
		color: var(--r-target);
		text-decoration: underline dashed;
		text-underline-offset: 4px;
	}
	.res {
		color: var(--r-subject);
		font-weight: 600;
	}
	.note {
		margin-top: 14px;
		font-size: 14px;
	}
</style>
