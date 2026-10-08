<script lang="ts">
	import { resolve } from '$app/paths';
	import SutraRef from '#lib/components/SutraRef.svelte';
	import DhatuSenses from '#lib/components/DhatuSenses.svelte';
	import ItWord from '#lib/components/ItWord.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';
	import { sutra, GANA_SA, GANA_IAST, type DhatuData } from '../types.ts';

	let { react, complete, data }: SceneProps<DhatuData> = $props();

	// What each class puts between root and ending in the present (sārvadhātuka, active), and the sūtra that does it.
	const VIK: Record<string, { aff: string; what: string; n: string }> = {
		Bhvadi: { aff: 'शप्', what: 'शप्, which leaves अ', n: '3.1.68' },
		Adadi: { aff: 'शप् → ∅', what: 'शप् is deleted (luk), so the ending touches the root', n: '2.4.72' },
		Juhotyadi: { aff: 'शप् → श्लु', what: 'शप् is replaced by ślu, and the root reduplicates', n: '2.4.75' },
		Divadi: { aff: 'श्यन्', what: 'श्यन्, which leaves य', n: '3.1.69' },
		Svadi: { aff: 'श्नु', what: 'श्नु, which leaves नु', n: '3.1.73' },
		Tudadi: { aff: 'श', what: 'श, which leaves अ (without strengthening the root)', n: '3.1.77' },
		Rudhadi: { aff: 'श्नम्', what: 'श्नम्, an infix न inside the root', n: '3.1.78' },
		Tanadi: { aff: 'उ', what: 'उ', n: '3.1.79' },
		Kryadi: { aff: 'श्ना', what: 'श्ना, which leaves ना', n: '3.1.81' },
		Curadi: { aff: 'णिच्', what: 'णिच् first (then शप्), giving -aya-', n: '3.1.25' }
	};
	const max = $derived(Math.max(...data.ganas.map((g) => g.count)));
	let sel = $state<string | null>(null);
	const seen = new Set<string>();
	const g = $derived(data.ganas.find((x) => x.g === sel));

	function pick(id: string) {
		sel = id;
		seen.add(id);
		const x = data.ganas.find((y) => y.g === id)!;
		react(`${GANA_IAST[id]}: ${x.count} roots. Connector: ${VIK[id].aff}, so ${x.first.d} gives ${x.form}.`, 'happy');
		if (seen.size >= 2) complete();
	}
</script>

<div class="lay">
<div class="left">
<div class="chart" role="group" aria-label="Roots per class">
	{#each data.ganas as x, i (x.g)}
		<button class="row" class:on={sel === x.g} onclick={() => pick(x.g)} aria-pressed={sel === x.g}>
			<span class="lab"><span class="no">{i + 1}</span> <span class="deva">{GANA_SA[x.g]}</span> <i>{GANA_IAST[x.g]}</i></span>
			<span class="track"><span class="bar" style="width: {Math.max(1.5, (100 * x.count) / max)}%"></span></span>
			<span class="num">{x.count.toLocaleString()}</span>
		</button>
	{/each}
</div>
<p class="muted small">
	{data.total.toLocaleString()} entries in vidyut's Dhātupāṭha ({data.distinctUpadesha.toLocaleString()} distinct teaching forms): the same root can be listed in more
	than one class or with more than one meaning. Printed editions count differently, so you will see figures near 2,000.
</p>
</div>

{#if g}
	{@const v = VIK[g.g]}
	<div class="info card">
		<p><b class="deva">{GANA_SA[g.g]}</b> means "<span class="deva">{g.first.d}</span> and the rest": the class is named after its first root.</p>
		<p>Present-tense connector: {v.what}, by <SutraRef n={v.n} s={sutra(data, v.n).s} />{#if g.codes.includes(v.n)} <span class="ok" title="This sūtra fires in vidyut's derivation">✓ fires in vidyut</span>{/if}</p>
		<p>
			So <span class="deva">{g.first.d}</span> → <a class="deva form" href={resolve('/tools/prakriya') + '/#' + g.hash}>{g.form}</a>
			<span class="muted">(open in the debugger)</span>
		</p>
		<p class="eyebrow">first roots of the class</p>
		<ul class="roots">
			{#each g.sample as r (r.c)}
				<li><span class="code">{r.c}</span> <span class="w"><ItWord text={r.d} ctx="dhatu" /></span> <span class="m"><DhatuSenses d={r} /></span></li>
			{/each}
		</ul>
		<p class="more"><a href={resolve('/tools') + '/dhatupatha/#' + g.g}>All {g.count} in the Dhātupāṭha browser →</a></p>
	</div>
{:else}
	<div class="info card empty"><p class="muted">Tap a class to see its connector and its first roots.</p></div>
{/if}
</div>

<style>
	.lay {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(300px, 380px);
		gap: 18px;
		align-items: start;
	}
	.chart {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.row {
		display: grid;
		grid-template-columns: 168px minmax(0, 1fr) 48px;
		align-items: center;
		gap: 10px;
		padding: 3px 6px;
		border: none;
		border-radius: 8px;
		background: none;
		cursor: pointer;
		color: var(--ink);
		text-align: left;
	}
	.row:hover,
	.row.on {
		background: var(--surface-2);
	}
	.lab .deva {
		font-size: 17px;
	}
	.lab i {
		font-family: var(--font-serif);
		color: var(--muted);
		font-size: 13px;
	}
	.no {
		display: inline-block;
		width: 1.4em;
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--muted);
	}
	.track {
		height: 16px;
		border-radius: 4px;
		background: var(--surface-2);
		overflow: hidden;
	}
	.bar {
		display: block;
		height: 100%;
		background: var(--saffron);
		border-radius: 4px;
	}
	.on .bar {
		background: var(--saffron-ink);
	}
	.num {
		font-family: var(--font-mono);
		font-size: 13px;
		text-align: right;
	}
	.small {
		font-size: 13px;
		max-width: 60em;
	}
	.info {
		padding: 14px 18px;
		font-size: 14.5px;
	}
	.empty {
		border-style: dashed;
	}
	.info p {
		margin: 4px 0;
	}
	.ok {
		margin-left: 6px;
		font-size: 12px;
		color: var(--r-subject);
		white-space: nowrap;
	}
	.form {
		font-size: 19px;
		font-weight: 600;
	}
	.roots {
		list-style: none;
		margin: 4px 0 0;
		padding: 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: 2px 14px;
	}
	.roots li {
		display: flex;
		align-items: baseline;
		gap: 8px;
		min-width: 0;
	}
	.code {
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--muted);
	}
	.w {
		font-size: 18px;
	}
	.m {
		font-size: 13px;
		color: var(--ink-2);
		min-width: 0;
	}
	.more {
		font-size: 14px;
	}
	@media (max-width: 1000px) {
		.lay {
			grid-template-columns: 1fr;
		}
		.roots {
			grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		}
	}
	@media (max-width: 600px) {
		.row {
			grid-template-columns: 128px minmax(0, 1fr) 44px;
		}
		.lab i {
			display: none;
		}
	}
</style>
