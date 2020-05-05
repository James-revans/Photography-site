<script>
export let photos;
import {onMount} from 'svelte';
import Swiper from 'swiper';
import "swiper/dist/css/swiper.min.css";

export let index;
let galleryTop;
let galleryThumbs;

onMount(async () => {
    galleryTop = new Swiper ('.gallery-top', {
        spaceBetween: 10,
        thumbs: {
            swiper: galleryThumbs
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    })
    galleryThumbs = new Swiper ('.gallery-thumbs', {
        freeMode: true,
        slidesPerView: 3,
        spaceBetween: 15,
        watchSlidesVisibility: true,
        watchSlidesProgress: true,
    });
});
</script>
<style type="text/scss">
@import '../../../assets/scss/mixins/mixins';
.wrapper {
    max-width: 600px;
    width: 100%;
}
.swiper-slide {
    font-size: 18px;
    display: flex;
    max-height: 500px;
    height: 100%;
    img {
        object-fit: cover;
        height: 100%;
        width: 50%;
        margin: 0 2px;
    }
    &__main {
        img {
            width: 100%;
        }
    }
}
.gallery-thumbs {
    box-sizing: border-box;
    padding: 10px 0;
}
.gallery-thumbs .swiper-slide {
    opacity: 0.4;
}
.gallery-thumbs .swiper-slide-thumb-active {
    opacity: 1;
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
<div class="wrapper">
    <div class="swiper-container gallery-top">
        <div class="swiper-wrapper">
            <div class="swiper-slide swiper-slide__main">
                <img src="{photos.main}" alt="SRG photography image">
            </div>
        {#each photos.examples as item}
            <div class="swiper-slide">
                <img src="{item.before}" alt="SRG photography image">
                <img src="{item.after}" alt="SRG photography image">
            </div>
        {/each}
        </div>
            <!-- Add Arrows -->
        <div class="swiper-button-next"></div>
        <div class="swiper-button-prev"></div>
    </div>
    <div class="swiper-container gallery-thumbs">
        <div class="swiper-wrapper">
            <div class="swiper-slide swiper-slide__main" on:click={() => {galleryTop[index].slideTo(0)}}>
                <img src="{photos.main}" alt="SRG photography image">
            </div>
        {#each photos.examples as item, i}
            <div class="swiper-slide" on:click={() => {galleryTop[index].slideTo(i+1)}}>
                <img src="{item.before}" alt="SRG photography image">
                <img src="{item.after}" alt="SRG photography image">
            </div>
        {/each}
        </div>
    </div>
</div>



