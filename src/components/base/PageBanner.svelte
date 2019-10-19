<script>
export let img; 

</script>
<style type="text/scss">
.page-banner {
    width: 100vw;
    height: 75vh;
    position: relative;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        position: absolute;
        bottom: 0;
    }
    &__header {
        color: white;
        position: absolute;
        text-align: center;
        top: 45%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 20px;
        @media only screen and (min-width: 500px) {
            font-size: 35px;
        }
    }
}


</style>

<div class="page-banner">
    <img src="{img}">
    <div class="overlay"></div>
    <div class="page-banner__header p-marker">
        <slot></slot>
    </div>
</div>