<script lang="ts">
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete, panel }: SceneProps = $props();
	const RULES: Record<string, string[][]> = {
		'<verb>': [['<root>', '<vikarana>', '<ending>']],
		'<root>': [['भू'], ['पठ्'], ['वद्']],
		'<vikarana>': [['अ']],
		'<ending>': [['ति'], ['तः'], ['अन्ति']]
	};
	let form = $state<string[]>(['<verb>']);
	let history = $state<string[]>(['<verb>']);
	const isNT = (t: string) => t.startsWith('<');

	function expand(i: number, alt: number) {
		const sym = form[i];
		form = [...form.slice(0, i), ...RULES[sym][alt], ...form.slice(i + 1)];
		history = [...history, form.join(' ')];
		panel(sym);
		if (!form.some(isNT)) {
			react(`Done: ${form.join(' ')}. Only terminal symbols left. Hold on to this result.`, 'happy');
			complete();
		}
	}
	const reset = () => {
		form = ['<verb>'];
		history = ['<verb>'];
	};
</script>

<div class="cols">
	<pre class="code" aria-label="Grammar">{#each Object.entries(RULES) as [lhs, alts] (lhs)}<span class="nt">{lhs}</span> ::= {alts.map((a) => a.join(' ')).join(' | ')}
{/each}</pre>
	<div class="card play">
		<span class="eyebrow">current string · tap a symbol to expand it</span>
		<div class="form">
			{#each form as t, i (i + t)}
				{#if isNT(t)}
					<span class="ntbox">
						<span class="ntname">{t}</span>
						<span class="alts">
							{#each RULES[t] as alt, k (k)}<button class="btn deva" onclick={() => expand(i, k)}>{alt.join(' ')}</button>{/each}
						</span>
					</span>
				{:else}
					<span class="term deva">{t}</span>
				{/if}
			{/each}
		</div>
		<ol class="hist">{#each history as h, i (i)}<li class="deva">{h}</li>{/each}</ol>
		<button class="btn" onclick={reset}>Reset</button>
	</div>
</div>

<style>
	.cols {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
		gap: 16px;
		align-items: start;
	}
	.code {
		margin: 0;
		padding: 14px 16px;
		border-radius: 12px;
		background: #1d2140;
		color: #e6e8ff;
		font-family: var(--font-mono), var(--font-deva);
		font-size: 13.5px;
		line-height: 1.9;
		overflow-x: auto;
	}
	.nt {
		color: #5fe0c0;
	}
	.play {
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.form {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: flex-start;
	}
	.ntbox {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 6px;
		border-radius: 10px;
		border: 2px dashed var(--indigo);
		background: var(--indigo-soft);
	}
	.ntname {
		font-family: var(--font-mono);
		font-size: 13px;
		color: var(--indigo);
	}
	.alts {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
	}
	.alts .btn {
		font-size: 15px;
		padding: 2px 10px;
	}
	.term {
		font-size: 30px;
		padding: 0 8px;
		border-radius: 8px;
		background: var(--saffron-soft);
	}
	.hist {
		margin: 0;
		padding-left: 22px;
		font-size: 14px;
		color: var(--ink-2);
	}
	.play > .btn {
		align-self: flex-start;
	}
	@media (max-width: 760px) {
		.cols {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
