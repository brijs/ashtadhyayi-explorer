<script lang="ts">
	import { RULES, rewrite, TESTS, type TraceStep } from '#lib/rewrite.ts';
	import { toSlp1, slp1ToDeva } from '#lib/slp1.ts';
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete, panel }: SceneProps = $props();
	let a = $state('दधि');
	let b = $state('अत्र');
	let result = $state('');
	let trace = $state<TraceStep[]>([]);
	let runs = 0;
	const all = new Set(RULES.map((r) => r.id));
	const norm = (s: string) => (/[ऀ-ॿ]/.test(s) ? s.trim() : slp1ToDeva(toSlp1(s)));

	function run() {
		const r = rewrite(norm(a), norm(b), all);
		result = r.result;
		trace = r.trace;
		runs++;
		if (r.trace.length) {
			panel(r.trace[0].rule.id);
			react(`${r.trace[0].rule.id} fired: ${r.trace[0].rule.gloss}.`, 'happy');
		} else {
			panel('no match');
			react('No rule matched at the junction, so the words stay apart.', 'think');
		}
		if (runs >= 2) complete();
	}
	function pick(i: number) {
		a = TESTS[i].a;
		b = TESTS[i].b;
		run();
	}
</script>

<div class="grid">
	<pre class="code" aria-label="Rule as data"><span class="c">// 6.1.77 इको यणचि as data</span>
<span class="k">const</span> rule = &#123;
  id: <span class="s">'6.1.77'</span>,
  target:  IK,    <span class="c">// इकः  (6th case: "in place of")</span>
  replace: YAN,   <span class="c">// यण्  (1st case: the substitute)</span>
  right:   AC,    <span class="c">// अचि  (7th case: "before")</span>
&#125;;
<span class="c">// the engine: first matching rule wins</span>
<span class="k">for</span> (<span class="k">const</span> r <span class="k">of</span> rules)
  <span class="k">if</span> (r.matches(v, next)) <span class="k">return</span> r.apply(v, next);</pre>

	<div class="run card">
		<div class="inputs">
			<input bind:value={a} aria-label="First word" />
			<span class="plus">+</span>
			<input bind:value={b} aria-label="Second word" />
			<button class="btn primary" onclick={run}>Run</button>
		</div>
		<p class="muted small">Devanagari, IAST or SLP1. Or pick one:</p>
		<div class="ex">
			{#each TESTS.slice(0, 13) as t, i (i)}
				<button class="btn deva" onclick={() => pick(i)}>{t.a}+{t.b}</button>
			{/each}
		</div>
		{#if result}
			<div class="out">
				<span class="deva res">{result}</span>
				{#if trace[0]}<span class="fired">by <SutraRef n={trace[0].rule.id} s={trace[0].rule.sutra} /></span>{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 18px;
		align-items: start;
	}
	.code {
		margin: 0;
		padding: 16px 18px;
		border-radius: 12px;
		background: #1d2140;
		color: #e6e8ff;
		font-family: var(--font-mono), var(--font-deva);
		font-size: 13px;
		line-height: 1.7;
		overflow-x: auto;
	}
	.c { color: #8b90b8; }
	.k { color: #5fe0c0; }
	.s { color: #f6bb79; }
	.run {
		padding: 16px;
	}
	.inputs {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.inputs input {
		flex: 1;
		min-width: 0;
		padding: 8px 10px;
		border-radius: 8px;
		border: 1px solid var(--line);
		background: var(--bg);
		color: var(--ink);
		font-family: var(--font-deva);
		font-size: 19px;
	}
	.plus {
		color: var(--muted);
	}
	.small {
		font-size: 13px;
		margin: 10px 0 6px;
	}
	.ex {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
	}
	.ex .btn {
		font-size: 14px;
		padding: 2px 10px;
	}
	.out {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 12px;
		margin-top: 16px;
		padding-top: 12px;
		border-top: 1px dashed var(--line);
	}
	.res {
		font-size: 32px;
		font-weight: 600;
		color: var(--r-subject);
	}
	.fired {
		font-size: 14px;
	}
	@media (max-width: 860px) {
		.grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
