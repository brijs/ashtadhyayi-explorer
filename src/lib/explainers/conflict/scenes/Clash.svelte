<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	const RULES = [
		{ n: '7.3.102', s: 'सुपि च', cond: 'before a case ending starting with a यञ् sound (भ is one)', out: 'वृक्षाभ्यः', change: 'अ → आ', ok: false },
		{ n: '7.3.103', s: 'बहुवचने झल्येत्', cond: 'before a plural case ending starting with a झल् sound (भ is one too)', out: 'वृक्षेभ्यः', change: 'अ → ए', ok: true }
	];
	let tried = $state<Record<string, boolean>>({});
	function apply(i: number) {
		tried = { ...tried, [RULES[i].n]: true };
		react(`${RULES[i].n} gives ${RULES[i].out}. ${Object.keys(tried).length < 2 ? 'Now try the other rule.' : 'Two rules, two answers. Only one is real Sanskrit: वृक्षेभ्यः.'}`, Object.keys(tried).length < 2 ? 'think' : 'surprised');
		if (Object.keys(tried).length === 2) complete();
	}
</script>

<div class="input card">
	<span class="eyebrow">dative/ablative plural of वृक्ष "tree"</span>
	<span class="deva big">वृक्ष + भ्यस्</span>
</div>
<div class="rules">
	{#each RULES as r, i (r.n)}
		<div class="rule card" class:done={tried[r.n]}>
			<SutraRef n={r.n} s={r.s} />
			<span class="cond">{r.cond}</span>
			<button class="btn" onclick={() => apply(i)}>Apply: {r.change}</button>
			{#if tried[r.n]}<span class="out deva" class:ok={r.ok}>{r.out}</span>{/if}
		</div>
	{/each}
</div>

<style>
	.input {
		display: inline-flex;
		flex-direction: column;
		padding: 14px 20px;
		margin-bottom: 16px;
	}
	.big {
		font-size: 32px;
	}
	.rules {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
	}
	.rule {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 16px;
	}
	.rule :global(.sref) {
		font-size: 18px;
	}
	.cond {
		font-size: 14px;
		color: var(--ink-2);
	}
	.rule .btn {
		align-self: flex-start;
	}
	.out {
		font-size: 30px;
		font-weight: 600;
		color: var(--r-target);
	}
	.out.ok {
		color: var(--r-subject);
	}
	@media (max-width: 640px) {
		.rules {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
