<script>
	import { ZET_MAX_VELOCITY } from '../const';
	import GamePage from '../Game Page.svelte';
	import { findZet, onStart, persist } from '../shared.svelte';
	import { _sound } from '../sound.svelte';
	import Splash from '../Splash.svelte';
	import { _stats, ss } from '../state.svelte';
	import { post, windowSize } from '../utils';

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
		_stats.best_streak = 0;
		_stats.last_streak = 0;

		persist();
	};

	const onKeyDown = (e) => {
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
			delete ss.velocity;
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

		const zet = findZet();
		let { x, y } = zet.vel;

		const max = ZET_MAX_VELOCITY * ss.scale;
		const d = 0.5 * ss.scale;

		switch (e.key) {
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

		return () => {
			document.removeEventListener('touchstart', disable, { passive: false });
			window.removeEventListener('contextmenu', disable);
			window.removeEventListener('dblclick', disable);
			window.removeEventListener('keydown', onKeyDown);
		};
	});

	$effect(() => {
		const onResize = () => {
			ss.scale = 1;

			let scx = 1;
			let scy = 1;

			const { w, h } = windowSize();
			const long = Math.max(w, h);
			const short = Math.min(w, h);

			if (long < 1700) {
				scx = long / 1700;
			}

			if (short < 940) {
				scy = short / 940;
			}

			ss.scale = Math.min(scx, scy);
		};

		onResize();

		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	});

	let splash = $state(true);
	post(() => (splash = false), 2000);
</script>

<div class="app pulse">
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
