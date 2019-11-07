<script>
import sal from 'sal.js';

import axios from 'axios'
import { onMount } from 'svelte';
import API_GET_RECENT from '../../cmsdata/homeRecent.js';


let recentArray = []

onMount(async () => {
    sal({threshold: 0.2});
    API_GET_RECENT()
    .then((response) => {
        recentArray = response
        return recentArray
    })
    .catch((error)=> {
        console.log(error)
    })
})

</script>

<style type="text/scss">
@import '../../assets/scss/mixins/mixins';

.recent {
    width: 100%;
    margin: auto;
    &__header {
        margin: 8% auto;
        width: 100%;
        text-align: center;
        @include break-up('sm') {
            margin: 5% 0;
            display: inline-block;
            text-align: left;
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
        padding: 5% 0;
        @include break-up('sm') {
            justify-content: space-between;
        }
        &__photo {
            padding: 15px 0px;
            img {
                width: 200px;
                height: 200px;
                object-fit: cover;
            }
        }
    }
    @include break-up('sm') {
        width: 80%;
    }
}

</style>


<div class="recent">
    <div class="recent__header"><h2 class="vollkorn sg-green">Most Recent</h2></div>
    <div data-sal="fade" data-sal-duration="1000" class="recent__photos">
    {#if recentArray.length > 0}
        {#each recentArray as item}
            <div class="recent__photos__photo"><img src="{item}" alt="SG recent photos"/></div>
        {/each}
    {/if}
    </div>
</div>