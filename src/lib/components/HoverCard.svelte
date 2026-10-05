<script lang="ts">
	import type { Snippet } from 'svelte';

	// A small popover: opens on mouse hover (after a short delay), on tap, or on Enter/Space.
	// The card is position:fixed so it is never clipped by scrolling containers (tables, grids).
	let {
		trigger,
		children,
		label,
		width = 320,
		underline = true,
		triggerClass = ''
	}: { trigger: Snippet; children: Snippet; label: string; width?: number; underline?: boolean; triggerClass?: string } = $props();

	let open = $state(false);
	let root: HTMLSpanElement | undefined = $state();
	let btn: HTMLButtonElement | undefined = $state();
	let card: HTMLSpanElement | undefined = $state();
	let pos = $state({ x: 0, y: 0, above: false });
	const uid = $props.id();
	let timer: ReturnType<typeof setTimeout> | undefined;

	function place() {
		if (!btn) return;
		const r = btn.getBoundingClientRect();
		const w = Math.min(width, window.innerWidth - 32);
		const h = card?.offsetHeight ?? 220;
		const x = Math.max(16, Math.min(r.left - 12, window.innerWidth - w - 16));
		const above = r.bottom + 8 + h > window.innerHeight && r.top - 8 - h > 0;
		pos = { x, y: above ? r.top - 8 - h : r.bottom + 8, above };
	}
	function show() {
		clearTimeout(timer);
		if (open) return;
		open = true;
		place();
		requestAnimationFrame(place); // re-place once the card has a real height
	}
	function hide() {
		clearTimeout(timer);
		open = false;
	}
	function onEnter(e: PointerEvent) {
		if (e.pointerType !== 'mouse') return;
		clearTimeout(timer);
		timer = setTimeout(show, 150);
	}
	function onLeave(e: PointerEvent) {
		if (e.pointerType !== 'mouse') return;
		clearTimeout(timer);
		timer = setTimeout(hide, 220);
	}
	function toggle() {
		if (open) hide();
		else show();
	}
	function onDocClick(e: MouseEvent) {
		if (open && root && !root.contains(e.target as Node)) hide();
	}
	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) {
			hide();
			btn?.focus();
		}
	}
</script>

<svelte:document onclick={onDocClick} onkeydown={onKey} />
<svelte:window onscroll={() => open && place()} onresize={() => open && place()} />

<!-- hover is a convenience for mouse users; the button below is the accessible control -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<span class="hc" bind:this={root} onpointerenter={onEnter} onpointerleave={onLeave}>
	<button bind:this={btn} class="trigger {triggerClass}" class:underline aria-expanded={open} aria-controls="hc-{uid}" onclick={toggle}>
		{@render trigger()}
	</button>
	{#if open}
		<span
			bind:this={card}
			class="pop card"
			class:above={pos.above}
			id="hc-{uid}"
			role="dialog"
			aria-label={label}
			style="left: {pos.x}px; top: {pos.y}px; width: min({width}px, calc(100vw - 32px))"
		>
			{@render children()}
		</span>
	{/if}
</span>

<style>
	.hc {
		position: relative;
		display: inline-block;
	}
	.trigger {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		color: inherit;
		font: inherit;
		line-height: inherit;
	}
	.trigger.underline {
		border-bottom: 2px dotted currentColor;
	}
	.trigger:hover {
		color: var(--saffron-ink);
	}
	.pop {
		position: fixed;
		z-index: 60;
		padding: 14px 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		text-align: left;
		box-shadow: var(--shadow-lg);
		font-family: var(--font-ui);
		font-size: 14px;
		font-weight: 400;
		font-style: normal;
		line-height: 1.5;
		letter-spacing: 0;
		text-transform: none;
		white-space: normal;
		color: var(--ink);
		cursor: auto;
		animation: pop-in 0.16s ease-out;
	}
	.pop.above {
		animation-name: pop-in-up;
	}
	@keyframes pop-in {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
	}
	@keyframes pop-in-up {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
	}
</style>
