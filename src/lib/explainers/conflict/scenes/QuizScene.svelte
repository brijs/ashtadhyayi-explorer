<script lang="ts">
	import { resolve } from '$app/paths';
	import Quiz, { type Question } from '#lib/explainer/Quiz.svelte';
	import type { SceneProps } from '#lib/explainer/types.ts';

	let { react, complete }: SceneProps = $props();
	const questions: Question[] = [
		{ q: 'Why वृक्षेभ्यः and not वृक्षाभ्यः?', options: ['7.3.103 is later and wins (1.4.2)', '7.3.102 does not match', 'Both are correct', 'Sandhi'], answer: 0, explain: 'Both match; by 1.4.2 the later rule, 7.3.103, applies.' },
		{ q: 'Why does वृक्षाभ्याम् (dual) keep आ?', options: ['7.3.103 needs a plural ending, so only 7.3.102 matches', 'Because of 1.4.2', 'It is an exception', 'Dual endings are not sup'], answer: 0, explain: 'No conflict: only one rule matches.' },
		{ q: 'दधि + इह: both 6.1.77 and 6.1.101 match. Which wins?', options: ['6.1.77, since it is general', '6.1.101, the exception', 'Neither', 'Whichever is earlier'], answer: 1, explain: 'An apavāda beats the general rule, else it could never apply.' },
		{ q: 'Which is strongest on the traditional ladder?', options: ['para (later)', 'nitya', 'antaraṅga', 'apavāda'], answer: 3, explain: 'पूर्व < पर < नित्य < अन्तरङ्ग < अपवाद.' }
	];
	function done(score: number) {
		react(score === questions.length ? 'You can referee rule fights now.' : 'Good. Keep the ladder in mind.', score === questions.length ? 'happy' : 'think');
		complete();
	}
</script>

<Quiz {questions} ondone={done} />
<section class="sheet card">
	<p><b>Remember:</b> conflicts are resolved by a ranking: <span class="deva">पूर्व &lt; पर &lt; नित्य &lt; अन्तरङ्ग &lt; अपवाद</span>. Programmers will recognize the idea of specificity (as in CSS) and of rule priority.</p>
	<p class="next">See it as code: <a href={resolve('/cs') + '/rewrite-rules/#order'}>rule ordering in the CS track</a> · Next: <a href={resolve('/learn') + '/asiddha/'}>The invisible last three pādas →</a></p>
</section>

<style>
	.sheet {
		margin-top: 24px;
		padding: 18px 22px;
		max-width: 720px;
	}
	.deva {
		font-size: 18px;
	}
	.next {
		margin: 8px 0 0;
		font-size: 14.5px;
	}
</style>
