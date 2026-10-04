<script lang="ts">
	import { looseKey, devaToIast } from '#lib/translit.ts';
	import { settings } from '#lib/settings.svelte.ts';
	import type { Dhatu } from '#lib/vidyut.ts';

	let { dhatus, value, onchange }: { dhatus: Dhatu[]; value: Dhatu | null; onchange: (d: Dhatu) => void } = $props();

	const GANA_SA: Record<string, string> = {
		Bhvadi: 'भ्वादि', Adadi: 'अदादि', Juhotyadi: 'जुहोत्यादि', Divadi: 'दिवादि', Svadi: 'स्वादि',
		Tudadi: 'तुदादि', Rudhadi: 'रुधादि', Tanadi: 'तनादि', Kryadi: 'क्र्यादि', Curadi: 'चुरादि'
	};
	let q = $state('');
	let open = $state(false);
	const keyed = $derived(dhatus.map((d) => ({ d, k: `${looseKey(d.n)} ${looseKey(d.d)} ${looseKey(d.m)} ${d.c}` })));
	const results = $derived.by(() => {
		const t = q.trim();
		if (!t) return dhatus.slice(0, 40);
		const lk = looseKey(t);
		const starts = keyed.filter((x) => looseKey(x.d.n).startsWith(lk) || x.d.c.startsWith(t));
		const contains = keyed.filter((x) => !starts.includes(x) && x.k.includes(lk));
		return [...starts, ...contains].slice(0, 60).map((x) => x.d);
	});

	function pick(d: Dhatu) {
		onchange(d);
		open = false;
		q = '';
	}
</script>

<div class="picker">
	<button class="current" onclick={() => (open = !open)} aria-expanded={open}>
		{#if value}
			<span class="n deva">{value.n}</span>
			<span class="meta">
				<span class="deva">{value.d} {value.m}</span>
				<small>{value.c} · <span class="deva">{GANA_SA[value.g]}</span>{settings.iast ? ` · ${devaToIast(value.n)}` : ''}</small>
			</span>
		{:else}
			<span class="muted">Choose a root…</span>
		{/if}
		<span class="caret" aria-hidden="true">▾</span>
	</button>
	{#if open}
		<div class="drop card">
			<!-- svelte-ignore a11y_autofocus -->
			<input bind:value={q} placeholder="Search root, meaning or code: भू, gam, पाके, 01.0001" aria-label="Search dhātus" autofocus />
			<ul role="listbox" aria-label="Dhātus">
				{#each results as d (d.c)}
					<li>
						<button role="option" aria-selected={value?.c === d.c} onclick={() => pick(d)}>
							<span class="n deva">{d.n}</span>
							<span class="deva m">{d.m}</span>
							<small>{d.c} <span class="deva">{GANA_SA[d.g]}</span></small>
						</button>
					</li>
				{:else}
					<li class="muted none">No root found.</li>
				{/each}
			</ul>
			<p class="foot muted">{dhatus.length.toLocaleString()} roots from vidyut's Dhātupāṭha</p>
		</div>
	{/if}
</div>

<style>
	.picker {
		position: relative;
	}
	.current {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		padding: 8px 12px;
		border-radius: 12px;
		border: 1.5px solid var(--line);
		background: var(--surface);
		cursor: pointer;
		text-align: left;
		color: var(--ink);
	}
	.current:hover {
		border-color: var(--saffron);
	}
	.n {
		font-size: 28px;
		font-weight: 600;
		line-height: 1.3;
		min-width: 48px;
	}
	.meta {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
		font-size: 15px;
		line-height: 1.4;
	}
	.meta small {
		font-size: 12px;
		color: var(--muted);
	}
	.caret {
		color: var(--muted);
	}
	.drop {
		position: absolute;
		z-index: 20;
		top: calc(100% + 6px);
		left: 0;
		right: 0;
		padding: 8px;
		box-shadow: var(--shadow-lg);
	}
	input {
		width: 100%;
		padding: 9px 12px;
		border-radius: 8px;
		border: 1px solid var(--line);
		background: var(--bg);
		color: var(--ink);
		font: inherit;
		font-family: var(--font-ui), var(--font-deva);
	}
	ul {
		list-style: none;
		margin: 6px 0 0;
		padding: 0;
		max-height: 320px;
		overflow-y: auto;
	}
	li button {
		display: flex;
		align-items: baseline;
		gap: 10px;
		width: 100%;
		padding: 5px 8px;
		border: none;
		border-radius: 6px;
		background: none;
		cursor: pointer;
		text-align: left;
		color: var(--ink);
	}
	li button:hover,
	li button[aria-selected='true'] {
		background: var(--surface-2);
	}
	li .n {
		font-size: 19px;
		min-width: 56px;
	}
	.m {
		flex: 1;
		font-size: 15px;
		color: var(--ink-2);
	}
	li small {
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--muted);
	}
	.none {
		padding: 8px;
	}
	.foot {
		font-size: 11.5px;
		margin: 6px 4px 0;
	}
</style>
