<script lang="ts">
	import { onDestroy } from 'svelte';
	import SutraRef from '#lib/components/SutraRef.svelte';
	import { runIkoYanaci, IK, type Step } from '#lib/sandhi.ts';
	import { isVowel } from '#lib/varna.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();

	const EXAMPLES: [string, string, string][] = [
		['दधि', 'अत्र', 'curd + here'],
		['मधु', 'अत्र', 'honey + here'],
		['कर्तृ', 'अर्थम्', 'doer + for the sake of'],
		['गौरी', 'अत्र', 'Gaurī + here'],
		['दधि', 'इह', 'curd + here (another word)'],
		['मधु', 'पिबति', 'honey + drinks']
	];
	let ex = $state(0);
	let steps = $state<Step[]>([]);
	let k = $state(-1);
	let result = $state('');
	let input = $state<string[]>([]);
	let timer: ReturnType<typeof setInterval> | undefined;
	let runs = new Set<number>();

	const cur = $derived(k >= 0 ? steps[k] : null);
	const tiles = $derived(cur ? cur.varnas : input);

	function load(i: number) {
		clearInterval(timer);
		ex = i;
		const r = runIkoYanaci(EXAMPLES[i][0], EXAMPLES[i][1]);
		steps = r.steps;
		input = r.input;
		result = r.result;
		k = -1;
	}
	load(0);

	function run() {
		load(ex);
		timer = setInterval(() => {
			if (k >= steps.length - 1) {
				clearInterval(timer);
				finish();
				return;
			}
			k++;
		}, 320);
	}
	function finish() {
		const fired = steps.filter((s) => s.sutra);
		runs.add(ex);
		if (!fired.length) react('No इक् is followed by a vowel, so the rule never fires. The words just sit side by side.', 'think');
		else if (fired.some((s) => s.sutra === '6.1.101')) react('6.1.77 would apply, but 6.1.101 is more specific (similar vowels merge into a long one) and wins. An exception, apavāda.', 'surprised');
		else react(`${EXAMPLES[ex][0]} + ${EXAMPLES[ex][1]} → ${result}. The rule fired exactly once.`, 'happy');
		if (runs.size >= 2) complete();
	}
	onDestroy(() => clearInterval(timer));
	const cls = (v: string, i: number) => {
		if (!cur || i !== cur.at) return '';
		return cur.kind === 'scan' ? (IK.includes(v) ? 'check' : 'scan') : 'fire';
	};
</script>

<div class="examples" role="group" aria-label="Examples">
	{#each EXAMPLES as [a, b, gloss], i (i)}
		<button class="btn" aria-pressed={ex === i} onclick={() => load(i)} title={gloss}><span class="deva">{a} + {b}</span></button>
	{/each}
</div>

<div class="machine card">
	<div class="tiles" aria-label="Sounds">
		{#each tiles as v, i (i + v)}
			<span class="t deva {cls(v, i)}" class:vowel={isVowel(v)}>{v}</span>
		{/each}
	</div>
	<p class="log" aria-live="polite">
		{#if cur}
			<span class="deva">{cur.note}</span>
			{#if cur.sutra}<span class="fired">fires <SutraRef n={cur.sutra} /></span>{/if}
		{:else}
			<span class="muted">Press Run to scan the joined sounds left to right.</span>
		{/if}
	</p>
	<div class="row">
		<button class="btn primary" onclick={run}>▶ Run</button>
		{#if k === steps.length - 1}
			<span class="out">Result: <b class="deva">{steps.some((s) => s.sutra) ? result : `${EXAMPLES[ex][0]} ${EXAMPLES[ex][1]}`}</b></span>
		{/if}
	</div>
</div>

<p class="muted note">
	The machine checks one thing at each sound: is it in <span class="deva">इक्</span> (with its long forms, by 1.1.69), and is the next
	sound in <span class="deva">अच्</span>? Real sandhi involves more rules; this one is isolated for clarity.
</p>

<style>
	.examples {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 16px;
	}
	.examples .deva {
		font-size: 17px;
	}
	.machine {
		padding: 20px;
	}
	.tiles {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.t {
		display: grid;
		place-items: center;
		min-width: 44px;
		height: 50px;
		padding: 0 4px;
		border-radius: 10px;
		border: 1.5px solid var(--line);
		background: var(--surface);
		font-size: 22px;
		transition: all 0.2s;
	}
	.t.vowel {
		background: var(--surface-2);
	}
	.t.scan {
		border-color: var(--muted);
		transform: translateY(-3px);
	}
	.t.check {
		border-color: var(--r-target);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--r-target) 20%, transparent);
		transform: translateY(-3px);
	}
	.t.fire {
		border-color: var(--r-subject);
		background: var(--r-subject);
		color: #fff;
		transform: translateY(-5px) scale(1.05);
	}
	.log {
		min-height: 52px;
		margin: 16px 0 12px;
		font-size: 16px;
	}
	.fired {
		display: inline-block;
		margin-left: 8px;
		padding: 0 8px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--r-subject) 14%, transparent);
		color: var(--r-subject);
		font-size: 13.5px;
		font-weight: 600;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 16px;
		flex-wrap: wrap;
	}
	.out b {
		font-size: 24px;
		color: var(--r-subject);
	}
	.note {
		margin-top: 16px;
		font-size: 14px;
		max-width: 46em;
	}
</style>
