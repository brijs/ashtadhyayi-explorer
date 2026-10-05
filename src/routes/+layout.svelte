<script lang="ts">
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { settings } from '#lib/settings.svelte.ts';
	import SearchPalette from '#lib/components/SearchPalette.svelte';
	import { ui } from '#lib/ui.svelte.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
	let menuOpen = $state(false);

	onMount(() => settings.hydrate());

	const nav = [
		{ href: resolve('/adhyaya/[a]', { a: '1' }) + '/', label: 'Sūtras', match: ['/adhyaya', '/sutra'] },
		{ href: resolve('/engine') + '/', label: 'Structure', match: ['/engine'] },
		{ href: resolve('/learn') + '/', label: 'Learn', match: ['/learn'] },
		{ href: resolve('/tools') + '/', label: 'Tools', match: ['/tools'] },
		{ href: resolve('/cs') + '/', label: 'Pāṇini & CS', match: ['/cs'] },
		{ href: resolve('/about') + '/', label: 'About', match: ['/about'] }
	];
	const isActive = (match: string[]) => match.some((m) => page.url.pathname.includes(m + '/'));

	function onKey(e: KeyboardEvent) {
		const target = e.target as HTMLElement;
		const typing = target.closest('input, textarea, select, [contenteditable="true"]');
		if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
			e.preventDefault();
			ui.searchOpen = true;
		}
	}

	$effect(() => {
		page.url.pathname;
		menuOpen = false;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Aṣṭādhyāyī Explorer</title>
	<meta name="description" content="Look up, explore and learn all 3,983 sūtras of Pāṇini's Aṣṭādhyāyī, with interactive explainers and connections to computer science." />
</svelte:head>

<svelte:window onkeydown={onKey} />

<a class="skip" href="#main">Skip to content</a>

<header class="top">
	<div class="wrap bar">
		<a class="brand" href={resolve('/')} aria-label="Aṣṭādhyāyī Explorer home">
			<span class="mark deva" aria-hidden="true">अ</span>
			<span class="names">
				<span class="en">Aṣṭādhyāyī Explorer</span>
				<span class="sa deva">अष्टाध्यायी</span>
			</span>
		</a>

		<nav class:open={menuOpen} aria-label="Main">
			{#each nav as item (item.label)}
				<a href={item.href} aria-current={isActive(item.match) ? 'page' : undefined}>{item.label}</a>
			{/each}
		</nav>

		<div class="actions">
			<button class="search-btn" onclick={() => (ui.searchOpen = true)} aria-label="Search sūtras">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
				<span class="label">Search</span>
				<kbd>/</kbd>
			</button>
			<button
				class="icon"
				aria-pressed={settings.iast}
				onclick={() => settings.setIast(!settings.iast)}
				title="Show IAST transliteration"
				aria-label="Show IAST transliteration">
				<span class="iast-ico">ā</span>
			</button>
			<button class="icon" onclick={() => settings.cycleTheme()} title="Theme: {settings.theme}" aria-label="Theme: {settings.theme}. Click to change.">
				{#if settings.theme === 'dark'}
					<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
				{:else if settings.theme === 'light'}
					<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
				{:else}
					<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" /></svg>
				{/if}
			</button>
			<button class="icon menu" aria-expanded={menuOpen} aria-label="Menu" onclick={() => (menuOpen = !menuOpen)}>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
			</button>
		</div>
	</div>
</header>

<main id="main">
	{@render children()}
</main>

<footer class="foot">
	<div class="wrap">
		<p>
			Sūtra text, padaccheda, anuvṛtti and commentaries from
			<a href="https://ashtadhyayi.com" rel="noopener">ashtadhyayi.com</a>
			(<a href="https://github.com/ashtadhyayi-com/data" rel="noopener">open data</a>). Derivations by
			<a href="https://github.com/ambuda-org/vidyut" rel="noopener">vidyut</a>.
			<a href={resolve('/about')}>Credits &amp; sources</a>
		</p>
	</div>
</footer>

<SearchPalette bind:open={ui.searchOpen} />

<style>
	.skip {
		position: absolute;
		left: -999px;
		top: 8px;
		z-index: 100;
		background: var(--surface);
		padding: 8px 12px;
		border-radius: 6px;
	}
	.skip:focus {
		left: 8px;
	}
	.top {
		position: sticky;
		top: 0;
		z-index: 40;
		background: color-mix(in srgb, var(--bg) 88%, transparent);
		backdrop-filter: saturate(1.4) blur(10px);
		border-bottom: 1px solid var(--line);
	}
	.bar {
		display: flex;
		align-items: center;
		gap: 20px;
		height: 60px;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		color: var(--ink);
		flex-shrink: 0;
	}
	.mark {
		display: grid;
		place-items: center;
		width: 34px;
		height: 34px;
		border-radius: 9px;
		background: var(--saffron);
		color: #fff;
		font-weight: 700;
		font-size: 21px;
		line-height: 1;
		padding-top: 3px;
	}
	.names {
		display: flex;
		flex-direction: column;
		line-height: 1.15;
	}
	.names .en {
		font-family: var(--font-serif);
		font-weight: 600;
		font-size: 16px;
	}
	.names .sa {
		font-size: 11.5px;
		color: var(--muted);
		line-height: 1.5;
	}
	nav {
		display: flex;
		gap: 4px;
		flex: 1;
	}
	nav a {
		padding: 6px 12px;
		border-radius: 999px;
		color: var(--ink-2);
		text-decoration: none;
		font-size: 14.5px;
		font-weight: 500;
	}
	nav a:hover {
		background: var(--surface-2);
		color: var(--ink);
	}
	nav a[aria-current='page'] {
		color: var(--saffron-ink);
		background: var(--saffron-soft);
	}
	.actions {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-left: auto;
	}
	.search-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		height: 36px;
		padding: 0 10px 0 12px;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: var(--surface);
		color: var(--muted);
		cursor: pointer;
		min-width: 180px;
		font-size: 14px;
	}
	.search-btn:hover {
		border-color: var(--muted);
	}
	.search-btn .label {
		flex: 1;
		text-align: left;
	}
	kbd {
		font-family: var(--font-mono);
		font-size: 11px;
		border: 1px solid var(--line);
		border-radius: 4px;
		padding: 0 5px;
		background: var(--surface-2);
	}
	.icon {
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		border-radius: 999px;
		border: 1px solid transparent;
		background: transparent;
		color: var(--ink-2);
		cursor: pointer;
	}
	.icon:hover {
		background: var(--surface-2);
	}
	.icon[aria-pressed='true'] {
		background: var(--indigo-soft);
		color: var(--indigo);
		border-color: color-mix(in srgb, var(--indigo) 40%, transparent);
	}
	.iast-ico {
		font-family: var(--font-serif);
		font-style: italic;
		font-size: 18px;
		font-weight: 600;
	}
	.menu {
		display: none;
	}
	main {
		min-height: calc(100vh - 60px - 120px);
	}
	.foot {
		margin-top: 64px;
		padding: 28px 0 40px;
		border-top: 1px solid var(--line);
		color: var(--muted);
		font-size: 13.5px;
	}
	.foot a {
		color: var(--ink-2);
	}

	@media (max-width: 900px) {
		.search-btn {
			min-width: 0;
		}
		.search-btn .label,
		.search-btn kbd {
			display: none;
		}
		.menu {
			display: grid;
		}
		nav {
			display: none;
			position: absolute;
			top: 60px;
			left: 0;
			right: 0;
			flex-direction: column;
			padding: 8px 16px 14px;
			background: var(--bg);
			border-bottom: 1px solid var(--line);
			box-shadow: var(--shadow);
		}
		nav.open {
			display: flex;
		}
		nav a {
			padding: 10px 12px;
			border-radius: 8px;
		}
	}
	@media (max-width: 420px) {
		.names .sa {
			display: none;
		}
		.names .en {
			font-size: 15px;
		}
		.bar {
			gap: 8px;
		}
		.actions {
			gap: 0;
		}
		.icon,
		.search-btn {
			width: 34px;
			height: 34px;
		}
		.search-btn {
			padding: 0;
			justify-content: center;
		}
	}
</style>
