<script lang="ts">
	import { resolve } from '$app/paths';
	import { ui } from '#lib/ui.svelte.ts';
	import { settings } from '#lib/settings.svelte.ts';
	import { sutraHref, adhyayaHref } from '#lib/links.ts';
	import RuleFormula from '#lib/components/RuleFormula.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const areas = [
		{ href: resolve('/adhyaya/[a]', { a: '1' }) + '/', title: 'Sūtra Explorer', sa: 'सूत्रपाठः', body: 'All 3,983 sūtras, word by word: case roles, inherited words, headings, commentaries.' },
		{ href: resolve('/learn') + '/', title: 'Learn', sa: 'शिक्षा', body: 'Animated explainers for the core machinery: Śiva sūtras, how to read a sūtra, anuvṛtti.' },
		{ href: resolve('/tools') + '/', title: 'Tools', sa: 'उपकरणानि', body: 'A pratyāhāra calculator and a step-by-step derivation debugger.' },
		{ href: resolve('/cs') + '/', title: 'Pāṇini & Computer Science', sa: 'पाणिनिः गणकशास्त्रं च', body: 'Rewrite rules, metarules, rule ordering, and a toy rule engine you can run.' }
	];
</script>

<svelte:head>
	<title>Aṣṭādhyāyī Explorer: Pāṇini's grammar, interactive</title>
</svelte:head>

