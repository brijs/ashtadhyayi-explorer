<script lang="ts">
	import { rewrite, RULES, type RewriteRule } from '#lib/rewrite.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete, panel }: SceneProps = $props();
	const r101 = RULES.find((r) => r.id === '6.1.101')!;
	const r77 = RULES.find((r) => r.id === '6.1.77')!;
	let generalFirst = $state(false);
	const order = $derived<RewriteRule[]>(generalFirst ? [r77, r101] : [r101, r77]);
	const ids = $derived(new Set(order.map((r) => r.id)));
	const TESTS: [string, string, string][] = [['दधि', 'इह', 'दधीह'], ['दधि', 'अत्र', 'दध्यत्र'], ['मधु', 'उदकम्', 'मधूदकम्']];
	let flips = 0;
	function flip() {
		generalFirst = !generalFirst;
		flips++;
		panel(generalFirst ? 'WARN: unreachable' : 'ok');
		react(generalFirst ? 'With the catch-all first, the specific clause can never match its own cases: दध्यिह, मध्वुदकम्. A compiler would warn "unreachable pattern".' : 'Specific first, catch-all last: every test passes.', generalFirst ? 'surprised' : 'happy');
		if (flips >= 2) complete();
	}
</script>

<div class="cols">
	<pre class="code"><span class="k">match</span> (v, next) &#123;
{#each order as r, i (r.id)}  <span class="pat">{r.id === '6.1.101' ? '(ak, similar(ak))' : '(ik, ac)        '}</span> =&gt; <span class="s">{r.id}</span>   <span class="c">// {r.id === '6.1.101' ? 'specific' : 'general'}</span>{#if generalFirst && r.id === '6.1.101'}  <span class="warn">⚠ unreachable for i/u/ṛ cases</span>{/if}
{/each}  _ =&gt; no change
&#125;</pre>
	<div class="card res">
		<button class="btn" onclick={flip}>{generalFirst ? 'Put the specific clause first' : 'Move the catch-all clause first'}</button>
		<table>
			<tbody>
				{#each TESTS as [a, b, want] (a + b)}
					{@const got = rewrite(a, b, ids, order).result}
					<tr class:bad={got !== want}><td class="deva">{a} + {b}</td><td class="deva">{got}</td><td>{got === want ? '✓' : '✗'}</td></tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
<p class="muted note">
	Kiparsky formulated the <b>Elsewhere Condition</b> ("'Elsewhere' in phonology", 1973) and traced it to Pāṇini's principle
	that an exception (apavāda) blocks the general rule (utsarga).
</p>

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
		color: #e6e8ff;
		font-family: var(--font-mono);
		font-size: 13px;
		line-height: 1.9;
		overflow-x: auto;
	}
	.k { color: #5fe0c0; }
	.s { color: #f6bb79; }
	.c { color: #8b90b8; }
	.pat { color: #a3a8ff; }
	.warn { color: #ff9cad; }
	.res {
		padding: 14px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.res .btn {
		align-self: flex-start;
		font-size: 13px;
	}
	table {
		border-collapse: collapse;
		font-size: 17px;
	}
	td {
		padding: 4px 10px 4px 0;
		border-top: 1px solid var(--line);
	}
	tr.bad td {
		color: var(--r-target);
	}
	.note {
		margin-top: 14px;
		font-size: 14px;
		max-width: 50em;
	}
	@media (max-width: 760px) {
		.cols {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
