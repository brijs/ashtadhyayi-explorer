<script lang="ts">
	import { goto } from '$app/navigation';
	import { settings } from '#lib/settings.svelte.ts';
	import { sutraHref, adhyayaHref, withBase } from '#lib/links.ts';
	import { ROLE_INFO, type Role } from '#lib/types.ts';
	import PadaChip from '#lib/components/PadaChip.svelte';
	import TypeBadge from '#lib/components/TypeBadge.svelte';
	import RuleFormula from '#lib/components/RuleFormula.svelte';
	import AnuvrittiReading from '#lib/components/AnuvrittiReading.svelte';
	import { resolve } from '$app/paths';
	import { EXPLAINERS, CS_LESSONS, TOOLS } from '#lib/catalog.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const s = $derived(data.sutra);
	const refs = $derived(data.refs);
	const ref = (id: string | null) => (id ? refs[id] : undefined);

	const lessons = $derived([
		...EXPLAINERS.map((l) => ({ ...l, href: resolve('/learn') + `/${l.slug}/`, kind: 'Explainer' })),
		...TOOLS.map((l) => ({ ...l, href: resolve('/tools') + `/${l.slug}/`, kind: 'Tool' })),
		...CS_LESSONS.map((l) => ({ ...l, href: resolve('/cs') + `/${l.slug}/`, kind: 'Pāṇini & CS' }))
	].filter((l) => l.status === 'ready' && l.sutras.includes(s.n)));

	type Tab = 'en' | 'kashika' | 'kaumudi' | 'vartika' | 'prayoga';
	let tab = $state<Tab>('en');
	let showAllPasses = $state(false);
	$effect(() => {
		s.id;
		tab = 'en';
		showAllPasses = false;
	});

	const tabs = $derived(
		[
			{ id: 'en' as Tab, label: 'English', sub: 'Vasu', show: !!s.enVasu },
			{ id: 'kashika' as Tab, label: 'काशिका', sub: 'Kāśikā', show: !!s.kashika },
			{ id: 'kaumudi' as Tab, label: 'सिद्धान्तकौमुदी', sub: s.skn ? `SK ${s.skn}` : 'SK', show: !!s.kaumudi },
			{ id: 'vartika' as Tab, label: 'वार्तिक', sub: `${s.vartikas.length}`, show: s.vartikas.length > 0 },
			{ id: 'prayoga' as Tab, label: 'In literature', sub: `${s.prayogas.length}`, show: s.prayogas.length > 0 }
		].filter((t) => t.show)
	);

	// group inherited words by the sūtra they come from
	const inherits = $derived(
		Object.entries(Object.groupBy(s.an, (x) => x.id)).map(([id, xs]) => ({ id, words: xs!.map((x) => x.w) }))
	);
	const rolesUsed = $derived([...new Set(s.pc.map((p) => p.role))] as Role[]);

	function onKey(e: KeyboardEvent) {
		const t = e.target as HTMLElement;
		if (t.closest('input, textarea, select, dialog') || e.metaKey || e.ctrlKey || e.altKey) return;
		const prev = ref(s.prev);
		const next = ref(s.next);
		if ((e.key === 'ArrowLeft' || e.key === 'k') && prev) goto(sutraHref(prev.n));
		if ((e.key === 'ArrowRight' || e.key === 'j') && next) goto(sutraHref(next.n));
	}
</script>

<svelte:head>
	<title>{s.n} {s.s} · Aṣṭādhyāyī Explorer</title>
	<meta name="description" content="Pāṇini {s.n} {s.s} ({s.iast}): {s.en}" />
</svelte:head>

<svelte:window onkeydown={onKey} />

