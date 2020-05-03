<script>
let src = "images/Bio-Sav.jpg";
</script>


<style type="text/scss">
@import '../../assets/scss/mixins/mixins';
.bio-content {
    &__text {
        h1 {
            font-weight: 100;
            font-size: 60px;
            border-bottom: solid thin #445B47;
            display: inline-block;
            padding-bottom: 2%;
            margin-bottom: 2%;
        }
        p {
            font-size: 24px;
        }

        // font-variant: small-caps;
        width: 60%;
        margin: 0 auto;
        padding: 5% 10%;
        // @include break-down('lg') {

        // }
        @media only screen and (max-width: 800px) {
            width: 90%;
            padding: 2% 0;
            p { font-size: 15px; }
            h1 { font-size: 50px; }
        }

    }
    &__img {
        width: 100%;
        img {
            width: 100%;
            height: auto;
        }
        padding: 30px 0;
    }
}
</style>


<div class="bio-content">
    <div class="bio-content__text sg-green alegreya">
        <h1 class="vollkorn">About Me</h1>
        <p>Hey, you! Glad to have you here. As we may be working together soon, which I hope we will, I’d like for you to know a little more about me. I grew up in Waseca, MN and currently go to school at the University of Wisconsin-Eau Claire studying environmental geography and economics. I’m all for preserving the environment and Earth’s precious resources. I am also a member of the Minnesota Army National Guard which keeps me rather busy and active. I have a large expanse of interests, and when i say large, I mean LARGE. I involve myself in anything from baking to woodworking and I especially enjoy traveling!</p>
        <p>I have a very strong connection to nature, and I’m always inspired by its beauty. I love spending time outdoors, absorbing as much sunlight as I can. I am often described as adventurous, creative, and ambitious. My strongest belief is that you can make anything happen if you really put your mind and soul into it.</p>
        <p>YOU CAN CREATE THE LIFE YOU WANT.</p>
        <p>So that’s what I’m doing. Capturing and creating life’s most precious moments is what I beleive to be my current purpose. Allow me to accompany you in preserving these moments.</p>
    </div>
    <div class="bio-content__img">
        <img src={src} alt="Savanna Grunzke">
    </div>
</div>
