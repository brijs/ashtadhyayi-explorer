<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import { placesOf, placeName } from '../places.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	const VOWELS = [
		{ v: 'इ', ans: 'ए', ex: 'जि → जे (जयति)' },
		{ v: 'उ', ans: 'ओ', ex: 'भू → भो (भवति)' },
		{ v: 'ऋ', ans: 'अ', ex: 'कृ → कर् (कर्तृ)' }
	];
	const GUNA = ['अ', 'ए', 'ओ'];
	let cur = $state(0);
	let done = $state<Record<string, boolean>>({});
	const places = (s: string) => placesOf(s).map((k) => placeName(k).en).join(' + ');

	function pick(g: string) {
		const vw = VOWELS[cur];
		if (g !== vw.ans) return react(`${g} is made at the ${places(g)}; ${vw.v} at the ${places(vw.v)}. Look for a shared place.`, 'think');
		done = { ...done, [vw.v]: true };
		if (vw.v === 'ऋ') react('None of अ ए ओ is made at the roof. ऋ takes अ, and 1.1.51 adds र्: ऋ → अर्. As in कर्तृ.', 'surprised');
		else react(`${vw.v} → ${g}: they share the ${places(vw.v)}. ${vw.ex}.`, 'happy');
		if (Object.keys(done).length === 3) complete();
		else cur = VOWELS.findIndex((x) => !done[x.v] && x.v !== vw.v);
	}
</script>

<div class="vows" role="group" aria-label="Vowel">
	{#each VOWELS as vw, i (vw.v)}
		<button class="vw deva" class:sel={cur === i} class:ok={done[vw.v]} onclick={() => (cur = i)}>{vw.v}<small>{places(vw.v)}</small></button>
	{/each}
</div>
<p class="q">guṇa of <b class="deva">{VOWELS[cur].v}</b> =</p>
<div class="gs" role="group" aria-label="Guṇa vowels">
	{#each GUNA as g (g)}
		<button class="g deva" onclick={() => pick(g)}>{g}<small>{places(g)}</small></button>
	{/each}
</div>
<p class="muted note">ऋ and ऌ have no guṇa vowel at their own place; <SutraRef n="1.1.51" s="उरण् रपरः" /> says a substitute aṇ (अ, इ, उ) replacing them is followed by र् (or ल्): ऋ → अर्, ऌ → अल्.</p>

<style>
	.vows,
	.gs {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
	}
	.vw,
	.g {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 110px;
		height: 96px;
		border-radius: 14px;
		border: 2px solid var(--line);
		background: var(--surface);
		font-size: 34px;
		cursor: pointer;
		color: var(--ink);
	}
	small {
		font-family: var(--font-ui);
		font-size: 11.5px;
		color: var(--muted);
	}
	.vw.sel {
		border-color: var(--saffron);
		background: var(--saffron-soft);
	}
	.vw.ok {
		border-color: var(--r-subject);
	}
	.g:hover {
		border-color: var(--indigo);
	}
	.q {
		font-size: 18px;
		margin: 18px 0 8px;
	}
	.q b {
		font-size: 26px;
	}
	.note {
		margin-top: 18px;
		font-size: 14px;
		max-width: 46em;
	}
</style>
