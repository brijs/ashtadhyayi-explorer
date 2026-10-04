<script lang="ts">
	import { SHIVA_FLAT, rangeSlots, splitPratyaharaName } from '#lib/varna.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete, panel }: SceneProps = $props();
	const LETTERS = SHIVA_FLAT.map((s, i) => ({ ...s, i })).filter((s) => !s.isIt);
	const NAMES = ['अच्', 'हल्', 'इक्', 'यण्', 'एच्', 'झल्', 'जश्', 'शर्'];
	const rows = NAMES.map((nm) => {
		const [first, it] = splitPratyaharaName(nm)!;
		const s = SHIVA_FLAT.findIndex((x) => !x.isIt && x.varna === first);
		const e = SHIVA_FLAT.findIndex((x, i) => i > s && x.isIt && x.varna === it);
		const set = new Set(rangeSlots(s, e));
		return { nm, bits: LETTERS.map((l) => (set.has(l.i) ? 1 : 0)) };
	});
	let col = $state<number | null>(null);
	let picks = 0;
	const show = (v: string) => (v.length > 1 ? v[0] : v);
	function pick(k: number) {
		col = k;
		picks++;
		const v = show(LETTERS[k].varna);
		const inn = rows.filter((r) => r.bits[k]).map((r) => r.nm);
		panel(`bit ${k}`);
		react(`${v} is bit ${k}. It is in ${inn.length ? inn.join(', ') : 'none of these'}: (mask >> ${k}) & 1 is 1 for those rows.`, 'happy');
		if (picks >= 2) complete();
	}
</script>

<div class="wrap-x">
	<table class="bits">
		<thead>
			<tr>
				<th></th>
				{#each LETTERS as l, k (k)}<th><button class="deva" class:on={col === k} onclick={() => pick(k)}>{show(l.varna)}</button></th>{/each}
			</tr>
		</thead>
		<tbody>
			{#each rows as r (r.nm)}
				<tr>
					<th class="deva nm">{r.nm}</th>
					{#each r.bits as b, k (k)}<td class:one={b} class:col={col === k}>{b}</td>{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
<pre class="code"><span class="k">const</span> inClass = (mask, i) =&gt; ((mask &gt;&gt; i) &amp; <span class="s">1</span>) === <span class="s">1</span>;  <span class="c">// one machine instruction-ish</span>
<span class="k">const</span> IK  = <span class="s">0b{rows[2].bits.slice().reverse().join('')}</span>;</pre>
<p class="muted note">43 slots fit in a 64-bit word. ह appears twice in the list, so here it has two bits; a real implementation would merge them.</p>

<style>
	.wrap-x {
		overflow-x: auto;
		max-width: 100%;
	}
	.bits {
		border-collapse: collapse;
		font-family: var(--font-mono);
		font-size: 12px;
	}
	.bits th button {
		width: 22px;
		padding: 2px 0;
		border: none;
		border-radius: 4px;
		background: none;
		cursor: pointer;
		color: var(--ink);
		font-size: 14px;
	}
	.bits th button.on {
		background: var(--saffron);
		color: #fff;
	}
	.nm {
		font-size: 15px;
		padding-right: 8px;
		text-align: right;
		white-space: nowrap;
	}
	td {
		width: 22px;
		text-align: center;
		color: var(--line);
	}
	td.one {
		color: var(--indigo);
		font-weight: 700;
	}
	td.col {
		background: var(--saffron-soft);
	}
	td.one.col {
		background: var(--saffron);
		color: #fff;
	}
	.code {
		margin: 14px 0 0;
		padding: 12px 16px;
		border-radius: 10px;
		background: #1d2140;
		color: #e6e8ff;
		font-family: var(--font-mono);
		font-size: 12.5px;
		overflow-x: auto;
	}
	.k { color: #5fe0c0; }
	.s { color: #f6bb79; }
	.c { color: #8b90b8; }
	.note {
		margin-top: 10px;
		font-size: 13.5px;
	}
</style>
