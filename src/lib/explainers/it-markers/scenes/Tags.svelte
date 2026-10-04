<script lang="ts">
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	const PIECES = [
		{ t: 'श्', tag: true, say: 'श् is a tag. It is never pronounced; it tells the grammar that this affix is "śit".' },
		{ t: 'अ', tag: false, say: 'अ is the real sound. This is all you hear in भवति: भव् + अ + ति.' },
		{ t: 'प्', tag: true, say: 'प् is a tag too. It marks the affix as "pit", which affects accent and other rules.' }
	];
	let seen = $state<boolean[]>([false, false, false]);
	function tap(i: number) {
		seen[i] = true;
		react(PIECES[i].say, PIECES[i].tag ? 'think' : 'happy');
		if (seen.every(Boolean)) complete();
	}
</script>

<div class="parcel">
	{#each PIECES as p, i (i)}
		<button class="piece deva" class:tag={seen[i] && p.tag} class:real={seen[i] && !p.tag} onclick={() => tap(i)}>
			{p.t}
			<small>{seen[i] ? (p.tag ? 'tag' : 'sound') : '?'}</small>
		</button>
	{/each}
</div>
<p class="cap">शप् = <b class="deva">अ</b> + two tags. Traditional grammar calls a tag an <i>it</i> or <i>anubandha</i>.</p>

<style>
	.parcel {
		display: flex;
		gap: 14px;
		padding: 26px;
		border-radius: 20px;
		background: var(--surface);
		border: 2px dashed var(--line);
		width: fit-content;
	}
	.piece {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 96px;
		height: 110px;
		justify-content: center;
		border-radius: 16px;
		border: 2px solid var(--line);
		background: var(--surface-2);
		font-size: 48px;
		cursor: pointer;
		color: var(--ink);
		transition: all 0.25s;
	}
	.piece small {
		font-family: var(--font-ui);
		font-size: 12px;
		color: var(--muted);
	}
	.piece.tag {
		border-style: dashed;
		color: var(--muted);
		background: transparent;
		transform: rotate(-6deg);
	}
	.piece.real {
		border-color: var(--r-subject);
		background: color-mix(in srgb, var(--r-subject) 12%, var(--surface));
		color: var(--r-subject);
	}
	.cap {
		margin-top: 18px;
		font-size: 15.5px;
	}
	@media (max-width: 480px) {
		.piece {
			width: 76px;
			height: 92px;
			font-size: 38px;
		}
		.parcel {
			padding: 16px;
			gap: 8px;
		}
	}
</style>
