// The "word factory": a three.js assembly line with one station per adhyāya. Loaded only on /engine, client-side.
// A token rides a conveyor and hops to whichever station's rule fires at the current derivation step (so it
// jumps back and forth: Adhyāya 1's it-deletion fires again and again). Station 8 sits behind one-way glass:
// the Tripādī (8.2.1 pūrvatrāsiddham) sees the earlier stations' output, but they cannot see its work.
// Text is drawn in a DOM overlay (Devanagari shaping is reliable there), positioned from projected 3D points.
import {
	AmbientLight,
	BoxGeometry,
	CapsuleGeometry,
	Color,
	ConeGeometry,
	CylinderGeometry,
	DirectionalLight,
	Group,
	HemisphereLight,
	InstancedMesh,
	Material,
	Mesh,
	MeshStandardMaterial,
	Object3D,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	Vector3,
	WebGLRenderer
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type FactoryStep = { a: number; code: string; form: string; source: string; band: string };
export type FactoryOptions = {
	canvas: HTMLCanvasElement;
	overlay: HTMLElement;
	reducedMotion: boolean;
	stations: { a: number; label: string; band: string }[];
	inputLabel: string;
};

const SPACING = 2.7;
const stationX = (a: number) => (a - 4.5) * SPACING;
const WAREHOUSE_X = stationX(1) - 3.1;
const BELT_Y = 0.42;
const HEIGHTS = [1.75, 1.15, 1.45, 1.3, 1.3, 1.95, 1.95, 1.35];

function cssVar(name: string, fallback: string) {
	const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
	return v || fallback;
}

export function createFactory(opts: FactoryOptions) {
	const { canvas, overlay, reducedMotion } = opts;
	const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
	const scene = new Scene();
	const camera = new PerspectiveCamera(32, 2, 0.1, 200);
	const target = new Vector3(0, 0.7, -0.4);

	const hemi = new HemisphereLight(0xffffff, 0x444444, 1.4);
	const amb = new AmbientLight(0xffffff, 0.5);
	const sun = new DirectionalLight(0xffffff, 1.6);
	sun.position.set(-6, 12, 9);
	scene.add(hemi, amb, sun);

	const disposables: { dispose(): void }[] = [];
	const mat = (color: string, extra: Partial<{ emissive: string; transparent: boolean; opacity: number; roughness: number; metalness: number }> = {}) => {
		const m = new MeshStandardMaterial({ color: new Color(color), roughness: extra.roughness ?? 0.7, metalness: extra.metalness ?? 0.05, transparent: extra.transparent ?? false, opacity: extra.opacity ?? 1 });
		if (extra.emissive) m.emissive = new Color(extra.emissive);
		disposables.push(m);
		return m;
	};
	const geo = <T extends { dispose(): void }>(g: T) => (disposables.push(g), g);

	// ---------- floor & belt ----------
	const floorMat = mat('#888888', { roughness: 1 });
	const floor = new Mesh(geo(new PlaneGeometry(40, 12)), floorMat);
	floor.rotation.x = -Math.PI / 2;
	floor.position.set(-1, 0, -0.5);
	scene.add(floor);

	const beltLen = stationX(8) - WAREHOUSE_X + 2.2;
	const beltMid = (stationX(8) + WAREHOUSE_X) / 2 + 0.6;
	const beltMat = mat('#333333', { roughness: 0.9 });
	const belt = new Mesh(geo(new BoxGeometry(beltLen, 0.22, 1.1)), beltMat);
	belt.position.set(beltMid, 0.2, 0);
	scene.add(belt);
	const railMat = mat('#999999', { metalness: 0.6, roughness: 0.4 });
	for (const z of [-0.6, 0.6]) {
		const rail = new Mesh(geo(new BoxGeometry(beltLen, 0.12, 0.08)), railMat);
		rail.position.set(beltMid, 0.34, z);
		scene.add(rail);
	}
	// moving slats on the belt
	const SLATS = 64;
	const slatGap = beltLen / SLATS;
	const slatMat = mat('#555555');
	const slats = new InstancedMesh(geo(new BoxGeometry(0.06, 0.02, 1.0)), slatMat, SLATS);
	scene.add(slats);
	const dummy = new Object3D();
	let beltOffset = 0;
	const placeSlats = () => {
		for (let i = 0; i < SLATS; i++) {
			const x = beltMid - beltLen / 2 + ((i * slatGap + beltOffset) % beltLen);
			dummy.position.set(x, 0.32, 0);
			dummy.updateMatrix();
			slats.setMatrixAt(i, dummy.matrix);
		}
		slats.instanceMatrix.needsUpdate = true;
	};
	placeSlats();

	// ---------- stations ----------
	type Station = { a: number; group: Group; body: MeshStandardMaterial; beam: MeshStandardMaterial; press?: Mesh; pulse: number; label: HTMLElement };
	const stations: Station[] = [];
	for (const st of opts.stations) {
		const g = new Group();
		const x = stationX(st.a);
		g.position.set(x, 0, 0);
		const h = HEIGHTS[st.a - 1];
		const body = mat('#888888', { emissive: '#000000', roughness: 0.55 });
		const machine = new Mesh(geo(new BoxGeometry(1.7, h, 1.2)), body);
		machine.position.set(0, h / 2, -1.45);
		g.add(machine);
		// gantry over the belt
		const beam = mat('#888888', { emissive: '#000000', metalness: 0.3, roughness: 0.4 });
		const postGeo = geo(new BoxGeometry(0.12, 1.55, 0.12));
		for (const z of [-0.75, 0.75]) {
			const post = new Mesh(postGeo, railMat);
			post.position.set(0, 0.78, z);
			g.add(post);
		}
		const cross = new Mesh(geo(new BoxGeometry(0.34, 0.18, 1.7)), beam);
		cross.position.set(0, 1.58, 0);
		g.add(cross);
		let press: Mesh | undefined;
		if (st.a === 6 || st.a === 7) {
			// the big machining stations: a press that comes down on each step
			press = new Mesh(geo(new CylinderGeometry(0.22, 0.22, 0.5, 20)), beam);
			press.position.set(0, 1.25, 0);
			g.add(press);
		} else if (st.a >= 3 && st.a <= 5) {
			// affix hoppers
			const hop = new Mesh(geo(new ConeGeometry(0.36, 0.6, 18)), beam);
			hop.rotation.x = Math.PI;
			hop.position.set(0, 1.25, 0);
			g.add(hop);
		} else if (st.a === 1) {
			// the control room's rulebook: a stack of books on the roof
			const cols = ['#c9670a', '#3a3f9e', '#0d7480', '#8636be', '#59606d'];
			cols.forEach((c, i) => {
				const book = new Mesh(geo(new BoxGeometry(0.9 - i * 0.06, 0.1, 0.62)), mat(c));
				book.position.set(0.05 * (i % 2), h + 0.06 + i * 0.105, -1.45);
				book.rotation.y = (i - 2) * 0.08;
				g.add(book);
			});
			const win = mat('#ffe7a8', { emissive: '#ffcf6a' });
			win.emissiveIntensity = 0.6;
			for (let i = 0; i < 3; i++) {
				const w = new Mesh(geo(new BoxGeometry(0.34, 0.26, 0.02)), win);
				w.position.set(-0.5 + i * 0.5, h * 0.62, -0.84);
				g.add(w);
			}
		} else if (st.a === 2) {
			// compounds & case: two feeders merging into one
			for (const dz of [-0.25, 0.25]) {
				const f = new Mesh(geo(new CylinderGeometry(0.1, 0.1, 0.5, 12)), beam);
				f.position.set(0, 1.3, dz);
				g.add(f);
			}
		} else if (st.a === 8) {
			const nozzle = new Mesh(geo(new CylinderGeometry(0.08, 0.2, 0.42, 16)), beam);
			nozzle.position.set(0, 1.28, 0);
			g.add(nozzle);
		}
		scene.add(g);
		const label = document.createElement('div');
		label.className = 'f-station';
		label.innerHTML = `<b>${st.a}</b><span>${st.label}</span>`;
		overlay.appendChild(label);
		stations.push({ a: st.a, group: g, body, beam, press, pulse: 0, label });
	}

	// ---------- one-way glass before station 8 ----------
	const glassX = (stationX(7) + stationX(8)) / 2;
	const glassMat = mat('#9fd6e8', { transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0.1 });
	glassMat.depthWrite = false;
	const glass = new Mesh(geo(new BoxGeometry(0.06, 2.6, 4.2)), glassMat);
	glass.position.set(glassX, 1.3, -0.5);
	scene.add(glass);
	const frameMat = mat('#6c8a96', { metalness: 0.4 });
	const glassFrame = new Mesh(geo(new BoxGeometry(0.12, 0.12, 4.3)), frameMat);
	glassFrame.position.set(glassX, 2.62, -0.5);
	scene.add(glassFrame);
	const glassLabel = document.createElement('div');
	glassLabel.className = 'f-glass';
	glassLabel.innerHTML = '<b>8.2.1</b> one-way glass';
	overlay.appendChild(glassLabel);

	// ---------- the warehouse of inputs (Dhātupāṭha, stem lists) and the order slip ----------
	const wh = new Group();
	wh.position.set(WAREHOUSE_X, 0, -1.2);
	const shelfMat = mat('#8a6a4a', { roughness: 0.9 });
	const shelf = new Mesh(geo(new BoxGeometry(1.8, 1.7, 1.0)), shelfMat);
	shelf.position.set(0, 0.85, -0.2);
	wh.add(shelf);
	const crateMat = mat('#c9a06a', { roughness: 0.9 });
	const crateGeo = geo(new BoxGeometry(0.42, 0.34, 0.42));
	[[-0.5, 0.2], [0, 0.2], [0.5, 0.2], [-0.25, 0.56], [0.25, 0.56], [0, 0.92]].forEach(([cx, cy]) => {
		const c = new Mesh(crateGeo, crateMat);
		c.position.set(cx, cy + 0.1, 0.45);
		wh.add(c);
	});
	scene.add(wh);
	const slipMat = mat('#fff6e0', { roughness: 0.8 });
	const slip = new Mesh(geo(new BoxGeometry(0.9, 0.02, 0.6)), slipMat);
	slip.position.set(WAREHOUSE_X + 0.9, 0.36, 1.2);
	slip.rotation.y = 0.25;
	scene.add(slip);
	const whLabel = document.createElement('div');
	whLabel.className = 'f-wh';
	whLabel.innerHTML = '<b>Inputs</b><span>Dhātupāṭha · stems</span>';
	overlay.appendChild(whLabel);
	const slipLabel = document.createElement('div');
	slipLabel.className = 'f-slip';
	slipLabel.textContent = opts.inputLabel;
	overlay.appendChild(slipLabel);

	// ---------- the token ----------
	const tokenMat = mat('#c9670a', { emissive: '#c9670a', roughness: 0.35 });
	tokenMat.emissiveIntensity = 0.35;
	const token = new Mesh(geo(new CapsuleGeometry(0.22, 0.5, 6, 16)), tokenMat);
	token.rotation.z = Math.PI / 2;
	const home = new Vector3(WAREHOUSE_X + 0.4, BELT_Y + 0.25, 0.1);
	token.position.copy(home);
	scene.add(token);
	const tokenLabel = document.createElement('div');
	tokenLabel.className = 'f-token';
	tokenLabel.innerHTML = '<span class="f-code"></span><span class="f-form deva"></span>';
	overlay.appendChild(tokenLabel);
	const codeEl = tokenLabel.querySelector('.f-code') as HTMLElement;
	const formEl = tokenLabel.querySelector('.f-form') as HTMLElement;

	// ---------- theme ----------
	function retheme() {
		const dark = getComputedStyle(document.documentElement).colorScheme.includes('dark');
		floorMat.color.set(cssVar('--surface-2', '#f4f0e8'));
		beltMat.color.set(dark ? '#2a2933' : '#3b3742');
		slatMat.color.set(dark ? '#4a4856' : '#5d5866');
		railMat.color.set(dark ? '#6f6c7c' : '#a8a2b0');
		hemi.intensity = dark ? 0.9 : 1.4;
		amb.intensity = dark ? 0.35 : 0.5;
		for (const s of stations) {
			const c = cssVar(`--b-${opts.stations[s.a - 1].band}`, '#888');
			s.body.color.set(c);
			s.body.emissive.set(c);
			s.beam.color.set(c).multiplyScalar(dark ? 0.8 : 0.75);
			s.beam.emissive.set(c);
		}
		const saffron = cssVar('--saffron', '#c9670a');
		tokenMat.color.set(saffron);
		tokenMat.emissive.set(saffron);
		render();
	}

	// ---------- camera fit ----------
	let width = 1;
	let height = 1;
	function resize() {
		width = Math.max(1, canvas.clientWidth);
		height = Math.max(1, canvas.clientHeight);
		renderer.setSize(width, height, false);
		camera.aspect = width / height;
		// fit the whole line horizontally: wider distance on narrow screens
		const span = stationX(8) - WAREHOUSE_X + 3.5;
		const hFov = 2 * Math.atan(Math.tan((camera.fov * Math.PI) / 360) * camera.aspect);
		const dist = Math.max(13, span / 2 / Math.tan(hFov / 2) + 1.5);
		const dir = new Vector3(0, 0.52, 1).normalize();
		baseCam.copy(target).addScaledVector(dir, dist);
		camera.position.copy(baseCam);
		camera.updateProjectionMatrix();
		controls.update();
		render();
	}
	const baseCam = new Vector3();
	target.x = (WAREHOUSE_X + stationX(8)) / 2 + 0.3;

	const controls = new OrbitControls(camera, canvas);
	controls.target.copy(target);
	controls.enableZoom = false;
	controls.enablePan = false;
	controls.enableDamping = !reducedMotion;
	controls.minPolarAngle = 0.55;
	controls.maxPolarAngle = 1.35;
	controls.minAzimuthAngle = -0.9;
	controls.maxAzimuthAngle = 0.9;
	const coarse = matchMedia('(pointer: coarse)').matches;
	if (coarse) controls.enabled = false; // keep the page scrollable on phones
	canvas.style.touchAction = coarse ? 'pan-y' : 'none';
	let lastInteract = -1e9;
	controls.addEventListener('start', () => {
		lastInteract = performance.now() + 1e9;
		swaying = false;
	});
	controls.addEventListener('end', () => (lastInteract = performance.now()));
	controls.addEventListener('change', () => {
		if (reducedMotion) render();
	});

	// ---------- motion ----------
	const from = new Vector3().copy(home);
	const to = new Vector3().copy(home);
	let t0 = 0;
	let dur = 0;
	let arc = 0;
	let playing = false;
	let visible = true;
	let raf = 0;
	let last = performance.now();
	let swayT = 0;
	let swaying = false;

	function setStep(st: FactoryStep | null, instant = false) {
		let x: number;
		if (!st) x = home.x;
		else if (st.a >= 1 && st.a <= 8) x = stationX(st.a);
		else x = home.x; // rules from the input lists (Dhātupāṭha) and other sources
		from.copy(token.position);
		to.set(x, BELT_Y + 0.25, 0.1);
		const hops = Math.abs(to.x - from.x) / SPACING;
		dur = instant || reducedMotion ? 0 : Math.min(0.85, 0.32 + hops * 0.08);
		arc = hops > 1.2 ? Math.min(2.2, 0.5 + hops * 0.22) : hops > 0.2 ? 0.35 : 0;
		t0 = performance.now();
		if (dur === 0) token.position.copy(to);
		for (const s of stations) s.pulse = 0;
		const s = st && stations.find((x) => x.a === st.a);
		if (s) s.pulse = 1;
		codeEl.textContent = st ? (st.source === 'ashtadhyayi' ? st.code : st.source === 'dhatupatha' ? 'Dhātupāṭha' : st.code) : 'start';
		formEl.textContent = st ? st.form : '';
		tokenLabel.style.setProperty('--c', st && st.band !== 'outside' ? `var(--b-${st.band})` : 'var(--muted)');
		for (const x of stations) x.label.classList.toggle('on', !!s && x === s);
		kick();
	}

	const v = new Vector3();
	function place(el: HTMLElement, p: Vector3) {
		v.copy(p).project(camera);
		const x = (v.x * 0.5 + 0.5) * width;
		const y = (-v.y * 0.5 + 0.5) * height;
		el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
		el.style.visibility = v.z < 1 ? 'visible' : 'hidden';
	}
	const tmp = new Vector3();
	function layoutLabels() {
		for (const s of stations) place(s.label, tmp.set(stationX(s.a), 0, 0.85));
		place(glassLabel, tmp.set(glassX, 2.85, -0.5));
		place(whLabel, tmp.set(WAREHOUSE_X, 1.95, -1.4));
		place(slipLabel, tmp.set(slip.position.x, 0.4, slip.position.z + 0.2));
		place(tokenLabel, tmp.copy(token.position).add(new Vector3(0, 0.45, 0)));
	}

	function render() {
		renderer.render(scene, camera);
		layoutLabels();
	}

	function frame(now: number) {
		raf = 0;
		const dt = Math.min(0.05, (now - last) / 1000);
		last = now;
		let busy = false;
		// token tween
		if (dur > 0) {
			const u = Math.min(1, (now - t0) / (dur * 1000));
			const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
			token.position.lerpVectors(from, to, e);
			token.position.y += Math.sin(Math.PI * u) * arc;
			if (u < 1) busy = true;
			else dur = 0;
		}
		// station pulses
		for (const s of stations) {
			const glow = s.pulse;
			s.body.emissiveIntensity = 0.06 + glow * 0.55;
			s.beam.emissiveIntensity = glow * 0.7;
			if (s.press) s.press.position.y = 1.25 - Math.sin(Math.min(1, glow) * Math.PI) * 0.45 * (reducedMotion ? 0 : 1);
			if (!reducedMotion && s.pulse > 0.25) {
				s.pulse = Math.max(0.25, s.pulse - dt * 1.4);
				busy = true;
			}
		}
		if (!reducedMotion) {
			if (playing) {
				beltOffset = (beltOffset + dt * 1.2) % beltLen;
				placeSlats();
				busy = true;
			}
			// gentle sway when the user is not orbiting
			if (now - lastInteract > 3000) {
				if (!swaying) {
					swaying = true;
					swayT = 0;
					baseCam.copy(camera.position);
				}
				swayT += dt;
				const ang = Math.sin(swayT * 0.25) * 0.16;
				const off = baseCam.clone().sub(target);
				camera.position.copy(target).add(off.applyAxisAngle(new Vector3(0, 1, 0), ang));
				busy = true;
			}
			controls.update();
			busy = true;
		}
		render();
		if (busy) kick();
	}
	function kick() {
		if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
		else if (!visible) render();
	}

	function setPlaying(p: boolean) {
		playing = p;
		kick();
	}
	function setVisible(vis: boolean) {
		visible = vis;
		if (vis) {
			last = performance.now();
			kick();
		} else if (raf) {
			cancelAnimationFrame(raf);
			raf = 0;
		}
	}
	function setInput(label: string) {
		slipLabel.textContent = label;
	}
	const onVis = () => (document.hidden ? setVisible(false) : setVisible(visible));
	document.addEventListener('visibilitychange', onVis);

	const ro = new ResizeObserver(() => resize());
	ro.observe(canvas);
	resize();
	retheme();
	kick();

	function dispose() {
		if (raf) cancelAnimationFrame(raf);
		ro.disconnect();
		document.removeEventListener('visibilitychange', onVis);
		controls.dispose();
		for (const d of disposables) d.dispose();
		scene.traverse((o) => {
			const m = (o as Mesh).material as Material | Material[] | undefined;
			if (Array.isArray(m)) m.forEach((x) => x.dispose());
		});
		renderer.dispose();
		overlay.replaceChildren();
	}

	return { setStep, setPlaying, setVisible, setInput, resize, retheme, dispose };
}
export type Factory = ReturnType<typeof createFactory>;
