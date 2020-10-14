<script>
    import {fade} from 'svelte/transition';
    export let packages;

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
        font-family: 'Permanent Marker', cursive;
    }

    i {
        color: rgb(68, 91, 71)
    }

    img{
        max-height:85vh;
        max-width: 100vw;
        object-fit: cover;
    }

    p{
        font-size: 3vw;
    }

    button{
        background: white;
        border:none;
    }

    button:focus{
        outline: none;
    }

    button i:hover{
        color: rgb(68, 91, 71, 0.50)
    }

    .info{
        display: grid;
        height: 85vh;
        justify-content:center;
    }

    .white-box{
        display: grid;
        place-items: center;
        max-height: 100%;
        min-width: 75%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.664);
    }
    .name{
        grid-column: 1 / span 12;
        grid-row: 1;
    }
    .location, .price{
        grid-column: span 6;
        grid-row: 3;
        text-align: center;
    }

    .length, .photos, .outfits{
        grid-column: span 4;
        grid-row: 2;
    }

    .previous{
        grid-column: 1;
        grid-row: 2;
    }

    .next{
        grid-column: 2;
        grid-row: 2;
    }

    .main-package{
        grid-column: 1/ span 2;
        grid-row: 1;
        display: grid;
        position: relative;
        place-items: center;
    }
</style>

<div class='info'>
    <button class='previous' on:click = {previous}><i class="fa fa-arrow-left fa-3x" aria-hidden="true"></i></button>
    {#if visible} 
    <div class='main-package' 
         transition:fade
         on:outroend="{()=> visible = true}"
    >
        <img src={packages[package_item].image} alt ="SRG photography">
        <div class='white-box'>
            <h1 class='name'>{packages[package_item].name}</h1>
            <p class='length'><i class="fa fa-clock-o fa-lg" aria-hidden="true"></i> {packages[package_item].length}</p>
            <p class = 'photos'><i class="fa fa-picture-o fa-lg" aria-hidden="true"></i> {packages[package_item].photos}</p>
            <p class = 'outfits'><i class="fa fa-female" aria-hidden="true"></i> {packages[package_item].outfits}</p>
            <p class = 'location'><i class="fa fa-map-marker fa-lg" aria-hidden="true"></i> {packages[package_item].location}</p>
            <p class = 'price'><i class="fa fa-usd" aria-hidden="true"></i> {packages[package_item].price}</p>  
        </div>
    </div>
    {/if}
    <button class='next' on:click = {next}><i class="fa fa-arrow-right fa-3x" aria-hidden="true"></i></button>
</div>
