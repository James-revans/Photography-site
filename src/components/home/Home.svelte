<script>
    import Banner from './Banner.svelte';
    import About from './About.svelte';
    import Recent from './Recent.svelte';
    import Footer from './Footer.svelte';
</script>

<style>
.sg-home {
    scroll-behavior: smooth;
}
</style>

<div class="sg-home">
    <Banner/>
    <About/>
    <Recent/>
    <Footer/>
</div>

