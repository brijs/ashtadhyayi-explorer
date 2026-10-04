<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { asset, resolve } from '$app/paths';
	import { replaceState } from '$app/navigation';
	import { settings } from '#lib/settings.svelte.ts';
	import { narration } from './narration.svelte.ts';
	import Guide from './Guide.svelte';
	import type { ExplainerDef, Mood } from './types.ts';

	let { def, data, clips = {} }: { def: ExplainerDef; data: unknown; clips?: Record<string, string> } = $props();

	let idx = $state(0);
	let done = $state<Record<string, boolean>>({});
	let reaction = $state<{ text: string; mood: Mood; key: number } | null>(null);
	let mood = $state<Mood>('neutral');
	let panelText = $state('');
	let pulseNext = $state(false);
	let stage: HTMLElement | undefined = $state();

	const scene = $derived(def.scenes[idx]);
	const caption = $derived(def.narration[scene.id] ?? '');
	const clip = $derived(clips[scene.id]);
	const completedCount = $derived(Object.values(done).filter(Boolean).length);
	const hasAudio = $derived(Object.keys(clips).length > 0);

	// caption words, lit in proportion to narration progress (weighted by length)
	const words = $derived(caption.split(/\s+/).filter(Boolean));
	const cum = $derived.by(() => {
		let t = 0;
		const total = words.reduce((n, w) => n + w.length + 1, 0);
		return words.map((w) => (t += w.length + 1) / total);
	});
	const litUpTo = $derived(narration.playing || narration.progress === 1 ? cum.findIndex((c) => c >= narration.progress) : -1);
	const narrating = $derived(settings.narration && !!clip);

	function go(i: number) {
		if (i < 0 || i >= def.scenes.length) return;
		idx = i;
	}

	// reset per-scene state and (optionally) narrate
	$effect(() => {
		const s = scene;
		untrack(() => {
			reaction = null;
			mood = s.mood ?? 'neutral';
			panelText = '';
			pulseNext = !!done[s.id];
			try {
				replaceState('#' + s.id, {});
			} catch {
				/* not yet hydrated */
			}
			stage?.scrollTo?.({ top: 0 });
		});
	});
	$effect(() => {
		const src = clip;
		const on = settings.narration;
		untrack(() => {
			if (on && src) narration.play(asset(src as Parameters<typeof asset>[0]));
			else narration.stop();
		});
	});
	// pulse Next when narration ends
	$effect(() => {
		if (narration.endedCount) untrack(() => (pulseNext = true));
	});

	onMount(() => {
		const id = decodeURIComponent(location.hash.slice(1));
		const i = def.scenes.findIndex((s) => s.id === id);
		if (i > 0) idx = i;
		return () => narration.stop();
	});

	let reactKey = 0;
	const api = {
		react(text: string, m: Mood = 'happy') {
			reaction = { text, mood: m, key: ++reactKey };
			mood = m;
		},
		complete() {
			const id = scene.id;
			if (!done[id]) done = { ...done, [id]: true };
			pulseNext = true;
		},
		panel(text: string) {
			panelText = text;
		},
		goto(id: string) {
			const i = def.scenes.findIndex((s) => s.id === id);
			if (i >= 0) go(i);
		}
	};

	function onKey(e: KeyboardEvent) {
		const t = e.target as HTMLElement;
		if (t.closest('input, textarea, select, dialog, [data-capture-keys]') || e.metaKey || e.ctrlKey || e.altKey) return;
		if (e.key === 'ArrowRight') go(idx + 1);
		if (e.key === 'ArrowLeft') go(idx - 1);
	}

	function toggleNarration() {
		settings.setNarration(!settings.narration);
	}
</script>

<svelte:window onkeydown={onKey} />

