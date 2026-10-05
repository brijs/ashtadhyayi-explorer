<script lang="ts" module>
	import { pratyahara, splitPratyaharaName, showVarna, SHIVA_FLAT, SHIVA_SUTRAS } from '#lib/varna.ts';

	const lineName = (l: number) => SHIVA_SUTRAS[l].map((v, i, a) => (i === a.length - 1 ? v : showVarna(v, true))).join('');

	/** Where a sound-class pratyāhāra sits on the Śiva sūtras, e.g. इक् = इ (in अइउण्) … क् (of ऋऌक्).
	 *  ण् marks two lines; the reading whose letters match the term's own list wins (short अण्, long इण्). */
	export function shivaSpan(key: string, letters: string[]) {
		const split = splitPratyaharaName(key);
		if (!split) return null;
		for (const occ of [1, 2]) {
			const r = pratyahara(split[0], split[1], occ);
			if (r && r.letters.length === letters.length) {
				const from = SHIVA_FLAT[r.startIdx].line;
				const to = SHIVA_FLAT[r.endIdx].line;
				return { first: showVarna(split[0], true), it: split[1], from: from + 1, to: to + 1, fromName: lineName(from), toName: lineName(to) };
			}
		}
		return null;
	}
</script>

<script lang="ts">
	import { resolve } from '$app/paths';
	import { sutraHref } from '#lib/links.ts';
	import type { SutraStub, Term } from '#lib/types.ts';
	import type { Snippet } from 'svelte';
	import HoverCard from './HoverCard.svelte';

	let { term, refs, children }: { term: Term; refs: Record<string, SutraStub>; children: Snippet } = $props();
	const isPr = $derived(term.kind === 'pratyahara');
	const span = $derived(isPr && term.letters ? shivaSpan(term.key, term.letters) : null);
	// Śiva-sūtra classes list sounds; the others (सुप्, तिङ्, कृञ् …) list affixes or roots
	const kindLabel = $derived(!isPr ? 'saṃjñā · technical term' : span ? 'pratyāhāra · class of sounds' : 'pratyāhāra · class of affixes');
	const hasShortVowel = $derived(!!span && term.letters!.some((l) => ['अ', 'इ', 'उ', 'ऋ', 'ऌ'].includes(l)));
</script>

<HoverCard label="Term {term.iast}" trigger={children} triggerClass={isPr ? 'pr-trigger' : ''}>
	<span class="head">
		<span class="key deva">{term.key}</span>
		<span class="iast">{term.iast}</span>
		<span class="kind">{kindLabel}</span>
	</span>
	{#if span}
		<span class="span">
			<span class="deva b">{span.first}</span> … <span class="deva b it">{span.it}</span>:
			from <span class="deva">{span.first}</span> in <span class="deva">{span.fromName}</span>
			{#if span.from === span.to}to its marker{:else}to the marker of <span class="deva">{span.toName}</span>{/if}
			<span class="muted">(Śiva sūtra{span.from === span.to ? ` ${span.from}` : `s ${span.from}–${span.to}`})</span>
		</span>
	{/if}
	{#if term.letters?.length}
		<span class="letters" aria-label="{term.letters.length} members">
			{#each term.letters as l, i (i)}<span class="letter deva">{l}</span>{/each}
		</span>
		{#if hasShortVowel}
			<span class="note">Each vowel also stands for its long and nasal forms (<a href={sutraHref('1.1.69')}>1.1.69</a>).</span>
		{/if}
		{#if term.key === 'अण्'}
			<span class="note">ण् ends two Śiva sūtras. अण् is read to the first, except in <a href={sutraHref('1.1.69')}>1.1.69</a>, where it runs to लण्.</span>
		{:else if term.key === 'इण्'}
			<span class="note">इण् runs to the second ण्, the one of लण्.</span>
		{/if}
		{#if span}
			<a class="tool" href={resolve('/tools/pratyahara') + '/#' + encodeURIComponent(term.key)}>See it on the Śiva sūtras →</a>
		{/if}
	{/if}
	{#if term.en}<span class="en">{term.en}</span>{/if}
	{#if term.kind === 'samjna' && term.sutras.length}
		<span class="def">
			<span class="eyebrow">Defined by</span>
			{#each term.sutras.slice(0, 4) as id (id)}
				{#if refs[id]}
					<a href={sutraHref(refs[id].n)}><span class="n">{refs[id].n}</span> <span class="deva">{refs[id].s}</span></a>
				{/if}
			{/each}
		</span>
	{/if}
	{#if term.usedIn?.length}
		<span class="def">
			<span class="eyebrow">Appears in {term.usedIn.length} sūtra{term.usedIn.length === 1 ? '' : 's'}</span>
			{#each term.usedIn.slice(0, 6) as id (id)}
				{#if refs[id]}
					<a href={sutraHref(refs[id].n)}><span class="n">{refs[id].n}</span> <span class="deva">{refs[id].s}</span></a>
				{/if}
			{/each}
			{#if term.usedIn.length > 6}<span class="more muted">…and {term.usedIn.length - 6} more</span>{/if}
		</span>
	{/if}
</HoverCard>

<style>
	/* pratyāhāras get a dashed saffron underline, saṃjñās keep the dotted one */
	:global(.hc .trigger.underline.pr-trigger) {
		border-bottom-style: dashed;
		border-bottom-color: var(--saffron);
	}
	.head {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 4px 10px;
	}
	.key {
		font-size: 24px;
		line-height: 1.3;
	}
	.kind {
		width: 100%;
		font-size: 11.5px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--muted);
		font-weight: 600;
	}
	.span {
		font-size: 13.5px;
		color: var(--ink-2);
	}
	.span .b {
		font-size: 17px;
		font-weight: 600;
		color: var(--ink);
	}
	.span .it {
		color: var(--it);
	}
	.letters {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}
	.letter {
		min-width: 30px;
		text-align: center;
		padding: 0 6px;
		border-radius: 6px;
		background: var(--saffron-soft);
		color: var(--saffron-ink);
		font-size: 17px;
	}
	.note {
		font-size: 12.5px;
		color: var(--muted);
	}
	.en {
		color: var(--ink-2);
	}
	.def {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.def a {
		text-decoration: none;
		color: var(--ink);
	}
	.def a:hover .deva {
		color: var(--indigo);
	}
	.n {
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--saffron-ink);
	}
	.tool {
		font-size: 13px;
	}
	.more {
		font-size: 12.5px;
	}
</style>
