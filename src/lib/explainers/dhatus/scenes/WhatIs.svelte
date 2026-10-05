<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import DerivationStrip from '#lib/components/DerivationStrip.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';
	import { sutra, type DhatuData } from '../types.ts';

	let { react, complete, data }: SceneProps<DhatuData> = $props();

	const CARDS = [
		{ key: 'bhavati', root: 'भू', add: '', gloss: 'is, becomes', kind: 'listed root', by: '1.3.1', focus: ['1.3.1', '3.1.68'] },
		{ key: 'bubhusati', root: 'भू', add: 'सन्', gloss: 'wishes to be', kind: 'desiderative: a new root बुभूष', by: '3.1.32', focus: ['1.3.1', '3.1.7', '3.1.32'] },
		{ key: 'bhavayati', root: 'भू', add: 'णिच्', gloss: 'causes to be', kind: 'causative: a new root भावि', by: '3.1.32', focus: ['1.3.1', '3.1.26', '3.1.32'] }
	] as const;
	let sel = $state<(typeof CARDS)[number]['key']>('bhavati');
	const seen = new Set<string>(['bhavati']);
	const card = $derived(CARDS.find((c) => c.key === sel)!);
	const der = $derived(data.sanadi[sel]);

	function pick(k: (typeof CARDS)[number]['key']) {
		sel = k;
		seen.add(k);
		const c = CARDS.find((x) => x.key === k)!;
		react(k === 'bhavati' ? 'A root straight from the list: dhātu by 1.3.1.' : `भू + ${c.add} is itself called a dhātu by 3.1.32, and then conjugates like any root: ${data.sanadi[k].word}.`, 'happy');
		if (seen.size >= 2) complete();
	}
</script>

<div class="defs">
	<div class="def card">
		<SutraRef n="1.3.1" s={sutra(data, '1.3.1').s} />
		<p>"<i>bhū</i> and the rest are called <b>dhātu</b>": the roots of the Dhātupāṭha.</p>
	</div>
	<div class="def card">
		<SutraRef n="3.1.32" s={sutra(data, '3.1.32').s} />
		<p>"What ends in <span class="deva">सन्</span> and the rest is also called <b>dhātu</b>": derived roots. The Kāśikā's examples: <span class="deva">चिकीर्षति</span>, and <span class="deva">पुत्रीयति, पुत्रकाम्यति</span> "wants a son", roots made from a <i>noun</i>.</p>
	</div>
</div>

<div class="cards" role="group" aria-label="Three verbs">
	{#each CARDS as c (c.key)}
		<button class="c card" class:on={sel === c.key} onclick={() => pick(c.key)} aria-pressed={sel === c.key}>
			<span class="deva f">{data.sanadi[c.key].word}</span>
			<span class="deva parts">{c.root}{#if c.add} + {c.add}{/if}</span>
			<span class="muted g">"{c.gloss}" · {c.kind}</span>
		</button>
	{/each}
</div>

<h2 class="h">How vidyut derives <span class="deva">{der.word}</span> <span class="muted small">(dhātu by {card.by})</span></h2>
<DerivationStrip steps={der.steps} word={der.word} hash={der.hash} focus={[...card.focus]} />

<p class="muted note">
	The other side of the coin is <SutraRef n="1.2.45" s={sutra(data, '1.2.45').s} />: a meaningful form that is <i>not</i> a dhātu and not an affix is a
	<b>prātipadika</b>, a noun stem. The Kāśikā on 1.3.1 adds that <span class="deva">धातु</span> is a term of earlier teachers, and that only roots
	expressing an action (<span class="deva">क्रियावचनाः</span>) get it.
</p>

<style>
	.defs {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 10px;
		max-width: 820px;
	}
	.def {
		padding: 12px 16px;
		font-size: 17px;
	}
	.def p {
		margin: 6px 0 0;
		font-size: 14.5px;
		color: var(--ink-2);
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 10px;
		margin-top: 16px;
		max-width: 820px;
	}
	.c {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 12px 14px;
		text-align: left;
		cursor: pointer;
		color: var(--ink);
	}
	.c.on {
		border-color: var(--saffron);
		background: var(--saffron-soft);
	}
	.f {
		font-size: 24px;
		font-weight: 600;
	}
	.parts {
		font-size: 16px;
		color: var(--saffron-ink);
	}
	.g {
		font-size: 12.5px;
	}
	.h {
		font-size: 18px;
		margin: 20px 0 8px;
	}
	.small {
		font-size: 13px;
		font-weight: 400;
	}
	.note {
		margin-top: 14px;
		font-size: 14px;
		max-width: 52em;
	}
	@media (max-width: 600px) {
		.cards {
			grid-template-columns: 1fr;
		}
	}
</style>