<div class="explainer skin-{def.guide}">
	<header class="xbar">
		<a class="back" href={resolve(def.guide === 'bot' ? '/cs' : '/learn') + '/'} aria-label="Back to all lessons">←</a>
		<div class="xtitle">
			<span class="sa deva">{def.sa}</span>
			<span class="en">{def.title}</span>
		</div>
		<ol class="dots" aria-label="Scenes">
			{#each def.scenes as s, i (s.id)}
				<li>
					<button
						class:current={i === idx}
						class:done={done[s.id]}
						onclick={() => go(i)}
						aria-label="Scene {i + 1}: {s.title}{done[s.id] ? ' (done)' : ''}"
						aria-current={i === idx ? 'step' : undefined}></button>
				</li>
			{/each}
		</ol>
		{#if hasAudio}
			<button class="narr" aria-pressed={settings.narration} onclick={toggleNarration} title={settings.narration ? 'Narration on' : 'Narration off'}>
				{#if settings.narration}
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" /></svg>
				{:else}
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4z" /><path d="m22 9-6 6M16 9l6 6" /></svg>
				{/if}
				<span class="lbl">Narration</span>
			</button>
		{/if}
	</header>

	<div class="xbody">
		<aside class="guide-col" aria-label="Guide">
			<div class="guide-wrap">
				<Guide
					skin={def.guide}
					{mood}
					level={narration.level}
					talking={narration.playing && narrating}
					progress={completedCount}
					total={def.scenes.length}
					panel={panelText}
					size={120} />
			</div>
			<div class="bubble" aria-live="polite">
				<p class="caption">
					{#each words as w, i (i)}<span class:lit={narrating && i <= litUpTo}>{w}</span>{' '}{/each}
				</p>
				{#if reaction}
					{#key reaction.key}
						<p class="reaction" in:fly={{ y: 6, duration: 220 }}>{reaction.text}</p>
					{/key}
				{/if}
				{#if narrating}
					<div class="ctrl">
						<button onclick={() => clip && narration.play(asset(clip as Parameters<typeof asset>[0]))} aria-label="Replay narration">↻ Replay</button>
						{#if narration.playing}<button onclick={() => narration.stop()} aria-label="Stop narration">■ Stop</button>{/if}
					</div>
				{/if}
			</div>
		</aside>

		<section class="stage" bind:this={stage} aria-labelledby="scene-title">
			<p class="eyebrow">Scene {idx + 1} of {def.scenes.length}</p>
			<h1 id="scene-title">{scene.title}</h1>
			{#key scene.id}
				<div class="scene" in:fade={{ duration: 220 }}>
					<scene.component react={api.react} complete={api.complete} panel={api.panel} goto={api.goto} {data} />
				</div>
			{/key}
		</section>
	</div>

	<footer class="xnav">
		<button class="btn" onclick={() => go(idx - 1)} disabled={idx === 0}>← Back</button>
		<span class="muted step">{idx + 1} / {def.scenes.length}</span>
		{#if idx < def.scenes.length - 1}
			<button class="btn primary" class:pulse={pulseNext} onclick={() => go(idx + 1)}>Next →</button>
		{:else}
			<a class="btn primary" href={resolve(def.guide === 'bot' ? '/cs' : '/learn') + '/'}>Finish ✓</a>
		{/if}
	</footer>
</div>

<style>
	.explainer {
		display: flex;
		flex-direction: column;
		min-height: calc(100vh - 60px);
		max-width: 1240px;
		margin: 0 auto;
		padding: 0 20px;
	}
	.xbar {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 14px 0;
		border-bottom: 1px solid var(--line);
	}
	.back {
		display: grid;
		place-items: center;
		width: 34px;
		height: 34px;
		border-radius: 999px;
		border: 1px solid var(--line);
		text-decoration: none;
		color: var(--ink-2);
		flex-shrink: 0;
	}
	.xtitle {
		display: flex;
		flex-direction: column;
		line-height: 1.25;
		min-width: 0;
	}
	.xtitle .sa {
		font-size: 13px;
		color: var(--saffron-ink);
	}
	.xtitle .en {
		font-family: var(--font-serif);
		font-weight: 600;
		font-size: 17px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.dots {
		display: flex;
		gap: 6px;
		list-style: none;
		margin: 0 0 0 auto;
		padding: 0;
	}
	.dots button {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 2px solid var(--line);
		background: var(--surface);
		padding: 0;
		cursor: pointer;
		transition: transform 0.15s;
	}
	.dots button.done {
		background: var(--saffron);
		border-color: var(--saffron);
	}
	.dots button.current {
		border-color: var(--indigo);
		transform: scale(1.3);
	}
	.narr {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		border-radius: 999px;
		border: 1px solid var(--line);
		background: var(--surface);
		color: var(--ink-2);
		cursor: pointer;
		font-size: 13.5px;
	}
	.narr[aria-pressed='true'] {
		background: var(--indigo-soft);
		color: var(--indigo);
		border-color: var(--indigo);
	}
	.xbody {
		flex: 1;
		display: grid;
		grid-template-columns: 280px minmax(0, 1fr);
		gap: 32px;
		padding: 24px 0;
	}
	.guide-col {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		position: sticky;
		top: 80px;
		align-self: start;
	}
	.bubble {
		position: relative;
		width: 100%;
		padding: 14px 16px;
		border-radius: 14px;
		background: var(--surface);
		border: 1px solid var(--line);
		box-shadow: var(--shadow);
	}
	.bubble::before {
		content: '';
		position: absolute;
		top: -8px;
		left: calc(50% - 8px);
		width: 14px;
		height: 14px;
		background: var(--surface);
		border-left: 1px solid var(--line);
		border-top: 1px solid var(--line);
		transform: rotate(45deg);
	}
	.caption {
		margin: 0;
		font-family: var(--font-serif);
		font-size: 16px;
		line-height: 1.6;
	}
	.caption span {
		transition: color 0.15s;
	}
	.caption span.lit {
		color: var(--saffron-ink);
	}
	.reaction {
		margin: 10px 0 0;
		padding-top: 10px;
		border-top: 1px dashed var(--line);
		font-size: 14.5px;
		color: var(--indigo);
		font-weight: 500;
	}
	.ctrl {
		display: flex;
		gap: 8px;
		margin-top: 10px;
	}
	.ctrl button {
		border: 1px solid var(--line);
		background: var(--surface-2);
		border-radius: 999px;
		padding: 2px 10px;
		font-size: 12.5px;
		cursor: pointer;
		color: var(--ink-2);
	}
	.stage {
		min-width: 0;
	}
	.stage h1 {
		font-size: clamp(24px, 3.4vw, 34px);
		margin-bottom: 18px;
	}
	.xnav {
		position: sticky;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 12px 0 16px;
		background: linear-gradient(to top, var(--bg) 70%, transparent);
		border-top: 1px solid var(--line);
	}
	.xnav .btn {
		padding: 9px 20px;
		font-size: 15px;
	}
	.xnav .btn:disabled {
		opacity: 0.4;
		cursor: default;
	}
	.pulse {
		animation: pulse 1.4s ease-in-out infinite;
	}
	@keyframes pulse {
		0%,
		100% {
			box-shadow: 0 0 0 0 color-mix(in srgb, var(--saffron) 55%, transparent);
		}
		50% {
			box-shadow: 0 0 0 8px transparent;
		}
	}
	@media (max-width: 860px) {
		.xbody {
			grid-template-columns: minmax(0, 1fr);
			gap: 16px;
			padding-top: 14px;
		}
		.guide-col {
			position: static;
			flex-direction: row;
			align-items: flex-start;
		}
		.guide-wrap :global(svg) {
			width: 72px;
			height: 90px;
		}
		.bubble::before {
			top: 20px;
			left: -8px;
			transform: rotate(-45deg);
		}
		.caption {
			font-size: 15px;
		}
		.lbl {
			display: none;
		}
		.xtitle .sa {
			display: none;
		}
	}
	@media (max-width: 600px) {
		.explainer {
			padding: 0 16px;
		}
		.dots {
			gap: 4px;
		}
		.dots button {
			width: 10px;
			height: 10px;
		}
	}
</style>
