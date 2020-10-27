<script>
    export let photos, name, length, price, outfits, location;  

    let items = [
        {
            info: length,
            icon: 'fa fa-clock-o fa-lg',
        },
        {
            info: photos,
            icon: 'fa fa-picture-o fa-lg',
        },
        {
            info: outfits,
            icon: 'fa fa-female fa-lg',
        }, 
        {
            info: location,
            icon: 'fa fa-map-marker fa-lg',
        },
    ];
</script>
<style type="text/scss">
@import '../../assets/scss/mixins/mixins';
    h1{
        font-family: 'Vollkorn SC', serif;
        color: var(--sg-green);
        font-size: 24px;
    }

    p{
        font-family: 'Alegreya Sans SC', sans-serif;
        font-size: 24px;
        color: var(--sg-green);
    }

    i {
        color: #f0deb4;
        font-size: 24px;
    }

    h1 i {
        color: var(--sg-green);;
    }
    @include break-up('md') {
        p, h1, i {
            font-size: 36px;
        }
    }

    .main-packages{
        display:flex;
        justify-content: space-between;
        flex-wrap: wrap;
    }
   
    .title-line{
        display:flex;
        align-items: baseline;
        justify-content: space-between;
    }

    .divider {
        width: 100%;
        height: 1px;
        background-image: linear-gradient(to right, rgb(68, 91, 71), white);    
    }
    .wrapper {
        padding: 20px 0;
    }

</style>

<div class='wrapper'>
    <div class='title-line'>
        <h1 class='name'>{name}</h1>
        <h1 class = 'price'><i class="fa fa-usd" aria-hidden="true"></i> {price}</h1>  
    </div>
    <div class='main-packages'>
        {#each items as {info, icon}}
            {#if info}
                <p class={info}><i class={icon} aria-hidden="true"></i> {info}</p>
            {/if}
        {/each}
    </div>
    <div class='divider'></div>
</div>


   
