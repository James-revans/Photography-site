<script>
import { Link } from 'svero';  
import NavLinks from './NavLinks.svelte';  
import { fade } from 'svelte/transition';


let showNav = false;

</script>


<style type="text/scss">
.ham-nav {
    position: fixed;
    top: 0%;
    right: 0%;
    z-index: 1000;
    border-radius: 1px;

    i {
        
        position: absolute;
        top: 0;
        right: 0;
        text-align: right;
        
        padding: 20px 44px;
        font-size: 30px;
        @media only screen and (min-width: 577px) {
            padding: 20px 30px;
        }
        
        &:hover {
            cursor: pointer;
        }
    }
    &__menu {
        
        padding-right: 5px;
        padding-left: 5px;
        padding-top: 60px;    
        background: rgba(255, 255, 255, 0.753);
        @media only screen and (min-width: 577px) {
            padding-right: 80px;
            padding-top: 0;
        }
    }
}

</style>


<div class="ham-nav d-none d-md-flex flex-row">
    {#if showNav}
        <div transition:fade class="ham-nav__menu d-flex flex-column flex-md-row">
            <NavLinks/>
        </div>
    {/if}
    <i on:click="{()=> showNav = !showNav}" class="fas fa-bars"></i>
</div>

<div class="ham-nav d-flex d-md-none flex-column">
    <i on:click="{()=> showNav = !showNav}" class="fas fa-bars"></i>
    {#if showNav}
        <div transition:fade class="ham-nav__menu d-flex flex-column flex-md-row">
            <NavLinks/>
        </div>
    {/if}
</div>


