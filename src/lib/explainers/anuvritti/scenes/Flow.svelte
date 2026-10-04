<script lang="ts">
	import { settings } from '#lib/settings.svelte.ts';
	import { devaToIast } from '#lib/translit.ts';
	import type { SceneProps } from '#lib/explainer/types.ts';

	type S = { n: string; s: string; iast: string; en: string; pc: string[]; ss: string };
	let { react, complete, data }: SceneProps<{ s77: S; s78: S }> = $props();
	let sent = $state(false);

	function send() {
		if (sent) return;
		sent = true;
		setTimeout(() => {
			react(`Full reading: ${data.s78.ss}. "In place of ए ओ ऐ औ, put अय् अव् आय् आव्, when a vowel follows." The Kāśikā's examples: चयनम्, लवनम्, चायकः, लावकः.`, 'happy');
			complete();
		}, 700);
	}
</script>

<div class="stack">
	<div class="card sut">
		<span class="n">{data.s77.n}</span>
		<div class="words">
			{#each data.s77.pc as w (w)}
				{#if w === 'अचि'}
					<button class="w aci" class:gone={sent} onclick={send} aria-label="Send अचि down">
						<span class="deva">{w}</span>{#if settings.iast}<i>{devaToIast(w)}</i>{/if}
					</button>
				{:else}
					<span class="w"><span class="deva">{w}</span>{#if settings.iast}<i>{devaToIast(w)}</i>{/if}</span>
				{/if}
			{/each}
		</div>
	</div>

	<div class="channel" class:flowing={sent} aria-hidden="true">
		<span class="drop deva">अचि</span>
	</div>

	<div class="card sut">
		<span class="n">{data.s78.n}</span>
		<div class="words">
			{#each data.s78.pc as w (w)}
				<span class="w"><span class="deva">{w}</span>{#if settings.iast}<i>{devaToIast(w)}</i>{/if}</span>
			{/each}
			<span class="w inherited" class:arrived={sent}>
				<span class="deva">{sent ? 'अचि' : '?'}</span>
				<i>{sent ? 'from 6.1.77' : 'missing'}</i>
			</span>
		</div>
	</div>
</div>

<style>
	.stack {
		display: flex;
		flex-direction: column;
		max-width: 620px;
	}
	.sut {
		padding: 16px 20px;
	}
	.n {
		font-family: var(--font-mono);
		color: var(--saffron-ink);
		font-size: 13px;
	}
	.words {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 6px;
	}
	.w {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		padding: 4px 14px;
		border-radius: 10px;
		border: 1.5px solid var(--line);
		background: var(--surface);
		font-size: 26px;
		line-height: 1.4;
		color: var(--ink);
	}
	.w i {
		font-family: var(--font-serif);
		font-size: 12px;
		color: var(--muted);
	}
	.aci {
		border-color: var(--indigo);
		background: var(--indigo-soft);
		cursor: pointer;
		font: inherit;
		font-size: 26px;
		animation: glow 1.6s ease-in-out infinite;
	}
	.aci.gone {
		animation: none;
		opacity: 0.55;
		cursor: default;
	}
	@keyframes glow {
		50% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--indigo) 22%, transparent); }
	}
	.channel {
		position: relative;
		height: 70px;
		margin-left: 60px;
		border-left: 3px dashed var(--line);
	}
	.channel.flowing {
		border-left-color: var(--indigo);
	}
	.drop {
		position: absolute;
		left: -26px;
		top: -10px;
		opacity: 0;
		font-size: 22px;
		color: var(--indigo);
		background: var(--indigo-soft);
		padding: 0 8px;
		border-radius: 8px;
	}
	.flowing .drop {
		animation: fall 0.7s ease-in forwards;
	}
	@keyframes fall {
		0% { opacity: 1; top: -10px; }
		100% { opacity: 0; top: 60px; }
	}
	.inherited {
		border-style: dashed;
		color: var(--muted);
	}
	.inherited.arrived {
		border-color: var(--indigo);
		background: var(--indigo-soft);
		color: var(--indigo);
		animation: land 0.4s 0.6s both;
	}
	@keyframes land {
		from { transform: translateY(-10px); opacity: 0.3; }
	}
</style>
