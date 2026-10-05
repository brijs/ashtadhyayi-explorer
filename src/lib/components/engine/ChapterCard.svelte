<script lang="ts">
	import { adhyayaHref } from '#lib/links.ts';
	import { BANDS, type Band } from '#lib/structure.ts';
	import SutraRef from '#lib/components/SutraRef.svelte';

	type K = { n: string; why: string; s: string };
	let {
		ad,
		onmap
	}: {
		ad: {
			a: number;
			band: Band;
			title: string;
			summary: string;
			count: number;
			headingSpans: { n: string; s: string; toN: string; count: number }[];
			keys: K[];
			padas: { p: number; band: Band; title: string; summary: string; count: number }[];
		};
		onmap: (a: number, p?: number) => void;
	} = $props();
</script>

<article class="ch card" id="adhyaya-{ad.a}" style="--c: var(--b-{ad.band})">
	<header>
		<span class="num">{ad.a}</span>
		<div>
			<h3>{ad.title}</h3>
			<span class="meta">{ad.count} sūtras · <span class="band">{BANDS[ad.band].short}</span></span>
		</div>
	</header>
	<p class="sum">{ad.summary}</p>
	{#if ad.headingSpans.some((h) => h.toN)}
		<ul class="heads">
			{#each ad.headingSpans.filter((h) => h.toN) as h (h.n)}
				<li><SutraRef n={h.n} s={h.s} /> <span class="muted">runs to {h.toN} · {h.count} sūtras</span></li>
			{/each}
		</ul>
	{/if}
	<ol class="padas">
		{#each ad.padas as p (p.p)}
			<li style="--pc: var(--b-{p.band})">
				<button class="pn" onclick={() => onmap(ad.a, p.p)} title="Show pāda {ad.a}.{p.p} on the map">{ad.a}.{p.p}</button>
				<div>
					<b>{p.title}</b> <span class="muted">· {p.count}</span>
					<p>{p.summary}</p>
				</div>
			</li>
		{/each}
	</ol>
	<footer>
		<a href={adhyayaHref(ad.a)}>All sūtras of adhyāya {ad.a} →</a>
		<button class="linkish" onclick={() => onmap(ad.a)}>On the map ↑</button>
	</footer>
</article>

<style>
	.ch {
		padding: 16px 18px;
		border-top: 4px solid var(--c);
		display: flex;
		flex-direction: column;
		gap: 10px;
		min-width: 0;
	}
	header {
		display: flex;
		gap: 12px;
		align-items: center;
	}
	.num {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		flex-shrink: 0;
		border-radius: 10px;
		background: color-mix(in srgb, var(--c) 14%, transparent);
		color: var(--c);
		font-family: var(--font-serif);
		font-size: 22px;
		font-weight: 700;
	}
	h3 {
		margin: 0;
		font-size: 19px;
	}
	.meta {
		font-size: 12.5px;
		color: var(--muted);
	}
	.band {
		color: var(--c);
		font-weight: 600;
	}
	.sum {
		margin: 0;
		font-size: 14.5px;
		color: var(--ink-2);
	}
	.heads {
		list-style: none;
		margin: 0;
		padding: 0;
		font-size: 13.5px;
		display: grid;
		gap: 2px;
	}
	.padas {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 8px;
	}
	.padas li {
		display: grid;
		grid-template-columns: 44px minmax(0, 1fr);
		gap: 8px;
		font-size: 13.5px;
	}
	.padas p {
		margin: 2px 0 0;
		color: var(--ink-2);
		font-size: 13px;
		line-height: 1.5;
	}
	.pn {
		height: 24px;
		border-radius: 6px;
		border: 1px solid color-mix(in srgb, var(--pc) 45%, transparent);
		background: color-mix(in srgb, var(--pc) 10%, transparent);
		color: var(--pc);
		font-family: var(--font-mono);
		font-size: 12px;
		font-weight: 700;
		cursor: pointer;
	}
	footer {
		margin-top: auto;
		display: flex;
		gap: 14px;
		flex-wrap: wrap;
		font-size: 13.5px;
		padding-top: 6px;
		border-top: 1px dashed var(--line);
	}
	.linkish {
		background: none;
		border: 0;
		padding: 0;
		color: var(--indigo);
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 2px;
		font-size: inherit;
	}
</style>
