<script lang="ts">
	import type { SceneProps } from '#lib/explainer/types.ts';
	import { sutraHref } from '#lib/links.ts';

	type D = { word: string; hash: string; steps: { code: string; source: string; s: string; terms: { t: string; ch: boolean }[] }[] };
	let { react, complete, panel, data }: SceneProps<{ bhavati: D }> = $props();
	const steps = $derived(data.bhavati.steps);
	let k = $state(-1);
	let line = $state(0);
	const LINES = [
		'state = [root, features]',
		'while (true) {',
		'  candidates = rules.filter(r => r.matches(state))',
		'  if (candidates.length === 0) break',
		'  rule = resolveConflict(candidates)   // apavāda, 1.4.2, …',
		'  state = rule.apply(state)            // ← one step',
		'}',
		'state = tripadi.reduce((s, r) => r.apply(s), state)  // 8.2.1: in order'
	];
	function step() {
		if (k >= steps.length - 1) return;
		k++;
		const tri = steps[k].code.startsWith('8.');
		line = tri ? 7 : 5;
		panel(steps[k].code);
		if (k === steps.length - 1) {
			react(`${steps.length} iterations, and the loop halts with भवति. This loop is a simplified model; vidyut itself encodes the rule order and conflict decisions directly in code.`, 'happy');
			complete();
		}
	}
</script>

<div class="cols">
	<pre class="code" aria-label="Interpreter pseudocode">{#each LINES as l, i (i)}<span class:hl={i === line && k >= 0}>{l}</span>
{/each}</pre>
	<div class="trace card">
		{#if k >= 0}
			<span class="eyebrow">iteration {k + 1}</span>
			<a class="code-ref" href={sutraHref(steps[k].code)}>{steps[k].code}</a>
			<span class="deva rs">{steps[k].s}</span>
			<span class="deva st">{#each steps[k].terms as t, j (j)}{#if j}<i> + </i>{/if}<b class:ch={t.ch}>{t.t}</b>{/each}</span>
		{:else}
			<span class="muted">Press Step to run one iteration.</span>
		{/if}
		<button class="btn primary" onclick={step} disabled={k >= steps.length - 1}>Step ▶</button>
	</div>
</div>

<style>
	.cols {
		display: grid;
		grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
		gap: 16px;
		align-items: start;
	}
	.code {
		margin: 0;
		padding: 14px 16px;
		border-radius: 12px;
		background: #1d2140;
		color: #c9cbef;
		font-family: var(--font-mono);
		font-size: 12.5px;
		line-height: 1.9;
		overflow-x: auto;
	}
	.code span.hl {
		background: rgb(240 162 76 / 0.3);
		color: #fff;
	}
	.trace {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 16px;
		min-height: 180px;
	}
	.code-ref {
		font-family: var(--font-mono);
		font-size: 16px;
	}
	.rs {
		font-size: 18px;
	}
	.st {
		font-size: 26px;
	}
	.st i {
		font-style: normal;
		color: var(--muted);
	}
	.st b {
		font-weight: 400;
	}
	.st b.ch {
		color: var(--saffron-ink);
		font-weight: 700;
	}
	.trace .btn {
		align-self: flex-start;
		margin-top: auto;
	}
	@media (max-width: 760px) {
		.cols {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
