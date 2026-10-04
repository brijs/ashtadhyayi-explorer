<script lang="ts">
	import { resolve } from '$app/paths';
	import SutraRef from '#lib/components/SutraRef.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	type St = { code: string; s: string; en: string; terms: { t: string; ch: boolean }[] };
	let { react, complete, panel, data }: SceneProps<{ bhavati: St[] }> = $props();

	// marker bookkeeping steps (it-saṃjñā and deletion) can be folded away
	const BOOKKEEPING = new Set(['1.3.2', '1.3.3', '1.3.8', '1.3.9', '1.3.78', '1.4.13', '1.4.14', '3.4.113', '8.4.68']);
	let showAll = $state(false);
	const steps = $derived(showAll ? data.bhavati : data.bhavati.filter((s, i) => i === 0 || !BOOKKEEPING.has(s.code)));
	let k = $state(0);
	const cur = $derived(steps[Math.min(k, steps.length - 1)]);

	$effect(() => panel(cur.code));
	function next() {
		if (k < steps.length - 1) k++;
		if (k === steps.length - 1) {
			react(`${data.bhavati.length} rule applications in total, ${steps.length} of them doing the visible work. Input: a root and some features. Output: भवति.`, 'happy');
			complete();
		}
	}
</script>

<div class="io">
	<div class="box in"><span class="eyebrow">input</span><span class="deva">भू</span><small>root · present · 3rd sg.</small></div>
	<div class="arrow" aria-hidden="true">→</div>
	<div class="box rules"><span class="eyebrow">rules fire</span><span class="code">{cur.code}</span><span class="deva">{cur.s}</span></div>
	<div class="arrow" aria-hidden="true">→</div>
	<div class="box out"><span class="eyebrow">state</span>
		<span class="terms deva">{#each cur.terms as t, i (i)}{#if i}<i>+</i>{/if}<b class:ch={t.ch}>{t.t}</b>{/each}</span>
	</div>
</div>
<p class="en">{cur.en}</p>

<div class="ctl">
	<button class="btn" onclick={() => (k = Math.max(0, k - 1))} disabled={k === 0}>◀</button>
	<span class="muted">rule {k + 1} / {steps.length}</span>
	<button class="btn primary" onclick={next} disabled={k === steps.length - 1}>Fire next rule ▶</button>
	<label class="all"><input type="checkbox" bind:checked={showAll} onchange={() => (k = 0)} /> show marker bookkeeping steps too</label>
</div>

<p class="muted note">
	This derivation is computed by vidyut, an implementation of the Aṣṭādhyāyī. Explore any verb or noun in the
	<a href={resolve('/tools/prakriya') + '/'}>derivation debugger</a>. Key rules here: <SutraRef n="3.1.68" s="कर्तरि शप्" />,
	<SutraRef n="7.3.84" />, <SutraRef n="6.1.78" />.
</p>

<style>
	.io {
		display: grid;
		grid-template-columns: 1fr auto 1.3fr auto 1.4fr;
		align-items: stretch;
		gap: 10px;
	}
	.box {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 14px;
		border-radius: 14px;
		border: 1.5px solid var(--line);
		background: var(--surface);
		min-width: 0;
	}
	.box .deva {
		font-size: 22px;
	}
	.box small {
		font-size: 12px;
		color: var(--muted);
	}
	.rules {
		background: #1d2140;
		border-color: #1d2140;
		color: #e6e8ff;
	}
	.rules .eyebrow {
		color: #8b90b8;
	}
	.code {
		font-family: var(--font-mono);
		color: #5fe0c0;
		font-size: 18px;
	}
	.terms {
		font-size: 26px !important;
	}
	.terms i {
		font-style: normal;
		color: var(--muted);
		margin: 0 4px;
		font-size: 18px;
	}
	.terms b {
		font-weight: 500;
	}
	.terms b.ch {
		color: var(--saffron-ink);
		font-weight: 700;
	}
	.arrow {
		align-self: center;
		color: var(--muted);
		font-size: 22px;
	}
	.en {
		font-family: var(--font-serif);
		color: var(--ink-2);
		min-height: 3em;
		margin: 14px 0 6px;
	}
	.ctl {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}
	.all {
		font-size: 13px;
		color: var(--ink-2);
	}
	.note {
		margin-top: 18px;
		font-size: 14px;
	}
	@media (max-width: 700px) {
		.io {
			grid-template-columns: minmax(0, 1fr);
		}
		.arrow {
			transform: rotate(90deg);
			justify-self: center;
		}
	}
</style>
