<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	const PARTS = [
		{ key: 'dev', en: 'Devadatta', role: 'karta' },
		{ key: 'axe', en: 'the axe', role: 'karana' },
		{ key: 'tree', en: 'the tree', role: 'karma' }
	];
	const ROLES = [
		{ key: 'karta', sa: 'कर्ता', en: 'agent', def: '1.4.54' },
		{ key: 'karana', sa: 'करणम्', en: 'instrument', def: '1.4.42' },
		{ key: 'karma', sa: 'कर्म', en: 'object', def: '1.4.49' }
	];
	// forms verified with vidyut: देवदत्तः/देवदत्तेन, कुठारेण, वृक्षम्/वृक्षः, छिनत्ति/छिद्यते
	const FORMS: Record<string, Record<string, string>> = {
		active: { dev: 'देवदत्तः', axe: 'कुठारेण', tree: 'वृक्षम्', verb: 'छिनत्ति' },
		passive: { dev: 'देवदत्तेन', axe: 'कुठारेण', tree: 'वृक्षः', verb: 'छिद्यते' }
	};
	let assigned = $state<Record<string, string>>({});
	let part = $state<string | null>(null);
	let voice = $state<'active' | 'passive'>('active');
	let flips = 0;
	const allRight = $derived(PARTS.every((p) => assigned[p.key] === p.role));

	function assign(role: string) {
		if (!part) return react('Tap a participant first.', 'think');
		const p = PARTS.find((x) => x.key === part)!;
		if (p.role !== role) return react(`Is ${p.en} really the ${ROLES.find((r) => r.key === role)!.en}? Think about who does what.`, 'think');
		assigned = { ...assigned, [part]: role };
		part = null;
		if (PARTS.every((x) => assigned[x.key] === x.role)) react('Roles assigned. Now switch the voice and watch the endings move while the roles stay put.', 'happy');
	}
	function flip() {
		voice = voice === 'active' ? 'passive' : 'active';
		flips++;
		react(
			voice === 'passive'
				? 'Passive: the verb ending now expresses the object (3.4.69), so the object takes the 1st case and the agent the 3rd (2.3.18). By 2.3.1, a case marks a role only when the verb has not already expressed it.'
				: 'Active: the verb ending expresses the agent, so the agent is in the 1st case and the object in the 2nd (2.3.2).',
			'happy'
		);
		if (flips >= 2 && allRight) complete();
	}
</script>

<p class="en">"Devadatta cuts the tree with the axe."</p>
<div class="parts">
	{#each PARTS as p (p.key)}
		<button class="p" class:sel={part === p.key} class:ok={assigned[p.key]} onclick={() => (part = p.key)}>
			{p.en}
			{#if assigned[p.key]}<small class="deva">{ROLES.find((r) => r.key === assigned[p.key])!.sa}</small>{/if}
		</button>
	{/each}
</div>
<div class="roles">
	{#each ROLES as r (r.key)}
		<button class="r" onclick={() => assign(r.key)}><span class="deva">{r.sa}</span> {r.en} <small>(<SutraRef n={r.def} />)</small></button>
	{/each}
</div>

{#if allRight}
	<div class="sent card">
		<div class="words deva">
			<span>{FORMS[voice].dev}</span> <span>{FORMS[voice].axe}</span> <span>{FORMS[voice].tree}</span> <span class="verb">{FORMS[voice].verb}</span>
		</div>
		<button class="btn" onclick={flip}>Switch to {voice === 'active' ? 'passive' : 'active'}</button>
	</div>
{/if}
<p class="muted note">
	These kāraka roles (<SutraRef n="1.4.23" s="कारके" /> onwards) anticipate what modern linguistics calls semantic or thematic
	roles, for example in Fillmore's "The Case for Case" (1968). See Kiparsky & Staal, "Syntactic and semantic relations in
	Pāṇini", <i>Foundations of Language</i> 5 (1969).
</p>

<style>
	.en {
		font-family: var(--font-serif);
		font-size: 19px;
	}
	.parts,
	.roles {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 12px;
	}
	.p,
	.r {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 8px 16px;
		border-radius: 12px;
		border: 2px solid var(--line);
		background: var(--surface);
		cursor: pointer;
		color: var(--ink);
	}
	.p.sel {
		border-color: var(--indigo);
		background: var(--indigo-soft);
	}
	.p.ok {
		border-color: var(--r-subject);
	}
	.p small {
		color: var(--r-subject);
		font-size: 15px;
	}
	.r {
		flex-direction: row;
		gap: 6px;
		align-items: baseline;
		border-style: dashed;
	}
	.r .deva {
		font-size: 18px;
	}
	.sent {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 16px;
		margin-top: 6px;
	}
	.words {
		font-size: 30px;
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
	}
	.verb {
		color: var(--saffron-ink);
	}
	.sent .btn {
		align-self: flex-start;
	}
	.note {
		margin-top: 14px;
		font-size: 14px;
		max-width: 50em;
	}
</style>