<article class="wrap page">
	<nav class="crumbs" aria-label="Location">
		<a href={adhyayaHref(s.a)}>Adhyāya {s.a}</a>
		<span aria-hidden="true">›</span>
		<a href={adhyayaHref(s.a, s.p)}>Pāda {s.p}</a>
		<span aria-hidden="true">›</span>
		<span>Sūtra {s.k}</span>
	</nav>

	<header class="hero">
		<div class="num">{s.n}</div>
		<h1 class="sutra deva">{s.s}</h1>
		{#if settings.iast}<p class="sutra-iast iast">{s.iast}</p>{/if}
		<div class="badges">
			{#each s.types as t, i (i)}<TypeBadge code={t.code} label={t.label} />{/each}
		</div>
		<p class="meaning">{s.en}</p>
	</header>

	<div class="grid">
		<div class="main">
			<section class="block" aria-labelledby="pc-h">
				<h2 id="pc-h" class="eyebrow">Word by word <span class="muted">(padaccheda)</span></h2>
				<div class="chips">
					{#each s.pc as p, i (i)}
						<PadaChip pada={p} terms={data.terms} {refs} />
					{/each}
				</div>
				<ul class="legend" aria-label="What the colours mean">
					{#each rolesUsed as r (r)}
						<li style="--c: var(--r-{r})"><span class="dot"></span><b>{ROLE_INFO[r].label}</b> {ROLE_INFO[r].explain}</li>
					{/each}
				</ul>
				{#if Object.keys(data.terms).length}
					<p class="muted tip">Dotted words are technical terms. Tap one to see its definition.</p>
				{/if}
			</section>

			<section class="block">
				<AnuvrittiReading pc={s.pc} an={s.an} ad={s.ad} ss={s.ss} ssIast={s.ssIast} {refs} />
			</section>

			<RuleFormula pc={s.pc} />

			<section class="block commentary" aria-labelledby="com-h">
				<h2 id="com-h" class="eyebrow">Commentary</h2>
				<div class="tabs" role="tablist">
					{#each tabs as t (t.id)}
						<button role="tab" aria-selected={tab === t.id} aria-controls="panel-{t.id}" onclick={() => (tab = t.id)}>
							<span class={t.label.match(/[ऀ-ॿ]/) ? 'deva' : ''}>{t.label}</span>
							<small>{t.sub}</small>
						</button>
					{/each}
				</div>
				<div class="panel" role="tabpanel" id="panel-{tab}">
					{#if tab === 'en'}
						<div class="rich prose">{@html withBase(s.enVasu)}</div>
						<p class="src muted">Śrīśa Chandra Vasu, <i>The Ashtadhyayi of Panini</i> (1897), via ashtadhyayi.com.</p>
					{:else if tab === 'kashika'}
						<div class="rich deva sa">{@html withBase(s.kashika)}</div>
					{:else if tab === 'kaumudi'}
						<div class="rich deva sa">{@html withBase(s.kaumudi)}</div>
					{:else if tab === 'vartika'}
						<ol class="vartikas">
							{#each s.vartikas as v, i (i)}<li class="deva">{v}</li>{/each}
						</ol>
					{:else if tab === 'prayoga'}
						<ul class="prayogas">
							{#each s.prayogas as p, i (i)}
								<li>
									<span class="pw deva">{p.word}</span>
									<span class="pp deva">{p.pada}</span>
									<span class="pr rich deva">{@html withBase(p.ref)}</span>
									<a href={p.url} rel="noopener" target="_blank">{p.text} {p.loc} ↗</a>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</section>
		</div>

		<aside class="side" aria-label="Context">
			{#if lessons.length}
				<section class="learn">
					<h3 class="eyebrow">Explained in</h3>
					{#each lessons as l (l.href)}
						<a href={l.href}><small>{l.kind}</small>{l.title} →</a>
					{/each}
				</section>
			{/if}
			{#if s.ad.length}
				<section>
					<h3 class="eyebrow">Under the heading</h3>
					<ol class="chain">
						{#each s.ad as x, i (i)}
							<li>
								<a href={sutraHref(ref(x.id)?.n ?? '')}>
									<span class="deva">{x.w}</span>
									<span class="n">{ref(x.id)?.n}</span>
								</a>
							</li>
						{/each}
					</ol>
				</section>
			{/if}

			{#if s.scope}
				<section>
					<h3 class="eyebrow">Heading scope</h3>
					<p>
						Its words govern <b>{s.scope.count}</b> sūtras, from
						<a href={sutraHref(ref(s.scope.from)?.n ?? '')}>{ref(s.scope.from)?.n}</a> to
						<a href={sutraHref(ref(s.scope.to)?.n ?? '')}>{ref(s.scope.to)?.n}</a>.
					</p>
				</section>
			{/if}

			{#if s.an.length}
				<section>
					<h3 class="eyebrow">Inherits words from</h3>
					<ul class="links">
						{#each inherits as x (x.id)}
							<li>
								<a href={sutraHref(ref(x.id)?.n ?? '')}><span class="n">{ref(x.id)?.n}</span> <span class="deva">{ref(x.id)?.s}</span></a>
								<span class="carry">carries <span class="deva">{x.words.join(', ')}</span></span>
							</li>
						{/each}
					</ul>
				</section>
			{/if}

			{#if s.passesTo.length}
				<section>
					<h3 class="eyebrow">Passes words down to <span class="count">{s.passesTo.length}</span></h3>
					<ul class="links">
						{#each showAllPasses ? s.passesTo : s.passesTo.slice(0, 8) as id (id)}
							<li><a href={sutraHref(ref(id)?.n ?? '')}><span class="n">{ref(id)?.n}</span> <span class="deva">{ref(id)?.s}</span></a></li>
						{/each}
					</ul>
					{#if s.passesTo.length > 8}
						<button class="more" onclick={() => (showAllPasses = !showAllPasses)}>{showAllPasses ? 'Show fewer' : `Show all ${s.passesTo.length}`}</button>
					{/if}
				</section>
			{/if}

			{#if s.skn || s.lskn}
				<section>
					<h3 class="eyebrow">Kaumudī numbers</h3>
					<p class="small">
						{#if s.skn}Siddhānta Kaumudī <b>{s.skn}</b>{/if}{#if s.skn && s.lskn}<br />{/if}
						{#if s.lskn}Laghu Kaumudī <b>{s.lskn}</b>{/if}
					</p>
				</section>
			{/if}

			<section>
				<a class="ext" href="https://ashtadhyayi.com/sutraani/{s.a}/{s.p}/{s.k}" rel="noopener" target="_blank">Open on ashtadhyayi.com ↗</a>
			</section>
		</aside>
	</div>

	<nav class="pager" aria-label="Neighbouring sūtras">
		{#if ref(s.prev)}
			{@const p = ref(s.prev)!}
			<a class="prev" href={sutraHref(p.n)} rel="prev">
				<span class="dir">← {p.n}</span><span class="deva">{p.s}</span>
			</a>
		{:else}<span></span>{/if}
		{#if ref(s.next)}
			{@const nx = ref(s.next)!}
			<a class="next" href={sutraHref(nx.n)} rel="next">
				<span class="dir">{nx.n} →</span><span class="deva">{nx.s}</span>
			</a>
		{/if}
	</nav>
</article>

<style>
	.page {
		padding-top: 20px;
	}
	.crumbs {
		display: flex;
		gap: 8px;
		font-size: 13.5px;
		color: var(--muted);
		flex-wrap: wrap;
	}
	.crumbs a {
		color: var(--ink-2);
		text-decoration: none;
	}
	.crumbs a:hover {
		color: var(--indigo);
		text-decoration: underline;
	}
	.hero {
		padding: 28px 0 24px;
		border-bottom: 1px solid var(--line);
		margin-bottom: 28px;
	}
	.num {
		font-family: var(--font-mono);
		font-size: 15px;
		color: var(--saffron-ink);
		letter-spacing: 0.04em;
	}
	.sutra {
		font-family: var(--font-deva);
		font-size: clamp(34px, 6vw, 56px);
		font-weight: 600;
		line-height: 1.45;
		margin: 4px 0 0;
		letter-spacing: 0;
		overflow-wrap: anywhere;
	}
	.sutra-iast {
		font-size: clamp(18px, 2.6vw, 24px);
		margin: 0 0 6px;
	}
	.badges {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 10px 0 14px;
	}
	.meaning {
		font-family: var(--font-serif);
		font-size: clamp(18px, 2.2vw, 21px);
		line-height: 1.55;
		max-width: 52em;
		margin: 0;
		color: var(--ink);
	}
	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 300px;
		gap: 40px;
		align-items: start;
	}
	.main {
		display: flex;
		flex-direction: column;
		gap: 32px;
		min-width: 0;
	}
	.block h2 {
		margin-bottom: 12px;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}
	.legend {
		list-style: none;
		padding: 0;
		margin: 14px 0 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 13.5px;
		color: var(--ink-2);
	}
	.legend .dot {
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--c);
		margin-right: 8px;
	}
	.legend b {
		color: var(--c);
		margin-right: 4px;
	}
	.tip {
		font-size: 13px;
		margin: 8px 0 0;
	}
	.tabs {
		display: flex;
		gap: 4px;
		border-bottom: 1px solid var(--line);
		overflow-x: auto;
		scrollbar-width: thin;
	}
	.tabs button {
		display: flex;
		align-items: baseline;
		gap: 6px;
		padding: 8px 14px;
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		margin-bottom: -1px;
		cursor: pointer;
		color: var(--ink-2);
		white-space: nowrap;
		font-size: 15px;
	}
	.tabs button small {
		font-size: 11.5px;
		color: var(--muted);
	}
	.tabs button[aria-selected='true'] {
		color: var(--ink);
		border-bottom-color: var(--saffron);
		font-weight: 600;
	}
	.panel {
		padding-top: 18px;
	}
	.prose {
		font-family: var(--font-serif);
		font-size: 17px;
		line-height: 1.7;
		max-width: 46em;
	}
	.prose :global(i) {
		color: var(--ink-2);
	}
	.rich.sa {
		font-size: 18px;
		line-height: 1.9;
		max-width: 42em;
	}
	.src {
		font-size: 12.5px;
		margin-top: 14px;
	}
	.vartikas {
		padding-left: 22px;
		font-size: 18px;
	}
	.prayogas {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.prayogas li {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 12px 14px;
		border-radius: 8px;
		background: var(--surface-2);
	}
	.pw {
		font-size: 19px;
		font-weight: 600;
	}
	.pp {
		color: var(--ink-2);
	}
	.pr {
		font-size: 15px;
		color: var(--ink-2);
	}
	.prayogas a {
		font-size: 13px;
	}
	.side {
		display: flex;
		flex-direction: column;
		gap: 22px;
		position: sticky;
		top: 80px;
		font-size: 14.5px;
	}
	.side h3 {
		font-family: var(--font-ui);
		margin-bottom: 6px;
	}
	.side p {
		margin: 0;
	}
	.chain {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.chain li {
		padding-left: 14px;
		border-left: 2px solid var(--saffron);
	}
	.chain a,
	.links a {
		text-decoration: none;
		color: var(--ink);
	}
	.chain a:hover .deva,
	.links a:hover .deva {
		color: var(--indigo);
	}
	.n {
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--saffron-ink);
		margin-left: 4px;
	}
	.links .n {
		margin: 0 4px 0 0;
	}
	.links {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.carry {
		display: block;
		font-size: 12.5px;
		color: var(--muted);
	}
	.count {
		font-family: var(--font-mono);
		background: var(--surface-2);
		border-radius: 999px;
		padding: 0 7px;
		margin-left: 4px;
		letter-spacing: 0;
	}
	.more {
		margin-top: 6px;
		background: none;
		border: none;
		padding: 0;
		color: var(--indigo);
		cursor: pointer;
		font-size: 13.5px;
	}
	.small {
		font-size: 13.5px;
	}
	.learn {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.learn a {
		display: flex;
		flex-direction: column;
		padding: 8px 12px;
		border-radius: 10px;
		background: var(--saffron-soft);
		color: var(--saffron-ink);
		text-decoration: none;
		font-weight: 600;
	}
	.learn small {
		font-size: 11px;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		opacity: 0.8;
	}
	.ext {
		font-size: 13.5px;
	}
	.pager {
		display: flex;
		justify-content: space-between;
		gap: 16px;
		margin-top: 48px;
		padding-top: 20px;
		border-top: 1px solid var(--line);
	}
	.pager a {
		display: flex;
		flex-direction: column;
		padding: 10px 16px;
		border-radius: var(--radius);
		border: 1px solid var(--line);
		background: var(--surface);
		text-decoration: none;
		color: var(--ink);
		max-width: 48%;
	}
	.pager a:hover {
		border-color: var(--saffron);
	}
	.pager .next {
		text-align: right;
		margin-left: auto;
	}
	.dir {
		font-family: var(--font-mono);
		font-size: 12.5px;
		color: var(--muted);
	}
	.pager .deva {
		font-size: 18px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	@media (max-width: 900px) {
		.grid {
			grid-template-columns: minmax(0, 1fr);
		}
		.side {
			position: static;
			padding: 18px;
			border-radius: var(--radius);
			background: var(--surface-2);
		}
	}
</style>
