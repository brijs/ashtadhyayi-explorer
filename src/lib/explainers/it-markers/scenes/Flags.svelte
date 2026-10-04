<script lang="ts">
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete, panel }: SceneProps = $props();
	let kit = $state(false);
	let nit = $state(false);
	let sit = $state(false);
	let toggles = 0;

	// Effect on the root कृ + an affix "तृ" with the chosen flags.
	const outcome = $derived(
		kit
			? { stem: 'कृ', word: 'कृतृ', why: '1.1.5 क्ङिति च: a k-tag blocks guṇa and vṛddhi' }
			: nit
				? { stem: 'कार्', word: 'कार्तृ', why: '7.2.115 अचो ञ्णिति: a ñ/ṇ-tag triggers vṛddhi' }
				: { stem: 'कर्', word: 'कर्तृ', why: '7.3.84: plain guṇa of the root vowel' }
	);
	const real = $derived(!kit && !nit && !sit);

	function flip(f: 'kit' | 'nit' | 'sit') {
		if (f === 'kit') kit = !kit;
		if (f === 'nit') nit = !nit;
		if (f === 'sit') sit = !sit;
		toggles++;
		panel(`k:${+kit} ñ:${+nit} ś:${+sit}`);
		react(sit ? 'ś also makes the affix sārvadhātuka (3.4.113), which changes which other rules apply.' : `${outcome.word}: ${outcome.why}.`, 'think');
		if (toggles >= 3) complete();
	}
</script>

<div class="obj">
	<pre class="code"><span class="k">const</span> affix = &#123;
  text: <span class="s">'तृ'</span>,
  kit:  <button class="b" class:on={kit} onclick={() => flip('kit')}>{kit}</button>,   <span class="c">// tag क्</span>
  nit:  <button class="b" class:on={nit} onclick={() => flip('nit')}>{nit}</button>,   <span class="c">// tag ञ् or ण्</span>
  sit:  <button class="b" class:on={sit} onclick={() => flip('sit')}>{sit}</button>,   <span class="c">// tag श्</span>
&#125;;</pre>
	<div class="res card">
		<span class="eyebrow">कृ + affix</span>
		<span class="deva big">{outcome.word}</span>
		<span class="why">{outcome.why}</span>
		<span class="tag" class:realtag={real}>{real ? 'real: this is तृच् → कर्तृ "doer"' : 'hypothetical affix, for illustration'}</span>
	</div>
</div>
<p class="muted note">
	The tags never reach the final word, but rules can test for them, exactly like boolean fields on a record. Pāṇini packs
	the flags into the spelling of the affix's name.
</p>

<style>
	.obj {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 18px;
		align-items: start;
	}
	.code {
		margin: 0;
		padding: 16px 18px;
		border-radius: 12px;
		background: #1d2140;
		color: #e6e8ff;
		font-family: var(--font-mono), var(--font-deva);
		font-size: 14px;
		line-height: 1.9;
		overflow-x: auto;
	}
	.k { color: #5fe0c0; }
	.s { color: #f6bb79; }
	.c { color: #8b90b8; }
	.b {
		font-family: var(--font-mono);
		font-size: 13px;
		padding: 1px 8px;
		border-radius: 6px;
		border: 1px solid #8b90b8;
		background: transparent;
		color: #f0a3b2;
		cursor: pointer;
		min-width: 54px;
	}
	.b.on {
		color: #5fe0c0;
		border-color: #5fe0c0;
		background: rgb(95 224 192 / 0.12);
	}
	.res {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 18px;
	}
	.big {
		font-size: 44px;
		font-weight: 600;
		line-height: 1.3;
	}
	.why {
		font-size: 14.5px;
		color: var(--ink-2);
	}
	.tag {
		font-size: 12px;
		color: var(--muted);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.realtag {
		color: var(--r-subject);
	}
	.note {
		margin-top: 16px;
		font-size: 14px;
		max-width: 48em;
	}
	@media (max-width: 760px) {
		.obj {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
