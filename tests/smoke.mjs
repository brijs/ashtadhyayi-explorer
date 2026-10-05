// Browser smoke test: walks the main flows, collects console/page errors, takes screenshots.
// Usage: node tests/smoke.mjs [baseUrl]   (start `npm run preview` first)
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';

// Starts its own `vite preview` on the current build unless a base URL is passed.
let server = null;
let BASE = process.argv[2]?.replace(/\/$/, '');
if (!BASE) {
	// honours BASE_PATH (e.g. /ashtadhyayi-explorer) so the Pages build can be tested as deployed
	BASE = 'http://localhost:4199' + (process.env.BASE_PATH ?? '');
	server = spawn('npx', ['vite', 'preview', '--port', '4199', '--strictPort'], { stdio: 'ignore', detached: true, env: process.env });
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
		// 1.4.103 used to crash here: the upstream data repeats an inherited word (duplicate each-key)
		await page.goto(`${BASE}/sutra/1.4.103/`);
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(400);
		await page.getByRole('button', { name: /Fill in inherited words/ }).click();
		await page.locator('.w.inherited').first().waitFor();
		// term popover opens on hover too
		await page.goto(`${BASE}/sutra/6.1.77/`);
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(400);
		await page.locator('.chip .trigger').first().hover();
		await page.locator('.pop').waitFor();
		await page.mouse.move(0, 0);
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

// Explainers: walk every scene, exercise one interaction, screenshot some.
const SHOTS = { 'shiva-sutras': ['rule', 'iko-yanaci'], anatomy: ['operators', 'run', 'nearest'], anuvritti: ['flow', 'headings', 'assemble'], 'rewrite-rules': ['machine', 'tests', 'order', 'automaton'], 'it-markers': ['detect', 'effects', 'flags'], 'nearest-substitute': ['map', 'union', 'effort'], 'sutra-types': ['verse', 'sort', 'counts', 'niyama'], conflict: ['clash', 'apavada', 'ladder'], asiddha: ['split', 'rajabhih', 'passes'], prakriya: ['ending', 'sandhi', 'review'], compression: ['ranges', 'bitsets', 'optimal', 'zero'], metarules: ['parse', 'where', 'loop'], grammars: ['bnf', 'karaka', 'limits'], ordering: ['css', 'elsewhere', 'counterfeeding'], 'write-a-sutra': ['yan', 'jas', 'sandbox'] };
const SECTION = { 'rewrite-rules': 'cs', compression: 'cs', metarules: 'cs', grammars: 'cs', ordering: 'cs', 'write-a-sutra': 'cs' };
for (const [label, viewport] of [['desktop', { width: 1280, height: 800 }], ['mobile', { width: 390, height: 800 }]]) {
	for (const slug of Object.keys(SHOTS)) {
		await run(`learn-${slug}-${label}`, viewport, async (page) => {
			await page.goto(`${BASE}/${SECTION[slug] ?? 'learn'}/${slug}/`);
			await page.waitForLoadState('networkidle');
			await page.waitForTimeout(400);
			const total = await page.locator('.dots li').count();
			for (let i = 0; i < total; i++) {
				const id = (await page.evaluate(() => location.hash.slice(1))) || '';
				await exercise(page, slug, id);
				if (label === 'desktop' && SHOTS[slug].includes(id)) await shot(page, `learn-${slug}-${id}`);
				if (label === 'mobile' && i === 1) await shot(page, `learn-${slug}-mobile`);
				const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
				if (overflow > 0) problems.push(`[learn-${slug}-${label}] overflow ${overflow}px on scene ${id}`);
				if (i < total - 1) {
					await page.getByRole('button', { name: 'Next →' }).click();
					await page.waitForTimeout(250);
				}
			}
			const done = await page.locator('.dots button.done').count();
			results.push(`   ${slug}: ${done}/${total} scenes completed by the walkthrough`);
		});
	}
}

async function exercise(page, slug, id) {
	const scene = page.locator('.scene');
	const click = async (loc) => { if (await loc.count()) await loc.first().click(); };
	if (slug === 'shiva-sutras') {
		if (id === 'welcome') await click(scene.locator('button.num'));
		if (id === 'order') await click(scene.getByRole('button', { name: 'Colour by sound type' }));
		if (id === 'markers') await click(scene.getByRole('button', { name: 'Lift all' }));
		if (id === 'rule') { await scene.locator('button.slot').nth(0).click(); await scene.getByRole('button', { name: 'marker c' }).click(); await page.waitForTimeout(1800); }
		if (id === 'play') { for (const nm of ['यण्', 'हल्', 'झल्']) await scene.getByRole('button', { name: nm, exact: true }).click(); }
		if (id === 'iko-yanaci') { for (let k = 0; k < 4; k++) await scene.locator('button.cell').nth(k).click(); }
	}
	if (slug === 'anatomy') {
		if (id === 'split') await click(scene.locator('button.sutra'));
		if (id === 'cases') { for (let k = 0; k < 3; k++) await scene.locator('button.w').nth(k).click(); }
		if (id === 'operators') { for (const [w, sl] of [[0, 0], [1, 1], [2, 2]]) { await scene.locator('button.word').nth(w).click(); await scene.locator('button.slot').nth(sl).click(); } }
		if (id === 'direction') { await scene.locator('.switch button').nth(1).click(); await scene.locator('.switch button').nth(0).click(); }
		if (id === 'run') {
			// play pauses on the firing step; check the before/after view, then step and jump to the end
			await scene.getByRole('button', { name: 'Play' }).click();
			await scene.locator('.change').waitFor({ timeout: 10000 });
			if ((await scene.locator('.t.was').count()) < 1) problems.push('[anatomy/run] firing step does not mark the changed sound');
			await scene.getByRole('button', { name: 'Step back' }).click();
			await scene.getByRole('button', { name: 'Step forward' }).click();
			await scene.getByRole('button', { name: 'Jump to end' }).click();
			await scene.locator('.examples button').nth(4).click();
			await scene.getByRole('button', { name: 'Jump to end' }).click();
		}
		if (id === 'nearest') { for (const [v, y] of [[0, 1], [0, 3], [0, 2], [0, 0]]) { await scene.locator('.col').nth(0).locator('button:not([disabled])').nth(v).click(); await scene.locator('.col').nth(1).locator('button').nth(y).click(); } }
	}
	if (slug === 'anuvritti') {
		if (id === 'gap') await click(scene.getByRole('button', { name: 'When does this apply?' }));
		if (id === 'flow') { await scene.getByRole('button', { name: 'Send अचि down' }).click(); await page.waitForTimeout(900); }
		if (id === 'river') { for (const k of [5, 6, 20]) await scene.locator('.river button').nth(k).click(); }
		if (id === 'headings') { for (const k of [2, 7]) await scene.locator('button.h').nth(k).click(); await page.waitForTimeout(700); }
		if (id === 'assemble') { await scene.getByRole('button', { name: /Add/ }).click(); await scene.getByRole('button', { name: /Add/ }).click(); await page.waitForTimeout(600); }
		if (id === 'code') await scene.getByRole('button', { name: 'As pseudocode' }).click();
	}
	if (slug === 'rewrite-rules') {
		if (id === 'machine') { for (let k = 0; k < 12; k++) { const b = scene.getByRole('button', { name: /Fire next rule/ }); if (await b.isDisabled()) break; await b.click(); } }
		if (id === 'notation') { for (let k = 0; k < 3; k++) await scene.locator('button.flip').nth(k).click(); }
		if (id === 'engine') { await scene.getByRole('button', { name: 'Run' }).click(); await scene.locator('.ex button').nth(5).click(); }
		if (id === 'tests') { await scene.locator('.tg input').first().click(); await scene.locator('.tg input').first().click(); await scene.locator('.tg input').first().click(); }
		if (id === 'order') { await scene.getByRole('button', { name: 'Move 6.1.77 up' }).click(); await scene.getByRole('button', { name: 'Move 6.1.77 up' }).click(); await scene.getByRole('button', { name: 'Move 6.1.77 up' }).click(); }
		if (id === 'automaton') { for (let k = 0; k < 10; k++) { const b = scene.getByRole('button', { name: /Step/ }); if (await b.isDisabled()) break; await b.click(); } }
	}
	if (slug === 'it-markers') {
		if (id === 'tags') { for (let k = 0; k < 3; k++) await scene.locator('.piece').nth(k).click(); }
		if (id === 'detect') { for (const k of [1, 4, 6, 7]) await scene.locator('.list button').nth(k).click(); }
		if (id === 'strip') await scene.locator('.btn').first().click();
		if (id === 'effects') { for (let k = 0; k < 3; k++) await scene.locator('.aff').nth(k).click(); }
		if (id === 'flags') { for (let k = 0; k < 3; k++) await scene.locator('.b').nth(k).click(); }
	}
	if (slug === 'nearest-substitute') {
		if (id === 'choice') await scene.locator('.opt').nth(1).click();
		if (id === 'map') { for (let k = 0; k < 3; k++) await scene.locator('.pl').nth(k).click(); }
		if (id === 'guna') { for (const [v, g] of [[0, 1], [1, 2], [2, 0]]) { await scene.locator('.vw').nth(v).click(); await scene.locator('.g').nth(g).click(); } }
		if (id === 'union') { for (let k = 0; k < 3; k++) await scene.locator('.pairs button').nth(k).click(); }
		if (id === 'effort') { await scene.getByRole('button', { name: 'Apply' }).click(); await scene.locator('.cand').nth(3).click(); }
	}
	if (slug === 'sutra-types') {
		if (id === 'verse') { for (let k = 0; k < 4; k++) await scene.locator('.verse button').nth(k).click(); }
		if (id === 'sort') { for (let k = 0; k < 6; k++) { await scene.locator('.c').first().click(); await scene.locator('.bin').nth(k).click(); } }
		if (id === 'counts') { for (let k = 0; k < 2; k++) await scene.locator('.row').nth(k).click(); }
		if (id === 'niyama') await scene.locator('.tabs button').nth(1).click();
	}
	if (slug === 'conflict') {
		if (id === 'clash') { for (let k = 0; k < 2; k++) await scene.locator('.rule .btn').nth(k).click(); }
		if (id === 'later') await scene.locator('.tabs button').nth(1).click();
		if (id === 'apavada') { await scene.locator('.dot').nth(2).click(); await scene.locator('.dot').nth(0).click(); }
		if (id === 'ladder') { for (const t of ['later', 'always-applicable', 'inner', 'exception']) await scene.locator('.chip', { hasText: t }).click(); }
	}
	if (slug === 'asiddha') {
		if (id === 'split') await scene.locator('.bar').click();
		if (id === 'rajabhih') { await scene.getByRole('button', { name: 'Pretend it can' }).click(); await scene.getByRole('button', { name: /Apply 8.2.1/ }).click(); }
		if (id === 'order') { await scene.getByRole('button', { name: 'Run reversed' }).click(); await scene.getByRole('button', { name: 'Run in this order' }).click(); }
		if (id === 'passes') { for (let k = 0; k < 4; k++) await scene.getByRole('button', { name: /Run next pass/ }).click(); }
	}
	if (slug === 'prakriya') {
		if (id === 'root') await scene.locator('.entry').click();
		if (id === 'tense' || id === 'guna' || id === 'sandhi') await scene.locator('.o').nth(1).click();
		if (id === 'ending') await scene.locator('td button').first().click();
		if (id === 'vikarana') { await scene.locator('.btn').click(); await scene.locator('.btn').click(); }
	}
	if (slug === 'compression') {
		if (id === 'maxim') await scene.locator('.cmp').click();
		if (id === 'ranges') { await scene.locator('.ctl .deva').nth(0).click(); await scene.locator('.ctl .deva').nth(2).click(); }
		if (id === 'bitsets') { await scene.locator('.bits th button').nth(1).click(); await scene.locator('.bits th button').nth(12).click(); }
		if (id === 'optimal') { await scene.getByRole('button', { name: 'ha', exact: true }).nth(0).click(); await scene.getByRole('button', { name: 'ha', exact: true }).nth(1).click(); }
		if (id === 'zero') { await scene.locator('.sw .btn').click(); await scene.locator('.sw .btn').click(); }
	}
	if (slug === 'metarules') {
		if (id === 'parse') { await scene.locator('.picks button').nth(1).click(); await scene.locator('.picks button').nth(2).click(); }
		if (id === 'where') { await scene.getByRole('button', { name: 'only the last letter' }).click(); await scene.getByRole('button', { name: 'the whole thing' }).click(); }
		if (id === 'inherit') { await scene.locator('.out .btn').click(); await scene.locator('.out .btn').click(); }
		if (id === 'zip') { const SH = [2, 0, 3, 1]; for (let i = 0; i < 4; i++) { await scene.locator('.col').nth(0).locator('.t').nth(i).click(); await scene.locator('.col').nth(1).locator('.t').nth(SH.indexOf(i)).click(); } }
		if (id === 'loop') { for (let k = 0; k < 40; k++) { const b = scene.getByRole('button', { name: /Step/ }); if (await b.isDisabled()) break; await b.click(); } }
	}
	if (slug === 'grammars') {
		if (id === 'bnf') { for (let k = 0; k < 6; k++) { const b = scene.locator('.alts .btn').first(); if (!(await b.count())) break; await b.click(); } }
		if (id === 'ingerman') { for (let k = 0; k < 3; k++) await scene.locator('button.c').nth(k).click(); }
		if (id === 'tree') await scene.locator('.tabs button').nth(1).click();
		if (id === 'karaka') { for (let k = 0; k < 3; k++) { await scene.locator('.p').nth(k).click(); await scene.locator('.r').nth(k).click(); } await scene.locator('.sent .btn').click(); await scene.locator('.sent .btn').click(); }
		if (id === 'limits') { const F = [true, false, true, false, true, false]; for (let k = 0; k < F.length; k++) await scene.locator('.claims li').nth(k).getByRole('button', { name: F[k] ? 'fair' : 'unfair', exact: true }).click(); }
	}
	if (slug === 'ordering') {
		if (id === 'css') { await scene.locator('.btns .btn').nth(0).click(); await scene.locator('.btns .btn').nth(1).click(); }
		if (id === 'elsewhere') { await scene.locator('.res .btn').click(); await scene.locator('.res .btn').click(); }
		if (id === 'interactions') { const K = ['feeding', 'feeding', 'bleeding']; for (let k = 0; k < 3; k++) await scene.locator('.pairs li').nth(k).getByRole('button', { name: K[k], exact: true }).click(); }
		if (id === 'counterfeeding') { await scene.locator('.btn').last().click(); await scene.locator('.btn').last().click(); }
	}
	if (slug === 'write-a-sutra') {
		const sel = (i) => scene.locator('.slots select').nth(i);
		if (id === 'intro') { await sel(0).selectOption('इक्'); await sel(1).selectOption('यण्'); await sel(3).selectOption('अच्'); }
		if (id === 'yan') { await sel(0).selectOption('इक्'); await sel(1).selectOption('यण्'); await sel(3).selectOption('अच्'); }
		if (id === 'jas') { await sel(0).selectOption('झल्'); await sel(1).selectOption('जश्'); await sel(3).selectOption('END'); }
		if (id === 'sandbox') { await sel(0).selectOption('इक्'); await sel(1).selectOption('अक्'); await sel(3).selectOption('अच्'); }
	}
	if (id === 'quiz' || id === 'reflect' || (slug === 'prakriya' && id === 'review')) {
		for (let q = 0; q < 6; q++) {
			if (!(await scene.locator('.opt').count())) break;
			await scene.locator('.opt').first().click();
			const nb = scene.getByRole('button', { name: /Next question|See result/ });
			const last = /See result/.test((await nb.textContent()) ?? '');
			await nb.click();
			if (last) break;
		}
	}
}

await run('narration', { width: 1280, height: 800 }, async (page) => {
	await page.goto(`${BASE}/learn/shiva-sutras/`);
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(400);
	await page.getByRole('button', { name: /Narration/ }).click();
	await page.waitForTimeout(1500);
	const talking = await page.locator('svg.guide.talking').count();
	const lit = await page.locator('.caption span.lit').count();
	results.push(`   narration: guide talking=${talking > 0}, caption words lit=${lit}`);
	if (!talking || !lit) problems.push('[narration] audio did not start (no talking guide / lit caption)');
	await page.getByRole('button', { name: 'Next →' }).click();
	await page.waitForTimeout(1200);
	const lit2 = await page.locator('.caption span.lit').count();
	if (!lit2) problems.push('[narration] did not continue on the next scene');
	await shot(page, 'narration');
});

for (const [label, viewport] of [['desktop', { width: 1280, height: 800 }], ['mobile', { width: 390, height: 800 }]]) {
	await run(`prakriya-${label}`, viewport, async (page) => {
		await page.goto(`${BASE}/tools/prakriya/`);
		await page.locator('.title h2').waitFor({ timeout: 15000 });
		const h = (await page.locator('.title h2').textContent())?.trim();
		if (h !== 'भवति') problems.push(`[prakriya] default form ${h}, expected भवति`);
		const cells = (await page.locator('.paradigm .cell').allTextContents()).map((c) => c.trim());
		results.push(`   भू लट् paradigm: ${cells.join(' ')}`);
		const want = ['भवति', 'भवतः', 'भवन्ति', 'भवसि', 'भवथः', 'भवथ', 'भवामि', 'भवावः', 'भवामः'];
		if (cells.join() !== want.join()) problems.push(`[prakriya] paradigm ${cells.join(' ')}`);
		await page.locator('body').click({ position: { x: 5, y: 300 } });
		for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
		const step = await page.locator('.stepno').textContent();
		if (!step?.startsWith('Step 6')) problems.push(`[prakriya] arrow keys gave ${step}`);
		// every Aṣṭādhyāyī step should link to its sūtra page
		const codes = await page.locator('.steps .c').allTextContents();
		results.push(`   भवति: ${codes.length} steps: ${codes.join(' ')}`);
		await shot(page, `prakriya-${label}`);
		await page.goto(`${BASE}/tools/prakriya/#s=nadI,Stri,Prathama,Eka,nyap`);
		await page.waitForTimeout(300);
		await page.reload();
		await page.locator('.title h2').waitFor({ timeout: 15000 });
		const n = (await page.locator('.title h2').textContent())?.trim();
		if (n !== 'नदी') problems.push(`[prakriya] नदी deep link gave ${n}`);
	});
}

await run('sutra-to-derivation', { width: 1280, height: 800 }, async (page) => {
	await page.goto(`${BASE}/sutra/6.1.78/`);
	await page.waitForLoadState('networkidle');
	const first = page.locator('.derivs a').first();
	const w = (await first.locator('.w').textContent())?.trim();
	await first.click();
	await page.waitForURL(/tools\/prakriya/);
	await page.locator('.title h2').waitFor({ timeout: 15000 });
	const h = (await page.locator('.title h2').textContent())?.trim();
	const codes = await page.locator('.steps .c').allTextContents();
	results.push(`   6.1.78 → ${w} → debugger shows ${h}, 6.1.78 among steps: ${codes.includes('6.1.78')}`);
	if (h !== w || !codes.includes('6.1.78')) problems.push(`[sutra-to-derivation] ${w} → ${h}`);
});

await run('tool-pratyahara', { width: 1280, height: 800 }, async (page) => {
	await page.goto(`${BASE}/tools/pratyahara/#${encodeURIComponent('यण्')}`);
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(300);
	const nm = await page.locator('.result .nm').textContent();
	if (nm?.trim() !== 'यण्') problems.push(`[tool-pratyahara] hash selection gave ${nm}`);
	await page.locator('.probe button').nth(1).click();
	await shot(page, 'tool-pratyahara');
});

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
