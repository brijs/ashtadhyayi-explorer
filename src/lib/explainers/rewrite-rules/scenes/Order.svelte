<script lang="ts">
	import { flip } from 'svelte/animate';
	import { RULES, rewrite, TESTS, type RewriteRule } from '#lib/rewrite.ts';
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete, panel }: SceneProps = $props();
	let order = $state<RewriteRule[]>([...RULES]);
	const all = new Set(RULES.map((r) => r.id));
	const failing = $derived(TESTS.filter((t) => rewrite(t.a, t.b, all, order).result !== t.want));
	let moves = 0;

	function move(i: number, d: -1 | 1) {
		const j = i + d;
		if (j < 0 || j >= order.length) return;
		const o = [...order];
		[o[i], o[j]] = [o[j], o[i]];
		order = o;
		moves++;
		const f = TESTS.filter((t) => rewrite(t.a, t.b, all, o).result !== t.want);
		panel(f.length ? `${f.length} FAIL` : 'all pass');
		if (f.length) react(`Now ${f.map((t) => `${t.a}+${t.b} → ${rewrite(t.a, t.b, all, o).result}`).join(', ')}. The general rule grabbed a case meant for the exception.`, 'surprised');
		else react('All tests pass: every exception sits above the rule it overrides.', 'happy');
		if (moves >= 1) complete();
	}
	const reset = () => {
		order = [...RULES];
		panel('reset');
	};
</script>

<div class="cols">
	<ol class="rules">
		{#each order as r, i (r.id)}
			<li animate:flip={{ duration: 250 }}>
				<span class="pos">{i + 1}</span>
				<span class="id">{r.id}</span>
				<span class="deva s">{r.sutra}</span>
				<span class="mv">
					<button onclick={() => move(i, -1)} disabled={i === 0} aria-label="Move {r.id} up">▲</button>
					<button onclick={() => move(i, 1)} disabled={i === order.length - 1} aria-label="Move {r.id} down">▼</button>
				</span>
			</li>
		{/each}
	</ol>
	<div class="status card" class:bad={failing.length > 0}>
		<span class="big">{failing.length ? `${failing.length} failing` : 'all 13 pass'}</span>
		{#each failing as t (t.a + t.b)}
			<span class="deva f">{t.a} + {t.b} → {rewrite(t.a, t.b, all, order).result} <small>(want {t.want})</small></span>
		{/each}
		<button class="btn" onclick={reset}>Reset order</button>
	</div>
</div>

<div class="explain">
	<h2>How Pāṇini decides</h2>
	<p>
		Our engine needs an explicit priority list. Pāṇini relies on principles the tradition spells out: an exception
		(<i>apavāda</i>) beats the general rule it was made for, since otherwise it could never apply. 6.1.101 is an exception
		to 6.1.77, and 6.1.88 to 6.1.87. When two rules of equal standing clash, <SutraRef n="1.4.2" s="विप्रतिषेधे परं कार्यम्" />
		says the later one wins. Later lessons dig into these conflict rules.
	</p>
</div>

<style>
	.cols {
		display: grid;
		grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
		gap: 18px;
		align-items: start;
	}
	.rules {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	li {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 12px;
		border-radius: 10px;
		border: 1px solid var(--line);
		background: var(--surface);
	}
	.pos {
		font-family: var(--font-mono);
		color: var(--muted);
		font-size: 12px;
	}
	.id {
		font-family: var(--font-mono);
		font-size: 13px;
		color: var(--saffron-ink);
	}
	.s {
		flex: 1;
		font-size: 18px;
		min-width: 0;
	}
	.mv {
		display: flex;
		gap: 4px;
	}
	.mv button {
		width: 30px;
		height: 28px;
		border-radius: 6px;
		border: 1px solid var(--line);
		background: var(--surface-2);
		cursor: pointer;
		color: var(--ink);
		font-size: 11px;
	}
	.mv button:disabled {
		opacity: 0.3;
		cursor: default;
	}
	.status {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 16px;
		border-color: var(--r-subject);
	}
	.status.bad {
		border-color: var(--r-target);
	}
	.big {
		font-weight: 700;
		font-size: 18px;
		color: var(--r-subject);
	}
	.bad .big {
		color: var(--r-target);
	}
	.f {
		font-size: 17px;
	}
	.f small {
		font-family: var(--font-ui);
		color: var(--muted);
		font-size: 12px;
	}
	.status .btn {
		align-self: flex-start;
		margin-top: 6px;
	}
	.explain {
		margin-top: 20px;
		max-width: 48em;
		font-size: 15px;
	}
	.explain h2 {
		font-size: 19px;
	}
	@media (max-width: 760px) {
		.cols {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
