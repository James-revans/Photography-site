<script>
import VideoBlade from './VideoBlade.svelte';

</script>

<style type="text/scss">
@import '../../assets/scss/mixins/mixins';

.sg-video-list {
    // padding-top: 50px;
    padding-bottom: 0;
    position: relative;

    iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;   
    }
    h2 {
        margin-top: 0;
        font-weight: 100;
        font-family: 'Vollkorn SC', serif;
    } 
    p {
        margin-bottom: 20px;
        font-family: 'Alegreya Sans SC', sans-serif;
        font-size: 18px;
        // font-variant: small-caps;
    }
    a {
        color: #445B47;
        font-weight: bold;
        &:hover {
            text-decoration: none;
            border-bottom: solid thin #445B47;   
        }
    }
}
.sg-video-list-header {
    width: 100%;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10% 0;

    h2 {
        text-align: center;
        font-weight: 100;
        font-size: 40px;
    }
    @include break-up('lg') {
        padding: 5% 0;
    }
}

</style>

<div class="sg-video-list-header vollkorn sg-green">
    <h2>My recent work</h2>
</div>
<div class="sg-video-list">
    <VideoBlade>
        <span slot="video"><iframe width="560" height="315" src="https://www.youtube.com/embed/oKjTc_AzUVI" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></span>
        <span slot="title"><h2>| Camp Kesem |</h2></span>
        <span slot="text"><p>Thank you to Camp Kesem at University of Minnesota for letting me capture the magic of camp. If you didn’t know, Camp Kesem is a free camp for kids who have closely experienced cancer in the family. If you feel so inclined, please follow the link to learn more and/or donate. <a target="_blank" href="https://www.campkesem.org/find-a-camp/camp-kesem-at-university-of-minnesota">Learn more</a></p></span>
    </VideoBlade>

    <VideoBlade>
        <span slot="video"><iframe width="560" height="315" src="https://www.youtube.com/embed/ZGn8UYaJrFk" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></span>
        <span slot="title"><h2>| Hawaii 2019 |</h2></span>
        <span slot="text"><p>April 27th-May 4th I was fotrunate enough to join my mom and her boyfriend jayson on a trip to Kauai, HI. I have always felt that I was an island beach bum in a past life, so I finally got to live out my dreams. Travel has always been a priority to me, and I’m so lucky to have amazing opportunities like these.</p></span>
    </VideoBlade>
    <VideoBlade>
        <span slot="video"><iframe width="560" height="315" src="https://www.youtube.com/embed/x8WQ0k9jbrI" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></span>
        <span slot="title"><h2>| Southeast Asia 2018 |</h2></span>
        <span slot="text"><p>Yet another lucky opportunity sent my way. My mom and I accompanied the UW-Eau Claire Blugold Marching Band(which my sister, Peyton, was a part of) on a 3-week cruise around asia including the countries of Singapore, Malaysia, Thailand, and Indonesia. My first journey outside of the United States.</p></span>
    </VideoBlade>

    <VideoBlade>
        <span slot="video"><iframe width="560" height="315" src="https://www.youtube.com/embed/XDjvLAf8sIA" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></span>
        <span slot="title"><h2>| Spring Break 2019 |</h2></span>
        <span slot="text"><p>After originally planning a roadtrip to Colorado, my roommates and I decided to save money by roadtripping around Eastern Wisconsin from Egg Harbor to Chicago  instead. Although many things didn’t go as planned, I would say it was a very memorable trip with some of my favorite people.</p></span>
    </VideoBlade>

    <VideoBlade>
        <span slot="video"><iframe width="560" height="315" src="https://www.youtube.com/embed/iv_SK7mlDms" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></span>
        <span slot="title"><h2>| Washington 2019 |</h2></span>
        <span slot="text"><p>Over winter break my sister and I traveled to Seattle, WA for the second time. I instantly grew a love for Washington and its scenic geography excluding the slightly gloomy weather. Right between the expansive coast and awe-inspiring mountainscapes, Washington holds a special place in my heart, and I can’t wait to return again someday soon.</p></span>
    </VideoBlade>
</div>