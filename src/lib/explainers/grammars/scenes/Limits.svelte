<script lang="ts">
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	const CLAIMS = [
		{ t: 'The Aṣṭādhyāyī is a finite set of rules that generates forms.', fair: true, why: 'Yes: it is generative in this sense.' },
		{ t: 'Pāṇini wrote BNF.', fair: false, why: 'No: Ingerman compared notational power; the formalisms differ.' },
		{ t: 'Its rules are precise enough to be implemented in software.', fair: true, why: 'Yes, largely: vidyut implements over 2,000 of them.' },
		{ t: 'It can be run without any interpretation.', fair: false, why: 'No: anuvṛtti, conflicts and some conditions rely on conventions and commentary.' },
		{ t: 'Many rules refer to meaning, not just form.', fair: true, why: 'Yes: kāraka roles and senses like "in the present" condition the rules.' },
		{ t: 'Sanskrit is the best language for computers.', fair: false, why: 'A popular myth with no basis in computer science.' }
	];
	let ans = $state<Record<number, boolean>>({});
	function judge(i: number, fair: boolean) {
		ans = { ...ans, [i]: fair };
		const c = CLAIMS[i];
		react(`${fair === c.fair ? 'Agreed.' : 'Hmm.'} ${c.why}`, fair === c.fair ? 'happy' : 'think');
		if (Object.keys(ans).length === CLAIMS.length) complete();
	}
</script>

<ul class="claims">
	{#each CLAIMS as c, i (i)}
		<li class:done={ans[i] !== undefined} class:right={ans[i] === c.fair} class:wrong={ans[i] !== undefined && ans[i] !== c.fair}>
			<span class="t">{c.t}</span>
			<span class="b">
				<button class="btn" onclick={() => judge(i, true)}>fair</button>
				<button class="btn" onclick={() => judge(i, false)}>unfair</button>
			</span>
			{#if ans[i] !== undefined}<small>{c.why}</small>{/if}
		</li>
	{/each}
</ul>

<style>
	.claims {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
		max-width: 760px;
	}
	li {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 4px 12px;
		align-items: center;
		padding: 10px 14px;
		border-radius: 12px;
		border: 1.5px solid var(--line);
		background: var(--surface);
	}
	li.right {
		border-color: var(--r-subject);
	}
	li.wrong {
		border-color: var(--r-target);
	}
	.b {
		display: flex;
		gap: 6px;
	}
	.b .btn {
		padding: 4px 12px;
		font-size: 13px;
	}
	small {
		grid-column: 1 / -1;
		color: var(--ink-2);
		font-size: 13.5px;
	}
</style>
