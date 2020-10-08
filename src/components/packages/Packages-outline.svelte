<script>
    export let name, length, photos, outfits, location, price, image;
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

    .info{
        display: grid;
        place-items: center;
        position: relative;
        /* text-align:center; */
        height: 85vh;
        justify-content:center;
    }

    .white-box{
        display: grid;
        place-items: center;
        max-height: 100%;
        min-width: 48%;
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
</style>

<div class='info'>    
    <img src={image} alt ="SRG photography">
    <div class='white-box'>
        <h1 class='name'>{name}</h1>
        <p class='length'><i class="fa fa-clock-o fa-lg" aria-hidden="true"></i> {length}</p>
        <p class = 'photos'><i class="fa fa-picture-o fa-lg" aria-hidden="true"></i> {photos}</p>
        <p class = 'outfits'><i class="fa fa-female" aria-hidden="true"></i> {outfits}</p>
        <p class = 'location'><i class="fa fa-map-marker fa-lg" aria-hidden="true"></i> {location}</p>
        <p class = 'price'><i class="fa fa-usd" aria-hidden="true"></i> {price}</p>  
    </div>
</div>
