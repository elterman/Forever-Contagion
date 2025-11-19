<script>
	import pet from '$lib/images/Pet.webp';
	import petDead from '$lib/images/Pet Dead.webp';
	import petSick from '$lib/images/Pet Sick.webp';
	import Fob from './Fob.svelte';
	import { ss } from './state.svelte';

	const { index } = $props();
	const i = $derived(ss.fobs.findIndex((f) => f.id.startsWith('pet')));
	let fob = $derived(ss.fobs[i + index]);
</script>

<Fob bind:fob={fob} src={fob.dead === true ? petDead : fob.dead ? petSick : pet} style={`opacity: ${ss.over ? 0.35 : 1}`} />
