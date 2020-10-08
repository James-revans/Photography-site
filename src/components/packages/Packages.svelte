<script>
    import packages from "./package-data";
    import PageBanner from "../base/PageBanner.svelte";
    import Footer from "../home/Footer.svelte";
    import PackageOutline from "./Packages-outline.svelte";
    import PackageWriting from "./Package-writing.svelte";
    const url = './images/Contact-Banner-min.jpg';
</script>
<style>
    .descriptions{
        display:flex;
        flex-direction: column;
        align-items: center;
        height: 100vh;
    }

    .writing{
        height: 100vh;
    }

</style>


<PageBanner img={url}>
    <h1>Packages</h1>
</PageBanner>

<div class="writing">
    <PackageWriting />
</div>

<!-- <div class='descriptions'> -->
    {#each packages as packages}
        <PackageOutline {...packages} />
    {/each}
<!-- </div> -->

<Footer/>