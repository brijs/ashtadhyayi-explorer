<script lang="ts">
	import { fly } from 'svelte/transition';
	/** The word-in-progress: pieces joined by +, with the newest piece highlighted. */
	let { pieces, fresh = -1 }: { pieces: string[]; fresh?: number } = $props();
</script>

<div class="state" aria-label="Word so far">
	<span class="eyebrow">so far</span>
	<div class="row">
		{#each pieces as p, i (i + p)}
			{#if i}<span class="plus">+</span>{/if}
			<span class="pc deva" class:fresh={i === fresh} in:fly={{ y: -10, duration: 300 }}>{p}</span>
		{/each}
	</div>
</div>

<style>
	.state {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 12px 16px;
		margin-bottom: 18px;
		border-radius: 14px;
		background: #1d2140;
		color: #e6e8ff;
		width: fit-content;
		min-width: 260px;
	}
	.state .eyebrow {
		color: #8b90b8;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}
	.pc {
		font-size: 32px;
		padding: 0 10px;
		border-radius: 8px;
	}
	.pc.fresh {
		background: rgb(240 162 76 / 0.25);
		color: #f6bb79;
	}
	.plus {
		color: #8b90b8;
	}
</style>
