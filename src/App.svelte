<script>
	//global libraries to init on mount
	import AOS from 'aos';

	//import specific lifecycle methods
	import { onMount } from 'svelte';
	onMount(async () => {
		AOS.init();
	});
	
	//import components
	import Card from "./components/Card.svelte";

	//some local state
	let random_boolean = Math.random() >= 0.5;
	let showLocations = random_boolean;
	let events = [
		{
			name: "Super Party",
			description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa esse id, ut dolorum maxime iure dolore ipsum sequi voluptates, fugiat nemo! Earum quo enim cupiditate cum, ut est quibusdam quis!",
			image: "https://source.unsplash.com/collection/494263/800x601"
		},
		{
			name: "Beach Day",
			description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa esse id, ut dolorum maxime iure dolore ipsum sequi voluptates, fugiat nemo! Earum quo enim cupiditate cum, ut est quibusdam quis!",
			image: "https://source.unsplash.com/collection/494263/800x600"
		},
		{
			name: "Another Party",
			description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa esse id, ut dolorum maxime iure dolore ipsum sequi voluptates, fugiat nemo! Earum quo enim cupiditate cum, ut est quibusdam quis!",
			image: "https://source.unsplash.com/collection/494263/800x602"
		}
	]

	//another way to organize your data is keep it in other files
	import locations from "./data/locations";

</script>

<style type="text/scss">
	.main-wrapper {
		max-width: 1000px;
		margin: auto;
	}
</style>

<div class="main-wrapper py-5">
		<div class="row">
			<div class="col px-3">
				<h1>Events</h1>
			</div>
		</div>
		<div class="row">
			{#each events as event}
				<div class="col-4 p-3">
					<Card name={event.name} description={event.description} image={event.image}/>
				</div>
			{/each}
		</div>

		{#if showLocations}
			<div class="row">
				<div class="col px-3">
					<h1>Locations</h1>
				</div>
				<div class="col-12 px-3">
					{#each locations as location}
						<h4>{location}</h4>
					{/each}
				</div>
			</div>
		{/if}
</div>
