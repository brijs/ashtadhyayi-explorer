<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import { devaToIast } from '#lib/translit.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	type S = { n: string; s: string; en: string; pc: { w: string; role: string }[]; an: string[] };
	let { react, complete, panel, data }: SceneProps<{ sutras: S[] }> = $props();
	let sel = $state(0);
	let seen = new Set<number>([0]);
	const s = $derived(data.sutras[sel]);
	const FIELD: Record<string, string> = { target: 'target', subject: 'substitute', left: 'after', right: 'before' };
	const VIA: Record<string, string> = { target: '6th case · 1.1.49', subject: '1st case', left: '5th case · 1.1.67', right: '7th case · 1.1.66' };
	const obj = $derived.by(() => {
		const o: Record<string, string> = {};
		for (const p of s.pc) if (FIELD[p.role]) o[FIELD[p.role]] = (o[FIELD[p.role]] ? o[FIELD[p.role]] + ' ' : '') + p.w;
		return o;
	});
	function pick(i: number) {
		sel = i;
		seen.add(i);
		panel(data.sutras[i].n);
		const x = data.sutras[i];
		react(x.an.length ? `Parsed. Note: ${x.an.join(', ')} is inherited from an earlier sūtra and fills a field too.` : 'Parsed: every field comes from a case ending.', 'happy');
		if (seen.size >= 3) complete();
	}
</script>

<div class="picks">
	{#each data.sutras as x, i (x.n)}
		<button class="btn deva" aria-pressed={sel === i} onclick={() => pick(i)}>{x.s}</button>
	{/each}
</div>

<div class="cols">
	<div class="src card">
		<span class="eyebrow">source: <SutraRef n={s.n} /></span>
		<div class="words">
			{#each s.pc as p, i (i)}
				<span class="w" style="--c: var(--r-{p.role})"><span class="deva">{p.w}</span><small>{VIA[p.role] ?? p.role}</small></span>
			{/each}
			{#each s.an as a (a)}<span class="w inh"><span class="deva">{a}</span><small>inherited</small></span>{/each}
		</div>
	</div>
	<pre class="code" aria-label="Compiled rule"><span class="k">rule</span>(<span class="s">'{s.n}'</span>) = &#123;
{#each Object.entries(obj) as [k, val] (k)}  {k}: <span class="s">'{val}'</span>,   <span class="c">// {devaToIast(val)}</span>
{/each}{#if s.an.length}  inherited: [{s.an.map((a) => `'${a}'`).join(', ')}],
{/if}&#125;</pre>
</div>
<p class="muted note">{s.en}</p>

<style>
	.picks {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-bottom: 14px;
	}
	.picks .btn {
		font-size: 16px;
	}
	.cols {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 16px;
		align-items: start;
	}
	.src {
		padding: 14px;
	}
	.words {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 8px;
	}
	.w {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 4px 12px;
		border-radius: 10px;
		border: 2px solid color-mix(in srgb, var(--c, var(--line)) 60%, transparent);
		background: color-mix(in srgb, var(--c, var(--line)) 10%, var(--surface));
	}
	.w .deva {
		font-size: 22px;
	}
	.w small {
		font-size: 11px;
		color: var(--muted);
	}
	.w.inh {
		border-style: dashed;
		border-color: var(--indigo);
		background: var(--indigo-soft);
	}
	.code {
		margin: 0;
		padding: 14px 16px;
		border-radius: 12px;
		background: #1d2140;
		color: #e6e8ff;
		font-family: var(--font-mono), var(--font-deva);
		font-size: 13.5px;
		line-height: 1.8;
		overflow-x: auto;
	}
	.k { color: #5fe0c0; }
	.s { color: #f6bb79; }
	.c { color: #8b90b8; }
	.note {
		margin-top: 12px;
		font-size: 14px;
	}
	@media (max-width: 760px) {
		.cols {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
