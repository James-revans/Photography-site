<script>
import axios from 'axios'
import { onMount } from 'svelte';
import API_GET_PHOTOS from '../../cmsdata/homeRecent.js';


let recentArray = []

onMount(async () => {
    
    API_GET_PHOTOS()
    .then((response) => {
        console.log(response)
        recentArray = response
        return recentArray
    })
    .catch((error)=> {
        console.log(error)
    })
})


</script>

<style type="text/scss">

.recent {
    &__header {
        margin: 5%;
        margin-left: 11%;
        
        display: inline-block;
        text-align: center;
        @media (max-width: 400px) {
            margin: 8% auto;
            width: 100%;
        }
        
        h2 {
            display: inline;
            font-size: 40px;
            margin: 5% 0;
            border-bottom: solid 1px #445B47;
            padding-bottom: 10px;
            font-weight: 100;
            color: #445B47;
        }   
    }
    &__photos {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
        align-items: center;
        max-width: 80vw;
        margin: 0 auto;
        padding: 50px 0;
        &__photo {
            padding: 15px 0px;
            img {
                width: 200px;
                height: 200px;
                object-fit: cover;
            }
        }

    }
}

</style>


<div class="recent">
    <div class="recent__header"><h2 class="vollkorn sg-green">Most Recent</h2></div>
    <div class="recent__photos">
    {#if recentArray.length > 0}
        {#each recentArray as item}
            <div class="recent__photos__photo"><img src="{item}" alt="SG recent photos"/></div>
        {/each}
    {/if}
    </div>
</div>