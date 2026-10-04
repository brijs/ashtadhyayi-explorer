<script lang="ts">
	import { onMount } from 'svelte';
	import { replaceState } from '$app/navigation';
	import ShivaGrid from '#lib/components/ShivaGrid.svelte';
	import SutraRef from '#lib/components/SutraRef.svelte';
	import { SHIVA_FLAT, rangeSlots, pratyaharaName } from '#lib/varna.ts';
	import { devaToIast } from '#lib/translit.ts';
	import { settings } from '#lib/settings.svelte.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let start = $state<number | null>(null);
	let end = $state<number | null>(null);
	let savarna = $state(false);
	let probe = $state('');

	const byName = $derived(new Map(data.items.filter((i) => !i.long).map((i) => [i.name, i])));
	const byKey = $derived(new Map(data.items.map((i) => [i.key, i])));
	const shivaItems = $derived(data.items.filter((i) => i.shiva).sort((a, b) => b.uses - a.uses));
	const otherItems = $derived(data.items.filter((i) => !i.shiva));

	const plain = (v: string) => (v.length > 1 && v.endsWith('्') ? v[0] : v);
	const lit = $derived(start !== null && end !== null ? new Set(rangeSlots(start, end)) : new Set<number>());
	const marked = $derived(new Set([start, end].filter((x): x is number => x !== null)));
	const name = $derived(start !== null && end !== null ? pratyaharaName(start, end) : '');
	const letters = $derived([...new Set([...lit].map((i) => plain(SHIVA_FLAT[i].varna)))]);
	// the long अण् (to the second ण्) is a separate entry
	const item = $derived.by(() => {
		if (!name) return undefined;
		const long = byKey.get(`${name}-long`);
		return long && long.letters.length === letters.length ? long : byName.get(name);
	});

	// 1.1.69: vowels in a pratyāhāra also denote their long (and other similar) forms
	const LONG: Record<string, string> = { 'अ': 'आ', 'इ': 'ई', 'उ': 'ऊ', 'ऋ': 'ॠ', 'ऌ': 'ॡ' };
	const shown = $derived(savarna ? letters.flatMap((l) => (LONG[l] ? [l, LONG[l]] : [l])) : letters);

	function pick(i: number) {
		if (!SHIVA_FLAT[i].isIt) {
			start = i;
			end = null;
			return;
		}
		if (start !== null && i > start) end = i;
		updateHash();
	}
	function select(nm: string, len?: number) {
		const first = nm[0];
		const marker = nm.slice(-2);
		const s = SHIVA_FLAT.findIndex((x) => !x.isIt && (x.varna === first || x.varna === first + '्'));
		// अण् and इण् in 1.1.69 / 8.3.57 reach the second ण्; elsewhere the first.
		const occurrences = SHIVA_FLAT.map((x, i) => (i > s && x.isIt && x.varna === marker ? i : -1)).filter((i) => i >= 0);
		const listed = len ?? byName.get(nm)?.letters.length;
		const e = occurrences.find((o) => rangeSlots(s, o).length === listed) ?? occurrences[0];
		if (s >= 0 && e !== undefined) {
			start = s;
			end = e;
			updateHash();
		}
	}
	function updateHash() {
		if (name) replaceState('#' + encodeURIComponent(name), {});
	}
	onMount(() => {
		const h = decodeURIComponent(location.hash.slice(1));
		if (h && byName.has(h)) select(h);
	});

	const allLetters = [...new Set(SHIVA_FLAT.filter((s) => !s.isIt).map((s) => plain(s.varna)))];
	const containing = $derived(probe ? shivaItems.filter((i) => i.letters.includes(probe)) : []);
</script>

<svelte:head><title>Pratyāhāra calculator · Aṣṭādhyāyī Explorer</title></svelte:head>

