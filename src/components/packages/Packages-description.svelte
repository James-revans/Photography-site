<script>
    export let name, length, photos, outfits, location, price;
</script>
<style>
    i {
        color: #F0DEB4;
    }
</style>

<h1>{name}</h1>
<p><i class="fa fa-clock-o fa-lg" aria-hidden="true"></i> {length}</p>
<p><i class="fa fa-picture-o fa-lg" aria-hidden="true"></i> {photos}</p>
<p><i class="fa fa-female" aria-hidden="true"></i> {outfits}</p>
<p><i class="fa fa-map-marker fa-lg" aria-hidden="true"></i> {location}</p>
<p><i class="fa fa-usd" aria-hidden="true"></i> {price}</p>