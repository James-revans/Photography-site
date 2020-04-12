<script>
	//global libraries to init on mount
	import AOS from 'aos';
	import { Router, Route } from 'svero';
	import Home from './components/home/Home.svelte';
	import About from './components/home/About.svelte';
	import Bio from './components/bio/Bio.svelte';
	import Gallery from './components/gallery/Gallery.svelte';
	import Videography from './components/videography/Videography.svelte';
	import Store from './components/store/Store.svelte'
	import Contact from './components/contact/Contact.svelte';
	import HamburgerNav from './components/nav/HamburgerNav.svelte';
	import ScrollTop from './components/home/ScrollTop.svelte';

	 
	//import specific lifecycle methods
	import { onMount } from 'svelte';
	onMount(async () => {
		AOS.init();
		// let about = {id: about}
	});
	
</script>  

<style type="text/scss">
:global(body) {
	overflow-x: hidden;
}
:global(html) {
	scroll-behavior: smooth;
}

</style>

<Router>
	<div id="app">
		<div class="small">
			<HamburgerNav/> 	
			<ScrollTop/>
			<Route exact path="#/" fallback component={Home}/>
			<Route exact path="#/gallery" component={Gallery}/>	
			<Route exact path="#/videography" component={Videography}/>	
			<Route exact path="#/bio" component={Bio}/>
			<Route exact path="#/store" component={Store}/>
			<Route exact path="#/contact" component={Contact}/>
		</div>		
	</div>
</Router>
<!-- 
<Route fallback exact path="" component={Home}/>
<Route path="/about" component={Home}/>
<Route path="/gallery" component={Gallery}/>	
<Route path="/videography" component={Videography}/>	
<Route path="/contact" component={Contact}/>	 -->