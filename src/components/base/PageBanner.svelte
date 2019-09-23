
<style type="text/scss">
.page-banner {
    width: 100vw;
    height: 50vh;
    &__header {
        position: absolute;
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
    <div class="page-banner__header p-marker">
        <slot></slot>
    </div>
</div>