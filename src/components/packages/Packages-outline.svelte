<script>
    import {fade} from 'svelte/transition';
    export let photos, name, length, price, outfits, location;

    let package_item = 0;

    let visible = true;

    function next(){
        if(package_item === (packages.length-1)){
            package_item = 0;
        }else{
            package_item++
        }
         
        visible = false;
    }

    function previous(){
        if(package_item === 0){
            package_item = (packages.length-1);
        }else{
            package_item--;
        }
         
        visible = false;
    }

    
</script>
<style>
    h1{
        /* font-family: 'Permanent Marker', cursive; */
        font-family: 'Vollkorn SC', serif;
        color: rgb(68, 91, 71)
    }

    p{
        font-family: 'Alegreya Sans SC', sans-serif;
        font-size: 4.25vh;
        color: rgb(68, 91, 71)
    }

    i {
        /* color: rgb(68, 91, 71); */
        color: #f0deb4;
        font-size: 4vh;
    }

    h1 i {
        color: rgb(68, 91, 71);
    }

    .main-packages{
        display:flex;
        justify-content: space-between;
        flex-wrap: wrap;
    }
   
    .title-line{
        display:flex;
        align-items: baseline;
        justify-content: space-between;
    }

    .divider {
        width: 100%;
        /* margin: 0 auto; */
        height: 1px;
        background-image: linear-gradient(to right, rgb(68, 91, 71), white);    
    }
</style>


    <div class='title-line'>
        <h1 class='name'>{name}</h1>
        <h1 class = 'price'><i class="fa fa-usd" aria-hidden="true"></i> {price}</h1>  
    </div>
    <div class='main-packages'>
        {#if length}
            <p class='length'><i class="fa fa-clock-o fa-lg" aria-hidden="true"></i> {length}</p>
        {/if}
        <p class = 'photos'><i class="fa fa-picture-o fa-lg" aria-hidden="true"></i> {photos}</p>
        {#if outfits}
            <p class = 'outfits'><i class="fa fa-female fa-lg" aria-hidden="true"></i> {outfits}</p>
        {/if}
        {#if location}    
            <p class = 'location'><i class="fa fa-map-marker fa-lg" aria-hidden="true"></i> {location}</p>
        {/if}
    </div>
    <div class='divider'></div>

   
