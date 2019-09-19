<script>
// import Masonry from 'masonry-layout';
import PortraitArray from '../../cmsdata/galleryPortrait.js';
import sal from 'sal.js';
import "sal.js/dist/sal.css";

import { onMount } from 'svelte';
onMount(async () => {
    sal({
        threshold: 0.1,

    });
});

</script>

<style type="text/scss">

.grid {
    width: 100%;
    margin: 5% auto;
}
.grid-item {
  float: left;
  width: 42.5%;
  padding: 5%;
  padding-left: 5%;
  padding-top: 0%;

  img {
      object-fit: cover;
      width: 100%;
      height: 100%; 
  }
}   

.grid-item--height2 {
    width: 42.5%;
    float: right;
    padding-left: 0%;
    padding-top: 0;
}

</style>


<div class="grid">
{#each PortraitArray as item, i}
    {#if i%2 !== 0}
        <div data-sal="slide-up" data-sal-delay="0" data-sal-duration="1000" data-sal-easing="ease-out-bounce" class="grid-item"><img src="{item.img}" alt="{item.alt}"></div>
    {:else}
        <div data-sal="slide-up" data-sal-delay="0" data-sal-duration="1000" data-sal-easing="ease-out-bounce" class="grid-item grid-item--height2"><img src="{item.img}" alt="{item.alt}"></div>
    {/if}
{/each}
</div>
