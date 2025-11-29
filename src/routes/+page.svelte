<script>
	import { ZET_MAX_VELOCITY, ZET_VELOCITY_DELTA } from '../const';
	import GamePage from '../Game Page.svelte';
	import { findZet, onStart, persist } from '../shared.svelte';
	import { _sound } from '../sound.svelte';
	import Splash from '../Splash.svelte';
	import { _stats, ss } from '../state.svelte';
	import { post } from '../utils';

	const keysPressed = new Set();

	const onSound = () => {
		_sound.sfx = !_sound.sfx;

		if (_sound.sfx) {
			_sound.play('won', { rate: 4 });
		}

		persist();
	};

	const onMusic = () => {
		_sound.music = !_sound.music;

		if (_sound.music) {
			if (ss.fobs.length > 0) {
				_sound.playMusic();
			}
		} else {
			_sound.stopMusic();
		}

		persist();
	};

	const onResetStats = () => {
		if (_stats.plays === 0 || (_stats.plays === 1 && ss.timer)) {
			return;
		}

		_sound.play('link1', { rate: 0.7 });

		_stats.plays = ss.timer ? 1 : 0;
		_stats.best_ticks = 0;

		persist();
	};

	const onKeyUp = (e) => {
		keysPressed.delete(e.key);
	};

	const onKeyDown = (e) => {
		if (keysPressed.has(e.key)) {
			return; // Already processing this key}
		}

		keysPressed.add(e.key);
		if (e.key === 's') {
			onSound();
			return;
		}

		if (e.key === 'm') {
			onMusic();
			return;
		}

		if (e.key === 'z') {
			onResetStats();
			return;
		}

		if (ss.dlg) {
			if (e.code === (ss.fobs.length ? 'Escape' : 'Space')) {
				_sound.play('plop');
				delete ss.dlg;

				if (ss.fobs.length === 0) {
					onStart();
				}
			}

			return;
		}

		if (ss.over && e.code === 'Space') {
			_sound.play('plop');
			ss.restart = true;
			ss.ticks = 0;

			post(onStart, 1000);
			return;
		}

		if (ss.fobs.length === 0) {
			return;
		}

		if (e.code === 'Escape') {
			_sound.play('plop');
			ss.dlg = true;
			return;
		}

		if (ss.over) {
			return;
		}

		const zet = findZet();
		let { x, y } = zet.vel;

		const max = ZET_MAX_VELOCITY * ss.scale;
		const d = ZET_VELOCITY_DELTA * ss.scale;

		switch (e.code) {
			default:
				return;
			case 'ArrowRight':
				x += d;
				x = Math.max(-max, Math.min(x, max));
				break;
			case 'ArrowLeft':
				x -= d;
				x = Math.max(-max, Math.min(x, max));
				break;
			case 'ArrowUp':
				y -= d;
				y = Math.max(-max, Math.min(y, max));
				break;
			case 'ArrowDown':
				y += d;
				y = Math.max(-max, Math.min(y, max));
				break;
			// case 'Space':
			// 	x = 0;
			// 	y = 0;
			// 	break;
		}

		zet.vel = { x, y };
	};

	$effect(() => {
		const disable = (e) => e.preventDefault();

		// use { passive: false } to allow preventDefault()
		document.addEventListener('touchstart', disable, { passive: false });
		window.addEventListener('contextmenu', disable);
		window.addEventListener('dblclick', disable);
		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('keyup', onKeyUp);

		return () => {
			document.removeEventListener('touchstart', disable, { passive: false });
			window.removeEventListener('contextmenu', disable);
			window.removeEventListener('dblclick', disable);
			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('keyup', onKeyUp);
		};
	});

	let splash = $state(true);
	post(() => (splash = false), 2000);
</script>

<div class="app pulse {ss.over ? 'over' : ''}">
	<GamePage />
	{#if splash}
		<Splash />
	{/if}
</div>

<style>
	.app {
		display: grid;
		height: calc(100dvh - 4px);
		-webkit-user-select: none;
		user-select: none;
		overflow: hidden;
		touch-action: manipulation;
		outline: none !important;
		box-sizing: border-box;
		background-image: url('$lib/images/Sky.jpg');
		background-position-x: center;
		background-position-y: center;
		transition: background-image 2s;
	}

	.over {
		background-image: url('$lib/images/Sky Over.jpg');
	}

	.pulse {
		animation: pulse 10s alternate infinite ease-in-out;
	}

	@keyframes pulse {
		from {
			background-size: 2000px;
		}
		to {
			background-size: 1500px;
		}
	}
</style>
