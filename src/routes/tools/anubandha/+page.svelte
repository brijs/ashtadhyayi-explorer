<script lang="ts">
	import { onMount } from 'svelte';
	import { replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import ItRuleRef from '#lib/components/ItRuleRef.svelte';
	import SutraRef from '#lib/components/SutraRef.svelte';
	import { CONTEXTS, IT_EFFECTS, itName, type ItContext } from '#lib/it.ts';
	import { traceIts, type TraceStep } from '#lib/it-trace.ts';
	import { PICK_GROUPS } from '#lib/anubandha.ts';
	import { slp1ToDeva, toSlp1 } from '#lib/slp1.ts';
	import { devaToIast, looseKey } from '#lib/translit.ts';
	import { loadDhatus, type Dhatu } from '#lib/vidyut.ts';
	import { settings } from '#lib/settings.svelte.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let input = $state('ण्वुल्');
	let ctx = $state<ItContext>('pratyaya');
	let hover = $state<TraceStep | null>(null);

	// Devanagari as typed, or IAST / SLP1 converted (SLP1 marks a nasal vowel with ~, e.g. tumu~n)
	const deva = $derived(/[ऀ-ॿ]/.test(input) ? input.trim() : slp1ToDeva(toSlp1(input)));
	const trace = $derived(traceIts(deva, ctx));
	const units = $derived(trace.units);
	const markers = $derived(
		[...new Set(units.map((_, i) => itName(units, i)).filter((x): x is string => !!x))].map((name) => ({ name, effects: IT_EFFECTS[name] ?? [] }))
	);
	const lit = $derived(new Set(hover?.on ?? []));

	function set(u: string, c: ItContext) {
		input = u;
		ctx = c;
		hover = null;
		writeHash();
	}
	function writeHash() {
		replaceState(`#ctx=${ctx}&u=${encodeURIComponent(deva)}`, {});
	}
	onMount(() => {
		const h = new URLSearchParams(location.hash.slice(1));
		const c = h.get('ctx') as ItContext | null;
		const u = h.get('u');
		if (u) input = u;
		if (c && CONTEXTS.some((x) => x.id === c)) ctx = c;
		loadDhatus().then((d) => (dhatus = d));
	});

	// pick lists
	type Tab = 'dhatu' | 'sup' | 'tin' | (typeof PICK_GROUPS)[number]['id'];
	let tab = $state<Tab>('krt');
	const TABS: { id: Tab; label: string }[] = [
		{ id: 'dhatu', label: 'Dhātus' },
		{ id: 'sup', label: 'Sup' },
		{ id: 'tin', label: 'Tiṅ' },
		...PICK_GROUPS.map((g) => ({ id: g.id as Tab, label: g.label }))
	];
	const group = $derived(PICK_GROUPS.find((g) => g.id === tab));
	let dhatus = $state<Dhatu[]>([]);
	let q = $state('');
	const found = $derived.by(() => {
		const t = q.trim();
		if (!t) return dhatus.filter((d) => d.d !== d.n).slice(0, 48);
		const k = looseKey(t);
		return dhatus.filter((d) => looseKey(d.d).includes(k) || looseKey(d.n).includes(k) || looseKey(d.m).includes(k) || d.en.toLowerCase().includes(t.toLowerCase()) || looseKey(d.hi).includes(k)).slice(0, 48);
	});

	const STATUS: Record<TraceStep['status'], string> = { fired: 'applies', blocked: 'blocked', no: 'does not apply', na: 'not relevant here' };
</script>

<svelte:head><title>It-letter finder · Aṣṭādhyāyī Explorer</title></svelte:head>

<div class="wrap page">
	<p class="eyebrow">Tool</p>
	<h1>It-letter finder <span class="deva sa">अनुबन्धः</span></h1>
	<p class="lede">
		Type or pick an upadeśa (a root, affix or augment as Pāṇini teaches it). Sūtras 1.3.2–1.3.8 decide which of its letters are
		<i>it</i>-markers (anubandhas), and <ItRuleRef n="1.3.9" showText /> deletes them. See which rule marks each one, and why the others do not.
	</p>

	<section class="card inbox" aria-label="Upadeśa">
		<label class="lbl" for="u-in">Upadeśa</label>
		<input id="u-in" class="u-in deva" bind:value={input} oninput={writeHash} autocomplete="off" spellcheck="false" placeholder="ण्वुल्, tumu~n, ḍukṛñ" />
		<p class="hint muted">Devanagari, IAST or SLP1. Mark a nasal vowel with ँ (SLP1 <code>~</code>): Pāṇini's tradition writes तुमुन् but pronounces it तुमुँन्.</p>
		<div class="ctx" role="group" aria-label="What kind of upadeśa">
			{#each CONTEXTS as c (c.id)}
				<button class="btn" aria-pressed={ctx === c.id} title={c.hint} onclick={() => set(input, c.id)}>{c.label}</button>
			{/each}
		</div>
		<p class="hint muted">{CONTEXTS.find((c) => c.id === ctx)?.hint}</p>
	</section>

	{#if units.length}
		<section class="out" aria-live="polite">
			<div class="tiles" aria-label="Sounds">
				{#each units as u, i (i)}
					<div class="tile" class:it={u.it} class:kept={u.kept} class:lit={lit.has(i)}>
						<span class="v deva">{u.v}</span>
						{#if settings.iast}<span class="tx iast">{devaToIast(u.v)}</span>{/if}
						<span class="lab">
							{#if u.it}it · <ItRuleRef n={u.it} />{:else if u.kept}kept · <ItRuleRef n={u.kept} />{:else if u.as}read as <span class="deva">{u.as}</span> · <ItRuleRef n="8.4.41" />{:else}sound{/if}
						</span>
					</div>
				{/each}
				<div class="arrow" aria-hidden="true">→</div>
				<div class="res">
					<span class="v deva">{trace.result || '∅'}</span>
					<span class="lab">after 1.3.9</span>
				</div>
			</div>

			<div class="cols">
				<div>
					<h2>Rule by rule</h2>
					<ol class="trace">
						{#each trace.steps as s (s.rule)}
							<li class="st {s.rule === '1.3.4' && s.status === 'fired' ? 'blocked' : s.status}" onpointerenter={() => (hover = s)} onpointerleave={() => (hover = null)}>
								<span class="code"><ItRuleRef n={s.rule} /></span>
								<span class="badge">{STATUS[s.status]}{#if s.by}&nbsp;by <ItRuleRef n={s.by} />{/if}</span>
								<span class="why">{s.why}</span>
							</li>
						{/each}
					</ol>
				</div>
				<aside>
					<h2>What the markers do</h2>
					{#if markers.length}
						<ul class="mk">
							{#each markers as m (m.name)}
								<li>
									<b>{m.name}</b>
									{#each m.effects as e (e.sutra)}<span class="eff"><SutraRef n={e.sutra} /> {e.en}</span>{/each}
									{#if !m.effects.length}<span class="eff muted">no effect recorded here</span>{/if}
								</li>
							{/each}
						</ul>
					{:else}
						<p class="muted">No it-letters, so no markers.</p>
					{/if}
					<p class="muted small">
						A marker is named after its it-letter plus <i>-it</i>: क् makes an affix <i>kit</i>. Rules elsewhere test for these names, then the letters vanish.
						<a href={resolve('/learn') + '/it-markers/'}>Lesson: it-markers →</a>
					</p>
				</aside>
			</div>
		</section>
	{:else}
		<p class="muted">Type an upadeśa above, or pick one below.</p>
	{/if}

	<section class="picks" aria-labelledby="pick-h">
		<h2 id="pick-h">Pick an upadeśa</h2>
		<div class="tabs" role="tablist">
			{#each TABS as t (t.id)}
				<button role="tab" aria-selected={tab === t.id} onclick={() => (tab = t.id)}>{t.label}</button>
			{/each}
		</div>
		<div class="panel" role="tabpanel">
			{#if tab === 'dhatu'}
				<input class="search" bind:value={q} placeholder="Search a root or meaning: कृ, gam, पाके" aria-label="Search dhātus" />
				<p class="muted small">As listed in the Dhātupāṭha, with their markers. {dhatus.length ? `${dhatus.length.toLocaleString()} roots.` : 'Loading…'}</p>
				<div class="chips">
					{#each found as d (d.c)}
						<button class="chip deva" title="{d.n} · {d.m}{d.en ? ` · ${d.en}` : ''}{d.hi ? ` · ${d.hi}` : ''} ({d.c})" onclick={() => set(d.d, 'dhatu')}>{d.d}<small>{d.n}</small></button>
					{/each}
				</div>
			{:else if tab === 'sup' || tab === 'tin'}
				<p class="muted small">
					{#if tab === 'sup'}The 21 case endings of <SutraRef n="4.1.2" />.{:else}The 18 verb endings of <SutraRef n="3.4.78" />.{/if} Both are vibhaktis (1.4.104), so 1.3.4 applies.
				</p>
				<div class="chips">
					{#each tab === 'sup' ? data.sup : data.tin as u, i (i)}
						<button class="chip deva" onclick={() => set(u, 'vibhakti')}>{u}</button>
					{/each}
				</div>
			{:else if group}
				<p class="muted small">{group.blurb}</p>
				<div class="chips">
					{#each group.items as it (it.u + it.by)}
						<button class="chip deva" title="introduced by {it.by}" onclick={() => set(it.u, group.ctx)}>{it.u}<small>{it.by}</small></button>
					{/each}
				</div>
			{/if}
		</div>
		<p class="muted small">Every listed item is spelt as vidyut spells it, and the it-letters shown here match the ones vidyut deletes in a real derivation.</p>
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
	h2 {
		font-size: 20px;
		margin: 0 0 10px;
	}
	.lede {
		font-family: var(--font-serif);
		font-size: 17px;
		color: var(--ink-2);
		max-width: 46em;
	}
	.inbox {
		padding: 16px 18px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		max-width: 760px;
	}
	.lbl {
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.u-in {
		font-size: 28px;
		padding: 6px 12px;
		border-radius: 10px;
		border: 1.5px solid var(--line);
		background: var(--surface);
		color: var(--ink);
		width: 100%;
	}
	.u-in:focus {
		border-color: var(--saffron);
		outline: none;
	}
	.hint {
		font-size: 13px;
		margin: 0;
	}
	.ctx {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.ctx .btn {
		font-size: 14px;
	}
	.out {
		margin-top: 26px;
	}
	.tiles {
		display: flex;
		flex-wrap: wrap;
		align-items: stretch;
		gap: 8px;
	}
	.tile,
	.res {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-width: 84px;
		padding: 10px 10px 8px;
		border-radius: 14px;
		border: 2px solid color-mix(in srgb, var(--r-subject) 55%, transparent);
		background: color-mix(in srgb, var(--r-subject) 8%, var(--surface));
		transition: transform 0.15s, box-shadow 0.15s;
	}
	.tile.it {
		border: 2px dashed var(--it);
		background: var(--it-soft);
	}
	.tile.it .v {
		color: var(--it);
	}
	.tile.kept {
		border-color: var(--saffron);
		background: var(--saffron-soft);
	}
	.tile.lit {
		transform: translateY(-3px);
		box-shadow: 0 0 0 3px var(--focus);
	}
	.v {
		font-size: 40px;
		line-height: 1.3;
	}
	.tx {
		font-size: 13px;
	}
	.lab {
		font-size: 12px;
		color: var(--ink-2);
		white-space: nowrap;
	}
	.arrow {
		align-self: center;
		font-size: 28px;
		color: var(--muted);
		padding: 0 4px;
	}
	.res {
		border: 2px solid var(--ink-2);
		background: var(--surface);
	}
	.res .v {
		font-weight: 700;
	}
	.cols {
		display: grid;
		grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
		gap: 28px;
		margin-top: 26px;
		align-items: start;
	}
	.trace {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.st {
		display: grid;
		grid-template-columns: 74px 150px minmax(0, 1fr);
		gap: 10px;
		align-items: baseline;
		padding: 7px 10px;
		border-radius: 10px;
		border: 1px solid var(--line);
		background: var(--surface);
		font-size: 14.5px;
	}
	.st.fired {
		border-color: color-mix(in srgb, var(--it) 50%, var(--line));
		background: color-mix(in srgb, var(--it-soft) 70%, var(--surface));
	}
	.st.blocked {
		border-color: var(--saffron);
		background: var(--saffron-soft);
	}
	.st.na {
		opacity: 0.62;
	}
	.badge {
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--muted);
	}
	.st.fired .badge {
		color: var(--it);
	}
	.st.blocked .badge {
		color: var(--saffron-ink);
	}
	.why {
		color: var(--ink-2);
	}
	.mk {
		list-style: none;
		padding: 0;
		margin: 0 0 12px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.mk li {
		display: flex;
		flex-direction: column;
		gap: 2px;
		font-size: 14px;
	}
	.mk b {
		color: var(--it);
		font-size: 16px;
	}
	.eff {
		color: var(--ink-2);
	}
	.small {
		font-size: 13.5px;
	}
	.picks {
		margin-top: 40px;
	}
	.tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		border-bottom: 1px solid var(--line);
		margin-bottom: 12px;
	}
	.tabs button {
		background: none;
		border: none;
		padding: 8px 12px;
		cursor: pointer;
		color: var(--ink-2);
		font-size: 14.5px;
		border-bottom: 2px solid transparent;
		margin-bottom: -1px;
	}
	.tabs button[aria-selected='true'] {
		color: var(--ink);
		border-bottom-color: var(--saffron);
		font-weight: 600;
	}
	.search {
		width: 100%;
		max-width: 420px;
		padding: 8px 12px;
		border-radius: 8px;
		border: 1px solid var(--line);
		background: var(--surface);
		color: var(--ink);
		font-size: 15px;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin: 8px 0;
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
		font-size: 18px;
		color: var(--ink);
	}
	.chip:hover {
		border-color: var(--saffron);
	}
	.chip small {
		font-family: var(--font-mono);
		font-size: 10.5px;
		color: var(--muted);
	}
	@media (max-width: 860px) {
		.cols {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	@media (max-width: 560px) {
		.st {
			grid-template-columns: 64px minmax(0, 1fr);
		}
		.why {
			grid-column: 1 / -1;
		}
		.tile,
		.res {
			min-width: 62px;
			padding: 8px 6px 6px;
		}
		.v {
			font-size: 30px;
		}
	}
</style>
