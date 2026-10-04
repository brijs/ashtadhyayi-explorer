// One reused <audio> element for explainer narration, with an analyser for lip-sync.
// Audio only ever starts from a user gesture (the narration toggle) or after one has happened.

class Narration {
	playing = $state(false);
	/** 0..1 through the current clip, for caption highlighting. */
	progress = $state(0);
	/** 0..1 loudness, drives the guide's mouth. */
	level = $state(0);
	/** Increments whenever a clip finishes on its own. */
	endedCount = $state(0);

	private au: HTMLAudioElement | null = null;
	private ctx: AudioContext | null = null;
	private analyser: AnalyserNode | null = null;
	private buf: Uint8Array<ArrayBuffer> | null = null;
	private raf = 0;
	private analyserFailed = false;
	private current = '';

	private ensure() {
		if (this.au) return this.au;
		const au = new Audio();
		au.preload = 'auto';
		au.addEventListener('ended', () => {
			this.playing = false;
			this.progress = 1;
			this.level = 0;
			this.endedCount++;
		});
		au.addEventListener('pause', () => {
			this.playing = false;
			this.level = 0;
		});
		au.addEventListener('play', () => {
			this.playing = true;
			this.loop();
		});
		this.au = au;
		return au;
	}

	private wireAnalyser() {
		if (this.ctx || this.analyserFailed || !this.au) return;
		try {
			const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
			this.ctx = new Ctx();
			const src = this.ctx.createMediaElementSource(this.au);
			this.analyser = this.ctx.createAnalyser();
			this.analyser.fftSize = 512;
			src.connect(this.analyser);
			this.analyser.connect(this.ctx.destination);
			this.buf = new Uint8Array(this.analyser.fftSize);
		} catch {
			this.analyserFailed = true;
		}
	}

	private loop = () => {
		cancelAnimationFrame(this.raf);
		const tick = (t: number) => {
			const au = this.au;
			if (!au || au.paused) return;
			this.progress = au.duration ? au.currentTime / au.duration : 0;
			if (this.analyser && this.buf) {
				this.analyser.getByteTimeDomainData(this.buf);
				let sum = 0;
				for (const v of this.buf) sum += ((v - 128) / 128) ** 2;
				this.level = Math.min(1, Math.sqrt(sum / this.buf.length) * 5);
			} else {
				// fallback wobble when the analyser can't be wired
				this.level = 0.35 + 0.3 * Math.sin(t / 70);
			}
			this.raf = requestAnimationFrame(tick);
		};
		this.raf = requestAnimationFrame(tick);
	};

	async play(src: string) {
		const au = this.ensure();
		this.wireAnalyser();
		if (this.ctx?.state === 'suspended') await this.ctx.resume().catch(() => {});
		if (this.current !== src) {
			au.src = src;
			this.current = src;
		}
		au.currentTime = 0;
		this.progress = 0;
		try {
			await au.play();
		} catch {
			this.playing = false;
		}
	}

	stop() {
		if (this.au && !this.au.paused) this.au.pause();
		this.progress = 0;
		this.level = 0;
	}
}

export const narration = new Narration();
