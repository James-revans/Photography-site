<script>
    export let name, length, photos, outfits, location, price, image;
</script>
<style>
    h1{
        font-family: 'Permanent Marker', cursive;
    }

    i {
        color: #F0DEB4;
    }

    img{
        width:33%;
        object-fit: contain;
    }

    p{
        font-size: 1.75vw;
    }

    .info{
        display: flex;
        justify-content:center;
    }

    .text-div{
        /* display: flex; */
        /* min-height: 100%; */
        padding-left: 3%;
    }
</style>

<h1>{name}</h1>
<div class='info'>
    
    <img src={image} alt ="SRG photography">
 
    <div class='text-div'>
        <p><i class="fa fa-clock-o fa-lg" aria-hidden="true"></i> {length}</p>
        <p><i class="fa fa-picture-o fa-lg" aria-hidden="true"></i> {photos}</p>
        <p><i class="fa fa-female" aria-hidden="true"></i> {outfits}</p>
        <p><i class="fa fa-map-marker fa-lg" aria-hidden="true"></i> {location}</p>
        <p><i class="fa fa-usd" aria-hidden="true"></i> {price}</p>
    </div>   
</div>
