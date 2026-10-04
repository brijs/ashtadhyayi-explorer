<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	let guess = $state<string | null>(null);
	const OPTS = ['अ', 'ए', 'ओ'];
	function pick(o: string) {
		guess = o;
		if (o === 'ए') {
			react('Yes, ए. Hold that thought: next we see why.', 'happy');
			complete();
		} else react(`${o}? It is a guṇa vowel, but is it the closest to इ? Try again.`, 'think');
	}
</script>

<div class="rule card">
	<p class="lab">A rule says:</p>
	<p class="big"><span class="deva">इ</span> → <span class="em">guṇa</span></p>
	<p class="muted">guṇa = <span class="deva">अ, ए, ओ</span> (<SutraRef n="1.1.2" s="अदेङ् गुणः" />). Which one replaces इ?</p>
	<div class="opts">
		{#each OPTS as o (o)}
			<button class="opt deva" class:right={guess === o && o === 'ए'} class:wrong={guess === o && o !== 'ए'} onclick={() => pick(o)}>{o}</button>
		{/each}
	</div>
</div>
<p class="note">
	The answer comes from <SutraRef n="1.1.50" s="स्थानेऽन्तरतमः" />: "in a substitution, the nearest one". Rules such as
	<SutraRef n="7.3.84" /> just say "guṇa"; 1.1.50 picks the member.
</p>

<style>
	.rule {
		padding: 22px;
		max-width: 520px;
	}
	.lab {
		margin: 0;
		font-size: 13px;
		color: var(--muted);
	}
	.big {
		font-size: 38px;
		margin: 4px 0;
	}
	.em {
		font-family: var(--font-serif);
		font-style: italic;
		color: var(--saffron-ink);
	}
	.opts {
		display: flex;
		gap: 12px;
		margin-top: 10px;
	}
	.opt {
		width: 72px;
		height: 72px;
		border-radius: 14px;
		border: 2px solid var(--line);
		background: var(--surface);
		font-size: 34px;
		cursor: pointer;
		color: var(--ink);
	}
	.opt.right {
		border-color: var(--r-subject);
		background: color-mix(in srgb, var(--r-subject) 14%, var(--surface));
	}
	.opt.wrong {
		border-color: var(--r-target);
		animation: shake 0.3s;
	}
	@keyframes shake {
		25% { transform: translateX(-4px); }
		75% { transform: translateX(4px); }
	}
	.note {
		margin-top: 16px;
		font-size: 15px;
		max-width: 46em;
	}
</style>
