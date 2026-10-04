<script lang="ts">
	import { resolve } from '$app/paths';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	let show = $state<'sutra' | 'code'>('sutra');

	function toggle(v: 'sutra' | 'code') {
		show = v;
		if (v === 'code') {
			react('Headings open a block; inherited words stay "in scope" for the rules below until they stop being needed.', 'happy');
			complete();
		}
	}
</script>

<div class="switch" role="group" aria-label="View">
	<button aria-pressed={show === 'sutra'} onclick={() => toggle('sutra')}>Sūtras</button>
	<button aria-pressed={show === 'code'} onclick={() => toggle('code')}>As pseudocode</button>
</div>

{#if show === 'sutra'}
	<pre class="block deva"><span class="h">३.१.१ प्रत्ययः</span>
<span class="h">३.१.२ परश्च</span>
  …
<span class="h">३.१.२२ धातोरेकाचो हलादेः क्रियासमभिहारे यङ्</span>   <span class="c">(supplies धातोः)</span>
  …
<span class="v">३.१.६७ सार्वधातुके यक्</span>
<span class="v">३.१.६८ कर्तरि शप्</span></pre>
{:else}
	<pre class="block code"><span class="k">block</span> affix(placed_after=<span class="s">True</span>):          <span class="c"># 3.1.1, 3.1.2 headings</span>
  <span class="k">block</span> after(root):                   <span class="c"># धातोः, from 3.1.22</span>
    <span class="k">let</span> trigger = sarvadhatuka_follows   <span class="c"># सार्वधातुके, 3.1.67</span>
    rule_3_1_67: <span class="k">if</span> trigger <span class="k">and</span> passive: add(<span class="s">"yak"</span>)  <span class="c"># (and impersonal)</span>
    rule_3_1_68: <span class="k">if</span> trigger <span class="k">and</span> active:  add(<span class="s">"śap"</span>)   <span class="c"># reuses trigger</span></pre>
{/if}

<div class="limits card">
	<h2>Where the analogy breaks</h2>
	<ul>
		<li>Which words carry down is not marked in the text as we have it. 1.3.11 says headings were marked with a svarita accent, but those marks are lost, so the commentarial tradition decides.</li>
		<li>A word can carry down in a changed case or sense, which no programming language does.</li>
		<li>Rules are also ordered and can block each other, a different mechanism from scope. That is the subject of the CS track.</li>
	</ul>
	<p><a href={resolve('/cs') + '/'}>Explore Pāṇini & Computer Science →</a></p>
</div>

<style>
	.switch {
		display: inline-flex;
		border: 1.5px solid var(--line);
		border-radius: 999px;
		padding: 3px;
		background: var(--surface-2);
		margin-bottom: 16px;
	}
	.switch button {
		border: none;
		background: none;
		padding: 6px 16px;
		border-radius: 999px;
		cursor: pointer;
		font-size: 14px;
		color: var(--ink-2);
	}
	.switch button[aria-pressed='true'] {
		background: var(--surface);
		color: var(--ink);
		box-shadow: var(--shadow);
	}
	.block {
		margin: 0;
		padding: 18px 20px;
		border-radius: 12px;
		background: #1d2140;
		color: #e6e8ff;
		overflow-x: auto;
		font-size: 15px;
		line-height: 1.7;
	}
	.block.deva {
		font-family: var(--font-deva);
		font-size: 17px;
	}
	.code {
		font-family: var(--font-mono);
		font-size: 13.5px;
	}
	.h { color: #f0a24c; }
	.v { color: #a3a8ff; }
	.k { color: #5fe0c0; }
	.s { color: #f6bb79; }
	.c { color: #8b90b8; }
	.limits {
		margin-top: 20px;
		padding: 16px 20px;
		max-width: 720px;
	}
	.limits h2 {
		font-size: 18px;
	}
	.limits ul {
		padding-left: 18px;
		font-size: 14.5px;
	}
	.limits p {
		margin: 0;
	}
</style>
