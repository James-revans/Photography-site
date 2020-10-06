<script>
    import { Link } from 'yrv';
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
    const next = (dest) => router.send(dest);

</script>

<style type="text/scss">
@import '../../assets/scss/mixins/mixins';
.link-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    flex-grow: 1;
    @include break-up('sm') {
        flex-direction: row;
        height: auto;
    }
}

:global(a) {
    transition: 0.2s;
    font-size: 16px;
    -webkit-tap-highlight-color: transparent;
    text-decoration: none;
    
    &:visited {
        color: rgb(68, 91, 71);
    }
    p {
        display: block;
        border-bottom: solid thin transparent;
        padding: 5px 0;
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
    @include break-up('sm') {

    }
}

.img {
    width: 70px;

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

<div class="link-container montserrat">
    <div class="img"><img {src}></div>
    <Link on:click="{() => tabSelect('home')}" href="/" class="link-styles sg-green"><p class:active="{navSelect === 'home'}">home</p></Link>
    <Link on:click="{() => tabSelect('gallery')}" href="/gallery" class="link-styles sg-green"><p class:active="{navSelect === 'gallery'}">gallery</p></Link>
    <Link on:click="{() => tabSelect('videography')}" href="/videography" class="link-styles sg-green"><p class:active="{navSelect === 'videos'}">cinema</p></Link>
    <Link on:click="{() => tabSelect('bio')}" href="/bio" class="link-styles sg-green"><p class:active="{navSelect === 'bio'}">bio</p></Link>
    <Link on:click="{() => tabSelect('store')}" href="/store" class="link-styles sg-green"><p class:active="{navSelect === 'store'}">store</p></Link>
    <Link on:click="{() => tabSelect('contact')}" href="/contact" class="link-styles sg-green"><p class:active="{navSelect === 'contact'}">contact</p></Link>
    <Link on:click="{() => tabSelect('pricing')}" href="/pricing" class="link-styles sg-green"><p class:active="{navSelect === 'pricing'}">pricing</p></Link>
</div>

    <!-- <Link on:click="{() => tabSelect('home')}" href="/" class="link-styles sg-green"><p class:active="{navSelect === 'home'}">home</p></Link>
    <Link on:click="{() => tabSelect('gallery')}" href="/gallery" class="link-styles sg-green"><p class:active="{navSelect === 'gallery'}">gallery</p></Link>
    <Link on:click="{() => tabSelect('videography')}" href="/videography" class="link-styles sg-green"><p class:active="{navSelect === 'videos'}">cinema</p></Link>
    <Link on:click="{() => tabSelect('bio')}" href="/bio" class="link-styles sg-green"><p class:active="{navSelect === 'bio'}">bio</p></Link>
    <Link on:click="{() => tabSelect('store')}" href="/store" class="link-styles sg-green"><p class:active="{navSelect === 'store'}">store</p></Link>
    <Link on:click="{() => tabSelect('contact')}" href="/contact" class="link-styles sg-green"><p class:active="{navSelect === 'contact'}">contact</p></Link> -->


