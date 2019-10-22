<script>

</script>


<style type="text/scss">
.footer {
    width: 100%;
    margin: 0 auto;
    padding: 75px 0;
    
    &__divider {
        width: 75%;
        margin: 0 auto;
        height: 1px;
        background: rgb(68, 91, 71);       
    }

    &__icons {
            display: flex;
            justify-content: space-evenly;
            margin-top: 70px;
        i {
            color: #F0DEB4;
            font-size: 50px;
            transition: 0.3s;
            &:hover {
                color: rgb(206, 190, 154);
                transition: 0.2s;
            }
        }
    }

    @media only screen and (min-width: 800px) {
        width: 50%;
        padding: 125px 0;
        padding-top: 75px;
    }
}

</style>

<div class="footer">
    <div class="footer__divider row"></div>
    <div class="footer__icons row">
        <a href="https://www.facebook.com/savanna.grunzke" target="_blank"><i class="fab fa-facebook-f"></i></a>
        <a href="https://www.instagram.com/srgrunzke/" target="_blank"><i class="fab fa-instagram"></i></a>
        <!-- <i class="fab fa-linkedin-in"></i>   -->
    </div>

</div>