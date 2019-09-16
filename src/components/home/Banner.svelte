<script>
import Swiper from 'swiper';
import "swiper/dist/css/swiper.min.css";
import { onMount } from 'svelte';
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
    height: 100%;
    z-index: 1;
    .swiper-button-next, .swiper-button-previous {
      color: white;
    }
}


.caption {
    position: absolute;
    top: 45%;
    left: 8%;
    transform: translate(-8%, -45%);
    z-index: 2;
    color: white;
    font-weight: 100;
    text-shadow: 0px 1px 5px rgb(0, 0, 0);
    h1 {
      font-size: 3em;
      margin-bottom: 8px;
      font-weight: 100;
    }
    h2 {
      font-size: 1.5em;
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

.white-overlay {
  width: 100%;
  height: 100%;
  opacity: 0.3;
  background: white;
  position: absolute;
  z-index: 2;

}


</style>


  <div class="swiper-container">
    <div class="swiper-wrapper">
      <div class="swiper-slide"><div class="white-overlay"></div><img src="https://lh3.googleusercontent.com/WMPbX0m9ERqy10Yr_J9ZeZ1wccnJcN7BEuhJjs35jnCpvoF1VttHFzsnh1trOduBy8YO2lzJiiZC_Bsk9ZVisuWGn84585v-9HnDarQIOnb6aXBPitCeVdJlfGOCLpJXAgAW5bDG-iQFeqyM__iIx0BrW_LgGg8sSOg1t89cn4aUh-p9crZ3IOJUWjOX9iR9lh_XCWtdTciohq3n6zwrUvkYUpNavXP61XXFDJY7HF5HY2kTv_7YHtIJnS_RBct839_c9M4PzHouy75CDGCxngFkzZDyFpA0lK0dNilSKHcHhTcY7lVnhrkmfc46vxUbPVOrUB-jMytfKtHDcLKX2UOyEH8CzcXk89BcmeC0EksBxFEQ716zY_BrWwKTwBg1IX9xTeWCS_WhoMbgl4FYpFX45U1hcI_U3e1lmuEAbK6ST5eBH2_r_s3kVXGasl9VRqevaVhX1HsJkL2EJ0miVrzFvTeIuYHPolsEPHqgvz9mUxwZBpeNdD9P8SX0Cr7gbfarlH7-H5FGbGyRu8kuQZuktX9K4ZyCbaKBxrJBL1q8XFtH7X1WIZvBK26zhMH836B_rANS2_OjTNPWSM_lxT-HYc38QdP4Xw-NYhTbPjhKLztig1jBfBsYUxkyRzUbGOcS0p-P-h6x3RdYjc6d7nDv-2FEQ6QZeJ5fBT1fEQjXmAfdOtferk9cAn33PSslXRszJrwSJOwsOKaK9P8RIzHLVMQDkoP7p09StDyVoRFO6-n7=w1487-h990-no" alt="hands holding a nametag"></div>
      <div class="swiper-slide"><div class="white-overlay"></div><img src="https://lh3.googleusercontent.com/crABBToDqf1QzmXdfjuPQ6_SIjmBM4TxkcRbdalvWwlxplKQXImJ3WFzMU6O4iNaylwhPFxf8Qhc8TR5MW3KkSqaU6O2uopuJHq9dPauuSyY-ekqdIq3LMIZr7kniZ51hJHSZ99MwT62izSJyzQedwTJTSq4DVAjx8JEm2rB0V2hKg7DDF3wgf94YPzgcKOMrmF9GT-_a4VlocW2SPBzDvsFvBAsoFM2F_O7Gvn0wEvvod_7xMjBVZ145nTUSZUV8wtJFkoPjfUTVrMUYzgpurFrgaR4JN79VE6MrQCi7PuGNVWJgWrtBz6gDHLP4xFnO-Cq8DfPNYnKUJTpiOCBuAsnWgZeAZplHX_i6MPoTtbEAtHsV3FTWIjs3PsIdjq7YqTomIlmKmKbZ5_SM47Rd2Di3Rqjai_Z-jpKH7VV4fLd2D_GU1B5St4JMPaWYLwzdhP-t3Z1bt_sJ747tnb1ldDmFO_6ns6U4P9MeSThpbp7rLphVNsw4sf9k6zAKxV6s8FU4agA6BrEY-AqnPRSa5dtXVTwkGmktgzhFFdacZG5pF3cutQoOWxldgrUzvFjepKEJMkl85S-03Ul-11nLd4gtVwUoMe_PYVF9yuE45l17G9j28jLO5q_HDuLROnVoqVIfuF5-8zG1ATi1XuHsbviV3ATYpXcg8AZt1kDqptb853ELyxunBmvn3lhW61SpMp-i8PB54rbAOAf5-wKf_HI2TitygqWOXsqn2qaMVWkr-nf=w1485-h990-no" alt="baby boy in a cute golfer hat"></div>
      <div class="swiper-slide"><div class="white-overlay"></div><img src="https://lh3.googleusercontent.com/-bpq6qwE50lgd1FVv9Imlzbt4gZskkaIv7YjDp7wl8mp4YuKk0Xj79-a71YKVBBtqNFi4zUPnTj9JQ_FcAeCnq1rj7mNRrV6XMsV-AMhzhIRf1oqSNbTYLW1XartLlgAPBZo1_W5VNeH1T-wtbXMJNE_dIZn0n5QkEvcuGAWPdJ_rmFlQTEX4Na1Bcw-UTMnCaRORFSLQBMLMkJhojvJ5av7DYPRmu3nLKty-Xg5jZPmWDkW2Q2qedrCgEs1hvxLakQyhzJhY3f8AbVb4CwlR9wKuK8yOFiuch9Pp7amv1sfatKcbNfJO9gwCdN_X0b7Mi6mCKsNC83KPoKevcG-voVCyVONCIYOJ16PbQ4-6i4nHg3CSn5g4DYFwueyuqYJ9SGAZlrWKys3vk2JBoh7DrYYQn7T-X2-odyN8JlhfvOLnSuV-868UeSW0rVFByZOLUztUN7RT1ZOcBFVMBxuI8q7Ce_F22ruAnB01OBSpNvM1cYgNvB19DEcmz1KvOmXF2NDKaNXa-g2U0aUApdzkJuZoyO3Gp1LQ5ynGXA5ZUNCymzVGk3oJuLK7OD91TU8mcXprTWQSFYMZ6PD-bDB6Du_5va7F4BkSIM9LMzFxHgefugn_9z7sij_bUrPLiNnOuqmJF802STNteGsMl2y38RbPfmmLCYy-Hy9D_iv7W7qbec7pMuVaiqy1bjvXpsrOl11NO3jAcn9Q9m2QQCZkQukC6voB4dOMCRQvwZmHUcZ3hcc=w1487-h990-no" alt="laying down on tennis court"></div>
      <div class="swiper-slide"><div class="white-overlay"></div><img src="https://lh3.googleusercontent.com/9gqcPW3CXXlIKgiageYZsc_Y_-26d3_G0cSgW8iTX0Lj9m9xmt6a7GyPyvZbB95JHtAGYNiThDh2Ifcs5gyVOy1CCyr-f2raluCVX3WNTiphu6Uv_zLx-p_WqZ7aNJEOe7kgnaFkro29WyFHUwFk6C4D_fCArbFdgip9mFngGnm-8wtCdRoLQraOGXguqGZFKdpeH_BHn4Tuju9HS-y1P-gwkngpJXXA7S_lyfKToK2m9mfQfJzvgcc4hlr8iVEzYcA38mCa_spcDtQs4Ad6HnKLDddRJ4135GfmnI-JHxD_xJHkaQ7NLm4jmt2nFzzCN0K8YljFOKczMVmCSbMisngvMTfEZq8Fxc_T7cATmxJqQiclwIKfx6tR7vsTHjnbcvouZQ_RmWdkMNiSnc5y2biQIv-DCGfdc0-ZcktSrIfsRXhJwmKA90XNhGCjl3-PTmgOXUjudvlDAWZBDVmvx3e3Ml6rcm0PrD9zej-xtUYyM5ix4KkSq5n3cQM7VWBTLF1QAGSV9pNCZTDZcGzD3JB6i6WP8LIo2hMtNbJS_ATdLX8aYNk11Ej9R2hfFBEPa05iSIjx7FuI_5JPzg1Op5DmgRb3ygSrNoPdDYW1rxQQpM-nPMKae58ENe6YL3-WXPbZZre6NV0BN4Smsarep4hBVl_1xde6tVYo7fMnvXmqg5Dzu3Hbj_b9q9ACQdoc2kDX5mSEAvYhaDJzySURLNyvJrL3RMWjZO02W4znu4hlh-uH=w1487-h990-no" alt="hikers walking across bridge in forrest"></div>

    </div> 
    <!-- Add Arrows -->
    <div class="swiper-button-next swiper-button-white"></div>
    <div class="swiper-button-prev swiper-button-white"></div>
    
  </div>

  <div class="caption raleway">
      <h1>SAVANNA GRUNZKE</h1>
      <h2>photography</h2>
  </div>

