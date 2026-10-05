<script lang="ts">
	import { onDestroy } from 'svelte';
	import { resolve } from '$app/paths';
	import { sutraHref } from '#lib/links.ts';
	import { settings } from '#lib/settings.svelte.ts';
	import { devaToIast } from '#lib/translit.ts';
	import { bandColor, bandLabel, BOOKKEEPING, flatten, SOURCE_LABEL, stepTitle, type EngineExample } from '#lib/engine/steps.ts';
	import Factory from './Factory.svelte';
	import HopChart from './HopChart.svelte';

	let {
		examples,
		groups,
		selected = $bindable(),
		idx = $bindable(0),
		onmap
	}: { examples: EngineExample[]; groups: Record<string, string>; selected: string; idx: number; onmap?: () => void } = $props();

	const ex = $derived(examples.find((e) => e.id === selected) ?? examples[0]);
	const steps = $derived(flatten(ex));
	const last = $derived(steps.length - 1);
	const cur = $derived(steps[Math.min(idx, last)]);
	let playing = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;
	let list: HTMLOListElement | undefined = $state();
	let speed = $state(1);

	const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
	const byGroup = $derived(Object.keys(groups).map((g) => ({ g, label: groups[g], items: examples.filter((e) => e.group === g) })));

	function pick(id: string) {
		selected = id;
		idx = 0;
		stop();
		if (!reduced()) play();
	}
	function go(i: number) {
		idx = Math.max(0, Math.min(last, i));
		// keep the current row visible inside the list without scrolling the page
		queueMicrotask(() => {
			const row = list?.querySelector<HTMLElement>('[aria-current="step"]');
			if (!row || !list) return;
			const top = row.offsetTop; // the list is position: relative
			if (top < list.scrollTop || top + row.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = top - list.clientHeight / 2;
		});
	}
	function tick() {
		if (idx >= last) return stop();
		go(idx + 1);
		// linger on steps that change the word's shape; hurry through marker bookkeeping
		const st = steps[idx];
		const base = st && BOOKKEEPING.has(st.code) ? 550 : 1100;
		timer = setTimeout(tick, base / speed);
	}
	function play() {
		if (playing) return stop();
		if (idx >= last) idx = 0;
		playing = true;
		timer = setTimeout(tick, 500 / speed);
	}
	function stop() {
		playing = false;
		clearTimeout(timer);
	}
	onDestroy(stop);

	function onKey(e: KeyboardEvent) {
		if (e.key === 'ArrowRight') (e.preventDefault(), stop(), go(idx + 1));
		else if (e.key === 'ArrowLeft') (e.preventDefault(), stop(), go(idx - 1));
	}
	const inputLabel = $derived(`${ex.input.base} + ${ex.input.intent}`);
	const runOf = $derived(ex.runs[cur?.run ?? 0]);
</script>

<div class="runner">
	<div class="gallery" role="radiogroup" aria-label="Examples">
		{#each byGroup as grp (grp.g)}
			<div class="grp">
				<span class="eyebrow">{grp.label}</span>
				<div class="cards">
					{#each grp.items as e (e.id)}
						<button class="ex card" role="radio" aria-checked={e.id === ex.id} onclick={() => pick(e.id)}>
							<span class="w deva">{e.word}</span>
							<span class="gl">{e.iast} · {e.gloss}</span>
						</button>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<div class="detail card">
		<header class="dh">
			<div class="inputs">
				<span class="eyebrow">Input</span>
				<p>
					<b>{ex.input.base}</b> <span class="muted">({ex.input.baseNote})</span><br />
					<span class="intent">intent: {ex.input.intent}</span>
				</p>
			</div>
			<div class="out">
				<span class="eyebrow">Output</span>
				<span class="ow deva">{ex.word}</span>
				{#if settings.iast}<span class="iast">{devaToIast(ex.word)}</span>{/if}
			</div>
		</header>
		<p class="ill">{ex.illustrates}</p>

		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div class="controls" role="toolbar" aria-label="Step controls" tabindex="-1" onkeydown={onKey}>
			<button class="btn" onclick={() => (stop(), go(0))} aria-label="First step">⏮</button>
			<button class="btn" onclick={() => (stop(), go(idx - 1))} aria-label="Previous step" disabled={idx <= 0}>◀</button>
			<button class="btn primary" onclick={play} aria-label={playing ? 'Pause' : 'Play'}>{playing ? '❚❚ Pause' : '▶ Play'}</button>
			<button class="btn" onclick={() => (stop(), go(idx + 1))} aria-label="Next step" disabled={idx >= last}>▶</button>
			<button class="btn" onclick={() => (stop(), go(last))} aria-label="Last step">⏭</button>
			<label class="speed">speed <select bind:value={speed}><option value={0.5}>½×</option><option value={1}>1×</option><option value={2}>2×</option></select></label>
			<span class="count" aria-live="polite">step {idx + 1} / {steps.length}</span>
		</div>

		{#if cur}
			<div class="now" style="--c: {bandColor(cur.band)}">
				<div class="nl">
					<span class="nc">
						{#if cur.sutra}<a href={sutraHref(cur.code)}>{cur.code}</a>{:else}{SOURCE_LABEL[cur.source] ?? cur.source} {cur.code}{/if}
						<span class="band">{bandLabel(cur.band)}</span>
						{#if ex.runs.length > 1}<span class="run">run {cur.run + 1}: {runOf.label}</span>{/if}
					</span>
					{#if cur.s}<span class="ns deva">{cur.s}</span>{/if}
					{#if cur.sutra}<span class="nt">{stepTitle(cur)}</span>{/if}
					{#if cur.en}<span class="ne">{cur.en}</span>{/if}
				</div>
				<div class="nform deva" aria-live="polite">
					{#each cur.terms as t, j (j)}{#if j}<i>+</i>{/if}<b class:ch={t.ch}>{t.t}</b>{/each}
				</div>
			</div>
		{/if}

		<Factory {steps} {idx} {playing} input={inputLabel} />

		<div class="chart">
			<div class="ch-head">
				<span class="eyebrow">Chapter hops</span>
				<span class="muted">Each dot is one step; its height is the adhyāya of the rule that fired. Click a dot to jump there.</span>
			</div>
			<HopChart {steps} {idx} onselect={(i) => (stop(), go(i))} />
		</div>

		<details class="all" open>
			<summary>All {steps.length} steps</summary>
			<ol class="steps" bind:this={list}>
				{#each steps as st (st.i)}
					{#if st.handoff}<li class="handoff">handoff: {ex.runs[st.run - 1].word} becomes the input of run {st.run + 1} ({ex.runs[st.run].label})</li>{/if}
					<li aria-current={st.i === idx ? 'step' : undefined} class:book={BOOKKEEPING.has(st.code)}>
						<button class="row" onclick={() => (stop(), go(st.i))}>
							<span class="dot" style="background: {bandColor(st.band)}"></span>
							<span class="i">{st.i + 1}</span>
							<span class="c">{st.sutra ? st.code : (SOURCE_LABEL[st.source] ?? st.source)}</span>
							<span class="s deva">{st.s}</span>
							<span class="f deva">{st.terms.map((t) => t.t).join(' + ')}</span>
						</button>
						{#if st.sutra}<a class="go" href={sutraHref(st.code)} aria-label="Open sūtra {st.code}">↗</a>{/if}
					</li>
				{/each}
			</ol>
		</details>
		<div class="links">
			{#each ex.runs.filter((r) => r.hash) as r (r.label)}
				<a href={resolve('/tools/prakriya') + '/#' + r.hash}>Open {ex.runs.length > 1 ? r.word : 'it'} in the step debugger →</a>
			{/each}
			{#if onmap}<button class="linkish" onclick={onmap}>Show these sūtras on the map ↓</button>{/if}
		</div>
	</div>
</div>

<style>
	.runner {
		display: grid;
		gap: 18px;
		min-width: 0;
	}
	.gallery {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 12px 18px;
	}
	.grp {
		min-width: 0;
	}
	.cards {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 6px;
	}
	.ex {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding: 6px 12px;
		cursor: pointer;
		text-align: left;
		box-shadow: none;
	}
	.ex:hover {
		border-color: var(--saffron);
	}
	.ex[aria-checked='true'] {
		border-color: var(--saffron);
		background: var(--saffron-soft);
	}
	.ex .w {
		font-size: 20px;
		line-height: 1.4;
		font-weight: 600;
	}
	.ex .gl {
		font-size: 12px;
		color: var(--muted);
	}
	.detail {
		padding: 18px;
		display: grid;
		gap: 14px;
		min-width: 0;
	}
	.dh {
		display: flex;
		gap: 18px;
		justify-content: space-between;
		flex-wrap: wrap;
	}
	.inputs p {
		margin: 2px 0 0;
		font-size: 14.5px;
	}
	.intent {
		color: var(--ink-2);
	}
	.out {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}
	.ow {
		font-size: 34px;
		font-weight: 700;
		color: var(--r-subject);
		line-height: 1.3;
	}
	.ill {
		margin: 0;
		font-family: var(--font-serif);
		font-size: 16.5px;
		color: var(--ink-2);
	}
	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		align-items: center;
	}
	.controls .btn:disabled {
		opacity: 0.45;
		cursor: default;
	}
	.speed {
		font-size: 13px;
		color: var(--ink-2);
	}
	.speed select {
		font: inherit;
		background: var(--surface);
		color: var(--ink);
		border: 1px solid var(--line);
		border-radius: 6px;
	}
	.count {
		margin-left: auto;
		font-family: var(--font-mono);
		font-size: 12.5px;
		color: var(--muted);
	}
	.now {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 12px;
		align-items: center;
		padding: 10px 14px;
		border-radius: var(--radius-sm);
		border-left: 4px solid var(--c);
		background: color-mix(in srgb, var(--c) 7%, var(--surface));
		min-height: 104px;
	}
	.nl {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.nc {
		font-family: var(--font-mono);
		font-size: 13px;
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		align-items: baseline;
	}
	.nc a {
		font-weight: 700;
		text-decoration: none;
	}
	.band,
	.run {
		font-family: var(--font-ui);
		font-size: 11.5px;
		color: var(--c);
		font-weight: 600;
	}
	.run {
		color: var(--saffron-ink);
	}
	.ns {
		font-size: 19px;
	}
	.nt {
		font-size: 12.5px;
		color: var(--muted);
	}
	.ne {
		font-size: 13.5px;
		color: var(--ink-2);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.nform {
		font-size: 24px;
		white-space: nowrap;
	}
	.nform i {
		font-style: normal;
		color: var(--muted);
		margin: 0 4px;
	}
	.nform b {
		font-weight: 500;
	}
	.nform b.ch {
		color: var(--saffron-ink);
		font-weight: 700;
	}
	.ch-head {
		display: flex;
		gap: 10px;
		align-items: baseline;
		flex-wrap: wrap;
		font-size: 13px;
		margin-bottom: 4px;
	}
	.all summary {
		cursor: pointer;
		font-size: 14px;
		font-weight: 600;
	}
	.steps {
		list-style: none;
		margin: 8px 0 0;
		padding: 0;
		max-height: 320px;
		overflow-y: auto;
		position: relative;
		border-top: 1px solid var(--line);
	}
	.steps li {
		display: flex;
		align-items: center;
		border-bottom: 1px solid var(--line);
	}
	.steps li.book {
		opacity: 0.62;
	}
	.steps li[aria-current='step'] {
		background: var(--saffron-soft);
		opacity: 1;
	}
	.steps li.handoff {
		display: block;
		padding: 6px 8px;
		font-size: 12.5px;
		color: var(--saffron-ink);
		background: color-mix(in srgb, var(--saffron) 8%, transparent);
		font-weight: 600;
	}
	.row {
		flex: 1;
		min-width: 0;
		display: grid;
		grid-template-columns: 10px 26px 70px minmax(0, 1fr) auto;
		gap: 8px;
		align-items: center;
		padding: 3px 6px;
		border: 0;
		background: none;
		cursor: pointer;
		text-align: left;
	}
	.dot {
		width: 10px;
		height: 10px;
		border-radius: 3px;
	}
	.i {
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--muted);
	}
	.c {
		font-family: var(--font-mono);
		font-size: 12.5px;
		color: var(--indigo);
	}
	.s {
		font-size: 14.5px;
		color: var(--ink-2);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.f {
		font-size: 15px;
		white-space: nowrap;
	}
	.go {
		padding: 0 8px;
		text-decoration: none;
		font-size: 13px;
	}
	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 18px;
		font-size: 14px;
	}
	.linkish {
		background: none;
		border: 0;
		padding: 0;
		color: var(--indigo);
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 2px;
	}
	@media (max-width: 600px) {
		.detail {
			padding: 12px;
		}
		.now {
			grid-template-columns: minmax(0, 1fr);
		}
		.nform {
			font-size: 20px;
			white-space: normal;
		}
		.row {
			grid-template-columns: 10px 22px 56px minmax(0, 1fr);
		}
		.row .s {
			display: none;
		}
		.f {
			white-space: normal;
		}
		.out {
			align-items: flex-start;
		}
		.count {
			margin-left: 0;
		}
	}
</style>
