<script>
import VideoBlade from './VideoBlade.svelte';


</script>

<style type="text/scss">
.sg-video-list {
    padding: 50px 0px;
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
        font-family: 'Raleway', sans-serif;
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
        <span slot="video"><iframe src="https://player.vimeo.com/video/136722796" width="640" height="360" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe></span>
        <span slot="title"><h2>Stock Video</h2></span>
        <span slot="text"><p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus tempore, in ad laborum sunt ex itaque veniam rem at aperiam autem culpa ipsa illum fugiat eligendi impedit nobis eius nisi!</p></span>
    </VideoBlade>

    <VideoBlade>
        <span slot="video"><iframe src="https://player.vimeo.com/video/288344114?title=0&byline=0&portrait=0" width="640" height="360" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe></span>
        <span slot="title"><h2>Another Stock Video</h2></span>
        <span slot="text"><p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus tempore, in ad laborum sunt ex itaque veniam rem at aperiam autem culpa ipsa illum fugiat eligendi impedit nobis eius nisi!</p></span>
    </VideoBlade>

    <VideoBlade>
        <span slot="video"><iframe src="https://player.vimeo.com/video/252028586?color=f7f7f7&title=0&byline=0&portrait=0" width="640" height="360" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe></span>
        <span slot="title"><h2>Random Ass Video</h2></span>
        <span slot="text"><p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus tempore, in ad laborum sunt ex itaque veniam rem at aperiam autem culpa ipsa illum fugiat eligendi impedit nobis eius nisi!</p></span>
    </VideoBlade>
</div>