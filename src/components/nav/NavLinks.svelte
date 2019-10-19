<script>
    import { Link } from 'svero';
    import { createEventDispatcher } from 'svelte';
    let navSelect;
    let windowSize = window.innerHeight;
    const dispatch = createEventDispatcher();
    export let showLinks = false;

    function tabSelect(tab) {
        scroll(0,0);
        navSelect = tab;
        console.log(tab);
        if(tab == 'bio') {
            scroll(0, windowSize);
        }
        if(window.innerWidth < 577) {
            showLinks = false;
            dispatch('close', false);
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
        display: block;
        border-bottom: solid thin transparent;
        padding-bottom: 5px;
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


<div class="link-container d-flex flex-column flex-md-row">
    <Link on:click="{() => tabSelect('home')}" href="/" className="link-styles sg-green"><p class="p-link" class:active="{navSelect === 'home'}">home</p></Link>
    <Link on:click="{() => tabSelect('gallery')}" href="/gallery" className="link-styles sg-green"><p class="p-link" class:active="{navSelect === 'gallery'}">gallery</p></Link>
    <Link on:click="{() => tabSelect('videos')}" href="/videography" className="link-styles sg-green"><p class="p-link" class:active="{navSelect === 'videos'}">cinema</p></Link>
    <Link on:click="{() => tabSelect('bio')}" href="/about" className="link-styles sg-green"><p class="p-link" class:active="{navSelect === 'bio'}">bio</p></Link>
    <Link on:click="{() => tabSelect('contact')}" href="/contact" className="link-styles sg-green"><p class="p-link" class:active="{navSelect === 'contact'}">contact</p></Link>
</div>

