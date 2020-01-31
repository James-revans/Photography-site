<script>
    import PageBanner from "../base/PageBanner.svelte";
    import BioAboutMe from "./BioAboutMe.svelte";
    import Footer from "../home/Footer.svelte";
    const url = './images/Bio-Banner.jpg';
    let showPage = false;
</script>
    
<PageBanner on:loaded='{() => showPage = true}' img={url}>
    <h1>Savanna Grunzke</h1>
</PageBanner>
{#if showPage}
    <BioAboutMe/>
    <Footer/>
{/if}