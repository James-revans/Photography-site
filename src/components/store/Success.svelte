<script>
import { onMount } from 'svelte';
import cart from "shared/stores/cart.store.js";
onMount(async() => {
 
})
</script>

<style type="text/scss">
.success {
    position: absolute;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    background-color: var(--sg-white);
    color: var(--sg-green);
    &__msg {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        font-size: 30px;
    }
}
</style>
<div class="success alegreya">
    <div class="success__msg">
        Thank you for shopping with SRG Photography! You should receive an email shortly with your items and confirmation of your purchase.
    </div>
</div>
