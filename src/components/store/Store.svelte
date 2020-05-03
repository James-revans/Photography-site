<script>
import { onMount } from 'svelte';
import PageBanner from "../base/PageBanner.svelte";
import Preset from './preset/preset.svelte';
import Cart from './cart/cart.svelte';
const url = "images/Store-Banner-min.jpg";
let showPage = false;

</script>
<Cart />
<PageBanner on:loaded='{() => showPage = true}' img={url}>
    <h1>Store</h1>
</PageBanner>
<Preset/>
