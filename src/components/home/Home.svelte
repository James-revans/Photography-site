<script>
    import Banner from './Banner.svelte';
    import About from './About.svelte';
    import Recent from './Recent.svelte';
    import Footer from './Footer.svelte';

    let imgLoaded = false;
</script>

<style>
.sg-home {
    scroll-behavior: smooth;
}
</style>

<div class="sg-home">
    <Banner on:loaded="{() => imgLoaded = true}"/>
    <!-- {#if imgLoaded} -->
        <About/>
        <Recent/>
        <Footer/>
    <!-- {/if} -->
</div>

