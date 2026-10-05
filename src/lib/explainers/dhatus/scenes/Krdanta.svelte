<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import DerivationStrip from '#lib/components/DerivationStrip.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';
	import { sutra, type DhatuData } from '../types.ts';

	let { react, complete, data }: SceneProps<DhatuData> = $props();

	const ROWS = [
		{ key: 'pacaka', root: 'पच्', aff: 'ण्वुल्', by: '3.1.133', gloss: 'cook (one who cooks)', note: 'ण्वुल् → अक; its ण् tag triggers vṛddhi of the root vowel अ (7.2.116)', focus: ['3.1.133', '7.1.1', '7.2.116', '1.2.46'] },
		{ key: 'kartr', root: 'कृ', aff: 'तृच्', by: '3.1.133', gloss: 'doer, agent', note: 'तृच् → तृ; the root vowel takes guṇa (7.3.84)', focus: ['3.1.133', '7.3.84', '1.2.46'] },
		{ key: 'gata', root: 'गम्', aff: 'क्त', by: '3.2.102', gloss: 'gone', note: 'क्त → त, a past participle; the root loses its म् (6.4.37)', focus: ['3.2.102', '6.4.37', '1.2.46'] }
	] as const;
	let sel = $state<(typeof ROWS)[number]['key']>('pacaka');
	const seen = new Set<string>(['pacaka']);
	const row = $derived(ROWS.find((r) => r.key === sel)!);

	function pick(k: (typeof ROWS)[number]['key']) {
		sel = k;
		seen.add(k);
		const r = ROWS.find((x) => x.key === k)!;
		react(`${r.root} + ${r.aff} → ${data.krt[k].word}, "${r.gloss}". 1.2.46 then makes it a noun stem.`, 'happy');
		if (seen.size === 3) complete();
	}
</script>

<p class="lead">
	Inside the long heading <SutraRef n="3.1.91" s={sutra(data, '3.1.91').s} /> ("after a root"), every affix that is not a verb ending is a
	<b>kṛt</b> (<SutraRef n="3.1.93" s={sutra(data, '3.1.93').s} />). A root plus a kṛt is a noun stem by
	<SutraRef n="1.2.46" s={sutra(data, '1.2.46').s} />, ready for case endings.
</p>

<table class="cmp">
	<thead><tr><th>root</th><th>kṛt affix</th><th>word</th><th>meaning</th></tr></thead>
	<tbody>
		{#each ROWS as r (r.key)}
			<tr class:sel={sel === r.key} onclick={() => pick(r.key)}>
				<td class="deva v">{r.root}</td>
				<td><button class="deva aff" onclick={(e) => { e.stopPropagation(); pick(r.key); }}>{r.aff}</button> <span class="by"><SutraRef n={r.by} /></span></td>
				<td class="deva w">{data.krt[r.key].word}</td>
				<td class="g">{r.gloss}</td>
			</tr>
		{/each}
	</tbody>
</table>

<h2 class="h">How vidyut derives <span class="deva">{data.krt[sel].word}</span></h2>
<p class="muted small">{row.note}</p>
<DerivationStrip steps={data.krt[sel].steps} word={data.krt[sel].word} focus={[...row.focus]} />

<style>
	.lead {
		max-width: 50em;
		font-size: 15.5px;
	}
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
	.by {
		font-size: 12px;
	}
	.v {
		font-size: 20px;
		color: var(--saffron-ink);
	}
	.w {
		font-size: 22px;
		font-weight: 600;
	}
	.g {
		font-size: 13.5px;
		color: var(--ink-2);
	}
	.h {
		font-size: 18px;
		margin: 22px 0 2px;
	}
	.small {
		font-size: 13.5px;
		margin: 0 0 8px;
	}
	@media (max-width: 600px) {
		th:nth-child(4),
		td:nth-child(4) {
			display: none;
		}
		td {
			padding: 6px;
		}
	}
</style>
