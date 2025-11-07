<script>

	const { fob, src } = $props();
	const { cx, cy, radius } = $derived(fob);

	const style = $derived(
		`width: ${radius * 2}px; transform: translate(${cx - radius}px, ${cy - radius}px);`
	);
</script>

<div class="fob" {style}>
	<div class="content {fob.shake ? 'shake' : ''}">
		<img {src} alt="" />
	</div>
</div>

<style>
	.fob {
		grid-area: 1/1;
		display: grid;
		box-sizing: border-box;
		aspect-ratio: 1;
		border-radius: 50%;
		/* background: #fff7; */
		place-self: start;
	}

	.content {
		grid-area: 1/1;
		display: grid;
		border-radius: 50%;
	}

	img {
		grid-area: 1/1;
		box-sizing: border-box;
		border-radius: 50%;
		width: 100%;
		height: 100%;
		object-fit: cover;
		z-index: 1;
		transition:
			border-color 0.1s,
			opacity 1s;
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
</style>
