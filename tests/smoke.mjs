// Browser smoke test: walks the main flows, collects console/page errors, takes screenshots.
// Usage: node tests/smoke.mjs [baseUrl]   (start `npm run preview` first)
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';

// Starts its own `vite preview` on the current build unless a base URL is passed.
let server = null;
let BASE = process.argv[2]?.replace(/\/$/, '');
if (!BASE) {
	BASE = 'http://localhost:4199';
	server = spawn('npx', ['vite', 'preview', '--port', '4199', '--strictPort'], { stdio: 'ignore', detached: true });
	for (let i = 0; i < 50; i++) {
		try { if ((await fetch(BASE + '/')).ok) break; } catch {}
		await new Promise((r) => setTimeout(r, 200));
	}
}
const stopServer = () => { if (server) try { process.kill(-server.pid); } catch {} server = null; };
process.on('exit', stopServer);
const OUT = new URL('../test-results/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const problems = [];
const results = [];

async function run(name, viewport, fn, opts = {}) {
	const ctx = await browser.newContext({ viewport, colorScheme: opts.dark ? 'dark' : 'light', reducedMotion: opts.reduced ? 'reduce' : 'no-preference' });
	const page = await ctx.newPage();
	page.on('pageerror', (e) => problems.push(`[${name}] pageerror: ${e.message}`));
	page.on('console', (m) => { if (m.type() === 'error') problems.push(`[${name}] console: ${m.text()}`); });
	page.on('response', (r) => { if (r.status() >= 400) problems.push(`[${name}] HTTP ${r.status()} ${r.url()}`); });
	try {
		await fn(page);
		const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
		if (overflow > 0) problems.push(`[${name}] horizontal overflow ${overflow}px at ${page.url()}`);
		results.push(`✓ ${name}`);
	} catch (e) {
		problems.push(`[${name}] FAILED: ${e.message.split('\n')[0]}`);
		await page.screenshot({ path: `${OUT}${name}-failure.png` }).catch(() => {});
	}
	await ctx.close();
}

const shot = (page, name) => page.screenshot({ path: `${OUT}${name}.png`, fullPage: false });

for (const [label, viewport] of [['desktop', { width: 1280, height: 800 }], ['mobile', { width: 390, height: 800 }]]) {
	await run(`home-${label}`, viewport, async (page) => {
		await page.goto(`${BASE}/`);
		await page.getByRole('heading', { level: 1 }).waitFor();
		await shot(page, `home-${label}`);
	});

	await run(`search-${label}`, viewport, async (page) => {
		await page.goto(`${BASE}/`);
		await page.waitForLoadState('networkidle');
		await page.keyboard.press('/');
		const input = page.getByRole('combobox', { name: 'Search query' });
		await input.waitFor();
		for (const [q, expect] of [['6.1.77', '6.1.77'], ['61077', '6.1.77'], ['इको यणचि', '6.1.77'], ['iko yaṇaci', '6.1.77'], ['iko yanaci', '6.1.77'], ['semivowel', null], ['vrddhi', null]]) {
			await input.fill(q);
			await page.locator('#search-results li').first().waitFor();
			await page.waitForTimeout(150);
			const first = (await page.locator('#search-results li .num').first().textContent())?.trim();
			const top5 = (await page.locator('#search-results li .num').allTextContents()).slice(0, 5).map((s) => s.trim());
			results.push(`   search "${q}" → ${top5.join(', ')}`);
			if (expect && first !== expect) problems.push(`[search] "${q}" first=${first}, expected ${expect}`);
		}
		await shot(page, `search-${label}`);
		await page.keyboard.press('Enter');
		await page.waitForURL(/\/sutra\//);
	});

	await run(`sutra-${label}`, viewport, async (page) => {
		await page.goto(`${BASE}/sutra/6.1.77/`);
		await page.waitForLoadState('networkidle');
		await shot(page, `sutra-${label}`);
		// term popover (wait for hydration first)
		await page.waitForTimeout(400);
		await page.locator('.chip .trigger').first().click();
		await page.locator('.pop').waitFor();
		await page.waitForTimeout(200);
		await shot(page, `sutra-popover-${label}`);
		await page.keyboard.press('Escape');
		// anuvṛtti on a sūtra that inherits
		await page.goto(`${BASE}/sutra/1.1.12/`);
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(400);
		await page.getByRole('button', { name: /Fill in inherited words/ }).click();
		await page.locator('.w.inherited').first().waitFor();
		await page.waitForTimeout(700);
		await page.locator('.anuvritti').scrollIntoViewIfNeeded();
		await shot(page, `anuvritti-${label}`);
		// commentary tabs + a commentary cross-link (client-side navigation)
		await page.goto(`${BASE}/sutra/6.1.77/`);
		await page.waitForLoadState('networkidle');
		await page.getByRole('tab', { name: /काशिका/ }).click();
		await page.getByRole('tab', { name: /English/ }).click();
		await page.locator('.rich a.sref').first().click();
		await page.waitForURL(/sutra\/6\.1\.101\//);
		await page.keyboard.press('ArrowRight');
		await page.waitForURL(/sutra\/6\.1\.102\//);
	});

	await run(`adhyaya-${label}`, viewport, async (page) => {
		await page.goto(`${BASE}/adhyaya/1/`);
		await page.getByRole('button', { name: 'Definitions' }).click();
		await shot(page, `adhyaya-${label}`);
	});
}

await run('dark-sutra', { width: 1280, height: 800 }, async (page) => {
	await page.goto(`${BASE}/sutra/1.1.1/`);
	await page.waitForLoadState('networkidle');
	await shot(page, 'dark-sutra');
}, { dark: true });

await run('iast-toggle', { width: 1280, height: 800 }, async (page) => {
	await page.goto(`${BASE}/sutra/8.2.1/`);
	await page.waitForLoadState('networkidle');
	await page.getByRole('button', { name: 'Show IAST transliteration' }).click();
	await page.locator('.sutra-iast').waitFor();
	await shot(page, 'iast-sutra');
});

await browser.close();
stopServer();
console.log(results.join('\n'));
if (problems.length) {
	console.log(`\n✗ ${problems.length} problems:\n  ` + [...new Set(problems)].join('\n  '));
	process.exit(1);
}
console.log('\n✓ no problems');
process.exit(0);
