<script>
import cart from "shared/stores/cart.store.js";
export let name, description, amount, bullets;

let isInCart = false;
$: buttonText = isInCart ? 'Remove from cart' : 'Add to cart'

const toggleAdd = () => {
    let cartItem = {
            name, amount, description, currency: 'usd', quantity: 1
        }
    isInCart = !isInCart;
    if(isInCart) {
        cart.update(cart => ([...cart, cartItem]))
    } else {
        cart.update(cart => cart.filter(item => item.name !== cartItem.name));
    }
} 

</script>

<style type='text/scss'>
@import '../../../assets/scss/mixins/mixins';

.container {    
    max-width: 500px;
    padding: 0;
    @include break-up('xl') {
        padding: 0 50px;     
    }
}
.title, .price {
    font-size: 25px;
    @include break-up('xl') {
        font-size: 55px;     
    }
}
.title {
    margin-top: 0;
}
.description, .bullets, .button {
    font-size: 15px;
    @include break-up('xl') {
        font-size: 25px;     
    }
}
.bullets {
    margin: 40px 0;
    @include break-up('xl') {
        padding: 0 50px;     
    }
}

.button {
    border: none;
    border-radius: 0;
    width: 100%;
    padding: 20px 0;
    transition: 0.2s;
    cursor: pointer;
}
.add {
    background-color: var(--sg-cream);
    color: var(--sg-green);

    &:hover {
        background-color: rgb(216, 216, 167);
        transition: 0.3s;
        box-shadow: 0 0 20px 1px rgba(187, 187, 187, 0.521);
    }
}

.remove {
    background-color: rgb(216, 216, 167);
    transition: 0.3s;
    box-shadow: 0 0 20px 1px rgba(187, 187, 187, 0.521);
}

</style>
<div class="container sg-green">
    <h1 class="title p-marker">{name}</h1>
    <h2 class="price alegreya">${amount}</h2>
    <p class="description alegreya">{description}</p>
    <ul class="bullets alegreya">
        {#each bullets as bullet}
            <li>{bullet}</li>
        {/each}
    </ul>
    <button class="{isInCart ? "remove" : "add"} button alegreya" on:click={toggleAdd}>{buttonText}</button>
</div>
