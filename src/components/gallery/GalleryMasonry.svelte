<script>
import sal from 'sal.js';
import "sal.js/dist/sal.css";
import GalleryPhotoSelect from './GalleryPhotoSelect.svelte';
import { fade } from 'svelte/transition';

export let photoArray;

export let photo = {
        open: false,
        array: '',
        index: ''
    }

let selectedArray = photoArray;

import { onMount } from 'svelte';
onMount(async () => {
    sal({
        threshold: 0.1,

    });
});

</script>

<style type="text/scss">

.grid {
    position: relative;
    width: 100%;
    margin: 5% auto;
    top: 0;
    left: 0;
}
.grid-item {
  width: 88%;
  padding: 8%;
  padding-top: 0;


  img {
      object-fit: cover;
      width: 100%;
      height: 100%;
      transition: 0.3s;
      &:hover {
          cursor: pointer;
          box-shadow: 0px 2px 10px 2px rgb(161, 161, 161);
          transition: 0.2s;
      } 
  }
}  

.grid-item-1 {
 float: left;
}

.grid-item-2 {
    padding-left: 0%;
    float: right;
}

</style>


<div class="grid row">
    <div class="col-6">
        {#each selectedArray as item, i}
            {#if i%2 !== 0}
                <div on:click="{() => photo = {open: true, array: selectedArray, index: i}}" data-sal="slide-up" data-sal-delay="0" data-sal-duration="1000" data-sal-easing="ease-out-bounce" class="grid-item grid-item-1"><img src="{item.img}" alt="{item.alt}"></div>
            {/if}
        {/each}
    </div>
    <div class="col-6">
        {#each selectedArray as item, i}
            {#if i%2 == 0}
                <div on:click="{() => photo = {open: true, array: selectedArray, index: i}}" data-sal="slide-up" data-sal-delay="0" data-sal-duration="1000" data-sal-easing="ease-out-bounce" class="grid-item grid-item-2"><img src="{item.img}" alt="{item.alt}"></div>
            {/if}
        {/each}
    </div>
</div>

{#if photo.open == true}
    <div transition:fade>
        <GalleryPhotoSelect photo={photo} on:close="{() => photo.open = false}"/>
    </div>
{/if}