<script lang="ts">
	import { settings } from '#lib/settings.svelte.ts';
	import { WORDS } from '../words.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	let shown = $state<boolean[]>([false, false, false]);

	const notes = [
		'इकः: genitive, "of ik". In a grammar rule it will mean more than "of".',
		'यण्: nominative, the plain naming form.',
		'अचि: locative, "in/at ac". Hold on to that.'
	];
	function reveal(i: number) {
		shown[i] = true;
		react(notes[i], 'think');
		if (shown.every(Boolean)) {
			react('Sixth, first, seventh. Ordinary grammar so far. Next: what Pāṇini makes these cases mean.', 'happy');
			complete();
		}
	}
</script>

<div class="words">
	{#each WORDS as w, i (w.w)}
		<button class="w" class:on={shown[i]} style="--c: var(--r-{w.role})" onclick={() => reveal(i)}>
			<span class="deva">{w.w}</span>
			{#if settings.iast}<span class="iast">{w.iast}</span>{/if}
			<span class="vib">{shown[i] ? w.vib : 'tap to reveal'}</span>
		</button>
	{/each}
</div>

<style>
	.words {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 14px;
		max-width: 680px;
	}
	.w {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding: 18px 8px;
		border-radius: 16px;
		border: 2px solid var(--line);
		background: var(--surface);
		cursor: pointer;
		color: var(--ink);
		transition: all 0.25s;
	}
	.w .deva {
		font-size: clamp(30px, 5vw, 42px);
		line-height: 1.4;
	}
	.w.on {
		border-color: var(--c);
		background: color-mix(in srgb, var(--c) 10%, var(--surface));
	}
	.vib {
		font-size: 13px;
		color: var(--muted);
		text-align: center;
	}
	.w.on .vib {
		color: var(--c);
		font-weight: 600;
	}
</style>
