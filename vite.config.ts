import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// GitHub Pages serves the site from /ashtadhyayi-explorer; dev and local preview use the root.
const base = (process.env.BASE_PATH ?? '') as '' | `/${string}`;

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({ fallback: '404.html' }),
			paths: { base },
			prerender: {
				concurrency: 8,
				handleHttpError: 'fail',
				handleMissingId: 'warn'
			}
		})
	]
});
