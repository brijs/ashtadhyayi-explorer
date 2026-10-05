<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import DerivationStrip from '#lib/components/DerivationStrip.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';
	import { sutra, type DhatuData } from '../types.ts';

	let { react, complete, data }: SceneProps<DhatuData> = $props();

	const WORDS = [
		{ key: 'go', root: 'गम्', aff: 'डो', un: '2.68', gloss: 'cow', focus: ['2.68', '6.4.143', '1.2.46'] },
		{ key: 'karu', root: 'कृ', aff: 'उण्', un: '1.1', gloss: 'artisan', focus: ['1.1', '7.2.115', '1.2.46'] }
	] as const;
	let word = $state<(typeof WORDS)[number]['key']>('go');
	let view = $state<'derived' | 'underived' | null>(null);
	const seenViews = new Set<string>();
	const w = $derived(WORDS.find((x) => x.key === word)!);
	const der = $derived(data.unadi[word]);

	function show(v: 'derived' | 'underived') {
		view = v;
		seenViews.add(v);
		react(
			v === 'derived'
				? `${w.root} + ${w.aff} by Uṇādi ${w.un}: a kṛt, so ${der.word} is a noun stem by 1.2.46.`
				: `Taken as given: ${der.word} is meaningful, not a root, not an affix, so it is a noun stem by 1.2.45.`,
			'happy'
		);
		if (seenViews.size === 2) complete();
	}
</script>

<div class="debate">
	<div class="side card">
		<p class="eyebrow">Śākaṭāyana and the etymologists</p>
		<p class="say">"Nouns are born from verbs": all of them.</p>
		<p class="muted small">Named by Pāṇini in <SutraRef n="3.4.111" />, <SutraRef n="8.3.18" />, <SutraRef n="8.4.50" /></p>
	</div>
	<div class="vs" aria-hidden="true">vs</div>
	<div class="side card">
		<p class="eyebrow">Gārgya and some grammarians</p>
		<p class="say">"Not all."</p>
		<p class="muted small">Named by Pāṇini in <SutraRef n="7.3.99" />, <SutraRef n="8.3.20" />, <SutraRef n="8.4.67" /></p>
	</div>
</div>
<p class="muted cite">Reported by Yāska, Nirukta 1.12. See Visigalli, "Reinterpreting the Gārgya controversy in Nirukta 1.12–1.14", <i>Acta Orientalia Hung.</i> 76 (2023).</p>

<div class="panini card">
	<p><SutraRef n="3.3.1" s={sutra(data, '3.3.1').s} /> "The uṇādi affixes apply variously (<i>bahulam</i>)." The Kāśikā explains:</p>
	<blockquote class="deva">यतो विहितास्ततोऽन्यत्रापि भवन्ति। केचिदविहिता एव प्रयोगत उन्नीयन्ते।</blockquote>
	<p class="tr">"They also occur after roots other than those they are taught for; some, never taught, are inferred from usage."</p>
	<p class="small">
		The Uṇādi-sūtras themselves are a separate text: {data.unadi.count} sūtras in five pādas in vidyut's edition ({data.unadi.padas.join(' + ')}), e.g.
		{#each Object.entries(data.unadi.texts) as [k, t], i (k)}{i ? ', ' : ''}<span class="un"><span class="num">उ. {k}</span> <span class="deva">{t}</span></span>{/each}.
	</p>
</div>

<div class="two">
	<div class="picker" role="group" aria-label="Word">
		{#each WORDS as x (x.key)}
			<button class="wbtn deva" aria-pressed={word === x.key} onclick={() => { word = x.key; if (view) show(view); }}>{data.unadi[x.key].word} <span class="g">"{x.gloss}"</span></button>
		{/each}
	</div>
	<div class="views" role="group" aria-label="Two readings">
		<button class="btn" aria-pressed={view === 'derived'} onclick={() => show('derived')}>Derive it (1.2.46)</button>
		<button class="btn" aria-pressed={view === 'underived'} onclick={() => show('underived')}>Take it as given (1.2.45)</button>
	</div>
</div>

{#if view === 'derived'}
	<DerivationStrip steps={der.steps} word={der.word} focus={[...w.focus]} />
	<p class="muted small">vidyut builds <span class="deva">{der.word}</span> with Uṇādi {w.un} <span class="deva">{data.unadi.texts[w.un] ?? ''}</span>, as a kṛt under 3.1.91 धातोः.</p>
{:else if view === 'underived'}
	<div class="card plain">
		<p class="deva big">{der.word}</p>
		<p>
			<SutraRef n="1.2.45" s={sutra(data, '1.2.45').s} />: meaningful, not a dhātu, not an affix, so a prātipadika. No derivation needed. A maxim
			quoted in the Mahābhāṣya allows exactly this: <span class="deva">उणादयोऽव्युत्पन्नानि प्रातिपदिकानि</span> "uṇādi words are underived stems".
		</p>
	</div>
{/if}

<p class="muted note">
	The Kāśikā on 3.3.1 also quotes the Mahābhāṣya's verse <span class="deva">नाम च धातुजमाह निरुक्ते व्याकरणे शकटस्य च तोकम्</span>: "in etymology, and in
	grammar the son of Śakaṭa (Śākaṭāyana), called the noun root-born". So the tradition keeps both readings. The maxim: Mahābhāṣya on 1.1.61, vārttika 4;
	Paribhāṣenduśekhara 22 (Abhyankar, s.v. avyutpanna).
</p>

<style>
	.debate {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
		gap: 10px;
		align-items: center;
		max-width: 820px;
	}
	.side {
		padding: 12px 16px;
	}
	.side p {
		margin: 2px 0;
	}
	.say {
		font-family: var(--font-serif);
		font-size: 18px;
	}
	.vs {
		font-family: var(--font-serif);
		font-style: italic;
		color: var(--muted);
	}
	.cite {
		font-size: 12.5px;
		margin: 6px 0 0;
	}
	.panini {
		margin-top: 14px;
		padding: 12px 16px;
		max-width: 820px;
		font-size: 15px;
	}
	.panini p {
		margin: 4px 0;
	}
	blockquote {
		margin: 6px 0;
		padding-left: 12px;
		border-left: 3px solid var(--saffron);
		font-size: 17px;
	}
	.tr {
		font-family: var(--font-serif);
		color: var(--ink-2);
	}
	.un {
		white-space: normal;
	}
	.num {
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--saffron-ink);
	}
	.two {
		display: flex;
		flex-wrap: wrap;
		gap: 10px 20px;
		align-items: center;
		margin: 16px 0 10px;
	}
	.picker,
	.views {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.wbtn {
		font-size: 20px;
		padding: 4px 12px;
		border-radius: 999px;
		border: 1.5px solid var(--line);
		background: var(--surface);
		color: var(--ink);
		cursor: pointer;
	}
	.wbtn[aria-pressed='true'] {
		border-color: var(--saffron);
		background: var(--saffron-soft);
	}
	.g {
		font-family: var(--font-ui);
		font-size: 12px;
		color: var(--muted);
	}
	.plain {
		padding: 12px 16px;
		max-width: 720px;
	}
	.plain p {
		margin: 4px 0;
		font-size: 15px;
	}
	.big {
		font-size: 30px;
		font-weight: 700;
		color: var(--r-subject);
	}
	.small {
		font-size: 13.5px;
	}
	.note {
		margin-top: 14px;
		font-size: 13px;
		max-width: 60em;
	}
	@media (max-width: 600px) {
		.debate {
			grid-template-columns: 1fr;
		}
		.vs {
			text-align: center;
		}
	}
</style>
