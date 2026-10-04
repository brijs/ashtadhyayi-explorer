<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';
	import { sutraHref } from '#lib/links.ts';
	import { slp1ToDeva, slp1ToIast } from '#lib/slp1.ts';
	import { settings } from '#lib/settings.svelte.ts';
	import type { Prakriya } from '#lib/vidyut.ts';
	import type { CoreSutra } from '#lib/types.ts';

	let {
		prakriya,
		sutras,
		ruleTexts
	}: {
		prakriya: Prakriya;
		sutras: Map<string, CoreSutra>;
		ruleTexts: Record<string, Record<string, string>>;
	} = $props();

	let k = $state(0);
	let playing = $state(false);
	let list: HTMLOListElement | undefined = $state();
	let timer: ReturnType<typeof setInterval> | undefined;

	const steps = $derived(prakriya.history);
	const last = $derived(steps.length - 1);
	const cur = $derived(steps[Math.min(k, last)]);

	// reset when a new derivation arrives
	$effect(() => {
		prakriya;
		k = 0;
		stop();
	});

	const SOURCE_LABEL: Record<string, string> = {
		varttika: 'vārttika',
		kashika: 'Kāśikā',
		kaumudi: 'Siddhānta Kaumudī',
		dhatupatha: 'Dhātupāṭha',
		linganushasanam: 'Liṅgānuśāsana',
		unadi: 'Uṇādi sūtra',
		phit: 'Phiṭ sūtra',
		anyatra: 'other'
	};

	function ruleInfo(step: Prakriya['history'][number]) {
		const { source, code } = step.rule;
		if (source === 'ashtadhyayi') {
			const s = sutras.get(code);
			return { label: code, text: s?.s ?? '', en: s?.en ?? '', href: s ? sutraHref(code) : null, kind: 'sūtra' };
		}
		const text = ruleTexts[source]?.[code] ?? '';
		const base = source === 'varttika' ? code.split('.').slice(0, 3).join('.') : null;
		return {
			label: source === 'varttika' ? `on ${base}` : code,
			text,
			en: '',
			href: base && sutras.get(base) ? sutraHref(base) : null,
			kind: SOURCE_LABEL[source] ?? source
		};
	}

	function go(i: number) {
		k = Math.max(0, Math.min(last, i));
		queueMicrotask(() => list?.querySelector('[aria-current="step"]')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
	}
	function play() {
		if (playing) return stop();
		if (k >= last) k = 0;
		playing = true;
		timer = setInterval(() => {
			if (k >= last) return stop();
			go(k + 1);
		}, 900);
	}
	function stop() {
		playing = false;
		clearInterval(timer);
	}
	onDestroy(stop);

	function onKey(e: KeyboardEvent) {
		const t = e.target as HTMLElement;
		if (t.closest('input, textarea, select, dialog, [role="listbox"]') || e.metaKey || e.ctrlKey) return;
		if (e.key === 'ArrowRight') go(k + 1);
		else if (e.key === 'ArrowLeft') go(k - 1);
		else if (e.key === 'Home') go(0);
		else if (e.key === 'End') go(last);
		else return;
		e.preventDefault();
	}
	const info = $derived(cur ? ruleInfo(cur) : null);
</script>

<svelte:window onkeydown={onKey} />

{#if cur && info}
	<section class="watch card" aria-live="polite" aria-label="Current step">
		<div class="state">
			{#key k}
				<div class="terms" in:fly={{ y: 8, duration: 200 }}>
					{#each cur.result as t, i (i)}
						{#if i > 0}<span class="plus">+</span>{/if}
						<span class="term deva" class:changed={t.wasChanged}>
							{slp1ToDeva(t.text) || '∅'}
							{#if settings.iast}<small>{slp1ToIast(t.text)}</small>{/if}
						</span>
					{/each}
				</div>
			{/key}
		</div>
		<div class="rule">
			<span class="stepno">Step {k + 1} of {steps.length}</span>
			<span class="kind">{info.kind}</span>
			{#if info.href}
				<a class="code" href={info.href}>{info.label}</a>
			{:else}
				<span class="code">{info.label}</span>
			{/if}
			<span class="rtext deva">{info.text}</span>
			{#if info.en}<p class="en">{info.en}</p>{/if}
		</div>
	</section>

	<div class="transport" role="group" aria-label="Step controls">
		<button onclick={() => go(0)} aria-label="First step" disabled={k === 0}>⏮</button>
		<button onclick={() => go(k - 1)} aria-label="Previous step" disabled={k === 0}>◀</button>
		<button class="play" onclick={play} aria-label={playing ? 'Pause' : 'Play'}>{playing ? '❚❚' : '▶'}</button>
		<button onclick={() => go(k + 1)} aria-label="Next step" disabled={k === last}>▶|</button>
		<button onclick={() => go(last)} aria-label="Last step" disabled={k === last}>⏭</button>
		<input type="range" min="0" max={last} value={k} oninput={(e) => go(+(e.currentTarget as HTMLInputElement).value)} aria-label="Step" />
		<span class="kbd muted">← → keys</span>
	</div>

	<ol class="steps" bind:this={list}>
		{#each steps as st, i (i)}
			{@const ri = ruleInfo(st)}
			<li aria-current={i === k ? 'step' : undefined} class:past={i < k}>
				<button onclick={() => go(i)}>
					<span class="i">{i + 1}</span>
					<span class="c">{ri.kind === 'sūtra' ? ri.label : `${ri.kind} ${ri.label}`}</span>
					<span class="t deva">{ri.text}</span>
					<span class="r deva">
						{#each st.result as t, j (j)}{#if j > 0}<span class="p">+</span>{/if}<span class:ch={t.wasChanged}>{slp1ToDeva(t.text)}</span>{/each}
					</span>
				</button>
			</li>
		{/each}
	</ol>
{/if}

<style>
	.watch {
		padding: 20px 22px;
		display: grid;
		gap: 14px;
	}
	.state {
		min-height: 74px;
		display: flex;
		align-items: center;
	}
	.terms {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px;
	}
	.term {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		padding: 4px 14px;
		border-radius: 10px;
		border: 1.5px solid var(--line);
		background: var(--surface-2);
		font-size: 30px;
		line-height: 1.35;
	}
	.term small {
		font-family: var(--font-serif);
		font-style: italic;
		font-size: 13px;
		color: var(--ink-2);
	}
	.term.changed {
		border-color: var(--saffron);
		background: var(--saffron-soft);
		color: var(--saffron-ink);
	}
	.plus {
		color: var(--muted);
		font-size: 20px;
	}
	.rule {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 4px 10px;
		padding-top: 12px;
		border-top: 1px dashed var(--line);
	}
	.stepno {
		width: 100%;
		font-size: 12px;
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-weight: 600;
	}
	.kind {
		font-size: 12px;
		color: var(--muted);
	}
	.code {
		font-family: var(--font-mono);
		font-size: 15px;
		font-weight: 600;
	}
	.rtext {
		font-size: 21px;
	}
	.en {
		width: 100%;
		margin: 2px 0 0;
		font-family: var(--font-serif);
		font-size: 15.5px;
		color: var(--ink-2);
	}
	.transport {
		display: flex;
		align-items: center;
		gap: 6px;
		margin: 14px 0;
		flex-wrap: wrap;
	}
	.transport button {
		width: 38px;
		height: 36px;
		border-radius: 8px;
		border: 1px solid var(--line);
		background: var(--surface);
		cursor: pointer;
		color: var(--ink);
		font-size: 13px;
	}
	.transport button:disabled {
		opacity: 0.35;
		cursor: default;
	}
	.transport .play {
		width: 48px;
		background: var(--saffron);
		border-color: var(--saffron);
		color: #fff;
	}
	.transport input {
		flex: 1;
		min-width: 120px;
		accent-color: var(--saffron);
	}
	.kbd {
		font-size: 12px;
	}
	.steps {
		list-style: none;
		margin: 0;
		padding: 0;
		max-height: 460px;
		overflow-y: auto;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--surface);
	}
	.steps li + li {
		border-top: 1px solid var(--line);
	}
	.steps button {
		display: grid;
		grid-template-columns: 30px 70px minmax(0, 1fr) auto;
		gap: 10px;
		align-items: baseline;
		width: 100%;
		padding: 7px 12px;
		border: none;
		background: none;
		cursor: pointer;
		text-align: left;
		color: var(--ink-2);
	}
	.steps li.past button {
		color: var(--ink);
	}
	.steps li[aria-current='step'] button {
		background: var(--saffron-soft);
		color: var(--ink);
	}
	.i {
		font-family: var(--font-mono);
		font-size: 11.5px;
		color: var(--muted);
	}
	.c {
		font-family: var(--font-mono);
		font-size: 12.5px;
		color: var(--saffron-ink);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.t {
		font-size: 15px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.r {
		font-size: 15px;
		white-space: nowrap;
	}
	.r .p {
		color: var(--muted);
		margin: 0 3px;
	}
	.r .ch {
		color: var(--saffron-ink);
		font-weight: 600;
	}
	@media (max-width: 600px) {
		.steps button {
			grid-template-columns: 24px 58px minmax(0, 1fr);
		}
		.r {
			grid-column: 2 / -1;
		}
		.term {
			font-size: 24px;
		}
		.kbd {
			display: none;
		}
	}
</style>
