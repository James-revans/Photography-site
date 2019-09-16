<script>
	//global libraries to init on mount
	import AOS from 'aos';
	import { Router, Route } from 'svero';
	import Home from './components/home/Home.svelte';
	import Gallery from './components/gallery/Gallery.svelte';
	
	//import specific lifecycle methods
	import { onMount } from 'svelte';
	onMount(async () => {
		AOS.init();
	});
	
</script>

<style type="text/scss">

</style>

<Home/>

<div class="small">
	<Router>
		<Route path="/home" component={Home} />	
		<Route path="/gallery" component={Gallery} />	
	</Router>
</div>

