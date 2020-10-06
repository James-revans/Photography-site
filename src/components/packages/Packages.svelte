<script>
    import PageBanner from "../base/PageBanner.svelte";
    import Footer from "../home/Footer.svelte";
    import packages from "./package-data";
    import PackageDescription from "./Packages-description.svelte"
    const url = './images/Contact-Banner-min.jpg';
</script>


<PageBanner img={url}>
    <h1>Packages</h1>
</PageBanner>
<h3>How it Works</h3>
<p>So I’ll post the photos in a Pixieset folder that the client will have access to holding about the number of images the package comes with.</p>

{#each packages as packages}
    <PackageDescription {...packages} />
{/each}
<h3>Disclaimer</h3>
<p>I’ll have a little disclaimer at the bottom of the page saying I can compromise on different options or whatever through communication.</p>

<Footer/>