<script>
import { Link } from 'yrv';  
import NavLinks from './NavLinks.svelte';  
import { fly, fade } from 'svelte/transition';
import "hamburgers/dist/hamburgers.css";
import { onMount } from 'svelte';

let showNav = false;
let previousScroll = 0;

onMount(async () => {
    if(window.innerWidth > 768) {
        showNav = true;
    }
    window.addEventListener('scroll', function(e) { 
        if(window.innerWidth > 768) {
            if(window.scrollY == 0) {
                showNav = true;
                previousScroll = window.scrollY;
            }
            if(window.scrollY > previousScroll) {
                // if(showNav === true)  {
                    showNav = false;
                    previousScroll = window.scrollY;
                // }
            }
            else {
                showNav = true;
                previousScroll = window.scrollY;

            }
        }
    });
});

function showMobileNav() {
    showNav = !showNav;
    if(showNav === true) {
        document.body.classList.add('no-scroll');
    }
    else {
        document.body.classList.remove('no-scroll');
    }
    console.log('remove scroll')
}

</script>


<style type="text/scss">
@import '../../assets/scss/mixins/mixins';

.hamburger-inner, .hamburger-inner:before, .hamburger-inner:after{
    background-color: var(--sg-tan);
}

.is-active {
    .hamburger-inner, .hamburger-inner:before, .hamburger-inner:after{
        background-color: #445B47;
    }
}

.ham-nav {
    position: fixed;
    top: 0%;
    right: 0%;
    z-index: 1005;
    border-radius: 1px;
    width: 100%;
    height: 100%;

    button {
        // color: #F0DEB4;
        // background: #F0DEB4;
        border-radius: 0;

        position: absolute;
        top: 0;
        right: 0;
        z-index: 1006;
        // text-align: right;
        padding: 25px 47px; 
        // font-size: 30px;
        // transition: 0.3s;

        @include break-up('md') {
            padding: 25px 30px;
        }
        
        // &:hover {
        //     cursor: pointer;
        //     transform: scale(1.1);
        //     transition: 0.2s;
        // }
        &:active {
            background: none;
        }
    }
    &__menu {
        
        padding-right: 5px;
        padding-left: 5px;
        padding-top: 60px;    
        background-color: var(--sg-cream);
        // opacity: 0.73;
        height: 100%;
        @include break-up('md') {
            padding-right: 80px;
            padding-top: 0;
            height: auto;            
        }
    }
    @include break-up('md') {
        width: auto;
        height: auto;
    }
}
.overlay {
    z-index: 999;
    position: fixed;
    opacity: 0.5;
    overflow-y: hidden;
    height: 120vh;
}
.hide-nav {
    width: 0;
}
</style>


<div class="ham-nav d-none d-md-flex">
    {#if showNav}
        <div in:fly="{{ x: 200, duration: 300 }}" out:fly="{{ x: 200, duration: 300 }}" class="ham-nav__menu d-flex flex-column flex-md-row">
            <NavLinks showLinks={showNav}/> 
        </div>
    {/if}
    <!-- <i on:click="{()=> showNav = !showNav}" class="fas fa-bars"></i> -->
    <button on:click="{()=> showNav = !showNav}" class="hamburger hamburger--slider" class:is-active="{showNav == true}" type="button">
        <span class="hamburger-box">    
            <span class="hamburger-inner"></span>
        </span>
    </button> 
</div>

<div class="ham-nav d-flex d-md-none flex-column" class:hide-nav="{showNav == false}">
    <!-- <i on:click="{showMobileNav}" class="fas fa-bars"></i> -->
    <button on:click="{showMobileNav}" class="hamburger hamburger--slider" class:is-active="{showNav == true}" type="button">
        <span class="hamburger-box">
            <span class="hamburger-inner"></span>
        </span>
    </button> 
    {#if showNav}
        <div in:fly="{{ x: 200, duration: 300 }}" out:fly="{{ x: 200, duration: 300 }}" class="ham-nav__menu d-flex flex-column flex-md-row">
            <NavLinks on:close={showMobileNav} showLinks={showNav}/>
        </div> 
    {/if}
</div>
{#if showNav}
    <div on:click={showMobileNav} transition:fade class="d-block d-md-none overlay"></div>
{/if}


