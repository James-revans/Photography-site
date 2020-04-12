<script>
    import { onMount } from 'svelte';
    import PageBanner from "../base/PageBanner.svelte";
    import { loadStripe } from '@stripe/stripe-js';
    const url = "./images/Store-Banner-min.jpg";
    let showPage = false;
    let stripe;
    onMount(async() => {
        stripe = await loadStripe('pk_test_LnSZ7UkQkfmtKtBr2Hdjtbtm00MLu5KDIl');
    })
    let sessionInfo = {
        success_url: 'http://localhost:57549/#/store',
        cancel_url: 'http://localhost:57549/#/store',
        payment_method_types: ['card'],
            line_items: [
            {
                name: 'T-shirt',
                description: 'Comfortable cotton t-shirt',
                amount: 1500,
                currency: 'usd',
                quantity: 2,
            },
        ],
    }

    const proceedToCheckout = () => {
        async function createSession(cartInfo) {
            const response = await fetch(
                'http://localhost:3000/api/store',
                {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: JSON.stringify(cartInfo)
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
</script>

<PageBanner on:loaded='{() => showPage = true}' img={url}>
    <h1>Store</h1>
</PageBanner>
<h1>
This is the store
</h1>
<button on:click={proceedToCheckout}>Proceed to checkout</button>
