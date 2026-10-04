<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete, data }: SceneProps<{ tripadi: { count: number; startFrac: number; total: number } }> = $props();
	let shown = $state(false);
	function toggle() {
		shown = !shown;
		if (shown) {
			react(`${(data.tripadi.total - data.tripadi.count).toLocaleString()} sūtras before, ${data.tripadi.count} in the tripādī. To the main grammar, the tripādī's changes are invisible.`, 'surprised');
			complete();
		}
	}
</script>

<button class="bar" onclick={toggle} aria-pressed={shown} aria-label="Show the split at 8.2.1">
	<span class="main" style="width: {data.tripadi.startFrac * 100}%">
		{#if shown}<b>sapāda-saptādhyāyī</b><small>1.1.1 – 8.1.74 · "seven and a quarter chapters"</small>{/if}
	</span>
	<span class="tri" class:on={shown}>
		{#if shown}<b>tripādī</b><small>8.2.1 – 8.4.68 · {data.tripadi.count}</small>{/if}
	</span>
</button>
<p class="hint muted">{shown ? '' : 'Tap the bar.'}</p>
<div class="rule card">
	<SutraRef n="8.2.1" s="पूर्वत्रासिद्धम्" />
	<span>"With respect to what precedes, (this is) not effective (asiddha)." It applies to every rule in the last three pādas, and among them too: each counts as not having happened for the ones before it.</span>
</div>

<style>
	.bar {
		display: flex;
		width: 100%;
		height: 92px;
		padding: 0;
		border: 1px solid var(--line);
		border-radius: 14px;
		overflow: hidden;
		cursor: pointer;
		background: var(--surface);
	}
	.main,
	.tri {
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 0 14px;
		text-align: left;
		color: var(--ink);
		min-width: 0;
	}
	.main {
		background: var(--surface-2);
	}
	.tri {
		flex: 1;
		background: var(--surface-3);
		transition: background 0.4s;
	}
	.tri.on {
		background: var(--indigo);
		color: #fff;
	}
	small {
		font-size: 12px;
		opacity: 0.8;
	}
	.hint {
		font-size: 13px;
		min-height: 1.5em;
	}
	.rule {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 14px 18px;
		max-width: 680px;
		font-family: var(--font-serif);
	}
	.rule :global(.sref) {
		font-size: 19px;
	}
	@media (max-width: 600px) {
		.main small,
		.tri small {
			display: none;
		}
		.tri b {
			font-size: 12px;
		}
	}
</style>
