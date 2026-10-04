<script lang="ts" module>
	export type Question = { q: string; options: string[]; answer: number; explain: string; deva?: boolean };
</script>

<script lang="ts">
	let { questions, ondone }: { questions: Question[]; ondone?: (score: number) => void } = $props();

	let i = $state(0);
	let picked = $state<number | null>(null);
	let score = $state(0);
	let finished = $state(false);
	const q = $derived(questions[i]);

	function pick(k: number) {
		if (picked !== null) return;
		picked = k;
		if (k === q.answer) score++;
	}
	function next() {
		if (i < questions.length - 1) {
			i++;
			picked = null;
		} else {
			finished = true;
			ondone?.(score);
		}
	}
	function retry() {
		i = 0;
		picked = null;
		score = 0;
		finished = false;
	}
</script>

<div class="quiz card">
	{#if !finished}
		<p class="eyebrow">Question {i + 1} of {questions.length}</p>
		<p class="q">{q.q}</p>
		<div class="opts" role="group" aria-label="Answers">
			{#each q.options as o, k (k)}
				<button
					class="opt"
					class:deva={q.deva}
					class:right={picked !== null && k === q.answer}
					class:wrong={picked === k && k !== q.answer}
					disabled={picked !== null}
					onclick={() => pick(k)}>{o}</button>
			{/each}
		</div>
		{#if picked !== null}
			<p class="explain" class:ok={picked === q.answer}>
				<b>{picked === q.answer ? 'Right.' : 'Not quite.'}</b>
				{q.explain}
			</p>
			<button class="btn primary" onclick={next}>{i < questions.length - 1 ? 'Next question' : 'See result'}</button>
		{/if}
	{:else}
		<p class="q">You got <b>{score} of {questions.length}</b>.</p>
		{#if score < questions.length}<button class="btn" onclick={retry}>Try again</button>{/if}
	{/if}
</div>

<style>
	.quiz {
		padding: 20px 22px;
		max-width: 640px;
	}
	.q {
		font-family: var(--font-serif);
		font-size: 19px;
		margin: 4px 0 14px;
	}
	.opts {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 8px;
		margin-bottom: 14px;
	}
	.opt {
		padding: 10px 14px;
		border-radius: 10px;
		border: 1.5px solid var(--line);
		background: var(--surface);
		text-align: left;
		cursor: pointer;
		font-size: 15.5px;
		color: var(--ink);
	}
	.opt.deva {
		font-family: var(--font-deva);
		font-size: 19px;
	}
	.opt:not(:disabled):hover {
		border-color: var(--indigo);
	}
	.opt:disabled {
		cursor: default;
	}
	.opt.right {
		border-color: var(--r-subject);
		background: color-mix(in srgb, var(--r-subject) 12%, var(--surface));
	}
	.opt.wrong {
		border-color: var(--r-target);
		background: color-mix(in srgb, var(--r-target) 10%, var(--surface));
	}
	.explain {
		font-size: 15px;
		color: var(--ink-2);
		padding: 10px 12px;
		border-radius: 8px;
		background: var(--surface-2);
	}
	.explain b {
		color: var(--r-target);
	}
	.explain.ok b {
		color: var(--r-subject);
	}
	@media (max-width: 520px) {
		.opts {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
