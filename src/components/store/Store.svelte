<script>
import { onMount } from 'svelte';
import { Router, Route, Link } from 'yrv';
import PageBanner from "../base/PageBanner.svelte";
import SaleBanner from "./SaleBanner.svelte";
import Preset from './preset/preset.svelte';
import Cart from './cart/cart.svelte';
import Instructions from './instructions/instructions.svelte';
import Footer from '../home/Footer.svelte';
const url = "images/Store-Banner-min.jpg";
let showPage = false;
	onMount(async () => {
		Router.hashchange = true;
	});
</script>
<Cart />
<PageBanner on:loaded='{() => showPage = true}' img={url}>
    <h1>Store</h1>
</PageBanner>
<!-- <SaleBanner/> -->
<Preset/>
<Instructions />
<Footer />


