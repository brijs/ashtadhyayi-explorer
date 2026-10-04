<script lang="ts">
	import SutraRef from '#lib/components/SutraRef.svelte';
	import State from '../State.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	// parasmaipada endings of 3.4.78, by person (rows) and number (columns)
	const GRID = [
		['तिप्', 'तस्', 'झि'],
		['सिप्', 'थस्', 'थ'],
		['मिप्', 'वस्', 'मस्']
	];
	const ROWS = ['3rd (he/she)', '2nd (you)', '1st (I/we)'];
	const COLS = ['singular', 'dual', 'plural'];
	let done = $state(false);
	let wrong = $state<string | null>(null);
	function pick(r: number, c: number) {
		if (r === 0 && c === 0) {
			done = true;
			react('तिप्: third person singular. 1.3.78 chose these parasmaipada endings for भू; प् is a tag, so ति remains.', 'happy');
			complete();
		} else {
			wrong = GRID[r][c];
			react(`${GRID[r][c]} is ${ROWS[r]}, ${COLS[c]}. We want "he/she is": one person, third.`, 'think');
		}
	}
</script>

<State pieces={done ? ['भू', 'ति'] : ['भू', 'ल्']} fresh={done ? 1 : -1} />
<table>
	<thead><tr><th></th>{#each COLS as c (c)}<th>{c}</th>{/each}</tr></thead>
	<tbody>
		{#each GRID as row, r (r)}
			<tr>
				<th>{ROWS[r]}</th>
				{#each row as e, c (c)}
					<td><button class="deva" class:ok={done && r === 0 && c === 0} class:no={wrong === e} onclick={() => pick(r, c)}>{e}</button></td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>
<p class="muted note">The ending replaces ल् (<SutraRef n="3.4.77" s="लस्य" />, <SutraRef n="3.4.78" />).</p>

<style>
	table {
		border-collapse: separate;
		border-spacing: 6px;
	}
	th {
		font-size: 12px;
		color: var(--muted);
		font-weight: 600;
		text-align: left;
	}
	td button {
		width: 90px;
		height: 50px;
		border-radius: 10px;
		border: 2px solid var(--line);
		background: var(--surface);
		cursor: pointer;
		font-size: 21px;
		color: var(--ink);
	}
	td button.ok {
		border-color: var(--r-subject);
		background: color-mix(in srgb, var(--r-subject) 12%, var(--surface));
	}
	td button.no {
		border-color: var(--r-target);
	}
	.note {
		margin-top: 12px;
		font-size: 14px;
	}
	@media (max-width: 480px) {
		td button {
			width: 66px;
		}
	}
</style>
