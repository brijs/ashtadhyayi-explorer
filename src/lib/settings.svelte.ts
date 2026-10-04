// UI preferences only (no user data). Persisted per browser; every storage access is guarded.

type Theme = 'auto' | 'light' | 'dark';

function read(key: string): string | null {
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}
function write(key: string, value: string) {
	try {
		localStorage.setItem(key, value);
	} catch {
		/* private mode or blocked storage: keep in memory */
	}
}

class Settings {
	iast = $state(false);
	theme = $state<Theme>('auto');
	narration = $state(false);

	/** Call once in the browser (root layout onMount). */
	hydrate() {
		this.iast = read('ae.iast') === '1';
		const t = read('ae.theme');
		this.theme = t === 'light' || t === 'dark' ? t : 'auto';
		this.narration = read('ae.narration') === '1';
	}

	setIast(on: boolean) {
		this.iast = on;
		write('ae.iast', on ? '1' : '0');
	}

	setNarration(on: boolean) {
		this.narration = on;
		write('ae.narration', on ? '1' : '0');
	}

	cycleTheme() {
		const order: Theme[] = ['auto', 'light', 'dark'];
		this.theme = order[(order.indexOf(this.theme) + 1) % order.length];
		write('ae.theme', this.theme);
		if (this.theme === 'auto') delete document.documentElement.dataset.theme;
		else document.documentElement.dataset.theme = this.theme;
	}
}

export const settings = new Settings();
