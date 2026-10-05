<script lang="ts">
	import { resolve } from '$app/paths';
	import ItRuleRef from '#lib/components/ItRuleRef.svelte';
	import { CONTEXTS, type ItContext } from '#lib/it.ts';
	import { traceIts, type TraceStep } from '#lib/it-trace.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();

	// Each upadeśa runs through the checks of 1.3.2–1.3.8 in order, then 1.3.9 deletes what was marked.
	const CHOICES: { u: string; ctx: ItContext }[] = [
		{ u: 'ण्वुल्', ctx: 'pratyaya' },
		{ u: 'ष्वुन्', ctx: 'pratyaya' },
		{ u: 'जस्', ctx: 'vibhakti' },
		{ u: 'डुकृञ्', ctx: 'dhatu' },
		{ u: 'रुधिँर्', ctx: 'dhatu' },
		{ u: 'ठक्', ctx: 'taddhita' },
		{ u: 'लँट्', ctx: 'pratyaya' }
	];
	const QUESTION: Record<string, string> = {
		'1.3.2': 'Any nasalised vowel?',
		'1.3.3.1': 'A root ending in इँर्?',
		'1.3.3': 'Ends in a consonant?',
		'1.3.4': 'A vibhakti ending in a t-row sound, स् or म्?',
		'1.3.5': 'A root beginning with ञि, टु or डु?',
		'1.3.6': 'An affix beginning with ष्?',
		'1.3.7': 'An affix beginning with a c- or ṭ-row sound?',
		'1.3.8': 'A non-taddhita affix beginning with ल्, श् or a k-row sound?',
		'1.3.9': 'Delete every it.'
	};
	const ANSWER: Record<TraceStep['status'], string> = { fired: 'yes', blocked: 'yes, but blocked', no: 'no', na: 'skip' };

	let sel = $state(0);
	let pos = $state(0);
	const finished = new Set<number>();
	const choice = $derived(CHOICES[sel]);
	const trace = $derived(traceIts(choice.u, choice.ctx));
	const shown = $derived(trace.steps.slice(0, pos));
	const current = $derived(trace.steps[pos - 1]);
	// a sound gets its colour once the step that decides it has been shown
	const decided = $derived.by(() => {
		const out = new Map<number, 'it' | 'kept'>();
		for (const s of shown) for (const i of s.on) if (s.status === 'fired' && s.rule !== '1.3.9' && s.rule !== '1.3.4') out.set(i, 'it');
		for (const s of shown) for (const i of s.on) if (s.status === 'blocked' || s.rule === '1.3.4') out.set(i, 'kept');
		return out;
	});
	const done = $derived(pos >= trace.steps.length);

	function pick(i: number) {
		sel = i;
		pos = 0;
		react(`${CHOICES[i].u}: a ${CONTEXTS.find((c) => c.id === CHOICES[i].ctx)!.label.toLowerCase()}. Step through the checks.`, 'think');
	}
	function step() {
		if (done) return;
		pos++;
		const s = trace.steps[pos - 1];
		if (pos >= trace.steps.length) finish();
		else react(`${s.rule}: ${s.why}.`, s.status === 'fired' ? 'happy' : s.status === 'blocked' ? 'surprised' : 'think');
	}
	function runAll() {
		pos = trace.steps.length;
		finish();
	}
	function finish() {
		finished.add(sel);
		const marked = trace.steps.filter((s) => s.status === 'fired' && s.rule !== '1.3.9' && s.rule !== '1.3.4').map((s) => s.rule);
		react(`${choice.u} → ${trace.result}. ${marked.length ? `Tags marked by ${marked.join(', ')}` : 'No tags'}; 1.3.9 deletes them all at once.`, 'happy');
		if (finished.size >= 2) complete();
	}
</script>

