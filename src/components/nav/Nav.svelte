<script>
    import { Link } from 'svero';
</script>

<style type="text/scss">
.sg-nav {
    position: sticky;
    z-index: 3;
    width: 100%;
    text-align: right;
    font-weight: 100;
    top: 0;
    left: 0;
    background: #F0DEB4;
    display: flex;
    justify-content: flex-end;

    :global(.link-styles), a {
        color: rgb(255, 255, 255);
        text-shadow: 0px 1px rgba(70, 70, 70, 0.678);
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
            color: rgb(0, 0, 0);
            text-shadow: 0px 0px transparent;
            border-bottom-color: black;
        }
        
    }


}
</style>

<div class="sg-nav raleway">

    <Link href="/" className="link-styles">home</Link>
    <Link href="/gallery" className="link-styles">gallery</Link>
    <Link href="/videography" className="link-styles">videos</Link>
    <a href="#about" className="link-styles">bio</a>
    <Link href="/contact" className="link-styles">contact</Link>

</div>

