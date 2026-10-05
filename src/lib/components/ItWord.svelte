<script lang="ts">
	import { sutraHref } from '#lib/links.ts';
	import { detectIts, itName, stripIts, joinVarnas, IT_RULES, IT_EFFECTS, KEPT_RULES, type ItContext } from '#lib/it.ts';
	import { fromVarnas, isConsonant, isVowel } from '#lib/varna.ts';
	import HoverCard from './HoverCard.svelte';

	// An upadeśa with its it-letters (anubandhas) coloured; each it opens a card naming the rule that marks it.
	let { text, ctx, showResult = false }: { text: string; ctx: ItContext; showResult?: boolean } = $props();

	const units = $derived(detectIts(text, ctx));
	const result = $derived(stripIts(units));
	// Group consecutive sounds with the same status so the Devanagari stays joined (क्त्वा, not क् त् वा).
	const groups = $derived.by(() => {
		const out: { vs: string[]; it: string | null; kept?: string; start: number }[] = [];
		units.forEach((u, i) => {
			const prev = out.at(-1);
			if (prev && !u.it && !prev.it && !u.kept && !prev.kept) prev.vs.push(u.v);
			else out.push({ vs: [u.v], it: u.it, kept: u.kept, start: i });
		});
		// A consonant and the vowel after it are one akṣara, so a group boundary between them is drawn inside the akṣara:
		// the first group ends with the bare letter and the next starts with the vowel sign (झ|ि, ज|स् rather than ज्|अस्).
		// An it sits in its own button, which a vowel sign cannot join across: after an it only a following अ is merged,
		// and a consonant before an it vowel moves into the it's button, uncoloured (स + ुँ in सुँ).
		const disp = out.map((g) => ({ vs: [...g.vs], pre: '', bare: false, matra: false }));
		for (let i = 1; i < out.length; i++) {
			const [a, b, da, db] = [out[i - 1], out[i], disp[i - 1], disp[i]];
			const v = b.vs[0].replace('ँ', '');
			if (!da.vs.length || !isConsonant(da.vs.at(-1)!) || !isVowel(v)) continue;
			if (b.it && !a.it) db.pre = da.vs.pop()!.slice(0, -1);
			else if (!b.it && (!a.it || v === 'अ')) [da.bare, db.matra] = [true, true];
		}
		const sign = (v: string) => (v.startsWith('अ') ? '' : fromVarnas(['क्', v.replace('ँ', '')]).slice(1)) + (v.endsWith('ँ') ? 'ँ' : '');
		return out.map((g, i) => {
			const d = disp[i];
			let text = d.matra || d.pre ? sign(d.vs[0]) + joinVarnas(d.vs.slice(1)) : joinVarnas(d.vs);
			if (d.bare) text = text.slice(0, -1);
			return { text, pre: d.pre, label: joinVarnas(g.vs), it: g.it, kept: g.kept, start: g.start };
		});
	});
	const href = (code: string) => sutraHref(code.split('.').slice(0, 3).join('.'));
</script>

<span class="itw deva">
	{#each groups as g, i (i)}
		{#if g.it}
			{@const name = itName(units, g.start)}
			<HoverCard label="it-letter {g.label}" underline={false} triggerClass="it-trigger">
				{#snippet trigger()}{#if g.pre}<span class="pre">{g.pre}</span>{/if}<span class="it" class:joined={g.pre}>{g.text}</span>{/snippet}
				<span class="hd"><span class="big deva">{g.label}</span> <span class="tag">it-letter{name ? ` · ${name}` : ''}</span></span>
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
			<HoverCard label="kept sound {g.label}" underline={false}>
				{#snippet trigger()}<span class="kept">{g.text}</span>{/snippet}
				<span class="hd"><span class="big deva keptc">{g.label}</span> <span class="tag">not an it</span></span>
				<a class="rule" href={href(g.kept)}><span class="n">{g.kept}</span> <span class="deva">{KEPT_RULES[g.kept]?.s}</span></a>
				<span class="en">{KEPT_RULES[g.kept]?.en}</span>
				<span class="en muted">So {g.label} stays: {KEPT_RULES[g.kept]?.why}.</span>
			</HoverCard>
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
	.pre {
		color: var(--ink);
	}
	/* padding would stop the vowel sign shaping onto the consonant before it */
	.it.joined {
		padding: 0;
	}
	:global(.it-trigger:hover) .it {
		filter: brightness(0.9);
	}
	.kept {
		text-decoration: underline;
		text-decoration-color: var(--r-subject);
		text-underline-offset: 0.25em;
	}
	.keptc {
		color: var(--r-subject);
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
