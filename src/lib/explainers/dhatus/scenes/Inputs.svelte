<script lang="ts">
	import { resolve } from '$app/paths';
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';
	import { sutra, type DhatuData } from '../types.ts';

	let { react, complete, data }: SceneProps<DhatuData> = $props();

	type Mod = { id: string; name: string; sa: string; supplies: string; size: string; hook: string; hookText?: string; status: string };
	const MODS: Mod[] = $derived([
		{
			id: 'dhatu', name: 'Dhātupāṭha', sa: 'धातुपाठः', supplies: 'verbal roots, in ten classes, each with a meaning gloss',
			size: `${data.total.toLocaleString()} entries in vidyut's edition`, hook: '1.3.1',
			status: 'Traditionally Pāṇini\'s. It reaches us through later commentaries (Kṣīrasvāmin, Sāyaṇa\'s Mādhavīya-dhātuvṛtti) whose lists differ in detail.'
		},
		{
			id: 'gana', name: 'Gaṇapāṭha', sa: 'गणपाठः', supplies: 'lists of nouns and particles, each named after its first word',
			size: 'cited in sūtras as "X and the rest" (X-ādi)', hook: '1.1.27',
			status: 'Traditionally ascribed to Pāṇini; the ascription is questioned by modern scholars (Abhyankar).'
		},
		{
			id: 'unadi', name: 'Uṇādi-sūtras', sa: 'उणादिसूत्राणि', supplies: 'affixes for nouns whose derivation is irregular (कारु, गो …)',
			size: `${data.unadi.count} sūtras in five pādas in vidyut's edition`, hook: '3.3.1',
			status: 'Not by Pāṇini as far as anyone can show: authorship is uncertain, and often attributed to Śākaṭāyana.'
		},
		{
			id: 'shiva', name: 'Śiva-sūtras', sa: 'माहेश्वरसूत्राणि', supplies: 'the inventory of sounds, ordered so pratyāhāras can name classes',
			size: '14 lines', hook: '1.1.71',
			status: 'Recited before the grammar; see the Śiva-sūtras lesson.'
		},
		{
			id: 'linga', name: 'Liṅgānuśāsana', sa: 'लिङ्गानुशासनम्', supplies: 'the grammatical gender of nouns',
			size: `${data.linga} rules in vidyut's edition`, hook: '',
			status: 'Counted among Pāṇini\'s supplementary works by the tradition (Abhyankar, s.v. gaṇapāṭha).'
		}
	]);
	let sel = $state<string | null>(null);
	const seen = new Set<string>();
	const mod = $derived(MODS.find((m) => m.id === sel));

	function pick(id: string) {
		sel = id;
		seen.add(id);
		const m = MODS.find((x) => x.id === id)!;
		react(`${m.name}: ${m.supplies}.`, 'happy');
		if (seen.size === 3) {
			complete();
			react('The rules stay general; the lists say which words they apply to.', 'happy');
		}
	}
	const s131 = $derived(sutra(data, '1.3.1'));
</script>

<div class="hub">
	<div class="core card">
		<span class="eyebrow">the rulebook</span>
		<span class="deva big">अष्टाध्यायी</span>
		<span class="muted">{data.sutraCount.toLocaleString()} sūtras: operations, definitions, meta-rules</span>
	</div>
	<div class="mods" role="group" aria-label="Companion texts">
		{#each MODS as m (m.id)}
			<button class="mod" class:on={sel === m.id} class:seen={seen.has(m.id)} onclick={() => pick(m.id)} aria-pressed={sel === m.id}>
				<span class="deva sa">{m.sa}</span>
				<span class="nm">{m.name}</span>
			</button>
		{/each}
	</div>
</div>

{#if mod}
	<div class="info card">
		<p class="eyebrow">{mod.name} supplies</p>
		<p class="sup">{mod.supplies} <span class="muted">· {mod.size}</span></p>
		{#if mod.hook}
			<p class="hook">The rulebook points in here with <SutraRef n={mod.hook} s={sutra(data, mod.hook).s} /></p>
		{/if}
		<p class="status">{mod.status}</p>
		{#if mod.id === 'shiva'}<p><a href={resolve('/learn') + '/shiva-sutras/'}>Śiva sūtras lesson →</a></p>{/if}
	</div>
{:else}
	<p class="muted hint">For example, <SutraRef n="1.3.1" s={s131.s} /> does not list a single root. It says: "bhū and the rest are called dhātu", and leaves the list to the Dhātupāṭha.</p>
{/if}

<p class="muted note">
	Sources: Abhyankar, <i>A Dictionary of Sanskrit Grammar</i> (1986), s.v. gaṇapāṭha, śākaṭāyana; Scharf, Sanskrit Library notes on the
	Mādhavīya-dhātuvṛtti (2009); Wikipedia, "Unadi-Sutras". Counts are from vidyut's data files.
</p>

<style>
	.hub {
		display: grid;
		grid-template-columns: minmax(200px, 260px) minmax(0, 1fr);
		gap: 14px;
		align-items: stretch;
		max-width: 820px;
	}
	.core {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 4px;
		padding: 18px;
		border: 2px solid var(--saffron);
		font-size: 13.5px;
	}
	.big {
		font-size: 30px;
		font-weight: 600;
		color: var(--saffron-ink);
	}
	.mods {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 8px;
	}
	.mod {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 2px;
		padding: 12px 14px;
		border-radius: var(--radius);
		border: 1.5px dashed var(--line);
		background: var(--surface);
		color: var(--ink);
		cursor: pointer;
		text-align: left;
	}
	.mod::before {
		content: '';
		position: absolute;
		left: -9px;
		top: 50%;
		width: 8px;
		border-top: 1.5px dashed var(--line);
	}
	.mod:hover {
		border-color: var(--saffron);
	}
	.mod.seen {
		border-style: solid;
	}
	.mod.on {
		border-color: var(--saffron);
		background: var(--saffron-soft);
	}
	.sa {
		font-size: 19px;
	}
	.nm {
		font-size: 13px;
		color: var(--muted);
	}
	.info {
		margin-top: 16px;
		padding: 14px 18px;
		max-width: 820px;
	}
	.info p {
		margin: 4px 0;
	}
	.sup {
		font-size: 16px;
	}
	.status {
		font-size: 14.5px;
		color: var(--ink-2);
	}
	.hint {
		margin-top: 16px;
		max-width: 46em;
	}
	.note {
		margin-top: 18px;
		font-size: 12.5px;
		max-width: 60em;
	}
	@media (max-width: 640px) {
		.hub {
			grid-template-columns: 1fr;
		}
		.mod::before {
			display: none;
		}
	}
</style>
