<script>
import Swiper from 'swiper';
import "swiper/dist/css/swiper.min.css";
import { onMount } from 'svelte';
import bannerArray from '../../cmsdata/banner.js';

  onMount(async () => {
    var mySwiper = new Swiper ('.swiper-container', {
      loop: true,
      speed: 2000,
      effect: 'fade',
      autoplay: {
        delay: 4000,
        disableOnInteraction: true,
      },
      navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });
});
</script>


<style type="text/scss">

.swiper-container {
    width: 100%;
    height: 100vh;
    z-index: 1;
    .swiper-button-next, .swiper-button-previous {
      color: white;
    }
}


.caption {
    position: absolute;
    top: 60%;
    left: 50%;
    width: 80%;
    transform: translate(-50%, -50%);
    z-index: 2;
    color: white;
    font-weight: 100;
    text-align: center;
    h1 {
      font-size: calc(80px + 4.6vw);
      margin-bottom: 8px;
      font-weight: 100;
      text-shadow: 0px 2px 2px rgba(70, 70, 70, 0.678);

    }
    h2 {
      font-size: calc(9px + 2.2vw);
      margin-top: 0px;
      font-weight: 100;
    }
}

.swiper-slide {
  text-align: center;
  font-size: 18px;
  background: #fff;
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
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.swiper-button-next, .swiper-button-prev {
  width: 26px;
  height: 22px;
}


</style>

  <div class="swiper-container">
    <div class="swiper-wrapper">
    {#each bannerArray as item}
      <div class="swiper-slide"><div class="overlay"></div><img src="{item.img}" alt="{item.alt}"></div>
    {/each}
    </div>

    <!-- Add Arrows -->
    <div class="swiper-button-next swiper-button-white"></div>
    <div class="swiper-button-prev swiper-button-white"></div>
    
    
  </div>

  <div class="caption">
      <h1 class="p-marker">SRG</h1>
      <h2 class="vollkorn">PHOTO & VIDEO</h2>
  </div>

