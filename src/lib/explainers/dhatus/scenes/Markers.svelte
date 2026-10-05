<script lang="ts">
	import { resolve } from '$app/paths';
	import ItWord from '#lib/components/ItWord.svelte';
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';
	import { ANUBANDHA_TOOL, type DhatuData } from '../types.ts';

	let { react, complete, data }: SceneProps<DhatuData> = $props();

	type Fact = { tag: string; n: string; text: string; word?: string };
	type Root = { c: string; d: string; m: string; facts: Fact[] };
	const ROOTS: Root[] = $derived([
		{ c: '01.0001', d: 'भू', m: 'to be', facts: [{ tag: 'no tags', n: '1.3.78', text: 'nothing asks for middle endings, so it takes active (parasmaipada) endings by default' }] },
		{
			c: '01.0002', d: 'एधँ', m: 'to grow',
			facts: [{ tag: 'अँ', n: '1.3.12', text: 'a nasal vowel is a tag (1.3.2). In the accented Dhātupāṭha it is low-pitched (anudātta), and such roots take middle (ātmanepada) endings' }]
		},
		{
			c: '08.0010', d: 'डुकृञ्', m: 'to do, make',
			facts: [
				{ tag: 'डु', n: '3.3.88', text: 'initial डु is a tag (1.3.5); such roots take the affix क्त्रि', word: data.effects.krtrima.word },
				{ tag: 'ञ्', n: '1.3.72', text: 'final ञ् (1.3.3): middle endings when the action is for the doer, active otherwise' }
			]
		},
		{
			c: '01.1151', d: 'डुपचँष्', m: 'to cook',
			facts: [
				{ tag: 'डु', n: '3.3.88', text: 'initial डु (1.3.5), as in डुकृञ्' },
				{ tag: 'अँ', n: '1.3.72', text: 'this tag vowel is svarita in the accented text, which, like ञ्, allows both sets of endings' },
				{ tag: 'ष्', n: '3.3.104', text: 'final ष् (1.3.3): action nouns in अङ्' }
			]
		},
		{
			c: '01.1137', d: 'गमॢँ', m: 'to go',
			facts: [{ tag: 'ऌँ', n: '3.1.55', text: 'the ḷ-tag gives an अङ् aorist', word: data.effects.agamat.word }]
		},
		{
			c: '01.0268', d: 'टुओँस्फूर्जाँ', m: 'to thunder',
			facts: [
				{ tag: 'टु', n: '3.3.89', text: 'initial टु (1.3.5): action nouns in अथुच्', word: data.effects.sphurjathu.word },
				{ tag: 'ओँ', n: '8.2.45', text: 'the o-tag: the past participle has न for त', word: data.effects.sphurgna.word },
				{ tag: 'आँ', n: '7.2.16', text: 'the ā-tag: no इट् before that participle (no -इत-)' }
			]
		}
	]);
	let open = $state(new Set<string>());
	function decode(r: Root) {
		const s = new Set(open);
		s.add(r.c);
		open = s;
		const forms = data.pada[r.c]?.join(' / ');
		react(`${r.d}: ${r.facts.length === 1 && r.facts[0].tag === 'no tags' ? 'no tags' : r.facts.map((f) => f.tag).join(', ')}. vidyut conjugates it as ${forms}.`, 'happy');
		if (s.size >= 3) complete();
	}
</script>

<div class="grid">
	{#each ROOTS as r (r.c)}
		<div class="root card" class:open={open.has(r.c)}>
			<div class="top">
				<span class="w"><ItWord text={r.d} ctx="dhatu" showResult /></span>
				<span class="muted m">"{r.m}" · {r.c}</span>
			</div>
			{#if open.has(r.c)}
				<ul>
					{#each r.facts as f (f.tag)}
						<li>
							<span class="tag deva" class:none={f.tag === 'no tags'}>{f.tag}</span>
							<span>{f.text} (<SutraRef n={f.n} />){#if f.word}: <b class="deva">{f.word}</b>{/if}</span>
						</li>
					{/each}
				</ul>
				<p class="forms">present: <b class="deva">{data.pada[r.c]?.join(' / ')}</b></p>
			{:else}
				<button class="btn" onclick={() => decode(r)}>Decode</button>
			{/if}
		</div>
	{/each}
</div>

<p class="muted note">
	Pink letters are tags (anubandhas): hover one for the rule that makes it a tag. The forms are computed by vidyut, and each listed effect's sūtra fires in its
	derivation. Accent is not shown in Devanagari here, but vidyut's data keeps it (एधँ is <code>eDa~\</code>, the <code>\</code> marking a low pitch).
	{#if ANUBANDHA_TOOL}Try any upadeśa in the <a href={resolve('/tools') + '/anubandha/'}>it-letter tool</a>.{/if}
	See also the <a href={resolve('/learn') + '/it-markers/'}>It-markers lesson</a>.
</p>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 10px;
		max-width: 900px;
	}
	.root {
		padding: 12px 14px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.root.open {
		border-color: var(--saffron);
	}
	.top {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.w {
		font-size: 24px;
	}
	.m {
		font-size: 12.5px;
	}
	.btn {
		align-self: flex-start;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-size: 13.5px;
		color: var(--ink-2);
	}
	li {
		display: grid;
		grid-template-columns: 52px minmax(0, 1fr);
		gap: 6px;
		align-items: baseline;
	}
	.tag {
		font-size: 17px;
		color: var(--it);
	}
	.tag.none {
		font-family: var(--font-ui);
		font-size: 12px;
		color: var(--muted);
	}
	li b {
		color: var(--ink);
		font-size: 15px;
	}
	.forms {
		margin: 0;
		font-size: 13px;
		color: var(--muted);
	}
	.forms b {
		font-size: 16px;
		color: var(--ink);
	}
	.note {
		margin-top: 14px;
		font-size: 13.5px;
		max-width: 56em;
	}
	code {
		font-family: var(--font-mono);
		font-size: 12px;
	}
</style>
