<script>
	import { fade } from 'svelte/transition';
	import { ss } from './state.svelte';
	import { DLG_LEVEL_UP } from './const';

	const hi = '<span style="color: #ffe4aae0;">';
	const START = `<span>press  ${hi}SPACE</span>  to start</span>`;
	const CONTINUE = `<span>press  ${hi}SPACE</span>  to continue</span>`;
	const RESTART = `<span>press  ${hi}SPACE</span>  to restart</span>`;
	const DISMISS = `<span style='font-family: Quicksand;'>press  ${hi}ESC</span>  to dismiss</span>`;
	const style = $derived(`font-size: ${Math.min(24, 30 * Math.min(ss.scale, 1))}px;`);
</script>

<div class="prompt {ss.over ? 'over' : ''}" {style}>
	{#if ss.dlg}
		<div class="content" transition:fade>{@html ss.dlg === DLG_LEVEL_UP ? CONTINUE : ss.fobs.length ? DISMISS : START}</div>
	{:else if ss.over && !ss.restart}
		<div class="content pulse" in:fade={{ delay: 1000 }} out:fade>{@html RESTART}</div>
	{/if}
	<div class="content">&nbsp;</div>
</div>

<style>
	.prompt {
		display: grid;
		place-self: center;
		place-items: center;
		outline: none !important;
		transform-origin: bottom;
		font-family: Orbitron;
		font-weight: bold;
	}

	.over {
		z-index: 3;
	}

	.content {
		grid-area: 1/1;
	}

	.pulse {
		animation: pulse 1s linear alternate infinite;
	}

	@keyframes pulse {
		from {
			transform: scale(1);
		}
		to {
			transform: scale(0.9);
		}
	}
</style>
