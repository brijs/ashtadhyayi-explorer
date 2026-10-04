<script lang="ts">
	import ShivaGrid, { SOUND_GROUPS } from '#lib/components/ShivaGrid.svelte';
	import { SHIVA_FLAT } from '#lib/varna.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	let colorBy = $state(false);
	let showH = $state(false);
	const hSlots = new Set(SHIVA_FLAT.flatMap((s, i) => (s.varna === 'ह्' && !s.isIt ? [i] : [])));

	function toggle() {
		colorBy = !colorBy;
		if (colorBy) {
			react('Mostly tidy blocks of similar sounds. The order is chosen so that useful classes sit next to each other.', 'happy');
			complete();
		}
	}
	function findH() {
		showH = !showH;
		if (showH) react('ह sits in line 5 with the semivowels and again alone in line 14. That lets it belong to more than one class.', 'think');
	}
</script>

<div class="controls">
	<button class="btn" aria-pressed={colorBy} onclick={toggle}>Colour by sound type</button>
	<button class="btn" aria-pressed={showH} onclick={findH}>Find ह</button>
</div>
{#if colorBy}
	<ul class="legend">
		{#each SOUND_GROUPS as g (g.key)}<li class={g.key}><span></span>{g.label}</li>{/each}
	</ul>
{/if}
<ShivaGrid {colorBy} marked={showH ? hSlots : new Set()} />

<style>
	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 14px;
	}
	.legend {
		list-style: none;
		padding: 0;
		margin: 0 0 14px;
		display: flex;
		flex-wrap: wrap;
		gap: 4px 16px;
		font-size: 13.5px;
		color: var(--ink-2);
	}
	.legend span {
		display: inline-block;
		width: 12px;
		height: 12px;
		border-radius: 3px;
		margin-right: 6px;
		vertical-align: -1px;
		background: var(--c);
	}
	.vowel { --c: #c9670a; }
	.semi { --c: #0f7f62; }
	.nasal { --c: #8636be; }
	.voiced { --c: #2a64c8; }
	.voiceless { --c: #c02d48; }
	.fric { --c: #59606d; }
</style>
