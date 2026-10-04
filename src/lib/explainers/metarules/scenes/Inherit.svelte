<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	let on = $state(true);
	let flips = 0;
	function flip() {
		on = !on;
		flips++;
		react(on ? 'With 1.1.56, भू inherits "dhātu" from अस्, so tense and person rules keep working: भविष्यति.' : 'Without it, भू is just a sound string, not a root. No verb rule can apply after the swap: the derivation stalls.', on ? 'happy' : 'surprised');
		if (flips >= 2) complete();
	}
</script>

<div class="cols">
	<pre class="code"><span class="k">class</span> <span class="t">Dhatu</span> &#123; ... &#125;
<span class="k">const</span> as = <span class="k">new</span> <span class="t">Dhatu</span>(<span class="s">'अस्'</span>);

<span class="c">// 2.4.52 अस्तेर्भूः swaps in a substitute</span>
<span class="k">const</span> bhu = {on ? 'substituteFor(as, ' : ''}<span class="s">'भू'</span>{on ? ')' : ''};
<span class="c">// {on ? '1.1.56: the substitute inherits the original\'s type' : 'no inheritance: just a string'}</span>

bhu <span class="k">instanceof</span> <span class="t">Dhatu</span>   <span class="c">// → {on ? 'true' : 'false'}</span></pre>
	<div class="out card">
		<button class="btn" aria-pressed={on} onclick={flip}>1.1.56 {on ? 'ON' : 'OFF'}</button>
		<span class="deva big" class:bad={!on}>{on ? 'भविष्यति ✓' : 'भू … ✗'}</span>
	</div>
</div>
<p class="muted note">
	<SutraRef n="1.1.56" s="स्थानिवदादेशोऽनल्विधौ" />: "the substitute is like the original, except for operations that
	depend on its actual sounds". That exception keeps the analogy honest: inheritance of properties, not of letters.
</p>

<style>
	.cols {
		display: grid;
		grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
		gap: 16px;
		align-items: start;
	}
	.code {
		margin: 0;
		padding: 14px 16px;
		border-radius: 12px;
		background: #1d2140;
		color: #e6e8ff;
		font-family: var(--font-mono), var(--font-deva);
		font-size: 13.5px;
		line-height: 1.8;
		overflow-x: auto;
	}
	.k { color: #5fe0c0; }
	.s { color: #f6bb79; }
	.c { color: #8b90b8; }
	.t { color: #a3a8ff; }
	.out {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 16px;
	}
	.out .btn {
		align-self: flex-start;
	}
	.big {
		font-size: 30px;
		font-weight: 700;
		color: var(--r-subject);
	}
	.big.bad {
		color: var(--r-target);
	}
	.note {
		margin-top: 14px;
		font-size: 14px;
		max-width: 48em;
	}
	@media (max-width: 760px) {
		.cols {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
