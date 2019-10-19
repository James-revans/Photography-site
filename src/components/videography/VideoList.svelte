<script>
import VideoBlade from './VideoBlade.svelte';


</script>

<style type="text/scss">
.sg-video-list {
    padding-top: 50px;
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
        font-family: 'Montserrat', sans-serif;
        font-size: 15px;
        font-variant: small-caps;
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
    padding-top: 10%;

    h2 {
        text-align: center;
        font-weight: 100;
        font-size: 40px;
    }
    @media only screen and (min-width: 800px) {
        padding-top: 5%;
        
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
        <span slot="text"><p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus tempore, in ad laborum sunt ex itaque veniam rem at aperiam autem culpa ipsa illum fugiat eligendi impedit nobis eius nisi!</p></span>
    </VideoBlade>
    <VideoBlade>
        <span slot="video"><iframe width="560" height="315" src="https://www.youtube.com/embed/x8WQ0k9jbrI" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></span>
        <span slot="title"><h2>| Southeast Asia 2018 |</h2></span>
        <span slot="text"><p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus tempore, in ad laborum sunt ex itaque veniam rem at aperiam autem culpa ipsa illum fugiat eligendi impedit nobis eius nisi!</p></span>
    </VideoBlade>

    <VideoBlade>
        <span slot="video"><iframe width="560" height="315" src="https://www.youtube.com/embed/XDjvLAf8sIA" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></span>
        <span slot="title"><h2>| Spring Break 2019 |</h2></span>
        <span slot="text"><p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus tempore, in ad laborum sunt ex itaque veniam rem at aperiam autem culpa ipsa illum fugiat eligendi impedit nobis eius nisi!</p></span>
    </VideoBlade>

    <VideoBlade>
        <span slot="video"><iframe width="560" height="315" src="https://www.youtube.com/embed/iv_SK7mlDms" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></span>
        <span slot="title"><h2>| Washington 2019 |</h2></span>
        <span slot="text"><p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus tempore, in ad laborum sunt ex itaque veniam rem at aperiam autem culpa ipsa illum fugiat eligendi impedit nobis eius nisi!</p></span>
    </VideoBlade>
</div>