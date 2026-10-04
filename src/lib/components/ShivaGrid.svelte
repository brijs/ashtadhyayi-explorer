<script lang="ts" module>
	export const SOUND_CLASS: Record<string, { key: string; label: string }> = {};
	const groups: [string, string, string[]][] = [
		['vowel', 'Vowels', ['अ', 'इ', 'उ', 'ऋ', 'ऌ', 'ए', 'ओ', 'ऐ', 'औ']],
		['semi', 'Semivowels', ['य्', 'व्', 'र्', 'ल्']],
		['nasal', 'Nasals', ['ञ्', 'म्', 'ङ्', 'ण्', 'न्']],
		['voiced', 'Voiced stops', ['झ्', 'भ्', 'घ्', 'ढ्', 'ध्', 'ज्', 'ब्', 'ग्', 'ड्', 'द्']],
		['voiceless', 'Voiceless stops', ['ख्', 'फ्', 'छ्', 'ठ्', 'थ्', 'च्', 'ट्', 'त्', 'क्', 'प्']],
		['fric', 'Sibilants & h', ['श्', 'ष्', 'स्', 'ह्']]
	];
	for (const [key, label, vs] of groups) for (const v of vs) SOUND_CLASS[v] = { key, label };
	export const SOUND_GROUPS = groups.map(([key, label]) => ({ key, label }));
</script>

<script lang="ts">
	import { SHIVA_SUTRAS, SHIVA_FLAT } from '#lib/varna.ts';
	import { devaToIast } from '#lib/translit.ts';
	import { settings } from '#lib/settings.svelte.ts';

	let {
		lit = new Set<number>(),
		removed = new Set<number>(),
		marked = new Set<number>(),
		pickable = () => false,
		onpick,
		colorBy = false,
		visibleLines = 14,
		onlineclick
	}: {
		lit?: Set<number>;
		removed?: Set<number>;
		marked?: Set<number>;
		pickable?: (slotIdx: number) => boolean;
		onpick?: (slotIdx: number) => void;
		colorBy?: boolean;
		visibleLines?: number;
		onlineclick?: (line: number) => void;
	} = $props();

	// slot index offsets per line
	const offsets = SHIVA_SUTRAS.map((_, li) => SHIVA_FLAT.findIndex((s) => s.line === li));
	const show = (v: string, isIt: boolean) => (isIt || v.length === 1 ? v : v[0]);
</script>

<div class="grid" class:color={colorBy}>
	{#each SHIVA_SUTRAS as line, li (li)}
		<div class="line" class:hidden={li >= visibleLines} style="--d: {li * 60}ms">
			{#if onlineclick}
				<button class="num" onclick={() => onlineclick(li)} aria-label="Śiva sūtra {li + 1}">{li + 1}</button>
			{:else}
				<span class="num">{li + 1}</span>
			{/if}
			<div class="slots">
				{#each line as v, pos (pos)}
					{@const idx = offsets[li] + pos}
					{@const isIt = pos === line.length - 1}
					{@const cls = SOUND_CLASS[v]?.key ?? ''}
					{#if !removed.has(idx)}
						{#if pickable(idx)}
							<button
								class="slot {cls}"
								class:it={isIt}
								class:lit={lit.has(idx)}
								class:marked={marked.has(idx)}
								onclick={() => onpick?.(idx)}
								aria-label="{isIt ? 'marker ' : ''}{devaToIast(show(v, isIt))}">
								<span class="deva">{show(v, isIt)}</span>
								{#if settings.iast}<small>{devaToIast(show(v, isIt))}</small>{/if}
							</button>
						{:else}
							<span class="slot {cls}" class:it={isIt} class:lit={lit.has(idx)} class:marked={marked.has(idx)}>
								<span class="deva">{show(v, isIt)}</span>
								{#if settings.iast}<small>{devaToIast(show(v, isIt))}</small>{/if}
							</span>
						{/if}
					{/if}
				{/each}
			</div>
		</div>
	{/each}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 6px 18px;
		--vowel: #c9670a;
		--semi: #0f7f62;
		--nasal: #8636be;
		--voiced: #2a64c8;
		--voiceless: #c02d48;
		--fric: #59606d;
	}
	.line {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
		transition: opacity 0.4s var(--d), transform 0.4s var(--d);
	}
	.line.hidden {
		opacity: 0;
		transform: translateX(-10px);
		pointer-events: none;
	}
	.num {
		width: 24px;
		flex-shrink: 0;
		text-align: right;
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--muted);
		background: none;
		border: none;
		padding: 0;
	}
	button.num {
		cursor: pointer;
		text-decoration: underline dotted;
	}
	.slots {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		min-width: 0;
	}
	.slot {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-width: 36px;
		height: 40px;
		padding: 0 4px;
		border-radius: 8px;
		border: 1.5px solid var(--line);
		background: var(--surface);
		color: var(--ink);
		font-size: 20px;
		line-height: 1.1;
		transition: background 0.2s, border-color 0.2s, transform 0.2s, opacity 0.2s;
	}
	.slot small {
		font-family: var(--font-serif);
		font-style: italic;
		font-size: 11px;
		color: var(--muted);
	}
	button.slot {
		cursor: pointer;
		font: inherit;
		font-size: 20px;
	}
	button.slot:hover {
		border-color: var(--indigo);
		transform: translateY(-1px);
	}
	.slot.it {
		min-width: 30px;
		border-style: dashed;
		background: transparent;
		color: var(--muted);
		font-size: 17px;
	}
	.color .slot:not(.it) {
		border-color: color-mix(in srgb, var(--c) 60%, transparent);
		background: color-mix(in srgb, var(--c) 12%, var(--surface));
	}
	.slot.vowel { --c: var(--vowel); }
	.slot.semi { --c: var(--semi); }
	.slot.nasal { --c: var(--nasal); }
	.slot.voiced { --c: var(--voiced); }
	.slot.voiceless { --c: var(--voiceless); }
	.slot.fric { --c: var(--fric); }
	.slot.lit {
		background: var(--saffron);
		border-color: var(--saffron);
		color: #fff;
		transform: translateY(-2px);
	}
	.slot.lit small {
		color: #fff;
	}
	.slot.marked {
		border-color: var(--indigo);
		border-style: solid;
		background: var(--indigo-soft);
		color: var(--indigo);
		box-shadow: 0 0 0 2px var(--indigo-soft);
	}
	@media (max-width: 1100px) {
		.grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	@media (max-width: 420px) {
		.slot {
			min-width: 29px;
			height: 36px;
			font-size: 17px;
			padding: 0 2px;
		}
		button.slot {
			font-size: 17px;
		}
		.slot.it {
			min-width: 24px;
			font-size: 15px;
		}
		.num {
			width: 18px;
		}
	}
</style>
