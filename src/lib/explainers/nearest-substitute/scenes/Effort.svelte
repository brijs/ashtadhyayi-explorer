<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	// Features in the śikṣā sense: voiced (ghoṣa), aspirated (mahāprāṇa), nasal.
	const H = { voiced: true, asp: true, nasal: false };
	const CANDS = [
		{ s: 'क', voiced: false, asp: false, nasal: false },
		{ s: 'ख', voiced: false, asp: true, nasal: false },
		{ s: 'ग', voiced: true, asp: false, nasal: false },
		{ s: 'घ', voiced: true, asp: true, nasal: false },
		{ s: 'ङ', voiced: true, asp: false, nasal: true }
	];
	const match = (c: (typeof CANDS)[number]) => +(c.voiced === H.voiced) + +(c.asp === H.asp) + +(c.nasal === H.nasal);
	let step = $state(0);
	let picked = $state<string | null>(null);

	function pick(c: (typeof CANDS)[number]) {
		picked = c.s;
		if (c.s === 'घ') {
			step = 2;
			react('घ matches ह on every feature: voiced, breathy, not nasal. वाग्घरिः. (The rule is optional, so वाग्हरिः is also correct.)', 'happy');
			complete();
		} else react(`${c.s} matches ह on ${match(c)} of 3 features. Is there a closer one?`, 'think');
	}
</script>

<div class="steps">
	<div class="st card" class:on={step >= 0}>
		<span class="eyebrow">start</span>
		<span class="deva big">वाक् + हरिः</span>
	</div>
	<div class="st card" class:on={step >= 1}>
		<span class="eyebrow"><SutraRef n="8.2.39" s="झलां जशोऽन्ते" /></span>
		<span class="deva big">वाग् + हरिः</span>
		{#if step === 0}<button class="btn" onclick={() => (step = 1)}>Apply</button>{/if}
	</div>
	<div class="st card" class:on={step >= 1}>
		<span class="eyebrow"><SutraRef n="8.4.62" s="झयो होऽन्यतरस्याम्" /></span>
		<span class="small">after a stop, ह may become a sound like the preceding one: which member of the ग family?</span>
		{#if step >= 1}
			<div class="cands">
				{#each CANDS as c (c.s)}
					<button class="cand deva" class:best={picked === c.s && c.s === 'घ'} class:no={picked === c.s && c.s !== 'घ'} onclick={() => pick(c)}>
						{c.s}<small>{c.voiced ? 'voiced' : 'voiceless'} · {c.asp ? 'breathy' : 'plain'}{c.nasal ? ' · nasal' : ''}</small>
					</button>
				{/each}
			</div>
		{/if}
	</div>
	{#if step === 2}<div class="st card on"><span class="eyebrow">result</span><span class="deva big ok">वाग्घरिः</span></div>{/if}
</div>
<p class="muted note">ह is voiced and breathy (ghoṣa, mahāprāṇa). 1.1.50 picks the candidate nearest in this "effort" (prayatna) as well as in place.</p>

<style>
	.steps {
		display: flex;
		flex-direction: column;
		gap: 10px;
		max-width: 640px;
	}
	.st {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 14px 16px;
		opacity: 0.45;
	}
	.st.on {
		opacity: 1;
	}
	.big {
		font-size: 28px;
	}
	.ok {
		color: var(--r-subject);
		font-weight: 700;
	}
	.small {
		font-size: 14px;
		color: var(--ink-2);
	}
	.st .btn {
		align-self: flex-start;
	}
	.cands {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.cand {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 104px;
		padding: 6px;
		border-radius: 12px;
		border: 2px solid var(--line);
		background: var(--surface);
		font-size: 28px;
		cursor: pointer;
		color: var(--ink);
	}
	.cand small {
		font-family: var(--font-ui);
		font-size: 10.5px;
		color: var(--muted);
	}
	.cand.best {
		border-color: var(--r-subject);
		background: color-mix(in srgb, var(--r-subject) 12%, var(--surface));
	}
	.cand.no {
		border-color: var(--r-target);
	}
	.note {
		margin-top: 14px;
		font-size: 14px;
		max-width: 46em;
	}
</style>
