<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	let hasClass = $state(true);
	let swapped = $state(false);
	let moves = 0;
	type R = { sel: string; color: string; spec: number; label: string };
	const general: R = { sel: 'p', color: 'var(--r-left)', spec: 1, label: 'blue' };
	const specific: R = { sel: 'p.exception', color: 'var(--r-target)', spec: 11, label: 'red' };
	const general2: R = { sel: 'p', color: 'var(--r-subject)', spec: 1, label: 'green' };
	const rules = $derived(swapped ? [specific, general, general2] : [general, specific, general2]);
	const winner = $derived.by(() => {
		const matching = rules.filter((r) => r.sel === 'p' || hasClass);
		return matching.reduce((w, r) => (r.spec > w.spec || (r.spec === w.spec && rules.indexOf(r) > rules.indexOf(w)) ? r : w));
	});
	function toggle(kind: 'class' | 'swap') {
		if (kind === 'class') hasClass = !hasClass;
		else swapped = !swapped;
		moves++;
		react(
			winner === specific
				? 'The specific selector wins wherever it applies, regardless of order: the apavāda principle.'
				: `Only plain p rules match; between equals, the later one wins (green): that is 1.4.2 विप्रतिषेधे परं कार्यम्.`,
			'happy'
		);
		if (moves >= 2) complete();
	}
</script>

<div class="cols">
	<pre class="code">{#each rules as r, i (r.sel + r.label)}<span class="sel">{r.sel}</span> &#123; color: <span class="v">{r.label}</span> &#125;   <span class="c">/* rule {i + 1}, specificity {r.spec === 11 ? '(0,1,1)' : '(0,0,1)'} */</span>
{/each}</pre>
	<div class="demo card">
		<p class="sample" style="color: {winner.color}">&lt;p{hasClass ? ' class="exception"' : ''}&gt; This text is {winner.label}.</p>
		<div class="btns">
			<button class="btn" aria-pressed={hasClass} onclick={() => toggle('class')}>class="exception"</button>
			<button class="btn" aria-pressed={swapped} onclick={() => toggle('swap')}>Move the specific rule first</button>
		</div>
	</div>
</div>
<table class="map">
	<thead><tr><th>CSS</th><th>Pāṇini</th></tr></thead>
	<tbody>
		<tr><td>More specific selector wins</td><td>An exception (apavāda) beats the general rule (utsarga)</td></tr>
		<tr><td>Equal specificity: the later rule wins</td><td><SutraRef n="1.4.2" s="विप्रतिषेधे परं कार्यम्" />: in a conflict, the later rule applies</td></tr>
	</tbody>
</table>

<style>
	.cols {
		display: grid;
		grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
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
	.sel { color: #5fe0c0; }
	.v { color: #f6bb79; }
	.c { color: #8b90b8; }
	.demo {
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.sample {
		font-family: var(--font-mono);
		font-size: 15px;
		font-weight: 700;
		margin: 0;
		transition: color 0.3s;
	}
	.btns {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.btns .btn {
		font-size: 13px;
	}
	.map {
		margin-top: 18px;
		border-collapse: collapse;
		max-width: 760px;
		font-size: 14.5px;
	}
	.map th,
	.map td {
		text-align: left;
		padding: 6px 12px 6px 0;
		border-top: 1px solid var(--line);
	}
	.map th {
		font-size: 12px;
		color: var(--muted);
	}
	@media (max-width: 760px) {
		.cols {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
