<script>
import { onMount } from 'svelte';
import { fly, fade } from 'svelte/transition';
import cart from "shared/stores/cart.store.js";
import { loadStripe } from '@stripe/stripe-js';

let showItems = false;
let stripe;
onMount(async() => {
    stripe = await loadStripe('pk_test_LnSZ7UkQkfmtKtBr2Hdjtbtm00MLu5KDIl');
})
const togglCart = () => {
    showItems = !showItems;
};

$: sessionInfo = {
    success_url: 'http://localhost:3000/#/store',
    cancel_url: 'http://localhost:3000/#/store',
    payment_method_types: ['card'],
        line_items: $cart,
}

//     line_items: [
//     {
//         name: 'T-shirt',
//         description: 'SRG Preset',
//         amount: 6,
//         currency: 'usd',
//         quantity: 1,
//     },
// ],

const proceedToCheckout = () => {
    if(sessionInfo.line_items.length > 0) {

        async function createSession() {
            const response = await fetch(
                'http://localhost:3000/api/store',
                {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(sessionInfo)
                }
            )
            return response.json();
        }
        createSession(sessionInfo).then((data) => {
            (async() => {
                const {error} = await stripe.redirectToCheckout({
                    // Make the id field from the Checkout Session creation API response
                    // available to this file, so you can provide it as parameter here
                    // instead of the {{CHECKOUT_SESSION_ID}} placeholder.
                    sessionId: data.id
                })
            })()
        })
    }
}
</script>

<div class="cart montserrat">
    <div on:click={togglCart} class="cart-icon">
        <h2 ><i class="fas fa-shopping-cart sg-green"></i> {$cart.length > 0 ? `(${$cart.length})` : ''} <i class="{showItems ? "arrow-up" : "arrow-down"} fas fa-caret-down"></i></h2>
    </div>
    {#if showItems}
        <div class="{showItems ? "items-show" : "items-hide"} items" in:fly="{{ x: 200, duration: 300 }}" out:fly="{{ x: 200, duration: 300 }}">
            <p class="cart-title">CART</p>
            <div class="cart-title_border"></div>
        {#each $cart as item}
            <div class="cart-item">
                <p>{item.name} - ${item.amount/100}</p>
            </div>
        {/each}
            <button class="button alegreya" on:click={proceedToCheckout}>Proceed to checkout</button>
        </div>
    {/if}
</div>

<style type="text/scss">
@import '../../../assets/scss/mixins/mixins';

.cart {
    position: fixed;
    display: inline-block;
    top: 90px;
    right: 0;
    left: auto;
    z-index: 1003;
    color: var(--sg-green);
    font-size: 15px;
    .cart-icon {
        position: absolute;
        top: 0;
        right: 0;
        cursor: pointer;
        background-color: var(--sg-cream);
        padding: 10px;
        white-space: nowrap;
        z-index: 1007;
        h2 {
            font-size: 15px;
            font-weight: 100;
            text-align: right;
            margin: 0;
            i {font-size: 15px;}
        }
        button, p, i {
            font-size: 15px;
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
            padding: 20px;
            h2 {
                text-align: left; 
                i {font-size: 25px;}
            }; 
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
    font-size: 15px;
    padding: 10px 30px;
    margin: 5px;
    transition: 0.2s;
    &:hover {
        cursor: pointer;
        background-color: rgb(51, 66, 51);
        transition: 0.2s;
    }
    @include break-up('lg') {
        font-size: 25px;
    }
}
.items {
    background-color: var(--sg-cream);
    .cart-title {
        margin: 0;
        padding: 12px;
        font-size: 15px;
        
        &__border {
            height: 1px;
            width: 100%;
            background-color: var(--sg-green);
        }
    }

    .cart-item {
        text-align: center;
        font-size: 15px;
        padding: 2px 20px;
        p {
            margin-top: 0px;
        }
    }
    @include break-up('lg') {
        .cart-title {font-size: 25px; padding: 22px;}
        .cart-item {font-size: 20px;}
    }
}
</style>