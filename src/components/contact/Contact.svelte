<script>
    import PageBanner from "../base/PageBanner.svelte";
    import ContactForm from "./ContactForm.svelte";
    import Footer from "../home/Footer.svelte";
    const url = './images/Contact-Banner.jpg';
</script>


<PageBanner img={url}>
    <h1>Contact</h1>
</PageBanner>

<ContactForm/>
<Footer/>