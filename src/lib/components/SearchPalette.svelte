<script lang="ts">
	import { goto } from '$app/navigation';
	import { sutraHref } from '#lib/links.ts';
	import { search, getIndex, type Hit } from '#lib/search.ts';
	import { settings } from '#lib/settings.svelte.ts';
	import { devaToIast } from '#lib/translit.ts';
	import TypeBadge from './TypeBadge.svelte';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	let q = $state('');
	let hits = $state<Hit[]>([]);
	let active = $state(0);
	let loading = $state(false);
	let input: HTMLInputElement | undefined = $state();
	let dialog: HTMLDialogElement | undefined = $state();
	let seq = 0;

	const examples = ['6.1.77', 'इको यणचि', 'vrddhi', 'iko yanaci', 'semivowel', 'substitute', 'पूर्वत्रासिद्धम्'];

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) {
			dialog.showModal();
			getIndex();
			queueMicrotask(() => input?.select());
		} else if (!open && dialog.open) dialog.close();
	});

	$effect(() => {
		const query = q;
		const mine = ++seq;
		if (!query.trim()) {
			hits = [];
			return;
		}
		loading = true;
		search(query, 40).then((h) => {
			if (mine !== seq) return;
			hits = h;
			active = 0;
			loading = false;
		});
	});

	function go(h: Hit) {
		open = false;
		goto(sutraHref(h.n));
	}

	function onKey(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			active = Math.min(active + 1, hits.length - 1);
			scrollActive();
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			active = Math.max(active - 1, 0);
			scrollActive();
		} else if (e.key === 'Enter' && hits[active]) {
			e.preventDefault();
			go(hits[active]);
		}
	}
	function scrollActive() {
		queueMicrotask(() => dialog?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' }));
	}
</script>

<dialog
	bind:this={dialog}
	onclose={() => (open = false)}
	onclick={(e) => {
		if (e.target === dialog) open = false;
	}}
	aria-label="Search sūtras">
	<div class="panel">
		<div class="field">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
			<input
				bind:this={input}
				bind:value={q}
				onkeydown={onKey}
				placeholder="Number, Devanagari, IAST, or English…"
				aria-label="Search query"
				role="combobox"
				aria-expanded={hits.length > 0}
				aria-controls="search-results"
				autocomplete="off"
				spellcheck="false" />
			<button class="esc" onclick={() => (open = false)} aria-label="Close search">esc</button>
		</div>

		{#if !q.trim()}
			<div class="hint">
				<p class="muted">Try any script. Numbers jump straight to the sūtra.</p>
				<div class="examples">
					{#each examples as ex (ex)}
						<button class="btn" onclick={() => (q = ex)}>{ex}</button>
					{/each}
				</div>
			</div>
		{:else}
			<ul id="search-results" role="listbox" aria-label="Results">
				{#each hits as h, i (h.id)}
					<li role="option" aria-selected={i === active}>
						<a
							href={sutraHref(h.n)}
							onclick={(e) => {
								e.preventDefault();
								go(h);
							}}
							onmouseenter={() => (active = i)}>
							<span class="num">{h.n}</span>
							<span class="body">
								<span class="s deva">{h.s}</span>
								{#if settings.iast}<span class="iast">{devaToIast(h.s)}</span>{/if}
								<span class="en">{h.en}</span>
							</span>
							<span class="badges">
								{#each h.ty as t (t)}<TypeBadge code={t} compact />{/each}
							</span>
						</a>
					</li>
				{:else}
					<li class="none muted">{loading ? 'Searching…' : 'No sūtras found.'}</li>
				{/each}
			</ul>
		{/if}
		<div class="foot muted">
			<span><kbd>↑</kbd><kbd>↓</kbd> move</span>
			<span><kbd>↵</kbd> open</span>
			<span>{hits.length ? `${hits.length}${hits.length === 40 ? '+' : ''} results` : ''}</span>
		</div>
	</div>
</dialog>

<style>
	dialog {
		padding: 0;
		border: none;
		background: transparent;
		width: min(680px, calc(100vw - 24px));
		max-height: min(640px, calc(100vh - 80px));
		margin: 72px auto auto;
		overflow: visible;
	}
	dialog::backdrop {
		background: rgb(10 8 20 / 0.45);
		backdrop-filter: blur(2px);
	}
	.panel {
		display: flex;
		flex-direction: column;
		max-height: min(640px, calc(100vh - 80px));
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 14px;
		box-shadow: var(--shadow-lg);
		overflow: hidden;
		color: var(--ink);
	}
	.field {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 0 14px;
		border-bottom: 1px solid var(--line);
		color: var(--muted);
	}
	input {
		flex: 1;
		min-width: 0;
		border: none;
		outline: none;
		background: transparent;
		color: var(--ink);
		font: inherit;
		font-size: 18px;
		padding: 16px 0;
		font-family: var(--font-ui), var(--font-deva);
	}
	.esc {
		font-family: var(--font-mono);
		font-size: 11px;
		border: 1px solid var(--line);
		border-radius: 4px;
		padding: 2px 6px;
		background: var(--surface-2);
		color: var(--muted);
		cursor: pointer;
	}
	.hint {
		padding: 18px;
	}
	.examples {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.examples .btn {
		font-family: var(--font-ui), var(--font-deva);
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 6px;
		overflow-y: auto;
	}
	li a {
		display: flex;
		gap: 14px;
		align-items: flex-start;
		padding: 10px 12px;
		border-radius: 10px;
		color: inherit;
		text-decoration: none;
	}
	li[aria-selected='true'] a {
		background: var(--surface-2);
	}
	.num {
		font-family: var(--font-mono);
		font-size: 13px;
		color: var(--saffron-ink);
		min-width: 56px;
		padding-top: 4px;
	}
	.body {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}
	.s {
		font-size: 19px;
		line-height: 1.5;
	}
	.body .iast {
		font-size: 14px;
	}
	.en {
		font-size: 13.5px;
		color: var(--ink-2);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.badges {
		display: flex;
		gap: 4px;
		padding-top: 4px;
	}
	.none {
		padding: 18px;
	}
	.foot {
		display: flex;
		gap: 16px;
		padding: 8px 14px;
		border-top: 1px solid var(--line);
		font-size: 12px;
	}
	.foot span:last-child {
		margin-left: auto;
	}
	.foot kbd {
		font-family: var(--font-mono);
		font-size: 10.5px;
		border: 1px solid var(--line);
		border-radius: 3px;
		padding: 0 4px;
		margin-right: 2px;
	}
	@media (max-width: 600px) {
		dialog {
			margin-top: 12px;
		}
		.badges {
			display: none;
		}
	}
</style>
