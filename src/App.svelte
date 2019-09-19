<script>
	//global libraries to init on mount
	import AOS from 'aos';
	import { Router, Route } from 'svero';
	import Home from './components/home/Home.svelte';
	import Gallery from './components/gallery/Gallery.svelte';
	import Videography from './components/videography/Videography.svelte';
	import Contact from './components/contact/Contact.svelte';
	import Nav from './components/nav/Nav.svelte';
	
	//import specific lifecycle methods
	import { onMount } from 'svelte';
	onMount(async () => {
		AOS.init();
	});
	
</script>

<style type="text/scss">
:global(html) {
	scroll-behavior: smooth;
}
#app {
	min-height: 100%;
}
</style>

<div id="app">
	<Nav/>

	<div class="small">
		<Router>
			<Route fallback exact path="" component={Home}/>
			<Route path="/gallery" component={Gallery}/>	
			<Route path="/videography" component={Videography}/>	
			<Route path="/contact" component={Contact}/>	
		</Router>
	</div>

</div> 