<section class="hero">
	<div class="wrap hero-grid">
		<div class="intro">
			<p class="eyebrow">Pāṇini · c. 4th century BCE</p>
			<h1>
				The <span class="deva">अष्टाध्यायी</span>,<br />explorable.
			</h1>
			<p class="lede">
				Eight chapters, 3,983 sūtras, one of the most compact rule systems ever written. Look up any sūtra, see how
				its words work, follow the threads between rules, and learn the machinery underneath.
			</p>
			<button class="fake-search" onclick={() => (ui.searchOpen = true)}>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
				<span>Try <b>6.1.77</b>, <b class="deva">इको यणचि</b>, <b>vrddhi</b> or <b>substitute</b></span>
				<kbd>/</kbd>
			</button>
			<div class="stats">
				<span><b>3,983</b> sūtras</span>
				<span><b>8</b> adhyāyas</span>
				<span><b>32</b> pādas</span>
				<span><b>14</b> Śiva sūtras</span>
			</div>
		</div>

		<a class="featured card" href={sutraHref(data.featured.n)}>
			<span class="eyebrow">Featured · {data.featured.n}</span>
			<span class="fs deva">{data.featured.s}</span>
			{#if settings.iast}<span class="iast">{data.featured.iast}</span>{/if}
			<span class="fen">{data.featured.en}</span>
			<RuleFormula pc={data.featured.pc} />
			<span class="go">Open the sūtra →</span>
		</a>
	</div>
</section>

<section class="wrap areas">
	{#each areas as a (a.title)}
		<a class="area card" href={a.href}>
			<span class="sa deva">{a.sa}</span>
			<h2>{a.title}</h2>
			<p>{a.body}</p>
		</a>
	{/each}
</section>

<section class="wrap landmarks">
	<h2>Landmark sūtras</h2>
	<p class="muted">A first walk through the text: eight sūtras that show how the whole system works.</p>
	<ol>
		{#each data.landmarks as l (l.id)}
			<li>
				<a href={sutraHref(l.n)} class="card">
					<span class="n">{l.n}</span>
					<span class="ls deva">{l.s}</span>
					<span class="why">{l.why}</span>
				</a>
			</li>
		{/each}
	</ol>
</section>

<section class="wrap chapters">
	<h2>Browse by adhyāya</h2>
	<div class="ch-grid">
		{#each [1, 2, 3, 4, 5, 6, 7, 8] as a (a)}
			<a href={adhyayaHref(a)} class="ch">{a}</a>
		{/each}
	</div>
</section>

<style>
	.hero {
		padding: 56px 0 40px;
		background:
			radial-gradient(1200px 400px at 85% -10%, color-mix(in srgb, var(--saffron) 12%, transparent), transparent 70%),
			radial-gradient(900px 400px at -10% 110%, color-mix(in srgb, var(--indigo) 10%, transparent), transparent 70%);
	}
	.hero-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
		gap: 48px;
		align-items: center;
	}
	h1 {
		font-size: clamp(38px, 6vw, 64px);
		line-height: 1.12;
		margin: 6px 0 18px;
	}
	h1 .deva {
		color: var(--saffron);
		font-weight: 700;
		line-height: 1;
		display: inline-block;
		padding-top: 0.08em;
	}
	.lede {
		font-family: var(--font-serif);
		font-size: 19px;
		color: var(--ink-2);
		max-width: 34em;
	}
	.fake-search {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		max-width: 540px;
		margin-top: 22px;
		padding: 14px 16px;
		border-radius: 14px;
		border: 1px solid var(--line);
		background: var(--surface);
		box-shadow: var(--shadow);
		color: var(--muted);
		cursor: text;
		text-align: left;
		font-size: 15px;
	}
	.fake-search:hover {
		border-color: var(--saffron);
	}
	.fake-search span {
		flex: 1;
	}
	.fake-search b {
		color: var(--ink-2);
		font-weight: 600;
	}
	kbd {
		font-family: var(--font-mono);
		font-size: 11px;
		border: 1px solid var(--line);
		border-radius: 4px;
		padding: 0 5px;
	}
	.stats {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 22px;
		margin-top: 22px;
		color: var(--muted);
		font-size: 14px;
	}
	.stats b {
		color: var(--ink);
		font-size: 17px;
		font-family: var(--font-serif);
	}
	.featured {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 24px;
		text-decoration: none;
		color: inherit;
		transition: transform 0.2s, box-shadow 0.2s;
	}
	.featured:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}
	.fs {
		font-size: 44px;
		font-weight: 600;
		line-height: 1.4;
	}
	.fen {
		font-family: var(--font-serif);
		color: var(--ink-2);
		margin-bottom: 6px;
	}
	.go {
		color: var(--indigo);
		font-weight: 600;
		font-size: 14px;
	}
	.areas {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 16px;
		margin-top: 24px;
	}
	.area {
		padding: 20px;
		text-decoration: none;
		color: inherit;
		transition: border-color 0.15s, transform 0.15s;
	}
	.area:hover {
		border-color: var(--saffron);
		transform: translateY(-2px);
	}
	.area .sa {
		color: var(--saffron-ink);
		font-size: 15px;
	}
	.area h2 {
		font-size: 20px;
		margin: 2px 0 6px;
	}
	.area p {
		margin: 0;
		color: var(--ink-2);
		font-size: 14.5px;
	}
	.landmarks,
	.chapters {
		margin-top: 56px;
	}
	.landmarks h2,
	.chapters h2 {
		font-size: 28px;
		margin-bottom: 4px;
	}
	.landmarks ol {
		list-style: none;
		padding: 0;
		margin: 18px 0 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 14px;
	}
	.landmarks a {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 16px 18px;
		text-decoration: none;
		color: inherit;
	}
	.landmarks a:hover {
		border-color: var(--indigo);
	}
	.n {
		font-family: var(--font-mono);
		font-size: 12.5px;
		color: var(--saffron-ink);
	}
	.ls {
		font-size: 22px;
		line-height: 1.5;
	}
	.why {
		font-size: 14px;
		color: var(--ink-2);
	}
	.ch-grid {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		gap: 10px;
		margin-top: 14px;
	}
	.ch {
		display: grid;
		place-items: center;
		aspect-ratio: 1;
		border-radius: 14px;
		border: 1px solid var(--line);
		background: var(--surface);
		font-family: var(--font-serif);
		font-size: 26px;
		font-weight: 600;
		color: var(--ink);
		text-decoration: none;
	}
	.ch:hover {
		background: var(--saffron);
		color: #fff;
		border-color: var(--saffron);
	}
	@media (max-width: 900px) {
		.hero-grid {
			grid-template-columns: minmax(0, 1fr);
			gap: 28px;
		}
		.areas {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 560px) {
		.hero {
			padding-top: 32px;
		}
		.areas {
			grid-template-columns: minmax(0, 1fr);
		}
		.ch-grid {
			grid-template-columns: repeat(4, 1fr);
		}
		.fake-search span {
			font-size: 14px;
		}
	}
</style>
