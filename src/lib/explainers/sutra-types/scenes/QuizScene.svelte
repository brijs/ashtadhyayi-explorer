<script lang="ts">
	import { resolve } from '$app/paths';
	import Quiz, { type Question } from '#lib/explainer/Quiz.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	const questions: Question[] = [
		{ q: 'वृद्धिरादैच् (1.1.1) is a…', options: ['definition (saṃjñā)', 'operation (vidhi)', 'heading (adhikāra)', 'meta-rule'], answer: 0, explain: 'It names आ ऐ औ "vṛddhi".' },
		{ q: 'Which kind tells you how to interpret other rules?', options: ['vidhi', 'paribhāṣā', 'atideśa', 'saṃjñā'], answer: 1, explain: 'Meta-rules like 1.1.49 षष्ठी स्थानेयोगा.' },
		{ q: 'पतिः समास एव restricts another rule. It is a…', options: ['niyama', 'adhikāra', 'vidhi', 'saṃjñā'], answer: 0, explain: 'The "एव" (only) is the giveaway: it narrows 1.4.7.' },
		{ q: '"A substitute behaves like the original" (1.1.56) is…', options: ['a heading', 'an extension (atideśa)', 'a definition', 'a restriction'], answer: 1, explain: 'Atideśa extends properties from one thing to another.' }
	];
	function done(score: number) {
		react(score === questions.length ? 'All six kinds mastered.' : 'Nice. The verse below sums it up.', score === questions.length ? 'happy' : 'think');
		complete();
	}
</script>

<Quiz {questions} ondone={done} />
<section class="sheet card">
	<p class="deva verse">संज्ञा च परिभाषा च विधिर्नियम एव च ।<br />अतिदेशोऽधिकारश्च षड्विधं सूत्रलक्षणम् ॥</p>
	<p class="muted">Every sūtra page shows its kind as a badge. Browse them by kind on any <a href={resolve('/adhyaya/[a]', { a: '1' }) + '/'}>adhyāya page</a> using the filters.</p>
	<p class="next">Next: <a href={resolve('/learn') + '/conflict/'}>When rules collide →</a></p>
</section>

<style>
	.sheet {
		margin-top: 24px;
		padding: 18px 22px;
		max-width: 720px;
	}
	.verse {
		font-size: 22px;
		line-height: 1.8;
	}
	.next {
		margin: 8px 0 0;
	}
</style>
