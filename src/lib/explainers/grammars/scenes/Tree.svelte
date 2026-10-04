<script lang="ts">
	import DerivationStrip from '#lib/components/DerivationStrip.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	type D = { word: string; hash: string; steps: any[] };
	let { react, complete, data }: SceneProps<{ bhavati: D }> = $props();
	let view = $state<'tree' | 'rewrite'>('tree');
	let seen = new Set<string>(['tree']);
	function pick(v: 'tree' | 'rewrite') {
		view = v;
		seen.add(v);
		react(v === 'tree' ? 'A tree: each symbol splits into parts, which are simply concatenated. Neighbours never change each other.' : 'A sequence: each step rewrites the string, and what happens depends on the neighbours: guṇa before an affix, अव् before a vowel.', 'think');
		if (seen.size === 2) complete();
	}
</script>

<div class="tabs" role="tablist">
	<button role="tab" aria-selected={view === 'tree'} onclick={() => pick('tree')}>BNF: a tree</button>
	<button role="tab" aria-selected={view === 'rewrite'} onclick={() => pick('rewrite')}>Pāṇini: a rewriting sequence</button>
</div>

{#if view === 'tree'}
	<svg viewBox="0 0 420 200" class="tree" role="img" aria-label="Parse tree: verb splits into root, vikarana, ending">
		<g class="edges"><line x1="210" y1="38" x2="80" y2="100" /><line x1="210" y1="38" x2="210" y2="100" /><line x1="210" y1="38" x2="340" y2="100" /><line x1="80" y1="120" x2="80" y2="160" /><line x1="210" y1="120" x2="210" y2="160" /><line x1="340" y1="120" x2="340" y2="160" /></g>
		<text x="210" y="30" class="nt">&lt;verb&gt;</text>
		<text x="80" y="115" class="nt">&lt;root&gt;</text><text x="210" y="115" class="nt">&lt;vikarana&gt;</text><text x="340" y="115" class="nt">&lt;ending&gt;</text>
		<text x="80" y="185" class="t">भू</text><text x="210" y="185" class="t">अ</text><text x="340" y="185" class="t">ति</text>
	</svg>
	<p class="res">Yield: <span class="deva">भू + अ + ति</span>, and that is where a context-free grammar stops.</p>
{:else}
	<DerivationStrip steps={data.bhavati.steps} word={data.bhavati.word} hash={data.bhavati.hash} focus={['7.3.84', '6.1.78']} />
{/if}
<p class="muted note">
	Context-free grammars (the kind BNF writes) are the backbone of programming-language parsing. Pāṇini's operational rules
	are closer to context-sensitive rewriting, the formalism later used in generative phonology.
</p>

<style>
	.tabs {
		display: flex;
		gap: 6px;
		margin-bottom: 12px;
		flex-wrap: wrap;
	}
	.tabs button {
		padding: 6px 14px;
		border-radius: 999px;
		border: 1px solid var(--line);
		background: var(--surface);
		cursor: pointer;
		color: var(--ink);
	}
	.tabs button[aria-selected='true'] {
		border-color: var(--saffron);
		background: var(--saffron-soft);
	}
	.tree {
		width: 100%;
		max-width: 480px;
	}
	.edges line {
		stroke: var(--muted);
		stroke-width: 1.5;
	}
	.nt {
		font-family: var(--font-mono);
		font-size: 13px;
		fill: var(--indigo);
		text-anchor: middle;
	}
	.t {
		font-family: var(--font-deva);
		font-size: 24px;
		fill: var(--ink);
		text-anchor: middle;
	}
	.res {
		font-size: 15px;
	}
	.res .deva {
		font-size: 20px;
	}
	.note {
		margin-top: 12px;
		font-size: 14px;
		max-width: 48em;
	}
</style>
