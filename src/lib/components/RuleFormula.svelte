<script lang="ts" module>
	import type { Pada } from '#lib/types.ts';

	/** A rewrite-rule sketch "A → B / C _ D" is shown only where the case roles make it unambiguous. */
	export function formulaParts(pc: Pada[]) {
		const of = (r: string) => pc.filter((p) => p.role === r);
		const target = of('target');
		const subject = of('subject');
		const negated = pc.some((p) => p.w === 'न');
		if (!target.length || !subject.length || negated) return null;
		return { target, subject, left: of('left'), right: of('right'), optional: pc.some((p) => p.w === 'वा' || p.w === 'विभाषा') };
	}
</script>

<script lang="ts">
	import { settings } from '#lib/settings.svelte.ts';

	let { pc }: { pc: Pada[] } = $props();
	const f = $derived(formulaParts(pc));
	const words = (ps: Pada[]) => ps.map((p) => p.w).join(' ');
	const iasts = (ps: Pada[]) => ps.map((p) => p.iast).join(' ');
</script>

{#if f}
	<figure class="formula">
		<figcaption class="eyebrow">As a rewrite rule <span class="muted">(sketch from case endings)</span></figcaption>
		<div class="row" role="img" aria-label="Replace {iasts(f.target)} with {iasts(f.subject)}{f.left.length ? ` after ${iasts(f.left)}` : ''}{f.right.length ? ` before ${iasts(f.right)}` : ''}">
			<span class="tok" style="--c: var(--r-target)"><span class="deva">{words(f.target)}</span>{#if settings.iast}<i>{iasts(f.target)}</i>{/if}</span>
			<span class="op">→</span>
			<span class="tok" style="--c: var(--r-subject)"><span class="deva">{words(f.subject)}</span>{#if settings.iast}<i>{iasts(f.subject)}</i>{/if}</span>
			{#if f.left.length || f.right.length}
				<span class="op">/</span>
				{#if f.left.length}<span class="tok" style="--c: var(--r-left)"><span class="deva">{words(f.left)}</span>{#if settings.iast}<i>{iasts(f.left)}</i>{/if}</span>{/if}
				<span class="slot" aria-hidden="true">＿</span>
				{#if f.right.length}<span class="tok" style="--c: var(--r-right)"><span class="deva">{words(f.right)}</span>{#if settings.iast}<i>{iasts(f.right)}</i>{/if}</span>{/if}
			{/if}
			{#if f.optional}<span class="opt">optional</span>{/if}
		</div>
		<p class="read">
			Replace <b style="color: var(--r-target)">{iasts(f.target)}</b> with <b style="color: var(--r-subject)">{iasts(f.subject)}</b>{#if f.left.length}
				&nbsp;when it comes after <b style="color: var(--r-left)">{iasts(f.left)}</b>{/if}{#if f.right.length}
				&nbsp;when <b style="color: var(--r-right)">{iasts(f.right)}</b> follows{/if}{#if f.optional}, optionally{/if}.
			<span class="muted">Inherited words (anuvṛtti) may add further conditions.</span>
		</p>
	</figure>
{/if}

<style>
	.formula {
		margin: 0;
		padding: 16px 18px;
		border-radius: var(--radius);
		background: var(--surface-2);
		border: 1px dashed var(--line);
	}
	.row {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 10px;
		margin: 8px 0 6px;
		font-size: 22px;
	}
	.tok {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		padding: 0 12px;
		border-radius: 8px;
		background: color-mix(in srgb, var(--c) 12%, transparent);
		color: var(--c);
		border: 1px solid color-mix(in srgb, var(--c) 40%, transparent);
	}
	.tok i {
		font-family: var(--font-serif);
		font-size: 13px;
		line-height: 1.2;
		padding-bottom: 3px;
	}
	.op {
		font-family: var(--font-mono);
		color: var(--muted);
		font-size: 20px;
	}
	.slot {
		color: var(--ink-2);
		font-weight: 700;
	}
	.opt {
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--muted);
		border: 1px solid var(--line);
		border-radius: 999px;
		padding: 0 8px;
	}
	.read {
		margin: 0;
		font-size: 14px;
		color: var(--ink-2);
	}
	.read b {
		font-family: var(--font-serif);
		font-style: italic;
	}
</style>
