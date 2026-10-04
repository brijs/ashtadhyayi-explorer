import { resolve } from '$app/paths';

// Every page is prerendered as a directory (trailingSlash: 'always'); link to the slash form directly.
export const sutraHref = (n: string) => resolve('/sutra/[n]', { n }) + '/';
export const adhyayaHref = (a: number | string, p?: number | string) =>
	resolve('/adhyaya/[a]', { a: String(a) }) + '/' + (p ? `#pada-${p}` : '');
/** "61077" → "6.1.77" */
export const apnFromId = (id: string) => `${id[0]}.${id[1]}.${+id.slice(2)}`;

/** Commentary HTML from build-data uses an @@BASE@@ placeholder for sūtra links. */
export function withBase(html: string): string {
	const root = resolve('/');
	return html.replaceAll('@@BASE@@/', root.endsWith('/') ? root : root + '/');
}
