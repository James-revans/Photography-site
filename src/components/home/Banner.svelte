<script>
import Swiper from 'swiper';
import "swiper/dist/css/swiper.min.css";
import { onMount } from 'svelte';
import axios from 'axios'
import API_GET_BANNERS from '../../cmsdata/homeBanner.js';
import { createEventDispatcher } from 'svelte';
const imgDispatch = createEventDispatcher();

// let bannerArray = ["https://lh3.googleusercontent.com/84iWq5agZbwF_5k8wTeY6Iu0oa7caJEw349bQJl6PZ5_cj7neAzti2Mg0tGRSZtphKXoHo72nSqQL2-nIq2aDMG3hgbUhSnSvCbbHS45tKFy4jq_qIUjf3xARyMYT5I8WPvQjRLapLc8qsN5TwWRvCFpYWuCF-5o2CHmFUv6GgtTtZoYWr6RlEBEclLruKmI2hRqlQj5jkefoqov0CvHTIflS4c-FyFuG-8ee1cVCMRqqgJHZlkn9wV2uq7Vfndaqs0OfUnbsHlhlxOy0YJUZIGrD_DZbGpuzj4TW9z4EXsMllk5pWlPd4XzrpPn0W4AQY277R5VfIA10dCAOdoE-P348h3RZJOdRiVK7EGEkfk-Bi4R4ndO1GsDIfEOUpDADadhJUEyMpkSqXnkp8RKRvmJDCp1FTxlPEHVIIdXuoP7psCLQtHUI48rbNxKGJ0ClHSSCfjQ9MFOakn9aCjkNhbuRi-2dhXVs97pBz3lVS565dlEdkudjcT7qtY3dWghtaXQHUdTJ8UyJ5PmhmZOIbyPMoXtC_mIB4FJBMwSv8NOQlncXbLjmxZIm85vVSmPC-Tv8rFeLLikkTpUSqp03pP94CgvhbtpSdSBs180XyjOyuFHs6zb24uEJylJSPOzjQjxcXWTUo-eGwitH-VUH7oiC2bJQLgs9__SbCmQ7tiNZfXF0KWZltBmo9A2zrwX8TeRMeQF6pIaAu4DYs0YX3WcWr_mg-5fLrbqJ-jM9gnlFLr7xg=w1487-h990-no", "https://lh3.googleusercontent.com/-FFCM2EBfGIc3pMKmIclyuKfRaCTGMwULXruvd34zqO2r1k1VmHilvizSChbiXz1rtOvFbOLC7a-Ded58NxhgUWPeCTntyMQErr_C55HFYd3h3PHCiv11qHV9KnJhSai7Ju7vqdvb3on3lErIRpyOS_7IRnWy_ci_tF4ZAQpZT7h61H6en414CeqUslQBcGQKheT0JdH1JXcMZKQZBzVf8qzt8FpwZiFNiYzK3_Ia5m7jwvwUB4YVuJFEenkOCcESnJQZKdMLmsqaX_36r76n_npRjltLfbQ08dkywm4YoN-RzYTdM3NrjuBvZ6RzM3qGMuZRwSr1j6QYMHWfqbc4IYwnRZfdr6g3V9S_F_0q5fN16g3UbVYaUSZf9fm3XDGOADrEWsv2t0XXoOZuhrb7iPDKuopDL0eU9LC_qDioIxzNt_B-_pIiLUuuieB4Y6ohSBU-GbrMN35V_0nhwqShb-dZ9BH7Nqpk6Xbm7LXtWsyRSaDrdCyChIUiUzehoPjk8s-dvve2p6dEayP4z7zbaS4OY1tWzLlUiyts4ZDYoNKb-2Olmz18sHdZBuMSXLmFAT3I8w2evo4LvtZZJDd6yaXrsnl-T1eqxW20ppZ8KbeBmfy3Kl6BYzzee6i3DY1aJa2njkblowVnJn2AxMWm7aUrmgKML-cP8sjY-OKMV1uuGrDkmZjEk2LgUklrH1rdRmKLyxWbNU1rmCLCzGr50LXF97o1qzQbTToUqbsTqyCggRkbQ=w1487-h990-no"]
let bannerArray = [];
let placeholder = ["./images/Banner.jpg"];
onMount(async () => {
    API_GET_BANNERS()
    .then((response) => {
        bannerArray = response
      return bannerArray
    })
    .then(response => {
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
    })
    .catch((error)=> {
        console.log(error)
        // bannerArray = ["https://lh3.googleusercontent.com/84iWq5agZbwF_5k8wTeY6Iu0oa7caJEw349bQJl6PZ5_cj7neAzti2Mg0tGRSZtphKXoHo72nSqQL2-nIq2aDMG3hgbUhSnSvCbbHS45tKFy4jq_qIUjf3xARyMYT5I8WPvQjRLapLc8qsN5TwWRvCFpYWuCF-5o2CHmFUv6GgtTtZoYWr6RlEBEclLruKmI2hRqlQj5jkefoqov0CvHTIflS4c-FyFuG-8ee1cVCMRqqgJHZlkn9wV2uq7Vfndaqs0OfUnbsHlhlxOy0YJUZIGrD_DZbGpuzj4TW9z4EXsMllk5pWlPd4XzrpPn0W4AQY277R5VfIA10dCAOdoE-P348h3RZJOdRiVK7EGEkfk-Bi4R4ndO1GsDIfEOUpDADadhJUEyMpkSqXnkp8RKRvmJDCp1FTxlPEHVIIdXuoP7psCLQtHUI48rbNxKGJ0ClHSSCfjQ9MFOakn9aCjkNhbuRi-2dhXVs97pBz3lVS565dlEdkudjcT7qtY3dWghtaXQHUdTJ8UyJ5PmhmZOIbyPMoXtC_mIB4FJBMwSv8NOQlncXbLjmxZIm85vVSmPC-Tv8rFeLLikkTpUSqp03pP94CgvhbtpSdSBs180XyjOyuFHs6zb24uEJylJSPOzjQjxcXWTUo-eGwitH-VUH7oiC2bJQLgs9__SbCmQ7tiNZfXF0KWZltBmo9A2zrwX8TeRMeQF6pIaAu4DYs0YX3WcWr_mg-5fLrbqJ-jM9gnlFLr7xg=w1487-h990-no", "https://lh3.googleusercontent.com/-FFCM2EBfGIc3pMKmIclyuKfRaCTGMwULXruvd34zqO2r1k1VmHilvizSChbiXz1rtOvFbOLC7a-Ded58NxhgUWPeCTntyMQErr_C55HFYd3h3PHCiv11qHV9KnJhSai7Ju7vqdvb3on3lErIRpyOS_7IRnWy_ci_tF4ZAQpZT7h61H6en414CeqUslQBcGQKheT0JdH1JXcMZKQZBzVf8qzt8FpwZiFNiYzK3_Ia5m7jwvwUB4YVuJFEenkOCcESnJQZKdMLmsqaX_36r76n_npRjltLfbQ08dkywm4YoN-RzYTdM3NrjuBvZ6RzM3qGMuZRwSr1j6QYMHWfqbc4IYwnRZfdr6g3V9S_F_0q5fN16g3UbVYaUSZf9fm3XDGOADrEWsv2t0XXoOZuhrb7iPDKuopDL0eU9LC_qDioIxzNt_B-_pIiLUuuieB4Y6ohSBU-GbrMN35V_0nhwqShb-dZ9BH7Nqpk6Xbm7LXtWsyRSaDrdCyChIUiUzehoPjk8s-dvve2p6dEayP4z7zbaS4OY1tWzLlUiyts4ZDYoNKb-2Olmz18sHdZBuMSXLmFAT3I8w2evo4LvtZZJDd6yaXrsnl-T1eqxW20ppZ8KbeBmfy3Kl6BYzzee6i3DY1aJa2njkblowVnJn2AxMWm7aUrmgKML-cP8sjY-OKMV1uuGrDkmZjEk2LgUklrH1rdRmKLyxWbNU1rmCLCzGr50LXF97o1qzQbTToUqbsTqyCggRkbQ=w1487-h990-no"]
        let bannerArray = ["./images/Banner.jpg"];
    })
});
</script>


<style type="text/scss">

.swiper-container {
    width: 100%;
    height: 100vh;
    z-index: 1000;
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
    z-index: 1001;
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
    <div class="swiper-slide"><div class="overlay"></div><img src="{placeholder}" alt="Hi banner image from Savanna Grunzke Photography"></div>
    {#each bannerArray as item}
      <div class="swiper-slide"><div class="overlay"></div><img on:load='{() => imgDispatch("loaded")}' src="{item}" alt="Hi banner image from Savanna Grunzke Photography"></div>
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