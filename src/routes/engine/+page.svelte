<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { sutraHref } from '#lib/links.ts';
	import { BANDS, SOURCES } from '#lib/structure.ts';
	import { flatten } from '#lib/engine/steps.ts';
	import SutraRef from '#lib/components/SutraRef.svelte';
	import EngineRunner from '#lib/components/engine/EngineRunner.svelte';
	import StructureMap from '#lib/components/engine/StructureMap.svelte';
	import ChapterCard from '#lib/components/engine/ChapterCard.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const st = $derived(data.st);
	const fmt = (n: number) => n.toLocaleString('en-US');

	// ---------- engine runner ↔ map ----------
	let selected = $state('bhavati');
	let idx = $state(0);
	const ex = $derived(data.examples.find((e) => e.id === selected) ?? data.examples[0]);
	const steps = $derived(flatten(ex));
	const starts = $derived.by(() => {
		const out: number[] = [];
		let s = 0;
		for (const pc of st.padaCounts) for (const c of pc) (out.push(s), (s += c));
		return out;
	});
	const indexOf = (code: string) => {
		const [a, p, k] = code.split('.').map(Number);
		return starts[(a - 1) * 4 + p - 1] + k - 1;
	};
	const highlight = $derived([...new Set(steps.filter((s) => s.sutra).map((s) => indexOf(s.code)))]);
	const current = $derived(steps[idx]?.sutra ? indexOf(steps[idx].code) : -1);

	// the map is client-only and mounted when it comes near the viewport (3,983 cells)
	let mapSection: HTMLElement | undefined = $state();
	let showMap = $state(false);
	let mapApi: StructureMap | undefined = $state();
	onMount(() => {
		if (/^#map/.test(location.hash)) showMap = true;
		const io = new IntersectionObserver(([e]) => e.isIntersecting && (showMap = true), { rootMargin: '900px' });
		if (mapSection) io.observe(mapSection);
		return () => io.disconnect();
	});
	async function toMap(fn: () => void) {
		showMap = true;
		await tick();
		mapSection?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
		await tick();
		fn();
	}
	const showExample = () => toMap(() => mapApi?.focusIndices(highlight));
	const showPada = (a: number, p?: number) => {
		history.replaceState(history.state, '', `#map-a${a}${p ? '-' + p : ''}`);
		toMap(() => mapApi?.focusAdhyaya(a, p));
	};

	// ---------- evidence: which adhyāyas' rules fire ----------
	const sample = $derived(st.sample);
	const sumF = $derived(sample.perA.reduce((n, x) => n + x.fires, 0));
	const sumD = $derived(sample.perA.reduce((n, x) => n + x.distinct, 0));
	const sumE = $derived(data.exampleFires.reduce((n, x) => n + x, 0));
	const pct = (x: number, of: number) => (of ? (100 * x) / of : 0);
	const share67 = $derived(pct(sample.perA[5].distinct + sample.perA[6].distinct, sumD));
	const fire67 = $derived(pct(sample.perA[5].fires + sample.perA[6].fires, sumF));
	const fire1 = $derived(pct(sample.perA[0].fires, sumF));
	const anc = $derived(st.anchors);
	const TYPE_ORDER = ['V', 'S', 'AT', 'AD', 'P'] as const;
	const TYPE_LABEL: Record<string, string> = { V: 'operational (vidhi)', S: 'definitions (saṃjñā)', AT: 'extensions (atideśa)', AD: 'headings (adhikāra)', P: 'metarules (paribhāṣā)' };
</script>

<svelte:head>
	<title>Structure: the Aṣṭādhyāyī as an engine · Aṣṭādhyāyī Explorer</title>
	<meta name="description" content="What the Aṣṭādhyāyī is as a generative engine: inputs, rules and outputs; how its eight chapters hand work to each other; a 3D assembly line, real derivations you can step through, and a zoomable map of all 3,983 sūtras." />
</svelte:head>

<section class="hero">
	<div class="wrap">
		<p class="eyebrow">Structure</p>
		<h1>The Aṣṭādhyāyī as an engine</h1>
		<p class="lede">
			Pāṇini's grammar is a machine for producing words. You feed it a root or a stem plus what you want to say, and its
			{fmt(data.meta.count)} rules build the finished word step by step. This page shows what goes in, what comes out, how
			the eight chapters split the work, and how a derivation hands off from one chapter to another.
		</p>
		<nav class="toc" aria-label="On this page">
			<a href="#what">What it is</a>
			<a href="#verify">Who does what?</a>
			<a href="#run">Run the engine</a>
			<a href="#map">Map of the text</a>
			<a href="#chapters">Chapters &amp; pādas</a>
		</nav>
	</div>
</section>

<section class="wrap block" id="what">
	<h2>What is the Aṣṭādhyāyī, fundamentally?</h2>
	<p class="intro">
		Yes, it is a generative grammar: a finite set of rules that derives every correct Sanskrit word from a small set of
		inputs. In Wikipedia's words, it "takes material from lexical lists (Dhātupāṭha, Gaṇapāṭha) as input and describes
		algorithms to be applied to them for generation of well-formed words." Kiparsky describes the rules as mapping what
		the speaker means onto sound in stages: meaning → kāraka relations → abstract morphemes → pronounced form.
	</p>

	<div class="flow" role="figure" aria-label="Inputs flow into the engine, which outputs a finished word">
		<div class="col inputs">
			<span class="eyebrow">Inputs</span>
			<div class="in card">
				<b>Verbal roots (dhātu)</b>
				<p>A list outside the sūtras, the Dhātupāṭha ({fmt(data.dhatuCount)} entries in this site's copy). <SutraRef n="1.3.1" s="भूवादयो धातवः" /> names its members dhātu.</p>
			</div>
			<div class="in card">
				<b>Nominal stems (prātipadika)</b>
				<p>Any meaningful word that is not a root or affix (<SutraRef n="1.2.45" />), and stems made by kṛt, taddhita and compounding (<SutraRef n="1.2.46" />). Gaṇa lists such as sarvādi (<SutraRef n="1.1.27" />) and uṇādi words (<SutraRef n="3.3.1" />) supply more.</p>
			</div>
			<div class="in card intent">
				<b>What the speaker means (vivakṣā)</b>
				<ul>
					<li>kāraka roles: agent, object, instrument… (<SutraRef n="1.4.23" /> ff.)</li>
					<li>tense and mood: the ten lakāras (e.g. <SutraRef n="3.2.123" /> laṭ, present)</li>
					<li>person and number (<SutraRef n="1.4.101" />–<SutraRef n="1.4.108" />)</li>
					<li>voice (<SutraRef n="3.4.69" />), gender, case</li>
				</ul>
			</div>
		</div>
		<div class="arrow" aria-hidden="true">→</div>
		<div class="col engine card">
			<span class="eyebrow">The engine</span>
			<b class="big">{fmt(data.meta.count)} sūtras</b>
			<div class="types">
				{#each TYPE_ORDER as t (t)}
					<span class="tseg" style="flex: {data.meta.typeCounts[t]}; background: var(--t-{t})" title="{data.meta.typeCounts[t]} {TYPE_LABEL[t]}"></span>
				{/each}
			</div>
			<ul class="tlist">
				{#each TYPE_ORDER as t (t)}<li><i style="background: var(--t-{t})"></i>{fmt(data.meta.typeCounts[t])} {TYPE_LABEL[t]}</li>{/each}
			</ul>
			<p>They work on a string of morphemes, repeatedly:</p>
			<ul class="ops">
				<li><b>introduce affixes</b> (pratyaya, from <SutraRef n="3.1.1" />)</li>
				<li><b>assign labels</b> that other rules test (saṃjñā: <SutraRef n="1.4.13" /> aṅga, <SutraRef n="1.4.14" /> pada)</li>
				<li><b>substitute</b> (ādeśa, "in place of": <SutraRef n="1.1.49" />)</li>
				<li><b>augment</b> (āgama, e.g. <SutraRef n="6.4.71" /> a-)</li>
				<li><b>delete</b> (lopa: markers <SutraRef n="1.3.9" />, zero affixes <SutraRef n="2.4.71" />)</li>
				<li><b>join</b> (sandhi, e.g. <SutraRef n="6.1.77" />)</li>
			</ul>
			<p class="small">When two rules compete, the later one wins (<SutraRef n="1.4.2" />) and a specific rule beats a general one. The last three pādas are a one-way final pass: <SutraRef n="8.2.1" s="पूर्वत्रासिद्धम्" /> makes them invisible to every earlier rule.</p>
		</div>
		<div class="arrow" aria-hidden="true">→</div>
		<div class="col outputs">
			<span class="eyebrow">Output</span>
			<div class="out card">
				<b>A finished word (pada)</b>
				<p>Anything ending in a case or verb ending (<SutraRef n="1.4.14" s="सुप्तिङन्तं पदम्" />):</p>
				<p class="eg"><span class="deva">भवति</span> a verb (tiṅanta)<br /><span class="deva">रामेण</span> a noun (subanta)</p>
			</div>
			<p class="small">Sentences are strings of such padas. Compounds and derived nouns are made by running the engine more than once and feeding one output back in as a new stem.</p>
		</div>
	</div>
</section>

<section class="wrap block" id="verify">
	<h2>Is it true that chapters 3–5 add the suffixes and 6–7 do the heavy lifting?</h2>
	<div class="verdict card">
		<p class="v"><b>Mostly yes</b>, with two refinements. Here is the conventional division, with every range taken from the heading (adhikāra) sūtras in this site's data:</p>
		<table>
			<tbody>
				<tr style="--c: var(--b-defs)"><th>1</th><td>Definitions and metarules; kāraka (<SutraRef n="1.4.23" />), ātmanepada/parasmaipada (1.3), person/number (1.4). The heading <SutraRef n="1.4.1" /> runs to {anc['1.4.1'].toN}.</td></tr>
				<tr style="--c: var(--b-case)"><th>2</th><td>Compounds (<SutraRef n="2.1.3" /> to {anc['2.1.3'].toN}), case endings for kārakas (<SutraRef n="2.3.1" /> to {anc['2.3.1'].toN}), number/gender of compounds, root substitutes and luk deletions (2.4).</td></tr>
				<tr style="--c: var(--b-verbal)"><th>3</th><td>The affix section opens: <SutraRef n="3.1.1" s="प्रत्ययः" /> runs to {anc['3.1.1'].toN} ({fmt(anc['3.1.1'].count)} sūtras). Within it <SutraRef n="3.1.91" s="धातोः" /> (to {anc['3.1.91'].toN}) covers affixes <i>after roots</i>: sanādi, vikaraṇas, kṛt, and the lakāras with their tiṅ endings.</td></tr>
				<tr style="--c: var(--b-nominal)"><th>4–5</th><td>Affixes <i>after nominal stems</i>: <SutraRef n="4.1.1" s="ङ्याप्प्रातिपदिकात्" /> runs to {anc['4.1.1'].toN}: case endings sup (<SutraRef n="4.1.2" />), feminine affixes (<SutraRef n="4.1.3" /> to {anc['4.1.3'].toN}), and taddhitas (<SutraRef n="4.1.76" /> to {anc['4.1.76'].toN}).</td></tr>
				<tr style="--c: var(--b-stem)"><th>6–7</th><td>Operations on the string: reduplication and sandhi (6.1, <SutraRef n="6.1.72" /> to {anc['6.1.72'].toN}), compound accent and first members (6.2–6.3), and the stem section <SutraRef n="6.4.1" s="अङ्गस्य" /> which runs to {anc['6.4.1'].toN} ({anc['6.4.1'].count} sūtras): augments, guṇa/vṛddhi, affix replacements.</td></tr>
				<tr style="--c: var(--b-tri)"><th>8</th><td>Word repetition and sentence accent (8.1; <SutraRef n="8.1.16" /> runs to {anc['8.1.16'].toN}), then the Tripādī: <SutraRef n="8.2.1" /> to {anc['8.2.1'].toN} ({anc['8.2.1'].count} sūtras) of final phonology.</td></tr>
			</tbody>
		</table>
		<p><b>Refinement 1.</b> Adhyāya 3 is "verbal" in the sense of <i>what the affix attaches to</i>. Many of its affixes (kṛt) make nouns from verbs: पाचक "cook" and गत "gone" get their affixes in Adhyāya 3 (<SutraRef n="3.1.133" />, <SutraRef n="3.2.102" />) and their case endings in Adhyāya 4.</p>
		<p><b>Refinement 2.</b> "Heavy lifting" depends on what you count. In the {fmt(sample.derivations)} sample derivations this site's build runs through vidyut, Adhyāya 1 fires the most steps ({fire1.toFixed(0)}% of all rule applications), because its it-marker deletion and labelling rules repeat at every stage. Adhyāyas 6–7 fire only {fire67.toFixed(0)}% of the steps, but they supply {share67.toFixed(0)}% of the <i>different</i> sūtras those derivations use: they are where the word gets its particular shape.</p>

		<div class="bars" role="table" aria-label="Rule usage by adhyāya in sample derivations">
			<div class="bh" role="row">
				<span role="columnheader">Adhyāya</span>
				<span role="columnheader">Share of the text</span>
				<span role="columnheader">Share of rule applications</span>
				<span role="columnheader">Share of different sūtras used</span>
			</div>
			{#each sample.perA as r (r.a)}
				<div class="br" role="row" style="--c: var(--b-{st.adhyayas[r.a - 1].band})">
					<span role="cell" class="ba">{r.a}</span>
					<span role="cell"><i style="width: {pct(r.total, st.total)}%"></i><em>{pct(r.total, st.total).toFixed(0)}%</em></span>
					<span role="cell"><i style="width: {pct(r.fires, sumF)}%"></i><em>{pct(r.fires, sumF).toFixed(0)}%</em></span>
					<span role="cell"><i style="width: {pct(r.distinct, sumD)}%"></i><em>{r.distinct} · {pct(r.distinct, sumD).toFixed(0)}%</em></span>
				</div>
			{/each}
		</div>
		<p class="small muted">
			Sample: {fmt(sample.derivations)} derivations (40 common roots in all ten lakāras plus a passive form, and 16 noun stems
			in all cases and numbers). Adhyāyas 2, 4 and 5 are under-represented because the sample has no compounds and few
			derived nouns. Across the {data.examples.length} curated examples below, the split of Aṣṭādhyāyī steps by adhyāya is
			{data.exampleFires.map((n, i) => `${i + 1}: ${n}`).join(' · ')} (of {sumE}).
		</p>
	</div>
</section>

<section class="wrap block" id="run">
	<h2>Run the engine</h2>
	<p class="intro">
		Pick a word. The derivation is computed by <a href="https://github.com/ambuda-org/vidyut" rel="noopener">vidyut</a>,
		a software implementation of the Aṣṭādhyāyī, when this site is built. Watch the token hop between stations in the
		factory: it does not roll neatly from 1 to 8, because labels and marker deletion (Adhyāya 1) are needed again after
		every new affix, and the finishing rules of Adhyāya 8 come last.
	</p>
	<details class="analogy">
		<summary>How the factory maps onto the grammar</summary>
		<ul>
			<li><b>Inputs</b>: the crates are the root and stem lists (Dhātupāṭha, gaṇas); the order slip is the speaker's intent.</li>
			<li><b>Station 1, the control room</b>: definitions and metarules. It labels parts (dhātu, it, aṅga, pada) and strips marker letters.</li>
			<li><b>Station 2</b>: compounds, case assignment, zero-deletions.</li>
			<li><b>Station 3</b>: bolts affixes onto roots; <b>4–5</b> bolt affixes onto stems.</li>
			<li><b>Stations 6–7</b>: the big presses: reduplication, sandhi, guṇa/vṛddhi, augments, stem changes.</li>
			<li><b>Station 8, behind one-way glass</b>: the Tripādī. It sees everything the earlier stations did; they cannot see its work (8.2.1).</li>
			<li><b>The token</b> is the word in progress; its label shows the current form and the rule that just fired.</li>
		</ul>
	</details>
	<EngineRunner examples={data.examples} groups={data.groups} bind:selected bind:idx onmap={showExample} />
</section>

<section class="wrap block" id="map" bind:this={mapSection}>
	<h2>Map of the whole text</h2>
	<p class="intro">
		Every square is one sūtra, in order: eight columns for the adhyāyas, four blocks each for the pādas. Zoom in for pāda
		summaries and heading brackets (grey lines beside the cells mark the reach of each adhikāra), further for sūtra
		numbers, and further still for the text. The sūtras used by the example above are outlined.
	</p>
	{#if showMap}
		<StructureMap
			bind:this={mapApi}
			padaCounts={st.padaCounts}
			types={st.types.split(',')}
			heat={st.heat}
			bands={st.bands}
			spans={st.spans}
			adhyayas={st.adhyayas}
			sampleN={sample.derivations}
			{highlight}
			{current}
			exampleWord={ex.word}
		/>
	{:else}
		<div class="map-ph card">Loading the map…</div>
	{/if}
</section>

<section class="wrap block" id="chapters">
	<h2>Chapters and pādas</h2>
	<p class="intro">
		Eight adhyāyas of four pādas each. The colour is each part's main role in a derivation:
		{#each Object.entries(BANDS) as [b, info], i (b)}{i ? ', ' : ''}<span class="bandname" style="color: var(--b-{b})">{info.short.toLowerCase()}</span>{/each}.
	</p>
	<div class="chgrid">
		{#each st.adhyayas as ad (ad.a)}
			<ChapterCard {ad} onmap={showPada} />
		{/each}
	</div>
</section>

<section class="wrap block sources">
	<h2>Sources</h2>
	<ul>
		{#each SOURCES as s (s.id)}
			<li>{#if s.url}<a href={s.url} rel="noopener">{s.text}</a>{:else}{s.text}{/if}</li>
		{/each}
		<li>Sūtra text, English glosses and heading scopes: <a href="https://ashtadhyayi.com" rel="noopener">ashtadhyayi.com</a> open data. Derivations: vidyut-prakriya (ambuda-org), run at build time.</li>
	</ul>
	<p class="muted small">Summaries of chapters and pādas are this site's, written from the heading sūtras and the sūtras of each pāda (see <a href={sutraHref('3.1.1')}>3.1.1</a> and the other headings linked above).</p>
</section>

<style>
	.hero {
		padding: 40px 0 8px;
		background: radial-gradient(1000px 360px at 90% -20%, color-mix(in srgb, var(--b-stem) 12%, transparent), transparent 70%);
	}
	h1 {
		font-size: clamp(32px, 5vw, 50px);
		margin: 4px 0 12px;
	}
	.lede {
		font-family: var(--font-serif);
		font-size: 19px;
		color: var(--ink-2);
		max-width: 46em;
	}
	.toc {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 14px;
	}
	.toc a {
		padding: 5px 12px;
		border-radius: 999px;
		border: 1px solid var(--line);
		background: var(--surface);
		text-decoration: none;
		color: var(--ink-2);
		font-size: 14px;
	}
	.toc a:hover {
		border-color: var(--saffron);
	}
	.block {
		padding-top: 44px;
	}
	.block h2 {
		font-size: clamp(24px, 3.4vw, 32px);
	}
	.intro {
		max-width: 50em;
		color: var(--ink-2);
	}
	.small {
		font-size: 13.5px;
	}
	/* ---- flow diagram ---- */
	.flow {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 28px minmax(0, 1.25fr) 28px minmax(0, 0.9fr);
		gap: 10px;
		align-items: center;
		margin-top: 18px;
	}
	.col {
		display: flex;
		flex-direction: column;
		gap: 10px;
		min-width: 0;
	}
	.arrow {
		font-size: 28px;
		color: var(--saffron);
		text-align: center;
	}
	.in,
	.out {
		padding: 12px 14px;
		font-size: 13.5px;
		box-shadow: none;
	}
	.in b,
	.out b {
		font-size: 14.5px;
	}
	.in p,
	.out p {
		margin: 4px 0 0;
		color: var(--ink-2);
	}
	.in ul {
		margin: 4px 0 0;
		padding-left: 18px;
		color: var(--ink-2);
	}
	.intent {
		border-style: dashed;
		background: color-mix(in srgb, var(--saffron) 6%, var(--surface));
	}
	.engine {
		padding: 16px 18px;
		border: 2px solid var(--b-stem);
		font-size: 14px;
	}
	.engine p {
		margin: 0;
		color: var(--ink-2);
	}
	.big {
		font-family: var(--font-serif);
		font-size: 28px;
	}
	.types {
		display: flex;
		height: 12px;
		border-radius: 6px;
		overflow: hidden;
	}
	.tlist,
	.ops {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 2px;
		font-size: 13px;
	}
	.tlist {
		grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
		color: var(--ink-2);
	}
	.tlist i {
		display: inline-block;
		width: 9px;
		height: 9px;
		border-radius: 2px;
		margin-right: 5px;
	}
	.ops li::before {
		content: '▸ ';
		color: var(--b-stem);
	}
	.eg {
		font-size: 14px;
		line-height: 1.8;
	}
	.eg .deva {
		font-size: 19px;
		font-weight: 600;
		color: var(--r-subject);
	}
	/* ---- verdict ---- */
	.verdict {
		padding: 18px 20px;
		display: grid;
		gap: 10px;
	}
	.verdict p {
		margin: 0;
	}
	.v {
		font-size: 16px;
	}
	table {
		border-collapse: collapse;
		width: 100%;
		font-size: 14px;
	}
	th {
		width: 52px;
		text-align: center;
		vertical-align: top;
		padding: 7px 6px;
		color: var(--c);
		font-family: var(--font-serif);
		font-size: 17px;
		border-left: 4px solid var(--c);
	}
	td {
		padding: 7px 8px;
		border-bottom: 1px solid var(--line);
		color: var(--ink-2);
	}
	.bars {
		display: grid;
		gap: 3px;
		font-size: 12.5px;
		margin-top: 6px;
	}
	.bh,
	.br {
		display: grid;
		grid-template-columns: 64px repeat(3, minmax(0, 1fr));
		gap: 10px;
		align-items: center;
	}
	.bh {
		color: var(--muted);
		font-weight: 600;
	}
	.br span {
		position: relative;
		height: 20px;
		display: flex;
		align-items: center;
	}
	.br i {
		display: block;
		height: 14px;
		border-radius: 3px;
		background: var(--c);
		min-width: 2px;
	}
	.br em {
		font-style: normal;
		margin-left: 6px;
		color: var(--ink-2);
		white-space: nowrap;
	}
	.ba {
		font-weight: 700;
		color: var(--c);
		justify-content: center;
	}
	.analogy {
		margin: 0 0 16px;
		max-width: 50em;
		font-size: 14.5px;
	}
	.analogy summary {
		cursor: pointer;
		font-weight: 600;
		color: var(--indigo);
	}
	.analogy ul {
		margin: 8px 0 0;
		padding-left: 20px;
		color: var(--ink-2);
	}
	.map-ph {
		height: 420px;
		display: grid;
		place-items: center;
		color: var(--muted);
	}
	.chgrid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
		gap: 16px;
	}
	.bandname {
		font-weight: 600;
	}
	.sources ul {
		padding-left: 20px;
		font-size: 14px;
		color: var(--ink-2);
	}
	.sources li {
		margin-bottom: 6px;
	}
	@media (max-width: 900px) {
		.flow {
			grid-template-columns: minmax(0, 1fr);
		}
		.arrow {
			transform: rotate(90deg);
			line-height: 1;
		}
	}
	@media (max-width: 600px) {
		.chgrid {
			grid-template-columns: minmax(0, 1fr);
		}
		.verdict {
			padding: 14px;
		}
		.bh,
		.br {
			grid-template-columns: 34px repeat(3, minmax(0, 1fr));
			gap: 6px;
		}
		.br em {
			font-size: 11px;
		}
		.br span {
			flex-direction: column;
			align-items: flex-start;
			height: auto;
		}
		.br em {
			margin-left: 0;
		}
	}
</style>
