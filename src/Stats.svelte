<script>
	import { _stats, ss } from './state.svelte';
	import Timer from './Timer.svelte';
</script>

<div class="stats" style="font-size: {Math.min(20, 22 * Math.min(ss.scale, 1))}px;">
	<div class="item">
		<span class="label">last streak</span>
		<div class="flow"><Timer ticks={_stats.last_streak} /></div>
	</div>
	<div class="item">
		<span class="label">longest streak</span>
		<div class="flow gold"><Timer ticks={_stats.best_streak} /></div>
	</div>
</div>

<style>
	.stats {
		grid-area: 1/1;
		display: grid;
		grid-auto-flow: column;
		margin-top: 15px;
		place-self: center;
		gap: 20px;
	}

	.item {
		border-radius: 50vh;
		display: grid;
		grid-auto-flow: column;
		gap: 10px;
		align-items: center;
		place-content: center;
	}

	.label {
		font-family: Orbitron;
	}

	.flow {
		font-family: Radhiumz;
		translate: 0 7%;
		color: var(--green);
	}

	.gold {
		color: var(--gold);
	}
</style>
