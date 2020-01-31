<script>
import sal from 'sal.js';
import "sal.js/dist/sal.css";
import { fade } from 'svelte/transition';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';
import { onMount } from 'svelte';

import GalleryPhotoSelect from './GalleryPhotoSelect.svelte';

export let photoArray;
export let photo = {
        open: false,
        array: '',
        index: ''
    }

let grid;
let gridItem;
let selectedArray = photoArray;
let imageCount = 0;
let showImages = false;

function countImages() {
    imageCount += 1;
    if(imageCount >= selectedArray.length) {showImages = true}
}

onMount(async () => {
    sal({
        threshold: 0.1,
    });
    // let msnry = new Masonry( grid, {
    //     // options
    //     itemSelector: '.grid-item',
    //     columnWidth: 500
    // })
    // // element argument can be a selector string
    // //   for an individual element
    // let msnryItem = new Masonry( '.grid', {
    // // options
    // })
    let msnry;

    imagesLoaded( grid, function() {
        // init Isotope after all images have loaded
        if(showImages) {
            msnry = new Masonry( grid, {
                itemSelector: '.grid-item',
                columnWidth: '.grid-item-preload',
                percentPosition: true
            });
        }
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



 
.grid-item-preload {
    width: 44%;
    padding: 0% 0% 4% 4%;
    float: left;
    opacity: 0;

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

.show {
    opacity: 1;
}

.lds-ring {
  display: inline-block;
  position: relative;
  width: 64px;
  height: 64px;
  margin: 0 auto;
}
.lds-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 51px;
  height: 51px;
  margin: 6px;
  border: 6px solid #445B47;
  border-radius: 50%;
  animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: #445B47 transparent transparent transparent;
}
.lds-ring div:nth-child(1) {
  animation-delay: -0.45s;
}
.lds-ring div:nth-child(2) {
  animation-delay: -0.3s;
}
.lds-ring div:nth-child(3) {
  animation-delay: -0.15s;
}
@keyframes lds-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

</style>

<div class="row">
    {#if showImages !== true}
        <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
    {/if}
    <div bind:this={grid} class="grid">
        {#each selectedArray as item, i}
            <div 
                bind:this={gridItem}
                on:click="{() => photo = {open: true, array: selectedArray, index: i}}" data-sal="slide-up" data-sal-delay="0" data-sal-duration="1000" data-sal-easing="ease-out-bounce" 
                class="grid-item-preload grid-item" 
                class:show="{showImages == true}">
                <img on:load={countImages} src="{item}" alt="SRG photography image">
            </div>
        {/each}
    </div>

</div>


{#if photo.open == true}
    <div transition:fade>
        <GalleryPhotoSelect photo={photo} on:close="{() => photo.open = false}"/>
    </div>
{/if}





<!-- <div class="grid row">
    <div class="col-6">
        {#each selectedArray as item, i}
            {#if i%2 !== 0}
                <div on:click="{() => photo = {open: true, array: selectedArray, index: i}}" data-sal="slide-up" data-sal-delay="0" data-sal-duration="1000" data-sal-easing="ease-out-bounce" class="grid-item grid-item-1"><img src="{item}" alt="SRG photography image"></div>
            {/if}
        {/each}
    </div>
    <div class="col-6">
        {#each selectedArray as item, i}
            {#if i%2 == 0}
                <div on:click="{() => photo = {open: true, array: selectedArray, index: i}}" data-sal="slide-up" data-sal-delay="0" data-sal-duration="1000" data-sal-easing="ease-out-bounce" class="grid-item grid-item-2"><img src="{item}" alt="SRG photography image"></div>
            {/if}
        {/each}
    </div>
</div>

{#if photo.open == true}
    <div transition:fade>
        <GalleryPhotoSelect photo={photo} on:close="{() => photo.open = false}"/>
    </div>
{/if} -->