<script>
    import { Link } from 'svero';
</script>

<style type="text/scss">

:global(.link-styles) {
    transition: 0.2s;
    padding-bottom: 5px;
    margin: 20px;
    margin-top: 20px;
    font-size: 20px;
    border-bottom: solid thin transparent;
    &:hover {
        text-decoration: none;
        transform: scale(1.05);
        transition: 0.2s;
        text-shadow: 0px 0px transparent;
        border-bottom-color: black;
    }
    &:visited {
        color: black;
    }
}

</style>


<Link href="/" className="link-styles sg-green">home</Link>
<Link href="/gallery" className="link-styles sg-green">gallery</Link>
<Link href="/videography" className="link-styles sg-green">videos</Link>
<a href="#about" class="link-styles sg-green">bio</a>
<Link href="/contact" className="link-styles sg-green">contact</Link>


