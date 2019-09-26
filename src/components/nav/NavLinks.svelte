<script>
    import { Link } from 'svero';
 
    let navSelect = 'home';
    let windowSize = window.innerHeight;

    function tabSelect(tab) {
        
        scroll(0,0);
        navSelect = tab;
        if(tab == 'bio') {
            scroll(0, windowSize);
        }
    }


</script>

<style type="text/scss">

:global(.link-styles) {
    transition: 0.2s;
    padding: 0 20px;
    padding-bottom: 5px;
    font-size: 20px;

    -webkit-tap-highlight-color: transparent;

    &:hover {
        text-decoration: none;
    }
    
    &:visited {
        color: rgb(68, 91, 71);
    }
    p {
        border-bottom: solid thin transparent;
        &:active {
            border-bottom-color: rgb(68, 91, 71);
        }
        &:hover {
            text-decoration: none;
            transform: scale(1.05);
            transition: 0.2s;
            text-shadow: 0px 0px transparent;
            border-bottom-color: #F0DEB4;
            @media only screen and (min-width: 1024px) {
                border-bottom-color: rgb(68, 91, 71);
            }
        }
    }
    .active {
        border-bottom-color: #F0DEB4;
        border-bottom-width: 4px;
        transition: 0.2s;
    }
}
</style>

<Link on:click="{() => tabSelect('home')}" href="/" className="link-styles sg-green"><p class:active="{navSelect === 'home'}">home</p></Link>
<Link on:click="{() => tabSelect('gallery')}" href="/gallery" className="link-styles sg-green"><p class:active="{navSelect === 'gallery'}">gallery</p></Link>
<Link on:click="{() => tabSelect('videos')}" href="/videography" className="link-styles sg-green"><p class:active="{navSelect === 'videos'}">videos</p></Link>
<Link on:click="{() => tabSelect('bio')}" href="/about" className="link-styles sg-green"><p class:active="{navSelect === 'bio'}">bio</p></Link>
<Link on:click="{() => tabSelect('contact')}" href="/contact" className="link-styles sg-green"><p class:active="{navSelect === 'contact'}">contact</p></Link>


