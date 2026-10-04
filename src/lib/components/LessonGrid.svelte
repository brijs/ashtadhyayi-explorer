<script lang="ts">
	import type { Lesson } from '#lib/catalog.ts';

	let { lessons, hrefFor }: { lessons: Lesson[]; hrefFor: (slug: string) => string } = $props();
</script>

<ol class="grid">
	{#each lessons as l, i (l.slug)}
		<li>
			{#if l.status === 'ready'}
				<a class="card item" href={hrefFor(l.slug)}>
					<span class="idx">{String(i + 1).padStart(2, '0')}</span>
					{#if l.sa}<span class="sa deva">{l.sa}</span>{/if}
					<span class="title">{l.title}</span>
					<span class="blurb">{l.blurb}</span>
				</a>
			{:else}
				<div class="card item soon" aria-disabled="true">
					<span class="idx">{String(i + 1).padStart(2, '0')} · coming soon</span>
					{#if l.sa}<span class="sa deva">{l.sa}</span>{/if}
					<span class="title">{l.title}</span>
					<span class="blurb">{l.blurb}</span>
				</div>
			{/if}
		</li>
	{/each}
</ol>

<style>
	.grid {
		list-style: none;
		padding: 0;
		margin: 24px 0 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 16px;
	}
	.item {
		display: flex;
		flex-direction: column;
		gap: 2px;
		height: 100%;
		padding: 18px 20px;
		text-decoration: none;
		color: inherit;
	}
	a.item:hover {
		border-color: var(--saffron);
	}
	.soon {
		opacity: 0.62;
		box-shadow: none;
		border-style: dashed;
	}
	.idx {
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--muted);
	}
	.sa {
		color: var(--saffron-ink);
		font-size: 15px;
	}
	.title {
		font-family: var(--font-serif);
		font-weight: 600;
		font-size: 19px;
	}
	.blurb {
		font-size: 14.5px;
		color: var(--ink-2);
	}
</style>
