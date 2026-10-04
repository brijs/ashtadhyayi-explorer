<script lang="ts">
	import { onMount } from 'svelte';
	import type { Mood, Skin } from './types.ts';

	let {
		skin = 'shishya',
		mood = 'neutral',
		level = 0,
		talking = false,
		progress = 0,
		total = 1,
		panel = '',
		size = 140
	}: {
		skin?: Skin;
		mood?: Mood;
		level?: number;
		talking?: boolean;
		progress?: number;
		total?: number;
		panel?: string;
		size?: number;
	} = $props();

	let blink = $state(false);
	let bow = $state(false);
	let lastProgress = 0;

	onMount(() => {
		let t: ReturnType<typeof setTimeout>;
		const schedule = () => {
			t = setTimeout(() => {
				blink = true;
				setTimeout(() => (blink = false), 140);
				schedule();
			}, 2200 + Math.random() * 3200);
		};
		schedule();
		return () => clearTimeout(t);
	});

	// small bow when a scene is completed
	$effect(() => {
		if (progress > lastProgress) {
			bow = true;
			setTimeout(() => (bow = false), 700);
		}
		lastProgress = progress;
	});

	const mouthRy = $derived(talking ? 1.2 + level * 6 : 0);
	const leaves = $derived(Array.from({ length: Math.min(total, 10) }, (_, i) => i < progress));
	const label = $derived(skin === 'bot' ? 'Sūtra-bot, the guide' : 'The śiṣya, your study partner');
</script>

