<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { replaceState } from '$app/navigation';
	import { loadCore } from '#lib/search.ts';
	import {
		loadVidyut, loadDhatus, loadRuleTexts, deriveTinanta, deriveSubanta, tinantaHash, subantaHash, defaultNyap,
		LAKARAS, PRAYOGAS, PURUSHAS, VACANAS, VIBHAKTIS, LINGAS,
		type Dhatu, type Prakriya
	} from '#lib/vidyut.ts';
	import { slp1ToDeva, toSlp1 } from '#lib/slp1.ts';
	import SutraRef from '#lib/components/SutraRef.svelte';
	import DhatuSenses from '#lib/components/DhatuSenses.svelte';
	import DhatuPicker from '#lib/components/prakriya/DhatuPicker.svelte';
	import StepDebugger from '#lib/components/prakriya/StepDebugger.svelte';
	import type { CoreSutra } from '#lib/types.ts';

	type Wasm = Awaited<ReturnType<typeof loadVidyut>>;
	let wasm = $state<Wasm | null>(null);
	let dhatus = $state<Dhatu[]>([]);
	let sutras = $state(new Map<string, CoreSutra>());
	let ruleTexts = $state<Record<string, Record<string, string>>>({});
	let failed = $state('');

	let mode = $state<'verb' | 'noun'>('verb');
	// verb
	let dhatu = $state<Dhatu | null>(null);
	let lakara = $state('Lat');
	let prayoga = $state('Kartari');
	let pada = $state<string | null>(null);
	let purusha = $state('Prathama');
	let vacana = $state('Eka');
	// noun
	let stemInput = $state('राम');
	let linga = $state('Pum');
	let vibhakti = $state('Prathama');
	let nyapOverride = $state<boolean | null>(null);

	let pIdx = $state(0);
	const stem = $derived(toSlp1(stemInput));
	const stemOk = $derived(/^[a-zA-Z~']+$/.test(stem));
	const nyap = $derived(nyapOverride ?? defaultNyap(stem, linga));

	const forms = (ps: Prakriya[]) => [...new Set(ps.map((p) => slp1ToDeva(p.text)))].join(' / ') || '—';

	const verbGrid = $derived.by(() => {
		if (!wasm || !dhatu || mode !== 'verb') return [];
		return PURUSHAS.map((pu) => VACANAS.map((v) => forms(deriveTinanta(wasm!, { dhatu: dhatu!, lakara, prayoga, purusha: pu.id, vacana: v.id, pada: prayoga === 'Kartari' ? pada : null }))));
	});
	const nounGrid = $derived.by(() => {
		if (!wasm || mode !== 'noun' || !stemOk) return [];
		return VIBHAKTIS.map((vi) => VACANAS.map((v) => forms(deriveSubanta(wasm!, { stem, linga, vibhakti: vi.id, vacana: v.id, nyap }))));
	});

	const prakriyas = $derived.by((): Prakriya[] => {
		if (!wasm) return [];
		if (mode === 'verb') return dhatu ? deriveTinanta(wasm, { dhatu, lakara, prayoga, purusha, vacana, pada: prayoga === 'Kartari' ? pada : null }) : [];
		return stemOk ? deriveSubanta(wasm, { stem, linga, vibhakti, vacana, nyap }) : [];
	});
	const current = $derived(prakriyas[Math.min(pIdx, prakriyas.length - 1)]);
	$effect(() => {
		prakriyas;
		untrack(() => (pIdx = 0));
	});

	// keep the URL hash in sync so derivations can be linked from sūtra pages
	$effect(() => {
		const h =
			mode === 'verb'
				? dhatu
					? tinantaHash(dhatu.c, lakara, prayoga, purusha, vacana, prayoga === 'Kartari' ? pada : null)
					: ''
				: subantaHash(stem, linga, vibhakti, vacana, nyap);
		if (h && wasm) untrack(() => replaceState('#' + h, {}));
	});

	function applyHash(h: string, list: Dhatu[]) {
		const [kind, rest] = h.split('=');
		const parts = (rest ?? '').split(',');
		if (kind === 't') {
			const d = list.find((x) => x.c === parts[0]);
			if (!d) return;
			mode = 'verb';
			dhatu = d;
			[lakara, prayoga, purusha, vacana] = [parts[1] ?? 'Lat', parts[2] ?? 'Kartari', parts[3] ?? 'Prathama', parts[4] ?? 'Eka'];
			pada = parts[5] ?? null;
		} else if (kind === 's') {
			mode = 'noun';
			stemInput = slp1ToDeva(parts[0] ?? 'rAma');
			[linga, vibhakti, vacana] = [parts[1] ?? 'Pum', parts[2] ?? 'Prathama', parts[3] ?? 'Eka'];
			nyapOverride = parts[4] === 'nyap' ? true : null;
		}
	}

	async function init() {
		try {
			const [w, ds, core, rt] = await Promise.all([loadVidyut(), loadDhatus(), loadCore(), loadRuleTexts()]);
			dhatus = ds;
			sutras = new Map(core.map((c) => [c.n, c]));
			ruleTexts = rt;
			dhatu = ds.find((d) => d.c === '01.0001') ?? ds[0];
			applyHash(decodeURIComponent(location.hash.slice(1)), ds);
			wasm = w;
		} catch (e) {
			failed = e instanceof Error ? e.message : String(e);
		}
	}

	onMount(() => {
		init();
		const onHash = () => applyHash(decodeURIComponent(location.hash.slice(1)), dhatus);
		window.addEventListener('hashchange', onHash);
		return () => window.removeEventListener('hashchange', onHash);
	});

	const label = $derived(
		mode === 'verb'
			? `${dhatu?.n ?? ''} · ${LAKARAS.find((l) => l.id === lakara)?.sa} · ${PURUSHAS.find((p) => p.id === purusha)?.sa} ${VACANAS.find((v) => v.id === vacana)?.sa}`
			: `${slp1ToDeva(stem)} · ${VIBHAKTIS.find((v) => v.id === vibhakti)?.sa} ${VACANAS.find((v) => v.id === vacana)?.sa}`
	);
</script>

<svelte:head><title>Derivation debugger · Aṣṭādhyāyī Explorer</title></svelte:head>

<div class="wrap page">
	<p class="eyebrow">Tool</p>
	<h1>Derivation debugger <span class="deva sa">प्रक्रिया</span></h1>
	<p class="lede">
		Pick a root or a noun stem and step through how Pāṇini's rules build the finished word, one sūtra at a time. Every
		step links to the sūtra that fired. Derivations are computed live in your browser by
		<a href="https://github.com/ambuda-org/vidyut" rel="noopener">vidyut-prakriya</a>, which implements 2,000+ of the
		Aṣṭādhyāyī's rules.
	</p>

	<div class="layout">
		<aside class="inputs card" aria-label="Inputs">
			<div class="modes" role="tablist">
				<button role="tab" aria-selected={mode === 'verb'} onclick={() => (mode = 'verb')}>Verb <span class="deva">तिङन्त</span></button>
				<button role="tab" aria-selected={mode === 'noun'} onclick={() => (mode = 'noun')}>Noun <span class="deva">सुबन्त</span></button>
			</div>

			{#if mode === 'verb'}
				<span class="lbl">Root (dhātu)</span>
				<DhatuPicker {dhatus} value={dhatu} onchange={(d) => { dhatu = d; pada = null; }} />
				<label class="lbl" for="lakara">Tense / mood (lakāra)</label>
				<select id="lakara" bind:value={lakara}>
					{#each LAKARAS as l (l.id)}<option value={l.id}>{l.sa} · {l.en}</option>{/each}
				</select>
				<label class="lbl" for="prayoga">Voice (prayoga)</label>
				<select id="prayoga" bind:value={prayoga}>
					{#each PRAYOGAS as p (p.id)}<option value={p.id}>{p.sa} · {p.en}</option>{/each}
				</select>
				{#if prayoga === 'Kartari'}
					<label class="lbl" for="pada">Pada</label>
					<select id="pada" bind:value={pada}>
						<option value={null}>both, where allowed</option>
						<option value="Parasmaipada">परस्मैपद</option>
						<option value="Atmanepada">आत्मनेपद</option>
					</select>
				{/if}
			{:else}
				<label class="lbl" for="stem">Stem (prātipadika)</label>
				<input id="stem" bind:value={stemInput} placeholder="राम, hari, or SLP1" autocomplete="off" spellcheck="false" />
				{#if !stemOk}<p class="warn">Type the stem in Devanagari, IAST or SLP1.</p>{/if}
				<label class="lbl" for="linga">Gender (liṅga)</label>
				<select id="linga" bind:value={linga}>
					{#each LINGAS as g (g.id)}<option value={g.id}>{g.sa} · {g.en}</option>{/each}
				</select>
				{#if linga === 'Stri' && /[AI]$/.test(stem)}
					<label class="check">
						<input type="checkbox" checked={nyap} onchange={(e) => (nyapOverride = (e.currentTarget as HTMLInputElement).checked)} />
						ends in the feminine suffix ā/ī (ṅyāp), as नदी, लता. Untick for stems like लक्ष्मी.
					</label>
				{/if}
				<div class="tries">
					{#each [['राम', 'Pum'], ['हरि', 'Pum'], ['पितृ', 'Pum'], ['नदी', 'Stri'], ['लता', 'Stri'], ['फल', 'Napumsaka'], ['मनस्', 'Napumsaka']] as [s, g] (s)}
						<button class="btn deva" onclick={() => { stemInput = s; linga = g; nyapOverride = null; }}>{s}</button>
					{/each}
				</div>
			{/if}
		</aside>

		<div class="main">
			{#if failed}
				<p class="warn">Could not load the grammar engine: {failed}</p>
			{:else if !wasm}
				<p class="muted loading">Loading the grammar engine (about 1 MB)…</p>
			{:else}
				<section class="paradigm" aria-label="Paradigm: pick a cell">
					{#if mode === 'verb'}
						<table>
							<thead><tr><th></th>{#each VACANAS as v (v.id)}<th>{v.en}</th>{/each}</tr></thead>
							<tbody>
								{#each PURUSHAS as pu, i (pu.id)}
									<tr>
										<th>{pu.en}</th>
										{#each VACANAS as v, j (v.id)}
											<td><button class="cell deva" aria-pressed={purusha === pu.id && vacana === v.id} onclick={() => { purusha = pu.id; vacana = v.id; }}>{verbGrid[i]?.[j]}</button></td>
										{/each}
									</tr>
								{/each}
							</tbody>
						</table>
					{:else}
						<table>
							<thead><tr><th></th>{#each VACANAS as v (v.id)}<th>{v.en}</th>{/each}</tr></thead>
							<tbody>
								{#each VIBHAKTIS as vi, i (vi.id)}
									<tr>
										<th><span class="deva">{vi.sa}</span><small>{vi.en}</small></th>
										{#each VACANAS as v, j (v.id)}
											<td><button class="cell deva" aria-pressed={vibhakti === vi.id && vacana === v.id} onclick={() => { vibhakti = vi.id; vacana = v.id; }}>{nounGrid[i]?.[j]}</button></td>
										{/each}
									</tr>
								{/each}
							</tbody>
						</table>
					{/if}
				</section>

				{#if current}
					<div class="title">
						<h2><span class="deva">{slp1ToDeva(current.text)}</span></h2>
						<span class="muted deva">{label}</span>
						{#if prakriyas.length > 1}
							<div class="alts" role="tablist" aria-label="Alternative derivations">
								{#each prakriyas as p, i (i)}
									<button role="tab" aria-selected={i === pIdx} onclick={() => (pIdx = i)} class="deva">{slp1ToDeva(p.text)}</button>
								{/each}
							</div>
						{/if}
					</div>
					{#if mode === 'verb' && dhatu}
						<p class="root-meaning">
							<span class="deva rt">{dhatu.n}</span>
							<DhatuSenses d={dhatu} inline />
						</p>
					{/if}
					<StepDebugger prakriya={current} {sutras} {ruleTexts} />
				{:else}
					<p class="muted">No form is derived for this combination.</p>
				{/if}
			{/if}
		</div>
	</div>

	<section class="about">
		<h2>Reading a derivation</h2>
		<ul>
			<li>Each row is one rule application. <b>Highlighted</b> pieces are the ones that rule changed.</li>
			<li>Many steps are marker deletions: <SutraRef n="1.3.9" s="तस्य लोपः" /> removes the <i>it</i> letters that earlier rules used as tags. See <a href="../../learn/shiva-sutras/#markers">the Śiva sūtras explainer</a>.</li>
			<li>Definitions like <SutraRef n="1.4.13" /> (aṅga) and <SutraRef n="1.4.14" /> (pada) appear when a piece gets a technical name that later rules depend on.</li>
			<li>vidyut covers a large part of the grammar but not all of it yet; its authors <a href="https://github.com/ambuda-org/vidyut/tree/main/vidyut-prakriya#reporting-errors" rel="noopener">welcome error reports</a>.</li>
		</ul>
	</section>
</div>

<style>
	.root-meaning {
		display: flex;
		align-items: baseline;
		gap: 6px 14px;
		flex-wrap: wrap;
		margin: 2px 0 12px;
		font-size: 14.5px;
		color: var(--ink-2);
	}
	.root-meaning .rt {
		font-size: 18px;
		font-weight: 600;
		color: var(--ink);
	}
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
		max-width: 46em;
	}
	.layout {
		display: grid;
		grid-template-columns: 320px minmax(0, 1fr);
		gap: 28px;
		align-items: start;
		margin-top: 20px;
	}
	.inputs {
		position: sticky;
		top: 80px;
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 16px;
	}
	.modes {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4px;
		padding: 3px;
		border-radius: 10px;
		background: var(--surface-2);
		margin-bottom: 8px;
	}
	.modes button {
		padding: 7px;
		border: none;
		border-radius: 8px;
		background: none;
		cursor: pointer;
		color: var(--ink-2);
		font-weight: 500;
	}
	.modes button[aria-selected='true'] {
		background: var(--surface);
		color: var(--ink);
		box-shadow: var(--shadow);
	}
	.modes .deva {
		font-size: 13px;
		color: var(--muted);
	}
	.lbl {
		margin-top: 8px;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--muted);
	}
	select,
	#stem {
		padding: 8px 10px;
		border-radius: 8px;
		border: 1px solid var(--line);
		background: var(--surface);
		color: var(--ink);
		font: inherit;
		font-family: var(--font-ui), var(--font-deva);
		font-size: 15px;
	}
	#stem {
		font-size: 18px;
	}
	.check {
		font-size: 13px;
		color: var(--ink-2);
		display: flex;
		gap: 6px;
		align-items: flex-start;
		margin-top: 6px;
	}
	.tries {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 10px;
	}
	.tries .btn {
		font-size: 15px;
		padding: 3px 12px;
	}
	.warn {
		color: var(--r-target);
		font-size: 14px;
	}
	.loading {
		padding: 40px 0;
	}
	.paradigm {
		overflow-x: auto;
	}
	table {
		border-collapse: separate;
		border-spacing: 4px;
		width: 100%;
	}
	th {
		font-size: 12px;
		font-weight: 600;
		color: var(--muted);
		text-align: left;
		padding: 0 4px;
		white-space: nowrap;
	}
	th small {
		display: block;
		font-weight: 400;
	}
	th .deva {
		font-size: 14px;
		color: var(--ink-2);
	}
	.cell {
		width: 100%;
		min-height: 40px;
		padding: 4px 10px;
		border-radius: 8px;
		border: 1px solid var(--line);
		background: var(--surface);
		cursor: pointer;
		font-size: 17px;
		color: var(--ink);
		text-align: left;
	}
	.cell:hover {
		border-color: var(--saffron);
	}
	.cell[aria-pressed='true'] {
		background: var(--saffron);
		border-color: var(--saffron);
		color: #fff;
	}
	.title {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 4px 14px;
		margin: 26px 0 12px;
	}
	.title h2 {
		margin: 0;
		font-size: 38px;
	}
	.alts {
		display: flex;
		gap: 4px;
		width: 100%;
	}
	.alts button {
		padding: 2px 12px;
		border-radius: 999px;
		border: 1px solid var(--line);
		background: var(--surface);
		cursor: pointer;
		font-size: 16px;
		color: var(--ink);
	}
	.alts button[aria-selected='true'] {
		border-color: var(--indigo);
		background: var(--indigo-soft);
	}
	.about {
		margin-top: 48px;
		max-width: 760px;
	}
	.about h2 {
		font-size: 22px;
	}
	.about li {
		margin-bottom: 6px;
	}
	@media (max-width: 900px) {
		.layout {
			grid-template-columns: minmax(0, 1fr);
		}
		.inputs {
			position: static;
		}
	}
</style>
