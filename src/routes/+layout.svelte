<script>
	import favicon from '$lib/images/favicon.png';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}

<style>
	:global {
		body {
			margin: 0;
			overflow: hidden;
			--background: #021631;
			background: var(--background);
			--blue: #aadaffa0;
			color: var(--blue);
			--orange: #f79600;
			--tan: #998c67;
			--gold: #ffe4aae0;
			--lightblue: #aadaff;
			--green: #c6ffaae8;
			font-family: Quicksand;
		}

		.no-highlight {
			-webkit-tap-highlight-color: transparent;
			-webkit-touch-callout: none;
			-webkit-user-select: none;
			-khtml-user-select: none;
			-moz-user-select: none;
			-ms-user-select: none;
			user-select: none;
		}
	}

	@font-face {
		font-family: Quicksand;
		src: url('$lib/fonts/Quicksand.ttf');
	}

	@font-face {
		font-family: Orbitron;
		src: url('$lib/fonts/Orbitron.ttf');
	}

	@font-face {
		font-family: Radhiumz;
		src: url('$lib/fonts/NcsRadhiumz-Rp3x6.ttf');
	}
</style>
