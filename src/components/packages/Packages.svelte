<script>
    import packages from "./package-data";
    import PageBanner from "../base/PageBanner.svelte";
    import Footer from "../home/Footer.svelte";
    import PackageOutline from "./Packages-outline.svelte";
    import PackageWriting from "./Package-writing.svelte";
    const url = './images/Contact-Banner-min.jpg';
</script>
<style>
    .writing{
        /* height: 100vh; */
    }

    .packages-main{
        display: flex;
        flex-direction: column;
        width: 60%;
        margin: 0 auto;
        padding-left: 5px;
        padding-right: 5px;
    }

</style>


<PageBanner img={url}>
    <h1>Pricing</h1>
</PageBanner>

<div class="writing">
    <PackageWriting />
</div>
<div class='packages-main'>
    {#each packages as packages}
        <PackageOutline {...packages}/>
    {/each}
</div>
    

<Footer/>