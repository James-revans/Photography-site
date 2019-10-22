<script>
import API_GET_PORTRAITS from '../../cmsdata/galleryPortrait.js';
import API_GET_FAMILY from '../../cmsdata/galleryFamily.js';
import API_GET_EVENTS from '../../cmsdata/galleryEvents.js';
import API_GET_MISC from '../../cmsdata/galleryMisc.js';

import GalleryMasonry from './GalleryMasonry.svelte';

import axios from 'axios'
import { onMount } from 'svelte';


let portraitsArray = []
let familyArray = []
let eventsArray = []
let miscArray = []

export let galleryMode = [];

onMount(async () => {
    API_GET_PORTRAITS()
    .then((response) => {
        portraitsArray = response
        galleryMode = portraitsArray
    })
    API_GET_FAMILY()
    .then((response) => {
        familyArray = response
    })
    API_GET_EVENTS()
    .then((response) => {
        eventsArray = response
    })
    API_GET_MISC()
    .then((response) => {
        miscArray = response
        return portraitsArray, familyArray, eventsArray, miscArray
    })
    .catch((error)=> {
        console.log(error)
    })
})
</script>


<style type="text/scss">
.gallery {
    position: relative;
    padding: 4%;
    h1 {
        font-weight: 100;
    }
    &__filter {
        button {
            border: none;
            border-radius: 0;
            background: transparent;
            border-bottom: solid thin transparent;
            transition: 0.25s;
            margin-right: 40px;
            text-transform: uppercase;
            @media only screen and (max-width: 800px) {
                font-size: 10px;
                margin-right: 20px;
            }
            
            &:hover {
                cursor: pointer;
                border-color: #445B47;
            }    
        }
        .active {
            border-bottom: solid 4px #F0DEB4;
            transition: 0.2s;
        }  
    }
}

</style>


<div class="gallery">
    <h1 class="vollkorn sg-green">Gallery</h1>
    <div class="gallery__filter montserrat">
        <button class="sg-green" class:active="{galleryMode === portraitsArray}" on:click="{() => galleryMode = portraitsArray}">portraits</button>
        <button class="sg-green" class:active="{galleryMode === familyArray}" on:click="{() => galleryMode = familyArray}">family</button>
        <button class="sg-green" class:active="{galleryMode === eventsArray}" on:click="{() => galleryMode = eventsArray}">events</button>
        <button class="sg-green" class:active="{galleryMode === miscArray}" on:click="{() => galleryMode = miscArray}">misc</button>
    </div>
</div>

{#if galleryMode == portraitsArray}
    <GalleryMasonry photoArray={galleryMode}/>
{:else if galleryMode == familyArray}
    <GalleryMasonry photoArray={galleryMode}/>
{:else if galleryMode == eventsArray}
    <GalleryMasonry photoArray={galleryMode}/>
{:else}
    <GalleryMasonry photoArray={galleryMode}/>
{/if}