<div class="list" role="group" aria-label="Upadeśas">
	{#each CHOICES as c, i (c.u)}
		<button class="btn deva" aria-pressed={sel === i} onclick={() => pick(i)}>{c.u}</button>
	{/each}
</div>

<div class="flow">
	<div class="left">
		<span class="kind">{CONTEXTS.find((c) => c.id === choice.ctx)?.label}</span>
		<div class="tiles">
			{#each trace.units as u, i (i)}
				<span class="tile deva" class:it={decided.get(i) === 'it'} class:kept={decided.get(i) === 'kept'} class:on={current?.on.includes(i)} class:gone={done && u.it}>{u.v}</span>
			{/each}
		</div>
		<div class="res">
			{#if done}
				<span class="muted">after 1.3.9</span> <b class="deva">{trace.result || '∅'}</b>
			{:else}
				<span class="muted">{pos ? `check ${pos} of ${trace.steps.length}` : 'ready'}</span>
			{/if}
		</div>
		<div class="ctl">
			<button class="btn primary" onclick={step} disabled={done}>{pos ? 'Next check' : 'Start'}</button>
			<button class="btn" onclick={runAll} disabled={done}>Run all</button>
			<button class="btn" onclick={() => (pos = 0)} disabled={!pos}>Reset</button>
		</div>
	</div>

	<ol class="chart" aria-label="Decision flow">
		{#each trace.steps as s, k (s.rule)}
			{@const seen = k < pos}
			<li class="node {seen ? (s.rule === '1.3.4' && s.status === 'fired' ? 'blocked' : s.status) : ''}" class:cur={k === pos - 1}>
				<span class="q">{QUESTION[s.rule]} <ItRuleRef n={s.rule} /></span>
				{#if seen}
					<span class="a"><b>{ANSWER[s.status]}</b>{#if s.by}&nbsp;by <ItRuleRef n={s.by} />{/if} · {s.why}</span>
				{/if}
			</li>
		{/each}
	</ol>
</div>
<p class="muted note">
	The order matters only for reading: every check looks at the upadeśa as taught, and <ItRuleRef n="1.3.9" /> removes all the marked letters together.
	Try any root or affix in the <a href={resolve('/tools') + '/anubandha/'}>it-letter finder</a>.
</p>

<style>
	.list {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-bottom: 16px;
	}
	.list .btn {
		font-size: 18px;
	}
	.flow {
		display: grid;
		grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
		gap: 22px;
		align-items: start;
	}
	.left {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.kind {
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--muted);
		font-weight: 600;
	}
	.tiles {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.tile {
		min-width: 52px;
		padding: 4px 8px;
		text-align: center;
		font-size: 32px;
		border-radius: 10px;
		border: 2px solid var(--line);
		background: var(--surface);
		transition: all 0.25s;
	}
	.tile.it {
		border: 2px dashed var(--it);
		background: var(--it-soft);
		color: var(--it);
	}
	.tile.kept {
		border-color: var(--saffron);
		background: var(--saffron-soft);
	}
	.tile.on {
		box-shadow: 0 0 0 3px var(--focus);
		transform: translateY(-3px);
	}
	.tile.gone {
		opacity: 0.35;
		text-decoration: line-through;
	}
	.res {
		font-size: 15px;
	}
	.res b {
		font-size: 28px;
		margin-left: 6px;
	}
	.ctl {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.chart {
		list-style: none;
		margin: 0;
		padding: 0 0 0 14px;
		border-left: 2px solid var(--line);
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.node {
		position: relative;
		padding: 6px 10px;
		border-radius: 10px;
		border: 1px solid var(--line);
		background: var(--surface);
		font-size: 14px;
		display: flex;
		flex-direction: column;
		gap: 2px;
		color: var(--muted);
	}
	.node::before {
		content: '';
		position: absolute;
		left: -21px;
		top: 12px;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--line);
	}
	.node.fired,
	.node.blocked,
	.node.no,
	.node.na {
		color: var(--ink);
	}
	.node.fired {
		border-color: var(--it);
		background: var(--it-soft);
	}
	.node.fired::before {
		background: var(--it);
	}
	.node.blocked {
		border-color: var(--saffron);
		background: var(--saffron-soft);
	}
	.node.blocked::before {
		background: var(--saffron);
	}
	.node.na {
		opacity: 0.6;
	}
	.node.cur {
		box-shadow: 0 0 0 2px var(--focus);
	}
	.a {
		color: var(--ink-2);
		font-size: 13.5px;
	}
	.note {
		margin-top: 16px;
		font-size: 14px;
		max-width: 48em;
	}
	@media (max-width: 760px) {
		.flow {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
