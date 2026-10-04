<script lang="ts">
	import DerivationStrip from '#lib/components/DerivationStrip.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	type D = { word: string; hash: string; steps: any[] };
	let { react, complete, data }: SceneProps<{ ktva: D; trc: D; nvul: D }> = $props();

	const ROWS = [
		{ key: 'ktva', affix: 'क्त्वा', tags: 'क् → kit', effect: 'no guṇa: 1.1.5 क्ङिति च blocks it', vowel: 'कृ', focus: ['1.1.5'] },
		{ key: 'trc', affix: 'तृच्', tags: 'च् → cit (accent)', effect: 'guṇa: ṛ → ar (7.3.84)', vowel: 'कर्', focus: ['7.3.84'] },
		{ key: 'nvul', affix: 'ण्वुल्', tags: 'ण् → ṇit, ल् → lit', effect: 'vṛddhi: ṛ → ār (7.2.115 अचो ञ्णिति)', vowel: 'कार्', focus: ['7.2.115', '7.1.1'] }
	] as const;
	let sel = $state<(typeof ROWS)[number]['key']>('ktva');
	let seen = new Set<string>(['ktva']);
	const row = $derived(ROWS.find((r) => r.key === sel)!);

	function pick(k: (typeof ROWS)[number]['key']) {
		sel = k;
		seen.add(k);
		const r = ROWS.find((x) => x.key === k)!;
		react(`${r.affix}: ${r.effect}. Result: ${data[k].word}.`, 'happy');
		if (seen.size === 3) complete();
	}
</script>

<table class="cmp">
	<thead><tr><th>affix</th><th>tags</th><th>root vowel</th><th>word</th></tr></thead>
	<tbody>
		{#each ROWS as r (r.key)}
			<tr class:sel={sel === r.key} onclick={() => pick(r.key)}>
				<td><button class="deva aff" onclick={() => pick(r.key)}>{r.affix}</button></td>
				<td>{r.tags}</td>
				<td class="deva v">{r.vowel}</td>
				<td class="deva w">{data[r.key].word}</td>
			</tr>
		{/each}
	</tbody>
</table>

<h2 class="h">How vidyut derives <span class="deva">{data[sel].word}</span></h2>
<DerivationStrip steps={data[sel].steps} word={data[sel].word} focus={[...row.focus]} />

<style>
	.cmp {
		border-collapse: collapse;
		width: 100%;
		max-width: 680px;
		font-size: 15px;
	}
	th {
		text-align: left;
		font-size: 12px;
		color: var(--muted);
		padding: 4px 10px;
	}
	td {
		padding: 6px 10px;
		border-top: 1px solid var(--line);
		cursor: pointer;
	}
	tr.sel td {
		background: var(--saffron-soft);
	}
	.aff {
		font-size: 20px;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--indigo);
		text-decoration: underline dotted;
		padding: 0;
	}
	.v {
		font-size: 20px;
		color: var(--saffron-ink);
	}
	.w {
		font-size: 22px;
		font-weight: 600;
	}
	.h {
		font-size: 18px;
		margin: 22px 0 8px;
	}
</style>
