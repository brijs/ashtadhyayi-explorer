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
	prakriya: () => import('./prakriya/index.ts'),
	dhatus: () => import('./dhatus/index.ts'),
	compression: () => import('./compression/index.ts'),
	metarules: () => import('./metarules/index.ts'),
	grammars: () => import('./grammars/index.ts'),
	ordering: () => import('./ordering/index.ts'),
	'write-a-sutra': () => import('./write-a-sutra/index.ts')
};
