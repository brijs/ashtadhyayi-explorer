<script lang="ts">
	import { sutraHref } from '#lib/links.ts';
	import { detectIts, stripIts, type ItContext } from '#lib/it.ts';
	import type { ResolvedTable, Text } from '#lib/tables.ts';
	import type { SutraStub } from '#lib/types.ts';
	import ItWord from './ItWord.svelte';

	// A sūtra's list laid out as the table it implies (see src/lib/tables.ts). Affixes show their it-letters.
	let { table, refs }: { table: ResolvedTable; refs: Record<string, SutraStub> } = $props();
	const stubOf = (n: string) => Object.values(refs).find((r) => r.n === n);
	const remains = (t: string, ctx: ItContext) => stripIts(detectIts(t, ctx));
</script>

{#snippet item(t: Text, ctx: ItContext | undefined)}
	<span class="item deva">
		{#if ctx}<ItWord text={t.text} {ctx} />{:else}{t.text}{/if}
	</span>
	{#if ctx && remains(t.text, ctx) !== t.text}<span class="rest deva" title="after the it-letters are dropped (1.3.9)">→ {remains(t.text, ctx) || '∅'}</span>{/if}
	{#if t.written}<span class="written">written <span class="deva">{t.written}</span></span>{/if}
{/snippet}

{#snippet label(l: { sa: string; en: string }, cls = '')}
	<span class="lab {cls}"><span class="deva">{l.sa}</span><small>{l.en}</small></span>
{/snippet}

<figure class="implied">
	<figcaption>
		<span class="title"><span class="deva">{table.title.sa}</span> {table.title.en}</span>
	</figcaption>

	{#if table.kind === 'grid'}
		<div class="layers">
			{#each table.layers as layer, li (li)}
				<div class="scroll">
					<table class="grid">
						{#if layer.label}
							<caption>
								<span class="deva">{layer.label.sa}</span>
								<span class="muted">{layer.label.en}</span>
								{#if layer.basis}<a class="n" href={sutraHref(layer.basis)}>{layer.basis}</a>{/if}
							</caption>
						{/if}
						<thead>
							<tr>
								<th class="corner" scope="col"><span class="deva">{table.rowAxis.sa}</span> ╲ <span class="deva">{table.colAxis.sa}</span></th>
								{#each table.cols as c, ci (ci)}<th scope="col">{@render label(c)}</th>{/each}
							</tr>
						</thead>
						<tbody>
							{#each layer.cells as row, ri (ri)}
								<tr>
									<th scope="row">{@render label(table.rows[ri])}</th>
									{#each row as cell, ci (ci)}
										<td>
											{@render item(cell.main, table.ctx)}
											{#if cell.for}<span class="for">for <span class="deva">{cell.for.text}</span></span>{/if}
										</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/each}
		</div>
	{:else}
		<div class="scroll">
			<table class="pairs">
				<thead>
					<tr>
						<th scope="col">{@render label(table.from)}</th>
						<th aria-hidden="true"></th>
						<th scope="col">{@render label(table.to)}</th>
					</tr>
				</thead>
				<tbody>
					{#each table.pairs as p, i (i)}
						<tr>
							<td>{@render item(p.from, table.fromCtx)}</td>
							<td class="arrow" aria-label="becomes">→</td>
							<td>{@render item(p.to, table.toCtx)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	{#if table.note}<p class="note">{table.note}</p>{/if}

	<div class="basis">
		<span class="eyebrow">Why it is a table</span>
		<ul>
			{#each table.basis as b (b.n)}
				{@const r = stubOf(b.n)}
				<li>
					<a href={sutraHref(b.n)}><span class="n">{b.n}</span>{#if r}&nbsp;<span class="deva">{r.s}</span>{/if}</a>
					<span class="why">{b.why}</span>
				</li>
			{/each}
		</ul>
		<span class="src muted">Checked against vidyut-prakriya derivations.</span>
	</div>
</figure>

<style>
	.implied {
		margin: 14px 0 0;
		padding: 16px 18px;
		border-radius: var(--radius);
		background: var(--surface);
		border: 1px solid var(--line);
		display: flex;
		flex-direction: column;
		gap: 14px;
		min-width: 0;
	}
	.title {
		font-weight: 600;
		color: var(--ink-2);
	}
	.title .deva {
		font-size: 20px;
		color: var(--ink);
		margin-right: 6px;
	}
	.layers {
		display: flex;
		flex-wrap: wrap;
		gap: 18px 28px;
	}
	table {
		border-collapse: collapse;
		font-variant-numeric: tabular-nums;
	}
	.scroll {
		max-width: 100%;
		overflow-x: auto;
	}
	caption {
		text-align: left;
		padding: 0 0 6px;
		font-weight: 600;
	}
	caption > * + * {
		margin-left: 6px;
	}
	caption .deva {
		font-size: 17px;
	}
	th,
	td {
		padding: 6px 10px;
		border-bottom: 1px solid var(--line);
		text-align: center;
		vertical-align: middle;
	}
	thead th {
		border-bottom: 1.5px solid var(--ink-2);
		font-weight: 600;
	}
	tbody th {
		text-align: left;
		font-weight: 600;
	}
	.corner {
		font-size: 12px;
		color: var(--muted);
		font-weight: 500;
		white-space: nowrap;
	}
	.lab {
		display: inline-flex;
		flex-direction: column;
		line-height: 1.25;
	}
	.lab .deva {
		font-size: 15px;
	}
	.lab small {
		font-size: 11px;
		color: var(--muted);
		font-weight: 500;
	}
	td {
		min-width: 64px;
	}
	.item {
		display: block;
		font-size: 20px;
		line-height: 1.45;
	}
	.rest,
	.for,
	.written {
		display: block;
		font-size: 12px;
		color: var(--muted);
		line-height: 1.3;
	}
	.rest.deva,
	.for .deva,
	.written .deva {
		font-size: 13.5px;
	}
	.pairs td {
		min-width: 80px;
	}
	.pairs .arrow {
		min-width: 0;
		color: var(--muted);
		font-family: var(--font-mono);
	}
	.note {
		margin: 0;
		font-size: 13.5px;
		color: var(--ink-2);
	}
	.basis ul {
		list-style: none;
		padding: 0;
		margin: 4px 0 6px;
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 13.5px;
	}
	.basis a {
		text-decoration: none;
		color: var(--ink);
		margin-right: 6px;
	}
	.basis a:hover .deva {
		color: var(--indigo);
	}
	.why {
		color: var(--ink-2);
	}
	.n {
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--saffron-ink);
	}
	caption .n {
		font-weight: 400;
		text-decoration: none;
	}
	.src {
		font-size: 12px;
	}
	@media (max-width: 520px) {
		.implied {
			padding: 12px 10px;
		}
		th,
		td {
			padding: 5px 5px;
		}
		td {
			min-width: 0;
		}
		.item {
			font-size: 18px;
		}
		.corner {
			white-space: normal;
		}
	}
</style>
