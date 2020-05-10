<script>
import cart from "shared/stores/cart.store.js";
export let name, description, amount, bullets, images;

let isInCart = false;
$: buttonText = isInCart ? 'Remove from cart' : 'Add to cart'

const toggleAdd = () => {
    let cartItem = {
            name, 
            amount, 
            description, 
            currency: 'usd', 
            quantity: 1, 
            images: images.main
        }
    isInCart = !isInCart;
    if(isInCart) {
        if(cartItem.name === "preset package") {
            cart.update(cart => ([cartItem]));
        } else {
            cart.update(cart => ([...cart, cartItem]));
        }
    } else {
        cart.update(cart => cart.filter(item => item.name !== cartItem.name));
    }
} 
</script>

<style type='text/scss'>
@import '../../../assets/scss/mixins/mixins';

.container { 
    max-width: 500px;
    padding: 0 5px;
    width: 100%;
    text-align: center;
    @include break-up('xl') {
        padding: 0 50px;
        padding-top: 60px;     
    }
    @include break-up('md') {
        text-align: left;
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
.description {
    margin-bottom: 0;
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
    <h2 class="price alegreya">${amount/100}</h2>
    <p class="description alegreya">{description}</p>
    <div class="bullets alegreya">
        {#each bullets as bullet}
            <p>~ {bullet}</p>
        {/each}
    </div>
    <button class="{isInCart ? "remove" : "add"} button alegreya" on:click={toggleAdd}>{buttonText}</button>
</div>
