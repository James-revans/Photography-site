<script>
    import PageBanner from "../base/PageBanner.svelte";
    import Footer from "../home/Footer.svelte";
    import packages from "./package-data";
    import PackageDescription from "./Packages-description.svelte"
    const url = './images/Contact-Banner-min.jpg';
</script>
<style>
    .descriptions{
        display:flex;
        flex-direction: column;
        align-items: center;
    }

    h1{
        font-family: 'Permanent Marker', cursive;
        font-size: 3vw;
    }

    p{
        font-size: 1.25vw;
    }

    .package-text{
        display:flex;
        flex-direction: column;
        align-items: center;
    }

</style>


<PageBanner img={url}>
    <h1>Packages</h1>
</PageBanner>
<div class='package-text'>
    <h1>How it Works</h1>
    <p>So I’ll post the photos in a Pixieset folder that the client will have access to holding about the number of images the package comes with.</p>
</div>

<div class='descriptions'>
    {#each packages as packages}
        <PackageDescription {...packages} />
    {/each}
</div>
<div class='package-text'>
    <h1>Disclaimer</h1>
    <p>I’ll have a little disclaimer at the bottom of the page saying I can compromise on different options or whatever through communication.</p>
</div>
<Footer/>