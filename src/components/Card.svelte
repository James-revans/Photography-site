<script>
  //listen for props
  export let image;
  export let name;
  export let description;
</script>

<style type="text/scss">
  .card {
    height: 500px;
    box-shadow: 0 0 5px 2px rgba(0, 0, 0, 0.322);

    &__image {
      background-position: center;
      background-size: cover;
    }

    &__details {
      box-sizing: border-box;
    }
  }
</style>

<div class="card w-100">
  <div class="flex flex-column h-100">
    <div class="card__image w-100 h-50" style="background-image: url({image})">
      <!-- Image  -->
    </div>
    <div class="card__details w-100 h-50 px-3 py-2">
      <h3>{name}</h3>
      <p>{description}</p>
    </div>
  </div>
</div>


