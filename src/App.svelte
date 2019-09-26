<script>
	//global libraries to init on mount
	import AOS from 'aos';
	import { Router, Route } from 'svero';
	import Home from './components/home/Home.svelte';
	import About from './components/home/About.svelte';
	import Gallery from './components/gallery/Gallery.svelte';
	import Videography from './components/videography/Videography.svelte';
	import Contact from './components/contact/Contact.svelte';
	import HamburgerNav from './components/nav/HamburgerNav.svelte';

	
	//import specific lifecycle methods
	import { onMount } from 'svelte';
	onMount(async () => {
		AOS.init();
		let about = {id: about}
	});
	
</script>

<style type="text/scss">
:global(body) {
	// min-height: 100%;
	overflow-x: hidden;
}
:global(html) {
	// height: 100%;
}

</style>

<div id="app">
	<HamburgerNav/>
	<div class="small">
		<Router>
			<Route fallback exact path="" component={Home}/>
			<Route path="/about" component={Home}/>
			<Route path="/gallery" component={Gallery}/>	
			<Route path="/videography" component={Videography}/>	
			<Route path="/contact" component={Contact}/>	
		</Router>
	</div>

</div> 


