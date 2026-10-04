<script lang="ts">
	import { RULES, rewrite, TESTS, type RuleId } from '#lib/rewrite.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete, panel }: SceneProps = $props();
	let enabled = $state(new Set<RuleId>(RULES.map((r) => r.id)));
	let toggles = 0;
	const rows = $derived(TESTS.map((t) => ({ ...t, got: rewrite(t.a, t.b, enabled).result })));
	const passing = $derived(rows.filter((r) => r.got === r.want).length);

	function toggle(id: RuleId) {
		const s = new Set(enabled);
		if (s.has(id)) s.delete(id);
		else s.add(id);
		enabled = s;
		toggles++;
		const failing = TESTS.map((t) => ({ t, ok: rewrite(t.a, t.b, s).result === t.want })).filter((x) => !x.ok).length;
		panel(`${TESTS.length - failing}/${TESTS.length} pass`);
		if (!s.has(id)) react(`Without ${id}, ${failing} test${failing === 1 ? '' : 's'} fail. Look at what the engine produces instead.`, 'surprised');
		else react(failing ? `${failing} still failing.` : 'All green again.', failing ? 'think' : 'happy');
		if (toggles >= 2) complete();
	}
</script>

<div class="toggles" role="group" aria-label="Rules">
	{#each RULES as r (r.id)}
		<label class="tg" class:off={!enabled.has(r.id)}>
			<input type="checkbox" checked={enabled.has(r.id)} onchange={() => toggle(r.id)} />
			<span class="id">{r.id}</span> <span class="deva">{r.sutra}</span>
		</label>
	{/each}
</div>

<p class="score" class:bad={passing < TESTS.length}>{passing} / {TESTS.length} tests pass</p>

<table>
	<thead><tr><th>input</th><th>expected</th><th>engine</th><th></th></tr></thead>
	<tbody>
		{#each rows as r, i (i)}
			<tr class:fail={r.got !== r.want}>
				<td class="deva">{r.a} + {r.b}</td>
				<td class="deva">{r.want}</td>
				<td class="deva">{r.got}</td>
				<td class="st">{r.got === r.want ? '✓' : '✗'}</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	.toggles {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.tg {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 5px 12px;
		border-radius: 999px;
		border: 1.5px solid var(--r-subject);
		background: color-mix(in srgb, var(--r-subject) 10%, var(--surface));
		cursor: pointer;
		font-size: 14px;
	}
	.tg.off {
		border-color: var(--line);
		background: var(--surface);
		opacity: 0.7;
		text-decoration: line-through;
	}
	.tg input {
		accent-color: var(--r-subject);
	}
	.id {
		font-family: var(--font-mono);
		font-size: 12.5px;
	}
	.score {
		font-weight: 700;
		color: var(--r-subject);
		margin: 14px 0 8px;
	}
	.score.bad {
		color: var(--r-target);
	}
	table {
		border-collapse: collapse;
		width: 100%;
		max-width: 640px;
		font-size: 16px;
	}
	th {
		text-align: left;
		font-size: 12px;
		color: var(--muted);
		font-weight: 600;
		padding: 4px 8px;
	}
	td {
		padding: 4px 8px;
		border-top: 1px solid var(--line);
	}
	tr.fail td {
		background: color-mix(in srgb, var(--r-target) 8%, transparent);
	}
	tr.fail td:nth-child(3) {
		color: var(--r-target);
		font-weight: 600;
	}
	.st {
		font-weight: 700;
		color: var(--r-subject);
	}
	tr.fail .st {
		color: var(--r-target);
	}
</style>
