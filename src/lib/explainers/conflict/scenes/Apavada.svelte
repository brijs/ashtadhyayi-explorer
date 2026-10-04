<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import { rewrite, RULES } from '#lib/rewrite.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	const all = new Set(RULES.map((r) => r.id));
	// position in the diagram: 'L' = only 6.1.77 matches, 'M' = both, 'R' = only 6.1.101
	const DOTS = [
		{ a: 'दधि', b: 'अत्र', zone: 'L', x: 95, y: 110 },
		{ a: 'मधु', b: 'अरिः', zone: 'L', x: 105, y: 175 },
		{ a: 'दधि', b: 'इह', zone: 'M', x: 200, y: 110 },
		{ a: 'मधु', b: 'उदकम्', zone: 'M', x: 200, y: 175 },
		{ a: 'विद्या', b: 'आलयः', zone: 'R', x: 300, y: 110 },
		{ a: 'दैत्य', b: 'अरिः', zone: 'R', x: 300, y: 175 }
	];
	let sel = $state<number | null>(null);
	let seen = new Set<string>();
	function pick(i: number) {
		sel = i;
		const d = DOTS[i];
		seen.add(d.zone);
		const r = rewrite(d.a, d.b, all);
		const fired = r.trace[0]?.rule.id;
		const why =
			d.zone === 'M'
				? 'Both rules match. 6.1.101 is the exception made for exactly this case, so it wins.'
				: d.zone === 'L'
					? 'Only 6.1.77 matches: the vowels are not similar.'
					: 'Only 6.1.101 matches: अ is not an इक् vowel.';
		react(`${d.a} + ${d.b} → ${r.result} (${fired}). ${why}`, d.zone === 'M' ? 'surprised' : 'happy');
		if (seen.has('M') && seen.size >= 2) complete();
	}
</script>

<svg viewBox="0 0 400 268" role="img" aria-label="Overlapping domains of 6.1.77 and 6.1.101">
	<circle cx="140" cy="135" r="100" class="c77" />
	<circle cx="260" cy="135" r="100" class="c101" />
	<text x="40" y="22" class="lab">6.1.77 इको यणचि (general)</text>
	<text x="360" y="22" class="lab end">6.1.101 अकः सवर्णे दीर्घः (exception)</text>
	<text x="200" y="262" class="lab mid">overlap: both match → exception wins</text>
	{#each DOTS as d, i (i)}
		<g class="dot" class:on={sel === i} role="button" tabindex="0" aria-label="{d.a} + {d.b}" onclick={() => pick(i)} onkeydown={(e) => e.key === 'Enter' && pick(i)}>
			<circle cx={d.x} cy={d.y} r="7" />
			<text x={d.x} y={d.y - 12}>{d.a}+{d.b}</text>
		</g>
	{/each}
</svg>
<p class="note">
	The general rule's domain is the left circle; the exception (<i>apavāda</i>) carves out the overlap. If the general rule
	won there, the exception would be useless. That is why an apavāda such as <SutraRef n="6.1.101" /> is preferred,
	wherever it stands in the text.
</p>

<style>
	svg {
		width: 100%;
		max-width: 560px;
	}
	.c77 {
		fill: color-mix(in srgb, var(--r-left) 12%, transparent);
		stroke: var(--r-left);
		stroke-width: 2;
	}
	.c101 {
		fill: color-mix(in srgb, var(--r-subject) 12%, transparent);
		stroke: var(--r-subject);
		stroke-width: 2;
	}
	.lab {
		font-size: 12px;
		fill: var(--ink-2);
		font-family: var(--font-ui), var(--font-deva);
	}
	.end {
		text-anchor: end;
	}
	.mid {
		text-anchor: middle;
		font-weight: 600;
	}
	.dot {
		cursor: pointer;
		outline: none;
	}
	.dot:focus-visible circle {
		stroke: var(--focus);
		stroke-width: 3;
	}
	.dot circle {
		fill: var(--surface);
		stroke: var(--ink);
		stroke-width: 2;
	}
	.dot.on circle {
		fill: var(--saffron);
		stroke: var(--saffron);
	}
	.dot text {
		font-size: 12px;
		text-anchor: middle;
		fill: var(--ink);
		font-family: var(--font-deva);
	}
	.note {
		font-size: 15px;
		max-width: 48em;
	}
</style>
