import type { ExplainerDef } from '#lib/explainer/types.ts';

// Explainers are code-split: each loads only when its page is visited.
export const EXPLAINER_MODULES: Record<string, () => Promise<{ default: ExplainerDef }>> = {
	'shiva-sutras': () => import('./shiva-sutras/index.ts'),
	anatomy: () => import('./anatomy/index.ts'),
	anuvritti: () => import('./anuvritti/index.ts'),
	'rewrite-rules': () => import('./rewrite-rules/index.ts'),
	'it-markers': () => import('./it-markers/index.ts'),
	'nearest-substitute': () => import('./nearest-substitute/index.ts'),
	'sutra-types': () => import('./sutra-types/index.ts'),
	conflict: () => import('./conflict/index.ts'),
	asiddha: () => import('./asiddha/index.ts'),
	prakriya: () => import('./prakriya/index.ts')
};
