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
	let playing = $state(false);
	let timer: ReturnType<typeof setInterval> | undefined;
	let runs = new Set<number>();
	let finished = new Set<number>();

	const cur = $derived(k >= 0 ? steps[k] : null);
	const tiles = $derived(cur ? cur.varnas : input);
	// the sounds just before the current step, to show what a firing rule changed
	const before = $derived(k > 0 ? steps[k - 1].varnas : input);
	const fires = $derived(steps.map((s, i) => (s.sutra ? i : -1)).filter((i) => i >= 0));

	function stop() {
		playing = false;
		clearInterval(timer);
	}
	function load(i: number) {
		stop();
		ex = i;
		const r = runIkoYanaci(EXAMPLES[i][0], EXAMPLES[i][1]);
		steps = r.steps;
		input = r.input;
		result = r.result;
		k = -1;
	}
	load(0);

	function go(i: number) {
		k = Math.max(-1, Math.min(steps.length - 1, i));
		if (k === steps.length - 1 && !finished.has(ex)) {
			finished.add(ex);
			finish();
		}
	}
	// Play advances slowly and pauses on the step where a rule fires, so the change is easy to see.
	function play() {
		if (playing) return stop();
		if (k >= steps.length - 1) k = -1;
		playing = true;
		timer = setInterval(() => {
			if (k >= steps.length - 1) return stop();
			go(k + 1);
			if (steps[k]?.sutra) stop();
		}, 750);
	}
	function finish() {
		const fired = steps.filter((s) => s.sutra);
		runs.add(ex);
		if (!fired.length) react('No इक् is followed by a vowel, so the rule never fires. The words just sit side by side.', 'think');
		else if (fired.some((s) => s.sutra === '6.1.101')) react('6.1.77 would apply, but 6.1.101 is more specific (similar vowels merge into a long one) and wins. An exception, apavāda.', 'surprised');
		else react(`${EXAMPLES[ex][0]} + ${EXAMPLES[ex][1]} → ${result}. The rule fired exactly once.`, 'happy');
		if (runs.size >= 2) complete();
	}
	onDestroy(stop);
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
	{#if cur?.sutra}
		<div class="change" aria-label="What changed">
			<span class="lab">before</span>
			<div class="tiles">
				{#each before as v, i (i + v)}<span class="t deva small" class:was={i === cur.at || (cur.kind === 'dirgha' && i === cur.at + 1)} class:vowel={isVowel(v)}>{v}</span>{/each}
			</div>
			<span class="lab">after</span>
		</div>
	{/if}
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
			<span class="muted">Step through the joined sounds left to right, or press Play. Play pauses where the rule fires.</span>
		{/if}
	</p>

	<div class="trail" role="group" aria-label="Steps">
		<button class="dot start" class:on={k === -1} onclick={() => { stop(); go(-1); }} aria-label="Start">○</button>
		{#each steps as st, i (i)}
			<button class="dot" class:on={k === i} class:past={i < k} class:firing={!!st.sutra} onclick={() => { stop(); go(i); }} aria-label="Step {i + 1}{st.sutra ? `, ${st.sutra} fires` : ''}">{st.sutra ? '★' : ''}</button>
		{/each}
	</div>

	<div class="row">
		<div class="transport" role="group" aria-label="Controls">
			<button onclick={() => { stop(); go(-1); }} disabled={k === -1} aria-label="Back to start">⏮</button>
			<button onclick={() => { stop(); go(k - 1); }} disabled={k === -1} aria-label="Step back">◀</button>
			<button class="play" onclick={play} aria-label={playing ? 'Pause' : 'Play'}>{playing ? '❚❚' : '▶'}</button>
			<button onclick={() => { stop(); go(k + 1); }} disabled={k === steps.length - 1} aria-label="Step forward">▶|</button>
			<button onclick={() => { stop(); go(steps.length - 1); }} disabled={k === steps.length - 1} aria-label="Jump to end">⏭</button>
		</div>
		<span class="count muted">{k === -1 ? 'start' : `step ${k + 1} of ${steps.length}`}{fires.length ? ` · ★ = rule fires (step ${fires.map((f) => f + 1).join(', ')})` : ' · no rule fires here'}</span>
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
	.change {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin-bottom: 6px;
	}
	.lab {
		font-size: 11.5px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--muted);
	}
	.t.small {
		min-width: 34px;
		height: 38px;
		font-size: 18px;
		opacity: 0.75;
	}
	.t.was {
		border-color: var(--r-target);
		background: color-mix(in srgb, var(--r-target) 14%, var(--surface));
		color: var(--r-target);
		opacity: 1;
		text-decoration: line-through;
	}
	.trail {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin-bottom: 12px;
	}
	.dot {
		width: 22px;
		height: 22px;
		padding: 0;
		border-radius: 50%;
		border: 1.5px solid var(--line);
		background: var(--surface);
		cursor: pointer;
		font-size: 11px;
		line-height: 1;
		color: var(--r-subject);
	}
	.dot.past {
		background: var(--surface-3);
	}
	.dot.firing {
		border-color: var(--r-subject);
	}
	.dot.on {
		border-color: var(--saffron);
		background: var(--saffron);
		color: #fff;
	}
	.start {
		color: var(--muted);
	}
	.transport {
		display: flex;
		gap: 4px;
	}
	.transport button {
		width: 40px;
		height: 36px;
		border-radius: 8px;
		border: 1px solid var(--line);
		background: var(--surface);
		cursor: pointer;
		color: var(--ink);
		font-size: 13px;
	}
	.transport button:disabled {
		opacity: 0.35;
		cursor: default;
	}
	.transport .play {
		width: 48px;
		background: var(--saffron);
		border-color: var(--saffron);
		color: #fff;
	}
	.count {
		font-size: 13px;
	}
	.note {
		margin-top: 16px;
		font-size: 14px;
		max-width: 46em;
	}
</style>
