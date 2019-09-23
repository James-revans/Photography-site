<script>
import Swiper from 'swiper';
import "swiper/dist/css/swiper.min.css";
import { onMount } from 'svelte';
export let photo;

onMount(async () => {
    var mySwiper = new Swiper ('.swiper-container', {
        loop: true,
        speed: 400,
        effect: 'slide',
        initialSlide: photo.index,
        keyboard: {
          enabled: true,
        },
        autoHeight: true,
        navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
        },
    });
});

import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();

</script>

<style type="text/scss">
.photo-select {
    top: 0;
    left: 0;
    z-index: 1000;
    height: 100vh;
    width: 100vw;
    position: fixed;
    
    &__close {
      background: rgba(255, 255, 255, 0.651);
      position: absolute; 
      width: 100vw;
      height: 100vh;
    }
}


.swiper-container {
    position: absolute;
    z-index: 1001;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    z-index: 1;
    background: transparent;
    .swiper-button-next, .swiper-button-previous {
      color: white;
    }
    @media only screen and (min-width: 1024px) {
      width: 60%;
    }
}

.swiper-slide {
  text-align: center;
  font-size: 18px;
  background: transparent;
  /* Center slide text vertically */
  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  -webkit-justify-content: center;
  justify-content: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  -webkit-align-items: center;
  align-items: center;
  img {
    width: 90vw;
    object-fit: scale-down;
    @media only screen and (min-width: 1023px) {
      width: 50vw;
      height: 85vh;
    }
  }
}

</style>
<div class="photo-select">
  <div on:click='{() => dispatch("close")}' class="photo-select__close"></div>
  <div class="swiper-container">
    <div class="swiper-wrapper">
    {#each photo.array as item}
      <div class="swiper-slide"><img src="{item.img}" alt="{item.alt}"></div>
    {/each}
    </div>

    <!-- Add Arrows -->
    <div class="swiper-button-next swiper-button-black"></div>
    <div class="swiper-button-prev swiper-button-black"></div>
    
  </div>
</div>
