<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	let fifth = $state(false);
	let flips = 0;

	// दधि + अत्र: … ध इ | अ त् …  The trigger is the vowel अ.
	const SEQ = ['द्', 'अ', 'ध्', 'इ', 'अ', 'त्', 'र्', 'अ'];
	const TRIGGER = 4;
	const affected = $derived(fifth ? TRIGGER + 1 : TRIGGER - 1);

	function flip() {
		fifth = !fifth;
		flips++;
		react(
			fifth
				? 'Hypothetical "अचः" (5th case): the sound after the vowel would be the one to change.'
				: 'Real "अचि" (7th case): the sound before the vowel changes. That is the इ.',
			'think'
		);
		if (flips >= 2) complete();
	}
</script>

<div class="switch" role="group" aria-label="Case of the trigger word">
	<button aria-pressed={!fifth} onclick={() => fifth && flip()}><span class="deva">अचि</span> 7th · real</button>
	<button aria-pressed={fifth} onclick={() => !fifth && flip()}><span class="deva">अचः</span> 5th · hypothetical</button>
</div>

<div class="seq" aria-label="Sound sequence">
	{#each SEQ as v, i (i)}
		<span class="v deva" class:trigger={i === TRIGGER} class:hit={i === affected}>
			{v}
			{#if i === TRIGGER}<small>trigger</small>{/if}
			{#if i === affected}<small>changes</small>{/if}
		</span>
	{/each}
	<span class="arrow" style="left: calc({(affected + 0.5) * 56}px - 10px)">▼</span>
</div>

<table class="rules">
	<tbody>
		<tr><th>7th case</th><td>"when X follows": operate on the sound <b>before</b> X</td><td><SutraRef n="1.1.66" /></td></tr>
		<tr><th>5th case</th><td>"after X": operate on the sound <b>after</b> X</td><td><SutraRef n="1.1.67" /></td></tr>
		<tr><th>6th case</th><td>"in place of X": X itself is replaced</td><td><SutraRef n="1.1.49" /></td></tr>
	</tbody>
</table>

<style>
	.switch {
		display: inline-flex;
		border: 1.5px solid var(--line);
		border-radius: 999px;
		padding: 3px;
		background: var(--surface-2);
		margin-bottom: 26px;
	}
	.switch button {
		border: none;
		background: none;
		padding: 6px 16px;
		border-radius: 999px;
		cursor: pointer;
		font-size: 14px;
		color: var(--ink-2);
	}
	.switch button .deva {
		font-size: 18px;
		margin-right: 4px;
	}
	.switch button[aria-pressed='true'] {
		background: var(--surface);
		color: var(--ink);
		box-shadow: var(--shadow);
	}
	.seq {
		position: relative;
		display: flex;
		gap: 6px;
		padding: 34px 0 30px;
		overflow-x: auto;
	}
	.v {
		position: relative;
		display: grid;
		place-items: center;
		width: 50px;
		height: 56px;
		flex-shrink: 0;
		border-radius: 10px;
		border: 1.5px solid var(--line);
		background: var(--surface);
		font-size: 24px;
		transition: all 0.3s;
	}
	.v small {
		position: absolute;
		bottom: -22px;
		font-family: var(--font-ui);
		font-size: 11px;
		color: var(--muted);
		white-space: nowrap;
	}
	.v.trigger {
		border-color: var(--r-right);
		background: color-mix(in srgb, var(--r-right) 12%, var(--surface));
	}
	.v.hit {
		border-color: var(--r-target);
		background: var(--r-target);
		color: #fff;
		transform: translateY(-4px);
	}
	.v.hit small {
		color: var(--r-target);
		font-weight: 600;
	}
	.arrow {
		position: absolute;
		top: 6px;
		color: var(--r-target);
		transition: left 0.35s;
	}
	.rules {
		border-collapse: collapse;
		margin-top: 10px;
		font-size: 14.5px;
	}
	.rules th,
	.rules td {
		text-align: left;
		padding: 6px 12px 6px 0;
		border-bottom: 1px solid var(--line);
	}
	.rules th {
		white-space: nowrap;
	}
</style>
