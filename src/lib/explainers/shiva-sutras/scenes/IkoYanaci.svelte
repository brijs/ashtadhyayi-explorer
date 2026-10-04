<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import { settings } from '#lib/settings.svelte.ts';
	import { devaToIast } from '#lib/translit.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();

	// Pairing by place of articulation (1.1.50 स्थानेऽन्तरतमः); examples from the Kāśikā on 6.1.77.
	const PAIRS = [
		{ ik: 'इ', yan: 'य्', place: 'palate (tālu)', ex: ['दधि + अत्र', 'दध्यत्र'] },
		{ ik: 'उ', yan: 'व्', place: 'lips (oṣṭha)', ex: ['मधु + अत्र', 'मध्वत्र'] },
		{ ik: 'ऋ', yan: 'र्', place: 'roof of the mouth (mūrdhan)', ex: ['कर्तृ + अर्थम्', 'कर्त्रर्थम्'] },
		{ ik: 'ऌ', yan: 'ल्', place: 'teeth (danta)', ex: ['ऌ + आकृतिः', 'लाकृतिः'] }
	];
	const AC = ['अ', 'इ', 'उ', 'ऋ', 'ऌ', 'ए', 'ओ', 'ऐ', 'औ'];
	let sel = $state<number | null>(null);
	let seen = $state(new Set<number>());

	function choose(i: number) {
		sel = i;
		seen = new Set([...seen, i]);
		const p = PAIRS[i];
		react(`${p.ik} → ${p.yan}: both are made at the ${p.place}. ${p.ex[0]} → ${p.ex[1]}.`, 'happy');
		if (seen.size === 4) complete();
	}
</script>

<div class="rows">
	<div class="row">
		<span class="lab"><span class="deva">इकः</span><small>in place of इक्</small></span>
		<div class="cells">
			{#each PAIRS as p, i (p.ik)}
				<button class="cell ik" class:on={sel === i} class:seen={seen.has(i)} onclick={() => choose(i)}>
					<span class="deva">{p.ik}</span>{#if settings.iast}<small>{devaToIast(p.ik)}</small>{/if}
				</button>
			{/each}
		</div>
	</div>
	<div class="arrows" aria-hidden="true">
		{#each PAIRS as _, i (i)}<span class:on={sel === i}>↓</span>{/each}
	</div>
	<div class="row">
		<span class="lab"><span class="deva">यण्</span><small>comes a semivowel</small></span>
		<div class="cells">
			{#each PAIRS as p, i (p.yan)}
				<span class="cell yan" class:on={sel === i}><span class="deva">{p.yan[0]}</span>{#if settings.iast}<small>{devaToIast(p.yan)}</small>{/if}</span>
			{/each}
		</div>
	</div>
	<div class="row">
		<span class="lab"><span class="deva">अचि</span><small>when a vowel (अच्) follows</small></span>
		<div class="cells ac">
			{#each AC as v (v)}<span class="cell acc"><span class="deva">{v}</span></span>{/each}
		</div>
	</div>
</div>

{#if sel !== null}
	<div class="example card">
		<span class="deva">{PAIRS[sel].ex[0]}</span>
		<span class="arrow">→</span>
		<span class="deva out">{PAIRS[sel].ex[1]}</span>
	</div>
{/if}

<p class="muted note">
	Three pratyāhāras, three words, one complete rule: <SutraRef n="6.1.77" s="इको यणचि" />. Which semivowel replaces which vowel is
	settled by nearness of articulation, <SutraRef n="1.1.50" s="स्थानेऽन्तरतमः" />.
</p>

<style>
	.rows {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 14px;
	}
	.lab {
		display: flex;
		flex-direction: column;
		width: 150px;
		flex-shrink: 0;
	}
	.lab .deva {
		font-size: 22px;
		line-height: 1.3;
	}
	.lab small {
		font-size: 12px;
		color: var(--muted);
	}
	.cells {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.cell {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 52px;
		height: 52px;
		border-radius: 12px;
		border: 1.5px solid var(--line);
		background: var(--surface);
		font-size: 24px;
		color: var(--ink);
		transition: all 0.2s;
	}
	.cell small {
		font-family: var(--font-serif);
		font-size: 11px;
		color: var(--muted);
	}
	button.cell {
		cursor: pointer;
		font: inherit;
		font-size: 24px;
		border-color: var(--r-target);
	}
	.cell.ik.seen {
		background: color-mix(in srgb, var(--r-target) 8%, var(--surface));
	}
	.cell.ik.on {
		background: var(--r-target);
		color: #fff;
	}
	.cell.yan {
		border-color: var(--r-subject);
	}
	.cell.yan.on {
		background: var(--r-subject);
		color: #fff;
		transform: scale(1.08);
	}
	.cells.ac .cell {
		width: 38px;
		height: 38px;
		font-size: 18px;
		border-color: color-mix(in srgb, var(--r-right) 50%, transparent);
	}
	.arrows {
		display: flex;
		gap: 8px;
		margin-left: 164px;
	}
	.arrows span {
		width: 52px;
		text-align: center;
		color: var(--line);
		font-size: 20px;
		transition: color 0.2s;
	}
	.arrows span.on {
		color: var(--r-subject);
	}
	.example {
		display: inline-flex;
		align-items: center;
		gap: 14px;
		padding: 12px 20px;
		margin-top: 18px;
		font-size: 24px;
	}
	.out {
		color: var(--r-subject);
		font-weight: 600;
	}
	.arrow {
		color: var(--muted);
	}
	.note {
		margin-top: 18px;
		font-size: 14px;
	}
	@media (max-width: 560px) {
		.row {
			flex-direction: column;
			align-items: flex-start;
			gap: 4px;
		}
		.arrows {
			margin-left: 0;
		}
	}
</style>
