<script lang="ts">
	import { sutraHref } from '#lib/links.ts';
	import { detectIts, itName, stripIts, IT_RULES, IT_EFFECTS, type ItContext } from '#lib/it.ts';
	import { fromVarnas } from '#lib/varna.ts';
	import HoverCard from './HoverCard.svelte';

	// An upadeśa with its it-letters (anubandhas) coloured; each it opens a card naming the rule that marks it.
	let { text, ctx, showResult = false }: { text: string; ctx: ItContext; showResult?: boolean } = $props();

	const units = $derived(detectIts(text, ctx));
	const result = $derived(stripIts(units));
	// Group consecutive sounds with the same status so the Devanagari stays joined (क्त्वा, not क् त् वा).
	const groups = $derived.by(() => {
		const out: { text: string; it: string | null; kept?: string; start: number }[] = [];
		units.forEach((u, i) => {
			const prev = out.at(-1);
			if (prev && !u.it && !prev.it && !u.kept && !prev.kept) prev.text += '\u0000' + u.v;
			else out.push({ text: u.v, it: u.it, kept: u.kept, start: i });
		});
		return out.map((g) => ({ ...g, text: fromVarnas(g.text.split('\u0000')) }));
	});
	const href = (code: string) => sutraHref(code.split('.').slice(0, 3).join('.'));
</script>

<span class="itw deva">
	{#each groups as g, i (i)}
		{#if g.it}
			{@const name = itName(units, g.start)}
			<HoverCard label="it-letter {g.text}" underline={false} triggerClass="it-trigger">
				{#snippet trigger()}<span class="it">{g.text}</span>{/snippet}
				<span class="hd"><span class="big deva">{g.text}</span> <span class="tag">it-letter{name ? ` · ${name}` : ''}</span></span>
				<a class="rule" href={href(g.it)}><span class="n">{g.it}</span> <span class="deva">{IT_RULES[g.it]?.s}</span></a>
				<span class="en">{IT_RULES[g.it]?.en}</span>
				<span class="en muted">Deleted by <a href={href('1.3.9')}>1.3.9</a> तस्य लोपः, leaving <span class="deva">{result || '∅'}</span>.</span>
				{#if name && IT_EFFECTS[name]}
					<span class="eyebrow">What the marker does</span>
					{#each IT_EFFECTS[name] as e (e.sutra)}
						<span class="eff"><a href={href(e.sutra)} class="n">{e.sutra}</a> {e.en}</span>
					{/each}
				{/if}
			</HoverCard>
		{:else if g.kept}
			<span class="kept" title="Not an it: {g.kept}">{g.text}</span>
		{:else}
			<span>{g.text}</span>
		{/if}
	{/each}
	{#if showResult}<span class="arrow" aria-label="becomes">→</span><span class="res">{result || '∅'}</span>{/if}
</span>

<style>
	.itw {
		display: inline;
	}
	.it {
		color: var(--it);
		background: var(--it-soft);
		border-radius: 4px;
		padding: 0 1px;
		text-decoration: underline dotted;
		text-underline-offset: 0.25em;
	}
	:global(.it-trigger:hover) .it {
		filter: brightness(0.9);
	}
	.kept {
		text-decoration: underline;
		text-decoration-color: var(--r-subject);
		text-underline-offset: 0.25em;
	}
	.arrow {
		color: var(--muted);
		margin: 0 0.4em;
		font-family: var(--font-ui);
	}
	.res {
		font-weight: 600;
	}
	.hd {
		display: flex;
		align-items: baseline;
		gap: 10px;
	}
	.big {
		font-size: 24px;
		color: var(--it);
	}
	.tag {
		font-size: 11.5px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--muted);
		font-weight: 600;
	}
	.rule {
		text-decoration: none;
		color: var(--ink);
	}
	.rule .deva {
		font-size: 17px;
	}
	.n {
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--saffron-ink);
	}
	.en {
		color: var(--ink-2);
		font-size: 13.5px;
	}
	.eff {
		font-size: 13.5px;
		color: var(--ink-2);
	}
</style>
