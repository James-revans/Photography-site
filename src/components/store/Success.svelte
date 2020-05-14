<script>
import { onMount } from 'svelte';
import { Link } from 'yrv';
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
        // position: absolute;
        margin: 50vh auto;
        transform: translateY(-50%);
        text-align: center;
        font-size: 30px;
        max-width: 700px;
        padding: 10px;
    }
    :global(a) {
        font-size: 30px;
        padding: 0;
        border-bottom: solid thin var(--sg-green);
        color: var(--sg-green);
        &:hover {
            border-bottom: solid thick var(--sg-tan);
        }
    }
}
</style>
<div class="success alegreya">
    <div class="success__msg">
        <p>Thank you for shopping with SRG Photography!</p>
        <p> You should receive an email shortly with your items and confirmation of your purchase.</p>
        <p>See how to use your presets <Link href="/instructions">here</Link></p>
    </div>
</div>