<div class="wrap page">
	<p class="eyebrow">Tool</p>
	<h1>Pratyāhāra calculator <span class="deva sa">प्रत्याहारः</span></h1>
	<p class="lede">
		Tap a starting sound, then a marker (the dashed letters). The class runs from the first sound up to the marker, by
		<SutraRef n="1.1.71" s="आदिरन्त्येन सहेता" />.
	</p>

	<div class="layout">
		<div>
			<ShivaGrid {lit} {marked} pickable={() => true} onpick={pick} />
		</div>
		<aside class="result card" aria-live="polite">
			{#if name}
				<span class="nm deva">{name}</span>
				<span class="iast">{devaToIast(name)}</span>
				<div class="letters">
					{#each shown as l (l)}<span class="l deva">{l}{#if settings.iast}<small>{devaToIast(l)}</small>{/if}</span>{/each}
				</div>
				<label class="sav"><input type="checkbox" bind:checked={savarna} /> include long vowels (<SutraRef n="1.1.69" />)</label>
				<p class="meta">
					{letters.length} sound{letters.length === 1 ? '' : 's'} ·
					{#if item}
						used in <b>{item.uses}</b> sūtra{item.uses === 1 ? '' : 's'}
					{:else}
						not used by Pāṇini
					{/if}
				</p>
				{#if item?.sutras.length}
					<ul class="uses">
						{#each item.sutras as u (u.n)}<li><SutraRef n={u.n} s={u.s} /></li>{/each}
					</ul>
				{/if}
				{#if name === 'अण्' || name === 'इण्'}
					<p class="note">ण् marks two lines (1 and 6). Tradition reads अण् to the first ण् everywhere except in 1.1.69, and इण् to the second.</p>
				{/if}
			{:else}
				<p class="muted">{start !== null ? 'Now tap a marker after it.' : 'Pick a starting sound, or choose a pratyāhāra below.'}</p>
			{/if}
		</aside>
	</div>

	<section class="lists">
		<h2>Pratyāhāras Pāṇini uses</h2>
		<p class="muted small">Sorted by how many sūtras use them (based on ashtadhyayi.com's word-by-word data).</p>
		<div class="chips">
			{#each shivaItems as i (i.key)}
				<button class="chip" aria-pressed={i.key === item?.key} onclick={() => select(i.name, i.letters.length)}>
					<span class="deva">{i.name}</span>{#if i.long}<small>to 2nd ण्</small>{/if}<small>{i.uses}</small>
				</button>
			{/each}
		</div>

		<h2>Which classes contain a sound?</h2>
		<div class="probe">
			{#each allLetters as l (l)}
				<button class="pl deva" aria-pressed={probe === l} onclick={() => (probe = probe === l ? '' : l)}>{l}</button>
			{/each}
		</div>
		{#if probe}
			<p class="contain">
				<b class="deva">{probe}</b> is in
				{#each containing as c, k (c.key)}{k ? ', ' : ' '}<button class="link deva" onclick={() => select(c.name, c.letters.length)}>{c.name}{c.long ? ' (long)' : ''}</button>{/each}
				{#if !containing.length} none of the listed classes{/if}.
			</p>
		{/if}

		<h2>Other pratyāhāras</h2>
		<p class="muted small">The same first-plus-marker trick also abbreviates lists of affixes, not just sounds.</p>
		<ul class="others">
			{#each otherItems as i (i.key)}
				<li><b class="deva">{i.name}</b> <span class="deva muted">{i.letters.join(' ')}</span> {#if i.sutras[0]}<SutraRef n={i.sutras[0].n} />{/if}</li>
			{/each}
		</ul>
	</section>
</div>

<style>
	.page {
		padding-top: 32px;
	}
	h1 {
		font-size: clamp(28px, 4.5vw, 40px);
	}
	h1 .sa {
		font-size: 0.6em;
		color: var(--saffron-ink);
		font-weight: 500;
	}
	.lede {
		font-family: var(--font-serif);
		font-size: 17px;
		color: var(--ink-2);
		max-width: 44em;
	}
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 320px;
		gap: 28px;
		align-items: start;
		margin-top: 20px;
	}
	.result {
		position: sticky;
		top: 80px;
		padding: 18px 20px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.nm {
		font-size: 44px;
		font-weight: 700;
		color: var(--saffron-ink);
		line-height: 1.3;
	}
	.letters {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin: 6px 0;
	}
	.l {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		min-width: 32px;
		padding: 0 6px;
		border-radius: 6px;
		background: var(--saffron-soft);
		color: var(--saffron-ink);
		font-size: 19px;
	}
	.l small {
		font-family: var(--font-serif);
		font-size: 10.5px;
	}
	.sav {
		font-size: 13px;
		color: var(--ink-2);
	}
	.meta {
		margin: 4px 0 0;
		font-size: 14px;
	}
	.uses {
		list-style: none;
		padding: 0;
		margin: 0;
		font-size: 14px;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.note {
		font-size: 13px;
		color: var(--ink-2);
		background: var(--surface-2);
		padding: 8px 10px;
		border-radius: 8px;
		margin: 6px 0 0;
	}
	.lists {
		margin-top: 40px;
	}
	.lists h2 {
		font-size: 22px;
		margin-top: 28px;
	}
	.small {
		font-size: 13.5px;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.chip {
		display: inline-flex;
		align-items: baseline;
		gap: 6px;
		padding: 3px 12px;
		border-radius: 999px;
		border: 1px solid var(--line);
		background: var(--surface);
		cursor: pointer;
		font-size: 17px;
		color: var(--ink);
	}
	.chip small {
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--muted);
	}
	.chip[aria-pressed='true'] {
		border-color: var(--saffron);
		background: var(--saffron-soft);
	}
	.probe {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}
	.pl {
		width: 36px;
		height: 36px;
		border-radius: 8px;
		border: 1px solid var(--line);
		background: var(--surface);
		cursor: pointer;
		font-size: 18px;
		color: var(--ink);
	}
	.pl[aria-pressed='true'] {
		background: var(--indigo);
		color: #fff;
		border-color: var(--indigo);
	}
	.contain {
		font-size: 15px;
	}
	.link {
		background: none;
		border: none;
		padding: 0;
		color: var(--indigo);
		cursor: pointer;
		font-size: 17px;
		text-decoration: underline;
	}
	.others {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-size: 15px;
	}
	@media (max-width: 900px) {
		.layout {
			grid-template-columns: minmax(0, 1fr);
		}
		.result {
			position: static;
			order: -1;
		}
	}
</style>
