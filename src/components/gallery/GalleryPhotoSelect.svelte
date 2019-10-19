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
        slidesPerView: 1,
        // autoHeight: true,
        spaceBetween: 20,
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
      i {
        position: absolute;
        top: 5%;
        right: 10%;
        font-size: 25px;
        color: #445B47;
        &:hover {
          cursor: pointer;
        }


      }

    }
}

.swiper-container {
    position: absolute;
    z-index: 1001;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    z-index: 1;
    background: transparent;
    .swiper-button-next, .swiper-button-previous {
      color: white;
    }
    @media only screen and (min-width: 1024px) {
      width: 70%;
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
    margin: auto;
    object-fit: scale-down;
    height: 80vh;
    width: 82%;

    @media only screen and (min-width: 1025px) {
      margin: auto;
      width: 90%;
      height: 95vh;
    }
  }
}

.swiper-button-prev, .swiper-button-next {
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2027%2044'%3E%3Cpath%20d%3D'M0%2C22L22%2C0l2.1%2C2.1L4.2%2C22l19.9%2C19.9L22%2C44L0%2C22L0%2C22L0%2C22z'%20fill%3D'%23445B47'%2F%3E%3C%2Fsvg%3E") !important;
  width: 26px;
  height: 22px;
}

.swiper-button-next {
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2027%2044'%3E%3Cpath%20d%3D'M27%2C22L27%2C22L5%2C44l-2.1-2.1L22.8%2C22L2.9%2C2.1L5%2C0L27%2C22L27%2C22z'%20fill%3D'%23445B47'%2F%3E%3C%2Fsvg%3E") !important;
}

</style>
<div class="photo-select">
  <div on:click='{() => dispatch("close")}' class="photo-select__close">
    <i on:click='{() => dispatch("close")}' class="fas fa-times close-button"></i>
  </div>
  <div class="swiper-container">
    <div class="swiper-wrapper">
    {#each photo.array as item}
      <div class="swiper-slide"><img src="{item.img}" alt="{item.alt}"></div>
    {/each}
    </div>

    <!-- Add Arrows -->
    <div class="swiper-button-next"></div>
    <div class="swiper-button-prev"></div>
    
  </div>
</div>
