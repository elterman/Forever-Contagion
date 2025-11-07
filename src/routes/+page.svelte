<script>
	import Splash from '../Splash.svelte';
	import { post } from '../utils';
	import FobImg from '$lib/images/Fob.webp';
	import Fob from '../Fob.svelte';

	let splash = $state(true);
	post(() => (splash = false), 2000);
</script>

<div class="app">
	<Fob fob={{ cx: 500, cy: 500, radius: 40 }} src={FobImg} />
	{#if splash}
		<Splash />
	{/if}
</div>

<style>
	.app {
		display: grid;
		height: 100dvh;
		-webkit-user-select: none;
		user-select: none;
		overflow: hidden;
		touch-action: manipulation;
		outline: none !important;
		/* background-image: url('$lib/images/Sky.jpg'); */
		/* background-position-x: center; */
		/* background-position-y: center; */
		box-sizing: border-box;
		/* border: 1px solid yellow; */
	}
</style>
