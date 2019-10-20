<script>
import { Link } from 'svero';  
import NavLinks from './NavLinks.svelte';  
import { fade } from 'svelte/transition';


let showNav = false;
function closeMobileNav() {
    showNav = !showNav;
    document.body.classList.remove('no-scroll');
}

function showMobileNav() {
    showNav = !showNav;
    document.body.classList.add('no-scroll');
}

</script>


<style type="text/scss">
.ham-nav {
    position: fixed;
    top: 0%;
    right: 0%;
    z-index: 1002;
    border-radius: 1px;

    i {
        color: #F0DEB4;
        position: absolute;
        top: 0;
        right: 0;
        text-align: right;
        padding: 20px 44px;
        font-size: 30px;
        transition: 0.3s;
        @media only screen and (min-width: 577px) {
            padding: 20px 30px;
        }
        
        &:hover {
            cursor: pointer;
            transform: scale(1.1);
            transition: 0.2s;
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
        <div transition:fade class="ham-nav__menu d-flex flex-column flex-md-row">
            <NavLinks showLinks={showNav}/>
        </div>
    {/if}
    <i on:click="{()=> showNav = !showNav}" class="fas fa-bars"></i>
</div>

<div class="ham-nav d-flex d-md-none flex-column">
    <i on:click="{showMobileNav}" class="fas fa-bars"></i>
    {#if showNav}
        <div transition:fade class="ham-nav__menu d-flex flex-column flex-md-row">
            <NavLinks on:close={closeMobileNav} showLinks={showNav}/>
        </div> 
    {/if}
</div>
{#if showNav}
    <div on:click={closeMobileNav} transition:fade class="d-block d-md-none overlay"></div>
{/if}


