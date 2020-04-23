<script>
import { onMount } from 'svelte';
import { fly, fade } from 'svelte/transition';

let items = [1, 2, 3];
let showItems = false;

const togglCart = () => {
    showItems = !showItems;
};

</script>

<div class="cart alegreya">
    <div class="cart-icon">
        <h2 on:click={togglCart}><i class="fas fa-shopping-cart sg-green"></i> {items.length > 0 ? `(${items.length})` : ''} <i class="{showItems ? "arrow-up" : "arrow-down"} fas fa-caret-down"></i></h2>
    </div>
    {#if showItems}
        <div class="{showItems ? "items-show" : "items-hide"} items" in:fly="{{ x: 200, duration: 300 }}" out:fly="{{ x: 200, duration: 300 }}">
            <h2>Cart</h2>

        {#each items as item}
            <div>
                
            </div>
        {/each}
            <button class="button alegreya">Proceed to checkout</button>
        </div>
    {/if}
</div>

<style type="text/scss">
@import '../../../assets/scss/mixins/mixins';

.cart {
    position: fixed;
    display: inline-block;
    top: 0;
    left: 0;
    right: auto;
    z-index: 1005;
    color: var(--sg-green);
    font-size: 20px;
    .cart-icon {
        position: absolute;
        top: 0;
        right: 0;
        cursor: pointer;
        background-color: var(--sg-cream);
        padding: 20px;
        white-space: nowrap;
        z-index: 1007;
        h2 {
            font-size: 20px;
            font-weight: 100;
            text-align: right;
            margin: 0;
        }
    }

    button { font-size: 20px; }
    @include break-up('lg') {
        top: 90px;
        right: 0;
        left: auto;
        font-size: 25px;
        .cart-icon h2, button {font-size: 25px;}
        .cart-icon {
            h2 {text-align: left}; 
        }
    }
}

.arrow-up {
    transform: rotate(0deg);
    margin-left: 10px;
    transition: 0.2s;
}
.arrow-down {
    transform: rotate(-90deg);
    margin-left: 10px;
    transition: 0.2s;
}

.button {
    background-color: var(--sg-green);
    color: var(--sg-cream);
    border: none;
    font-size: 25px;
    padding: 10px 30px;
    margin: 5px;
    &:hover {
        cursor: pointer;
    }
}
.items {
    background-color: var(--sg-cream);
    h2 {
        margin: 0;
        padding: 20px;
        font-size: 20px;
    }
    @include break-up('lg') {
        font-size: 25px;
        h2 {font-size: 25px;}
    }
}

</style>