<script>
	import { fade } from 'svelte/transition';
	import { ss } from './state.svelte';

	const ul = '<ul style="margin: 25px 0 0 0;">';
	const li = '<li style="margin: 12px 0 0 -20px; color: var(--gold);">';
	const hi = '<span style="text-decoration: underline;"">';

	const CONTENT = `
        <span style='font-style: italic;'>You are a ${hi}self-conscious alien</span>, burdened with a dangerous ${hi}virus</span>. You drift through space, trying ${hi}not to infect</span> the innocent.</span>
        ${ul}
        ${li}<span>Use ${hi}arrow keys</span> to adjust your ${hi}velocity</span>—horizontal and vertical.</span></li>
        ${li}<span>Contact with a ${hi}cute kitten</span> turns it into a ${hi}zombie</span>.</span></li>
        ${li}<span>Zombie kittens ${hi}spread</span> the plague.</span></li>
        ${li}<span>After a short time, zombie kittens ${hi}revive</span> and can be ${hi}infected again</span>.</span></li>
        ${li}<span>Keep ${hi}all of them</span> alive ${hi}at the same time</span>—for as long as possible.</span></li>
        </ul>`;

	const width = $derived(ss.space?.width > 580 ? '540px' : '80%');
	const style = $derived(`width: ${width}; font-size: ${Math.min(24, 30 * Math.min(ss.scale, 1))}px;`);
</script>

{#if ss.dlg}
	<div class="dlg" {style} transition:fade={{ duration: 200 }}>
		<div class="content" tabindex="-1">
			{@html CONTENT}
		</div>
	</div>
{/if}

<style>
	.dlg {
		grid-area: 2/1;
		display: grid;
		place-self: center;
		box-sizing: border-box;
		place-items: center;
		margin: 20px 0;
	}

	.content {
		font-weight: bold;
		display: grid;
		align-content: start;
		place-self: center;
		outline: none !important;
	}
</style>
