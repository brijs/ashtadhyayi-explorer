<script lang="ts">
	import { onMount } from 'svelte';
	import { replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import ItWord from '#lib/components/ItWord.svelte';
	import DhatuSenses from '#lib/components/DhatuSenses.svelte';
	import SutraRef from '#lib/components/SutraRef.svelte';
	import { loadDhatus, tinantaHash, type Dhatu } from '#lib/vidyut.ts';
	import { looseKey, devaToIast } from '#lib/translit.ts';
	import { settings } from '#lib/settings.svelte.ts';
	import { detectIts, itName } from '#lib/it.ts';
	import { GANAS, GANA_SA, GANA_IAST, ANTAR_SA, PADA_INFO, padaMarker } from '#lib/dhatu.ts';
	import { ANUBANDHA_TOOL } from '#lib/explainers/dhatus/types.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const PAGE = 60;
	let dhatus = $state<Dhatu[]>([]);
	let failed = $state('');
	let gana = $state<string | null>(null);
	let tag = $state<string | null>(null);
	let q = $state('');
	let limit = $state(PAGE);

	// per-root tag names, computed once when the list arrives
	const keyed = $derived(
		dhatus.map((d) => {
			const units = detectIts(d.d, 'dhatu');
			const tags = new Set(units.map((_, i) => itName(units, i)).filter((x): x is string => !!x));
			return { d, tags, k: `${looseKey(d.n)} ${looseKey(d.d)} ${looseKey(d.m)} ${d.en.toLowerCase()} ${looseKey(d.hi)}`, nk: looseKey(d.n), slp: d.a.replace(/[\\^~]/g, '') };
		})
	);
	const filtered = $derived.by(() => {
		let xs = keyed;
		if (gana) xs = xs.filter((x) => x.d.g === gana);
		if (tag) xs = xs.filter((x) => x.tags.has(tag!));
		const t = q.trim();
		if (!t) return xs;
		const lk = looseKey(t);
		const ascii = /^[\x20-\x7e]+$/.test(t);
		const hit = (x: (typeof xs)[number]) => x.k.includes(lk) || x.d.c.startsWith(t) || (ascii && x.slp.includes(t.replace(/[\\^~]/g, '')));
		const starts = xs.filter((x) => x.nk.startsWith(lk) || x.d.c.startsWith(t));
		const rest = xs.filter((x) => !starts.includes(x) && hit(x));
		return [...starts, ...rest];
	});
	const shown = $derived(filtered.slice(0, limit));

	$effect(() => {
		gana;
		tag;
		q;
		limit = PAGE;
	});
	// keep the selected class in the URL hash (#Bhvadi) so lessons can link to it
	$effect(() => {
		const h = gana ? '#' + gana : '';
		if (dhatus.length && location.hash !== h) replaceState(h || location.pathname, {});
	});

	onMount(() => {
		const h = decodeURIComponent(location.hash.slice(1));
		if ((GANAS as readonly string[]).includes(h)) gana = h;
		loadDhatus()
			.then((ds) => (dhatus = ds))
			.catch((e) => (failed = e instanceof Error ? e.message : String(e)));
	});

	const TAG_LABEL: Record<string, string> = {
		idit: 'इँ', udit: 'उँ', ṛdit: 'ऋँ', ḷdit: 'ऌँ', īdit: 'ईँ', ūdit: 'ऊँ', ādit: 'आँ', ṅit: 'ङ्', ñit: 'ञ्', ṣit: 'ष्', ḍvit: 'डु', ṭvit: 'टु', ñīt: 'ञि', irit: 'इर्', mit: 'म्', kit: 'क्', ṇit: 'ण्', pit: 'प्', śit: 'श्', lit: 'ल्', cit: 'च्', ṭit: 'ट्'
	};
	const derive = (d: Dhatu) => resolve('/tools/prakriya') + '/#' + tinantaHash(d.c, 'Lat', 'Kartari', 'Prathama', 'Eka');
	const padaOf = (d: Dhatu) => (d.g === 'Curadi' ? null : PADA_INFO[padaMarker(d)]);
</script>

<svelte:head><title>Dhātupāṭha browser · Aṣṭādhyāyī Explorer</title></svelte:head>

<div class="wrap page">
	<p class="eyebrow">Tool</p>
	<h1>Dhātupāṭha browser <span class="deva sa">धातुपाठः</span></h1>
	<p class="lede">
		Every root in vidyut's Dhātupāṭha, the list that <SutraRef n="1.3.1" s="भूवादयो धातवः" /> points to. Roots are shown in their teaching form with
		their tags (it-letters) in pink; hover a tag for the rule that marks it. <a href={resolve('/learn') + '/dhatus/'}>Lesson: where words come from →</a>
	</p>

	<section class="stats card" aria-label="Summary">
		<div class="big">
			<span class="n">{data.total.toLocaleString()}</span>
			<span class="muted">entries · {data.distinct.toLocaleString()} distinct teaching forms</span>
		</div>
		<div class="pada">
			<p class="eyebrow">What the markers say about endings <span class="muted">(the {data.nonCuradi.toLocaleString()} non-curādi roots)</span></p>
			<ul>
				{#each ['P', 'A', 'U'] as const as k (k)}
					<li><b>{data.pada[k].toLocaleString()}</b> {PADA_INFO[k].label} <SutraRef n={PADA_INFO[k].n} /></li>
				{/each}
			</ul>
			<p class="muted small">Ātmanepada: a ङ् tag or a low-pitched tag vowel. Both: a ञ् tag or a svarita tag vowel. The rest default to parasmaipada. A few roots have special rules (e.g. शद्, 1.3.60).</p>
		</div>
	</section>

	<div class="filters">
		<div class="chips" role="group" aria-label="Filter by class">
			<button class="chip" aria-pressed={gana === null} onclick={() => (gana = null)}>All <span class="c">{data.total}</span></button>
			{#each GANAS as g, i (g)}
				<button class="chip" aria-pressed={gana === g} onclick={() => (gana = gana === g ? null : g)} title={GANA_IAST[g]}>
					<span class="no">{i + 1}</span> <span class="deva">{GANA_SA[g]}</span> <span class="c">{data.ganas[g]}</span>
				</button>
			{/each}
		</div>
		<div class="chips tags" role="group" aria-label="Filter by tag">
			<span class="muted lbl">tag:</span>
			{#each data.tags as [t, n] (t)}
				<button class="chip sm" aria-pressed={tag === t} onclick={() => (tag = tag === t ? null : t)} title="{n} roots are {t}">
					<span class="deva it">{TAG_LABEL[t] ?? ''}</span> {t} <span class="c">{n}</span>
				</button>
			{/each}
		</div>
		<input class="search" bind:value={q} type="search" placeholder="Search: गम्, gam, gamx, गतौ, to go, जाना, 01.1137" aria-label="Search roots" />
	</div>

	{#if failed}
		<p class="err">Could not load the root list: {failed}</p>
	{:else if !dhatus.length}
		<p class="muted">Loading roots…</p>
	{:else}
		<p class="muted count" aria-live="polite">{filtered.length.toLocaleString()} roots{gana ? ` in ${GANA_IAST[gana]}` : ''}{tag ? `, ${tag}` : ''}{q.trim() ? ` matching "${q.trim()}"` : ''}</p>
		<ul class="rows">
			{#each shown as { d } (d.c)}
				{@const p = padaOf(d)}
				<li class="row">
					<span class="code">{d.c}</span>
					<span class="up"><ItWord text={d.d} ctx="dhatu" /></span>
					<span class="nf"><span class="deva">{d.n}</span>{#if settings.iast} <span class="iast">{devaToIast(d.n)}</span>{/if}</span>
					<span class="m"><DhatuSenses {d} /></span>
					<span class="meta">
						<span class="deva">{GANA_SA[d.g]}</span>{#if d.ag} · <span class="deva">{ANTAR_SA[d.ag] ?? d.ag}</span>{/if}
						{#if p}<span class="pd" title={p.label}>{p.short}</span>{/if}
					</span>
					<a class="go" href={derive(d)}>derive →</a>
				</li>
			{/each}
		</ul>
		{#if filtered.length > limit}
			<button class="btn more" onclick={() => (limit += PAGE * 4)}>Show more ({(filtered.length - limit).toLocaleString()} left)</button>
		{/if}
	{/if}

	<p class="muted foot">
		Data: vidyut's Dhātupāṭha (ambuda-org/vidyut) and the English and Hindi meanings from ashtadhyayi.com. Each language lists its own senses, so they can differ. Printed editions count roots differently, so you'll see totals near 2,000
		elsewhere. Codes are class.number. P/Ā/U is what the root's own markers predict.
		{#if ANUBANDHA_TOOL}Decode any upadeśa in the <a href={resolve('/tools') + '/anubandha/'}>it-letter tool</a>.{/if}
	</p>
</div>

<style>
	.page {
		padding-top: 32px;
		padding-bottom: 48px;
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
		max-width: 46em;
	}
	.stats {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: 18px 32px;
		padding: 16px 20px;
		margin-top: 16px;
	}
	.big {
		display: flex;
		flex-direction: column;
		font-size: 13px;
	}
	.big .n {
		font-size: 40px;
		font-weight: 700;
		line-height: 1.1;
		color: var(--saffron-ink);
	}
	.pada p {
		margin: 0;
	}
	.pada ul {
		list-style: none;
		margin: 6px 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 4px 20px;
		font-size: 14.5px;
	}
	.small {
		font-size: 12.5px;
	}
	.filters {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 18px 0 8px;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		align-items: center;
	}
	.chip {
		display: inline-flex;
		align-items: baseline;
		gap: 5px;
		padding: 4px 10px;
		border-radius: 999px;
		border: 1px solid var(--line);
		background: var(--surface);
		color: var(--ink);
		cursor: pointer;
		font-size: 14px;
	}
	.chip.sm {
		font-size: 12.5px;
		padding: 2px 8px;
	}
	.chip:hover {
		border-color: var(--saffron);
	}
	.chip[aria-pressed='true'] {
		background: var(--saffron-soft);
		border-color: var(--saffron);
	}
	.chip .c {
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--muted);
	}
	.chip .no {
		font-family: var(--font-mono);
		font-size: 10.5px;
		color: var(--muted);
	}
	.chip .it {
		color: var(--it);
	}
	.lbl {
		font-size: 12.5px;
	}
	.search {
		max-width: 420px;
		padding: 9px 12px;
		border-radius: 8px;
		border: 1px solid var(--line);
		background: var(--surface);
		color: var(--ink);
		font: inherit;
		font-family: var(--font-ui), var(--font-deva);
	}
	.count {
		font-size: 13px;
	}
	.rows {
		list-style: none;
		margin: 0;
		padding: 0;
		border-top: 1px solid var(--line);
	}
	.row {
		display: grid;
		grid-template-columns: 64px minmax(110px, 1.1fr) minmax(70px, 0.6fr) minmax(0, 2fr) minmax(120px, 1fr) auto;
		gap: 12px;
		align-items: baseline;
		padding: 7px 6px;
		border-bottom: 1px solid var(--line);
	}
	.row:hover {
		background: var(--surface-2);
	}
	.code {
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--muted);
	}
	.up {
		font-size: 20px;
	}
	.nf {
		font-size: 16px;
	}
	.iast {
		font-size: 13px;
		color: var(--muted);
	}
	.m {
		font-size: 14.5px;
		color: var(--ink-2);
	}
	.meta {
		font-size: 13px;
		color: var(--muted);
	}
	.pd {
		display: inline-block;
		margin-left: 6px;
		min-width: 1.6em;
		padding: 0 4px;
		border-radius: 4px;
		background: var(--surface-3);
		color: var(--ink-2);
		font-size: 11px;
		font-weight: 600;
		text-align: center;
	}
	.go {
		font-size: 13px;
		white-space: nowrap;
	}
	.more {
		margin-top: 14px;
	}
	.err {
		color: var(--r-target);
	}
	.foot {
		margin-top: 24px;
		font-size: 12.5px;
		max-width: 60em;
	}
	@media (max-width: 760px) {
		.stats {
			grid-template-columns: 1fr;
		}
		/* one scrollable line per chip row, so the list starts near the top */
		.chips {
			flex-wrap: nowrap;
			overflow-x: auto;
			padding-bottom: 4px;
			scrollbar-width: thin;
		}
		.chip {
			flex: none;
		}
		.row {
			grid-template-columns: auto minmax(0, 1fr) auto;
			grid-template-areas: 'up nf go' 'm m m' 'code meta meta';
			gap: 2px 10px;
		}
		.up {
			grid-area: up;
		}
		.nf {
			grid-area: nf;
		}
		.go {
			grid-area: go;
		}
		.m {
			grid-area: m;
		}
		.code {
			grid-area: code;
		}
		.meta {
			grid-area: meta;
		}
	}
</style>
