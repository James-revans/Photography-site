<script>
export let title, description, price, bullets, addToCart;

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
    background-color: var(--sg-cream);
    color: var(--sg-green);
    border: none;
    border-radius: 0;
    width: 100%;
    padding: 20px 0;
    transition: 0.2s;

    &:hover {
        background-color: rgb(216, 216, 167);
        transition: 0.3s;
        cursor: pointer;
    }
}

</style>
<div class="container sg-green">
    <h1 class="title p-marker">{title}</h1>
    <h2 class="price alegreya">${price}</h2>
    <p class="description alegreya">{description}</p>
    <ul class="bullets alegreya">
        {#each bullets as bullet}
            <li>{bullet}</li>
        {/each}
    </ul>
    <button class="button alegreya" on:click={() =>{addToCart(title)}}>Add to cart</button>
</div>
