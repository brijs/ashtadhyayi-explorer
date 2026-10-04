import type { Component } from 'svelte';

export type Mood = 'neutral' | 'happy' | 'think' | 'surprised';
export type Skin = 'shishya' | 'bot';

/** Props every scene component receives from the player. */
export type SceneProps<D = any> = {
	/** Show a short reaction line under the caption (after a learner action). */
	react: (text: string, mood?: Mood) => void;
	/** Mark the scene's main interaction as done (pulses Next, lights a leaf). */
	complete: () => void;
	/** Set the guide's chest panel (Sūtra-bot) text. */
	panel: (text: string) => void;
	/** Page data loaded for this explainer (see lib/server/explainer-data.ts). */
	data: D;
	/** Jump to another scene by id. */
	goto: (id: string) => void;
};

export type SceneDef = {
	id: string;
	title: string;
	mood?: Mood;
	component: Component<SceneProps>;
};

export type ExplainerDef = {
	slug: string;
	title: string;
	sa: string;
	guide: Skin;
	/** scene id → caption text (also the narration script) */
	narration: Record<string, string>;
	scenes: SceneDef[];
};
