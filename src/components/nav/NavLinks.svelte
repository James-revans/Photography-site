<script>
    import { Link } from 'svero';
    import { createEventDispatcher } from 'svelte';
    let src = './images/SavLogo.jpg';
    let navSelect;
    let windowSize = window.innerHeight;
    const dispatch = createEventDispatcher();
    export let showLinks = false;

    function tabSelect(tab) {
        scroll(0,0);
        navSelect = tab;
        // if(tab == 'bio') {
        //     scroll(0, windowSize);
        // }
        if(window.innerWidth < 577) {
            showLinks = false;
            dispatch('close', false);
        }
    }

</script>

<style type="text/scss">
@import '../../assets/scss/mixins/mixins';

:global(.link-styles) {
    transition: 0.2s;
    padding: 8% 14px;
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
        text-transform: uppercase;
        &:active {
            border-bottom-color: rgb(68, 91, 71);
        }
        &:hover {
            text-decoration: none;
            transform: scale(1.05);
            transition: 0.2s;
            text-shadow: 0px 0px transparent;
            border-bottom-color: #F0DEB4;

            @include break-up('lg') {
                border-bottom-color: rgb(68, 91, 71);
            }
        }
    }
    .active {
        border-bottom-color: #F0DEB4;
        border-bottom-width: 4px;
        transition: 0.2s;
    }

    @include break-up('md') {
        padding: 0 20px;
    }
}

.img {
    width: 80px;

    img {
        width: 100%;
    }
    @include break-down('md') {
        position: absolute;
        top: 0%;
        left: 7%;
    }
}

</style>

<div class="link-container d-flex flex-column flex-md-row montserrat align-items-center">
    <div class="img"><img {src}></div>
    <Link on:click="{() => tabSelect('home')}" href="/#" className="link-styles sg-green"><p class="p-link" class:active="{navSelect === 'home'}">home</p></Link>
    <Link on:click="{() => tabSelect('gallery')}" href="/#/gallery" className="link-styles sg-green"><p class="p-link" class:active="{navSelect === 'gallery'}">gallery</p></Link>
    <Link on:click="{() => tabSelect('videos')}" href="/#/videography" className="link-styles sg-green"><p class="p-link" class:active="{navSelect === 'videos'}">cinema</p></Link>
    <Link on:click="{() => tabSelect('bio')}" href="/#/bio" className="link-styles sg-green"><p class="p-link" class:active="{navSelect === 'bio'}">bio</p></Link>
    <Link on:click="{() => tabSelect('contact')}" href="/#/contact" className="link-styles sg-green"><p class="p-link" class:active="{navSelect === 'contact'}">contact</p></Link>
</div>

    <!-- <Link on:click="{() => tabSelect('home')}" href="/" className="link-styles sg-green"><p class="p-link" class:active="{navSelect === 'home'}">home</p></Link>
    <Link on:click="{() => tabSelect('gallery')}" href="/gallery" className="link-styles sg-green"><p class="p-link" class:active="{navSelect === 'gallery'}">gallery</p></Link>
    <Link on:click="{() => tabSelect('videos')}" href="/videography" className="link-styles sg-green"><p class="p-link" class:active="{navSelect === 'videos'}">cinema</p></Link>
    <Link on:click="{() => tabSelect('bio')}" href="/about" className="link-styles sg-green"><p class="p-link" class:active="{navSelect === 'bio'}">bio</p></Link>
    <Link on:click="{() => tabSelect('contact')}" href="/contact" className="link-styles sg-green"><p class="p-link" class:active="{navSelect === 'contact'}">contact</p></Link> -->

