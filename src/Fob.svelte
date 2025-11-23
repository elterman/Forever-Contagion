<script>
	import { fade } from 'svelte/transition';
	import { ss } from './state.svelte';
	import { isZet } from './utils';
	import { random } from 'lodash-es';

	const { fob, src, scale = 1 } = $props();
	const { cx, cy, radius } = $derived(fob);
	const transition = $derived(ss.landing ? 'transform 1s, width 1s' : '');

	const style = $derived(
		`width: ${radius * 2}px; transform: translate(${cx - radius}px, ${cy - radius}px) scaleX(${scale}); transition: ${transition}; z-index: ${isZet(fob) ? 1 : 0};`
	);
</script>

<div class="fob" {style} transition:fade={{ duration: ss.over ? 500 : 0 }}>
	<div class="shakeable {fob.shake ? 'shake' : ''}">
		<div class="rotatable {fob.dead ? '' : 'alive'}" style="animation-delay: {random(0, 1)}s;">
			<img {src} alt="" />
		</div>
	</div>
</div>

<style>
	.fob {
		grid-area: 1/1;
		display: grid;
		box-sizing: border-box;
		aspect-ratio: 1;
		place-self: start;
		border-radius: 50%;
	}

	.shakeable {
		grid-area: 1/1;
		display: grid;
		border-radius: 50%;
	}

	.rotatable {
		display: grid;
	}

	img {
		grid-area: 1/1;
		box-sizing: border-box;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.shake {
		animation: shake 0.1s 6 linear;
	}

	@keyframes shake {
		from {
			transform: scale(1, 1);
		}
		33% {
			transform: scale(1, 1.2);
		}
		66% {
			transform: scale(1.2, 1);
		}
		to {
			transform: scale(1, 1);
		}
	}

	.alive {
		animation: alive 1.5s linear alternate infinite;
	}

	@keyframes alive {
		from {
			transform: rotate(-30deg);
		}
		to {
			transform: rotate(30deg);
		}
	}
</style>
