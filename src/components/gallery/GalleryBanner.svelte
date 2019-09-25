<script>
    import portraitsArray from '../../cmsdata/galleryPortrait.js';
    import familyArray from '../../cmsdata/galleryFamily.js';
    import eventsArray from '../../cmsdata/galleryEvents.js';
    import miscArray from '../../cmsdata/galleryMisc.js';

    import GalleryMasonry from './GalleryMasonry.svelte';
    export let galleryMode = portraitsArray;

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
            
            &:hover {
                cursor: pointer;
                border-color: black;
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
    <div class="gallery__filter raleway">
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
