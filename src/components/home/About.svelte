<script>
import sal from 'sal.js';
let src = 'images/SavSig.png'
let about = './images/savabout2.jpeg';
import { onMount } from 'svelte';
onMount(async () => {
    sal();
});
</script>

<style type="text/scss">
@import '../../assets/scss/mixins/mixins';

.about {
    background: #FBFBE7;
    width: 100%;
    margin: 0 auto;
    margin-bottom: 5%;
    display: flex;
    flex-wrap: wrap;
    position: relative;
    padding-top: 20px;
    padding-bottom: 20px;
    align-items: center;
        &__photo {
            width: 100%;
            padding: 2.5%;
            margin: 0 6%;
            img {
                width: 100%;
            }
            @include break-up('md') {
                width: 30%;
            }
        }
        &__bio {
            padding: 10px;
            width: 100%;
            text-align: left;
            // font-weight: 500;
            color: #445B47;
            
            &__header {
                padding-bottom: 20px;
                text-align: center;

                h2 {
                    display: inline;
                    // font-size: 40px;
                    font-size: calc(20px + 1.3vw);
                    margin: 5% 0;
                    border-bottom: solid 1px #445B47;
                    padding-bottom: 10px;
                    font-weight: 100;
                    color: #445B47;
                    
                }   
            }
            &__content {
                padding-top: 10px;
                padding-bottom: 50px;


                
                p {  
                    // font-size: 15px;
                    font-size: 18px;
                    // text-transform: lowercase;

                    // &:first-letter {
                    //     font-size: 18px;
                    // }
                }
                &__signature {
                    position: absolute;
                    bottom: 10%;
                    transform: translate(10%, 70%);

                    text-align: center;
                    display: block;
                }
            }
            @include break-up('md') {
                width: 50%;
                padding: 2.5%;
                &__header {
                    text-align: left;
                }
                &__content {
                    padding-right: 100px;
                    p {
                        font-size: 1.4vw;
                    }
                    &__signature {
                        transform: translate(10%, 0%);
                    }
                }
            }
        }

    @include break-up('md') {
        padding-top: 75px;
        padding-bottom: 75px;

        width: 80%;
        margin: 10% auto;
        margin-bottom: 5%;        
    }
}
.about-nav {
    position: relative;
    top: -60px;
}

</style>

<div class="about-nav" id="about"></div>
<div class="about row">
    <div class="about__photo col">
        <img src={about} alt="Savanna Grunzke photography">
    </div>
    <div class="about__bio col">
        <div class="about__bio__header vollkorn">
            <h2>Behind the lens</h2>
        </div>
        <div class="about__bio__content alegreya">
            <p>Hey! I’m Savanna Rose Grunzke (SRG). I’ve loved photography and media for as long as i can remember. Movies were my first love, and they still win my heart every time, but growing up in a small town in Southern MN didn’t give me many oportunities to learn more about film, so I took up photography and tought myself!</p>
            <p>I envy the art of capturing a moment and keeping it forever. My job and passion is to help you capture your moments. For more information, go to my bio or contact me for questions.</p>
            <p>XOXO,</p>
            <div class="about__bio__content__signature"><img {src} alt="Savanna Grunzke signature" /></div>
        </div>
    </div>
</div>

