<script>
import PresetDescription from './preset-description.svelte';
import PresetCarousel from './preset-carousel.svelte';
import presets from '../data.js';
let cart = [];
const addToCart = (item) => {
    const isAlreadyInCart = cart.filter(selection => selection === item);
    if(isAlreadyInCart.length === 0) {
        cart.push(item);
    }
}
</script>

<style>
.preset {
    display: flex;
    max-width: 1500px;
    margin: 0 auto;
    padding: 100px 10px;
    flex-wrap: wrap;
    justify-content: center;
}
.title {
    text-align: center;    
    padding-top: 100px;
    font-size: 60px;
}
h1 {
    font-weight: 100;
}
</style>

<h1 class="title sg-green vollkorn">Presets</h1>
<div class="presets">
{#each presets as preset, i}
    <div class="preset">
        <PresetCarousel photos={preset.examples} index={i}/>
        <PresetDescription {...preset} addToCart={addToCart}/>
    </div>
{/each}
</div>

