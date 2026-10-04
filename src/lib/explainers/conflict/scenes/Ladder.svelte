<script lang="ts">
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	// पूर्वपरनित्यान्तरङ्गापवादानामुत्तरोत्तरं बलीयः — each is stronger than the one before.
	const RUNGS = [
		{ k: 'para', sa: 'पर', en: 'later', d: 'the rule that comes later in the text (1.4.2)' },
		{ k: 'nitya', sa: 'नित्य', en: 'always-applicable', d: 'applies whether or not the other rule applies first' },
		{ k: 'antaranga', sa: 'अन्तरङ्ग', en: 'inner', d: 'depends on fewer, more internal conditions' },
		{ k: 'apavada', sa: 'अपवाद', en: 'exception', d: 'a specific rule made to override a general one' }
	];
	const SHUFFLED = [RUNGS[2], RUNGS[0], RUNGS[3], RUNGS[1]];
	let built = $state<string[]>([]);

	function tap(k: string) {
		if (built.includes(k)) return;
		const expected = RUNGS[built.length].k;
		if (k !== expected) return react('Not yet. Start from the weakest: which tie-breaker is the plainest default?', 'think');
		built = [...built, k];
		if (built.length === 4) {
			react('पूर्व < पर < नित्य < अन्तरङ्ग < अपवाद: each beats the one before it.', 'happy');
			complete();
		} else react('Yes.', 'happy');
	}
</script>

<p class="verse deva">पूर्वपरनित्यान्तरङ्गापवादानामुत्तरोत्तरं बलीयः</p>
<p class="muted">"Of earlier, later, always-applicable, inner and exception, each following one is stronger." Tap them from weakest to strongest.</p>

<div class="pool">
	{#each SHUFFLED as r (r.k)}
		<button class="chip" class:used={built.includes(r.k)} disabled={built.includes(r.k)} onclick={() => tap(r.k)}>
			<span class="deva">{r.sa}</span> <small>{r.en}</small>
		</button>
	{/each}
</div>

<ol class="ladder" reversed>
	{#each [...built].reverse() as k (k)}
		{@const r = RUNGS.find((x) => x.k === k)!}
		<li><b class="deva">{r.sa}</b> <span>{r.en}</span> <small>{r.d}</small></li>
	{/each}
	<li class="base"><b class="deva">पूर्व</b> <span>earlier rule</span> <small>the default loser</small></li>
</ol>

<style>
	.verse {
		font-size: 22px;
		margin: 0;
	}
	.pool {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 14px 0;
	}
	.chip {
		padding: 8px 16px;
		border-radius: 999px;
		border: 2px solid var(--line);
		background: var(--surface);
		cursor: pointer;
		color: var(--ink);
	}
	.chip .deva {
		font-size: 19px;
	}
	.chip small {
		color: var(--muted);
	}
	.chip.used {
		opacity: 0.3;
	}
	.ladder {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
		max-width: 560px;
	}
	.ladder li {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 4px 10px;
		padding: 8px 14px;
		border-radius: 10px;
		background: var(--saffron-soft);
		border-left: 4px solid var(--saffron);
		animation: drop 0.3s;
	}
	.ladder li.base {
		background: var(--surface-2);
		border-left-color: var(--line);
	}
	.ladder b {
		font-size: 19px;
	}
	.ladder small {
		width: 100%;
		color: var(--ink-2);
		font-size: 13px;
	}
	@keyframes drop {
		from { transform: translateY(-8px); opacity: 0; }
	}
</style>
