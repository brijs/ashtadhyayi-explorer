<script lang="ts">
	import { untrack } from 'svelte';
	import SutraRef from '#lib/components/SutraRef.svelte';
	import { applyRule, sutraText, END, TARGET_OPTIONS, SUBST_OPTIONS, CONTEXT_OPTIONS, type DslRule, type Challenge } from '#lib/dsl.ts';
	import { lettersOf } from '#lib/phonetics.ts';
	import { devaToIast } from '#lib/translit.ts';

	let {
		challenge = null,
		initial = { target: 'अच्', subst: 'अच्', left: null, right: null },
		onchange,
		onsolved
	}: {
		challenge?: Challenge | null;
		initial?: DslRule;
		onchange?: (r: DslRule) => void;
		onsolved?: () => void;
	} = $props();

	// the builder owns its slots after mount; `initial` only seeds them
	const init = untrack(() => initial);
	let target = $state(init.target);
	let subst = $state(init.subst);
	let left = $state<string | null>(init.left);
	let right = $state<string | null>(init.right);
	let solvedOnce = false;
	let custom = $state('दधि अत्र');

	const rule = $derived<DslRule>({ target, subst, left, right });
	const words = $derived(sutraText(rule));
	const results = $derived(challenge ? challenge.tests.map((t) => ({ ...t, got: applyRule(rule, t.input).output })) : []);
	const solved = $derived(!!challenge && results.every((r) => r.got === r.want));
	const customOut = $derived(applyRule(rule, custom));

	$effect(() => {
		onchange?.(rule);
	});
	$effect(() => {
		if (solved && !solvedOnce) {
			solvedOnce = true;
			onsolved?.();
		}
	});
	const ROLE = ['6th: in place of', '1st: substitute', '5th: after', '7th: before'];
</script>

<div class="builder">
	<div class="slots">
		<label class="slot" style="--c: var(--r-target)">
			<span class="lab">target <small>{ROLE[0]}</small></span>
			<select bind:value={target} class="deva">{#each TARGET_OPTIONS as o (o)}<option value={o}>{o}</option>{/each}</select>
			<small class="set deva">{lettersOf(target).join(' ')}</small>
		</label>
		<label class="slot" style="--c: var(--r-subject)">
			<span class="lab">substitute <small>{ROLE[1]}</small></span>
			<select bind:value={subst} class="deva">{#each SUBST_OPTIONS as o (o)}<option value={o}>{o}</option>{/each}</select>
			<small class="set deva">{lettersOf(subst).join(' ')}</small>
		</label>
		<label class="slot" style="--c: var(--r-left)">
			<span class="lab">left context <small>{ROLE[2]}</small></span>
			<select bind:value={left} class="deva"><option value={null}>none</option>{#each CONTEXT_OPTIONS as o (o)}<option value={o}>{o}</option>{/each}</select>
		</label>
		<label class="slot" style="--c: var(--r-right)">
			<span class="lab">right context <small>{ROLE[3]}</small></span>
			<select bind:value={right} class="deva"><option value={null}>none</option><option value={END}>end of word (अन्ते)</option>{#each CONTEXT_OPTIONS as o (o)}<option value={o}>{o}</option>{/each}</select>
		</label>
	</div>

	<div class="out">
		<div class="sutra card">
			<span class="eyebrow">your sūtra</span>
			<span class="deva big">{words.join(' ')}</span>
			<span class="iast">{words.map(devaToIast).join(' ')}</span>
			{#if left}<small class="muted">Note: the 5th case of these names looks just like the 6th; Pāṇini's readers rely on context to tell them apart.</small>{/if}
		</div>
		<pre class="code">rule = &#123; target: <span class="s">'{target}'</span>, substitute: <span class="s">'{subst}'</span>{#if left}, after: <span class="s">'{left}'</span>{/if}{#if right}, before: <span class="s">'{right === END ? 'END' : right}'</span>{/if} &#125;
<span class="c">// choose the nearest substitute by 1.1.50</span></pre>
	</div>

	{#if challenge}
		<table class="tests">
			<thead><tr><th>input</th><th>expected</th><th>your rule</th><th></th></tr></thead>
			<tbody>
				{#each results as r (r.input)}
					<tr class:pass={r.got === r.want}><td class="deva">{r.input}</td><td class="deva">{r.want}</td><td class="deva">{r.got}</td><td>{r.got === r.want ? '✓' : '✗'}</td></tr>
				{/each}
			</tbody>
		</table>
		{#if solved && challenge.pāṇini}
			<p class="pan card">Solved! Pāṇini's version: <SutraRef n={challenge.pāṇini.n} s={challenge.pāṇini.s} />. {challenge.pāṇini.note}</p>
		{/if}
	{:else}
		<div class="try card">
			<label>Try it on: <input bind:value={custom} class="deva" aria-label="Words to test" /></label>
			<span class="deva res">→ {customOut.output}</span>
			<small class="muted">{customOut.changes.length ? customOut.changes.map((c) => `${c.from} → ${c.to}`).join(', ') : 'no change'}</small>
		</div>
	{/if}
</div>

<style>
	.builder {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.slots {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 10px;
	}
	.slot {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 10px;
		border-radius: 12px;
		border: 2px solid color-mix(in srgb, var(--c) 50%, transparent);
		background: color-mix(in srgb, var(--c) 7%, var(--surface));
	}
	.lab {
		font-size: 12px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--c);
	}
	.lab small {
		display: block;
		font-weight: 500;
		text-transform: none;
		letter-spacing: 0;
		color: var(--muted);
	}
	select,
	input {
		padding: 6px 8px;
		border-radius: 8px;
		border: 1px solid var(--line);
		background: var(--surface);
		color: var(--ink);
		font-size: 18px;
		font-family: var(--font-deva), var(--font-ui);
		min-width: 0;
	}
	.set {
		font-size: 13px;
		color: var(--ink-2);
		min-height: 1.4em;
	}
	.out {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 12px;
	}
	.sutra {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 12px 16px;
	}
	.big {
		font-size: 32px;
		font-weight: 600;
		line-height: 1.4;
	}
	.code {
		margin: 0;
		padding: 12px 14px;
		border-radius: 12px;
		background: #1d2140;
		color: #e6e8ff;
		font-family: var(--font-mono), var(--font-deva);
		font-size: 12.5px;
		line-height: 1.8;
		white-space: pre-wrap;
	}
	.s { color: #f6bb79; }
	.c { color: #8b90b8; }
	.tests {
		border-collapse: collapse;
		max-width: 620px;
		font-size: 17px;
	}
	.tests th {
		text-align: left;
		font-size: 12px;
		color: var(--muted);
		padding: 4px 10px 4px 0;
	}
	.tests td {
		padding: 4px 10px 4px 0;
		border-top: 1px solid var(--line);
		color: var(--r-target);
	}
	.tests tr.pass td {
		color: var(--r-subject);
	}
	.pan {
		padding: 12px 16px;
		margin: 0;
		border-color: var(--r-subject);
	}
	.try {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 12px 16px;
	}
	.try label {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}
	.res {
		font-size: 26px;
		color: var(--r-subject);
	}
	@media (max-width: 860px) {
		.slots {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.out {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
