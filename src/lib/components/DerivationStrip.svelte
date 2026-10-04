<script lang="ts">
	import { resolve } from '$app/paths';
	import { sutraHref } from '#lib/links.ts';
	import { settings } from '#lib/settings.svelte.ts';
	import { devaToIast } from '#lib/translit.ts';

	type DStep = { code: string; source: string; s: string; en: string; terms: { t: string; ch: boolean }[] };
	let {
		steps,
		word,
		hash = '',
		focus = [],
		fold = true
	}: { steps: DStep[]; word: string; hash?: string; focus?: string[]; fold?: boolean } = $props();

	// marker bookkeeping and naming steps are folded by default
	const BOOKKEEPING = new Set(['1.3.2', '1.3.3', '1.3.4', '1.3.5', '1.3.7', '1.3.8', '1.3.9', '1.4.13', '1.4.14', '1.4.17', '1.2.45', '1.2.46', '8.4.68']);
	let showAll = $state(false);
	const shown = $derived(steps.map((st, i) => ({ st, i })).filter(({ st }) => showAll || !fold || focus.includes(st.code) || (st.source === 'ashtadhyayi' && !BOOKKEEPING.has(st.code))));
</script>

<div class="strip card">
	<ol>
		{#each shown as { st, i } (i)}
			<li class:focus={focus.includes(st.code)}>
				<span class="code">
					{#if st.source === 'ashtadhyayi' && st.s}<a href={sutraHref(st.code)}>{st.code}</a>{:else}<span class="other">{st.source} {st.code}</span>{/if}
				</span>
				<span class="s deva">{st.s}</span>
				<span class="terms deva">
					{#each st.terms as t, j (j)}{#if j}<i>+</i>{/if}<b class:ch={t.ch}>{t.t}</b>{/each}
				</span>
			</li>
		{/each}
	</ol>
	<div class="foot">
		<span class="word deva">→ {word}</span>
		{#if settings.iast}<span class="iast">{devaToIast(word)}</span>{/if}
		{#if fold}<label><input type="checkbox" bind:checked={showAll} /> all {steps.length} steps</label>{/if}
		{#if hash}<a class="dbg" href={resolve('/tools/prakriya') + '/#' + hash}>open in debugger →</a>{/if}
	</div>
</div>

<style>
	.strip {
		padding: 10px 14px;
	}
	ol {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	li {
		display: grid;
		grid-template-columns: 70px minmax(0, 1fr) auto;
		gap: 10px;
		align-items: baseline;
		padding: 4px 6px;
		border-radius: 6px;
	}
	li.focus {
		background: var(--saffron-soft);
	}
	.code {
		font-family: var(--font-mono);
		font-size: 12.5px;
	}
	.code a {
		text-decoration: none;
	}
	.other {
		color: var(--muted);
		font-size: 11px;
	}
	.s {
		font-size: 15px;
		color: var(--ink-2);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.focus .s {
		color: var(--ink);
		font-weight: 600;
	}
	.terms {
		font-size: 16px;
		white-space: nowrap;
	}
	.terms i {
		font-style: normal;
		color: var(--muted);
		margin: 0 3px;
	}
	.terms b {
		font-weight: 400;
	}
	.terms b.ch {
		color: var(--saffron-ink);
		font-weight: 700;
	}
	.foot {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 6px 14px;
		margin-top: 8px;
		padding-top: 8px;
		border-top: 1px dashed var(--line);
		font-size: 13px;
	}
	.word {
		font-size: 24px;
		font-weight: 700;
		color: var(--r-subject);
	}
	.foot label {
		color: var(--ink-2);
	}
	.dbg {
		margin-left: auto;
	}
	@media (max-width: 600px) {
		li {
			grid-template-columns: 58px minmax(0, 1fr);
		}
		.terms {
			grid-column: 2;
		}
	}
</style>
