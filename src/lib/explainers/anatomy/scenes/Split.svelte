<script lang="ts">
	import { fly } from 'svelte/transition';
	import { settings } from '#lib/settings.svelte.ts';
	import { WORDS } from '../words.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	let split = $state(false);

	function toggle() {
		split = !split;
		if (split) {
			react('इकः became इको before the voiced य, and यण् + अचि fused into यणचि. Same words, now visible.', 'happy');
			complete();
		}
	}
</script>

<button class="sutra" onclick={toggle} aria-pressed={split} aria-label={split ? 'Join the words again' : 'Split the sūtra into words'}>
	{#if !split}
		<span class="whole deva" in:fly={{ y: -10, duration: 250 }}>इको यणचि</span>
		{#if settings.iast}<span class="iast">iko yaṇaci</span>{/if}
	{:else}
		<span class="parts">
			{#each WORDS as w, i (w.w)}
				<span class="part" in:fly={{ x: (i - 1) * 40, duration: 380 }}>
					<span class="deva">{w.w}</span>
					{#if settings.iast}<span class="iast">{w.iast}</span>{/if}
				</span>
			{/each}
		</span>
	{/if}
	<span class="hint muted">{split ? 'tap to join again' : 'tap to split'}</span>
</button>

<div class="notes">
	<p><b>Sandhi in the sūtra itself.</b> Pāṇini's sūtras are pronounced in connected speech, so their words join just like any Sanskrit phrase. The first job of a reader is <i>padaccheda</i>: undoing that.</p>
	<p class="muted">Every sūtra page in this app starts with its padaccheda, the "Word by word" chips.</p>
</div>

<style>
	.sutra {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		width: 100%;
		min-height: 200px;
		border-radius: 18px;
		border: 1.5px dashed var(--line);
		background: var(--surface);
		cursor: pointer;
		color: var(--ink);
	}
	.sutra:hover {
		border-color: var(--saffron);
	}
	.whole {
		font-size: clamp(44px, 8vw, 72px);
		font-weight: 600;
		line-height: 1.4;
	}
	.parts {
		display: flex;
		gap: clamp(14px, 4vw, 40px);
	}
	.part {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.part .deva {
		font-size: clamp(36px, 6vw, 56px);
		line-height: 1.4;
		font-weight: 600;
	}
	.iast {
		font-size: 18px;
	}
	.hint {
		font-size: 13px;
	}
	.notes {
		margin-top: 20px;
		max-width: 46em;
		font-size: 15.5px;
	}
</style>
