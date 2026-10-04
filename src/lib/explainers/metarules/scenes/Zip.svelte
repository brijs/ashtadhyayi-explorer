<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete, panel }: SceneProps = $props();
	const A = ['ए', 'ओ', 'ऐ', 'औ'];
	const B = ['अय्', 'अव्', 'आय्', 'आव्'];
	const SHUFFLED = [2, 0, 3, 1];
	let pairs = $state<Record<number, number>>({});
	let sel = $state<number | null>(null);
	function pickA(i: number) {
		sel = i;
	}
	function pickB(j: number) {
		if (sel === null) return react('Tap a vowel on the left first.', 'think');
		if (j !== sel) return react(`By 1.3.10, the ${['1st', '2nd', '3rd', '4th'][sel]} goes with the ${['1st', '2nd', '3rd', '4th'][sel]}: try again.`, 'think');
		pairs = { ...pairs, [sel]: j };
		sel = null;
		panel(`zip ${Object.keys(pairs).length}/4`);
		if (Object.keys(pairs).length === 4) {
			react('zip([ए, ओ, ऐ, औ], [अय्, अव्, आय्, आव्]). Position decides, not phonetics.', 'happy');
			complete();
		}
	}
</script>

<div class="zip">
	<div class="col">
		<span class="eyebrow">एचः (6.1.78)</span>
		{#each A as a, i (a)}
			<button class="t deva" class:sel={sel === i} class:done={pairs[i] !== undefined} onclick={() => pickA(i)}>{a} <small>{i + 1}</small></button>
		{/each}
	</div>
	<div class="col">
		<span class="eyebrow">substitutes</span>
		{#each SHUFFLED as j (j)}
			<button class="t deva" class:done={Object.values(pairs).includes(j)} onclick={() => pickB(j)}>{B[j]} <small>{j + 1}</small></button>
		{/each}
	</div>
</div>
<pre class="code"><span class="k">zip</span>(<span class="s">['ए','ओ','ऐ','औ']</span>, <span class="s">['अय्','अव्','आय्','आव्']</span>)  <span class="c">// 1.3.10 यथासंख्यमनुदेशः समानाम्</span></pre>
<p class="muted note">
	Compare 6.1.77 इको यणचि, where the tradition pairs इ→य् etc. by nearness of place (1.1.50). Two different pairing
	strategies, each stated once as a meta-rule: <SutraRef n="1.3.10" s="यथासंख्यमनुदेशः समानाम्" />.
</p>

<style>
	.zip {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 200px));
		gap: 20px;
	}
	.col {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.t {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		padding: 8px 14px;
		border-radius: 10px;
		border: 2px solid var(--line);
		background: var(--surface);
		cursor: pointer;
		font-size: 22px;
		color: var(--ink);
	}
	.t small {
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--muted);
	}
	.t.sel {
		border-color: var(--saffron);
		background: var(--saffron-soft);
	}
	.t.done {
		border-color: var(--r-subject);
		background: color-mix(in srgb, var(--r-subject) 10%, var(--surface));
	}
	.code {
		margin: 16px 0 0;
		padding: 10px 14px;
		border-radius: 10px;
		background: #1d2140;
		color: #e6e8ff;
		font-family: var(--font-mono), var(--font-deva);
		font-size: 13px;
		overflow-x: auto;
	}
	.k { color: #5fe0c0; }
	.s { color: #f6bb79; }
	.c { color: #8b90b8; }
	.note {
		margin-top: 12px;
		font-size: 14px;
		max-width: 48em;
	}
</style>
