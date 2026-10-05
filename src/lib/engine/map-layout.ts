// Geometry of the structure map: 8 columns (adhyāyas), each split into 4 pāda blocks of sūtra cells in text order.
export const COLS = 14; // cells per row inside a pāda block
export const CELL = 10;
export const PITCH = 12;
export const COL_W = COLS * PITCH - (PITCH - CELL);
export const COL_GAP = 46;
export const TOP = 64; // room for adhyāya headers
export const PADA_HEAD = 40; // room for a pāda label (and, zoomed in, its summary) above each block
export const PADA_GAP = 18;
export const MARGIN = 24;

export type Block = { a: number; p: number; x: number; y: number; rows: number; h: number; start: number; count: number };
export type Layout = { blocks: Block[]; width: number; height: number; colX: number[]; colH: number[] };

/** padaCounts[a-1][p-1] = number of sūtras; `start` = index of the block's first sūtra in text order. */
export function layout(padaCounts: number[][]): Layout {
	const blocks: Block[] = [];
	const colX: number[] = [];
	const colH: number[] = [];
	let start = 0;
	let maxH = 0;
	padaCounts.forEach((pc, ai) => {
		const x = MARGIN + ai * (COL_W + COL_GAP);
		colX.push(x);
		let y = TOP;
		pc.forEach((count, pi) => {
			const rows = Math.ceil(count / COLS);
			const h = rows * PITCH;
			blocks.push({ a: ai + 1, p: pi + 1, x, y: y + PADA_HEAD, rows, h, start, count });
			start += count;
			y += PADA_HEAD + h + PADA_GAP;
		});
		colH.push(y);
		maxH = Math.max(maxH, y);
	});
	return { blocks, width: MARGIN * 2 + 8 * COL_W + 7 * COL_GAP, height: maxH + MARGIN, colX, colH };
}

/** Position of the cell for sūtra number `idx` (text order). */
export function cellPos(L: Layout, idx: number): { x: number; y: number; block: Block } {
	let lo = 0;
	let hi = L.blocks.length - 1;
	while (lo < hi) {
		const mid = (lo + hi + 1) >> 1;
		if (L.blocks[mid].start <= idx) lo = mid;
		else hi = mid - 1;
	}
	const b = L.blocks[lo];
	const k = idx - b.start;
	return { x: b.x + (k % COLS) * PITCH, y: b.y + Math.floor(k / COLS) * PITCH, block: b };
}

/** Sūtra index under a world-space point, or -1. */
export function hitTest(L: Layout, wx: number, wy: number): number {
	for (const b of L.blocks) {
		if (wx < b.x || wx >= b.x + COLS * PITCH || wy < b.y || wy >= b.y + b.h) continue;
		const cx = Math.floor((wx - b.x) / PITCH);
		const cy = Math.floor((wy - b.y) / PITCH);
		if ((wx - b.x) % PITCH > CELL || (wy - b.y) % PITCH > CELL) return -1;
		const k = cy * COLS + cx;
		return k < b.count ? b.start + k : -1;
	}
	return -1;
}