<svg
	class="guide {skin}"
	class:bow
	class:talking
	viewBox="0 0 120 150"
	width={size}
	height={size * 1.25}
	role="img"
	aria-label="{label} ({mood})">
	<g class="bob">
		{#if skin === 'shishya'}
			<!-- body: saffron uttarīya with sacred thread -->
			<path d="M18 150 C20 116 38 104 60 104 C82 104 100 116 102 150 Z" fill="var(--g-cloth)" />
			<path d="M40 108 L86 150" stroke="var(--g-thread)" stroke-width="2.2" fill="none" />
			<rect x="52" y="92" width="16" height="16" rx="6" fill="var(--g-skin-dark)" />
			<!-- head -->
			<circle cx="60" cy="64" r="32" fill="var(--g-skin)" />
			<!-- ears -->
			<ellipse cx="28.5" cy="68" rx="4.5" ry="7" fill="var(--g-skin-dark)" />
			<ellipse cx="91.5" cy="68" rx="4.5" ry="7" fill="var(--g-skin-dark)" />
			<!-- hair + śikhā -->
			<path d="M29 58 C30 34 46 26 60 26 C76 26 91 34 91 58 C84 46 72 41 60 41 C48 41 36 46 29 58 Z" fill="var(--g-hair)" />
			<path d="M62 27 C66 14 78 12 80 20 C76 18 70 20 66 28 Z" fill="var(--g-hair)" />
			<!-- tilaka -->
			<rect x="58.5" y="44" width="3" height="11" rx="1.5" fill="var(--g-tilak)" />
			<!-- brows -->
			<g class="brows" stroke="var(--g-hair)" stroke-width="2.6" stroke-linecap="round" fill="none">
				{#if mood === 'surprised'}
					<path d="M40 50 Q46 45 52 49" /><path d="M68 49 Q74 45 80 50" />
				{:else if mood === 'think'}
					<path d="M40 54 Q46 52 52 54" /><path d="M68 50 Q74 46 80 51" />
				{:else}
					<path d="M40 53 Q46 50 52 52" /><path d="M68 52 Q74 50 80 53" />
				{/if}
			</g>
			<!-- eyes -->
			<g class="eyes" class:blink fill="var(--g-ink)">
				{#if mood === 'happy' && !talking}
					<path d="M41 63 Q46 57 51 63" stroke="var(--g-ink)" stroke-width="2.6" fill="none" stroke-linecap="round" />
					<path d="M69 63 Q74 57 79 63" stroke="var(--g-ink)" stroke-width="2.6" fill="none" stroke-linecap="round" />
				{:else}
					<ellipse cx="46" cy="62" rx="3.6" ry={mood === 'surprised' ? 5 : 4.2} />
					<ellipse cx="74" cy="62" rx="3.6" ry={mood === 'surprised' ? 5 : 4.2} />
					<circle cx="47.2" cy="60.6" r="1.1" fill="#fff" />
					<circle cx="75.2" cy="60.6" r="1.1" fill="#fff" />
				{/if}
			</g>
			<!-- cheeks -->
			<ellipse cx="40" cy="74" rx="5" ry="3" fill="var(--g-cheek)" opacity="0.55" />
			<ellipse cx="80" cy="74" rx="5" ry="3" fill="var(--g-cheek)" opacity="0.55" />
			<!-- mouth -->
			{#if talking}
				<ellipse cx="60" cy="81" rx="5.5" ry={mouthRy} fill="var(--g-mouth)" />
			{:else if mood === 'happy'}
				<path d="M51 78 Q60 88 69 78" stroke="var(--g-mouth)" stroke-width="2.6" fill="none" stroke-linecap="round" />
			{:else if mood === 'surprised'}
				<ellipse cx="60" cy="81" rx="3.6" ry="4.4" fill="var(--g-mouth)" />
			{:else if mood === 'think'}
				<path d="M54 82 Q60 80 67 79" stroke="var(--g-mouth)" stroke-width="2.4" fill="none" stroke-linecap="round" />
			{:else}
				<path d="M53 79 Q60 84 67 79" stroke="var(--g-mouth)" stroke-width="2.4" fill="none" stroke-linecap="round" />
			{/if}
			<!-- palm-leaf manuscript: one leaf lit per completed scene -->
			<g transform="translate(66 122) rotate(-8)">
				<rect x="0" y="0" width="42" height="14" rx="3" fill="var(--g-leaf)" stroke="var(--g-leaf-edge)" />
				<circle cx="21" cy="7" r="1.6" fill="var(--g-leaf-edge)" />
				{#each leaves as on, i (i)}
					<rect x={3 + i * 3.8} y="10" width="2.6" height="2" rx="0.6" fill={on ? 'var(--g-tilak)' : 'var(--g-leaf-edge)'} opacity={on ? 1 : 0.35} />
				{/each}
			</g>
		{:else}
			<!-- Sūtra-bot -->
			<line x1="60" y1="14" x2="60" y2="28" stroke="var(--b-metal-dark)" stroke-width="3" />
			<circle class="bulb" cx="60" cy="11" r="5.5" fill="var(--b-glow)" />
			<rect x="22" y="26" width="76" height="62" rx="16" fill="var(--b-metal)" stroke="var(--b-metal-dark)" stroke-width="2" />
			<rect x="31" y="35" width="58" height="44" rx="10" fill="var(--b-screen)" />
			<rect x="16" y="48" width="7" height="18" rx="3" fill="var(--b-metal-dark)" />
			<rect x="97" y="48" width="7" height="18" rx="3" fill="var(--b-metal-dark)" />
			<g class="eyes" class:blink fill="var(--b-glow)">
				{#if mood === 'happy' && !talking}
					<path d="M41 55 L46 49 L51 55" stroke="var(--b-glow)" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" />
					<path d="M69 55 L74 49 L79 55" stroke="var(--b-glow)" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" />
				{:else if mood === 'surprised'}
					<circle cx="46" cy="53" r="5" /><circle cx="74" cy="53" r="5" />
				{:else if mood === 'think'}
					<rect x="41" y="50" width="10" height="7" rx="2" /><rect x="69" y="52" width="10" height="3" rx="1.5" />
				{:else}
					<rect x="41" y="48" width="10" height="10" rx="3" /><rect x="69" y="48" width="10" height="10" rx="3" />
				{/if}
			</g>
			{#if talking}
				<rect x={60 - (6 + level * 12)} y={68 - level * 3} width={12 + level * 24} height={3 + level * 6} rx="2" fill="var(--b-glow)" />
			{:else}
				<rect x="52" y="68" width="16" height="3" rx="1.5" fill="var(--b-glow)" opacity="0.8" />
			{/if}
			<!-- body with chest panel -->
			<rect x="44" y="88" width="32" height="8" fill="var(--b-metal-dark)" />
			<rect x="24" y="96" width="72" height="54" rx="12" fill="var(--b-metal)" stroke="var(--b-metal-dark)" stroke-width="2" />
			<rect x="32" y="104" width="56" height="24" rx="5" fill="var(--b-screen)" />
			<text x="60" y="120" text-anchor="middle" class="panel">{panel || '…'}</text>
			<g>
				{#each leaves as on, i (i)}
					<circle cx={40 + i * 4.4} cy="138" r="1.6" fill={on ? 'var(--b-glow)' : 'var(--b-metal-dark)'} />
				{/each}
			</g>
		{/if}
	</g>
</svg>

<style>
	.guide {
		--g-skin: #c98c5c;
		--g-skin-dark: #b0774b;
		--g-hair: #2a1d16;
		--g-ink: #22160f;
		--g-mouth: #7a2f22;
		--g-cheek: #e47a5c;
		--g-cloth: #e08a2c;
		--g-thread: #fff5e6;
		--g-tilak: #d2401f;
		--g-leaf: #e9d39a;
		--g-leaf-edge: #a8894a;
		--b-metal: #d9dcef;
		--b-metal-dark: #8e93b8;
		--b-screen: #1d2140;
		--b-glow: #5fe0c0;
		overflow: visible;
		display: block;
	}
	:global(:root[data-theme='dark']) .guide,
	:global(:root:not([data-theme='light'])) .guide {
		--b-metal: #b9bdd8;
	}
	.panel {
		font-family: var(--font-mono);
		font-size: 9px;
		fill: var(--b-glow);
	}
	.bob {
		animation: bob 3.2s ease-in-out infinite;
		transform-origin: 60px 150px;
		transition: transform 0.3s;
	}
	.bow .bob {
		animation: bow 0.7s ease-in-out;
	}
	.eyes {
		transform-origin: 60px 60px;
		transition: transform 0.06s;
	}
	.eyes.blink {
		transform: scaleY(0.1);
	}
	.talking .bulb {
		animation: pulse 0.5s ease-in-out infinite alternate;
	}
	@keyframes bob {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-3px);
		}
	}
	@keyframes bow {
		40% {
			transform: rotate(-8deg) translateY(4px);
		}
	}
	@keyframes pulse {
		to {
			opacity: 0.45;
		}
	}
</style>
