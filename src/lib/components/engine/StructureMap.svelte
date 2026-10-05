<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { sutraHref } from '#lib/links.ts';
	import { loadCore } from '#lib/search.ts';
	import { BANDS, type Band } from '#lib/structure.ts';
	import { TYPE_INFO, type CoreSutra, type SutraType } from '#lib/types.ts';
	import { layout, cellPos, hitTest, CELL, PITCH, COLS, COL_W, TOP, PADA_HEAD } from '#lib/engine/map-layout.ts';

	// Zoomable, pannable map of all 3,983 sūtras: 8 columns (adhyāyas) → 4 pāda blocks → one cell per sūtra.
	// Panning/zooming only changes one transform; cells are rendered once and recoloured by CSS classes.
	type AdhyayaLite = { a: number; title: string; summary: string; padas: { p: number; title: string; summary: string }[] };
	let {
		padaCounts,
		types,
		heat,
		bands,
		spans,
		adhyayas,
		sampleN,
		highlight = [],
		current = -1,
		exampleWord = ''
	}: {
		padaCounts: number[][];
		types: string[];
		heat: number[];
		bands: Band[];
		spans: { n: string; s: string; from: number; to: number; toN: string; count: number }[];
		adhyayas: AdhyayaLite[];
		sampleN: number;
		highlight?: number[];
		current?: number;
		exampleWord?: string;
	} = $props();

	const L = $derived(layout(padaCounts));
	const blockOf = (idx: number) => cellPos(L, idx).block;
	const numberOf = (idx: number) => {
		const b = blockOf(idx);
		return `${b.a}.${b.p}.${idx - b.start + 1}`;
	};
	const heatMax = $derived(Math.max(1, ...heat));
	const bucket = (h: number) => (h === 0 ? 0 : Math.min(5, 1 + Math.floor((Math.log(1 + h) / Math.log(1 + heatMax)) * 4.999)));
	const cells = $derived(
		types.map((t, i) => {
			const { x, y, block } = cellPos(L, i);
			return { i, x, y, cls: `t-${t} b-${bands[(block.a - 1) * 4 + block.p - 1]} h${bucket(heat[i])}` };
		})
	);

	// nesting depth of heading spans, for drawing them as brackets beside the cells
	const brackets = $derived.by(() => {
		const sorted = [...spans].sort((a, b) => a.from - b.from || b.to - a.to);
		const out: { n: string; s: string; toN: string; count: number; depth: number; segs: { x: number; y1: number; y2: number }[] }[] = [];
		const open: { to: number }[] = [];
		for (const sp of sorted) {
			while (open.length && open[open.length - 1].to < sp.from) open.pop();
			const depth = Math.min(open.length, 6);
			open.push({ to: sp.to });
			const segs: { x: number; y1: number; y2: number }[] = [];
			for (const b of L.blocks) {
				const s = Math.max(sp.from, b.start);
				const e = Math.min(sp.to, b.start + b.count - 1);
				if (s > e) continue;
				const y1 = b.y + Math.floor((s - b.start) / COLS) * PITCH;
				const y2 = b.y + Math.floor((e - b.start) / COLS) * PITCH + CELL;
				segs.push({ x: b.x - 5 - depth * 4, y1, y2 });
			}
			out.push({ n: sp.n, s: sp.s, toN: sp.toN, count: sp.count, depth, segs });
		}
		return out;
	});

	// ---------- view state ----------
	let box: HTMLDivElement | undefined = $state();
	let vw = $state(800);
	let vh = $state(560);
	let view = $state({ k: 0.6, x: 0, y: 0 });
	let fitK = $state(0.6);
	let mode = $state<'type' | 'band' | 'heat' | 'example'>('band');
	const level = $derived(view.k < 1.15 ? 0 : view.k < 2.4 ? 1 : view.k < 6 ? 2 : 3);

	function fit(x0: number, y0: number, w: number, h: number, pad = 16) {
		const k = Math.min((vw - pad * 2) / w, (vh - pad * 2) / h);
		const kk = clampK(k);
		view = { k: kk, x: (vw - w * kk) / 2 - x0 * kk, y: (vh - h * kk) / 2 - y0 * kk };
	}
	const clampK = (k: number) => Math.max(fitK * 0.7, Math.min(16, k));
	function reset() {
		fitK = Math.min((vw - 16) / L.width, (vh - 16) / L.height);
		fit(0, 0, L.width, L.height, 8);
	}
	function zoomAt(f: number, sx: number, sy: number) {
		const k = clampK(view.k * f);
		const r = k / view.k;
		view = { k, x: sx - (sx - view.x) * r, y: sy - (sy - view.y) * r };
		scheduleVisible();
	}
	export function focusAdhyaya(a: number, p?: number) {
		const bs = L.blocks.filter((b) => b.a === a && (!p || b.p === p));
		const y0 = Math.min(...bs.map((b) => b.y - PADA_HEAD)) - (p ? 0 : TOP - 10);
		const y1 = Math.max(...bs.map((b) => b.y + b.h));
		fit(bs[0].x - 34, y0, COL_W + 44, y1 - y0, 12);
		scheduleVisible();
	}
	export function focusIndices(ids: number[]) {
		if (!ids.length) return reset();
		const ps = ids.map((i) => cellPos(L, i));
		const x0 = Math.min(...ps.map((p) => p.x)) - 30;
		const x1 = Math.max(...ps.map((p) => p.x)) + CELL + 30;
		const y0 = Math.min(...ps.map((p) => p.y)) - 60;
		const y1 = Math.max(...ps.map((p) => p.y)) + CELL + 30;
		fit(x0, y0, x1 - x0, y1 - y0, 12);
		scheduleVisible();
	}

	// ---------- visible cells for labels (recomputed when the view settles) ----------
	let visible = $state<number[]>([]);
	let visTimer: ReturnType<typeof setTimeout> | undefined;
	function scheduleVisible() {
		clearTimeout(visTimer);
		visTimer = setTimeout(computeVisible, 90);
	}
	function computeVisible() {
		if (level < 2) {
			visible = [];
			return;
		}
		const wx0 = -view.x / view.k - 40;
		const wy0 = -view.y / view.k - 40;
		const wx1 = wx0 + vw / view.k + 80;
		const wy1 = wy0 + vh / view.k + 80;
		const out: number[] = [];
		for (const b of L.blocks) {
			if (b.x > wx1 || b.x + COLS * PITCH < wx0 || b.y > wy1 || b.y + b.h < wy0) continue;
			for (let k = 0; k < b.count; k++) {
				const x = b.x + (k % COLS) * PITCH;
				const y = b.y + Math.floor(k / COLS) * PITCH;
				if (x >= wx0 && x <= wx1 && y >= wy0 && y <= wy1) out.push(b.start + k);
			}
		}
		visible = out.slice(0, 2500);
		if (level >= 3) ensureCore();
	}

	// ---------- sūtra texts (lazy) ----------
	let core = $state<Map<string, CoreSutra> | null>(null);
	let coreLoading = false;
	function ensureCore() {
		if (core || coreLoading) return;
		coreLoading = true;
		loadCore()
			.then((list) => (core = new Map(list.map((s) => [s.n, s]))))
			.catch(() => (coreLoading = false));
	}

	// ---------- pointer interaction ----------
	const pointers = new Map<number, { x: number; y: number }>();
	let drag: { x: number; y: number; vx: number; vy: number; moved: boolean } | null = null;
	let pinch: { d: number; k: number; cx: number; cy: number; vx: number; vy: number } | null = null;
	let engaged = $state(false);
	let hint = $state(false);
	let hintTimer: ReturnType<typeof setTimeout> | undefined;
	let hover = $state<{ idx: number; sx: number; sy: number; touch: boolean } | null>(null);

	const local = (e: { clientX: number; clientY: number }) => {
		const r = box!.getBoundingClientRect();
		return { x: e.clientX - r.left, y: e.clientY - r.top };
	};
	const world = (sx: number, sy: number) => ({ x: (sx - view.x) / view.k, y: (sy - view.y) / view.k });

	function onDown(e: PointerEvent) {
		if ((e.target as HTMLElement).closest('.tip, .tools')) return;
		engaged = true;
		box!.setPointerCapture(e.pointerId);
		const p = local(e);
		pointers.set(e.pointerId, p);
		if (pointers.size === 1) {
			drag = { x: p.x, y: p.y, vx: view.x, vy: view.y, moved: false };
		} else if (pointers.size === 2) {
			const [a, b] = [...pointers.values()];
			pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), k: view.k, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2, vx: view.x, vy: view.y };
			if (drag) drag.moved = true;
		}
	}
	function onMove(e: PointerEvent) {
		const p = local(e);
		if (pointers.has(e.pointerId)) pointers.set(e.pointerId, p);
		if (pinch && pointers.size >= 2) {
			const [a, b] = [...pointers.values()];
			const d = Math.hypot(a.x - b.x, a.y - b.y);
			const k = clampK((pinch.k * d) / Math.max(1, pinch.d));
			const cx = (a.x + b.x) / 2;
			const cy = (a.y + b.y) / 2;
			const r = k / pinch.k;
			view = { k, x: cx - (pinch.cx - pinch.vx) * r, y: cy - (pinch.cy - pinch.vy) * r };
			hover = null;
			return;
		}
		if (drag && pointers.size === 1) {
			const dx = p.x - drag.x;
			const dy = p.y - drag.y;
			if (!drag.moved && Math.hypot(dx, dy) > 5) drag.moved = true;
			if (drag.moved) {
				view = { ...view, x: drag.vx + dx, y: drag.vy + dy };
				hover = null;
				return;
			}
		}
		if (e.pointerType === 'mouse' && !drag) {
			const w = world(p.x, p.y);
			const idx = hitTest(L, w.x, w.y);
			hover = idx >= 0 ? { idx, sx: p.x, sy: p.y, touch: false } : null;
			if (idx >= 0) ensureCore();
		}
	}
	function onUp(e: PointerEvent) {
		const p = local(e);
		const wasDrag = drag?.moved;
		pointers.delete(e.pointerId);
		if (pointers.size < 2) pinch = null;
		if (pointers.size === 0) {
			drag = null;
			scheduleVisible();
			if (!wasDrag) {
				const w = world(p.x, p.y);
				const idx = hitTest(L, w.x, w.y);
				if (idx >= 0) {
					if (e.pointerType === 'mouse') goto(sutraHref(numberOf(idx)));
					else {
						hover = { idx, sx: p.x, sy: p.y, touch: true };
						ensureCore();
					}
				} else hover = null;
			}
		} else if (pointers.size === 1) {
			const [q] = [...pointers.values()];
			drag = { x: q.x, y: q.y, vx: view.x, vy: view.y, moved: true };
		}
	}
	function onWheel(e: WheelEvent) {
		if (!(e.ctrlKey || e.metaKey || engaged)) {
			hint = true;
			clearTimeout(hintTimer);
			hintTimer = setTimeout(() => (hint = false), 1400);
			return;
		}
		e.preventDefault();
		const p = local(e);
		const f = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0022));
		zoomAt(f, p.x, p.y);
		hover = null;
	}
	function onDbl(e: MouseEvent) {
		const p = local(e);
		zoomAt(2, p.x, p.y);
	}
	function onKey(e: KeyboardEvent) {
		const step = 60;
		if (e.key === '+' || e.key === '=') zoomAt(1.4, vw / 2, vh / 2);
		else if (e.key === '-' || e.key === '_') zoomAt(1 / 1.4, vw / 2, vh / 2);
		else if (e.key === '0') reset();
		else if (e.key === 'ArrowLeft') view = { ...view, x: view.x + step };
		else if (e.key === 'ArrowRight') view = { ...view, x: view.x - step };
		else if (e.key === 'ArrowUp') view = { ...view, y: view.y + step };
		else if (e.key === 'ArrowDown') view = { ...view, y: view.y - step };
		else return;
		e.preventDefault();
		scheduleVisible();
	}

	// wheel must be non-passive to prevent page scroll while zooming
	$effect(() => {
		if (!box) return;
		const el = box;
		el.addEventListener('wheel', onWheel, { passive: false });
		return () => el.removeEventListener('wheel', onWheel);
	});

	function readHash() {
		const m = location.hash.match(/^#map-a([1-8])(?:-([1-4]))?$/);
		if (!m) return false;
		box?.closest('section')?.scrollIntoView({ block: 'start' });
		focusAdhyaya(+m[1], m[2] ? +m[2] : undefined);
		return true;
	}

	onMount(() => {
		const ro = new ResizeObserver(() => {
			const first = vw === 800 && vh === 560;
			vw = box!.clientWidth;
			vh = box!.clientHeight;
			if (first) {
				reset();
				readHash();
			} else fitK = Math.min((vw - 16) / L.width, (vh - 16) / L.height);
		});
		ro.observe(box!);
		const onHash = () => readHash();
		window.addEventListener('hashchange', onHash);
		return () => {
			ro.disconnect();
			window.removeEventListener('hashchange', onHash);
			clearTimeout(visTimer);
		};
	});

	$effect(() => {
		level;
		scheduleVisible();
	});

	// screen-space positions for HTML labels (40 elements; cheap to update on every frame)
	const sx = (wx: number) => wx * view.k + view.x;
	const sy = (wy: number) => wy * view.k + view.y;
	const hiSet = $derived(new Set(highlight));
	const tipInfo = $derived.by(() => {
		if (!hover) return null;
		const n = numberOf(hover.idx);
		const b = blockOf(hover.idx);
		const c = core?.get(n);
		const under = spans.filter((s) => s.from <= hover!.idx && s.to >= hover!.idx).map((s) => `${s.n} ${s.s}`);
		return { n, b, c, type: types[hover.idx] as SutraType['code'], band: bands[(b.a - 1) * 4 + b.p - 1], heat: heat[hover.idx], under };
	});
	const MODES = [
		{ id: 'band', label: 'Pipeline role' },
		{ id: 'type', label: 'Sūtra type' },
		{ id: 'heat', label: 'Usage in derivations' },
		{ id: 'example', label: 'Current example' }
	] as const;
</script>

<div class="map-wrap">
	<div class="tools" role="toolbar" aria-label="Map controls">
		<div class="modes" role="radiogroup" aria-label="Colour by">
			{#each MODES as m (m.id)}
				<button class="btn" role="radio" aria-checked={mode === m.id} onclick={() => (mode = m.id)}>{m.label}</button>
			{/each}
		</div>
		<div class="zoom">
			<button class="btn" onclick={() => zoomAt(1.5, vw / 2, vh / 2)} aria-label="Zoom in">+</button>
			<button class="btn" onclick={() => zoomAt(1 / 1.5, vw / 2, vh / 2)} aria-label="Zoom out">−</button>
			<button class="btn" onclick={reset}>Reset</button>
		</div>
	</div>
	<div class="jump" aria-label="Jump to adhyāya">
		{#each [1, 2, 3, 4, 5, 6, 7, 8] as a (a)}<button onclick={() => focusAdhyaya(a)} aria-label="Zoom to adhyāya {a}">{a}</button>{/each}
		{#if highlight.length}<button class="ex" onclick={() => focusIndices(highlight)}>{exampleWord || 'example'}</button>{/if}
	</div>

	<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
	<div
		class="map lv{level} mode-{mode}"
		class:engaged
		bind:this={box}
		tabindex="0"
		role="application"
		aria-label="Map of the Aṣṭādhyāyī. Drag to pan; scroll with Ctrl or pinch to zoom; plus and minus keys zoom; click a cell to open its sūtra."
		onpointerdown={onDown}
		onpointermove={onMove}
		onpointerup={onUp}
		onpointercancel={onUp}
		onpointerleave={(e) => {
			if (e.pointerType === 'mouse') {
				hover = null;
				engaged = false;
			}
		}}
		ondblclick={onDbl}
		onkeydown={onKey}
	>
		<svg width={vw} height={vh}>
			<g transform="translate({view.x.toFixed(2)} {view.y.toFixed(2)}) scale({view.k.toFixed(4)})">
				{#each L.blocks as b (b.a * 10 + b.p)}
					<rect class="blockbg" x={b.x - 3} y={b.y - 3} width={COLS * PITCH + 4} height={b.h + 4} rx="3" />
				{/each}
				<g class="cells">
					{#each cells as c (c.i)}
						<rect x={c.x} y={c.y} width={CELL} height={CELL} rx="1.6" class={c.cls} />
					{/each}
				</g>
				{#if level >= 1}
					<g class="brackets">
						{#each brackets as br (br.n)}
							{#each br.segs as s, j (j)}
								<line x1={s.x} x2={s.x} y1={s.y1} y2={s.y2} />
								{#if j === 0}<circle cx={s.x} cy={s.y1 + 1} r="1.8" />{/if}
							{/each}
						{/each}
					</g>
				{/if}
				{#if highlight.length}
					<g class="hl">
						{#each highlight as i (i)}
							{@const p = cellPos(L, i)}
							<rect x={p.x - 1.2} y={p.y - 1.2} width={CELL + 2.4} height={CELL + 2.4} rx="2.4" class:onmode={mode === 'example'} class={'b-' + bands[(p.block.a - 1) * 4 + p.block.p - 1]} />
						{/each}
						{#if current >= 0}
							{@const p = cellPos(L, current)}
							<circle class="cur" cx={p.x + CELL / 2} cy={p.y + CELL / 2} r={CELL * 0.95} />
						{/if}
					</g>
				{/if}
				{#if level >= 2}
					<g class="nums">
						{#each visible as i (i)}
							{@const p = cellPos(L, i)}
							<text x={p.x + CELL / 2} y={p.y + (level >= 3 ? 3.4 : CELL / 2 + 1.5)} class:dim={!hiSet.has(i) && mode === 'example'}>{i - p.block.start + 1}</text>
							{#if level >= 3 && core}
								<text class="sd" x={p.x + 0.6} y={p.y + 7.6}>{(core.get(numberOf(i))?.s ?? '').slice(0, 9)}</text>
							{/if}
						{/each}
					</g>
				{/if}
			</g>
		</svg>

		<!-- HTML labels in screen space -->
		<div class="labels" aria-hidden="true">
			{#each adhyayas as ad (ad.a)}
				{@const colX = L.colX[ad.a - 1]}
				<div class="alabel" style="left: {sx(colX)}px; top: {sy(10)}px; width: {COL_W * view.k}px; --fs: {Math.max(10, Math.min(15, 13 * view.k * 1.4))}px">
					<b>{ad.a}</b>
					{#if COL_W * view.k > 74}<span>{ad.title}</span>{/if}
				</div>
				{#if level >= 1}
					{#each ad.padas as pd (pd.p)}
						{@const b = L.blocks[(ad.a - 1) * 4 + pd.p - 1]}
						{@const top = sy(b.y - PADA_HEAD + 3)}
						{#if top > -60 && top < vh + 10 && sx(b.x) < vw && sx(b.x + COL_W) > 0}
							<div class="plabel" style="left: {sx(b.x)}px; top: {top}px; width: {COL_W * view.k}px; height: {(PADA_HEAD - 5) * view.k}px">
								<b>{ad.a}.{pd.p}</b> {pd.title}
								{#if PADA_HEAD * view.k > 64}<small>{pd.summary}</small>{/if}
							</div>
						{/if}
					{/each}
				{/if}
			{/each}
		</div>

		{#if hint}<div class="hint">Click the map first, or hold Ctrl / ⌘, to zoom with the scroll wheel</div>{/if}

		{#if hover && tipInfo}
			<div class="tip card" style="left: {Math.min(hover.sx + 14, vw - 300)}px; top: {hover.sy + 16 > vh - 190 ? Math.max(4, hover.sy - 196) : hover.sy + 16}px">
				<span class="tn">
					{tipInfo.n}
					<span class="tt" style="color: var(--t-{tipInfo.type})">{TYPE_INFO[tipInfo.type].iast}</span>
					<span class="tb" style="color: var(--b-{tipInfo.band})">{BANDS[tipInfo.band].short}</span>
				</span>
				{#if tipInfo.c}
					<span class="ts deva">{tipInfo.c.s}</span>
					<span class="te">{tipInfo.c.en}</span>
				{:else}
					<span class="muted">loading text…</span>
				{/if}
				<span class="tm">Used in {tipInfo.heat} of {sampleN} sample derivations{#if tipInfo.under.length} · under {tipInfo.under.slice(-2).join('; ')}{/if}</span>
				{#if hover.touch}<a class="open" href={sutraHref(tipInfo.n)}>Open sūtra {tipInfo.n} →</a>{/if}
			</div>
		{/if}
	</div>

	<div class="legend">
		{#if mode === 'band'}
			{#each ['defs', 'case', 'verbal', 'nominal', 'stem', 'pada', 'tri'] as const as b (b)}<span><i style="background: var(--b-{b})"></i>{BANDS[b].short}</span>{/each}
		{:else if mode === 'type'}
			{#each ['V', 'S', 'P', 'AT', 'AD'] as const as t (t)}<span><i style="background: var(--t-{t}); opacity: {t === 'V' ? 0.35 : 1}"></i>{TYPE_INFO[t].en} ({TYPE_INFO[t].iast})</span>{/each}
		{:else if mode === 'heat'}
			<span class="ramp"><i class="r0"></i><i class="r1"></i><i class="r2"></i><i class="r3"></i><i class="r4"></i><i class="r5"></i></span>
			<span>unused → used in up to {heatMax} of the {sampleN} sample derivations the site's build runs through vidyut</span>
		{:else}
			<span><i class="exi"></i>sūtras used by {exampleWord ? 'the derivation of ' + exampleWord : 'the selected example'}; the ring is the current step</span>
		{/if}
		<span class="muted howto">drag to pan · pinch or Ctrl+scroll to zoom · double-click to zoom in · click a cell to open it</span>
	</div>
	<p class="sr-only">This map is a visual overview; every sūtra is also listed on the adhyāya pages.</p>
</div>

<style>
	.map-wrap {
		display: grid;
		gap: 8px;
		min-width: 0;
	}
	.tools {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		justify-content: space-between;
	}
	.modes,
	.zoom {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.modes .btn[aria-checked='true'] {
		background: var(--indigo-soft);
		border-color: var(--indigo);
		color: var(--indigo);
	}
	.zoom .btn {
		min-width: 36px;
		justify-content: center;
	}
	.jump {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		font-size: 13px;
	}
	.jump button {
		min-width: 30px;
		height: 28px;
		border-radius: 7px;
		border: 1px solid var(--line);
		background: var(--surface);
		cursor: pointer;
		font-weight: 600;
		color: var(--ink-2);
	}
	.jump button:hover {
		border-color: var(--saffron);
	}
	.jump .ex {
		font-family: var(--font-deva);
		padding: 0 10px;
		color: var(--saffron-ink);
	}
	.map {
		position: relative;
		height: min(74vh, 720px);
		min-height: 380px;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--surface);
		overflow: hidden;
		touch-action: none;
		cursor: grab;
		user-select: none;
		-webkit-user-select: none;
	}
	.map:active {
		cursor: grabbing;
	}
	.map:focus-visible {
		outline: 2px solid var(--focus);
	}
	svg {
		display: block;
	}
	.blockbg {
		fill: var(--surface-2);
	}
	/* colour modes: classes on cells, switched by the container's mode class */
	.cells :global(rect) {
		fill: var(--surface-3);
	}
	.mode-band .cells :global(rect.b-defs) { fill: var(--b-defs); }
	.mode-band .cells :global(rect.b-case) { fill: var(--b-case); }
	.mode-band .cells :global(rect.b-verbal) { fill: var(--b-verbal); }
	.mode-band .cells :global(rect.b-nominal) { fill: var(--b-nominal); }
	.mode-band .cells :global(rect.b-stem) { fill: var(--b-stem); }
	.mode-band .cells :global(rect.b-pada) { fill: var(--b-pada); }
	.mode-band .cells :global(rect.b-tri) { fill: var(--b-tri); }
	.mode-type .cells :global(rect.t-V) { fill: var(--t-V); fill-opacity: 0.3; }
	.mode-type .cells :global(rect.t-S) { fill: var(--t-S); }
	.mode-type .cells :global(rect.t-P) { fill: var(--t-P); }
	.mode-type .cells :global(rect.t-AD) { fill: var(--t-AD); }
	.mode-type .cells :global(rect.t-AT) { fill: var(--t-AT); }
	.mode-heat .cells :global(rect.h1) { fill: var(--saffron); fill-opacity: 0.25; }
	.mode-heat .cells :global(rect.h2) { fill: var(--saffron); fill-opacity: 0.42; }
	.mode-heat .cells :global(rect.h3) { fill: var(--saffron); fill-opacity: 0.6; }
	.mode-heat .cells :global(rect.h4) { fill: var(--saffron); fill-opacity: 0.8; }
	.mode-heat .cells :global(rect.h5) { fill: var(--r-target); }
	.mode-example .cells :global(rect) { fill-opacity: 0.55; }
	.brackets line {
		stroke: var(--t-AD);
		stroke-width: 1.4;
		opacity: 0.75;
	}
	.brackets circle {
		fill: var(--t-AD);
	}
	.hl rect {
		fill: none;
		stroke: var(--ink);
		stroke-width: 1.3;
	}
	.hl rect.onmode.b-defs { fill: var(--b-defs); }
	.hl rect.onmode.b-case { fill: var(--b-case); }
	.hl rect.onmode.b-verbal { fill: var(--b-verbal); }
	.hl rect.onmode.b-nominal { fill: var(--b-nominal); }
	.hl rect.onmode.b-stem { fill: var(--b-stem); }
	.hl rect.onmode.b-pada { fill: var(--b-pada); }
	.hl rect.onmode.b-tri { fill: var(--b-tri); }
	.hl .cur {
		fill: none;
		stroke: var(--saffron);
		stroke-width: 2.4;
		animation: ring 1.4s ease-in-out infinite;
		transform-box: fill-box;
		transform-origin: center;
	}
	@keyframes ring {
		50% {
			transform: scale(1.35);
			opacity: 0.55;
		}
	}
	.nums text {
		font-family: var(--font-mono);
		font-size: 4.4px;
		text-anchor: middle;
		fill: #fff;
		pointer-events: none;
		paint-order: stroke;
		stroke: rgb(0 0 0 / 0.35);
		stroke-width: 0.5px;
	}
	.lv3 .nums text {
		font-size: 2.8px;
	}
	.mode-example .nums text,
	.mode-heat .nums text {
		fill: var(--ink);
		stroke: none;
	}
	.nums text.dim {
		opacity: 0.4;
	}
	.nums text.sd {
		font-family: var(--font-deva);
		font-size: 1.45px;
		text-anchor: start;
	}
	.labels {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
	}
	.alabel {
		position: absolute;
		display: flex;
		gap: 6px;
		align-items: baseline;
		font-size: var(--fs);
		line-height: 1.15;
		color: var(--ink);
		overflow: hidden;
	}
	.alabel b {
		font-family: var(--font-serif);
		font-size: 1.35em;
		color: var(--saffron-ink);
	}
	.alabel span {
		font-weight: 600;
		color: var(--ink-2);
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}
	.plabel {
		position: absolute;
		font-size: 11.5px;
		line-height: 1.25;
		color: var(--ink-2);
		overflow: hidden;
	}
	.plabel b {
		color: var(--ink);
		font-family: var(--font-mono);
		font-size: 11px;
	}
	.plabel small {
		display: block;
		font-size: 11px;
		color: var(--muted);
	}
	.hint {
		position: absolute;
		left: 50%;
		top: 12px;
		translate: -50% 0;
		padding: 6px 12px;
		border-radius: 999px;
		background: var(--ink);
		color: var(--bg);
		font-size: 13px;
		pointer-events: none;
	}
	.tip {
		position: absolute;
		width: min(290px, calc(100% - 16px));
		padding: 10px 12px;
		display: flex;
		flex-direction: column;
		gap: 3px;
		font-size: 13px;
		line-height: 1.4;
		z-index: 3;
		cursor: auto;
	}
	.tn {
		font-family: var(--font-mono);
		font-weight: 700;
		display: flex;
		gap: 8px;
		align-items: baseline;
	}
	.tt,
	.tb {
		font-family: var(--font-ui);
		font-size: 11.5px;
		font-weight: 600;
	}
	.ts {
		font-size: 16px;
	}
	.te {
		color: var(--ink-2);
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.tm {
		font-size: 11.5px;
		color: var(--muted);
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 14px;
		font-size: 12.5px;
		color: var(--ink-2);
		align-items: center;
	}
	.legend i {
		display: inline-block;
		width: 11px;
		height: 11px;
		border-radius: 3px;
		margin-right: 5px;
		vertical-align: -1px;
	}
	.ramp i {
		margin: 0 !important;
		border-radius: 0 !important;
		background: var(--saffron);
	}
	.ramp .r0 { background: var(--surface-3); }
	.ramp .r1 { opacity: 0.25; }
	.ramp .r2 { opacity: 0.42; }
	.ramp .r3 { opacity: 0.6; }
	.ramp .r4 { opacity: 0.8; }
	.ramp .r5 { background: var(--r-target); }
	.exi {
		border: 1.5px solid var(--ink);
		background: var(--b-stem);
	}
	.howto {
		margin-left: auto;
		font-size: 12px;
	}
	@media (max-width: 600px) {
		.map {
			height: 62vh;
			min-height: 340px;
		}
		.howto {
			margin-left: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.hl .cur {
			animation: none;
		}
	}
</style>
