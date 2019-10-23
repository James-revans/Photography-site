<script>
import { Link } from 'svero';  
import NavLinks from './NavLinks.svelte';  
import { fly, fade } from 'svelte/transition';
import "hamburgers/dist/hamburgers.css";

let showNav = false;

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
.hamburger-inner, .hamburger-inner:before, .hamburger-inner:after{
    background-color: #F0DEB4;
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

    button {
        // color: #F0DEB4;
        // background: #F0DEB4;
        border-radius: 0;

        position: absolute;
        top: 0;
        right: 0;
        z-index: 1006;
        // text-align: right;
        padding: 20px 47px; 
        // font-size: 30px;
        // transition: 0.3s;
        @media only screen and (min-width: 577px) {
            padding: 20px 30px;
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
        background: rgb(255, 255, 246);
        opacity: 0.73;
        @media only screen and (min-width: 577px) {
            padding-right: 80px;
            padding-top: 0;
        }
    }
}
.overlay {
    z-index: 999;
    position: fixed;
    opacity: 0.5;
    overflow-y: hidden;
    height: 120vh;
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

<div class="ham-nav d-flex d-md-none flex-column">
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


