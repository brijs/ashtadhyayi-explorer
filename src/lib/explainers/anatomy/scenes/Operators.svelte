<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import { WORDS } from '../words.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();

	const SLOTS = [
		{ label: 'in place of …', sub: '6th case · 1.1.49', role: 'target' },
		{ label: '… put', sub: '1st case', role: 'subject' },
		{ label: 'when … follows', sub: '7th case · 1.1.66', role: 'right' }
	];
	let selected = $state<number | null>(null);
	let placed = $state<(number | null)[]>([null, null, null]);

	function pickWord(i: number) {
		if (placed.includes(i)) return;
		selected = i;
	}
	function pickSlot(s: number) {
		if (selected === null) return react('First tap one of the words below.', 'think');
		const w = WORDS[selected];
		if (w.slot !== s) {
			const hint = ['That slot takes the 6th case: the thing being replaced.', 'That slot takes the 1st case: the replacement itself.', 'That slot takes the 7th case: what must come next.'][s];
			return react(hint, 'think');
		}
		placed[s] = selected;
		selected = null;
		if (placed.every((p) => p !== null)) {
			react('ik → yaṇ / _ ac. "In place of an ik vowel, put a yaṇ semivowel, when an ac vowel follows."', 'happy');
			complete();
		} else react('Yes!', 'happy');
	}
</script>

<div class="formula" role="group" aria-label="Rule template">
	{#each SLOTS as slot, s (s)}
		{#if s === 1}<span class="op">→</span>{/if}
		{#if s === 2}<span class="op">/</span><span class="blank">＿</span>{/if}
		<button class="slot" class:filled={placed[s] !== null} style="--c: var(--r-{slot.role})" onclick={() => pickSlot(s)}>
			{#if placed[s] !== null}
				<span class="deva">{WORDS[placed[s]!].stem}</span>
			{:else}
				<span class="lbl">{slot.label}</span>
			{/if}
			<small>{slot.sub}</small>
		</button>
	{/each}
</div>

<div class="bank" role="group" aria-label="Words">
	{#each WORDS as w, i (w.w)}
		<button class="word" class:sel={selected === i} class:used={placed.includes(i)} disabled={placed.includes(i)} onclick={() => pickWord(i)}>
			<span class="deva">{w.w}</span>
		</button>
	{/each}
</div>

<p class="muted note">
	These conventions are themselves sūtras, meta-rules (paribhāṣā) about how to read the others:
	<SutraRef n="1.1.49" s="षष्ठी स्थानेयोगा" />, <SutraRef n="1.1.66" s="तस्मिन्निति निर्दिष्टे पूर्वस्य" />,
	<SutraRef n="1.1.67" s="तस्मादित्युत्तरस्य" />.
</p>

<style>
	.formula {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 10px;
		padding: 20px;
		border-radius: 16px;
		background: var(--surface-2);
		margin-bottom: 20px;
	}
	.slot {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-width: 130px;
		min-height: 84px;
		padding: 8px 12px;
		border-radius: 12px;
		border: 2px dashed color-mix(in srgb, var(--c) 60%, transparent);
		background: var(--surface);
		cursor: pointer;
		color: var(--ink);
	}
	.slot.filled {
		border-style: solid;
		border-color: var(--c);
		background: color-mix(in srgb, var(--c) 12%, var(--surface));
		animation: pop 0.3s;
	}
	.slot .deva {
		font-size: 32px;
		line-height: 1.3;
		color: var(--c);
	}
	.lbl {
		font-family: var(--font-serif);
		font-style: italic;
		color: var(--c);
	}
	.slot small {
		font-size: 11.5px;
		color: var(--muted);
	}
	.op,
	.blank {
		font-size: 26px;
		color: var(--muted);
		font-family: var(--font-mono);
	}
	.bank {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
	}
	.word {
		padding: 6px 20px;
		border-radius: 12px;
		border: 2px solid var(--line);
		background: var(--surface);
		font-size: 28px;
		cursor: pointer;
		color: var(--ink);
	}
	.word.sel {
		border-color: var(--indigo);
		background: var(--indigo-soft);
		transform: translateY(-3px);
	}
	.word.used {
		opacity: 0.3;
		cursor: default;
	}
	.note {
		margin-top: 20px;
		font-size: 14px;
		max-width: 46em;
	}
	@keyframes pop {
		50% {
			transform: scale(1.06);
		}
	}
	@media (max-width: 560px) {
		.slot {
			min-width: 96px;
			min-height: 70px;
		}
		.formula {
			padding: 12px;
		}
	}
</style>
