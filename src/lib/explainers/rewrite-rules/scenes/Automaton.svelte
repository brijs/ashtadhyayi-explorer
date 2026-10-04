<script lang="ts">
	import { toVarnas, fromVarnas, isVowel } from '#lib/varna.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete, panel }: SceneProps = $props();

	// A two-state transducer for 6.1.77 alone: S0 = copying; S1 = holding an ik vowel until we see what follows.
	const IK = ['इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ॠ', 'ऌ'];
	const YAN: Record<string, string> = { 'इ': 'य्', 'ई': 'य्', 'उ': 'व्', 'ऊ': 'व्', 'ऋ': 'र्', 'ॠ': 'र्', 'ऌ': 'ल्' };
	const INPUTS = ['दधि अत्र', 'मधु अरिः', 'दधि करोति'];

	let inputIdx = $state(0);
	const tape = $derived(toVarnas(INPUTS[inputIdx]).filter((v) => v.trim()));
	let pos = $state(0);
	let fsm = $state<'S0' | 'S1'>('S0');
	let held = $state<string | null>(null);
	let out = $state<string[]>([]);
	let lastEdge = $state('');
	let runs = 0;

	function reset(i = inputIdx) {
		inputIdx = i;
		pos = 0;
		fsm = 'S0';
		held = null;
		out = [];
		lastEdge = '';
	}

	function step() {
		if (pos > tape.length) return;
		if (pos === tape.length) {
			// end of input: flush anything held
			if (held) out = [...out, held];
			lastEdge = held ? `end: emit held ${held}` : 'end';
			held = null;
			fsm = 'S0';
			pos++;
			runs++;
			react(`Output: ${fromVarnas(out)}. The machine never looks back more than one sound.`, 'happy');
			if (runs >= 1) complete();
			return;
		}
		const x = tape[pos];
		if (fsm === 'S0') {
			if (IK.includes(x)) {
				fsm = 'S1';
				held = x;
				lastEdge = `S0 → S1: ${x} is an ik; hold it`;
			} else {
				out = [...out, x];
				lastEdge = `S0 → S0: copy ${x}`;
			}
		} else {
			const h = held!;
			if (isVowel(x)) {
				out = [...out, YAN[h]];
				lastEdge = `S1: vowel ${x} follows, so emit ${YAN[h]} for ${h}`;
				panel('6.1.77!');
			} else {
				out = [...out, h];
				lastEdge = `S1: ${x} is not a vowel, so emit ${h} unchanged`;
			}
			held = null;
			if (IK.includes(x)) {
				held = x;
				lastEdge += `; hold ${x}`;
			} else {
				out = [...out, x];
				fsm = 'S0';
			}
		}
		pos++;
	}
</script>

<div class="inputs" role="group" aria-label="Input">
	{#each INPUTS as s, i (s)}
		<button class="btn deva" aria-pressed={inputIdx === i} onclick={() => reset(i)}>{s}</button>
	{/each}
</div>

<div class="fsm">
	<svg viewBox="0 0 360 150" role="img" aria-label="Two-state machine: S0 copying, S1 holding an ik vowel">
		<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="currentColor" /></marker></defs>
		<g class="edge"><path d="M118 62 Q180 20 242 62" marker-end="url(#ar)" /><text x="180" y="28">ik: hold</text></g>
		<g class="edge"><path d="M242 92 Q180 134 118 92" marker-end="url(#ar)" /><text x="180" y="140">other: emit</text></g>
		<g class="edge"><path d="M76 50 C56 4 124 4 104 50" marker-end="url(#ar)" /><text x="90" y="14">copy</text></g>
		<g class="node" class:on={fsm === 'S0'}><circle cx="90" cy="77" r="30" /><text x="90" y="82">S0</text></g>
		<g class="node" class:on={fsm === 'S1'}><circle cx="270" cy="77" r="30" /><text x="270" y="82">S1</text></g>
		{#if held}<text class="held deva" x="270" y="125">{held}</text>{/if}
	</svg>
	<div class="tapes">
		<div class="tape" aria-label="Input tape">
			<span class="lbl">in</span>
			{#each tape as v, i (i)}<span class="cell deva" class:head={i === pos} class:done={i < pos}>{v}</span>{/each}
		</div>
		<div class="tape" aria-label="Output tape">
			<span class="lbl">out</span>
			{#each out as v, i (i)}<span class="cell deva o">{v}</span>{/each}
		</div>
		<p class="edge-log">{lastEdge || 'Press Step.'}</p>
		<div class="ctl">
			<button class="btn primary" onclick={step} disabled={pos > tape.length}>Step ▶</button>
			<button class="btn" onclick={() => reset()}>Reset</button>
			{#if pos > tape.length}<span class="deva result">{fromVarnas(out)}</span>{/if}
		</div>
	</div>
</div>

<p class="muted note">
	Kaplan and Kay (1994, <i>Computational Linguistics</i> 20:3) showed that ordered rewrite rules of this kind, provided a
	rule does not reapply to its own output, can be compiled into finite-state transducers. This toy handles 6.1.77 alone
	(and not the 6.1.101 exception) to keep the picture small.
</p>

<style>
	.inputs {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		margin-bottom: 14px;
	}
	.inputs .btn {
		font-size: 16px;
	}
	.fsm {
		display: grid;
		grid-template-columns: minmax(0, 360px) minmax(0, 1fr);
		gap: 20px;
		align-items: center;
	}
	svg {
		width: 100%;
		color: var(--muted);
	}
	.edge path {
		fill: none;
		stroke: currentColor;
		stroke-width: 1.5;
	}
	.edge text {
		font-size: 11px;
		fill: var(--ink-2);
		text-anchor: middle;
		font-family: var(--font-mono);
	}
	.node circle {
		fill: var(--surface);
		stroke: var(--ink-2);
		stroke-width: 2;
		transition: fill 0.2s;
	}
	.node text {
		text-anchor: middle;
		font-family: var(--font-mono);
		font-size: 15px;
		fill: var(--ink);
	}
	.node.on circle {
		fill: var(--saffron);
		stroke: var(--saffron);
	}
	.node.on text {
		fill: #fff;
	}
	.held {
		text-anchor: middle;
		font-size: 18px;
		fill: var(--saffron-ink);
	}
	.tape {
		display: flex;
		align-items: center;
		gap: 4px;
		flex-wrap: wrap;
		margin-bottom: 8px;
	}
	.lbl {
		width: 30px;
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--muted);
	}
	.cell {
		display: grid;
		place-items: center;
		min-width: 34px;
		height: 38px;
		border-radius: 6px;
		border: 1px solid var(--line);
		background: var(--surface);
		font-size: 18px;
	}
	.cell.done {
		opacity: 0.45;
	}
	.cell.head {
		border-color: var(--saffron);
		box-shadow: 0 0 0 2px var(--saffron-soft);
	}
	.cell.o {
		background: color-mix(in srgb, var(--r-subject) 10%, var(--surface));
		border-color: color-mix(in srgb, var(--r-subject) 40%, transparent);
	}
	.edge-log {
		font-family: var(--font-mono), var(--font-deva);
		font-size: 13px;
		color: var(--ink-2);
		min-height: 2.4em;
	}
	.ctl {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.result {
		font-size: 26px;
		font-weight: 600;
		color: var(--r-subject);
	}
	.note {
		margin-top: 18px;
		font-size: 14px;
		max-width: 50em;
	}
	@media (max-width: 760px) {
		.fsm {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
