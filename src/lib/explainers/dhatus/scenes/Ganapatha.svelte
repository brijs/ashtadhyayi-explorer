<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';
	import { sutra, type DhatuData } from '../types.ts';

	let { react, complete, data }: SceneProps<DhatuData> = $props();

	type Src = 'dhatu' | 'gana';
	const ITEMS: { n: string; head: string; src: Src; why: string }[] = [
		{ n: '1.1.27', head: 'सर्वादि', src: 'gana', why: 'सर्व and the rest: a list of pronouns in the Gaṇapāṭha. They get the name sarvanāman.' },
		{ n: '3.1.69', head: 'दिवादि', src: 'dhatu', why: 'दिव् and the rest: the fourth class of the Dhātupāṭha. They take श्यन्.' },
		{ n: '5.2.127', head: 'अर्शआदि', src: 'gana', why: 'अर्शस् and the rest take अच् "having …" (अर्शसः). The Kāśikā calls this list open (an ākṛtigaṇa): more words may join it.' },
		{ n: '2.4.72', head: 'अदिप्रभृति', src: 'dhatu', why: 'prabhṛti also means "and the rest": अद् and the rest, the second class, lose शप्.' },
		{ n: '4.1.4', head: 'अजादि', src: 'gana', why: 'अजा and the rest: a Gaṇapāṭha list of feminines in टाप्, alongside stems in अ.' }
	];
	let answers = $state<Record<string, Src>>({});
	function answer(n: string, src: Src) {
		if (answers[n]) return;
		answers = { ...answers, [n]: src };
		const it = ITEMS.find((x) => x.n === n)!;
		react(src === it.src ? `Right. ${it.why}` : `Not quite: ${it.why}`, src === it.src ? 'happy' : 'think');
		if (Object.keys(answers).length === ITEMS.length) complete();
	}
	// first members of sarvādi as the Kāśikā on 1.1.27 lists them
	const SARVA = ['सर्व', 'विश्व', 'उभ', 'उभय', 'डतर', 'डतम', 'इतर', 'अन्य', 'अन्यतर', 'त्व', 'नेम', 'सम'];
</script>

<div class="lay">
	<ul class="items">
		{#each ITEMS as it (it.n)}
			{@const a = answers[it.n]}
			<li class="card" class:right={a && a === it.src} class:wrong={a && a !== it.src}>
				<div class="s"><SutraRef n={it.n} s={sutra(data, it.n).s} /></div>
				<div class="q">
					<span class="muted">"<span class="deva hd">{it.head}</span>" points into the</span>
					<span class="btns">
						<button class="btn" aria-pressed={a === 'dhatu'} disabled={!!a} onclick={() => answer(it.n, 'dhatu')}>Dhātupāṭha</button>
						<button class="btn" aria-pressed={a === 'gana'} disabled={!!a} onclick={() => answer(it.n, 'gana')}>Gaṇapāṭha</button>
					</span>
				</div>
				{#if a}<p class="why">{it.why}</p>{/if}
			</li>
		{/each}
	</ul>

	<aside class="side card">
		<p class="eyebrow">A gaṇa: <span class="deva">सर्वादि</span></p>
		<p class="list deva">{SARVA.join(' · ')} …</p>
		<p class="muted small">
			First members as the Kāśikā on 1.1.27 gives them. One sūtra, <span class="deva">सर्वादीनि सर्वनामानि</span>, names the whole list, so rules about
			pronouns (<span class="deva">सर्वस्मै</span>, unlike <span class="deva">रामाय</span>) reach every member.
		</p>
	</aside>
</div>

<p class="muted note">
	The same device, a list named by its first member plus <span class="deva">आदि</span> or <span class="deva">प्रभृति</span>, serves both companions. Source for
	the Gaṇapāṭha: Abhyankar, <i>Dictionary of Sanskrit Grammar</i>, s.v. gaṇapāṭha: "the mention individually of the several words forming a class or gaṇa, named
	after the first word".
</p>

<style>
	.lay {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 260px;
		gap: 16px;
		align-items: start;
		max-width: 940px;
	}
	.items {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.items li {
		padding: 10px 14px;
	}
	li.right {
		border-color: var(--r-subject);
	}
	li.wrong {
		border-color: var(--r-target);
	}
	.s {
		font-size: 17px;
	}
	.q {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px 10px;
		margin-top: 6px;
		font-size: 14px;
	}
	.hd {
		font-size: 16px;
		color: var(--saffron-ink);
	}
	.btns {
		display: flex;
		gap: 6px;
	}
	.btn {
		font-size: 13px;
		padding: 4px 10px;
	}
	.why {
		margin: 6px 0 0;
		font-size: 13.5px;
		color: var(--ink-2);
	}
	.side {
		padding: 14px 16px;
	}
	.side p {
		margin: 4px 0;
	}
	.list {
		font-size: 18px;
		line-height: 1.7;
	}
	.small {
		font-size: 13px;
	}
	.note {
		margin-top: 14px;
		font-size: 13px;
		max-width: 60em;
	}
	@media (max-width: 760px) {
		.lay {
			grid-template-columns: 1fr;
		}
	}
</style>
