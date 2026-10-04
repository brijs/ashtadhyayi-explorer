import type { ExplainerDef } from '#lib/explainer/types.ts';

// Explainers are code-split: each loads only when its page is visited.
export const EXPLAINER_MODULES: Record<string, () => Promise<{ default: ExplainerDef }>> = {
	'shiva-sutras': () => import('./shiva-sutras/index.ts'),
	anatomy: () => import('./anatomy/index.ts'),
	anuvritti: () => import('./anuvritti/index.ts')
};
