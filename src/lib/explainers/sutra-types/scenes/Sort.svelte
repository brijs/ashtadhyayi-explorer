<script lang="ts">
	import { KINDS } from '../kinds.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	const CARDS = [
		{ n: '1.1.2', s: 'अदेङ् गुणः', k: 'S', hint: 'It gives अ, ए, ओ a name.' },
		{ n: '1.1.67', s: 'तस्मादित्युत्तरस्य', k: 'P', hint: 'It explains how to read the 5th case in other rules.' },
		{ n: '6.1.101', s: 'अकः सवर्णे दीर्घः', k: 'V', hint: 'It changes sounds: two vowels become one long vowel.' },
		{ n: '1.4.8', s: 'पतिः समास एव', k: 'N', hint: '"Only" (एव): it limits where another rule applies.' },
		{ n: '1.2.4', s: 'सार्वधातुकमपित्', k: 'AT', hint: 'It says a sārvadhātuka affix without a p-tag behaves as if it had a ṅ tag.' },
		{ n: '6.4.1', s: 'अङ्गस्य', k: 'AD', hint: 'One word that governs 613 following sūtras.' }
	];
	let picked = $state<number | null>(null);
	let placed = $state<Record<string, string>>({});

	function bin(key: string) {
		if (picked === null) return react('Tap a sūtra card first.', 'think');
		const c = CARDS[picked];
		if (c.k !== key) return react(`Not quite. ${c.hint}`, 'think');
		placed = { ...placed, [c.n]: key };
		picked = null;
		const n = Object.keys(placed).length;
		react(n === CARDS.length ? 'All six sorted!' : 'Right!', 'happy');
		if (n === CARDS.length) complete();
	}
</script>

<div class="cards">
	{#each CARDS as c, i (c.n)}
		{#if !placed[c.n]}
			<button class="c" class:sel={picked === i} onclick={() => (picked = i)}>
				<span class="n">{c.n}</span><span class="deva">{c.s}</span>
			</button>
		{/if}
	{/each}
</div>
<div class="bins">
	{#each KINDS as k (k.key)}
		<button class="bin" onclick={() => bin(k.key)}>
			<span class="deva">{k.sa}</span><small>{k.en}</small>
			{#each CARDS.filter((c) => placed[c.n] === k.key) as c (c.n)}<span class="in deva">{c.s}</span>{/each}
		</button>
	{/each}
</div>

<style>
	.cards {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		min-height: 60px;
		margin-bottom: 18px;
	}
	.c {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding: 8px 14px;
		border-radius: 12px;
		border: 2px solid var(--line);
		background: var(--surface);
		cursor: pointer;
		color: var(--ink);
		font-size: 18px;
	}
	.c.sel {
		border-color: var(--indigo);
		background: var(--indigo-soft);
		transform: translateY(-3px);
	}
	.n {
		font-family: var(--font-mono);
		font-size: 11.5px;
		color: var(--saffron-ink);
	}
	.bins {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 10px;
	}
	.bin {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 4px;
		min-height: 96px;
		padding: 10px 14px;
		border-radius: 14px;
		border: 2px dashed var(--line);
		background: var(--surface-2);
		cursor: pointer;
		color: var(--ink);
		text-align: left;
	}
	.bin:hover {
		border-color: var(--saffron);
	}
	.bin .deva {
		font-size: 19px;
	}
	.bin small {
		color: var(--muted);
		font-size: 12px;
	}
	.in {
		font-size: 15px !important;
		padding: 0 8px;
		border-radius: 6px;
		background: color-mix(in srgb, var(--r-subject) 14%, var(--surface));
		color: var(--r-subject);
	}
	@media (max-width: 600px) {
		.bins {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
