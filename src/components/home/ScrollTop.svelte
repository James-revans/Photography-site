<script>
    function scrollTop() {
        scroll(0,0);        
    }
</script>

<style type="text/scss">
    button {
        position: fixed;
        top: 50%;
        right: 0%;
        z-index: 999;
        background: #FBFBE7;
        opacity: 0.7;
        border: none;
        font-variant: small-caps;
        color: #445B47;
        font-size: 20px;
        &:hover {
            cursor: pointer;
        }
        @media only screen and (max-width: 600px) {
            position: fixed;
            top: 100%;
            transform: translateY(-100%);
        }
    }
</style>


<button on:click={scrollTop} class="montserrat"><i class="fas fa-chevron-up"></i> to top</button>