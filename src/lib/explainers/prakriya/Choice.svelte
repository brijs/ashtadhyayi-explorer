<script lang="ts">
	/** A row of answer buttons; calls onpick with the chosen index. */
	let { options, answer, onpick, deva = true }: { options: { label: string; sub?: string }[]; answer: number; onpick: (i: number, ok: boolean) => void; deva?: boolean } = $props();
	let picked = $state<number | null>(null);
	function pick(i: number) {
		picked = i;
		onpick(i, i === answer);
	}
</script>

<div class="opts">
	{#each options as o, i (i)}
		<button class="o" class:deva class:ok={picked === i && i === answer} class:no={picked === i && i !== answer} onclick={() => pick(i)}>
			{o.label}{#if o.sub}<small>{o.sub}</small>{/if}
		</button>
	{/each}
</div>

<style>
	.opts {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}
	.o {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 110px;
		padding: 10px 16px;
		border-radius: 12px;
		border: 2px solid var(--line);
		background: var(--surface);
		cursor: pointer;
		color: var(--ink);
		font-size: 17px;
	}
	.o.deva {
		font-size: 24px;
	}
	.o small {
		font-family: var(--font-ui);
		font-size: 11.5px;
		color: var(--muted);
	}
	.o:hover {
		border-color: var(--indigo);
	}
	.o.ok {
		border-color: var(--r-subject);
		background: color-mix(in srgb, var(--r-subject) 12%, var(--surface));
	}
	.o.no {
		border-color: var(--r-target);
		animation: shake 0.3s;
	}
	@keyframes shake {
		25% { transform: translateX(-4px); }
		75% { transform: translateX(4px); }
	}
</style>
