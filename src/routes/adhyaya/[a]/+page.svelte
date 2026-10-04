<script lang="ts">
	import { settings } from '#lib/settings.svelte.ts';
	import { sutraHref, adhyayaHref } from '#lib/links.ts';
	import { devaToIast } from '#lib/translit.ts';
	import TypeBadge from '#lib/components/TypeBadge.svelte';
	import type { SutraType } from '#lib/types.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const headings = $derived(new Set(data.headings));
	const total = $derived(data.padas.reduce((n, p) => n + p.sutras.length, 0));

	let filter = $state<'all' | SutraType['code']>('all');
	const FILTERS: { id: 'all' | SutraType['code']; label: string }[] = [
		{ id: 'all', label: 'All' },
		{ id: 'S', label: 'Definitions' },
		{ id: 'P', label: 'Meta-rules' },
		{ id: 'AD', label: 'Headings' },
		{ id: 'AT', label: 'Extensions' },
		{ id: 'V', label: 'Operational' }
	];
	const show = (ty: string[]) => filter === 'all' || ty.includes(filter);
	const SA_NUM = ['', 'प्रथमः', 'द्वितीयः', 'तृतीयः', 'चतुर्थः', 'पञ्चमः', 'षष्ठः', 'सप्तमः', 'अष्टमः'];
</script>

<svelte:head>
	<title>Adhyāya {data.a} · Aṣṭādhyāyī Explorer</title>
</svelte:head>

<div class="wrap page">
	<nav class="adhyayas" aria-label="Adhyāyas">
		{#each [1, 2, 3, 4, 5, 6, 7, 8] as a (a)}
			<a href={adhyayaHref(a)} aria-current={a === data.a ? 'page' : undefined}>{a}</a>
		{/each}
	</nav>

	<header class="head">
		<p class="eyebrow">Adhyāya {data.a} of 8 · {total} sūtras</p>
		<h1><span class="deva">{SA_NUM[data.a]} अध्यायः</span></h1>
		<div class="filters" role="group" aria-label="Filter by sūtra type">
			{#each FILTERS as f (f.id)}
				<button class="btn" aria-pressed={filter === f.id} onclick={() => (filter = f.id)}>{f.label}</button>
			{/each}
		</div>
	</header>

	<nav class="padanav" aria-label="Pādas">
		{#each data.padas as p (p.p)}
			<a href="#pada-{p.p}">Pāda {p.p} <span class="muted">· {p.sutras.length}</span></a>
		{/each}
	</nav>

	{#each data.padas as p (p.p)}
		<section id="pada-{p.p}" class="pada">
			<h2>Pāda {data.a}.{p.p}</h2>
			<ol class="list">
				{#each p.sutras as s (s.id)}
					{#if show(s.ty)}
						<li class:heading={headings.has(s.id)}>
							<a href={sutraHref(s.n)}>
								<span class="n">{s.n}</span>
								<span class="body">
									<span class="s deva">{s.s}</span>
									{#if settings.iast}<span class="iast">{devaToIast(s.s)}</span>{/if}
									<span class="en">{s.en}</span>
								</span>
								<span class="ty">
									{#each s.ty.filter((t) => t !== 'V') as t (t)}<TypeBadge code={t as SutraType['code']} compact />{/each}
								</span>
							</a>
						</li>
					{/if}
				{/each}
			</ol>
		</section>
	{/each}
</div>

<style>
	.page {
		padding-top: 24px;
	}
	.adhyayas {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}
	.adhyayas a {
		display: grid;
		place-items: center;
		width: 38px;
		height: 38px;
		border-radius: 10px;
		border: 1px solid var(--line);
		background: var(--surface);
		color: var(--ink-2);
		text-decoration: none;
		font-weight: 600;
	}
	.adhyayas a[aria-current='page'] {
		background: var(--saffron);
		border-color: var(--saffron);
		color: #fff;
	}
	.head {
		padding: 24px 0 12px;
	}
	.head h1 {
		font-size: clamp(30px, 5vw, 42px);
		margin: 0 0 14px;
	}
	.head h1 .deva {
		font-weight: 600;
	}
	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.padanav {
		position: sticky;
		top: 60px;
		z-index: 5;
		display: flex;
		gap: 4px;
		padding: 10px 0;
		background: var(--bg);
		border-bottom: 1px solid var(--line);
		overflow-x: auto;
		max-width: 100%;
		min-width: 0;
		scrollbar-width: none;
	}
	.padanav a {
		padding: 4px 12px;
		border-radius: 999px;
		text-decoration: none;
		color: var(--ink-2);
		font-size: 14px;
		white-space: nowrap;
	}
	.padanav a:hover {
		background: var(--surface-2);
	}
	.pada {
		padding-top: 28px;
	}
	.pada h2 {
		font-size: 22px;
	}
	.list {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.list li {
		border-bottom: 1px solid var(--line);
	}
	.list li.heading {
		border-left: 3px solid var(--t-AD);
		background: color-mix(in srgb, var(--t-AD) 5%, transparent);
	}
	.list a {
		display: flex;
		gap: 16px;
		padding: 10px 8px;
		text-decoration: none;
		color: inherit;
		border-radius: 6px;
	}
	.list a:hover {
		background: var(--surface-2);
	}
	.n {
		font-family: var(--font-mono);
		font-size: 13px;
		color: var(--saffron-ink);
		min-width: 60px;
		padding-top: 5px;
	}
	.body {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}
	.s {
		font-size: 20px;
		line-height: 1.5;
	}
	.body .iast {
		font-size: 14px;
	}
	.en {
		font-size: 14px;
		color: var(--ink-2);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.ty {
		display: flex;
		gap: 4px;
		align-items: flex-start;
		padding-top: 6px;
	}
	@media (max-width: 600px) {
		.list a {
			gap: 10px;
		}
		.n {
			min-width: 48px;
		}
		.ty {
			display: none;
		}
	}
</style>
