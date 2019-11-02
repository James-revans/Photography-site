<script>
    let src = './images/SavLogo.jpg';
</script>


<style type="text/scss">
@import '../../assets/scss/mixins/mixins';

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
        align-items: center;
        margin-top: 70px;
        .img {
            width: 80px;
            img {
                width: 100%;
            }
        }
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
    @include break-up('lg') {
        width: 50%;
        padding: 125px 0;
        padding-top: 75px;
    }
}

</style>

<div class="footer">
    <div class="footer__divider row"></div>
    <div class="footer__icons row">
        <a href="https://www.facebook.com/srg.photo.video/" target="_blank"><i class="fab fa-facebook-f"></i></a>
        <div class="img"><img {src}></div>
        <a href="https://www.instagram.com/srgrunzke/" target="_blank"><i class="fab fa-instagram"></i></a>
        <!-- <i class="fab fa-linkedin-in"></i>   -->
    </div>

</div>