<script>

</script>


<style type="text/scss">
.footer {
    width: 100%;
    margin: 0 auto;
    padding: 125px 0px;
    &__divider {
        width: 100%;
        height: 1px;
        background: rgb(32, 32, 32);
        margin: 0px auto 120px auto;
        
    }

    &__icons {
            display: flex;
            justify-content: space-evenly;
        i {
            color: #F0DEB4;
            font-size: 50px;
        }
    }

    @media only screen and (min-width: 800px) {
        width: 50%;
    }
}

</style>

<div class="footer">
    <div class="footer__divider row"></div>
    <div class="footer__icons row">
        <i class="fab fa-facebook-f"></i>
        <i class="fab fa-instagram"></i>
        <i class="fab fa-linkedin-in"></i>  
    </div>

</div>