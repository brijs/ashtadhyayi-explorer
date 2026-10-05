<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';
	import type { DhatuData } from '../types.ts';

	let { react, complete, data }: SceneProps<DhatuData> = $props();

	type Claim = { claim: string; holds: boolean; why: string; refs: string[]; src: string };
	const CLAIMS: Claim[] = $derived([
		{
			claim: 'Pāṇini defines a dhātu by pointing to a list (1.3.1 "bhū and the rest"); the Aṣṭādhyāyī itself lists no roots.',
			holds: true,
			why: 'Right, with one addition: by 3.1.32 forms ending in san, ṇic etc. are dhātus too, so the class is open, not just the list.',
			refs: ['1.3.1', '3.1.32'],
			src: 'the sūtra texts'
		},
		{
			claim: 'Pāṇini compiled the Dhātupāṭha, a list of about 1,930 roots.',
			holds: false,
			why: `The ascription is traditional, and the list reaches us through later commentaries whose lists differ. Counts depend on the edition: about 1,943 is often quoted; vidyut's edition has ${data.total.toLocaleString()} entries (${data.distinctUpadesha.toLocaleString()} distinct teaching forms); Sāyaṇa's Mādhavīya-dhātuvṛtti indexes 2,669 roots and variants.`,
			refs: [],
			src: 'Scharf, Sanskrit Library (2009); A. K. Aggarwal, Dhatupatha of Panini (1943 roots); vidyut data'
		},
		{
			claim: 'The Gaṇapāṭha is a set of word lists, cited in sūtras as "the group beginning with sarva" and so on.',
			holds: true,
			why: 'Yes, as in 1.1.27 सर्वादीनि सर्वनामानि. It is traditionally ascribed to Pāṇini; modern scholars question that.',
			refs: ['1.1.27'],
			src: 'Abhyankar, s.v. gaṇapāṭha'
		},
		{
			claim: 'Derived nouns such as पाचक come from a root plus an agent suffix (pac + ṇvul).',
			holds: true,
			why: 'Yes: ण्वुल् by 3.1.133, and vidyut derives पाचक step by step. 1.2.46 makes it a noun stem.',
			refs: ['3.1.133', '1.2.46'],
			src: 'vidyut derivation'
		},
		{
			claim: 'Words such as अश्व and गो are simply underived.',
			holds: false,
			why: 'The tradition has it both ways. The Uṇādi-sūtras do derive गो (गमेर्डोः, Uṇ. 2.68; vidyut builds it), while a maxim allows uṇādi words to be treated as underived stems.',
			refs: ['3.3.1', '1.2.45'],
			src: 'Uṇādi-sūtras; Abhyankar, s.v. avyutpanna'
		},
		{
			claim: 'Śākaṭāyana held that every noun comes from a verb, and Pāṇini disagreed.',
			holds: false,
			why: 'The first half is right: Yāska (Nirukta 1.12) reports it, with Gārgya as the opponent. Pāṇini states no position. He names both men and admits uṇādi words "variously" (3.3.1); later writers read his stance from that.',
			refs: ['3.3.1'],
			src: 'Nirukta 1.12; Visigalli 2023'
		},
		{
			claim: 'Pāṇini also wrote the Uṇādi-sūtras, a secondary set of chaotic rules.',
			holds: false,
			why: 'Their authorship is uncertain and often credited to Śākaṭāyana, not Pāṇini. They are not chaotic: they are rules in the same style (गमेर्डोः "after gam, ḍo"). What is loose is their reach: per the Kāśikā on 3.3.1 they also apply beyond the roots they name.',
			refs: ['3.3.1'],
			src: 'Abhyankar, s.v. śākaṭāyana; Wikipedia, "Unadi-Sutras"; Kāśikā'
		}
	]);
	let verdict = $state<Record<number, boolean>>({});
	function judge(i: number, v: boolean) {
		if (i in verdict) return;
		verdict = { ...verdict, [i]: v };
		const ok = v === CLAIMS[i].holds;
		react(ok ? 'Agreed.' : 'The sources say otherwise; see the note.', ok ? 'happy' : 'think');
		if (Object.keys(verdict).length === CLAIMS.length) {
			complete();
			react('Short version: the lists and kṛt derivations are solid; authorship and the "all nouns from verbs" story need care.', 'happy');
		}
	}
</script>

<ol class="claims">
	{#each CLAIMS as c, i (i)}
		{@const v = verdict[i]}
		<li class="card" class:done={v !== undefined}>
			<p class="c">{c.claim}</p>
			<div class="btns">
				<button class="btn" aria-pressed={v === true} disabled={v !== undefined} onclick={() => judge(i, true)}>holds up</button>
				<button class="btn" aria-pressed={v === false} disabled={v !== undefined} onclick={() => judge(i, false)}>needs correcting</button>
				{#if v !== undefined}<span class="res" class:ok={v === c.holds}>{c.holds ? 'holds up' : 'needs correcting'}</span>{/if}
			</div>
			{#if v !== undefined}
				<p class="why">
					{c.why}
					{#each c.refs as n, k (n)}{k ? ', ' : ' '}<SutraRef {n} />{/each}
					<span class="src">Source: {c.src}.</span>
				</p>
			{/if}
		</li>
	{/each}
</ol>

<style>
	.claims {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
		max-width: 820px;
	}
	li {
		padding: 10px 14px;
	}
	.c {
		margin: 0;
		font-family: var(--font-serif);
		font-size: 16px;
	}
	.btns {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		margin-top: 6px;
	}
	.btn {
		font-size: 13px;
		padding: 4px 10px;
	}
	.res {
		font-size: 12.5px;
		font-weight: 600;
		color: var(--r-target);
	}
	.res.ok {
		color: var(--r-subject);
	}
	.why {
		margin: 6px 0 0;
		font-size: 14px;
		color: var(--ink-2);
	}
	.src {
		display: block;
		margin-top: 2px;
		font-size: 12px;
		color: var(--muted);
	}
</style>
